import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import {readFile,writeFile} from 'node:fs/promises';
import worker from './cloudflare/worker.mjs';
const PNG='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aP1sAAAAASUVORK5CYII=';
const secret='test-key-never-store';
const origin='https://cover.example';
const request=(kind,payload={})=>new Request(`${origin}/api/images/${kind}`,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({key:secret,prompt:'测试封面',...payload})});
test('runtime configuration contains no credential',async()=>{
 const response=await worker.fetch(new Request(`${origin}/api/config`),{});
 assert.deepEqual(await response.json(),{runtime:'cloudflare'});
});
test('generate and split use caller key and correct MaaS formats',async()=>{
 const original=globalThis.fetch;
 try{
  for(const kind of ['generate','split']){
   globalThis.fetch=async(url,options)=>{
    assert.equal(options.headers.Authorization,`Bearer ${secret}`);
    if(kind==='generate'){assert.ok(url.endsWith('/images/generations'));assert.equal(JSON.parse(options.body).model,'ming-image-0.1-design');}
    else{assert.ok(url.endsWith('/images/edits'));assert.equal(options.body.get('model'),'ming-image-0.1-design-layer');assert.deepEqual(new Uint8Array(await options.body.get('image').arrayBuffer()),new Uint8Array(Buffer.from(PNG,'base64')));}
    return Response.json({data:[{b64_json:PNG}],usage:{credential:secret}});
   };
   const response=await worker.fetch(request(kind,{image:`data:image/png;base64,${PNG}`}),{});
   assert.equal(response.status,200);const text=await response.text();assert.ok(!text.includes(secret));assert.equal(JSON.parse(text).data.length,1);
  }
 }finally{globalThis.fetch=original;}
});
test('reject foreign origins, empty keys, and redact provider errors',async()=>{
 const foreign=request('generate');foreign.headers.set('Origin','https://evil.example');
 assert.equal((await worker.fetch(foreign,{})).status,403);
 assert.equal((await worker.fetch(request('generate',{key:''}),{})).status,400);
 const original=globalThis.fetch;
 try{globalThis.fetch=async()=>Response.json({error:{message:secret}},{status:401});const response=await worker.fetch(request('generate'),{});assert.equal(response.status,401);assert.ok(!(await response.text()).includes(secret));}finally{globalThis.fetch=original;}
});
test('cloud browser history has no key, supports deletion and valid ZIP output',async()=>{
 const records=new Map();
 const indexedDB={open(){const r={result:{transaction(){const tx={};tx.objectStore=()=>({
  put(value){const q={};queueMicrotask(()=>{records.set(value.id,structuredClone(value));q.result=value.id;q.onsuccess();tx.oncomplete();});return q;},
  getAll(){const q={};queueMicrotask(()=>{q.result=[...records.values()].map(value=>structuredClone(value));q.onsuccess();tx.oncomplete();});return q;},
  get(id){const q={};queueMicrotask(()=>{q.result=structuredClone(records.get(id));q.onsuccess();tx.oncomplete();});return q;}
 });return tx;}}};queueMicrotask(()=>r.onsuccess());return r;}};
 const sandbox={window:{},document:{querySelectorAll:()=>[],querySelector:()=>null},indexedDB,crypto:globalThis.crypto,Blob,URL,TextEncoder,Uint32Array,Uint8Array,DataView,atob,fetch:async(url,options)=>url==='/api/config'?Response.json({runtime:'cloudflare'}):Response.json({data:[{b64_json:PNG},{b64_json:PNG}]})};
 vm.createContext(sandbox);vm.runInContext(await readFile('static/cloud.js','utf8'),sandbox);
 const cloud=sandbox.window.CoverCloud;assert.equal(await cloud.ready,true);
 const payload={kind:'split',key:secret,prompt:'两层',image:`data:image/png;base64,${PNG}`,ratio:'auto'};
 const job=await cloud.submit(payload);assert.equal(payload.key,'');assert.equal(job.images.length,2);assert.ok(!JSON.stringify([...records.values()]).includes(secret));
 assert.equal((await cloud.list()).length,1);await cloud.change(job.id,'delete');assert.equal((await cloud.list()).length,0);await cloud.change(job.id,'restore');assert.equal((await cloud.list()).length,1);
 const zip=await (await fetch(job.zip_url)).arrayBuffer();await writeFile('/tmp/cover-studio-test.zip',new Uint8Array(zip));
});
