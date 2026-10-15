#!/usr/bin/env python3
"""Local Cover Studio. Python 3.10+, standard library only."""
import argparse
import base64
from concurrent.futures import ThreadPoolExecutor
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import io
import json
import mimetypes
import re
from pathlib import Path
import secrets
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
import webbrowser
import zipfile

ROOT = Path(__file__).resolve().parent
STATIC = ROOT / 'static'
OUTPUT = ROOT / 'output'
KEY_FILE = ROOT / '.local-key'
API = 'https://maas-api.antdigital.com/v1'
MODEL = {'generate': 'ming-image-0.1-design', 'split': 'ming-image-0.1-design-layer'}
MAX_BODY = 32 * 1024 * 1024
JOBS = {}
LOCK = threading.Lock()
POOL = ThreadPoolExecutor(max_workers=2)


def multipart(fields, image):
    boundary = 'MingStudio' + uuid.uuid4().hex
    parts = []
    for name, value in fields.items():
        parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode())
    parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="image"; filename="input.png"\r\nContent-Type: image/png\r\n\r\n'.encode() + image + b'\r\n')
    parts.append(f'--{boundary}--\r\n'.encode())
    return b''.join(parts), 'multipart/form-data; boundary=' + boundary


def image_type(blob):
    if blob.startswith(b'\x89PNG\r\n\x1a\n'): return 'png'
    if blob.startswith(b'\xff\xd8\xff'): return 'jpg'
    if blob.startswith(b'RIFF') and blob[8:12] == b'WEBP': return 'webp'
    raise ValueError('图片格式不支持，请上传 PNG、JPEG 或 WebP。')


def decode_image(value):
    try:
        blob = base64.b64decode(value.split(',', 1)[-1], validate=True)
    except (ValueError, TypeError):
        raise ValueError('图片数据无法读取，请重新上传。')
    if len(blob) > 20 * 1024 * 1024: raise ValueError('图片请控制在 20 MB 以内。')
    image_type(blob)
    return blob


def update(job_id, **values):
    with LOCK: JOBS[job_id].update(values)


def move_asset(asset_id, restore=False):
    if not isinstance(asset_id, str) or not re.fullmatch(r'[A-Za-z0-9_-]{1,128}', asset_id):
        raise ValueError('素材 ID 无效。')
    trash = OUTPUT / '.trash'
    if trash.resolve().parent != OUTPUT.resolve(): raise ValueError('回收目录无效。')
    source = (trash if restore else OUTPUT) / asset_id
    target = (OUTPUT if restore else trash) / asset_id
    with LOCK:
        if JOBS.get(asset_id, {}).get('status') in ('queued', 'running'):
            raise ValueError('素材仍在处理中，请稍后再试。')
        if source.is_symlink() or not (source/'manifest.json').is_file():
            raise ValueError('素材不存在或已移除。')
        if target.exists(): raise ValueError('目标目录已存在，无法移动素材。')
        target.parent.mkdir(parents=True, exist_ok=True)
        source.rename(target)


def list_assets():
    """Read completed assets from disk, including jobs from earlier server runs."""
    assets = []
    for path in OUTPUT.glob('*/manifest.json'):
        try:
            data = json.loads(path.read_text(encoding='utf-8'))
            if data.get('kind') not in MODEL: continue
            folder = path.parent
            images = []
            for item in data.get('images', []):
                name = item.get('name', '')
                if not name or Path(name).name != name: continue
                if (folder / name).is_file():
                    images.append({'name': name, 'url': f'/output/{folder.name}/{urllib.parse.quote(name)}'})
            if not images: continue
            source = data.get('source_name', '')
            source_url = f'/output/{folder.name}/{urllib.parse.quote(source)}' if source and Path(source).name == source and (folder/source).is_file() else None
            assets.append({'id': folder.name, 'kind': data['kind'], 'model': MODEL[data['kind']],
                           'created_at': float(data.get('created_at', path.stat().st_mtime)),
                           'elapsed': data.get('elapsed'), 'prompt': str(data.get('prompt', '')),
                           'ratio': data.get('ratio', 'auto'), 'images': images, 'source_url': source_url,
                           'zip_url': f'/output/{folder.name}/images.zip' if (folder/'images.zip').is_file() else None})
        except (OSError, ValueError, TypeError, AttributeError):
            continue
    return sorted(assets, key=lambda item: item['created_at'], reverse=True)


