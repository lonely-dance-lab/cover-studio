import base64
from email.parser import BytesParser
from email.policy import default
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch, Mock
import urllib.error
import zipfile
import server

# A valid 1 × 1 transparent PNG.
PNG = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aP1sAAAAASUVORK5CYII=')
KEY = 'test-secret-never-save'

class WorkflowTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.output = Path(self.temp.name)
        self.patch = patch.object(server, 'OUTPUT', self.output)
        self.patch.start()
        server.JOBS['test'] = {'status': 'queued'}

    def tearDown(self):
        self.patch.stop()
        self.temp.cleanup()
        server.JOBS.pop('test', None)

    def reply(self, count=1):
        return io.BytesIO(json.dumps({'data': [{'b64_json': base64.b64encode(PNG).decode()} for _ in range(count)], 'usage': {'total_tokens': 5}}).encode())

    def test_generation_exports_real_images_and_no_key(self):
        with patch('server.urllib.request.urlopen', return_value=self.reply()) as api:
            server.run_job('test', 'generate', KEY, '测试海报', None)
        req = api.call_args.args[0]
        self.assertTrue(req.full_url.endswith('/images/generations'))
        self.assertEqual(json.loads(req.data)['model'], server.MODEL['generate'])
        self.assertEqual(server.JOBS['test']['status'], 'done')
        self.assertEqual((self.output/'test/image-01.png').read_bytes(), PNG)
        with zipfile.ZipFile(self.output/'test/images.zip') as archive:
            self.assertEqual(archive.read('image-01.png'), PNG)
            self.assertNotIn(KEY, archive.read('manifest.json').decode())
        self.assertNotIn(KEY, json.dumps(server.JOBS['test']))

    def test_local_configuration_loads_test_key(self):
        handler = object.__new__(server.Handler)
        handler.path = '/api/config'
        handler.local_request = lambda: True
        handler.respond = Mock()
        with patch.object(Path, 'is_file', return_value=True), patch.object(Path, 'read_text', return_value=KEY):
            handler.do_GET()
        handler.respond.assert_called_once_with(200, {'runtime': 'local', 'default_key': KEY})

    def test_split_multipart_has_original_image_and_exports_all_layers(self):
        with patch('server.urllib.request.urlopen', return_value=self.reply(2)) as api:
            server.run_job('test', 'split', KEY, '拆成两层', PNG)
        req = api.call_args.args[0]
        message = BytesParser(policy=default).parsebytes(('Content-Type: '+req.get_header('Content-type')+'\r\n\r\n').encode()+req.data)
        fields = {p.get_param('name', header='content-disposition'):p.get_payload(decode=True) for p in message.iter_parts()}
        self.assertTrue(req.full_url.endswith('/images/edits'))
        self.assertEqual(fields['image'], PNG)
        self.assertEqual(fields['prompt'].decode(), '拆成两层')
        self.assertEqual(len(server.JOBS['test']['images']), 2)

    def test_api_error_redacts_credential(self):
        error = urllib.error.HTTPError(server.API, 401, 'Unauthorized', {}, io.BytesIO(json.dumps({'error': {'message': KEY}}).encode()))
        with patch('server.urllib.request.urlopen', side_effect=error):
            server.run_job('test','generate',KEY,'测试',None)
        self.assertEqual(server.JOBS['test']['status'],'error')
        self.assertNotIn(KEY,server.JOBS['test']['error'])

    def test_upload_rejects_invalid_and_oversized_images(self):
        with self.assertRaises(ValueError): server.decode_image('data:image/png;base64,not-a-picture')
        with self.assertRaises(ValueError): server.decode_image(base64.b64encode(PNG+b'x'*(20*1024*1024)).decode())

    def test_history_reads_completed_jobs_and_keeps_split_source(self):
        with patch('server.urllib.request.urlopen', return_value=self.reply(2)):
            server.run_job('test', 'split', KEY, '历史拆层', PNG)
        assets = server.list_assets()
        self.assertEqual(len(assets), 1)
        self.assertEqual(assets[0]['kind'], 'split')
        self.assertEqual(len(assets[0]['images']), 2)
        self.assertEqual(assets[0]['source_url'], '/output/test/source.png')
        self.assertEqual((self.output/'test/source.png').read_bytes(), PNG)
        self.assertNotIn(KEY, json.dumps(assets))
        server.JOBS.pop('test')
        self.assertEqual(len(server.list_assets()), 1)

    def test_history_supports_old_records_and_skips_invalid_files(self):
        old = self.output/'old'
        old.mkdir()
        (old/'image-01.png').write_bytes(PNG)
        (old/'manifest.json').write_text(json.dumps({'kind':'generate','prompt':'旧图片','images':[{'name':'image-01.png'},{'name':'../outside.png'}]}))
        bad = self.output/'bad'
        bad.mkdir()
        (bad/'manifest.json').write_text('{incomplete')
        assets = server.list_assets()
        self.assertEqual(len(assets),1)
        self.assertEqual(assets[0]['images'],[{'name':'image-01.png','url':'/output/old/image-01.png'}])
        self.assertIsNone(assets[0]['source_url'])

    def test_asset_delete_and_restore_preserve_files(self):
        with patch('server.urllib.request.urlopen', return_value=self.reply()):
            server.run_job('test','generate',KEY,'删除测试',None)
        server.move_asset('test')
        self.assertEqual(server.list_assets(), [])
        self.assertEqual((self.output/'.trash/test/image-01.png').read_bytes(),PNG)
        server.move_asset('test',restore=True)
        self.assertEqual(len(server.list_assets()),1)
        self.assertEqual((self.output/'test/image-01.png').read_bytes(),PNG)
        for invalid in ('../test','test/other','',None):
            with self.assertRaises(ValueError): server.move_asset(invalid)
        server.JOBS['test']['status']='running'
        with self.assertRaises(ValueError): server.move_asset('test')

if __name__ == '__main__': unittest.main()
