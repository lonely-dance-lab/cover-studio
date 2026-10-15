'use strict';
// Cloudflare results live in each visitor's browser; credentials are never stored.
window.CoverCloud=(()=>{
 const ready=fetch('/api/config').then(async r=>{
  if(!r.ok)throw new Error('服务配置读取失败。');
  const config=await r.json(),cloud=config.runtime==='cloudflare';
  if(cloud){
   document.querySelectorAll('[data-cloud-storage-note]').forEach(note=>{note.hidden=false;});
   const libraryHint=document.querySelector('.library-head p');
   if(libraryHint)libraryHint.textContent='生成图片与拆层结果，自动保存在当前浏览器。';
  }
  if(config.runtime==='local'&&config.default_key){
   const input=document.getElementById('api-key');
   if(input&&!input.value.trim())input.value=config.default_key;
   const note=document.querySelector('#key-panel p');
   if(note)note.textContent='已载入本机默认 Key，仅用于本地测试。这里的修改不会覆盖本机配置。';
  }
  return cloud;
 });
 // Handle startup failures even if the user has not opened the library yet.
 ready.catch(()=>{});
 let database;
 function db(){return database||(database=new Promise((resolve,reject)=>{const request=indexedDB.open('cover-studio-assets',1);request.onupgradeneeded=()=>request.result.createObjectStore('assets',{keyPath:'id'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(new Error('浏览器存储不可用，请下载保存当前作品。'));}));}
 async function transaction(mode,action){const database=await db();return new Promise((resolve,reject)=>{const tx=database.transaction('assets',mode),store=tx.objectStore('assets');let result;const request=action(store);request.onsuccess=()=>{result=request.result;};tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(new Error('素材保存失败，请检查浏览器存储空间。'));tx.onabort=tx.onerror;});}
 const write=record=>transaction('readwrite',store=>store.put(record));
 async function list(){return (await transaction('readonly',store=>store.getAll())).filter(r=>!r.deleted).sort((a,b)=>b.created_at-a.created_at).map(r=>({...r,zip_url:r.kind==='split'?zipURL(r):null}));}
 async function change(id,action){const record=await transaction('readonly',store=>store.get(id));if(!record)throw new Error('素材不存在。');record.deleted=action==='delete';await write(record);}
 const zipCache=new Map();
 const crcTable=Uint32Array.from({length:256},(_,n)=>{let c=n;for(let i=0;i<8;i++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
 function crc32(bytes){let crc=0xffffffff;for(const byte of bytes)crc=crcTable[(crc^byte)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;}
 function zipURL(record){
  if(zipCache.has(record.id))return zipCache.get(record.id);
  const locals=[],central=[];let offset=0,centralSize=0;
  const files=record.images.map(image=>({name:image.name,bytes:Uint8Array.from(atob(image.url.split(',')[1]),c=>c.charCodeAt(0))}));
  files.push({name:'prompt.txt',bytes:new TextEncoder().encode(record.prompt)});
  for(const file of files){
   const name=new TextEncoder().encode(file.name),crc=crc32(file.bytes),header=new Uint8Array(30+name.length),h=new DataView(header.buffer);
   h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint32(14,crc,true);h.setUint32(18,file.bytes.length,true);h.setUint32(22,file.bytes.length,true);h.setUint16(26,name.length,true);header.set(name,30);
   const entry=new Uint8Array(46+name.length),v=new DataView(entry.buffer);v.setUint32(0,0x02014b50,true);v.setUint16(4,20,true);v.setUint16(6,20,true);v.setUint32(16,crc,true);v.setUint32(20,file.bytes.length,true);v.setUint32(24,file.bytes.length,true);v.setUint16(28,name.length,true);v.setUint32(42,offset,true);entry.set(name,46);
   locals.push(header,file.bytes);central.push(entry);offset+=header.length+file.bytes.length;centralSize+=entry.length;
  }
  const end=new Uint8Array(22),e=new DataView(end.buffer);e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,centralSize,true);e.setUint32(16,offset,true);
  const url=URL.createObjectURL(new Blob([...locals,...central,end],{type:'application/zip'}));zipCache.set(record.id,url);return url;
 }
 async function submit(payload){
  const started=Date.now();let response;
  try{response=await fetch(`/api/images/${payload.kind}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});}finally{payload.key='';}
  const result=await response.json();if(!response.ok)throw new Error(result.error||'模型请求失败。');
  if(!Array.isArray(result.data)||!result.data.length)throw new Error('模型未返回图片。');
  const images=result.data.map((item,i)=>{
   const magic=atob(item.b64_json.slice(0,16));let ext,mime;
   if(magic.startsWith('\x89PNG')){ext='png';mime='image/png';}else if(magic.startsWith('\xff\xd8\xff')){ext='jpg';mime='image/jpeg';}else if(magic.startsWith('RIFF')&&magic.slice(8,12)==='WEBP'){ext='webp';mime='image/webp';}else throw new Error('模型返回了不支持的图片格式。');
   return {name:`${payload.kind==='generate'?'image':'layer'}-${String(i+1).padStart(2,'0')}.${ext}`,url:`data:${mime};base64,${item.b64_json}`};
  });
  const record={id:crypto.randomUUID(),kind:payload.kind,prompt:payload.prompt,ratio:payload.ratio,created_at:Date.now()/1000,elapsed:Math.round((Date.now()-started)/100)/10,images,source_url:payload.kind==='split'?payload.image:null};
  let storage_warning;try{await write(record);}catch(error){storage_warning='图片已完成，但素材库保存失败，请及时下载当前作品。';}
  return {...record,zip_url:payload.kind==='split'?zipURL(record):null,storage_warning};
 }
 return {ready,submit,list,change};
})();