def run_job(job_id, kind, key, prompt, image, ratio='auto'):
    start = time.monotonic()
    try:
        update(job_id, status='running')
        folder = OUTPUT / job_id
        folder.mkdir(parents=True, exist_ok=True)
        source_name = None
        if kind == 'generate':
            body = json.dumps({'model': MODEL[kind], 'prompt': prompt}, ensure_ascii=False).encode()
            mime = 'application/json'
            endpoint = '/images/generations'
        else:
            body, mime = multipart({'model': MODEL[kind], 'prompt': prompt}, image)
            # Match the actual upload format rather than the filename's extension.
            ext = image_type(image)
            source_name = f'source.{ext}'
            (folder/source_name).write_bytes(image)
            image_mime = {'png': 'image/png', 'jpg': 'image/jpeg', 'webp': 'image/webp'}[ext]
            body = body.replace(b'filename="input.png"\r\nContent-Type: image/png', f'filename="input.{ext}"\r\nContent-Type: {image_mime}'.encode(), 1)
            endpoint = '/images/edits'
        req = urllib.request.Request(API + endpoint, data=body, headers={
            'Authorization': 'Bearer ' + key, 'Content-Type': mime,
        }, method='POST')
        with urllib.request.urlopen(req, timeout=600) as response:
            result = json.load(response)
        images = []
        for idx, item in enumerate(result.get('data', []), 1):
            if item.get('b64_json'):
                blob = base64.b64decode(item['b64_json'], validate=True)
            elif item.get('url'):
                url = item['url']
                if urllib.parse.urlparse(url).scheme != 'https': raise ValueError('服务返回了不支持的图片地址。')
                with urllib.request.urlopen(url, timeout=60) as response:
                    blob = response.read(20 * 1024 * 1024 + 1)
                if len(blob) > 20 * 1024 * 1024: raise ValueError('返回图片超过 20 MB。')
            else:
                continue
            ext = image_type(blob)
            filename = f'{"image" if kind == "generate" else "layer"}-{idx:02d}.{ext}'
            (folder / filename).write_bytes(blob)
            images.append({'url': f'/output/{job_id}/{filename}', 'name': filename})
        if not images: raise ValueError('服务未返回图片，请检查模型权限或稍后重试。')
        elapsed = round(time.monotonic() - start, 1)
        manifest = {'model': MODEL[kind], 'kind': kind, 'elapsed': elapsed, 'images': images,
                    'created_at': time.time(), 'source_name': source_name, 'ratio': ratio,
                    'usage': result.get('usage'), 'prompt': prompt,
                    'note': '图层顺序保留模型返回顺序。文字图层为像素图。'}
        (folder / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
        (folder / 'prompt.txt').write_text(prompt, encoding='utf-8')
        with zipfile.ZipFile(folder / 'images.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
            for item in images: archive.write(folder / item['name'], item['name'])
            archive.write(folder / 'manifest.json', 'manifest.json')
            archive.write(folder / 'prompt.txt', 'prompt.txt')
        update(job_id, status='done', elapsed=elapsed, images=images, usage=result.get('usage'),
               zip_url=f'/output/{job_id}/images.zip')
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode(errors='replace').replace(key, '[REDACTED]')
        try: detail = json.loads(detail).get('error', {}).get('message', detail)
        except (ValueError, AttributeError): pass
        hints = {400: '请求参数被拒绝。', 401: 'API key 无效或已过期。', 403: '当前 key 无权调用模型。',
                 429: '额度不足或请求过于频繁。'}
        update(job_id, status='error', error=f'HTTP {exc.code} · {hints.get(exc.code, "模型服务暂时不可用。")} {detail[:600]}')
    except Exception as exc:
        message = str(exc).replace(key, '[REDACTED]')
        update(job_id, status='error', error=f'请求失败：{message[:600]}')
    finally:
        key = None


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        # Do not log request bodies, credentials, or output URLs.
        pass

    def respond(self, status, body, mime='application/json; charset=utf-8'):
        if not isinstance(body, bytes): body = json.dumps(body, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', mime)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'no-referrer')
        self.send_header('Content-Security-Policy', "default-src 'self'; img-src 'self' blob: data:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'")
        self.end_headers()
        self.wfile.write(body)

    def local_request(self):
        expected = f'127.0.0.1:{self.server.server_port}'
        localhost = f'localhost:{self.server.server_port}'
        if self.headers.get('Host') not in (expected, localhost): return False
        origin = self.headers.get('Origin')
        return origin is None or origin in ('http://' + expected, 'http://' + localhost)

    def do_GET(self):
        if not self.local_request(): return self.respond(403, {'error': '仅允许本地访问。'})
        path = urllib.parse.urlparse(self.path).path
        if path == '/api/health': return self.respond(200, {'ok': True})
        if path == '/api/assets': return self.respond(200, {'assets': list_assets()})
        if path == '/api/config':
            key = KEY_FILE.read_text(encoding='utf-8').strip() if KEY_FILE.is_file() else ''
            return self.respond(200, {'runtime': 'local', 'default_key': key})
        if path.startswith('/api/jobs/'):
            job_id = path.removeprefix('/api/jobs/')
            with LOCK: job = dict(JOBS[job_id]) if job_id in JOBS else None
            return self.respond(200 if job else 404, job or {'error': '任务不存在。'})
        base = OUTPUT if path.startswith('/output/') else STATIC
        relative = path.removeprefix('/output/') if base == OUTPUT else path.lstrip('/') or 'index.html'
        target = (base / urllib.parse.unquote(relative)).resolve()
        if not target.is_relative_to(base.resolve()) or not target.is_file():
            return self.respond(404, {'error': '文件不存在。'})
        self.respond(200, target.read_bytes(), mimetypes.guess_type(str(target))[0] or 'application/octet-stream')

    def do_POST(self):
        if not self.local_request(): return self.respond(403, {'error': '请求来源不允许。'})
        if self.path not in ('/api/jobs', '/api/assets/delete', '/api/assets/restore'): return self.respond(404, {'error': '接口不存在。'})
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if length <= 0 or length > MAX_BODY: return self.respond(413, {'error': '上传内容过大，图片请控制在 20 MB 以内。'})
            payload = json.loads(self.rfile.read(length))
            if not isinstance(payload, dict): raise ValueError('请求格式错误。')
            if self.path.startswith('/api/assets/'):
                move_asset(payload.get('id'), restore=self.path.endswith('/restore'))
                return self.respond(200, {'ok': True})
            kind = payload.get('kind')
            if kind not in MODEL: raise ValueError('未知任务类型。')
            key = payload.get('key', '').strip()
            if not key or len(key) > 512 or '\n' in key or '\r' in key: raise ValueError('请填写有效的 API key。')
            prompt = payload.get('prompt', '').strip()
            if not prompt or len(prompt) > 16000: raise ValueError('请填写提示词（最多 16000 字）。')
            image = decode_image(payload.get('image', '')) if kind == 'split' else None
            ratio = payload.get('ratio', 'auto')
            if ratio not in ('auto', '1:1', '9:16', '16:9', '5:2', '4:3', '3:4'): raise ValueError('未知画面比例。')
            with LOCK:
                if sum(j['status'] in ('queued', 'running') for j in JOBS.values()) >= 2:
                    return self.respond(429, {'error': '已有两个任务进行中，请稍后再试。'})
                job_id = secrets.token_urlsafe(18)
                JOBS[job_id] = {'id': job_id, 'kind': kind, 'status': 'queued'}
            POOL.submit(run_job, job_id, kind, key, prompt, image, ratio)
            self.respond(202, {'id': job_id})
        except (ValueError, TypeError, AttributeError, OSError) as exc:
            self.respond(400, {'error': str(exc)})


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Cover Studio 本地体验工作台')
    parser.add_argument('--port', type=int, default=8765)
    parser.add_argument('--open', action='store_true', help='启动后打开浏览器')
    args = parser.parse_args()
    OUTPUT.mkdir(exist_ok=True)
    server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    print(f'Cover Studio 已启动：http://127.0.0.1:{args.port}', flush=True)
    if args.open:
        threading.Timer(0.5, lambda: webbrowser.open(f'http://127.0.0.1:{args.port}')).start()
    try: server.serve_forever()
    except KeyboardInterrupt: server.server_close()
