const API = 'https://maas-api.antdigital.com/v1';
const MODELS = {generate:'ming-image-0.1-design',split:'ming-image-0.1-design-layer'};
const headers = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const json = (body,status=200)=>new Response(JSON.stringify(body),{status,headers});
async function limitedBody(response,limit){
 const reader=response.body.getReader(),parts=[];let length=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>limit)throw new Error('图片或响应过大，请使用较小的尺寸。');parts.push(value);}}
 catch(error){await reader.cancel();throw error;}
 const bytes=new Uint8Array(length);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}return bytes;
}
function toBase64(bytes){let binary='';for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(binary);}
export default {
 async fetch(request,env){
  const path=new URL(request.url).pathname;
  if(!path.startsWith('/api/'))return env.ASSETS.fetch(request);
  if(request.method==='GET'&&path==='/api/config')return json({runtime:'cloudflare'});
  if(request.method==='GET'&&path==='/api/health')return json({ok:true});
  if(request.method!=='POST'||!/^\/api\/images\/(generate|split)$/.test(path))return json({error:'接口不存在。'},404);
  if(request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'请求来源不允许。'},403);
  let key='';
  try{
   if(!request.headers.get('Content-Type')?.includes('application/json'))return json({error:'请求格式错误。'},400);
   const payload=JSON.parse(new TextDecoder().decode(await limitedBody(request,32*1024*1024)));
   const kind=path.split('/').at(-1);
   key=typeof payload.key==='string'?payload.key.trim():'';
   if(!key||key.length>512||/[\r\n]/.test(key))return json({error:'请填写有效的 MaaS API Key。'},400);
   const prompt=typeof payload.prompt==='string'?payload.prompt.trim():'';
   if(!prompt||prompt.length>16000)return json({error:'请填写提示词（最多 16000 字）。'},400);
   let body,mime,endpoint;
   if(kind==='generate'){body=JSON.stringify({model:MODELS[kind],prompt});mime='application/json';endpoint='/images/generations';}
   else{
    const match=typeof payload.image==='string'&&payload.image.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/);
    if(!match||match[2].length>28*1024*1024)return json({error:'请上传 20 MB 以内的 PNG、JPEG 或 WebP。'},400);
    const binary=atob(match[2]);if(binary.length>20*1024*1024)return json({error:'图片超过 20 MB。'},413);
    const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
    body=new FormData();body.set('model',MODELS[kind]);body.set('prompt',prompt);body.set('image',new Blob([bytes],{type:`image/${match[1]}`}),`input.${match[1]==='jpeg'?'jpg':match[1]}`);endpoint='/images/edits';
   }
   const auth={'Authorization':`Bearer ${key}`};if(mime)auth['Content-Type']=mime;
   const response=await fetch(API+endpoint,{method:'POST',headers:auth,body,signal:AbortSignal.timeout(600000)});
   // Provider errors may echo credentials; never forward their body to the client.
   if(!response.ok){const hints={400:'请求参数被拒绝。',401:'API Key 无效或已过期。',403:'当前 Key 无权调用模型。',429:'额度不足或请求过于频繁。'};return json({error:`HTTP ${response.status} · ${hints[response.status]||'模型服务暂时不可用，请稍后重试。'}`},response.status);}
   const result=JSON.parse(new TextDecoder().decode(await limitedBody(response,48*1024*1024)));
   if(!Array.isArray(result.data)||!result.data.length||result.data.length>32)throw new Error('模型未返回有效图片。');
   let total=0;const data=[];
   for(const item of result.data){
    let b64=item.b64_json;
    if(!b64&&item.url){
     // Only URLs supplied by the authenticated model response are followed.
     const url=new URL(item.url);if(url.protocol!=='https:')throw new Error('模型返回了不支持的图片地址。');
     const image=await fetch(url.href,{redirect:'error',signal:AbortSignal.timeout(60000)});
     if(!image.ok)throw new Error('模型图片下载失败。');b64=toBase64(await limitedBody(image,20*1024*1024));
    }
    if(typeof b64!=='string'||!/^[A-Za-z0-9+/=]+$/.test(b64))throw new Error('模型返回了无效图片。');
    total+=b64.length;if(total>48*1024*1024)throw new Error('返回图片过大，请使用较小的尺寸。');data.push({b64_json:b64});
   }
   return json({data});
  }catch(error){return json({error:error.name==='TimeoutError'?'模型处理超时，请稍后重试。':'请求未完成，请检查网络、图片大小和模型服务后重试。'},502);}
  finally{key='';}
 }
};
