'use strict';
const $ = id => document.getElementById(id);
let mode = 'generate', currentImage = null, layers = [], reverseStack = false, busy = false;
let samplePrompt = '', timer = null, taskId = null, sample = false;
let selectedIndex = -1, hoverIndex = -1, drag = null, frame = 0, statusTimer = null;
let past = [], future = [];
let manualOrder = [];
function displayLayers(){
 return manualOrder.length===layers.length?manualOrder.map(index=>layers[index]):(reverseStack?[...layers].reverse():layers);
}
function initialLayerOrder(items){
 return items.map((layer,i)=>i).sort((a,b)=>Number(items[a].coverage>0.85)-Number(items[b].coverage>0.85));
}
let outputRatio = 'auto';
let assets = [], libraryRequest = 0;
let deletedAssets = [];
let punkStyles = [], appliedStyleSignature = '', purpose = 'cover';
const PURPOSE_RATIO={cover:'5:2',xhs:'3:4',ecommerce:'3:4',free:'auto'};
const PROMPT_IDS={cover:'cover-prompt',xhs:'xhs-prompt',ecommerce:'generate-prompt',free:'free-prompt'};
function promptEditor(){return $(PROMPT_IDS[purpose]);}
const categoryDrafts = {};
$('generation-settings').addEventListener('toggle',()=>{$('generation-settings').querySelector('summary span:last-child').textContent=$('generation-settings').open?'收起 ↗':'展开 ↗';});
const XHS_FIELDS=['xhs-audience','xhs-type','xhs-support','xhs-tag','xhs-account','xhs-scene'];
const STYLE_FIELDS=['style-select','cover-title','cover-context','generate-ratio',...XHS_FIELDS];
const styleSignature=()=>JSON.stringify(STYLE_FIELDS.map(id=>$(id).value));
function currentStyle(){
 const [source,id]=$('style-select').value.split(':');
 if(source==='punk'){const style=punkStyles.find(item=>item.id===id);return style?{source,id,style}:null;}
 if(source==='ponyo')return {source,id};
 return null;
}
function setPurpose(next){
 purpose=Object.hasOwn(PURPOSE_RATIO,next)?next:'cover';
 for(const chip of document.querySelectorAll('[data-purpose]'))chip.setAttribute('aria-checked',String(chip.dataset.purpose===purpose));
 $('style-settings').hidden=purpose==='ecommerce'||purpose==='free';$('generation-settings').hidden=purpose==='ecommerce'||purpose==='free';
 for(const [category,id] of Object.entries(PROMPT_IDS))$(id).hidden=category!==purpose;
 $('prompt-label').htmlFor=PROMPT_IDS[purpose];
 $('category-setting-label').textContent=purpose==='xhs'?'小红书模板与标题设置':'封面风格与标题设置';
 for(const group of $('style-select').querySelectorAll('optgroup')){const enabled=purpose==='xhs'?group.id==='ponyo-group':group.id!=='ponyo-group';group.hidden=!enabled;group.disabled=!enabled;}
}
function updateStyleUI(){
 const chosen=currentStyle(),ponyo=chosen?.source==='ponyo';
 $('cover-fields').hidden=!chosen;$('xhs-extra').hidden=!ponyo;if(!ponyo)$('xhs-plan').hidden=true;
 $('style-source').textContent=chosen?(ponyo?'波妞 PONYO':'Punk Skill'):'';
 const template=ponyo&&PonyoCover.templates.find(item=>item.id===chosen.id);
 const description=chosen?(ponyo?(template?`${template.reason} 锚点：${template.anchor}。`:'按「内容类型」自动选择最合适的小红书模板。'):chosen.style.description||''):'';
 $('style-description').textContent=description;$('style-description').hidden=!description;
 $('title-hint').textContent=ponyo?'建议 8–14 字':'';
 $('context-hint').textContent=ponyo?'内容主题，必填':'可选';
 $('cover-context').placeholder=ponyo?'这篇笔记讲什么？例如：AI 视频提示词教程':'主题、读者或希望表现的画面';
 // The prompt remains the primary editing surface for every category.
 $('prompt-label').textContent=chosen?'完整提示词（可修改）':'画面描述';
 $('free-presets').hidden=purpose!=='ecommerce';$('creative-presets').hidden=purpose!=='free';$('apply-style').hidden=!chosen;
 if(purpose==='free')$('prompt-label').textContent='自由创作提示词';
 for(const option of $('generate-ratio').options)option.disabled=ponyo&&!['3:4','1:1'].includes(option.value);
 if(ponyo&&!['3:4','1:1'].includes($('generate-ratio').value))$('generate-ratio').value='3:4';
}
function showXhsPlan(plan){
 const list=$('xhs-plan-list');list.replaceChildren();
 for(const [name,value] of [['模板',plan.template],['理由',plan.reason],['锚点',plan.anchor],['配色',plan.colors.join(' / ')],['字重',plan.weight]]){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=name;dd.textContent=value;list.append(dt,dd);}
 $('xhs-plan').hidden=false;
}
function applyStyle(){
 const chosen=currentStyle();if(!chosen)return false;
 try{
  let prompt;
  if(chosen.source==='punk')prompt=PunkCover.compile(chosen.style,$('cover-title').value,$('cover-context').value,$('generate-ratio').value);
  else{
   const title=$('cover-title').value.trim();
   const result=PonyoCover.compile({topic:$('cover-context').value.trim()||title,audience:$('xhs-audience').value.trim()||'对这个主题感兴趣的读者',type:$('xhs-type').value,title,support:$('xhs-support').value,template:chosen.id,tag:$('xhs-tag').value,ratio:$('generate-ratio').value,scene:$('xhs-scene').value,account:$('xhs-account').value});
   prompt=result.prompt;showXhsPlan(result.plan);
  }
  if(prompt.length>16000)throw new Error('描述太长，请缩短补充内容。');
  promptEditor().value=prompt;appliedStyleSignature=styleSignature();countPrompt();return true;
 }catch(e){notify(e.message,true);return false;}
}
function clearStyle(){$('style-select').value='';appliedStyleSignature='';updateStyleUI();}
$('style-select').onchange=()=>{
 updateStyleUI();
};
for(const chip of document.querySelectorAll('[data-purpose]'))chip.onclick=()=>{
 const next=chip.dataset.purpose;if(next===purpose)return;
 categoryDrafts[purpose]={fields:STYLE_FIELDS.map(id=>$(id).value),prompt:promptEditor().value,signature:appliedStyleSignature};
 setPurpose(next);
 const saved=categoryDrafts[next];
 if(saved){STYLE_FIELDS.forEach((id,i)=>$(id).value=saved.fields[i]);promptEditor().value=saved.prompt;appliedStyleSignature=saved.signature;}
 else{
  $('style-select').value=next==='xhs'?'ponyo:auto':'';$('cover-title').value=next==='xhs'?'5个AI视频提示词公式':'';$('cover-context').value=next==='xhs'?'AI 视频提示词教程':'';
  $('generate-ratio').value=PURPOSE_RATIO[next];appliedStyleSignature='';
  if(next==='ecommerce'&&!promptEditor().value)promptEditor().value=samplePrompt;
  if(next==='xhs')applyStyle();
 }
 $('generation-settings').open=false;updateStyleUI();countPrompt();
};
const creativeExamples={
 landscape:'生成一张唯美的摄影作品：清晨的湖畔，一座木屋与远山倒映在平静水面，薄雾缓缓升起，柔和的金色晨光穿过松林。画面真实、安静、细腻，有自然的空间层次与电影摄影质感。不添加文字、标志或水印。',
 illustration:'绘制一幅温暖的童话插画：一只橘猫在雨后的森林里经营一间小小的咖啡店，蘑菇屋、木质窗台、热咖啡和微微发光的灯串。手绘水彩与彩铅质感，苔藓绿、奶油黄和暖橘色，主体清晰，细节丰富但不拥挤。不添加文字、标志或水印。'
};
for(const button of document.querySelectorAll('[data-creative]'))button.onclick=()=>{promptEditor().value=creativeExamples[button.dataset.creative];countPrompt();promptEditor().focus();};
$('generate-ratio').onchange=()=>{};
$('apply-style').onclick=applyStyle;
{
 // Ponyo templates are bundled with the page, so they can be listed before the Punk catalogue arrives.
 const group=document.createElement('optgroup');group.id='ponyo-group';group.label='小红书模板 · 波妞';
 const auto=document.createElement('option');auto.value='ponyo:auto';auto.textContent='按内容类型推荐';group.append(auto);
 for(const template of PonyoCover.templates){const option=document.createElement('option');option.value=`ponyo:${template.id}`;option.textContent=template.name;group.append(option);}
 $('style-select').append(group);
}
const splitPrompt = `请理解这张图片的实际内容、视觉层级和遮挡关系，将其拆分成可独立移动、缩放、隐藏和复用的 RGBA PNG 图层。

【细分原则】
在支持的 2–9 个图层范围内尽量细分。复杂画面优先使用 9 层，简单画面按实际元素数量拆分，不要为凑层数输出空图层或重复内容。
按具体元素拆分，不预设图片包含商品、价格、品牌或按钮。独立主体、文字块、图标、卡片、装饰与前景元素尽量各自成层，不随意合并需要独立编辑的对象。层数不足时才合并同类、同层级且空间相关的小元素。

【输出顺序】
输出顺序：从底层到顶层。
先拆完整背景，移除前景并合理补全被遮挡区域；再拆主体之后的场景、装饰或底板；接着按实际遮挡关系拆各个主体、独立图形或模块；文字、图标、标签、线条等分别放在对应层级；最后拆覆盖其他元素的前景。
以上是层级判断方法，不是固定类别或固定层数。不存在的类别不添加，每一层只保留其对应元素，排除其他层的内容。

【保持原图】
所有图层保持相同画布、原始坐标、大小、颜色与字形。保留真实透明通道、干净边缘及合理的半透明效果，不将棋盘格画进图片。阴影和光效归入所属元素，避免重复叠加。
文字保持原样，不改写、不纠错、不新增。不要生成原图没有的元素，不重复保留前景到背景中。只补全确实被遮挡的部分，不改变设计风格。
各层按底层到顶层依次合成后，应尽可能还原原图。`;
function orderedLayerItems(items,prompt){
 // A request does not prove the model's actual output order. Inspect coverage after decoding.
 return items;
}
$('split-prompt').value = splitPrompt;
$('reset-split-prompt').onclick=()=>{
 if(busy)return;
 $('split-prompt').value=splitPrompt;
 notify('已恢复通用图层规划：按遮挡关系，从底层到顶层尽量细分。');
};
const presets = {
 coffee: `【任务】为虚构咖啡品牌「慢岛」制作一张新品首发电商海报，包含真实产品摄影与清晰中文排版。
【产品】奶油白纸杯，杯身印有「慢岛 COFFEE」。旁边摆放烘焙咖啡豆和一小块燕麦饼干。
【风格】暖米色与咖啡棕配色，晨光、自然阴影、丰富材质，简洁高级，充足留白。
【排版】品牌置顶；主标题占据上半部；产品居中；价格与购买按钮置底。中文标题使用优雅宋体，其余使用清晰无衬线字体。
【准确文案】品牌：慢岛 COFFEE。主标题：慢一点，也很好。副标题：一杯燕麦拿铁，留住早晨的温度。卖点：醇香咖啡 / 柔和燕麦 / 即享好时光。价格：新品尝鲜 ¥19。按钮：开启好心情。底部：虚构品牌 · 创意展示。
【要求】文案逐字准确，说明标签不印到海报上。不添加二维码、水印或未经说明的文案。只输出完整海报。`,
 free: ''
};
const ICON = {
 eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
 eyeOff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 5.1A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.1M6.5 6.6C3.6 8.4 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 4.3-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>',
 lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
 unlock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/></svg>',
 download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>'
};
const pad2 = n => String(n).padStart(2, '0');
const OUTPUT_SIZES={'1:1':[1600,1600],'9:16':[1080,1920],'16:9':[1920,1080],'5:2':[1500,600],'4:3':[1600,1200],'3:4':[1200,1600]};
function canvasLayout(){
 const first=layers[0].bitmap;
 const sourceWidth=first.naturalWidth,sourceHeight=first.naturalHeight;
 const [width,height]=OUTPUT_SIZES[outputRatio]||[sourceWidth,sourceHeight];
 const scale=Math.min(width/sourceWidth,height/sourceHeight);
 return {width,height,scale,offsetX:(width-sourceWidth*scale)/2,offsetY:(height-sourceHeight*scale)/2};
}
$('output-ratio').onchange=()=>{
 if(!layers.length)return;
 remember();outputRatio=$('output-ratio').value;hoverIndex=-1;
 paintComposition($('composition'),true);refreshSelection();fitStage();
};

function setMode(next) {
 mode = next;
 for (const kind of ['generate','split']) {
  $(`tab-${kind}`).setAttribute('aria-selected', String(kind === next));
  $(kind === 'generate' ? 'generation-controls' : 'split-controls').hidden = kind !== next;
 }
 $('model-name').textContent = next === 'split' ? 'Ming-Image-0.1-Design-Layer' : 'Ming-Image-0.1-Design';
}
function setFlow(step) {for (const n of [1,2,3]) $(`flow-${n}`).classList.toggle('on', n === step);}
function notify(message, error = false) {
 clearTimeout(statusTimer);
 $('status').textContent = message;
 $('status').className = error ? 'error' : '';
 $('status').hidden = !message;
 if (message && !error) statusTimer = setTimeout(() => {$('status').hidden = true;}, 5000);
}
$('status').onclick = () => notify('');
function showControls(show) {
 $('app').classList.toggle('no-controls', !show);
 $('toggle-controls').textContent = show ? '收起左栏' : '展开左栏';
 $('toggle-controls').setAttribute('aria-expanded', String(show));
}
$('toggle-controls').onclick = () => showControls($('app').classList.contains('no-controls'));
function showKeyPanel(show) {
 $('key-panel').hidden = !show;
 $('settings').setAttribute('aria-expanded', String(show));
 if (show) $('api-key').focus();
}
function needKey() {
 if ($('api-key').value.trim()) return true;
 showKeyPanel(true);
 notify('先填写你的 MaaS API key，即可开始创作。');
 return false;
}
function keyState() {$('key-dot').classList.toggle('connected', !!$('api-key').value.trim());}
$('settings').onclick = () => showKeyPanel($('key-panel').hidden);
$('save-key').onclick = () => {keyState();showKeyPanel(false);};
$('clear-key').onclick=()=>{$('api-key').value='';$('api-key').type='password';$('show-key').textContent='显示';$('show-key').setAttribute('aria-label','显示 API key');keyState();$('api-key').focus();};
$('api-key').oninput = keyState;
$('api-key').onkeydown = event => {if (event.key === 'Enter') {keyState();showKeyPanel(false);}};
$('show-key').onclick = () => {
 const showing = $('api-key').type === 'password';
 $('api-key').type = showing ? 'text' : 'password';
 $('show-key').textContent = showing ? '隐藏' : '显示';
 $('show-key').setAttribute('aria-label', showing ? '隐藏 API key' : '显示 API key');
};
for (const kind of ['generate','split']) $(`tab-${kind}`).onclick = () => setMode(kind);
for (const button of document.querySelectorAll('.tabbar button')) button.onkeydown = event => {
 if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
  event.preventDefault();event.stopPropagation();setMode(mode==='generate'?'split':'generate');$(`tab-${mode}`).focus();
 }
};
function countPrompt() {$('prompt-count').textContent = `${promptEditor().value.length.toLocaleString()} 字`;}
for(const id of Object.values(PROMPT_IDS))$(id).oninput=countPrompt;
for (const button of document.querySelectorAll('[data-preset]')) button.onclick = () => {
 clearStyle();setPurpose('ecommerce');$('generate-ratio').value='3:4';
 document.querySelectorAll('[data-preset]').forEach(b => b.classList.toggle('selected', b === button));
 promptEditor().value = button.dataset.preset === 'poster' ? samplePrompt : presets[button.dataset.preset];
 countPrompt();promptEditor().focus();
};

/* Fit whatever is on the stage to the space the side panels leave over. */
function fitStage() {
 const stage = $('canvas-stage'), canvas = $('composition'), image = $('preview-image');
 const target = !canvas.hidden ? canvas : !image.hidden ? image : null;
 if (!target) return;
 const width = target === canvas ? canvas.width : image.naturalWidth;
 const height = target === canvas ? canvas.height : image.naturalHeight;
 if (!width || !height) return;
 const margin = stage.clientWidth < 600 ? 14 : 32;
 const scale = Math.min((stage.clientWidth - margin * 2) / width, (stage.clientHeight - margin * 2) / height, 2);
 target.style.width = `${Math.max(1, Math.floor(width * scale))}px`;
 target.style.height = `${Math.max(1, Math.floor(height * scale))}px`;
 if (target === canvas) renderComposition();
}
new ResizeObserver(fitStage).observe($('canvas-stage'));

async function readImage(url) {
 const img = new Image();img.src = url;await img.decode();return img;
}
async function loadSource(url, label) {
 const img = await readImage(url);
 currentImage = url;
 outputRatio='auto';$('output-ratio').value='auto';
 layers = [];past = [];future = [];
 manualOrder=[];
 selectedIndex = -1;hoverIndex = -1;drag = null;
 $('editor-controls').hidden = true;
 $('layers-section').hidden = true;
 $('composition').hidden = true;
 $('preview-image').src = url;
 $('preview-image').hidden = false;
 $('empty-state').hidden = true;
 $('image-meta').textContent = `${label} · ${img.naturalWidth} × ${img.naturalHeight}`;
 $('canvas-step').textContent = 'ORIGINAL';
 $('selected-layer').textContent = '画面已就绪';
 $('layer-position').textContent = '下一步拆成独立图层';
 $('canvas-caption').textContent = '';
 $('download-original').href = url;
 $('download-original').hidden = false;
 $('next-step').hidden = false;
 setFlow(2);
 await $('preview-image').decode().catch(() => {});
 fitStage();
 return img;
}
$('next-step').onclick = () => {showControls(true);setMode('split');$('split-prompt').focus();};
async function loadExample() {
 if (busy) return;
 try {
  await loadSource('/example.png','示例海报');
  await loadLayers(Array.from({length:7},(_,i)=>({url:`/layer-${pad2(i+1)}.png`,name:`layer-${pad2(i+1)}.png`})), '/example-layers.zip', true);
  setMode('split');notify('已载入上次真实调用的 7 个图层。点击画面里的元素，直接拖动。');
 } catch(e) {notify('示例载入失败：'+e.message,true);}
}
$('use-example').onclick = loadExample;$('example-cta').onclick = loadExample;
async function fileData(file) {
 if (!file || !['image/png','image/jpeg','image/webp'].includes(file.type)) throw new Error('请选择 PNG、JPEG 或 WebP 图片。');
 if (file.size > 20*1024*1024) throw new Error('图片不能超过 20 MB。');
 return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(new Error('图片无法读取。'));r.readAsDataURL(file);});
}
async function uploadFile(file) {
 if(busy)return;
 try {const data=await fileData(file);await loadSource(data,file.name);sample=false;notify('图片已载入，可以编辑图层规划后开始拆解。');}
 catch(e){notify(e.message,true);}
}
$('upload').onchange = async () => {await uploadFile($('upload').files[0]);$('upload').value='';};
for(const event of ['dragenter','dragover']) $('drop-zone').addEventListener(event,e=>{e.preventDefault();$('drop-zone').classList.add('dragging');});
for(const event of ['dragleave','drop']) $('drop-zone').addEventListener(event,e=>{e.preventDefault();$('drop-zone').classList.remove('dragging');});
$('drop-zone').addEventListener('drop',e=>uploadFile(e.dataTransfer.files[0]));
function setBusy(value,kind) {
 busy=value;
 for (const button of document.querySelectorAll('button')) button.disabled=value;
 $('upload').disabled=value;
 for(const id of Object.values(PROMPT_IDS))$(id).disabled=value;$('split-prompt').disabled=value;
 $('generate-ratio').disabled=value;$('output-ratio').disabled=value;
 for(const id of ['style-select','cover-title','cover-context',...XHS_FIELDS])$(id).disabled=value;
 if(value)$('layer-scale').disabled=true;
 $('busy-overlay').hidden=!value;
 $('busy-title').textContent=kind==='generate'?'正在生成你的画面':'正在拆解每一个图层';
 $('busy-detail').textContent='通常需要 30–90 秒，请保持页面打开。';
 if(value){const start=Date.now();$('elapsed').textContent='0 秒';timer=setInterval(()=>{const elapsed=Math.floor((Date.now()-start)/1000);$('elapsed').textContent=`${elapsed} 秒`;
 if(elapsed>90)$('busy-detail').textContent='模型仍在处理较复杂的画面，我们会持续等待结果。';},1000);}
 else{clearInterval(timer);timer=null;refreshSelection();}
}
async function asDataURL(url) {
 if(url.startsWith('data:'))return url;
 const response=await fetch(url);if(!response.ok)throw new Error('原图无法读取，请重新上传。');
 const blob=await response.blob();return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(blob);});
}
const delay = ms => new Promise(resolve=>setTimeout(resolve,ms));
async function submit(kind) {
 if(busy)return;
 if(kind==='generate'&&currentStyle()&&(styleSignature()!==appliedStyleSignature||!promptEditor().value.trim())&&!applyStyle())return;
 let prompt=(kind==='generate'?promptEditor():$('split-prompt')).value.trim();
 if(!prompt){notify('请先填写提示词。',true);return;}
 const ratio=$('generate-ratio').value;
 if(kind==='generate'&&OUTPUT_SIZES[ratio])prompt=`【画布比例】${ratio}（宽:高）。请按此比例安排完整构图，文字和主体保留安全边距。\n${prompt}`;
 if(prompt.length>16000){notify('提示词加上比例说明后不能超过 16000 字，请缩短描述。',true);return;}
 if(kind==='split'&&!currentImage){notify('请先生成或上传一张图片，也可以载入示例。',true);return;}
 if(!needKey())return;
 setBusy(true,kind);notify('');
 if(window.matchMedia('(max-width:900px)').matches)$('canvas-stage').scrollIntoView({behavior:'smooth',block:'center'});
 let polling = false;
 try {
  const payload={kind,prompt,key:$('api-key').value.trim(),ratio:kind==='generate'?ratio:'auto'};
  if(kind==='split')payload.image=await asDataURL(currentImage);
  const cloud=await CoverCloud.ready;
  if(cloud){
   const job=await CoverCloud.submit(payload);
   if(kind==='generate'){await loadSource(job.images[0].url,'生成结果');sample=false;outputRatio=ratio;$('output-ratio').value=ratio;notify(`生成完成 · ${job.elapsed} 秒。可以下载原图或继续拆解。`);}
   else{await loadLayers(orderedLayerItems(job.images,prompt),job.zip_url,false);notify(`拆解完成 · ${job.elapsed} 秒 · ${job.images.length} 个图层。点击画面里的元素，直接拖动。`);}
   if(job.storage_warning)notify(job.storage_warning,true);
   return;
  }
  const resp=await fetch('/api/jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  payload.key='';
  const created=await resp.json();if(!resp.ok)throw new Error(created.error||'任务提交失败。');
  taskId=created.id;polling=true;
  const deadline=Date.now()+12*60*1000;
  let failures=0;
  while(Date.now()<deadline){
   await delay(1500);
   let job;
   try {const res=await fetch(`/api/jobs/${taskId}`);if(!res.ok)throw new Error('任务状态暂时不可用。');job=await res.json();failures=0;}
   catch(e){if(++failures<6)continue;throw new Error('无法连接本地服务，请检查终端服务是否仍在运行。');}
   if(job.status==='error')throw new Error(job.error);
   if(job.status!=='done')continue;
   if(kind==='generate'){
    await loadSource(job.images[0].url,'生成结果');sample=false;
    outputRatio=ratio;$('output-ratio').value=ratio;
    notify(`生成完成 · ${job.elapsed} 秒。可以下载原图或继续拆解。`);
   } else {
    await loadLayers(orderedLayerItems(job.images,prompt),job.zip_url,false);
    notify(`拆解完成 · ${job.elapsed} 秒 · ${job.images.length} 个图层。点击画面里的元素，直接拖动。`);
   }
   return;
  }
  throw new Error('等待超过 12 分钟，请检查本地服务。图片若已完成，会保存在 output 文件夹。');
 }catch(e){notify(e.message+(polling?`（任务 ${taskId}）`:''),true);}
 finally{setBusy(false,kind);}
}
$('generate').onclick=()=>submit('generate');$('split').onclick=()=>submit('split');

/* ---------- Persistent asset library ---------- */
function closeLibrary(){
 $('asset-library').hidden=true;$('open-library').setAttribute('aria-expanded','false');$('open-library').focus();
}
async function refreshLibrary(){
 const request=++libraryRequest;
 $('library-status').textContent='正在读取素材…';
 try{
  let result;
  if(await CoverCloud.ready)result={assets:await CoverCloud.list()};
  else{const response=await fetch('/api/assets');if(!response.ok)throw new Error('素材库暂时无法读取。');result=await response.json();}if(request!==libraryRequest)return;
  assets=result.assets;renderLibrary();
 }catch(e){if(request===libraryRequest)$('library-status').textContent='读取失败，请检查服务或浏览器存储后点击刷新。';}
}
function renderLibrary(){
 const filter=$('library-filter').value;
 const visible=assets.filter(item=>filter==='all'||item.kind===filter);
 $('library-status').textContent=visible.length?`${visible.length} 份素材 · 最新在前`:'这里还没有素材。生成图片或完成拆层后，会自动保存到这里。';
 $('asset-list').replaceChildren(...visible.map(item=>{
  const card=document.createElement('article');card.className='asset-card';
  const image=document.createElement('img');image.className='asset-preview';image.loading='lazy';
  image.src=item.source_url||item.images[0].url;image.alt=item.kind==='generate'?'历史生成图片':'拆层源图或首个图层预览';
  if(item.kind==='split'&&!item.source_url)previewOldLayers(image,item);
  const title=document.createElement('h3');title.textContent=item.kind==='generate'?'生成图片':`拆层结果 · ${item.images.length} 层`;
  const meta=document.createElement('p');meta.textContent=new Date(item.created_at*1000).toLocaleString('zh-CN')+(item.elapsed?` · ${item.elapsed} 秒`:'');
  const prompt=document.createElement('p');prompt.className='asset-prompt';prompt.textContent=item.prompt;prompt.title=item.prompt;
  const actions=document.createElement('div');actions.className='asset-actions';
  const open=document.createElement('button');open.className='primary';open.textContent='载入画布';open.onclick=()=>openAsset(item);
  const download=document.createElement('a');download.className='secondary';download.textContent=item.kind==='generate'?'下载图片':'下载图层 ZIP';download.href=item.kind==='generate'?item.images[0].url:(item.zip_url||item.images[0].url);download.download='';
  if(item.kind==='split'&&!item.zip_url)download.textContent='下载首个图层';
  const remove=document.createElement('button');remove.className='quiet delete-asset';remove.textContent='删除';remove.onclick=()=>deleteAsset(item,remove);
  actions.append(open,download,remove);card.append(image,title,meta,prompt,actions);return card;
 }));
}
async function changeAsset(id,action){
 if(await CoverCloud.ready){await CoverCloud.change(id,action);return;}
 const response=await fetch(`/api/assets/${action}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
 const result=await response.json();if(!response.ok)throw new Error(result.error||'操作失败。');
}
async function deleteAsset(item,button){
 if(busy)return;
 button.disabled=true;
 try{
  // Keep the currently open source available even after moving its files out of the library.
  if(currentImage&&(item.images.some(image=>image.url===currentImage)||item.source_url===currentImage)){
   currentImage=await asDataURL(currentImage);$('download-original').href=currentImage;
   if(!$('preview-image').hidden)$('preview-image').src=currentImage;
  }
  await changeAsset(item.id,'delete');deletedAssets.push(item.id);
  $('undo-delete').hidden=false;await refreshLibrary();
  $('library-status').textContent='已删除，可撤销。';
 }catch(e){$('library-status').textContent=e.message;button.disabled=false;}
}
$('undo-delete').onclick=async()=>{
 if(busy||!deletedAssets.length)return;
 $('undo-delete').disabled=true;
 try{
  await changeAsset(deletedAssets.at(-1),'restore');deletedAssets.pop();await refreshLibrary();
  $('undo-delete').hidden=!deletedAssets.length;$('library-status').textContent='素材已恢复。';
 }catch(e){$('library-status').textContent=e.message;}
 finally{$('undo-delete').disabled=false;}
};
async function previewOldLayers(image,item){
 try{
  const bitmaps=await Promise.all(item.images.map(layer=>readImage(layer.url)));
  const canvas=document.createElement('canvas'),first=bitmaps[0];
  canvas.width=Math.min(480,first.naturalWidth);canvas.height=Math.round(canvas.width*first.naturalHeight/first.naturalWidth);
  const ctx=canvas.getContext('2d');
  const stack=item.prompt.includes('输出顺序：从底层到顶层。')?bitmaps:bitmaps.reverse();
  for(const bitmap of stack)ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
  image.src=canvas.toDataURL('image/png');image.alt='历史拆层合成预览';
 }catch(e){image.alt='首个图层预览（合成预览暂时不可用）';}
}
async function openAsset(item){
 if(busy)return;
 clearStyle();
 setBusy(true,'load');$('busy-title').textContent='正在载入历史素材';
 try{
  if(item.kind==='generate'){
   await loadSource(item.images[0].url,'历史生成图片');sample=false;
   promptEditor().value=item.prompt.replace(/^【画布比例】[^\n]*\n/,'');countPrompt();
   const promptRatio=item.prompt.match(/^【画布比例】(1:1|9:16|16:9|5:2|4:3|3:4)/)?.[1];
   const ratio=OUTPUT_SIZES[item.ratio]?item.ratio:(promptRatio||'auto');
   $('generate-ratio').value=ratio;outputRatio=ratio;$('output-ratio').value=ratio;setMode('split');
  }else{
   // Older jobs have no saved source: use their unedited composition for future splitting.
   currentImage=null;outputRatio='auto';$('output-ratio').value='auto';
   // Loading an old asset must not replace the current generic or user-edited plan.
   await loadLayers(orderedLayerItems(item.images,item.prompt),item.zip_url||item.images[0].url,false);
   if(item.source_url)currentImage=item.source_url;
   else{const original=document.createElement('canvas');paintComposition(original);currentImage=original.toDataURL('image/png');}
   $('download-original').href=currentImage;$('download-original').hidden=false;setMode('split');
  }
  closeLibrary();showControls(true);
  notify(item.kind==='split'&&!item.source_url?'已载入历史图层。旧记录未保存原图，继续拆解时将使用图层合成图。':'历史素材已载入，可以继续编辑或拆层。');
 }catch(e){notify('素材载入失败：'+e.message,true);}
 finally{setBusy(false,'load');}
}
$('open-library').onclick=()=>{
 const show=$('asset-library').hidden;$('asset-library').hidden=!show;$('open-library').setAttribute('aria-expanded',String(show));
 if(show){showKeyPanel(false);refreshLibrary();$('close-library').focus();}
};
$('close-library').onclick=closeLibrary;
$('refresh-library').onclick=refreshLibrary;
$('library-filter').onchange=renderLibrary;

/* ---------- Layers ---------- */
const sampleNames=['购买按钮与底部说明','价格与促销说明','卖点图标与文字','主标题与副标题','顶部品牌','产品、装饰与石台','背景底图（有主体残留）'];
function drawThumb(canvas,layer){
 const size=120,inset=8;canvas.width=canvas.height=size;
 const b=layer.bounds;if(!b)return;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingQuality='high';
 const scale=Math.min((size-inset*2)/b.width,(size-inset*2)/b.height);
 const w=b.width*scale,h=b.height*scale;
 ctx.drawImage(layer.bitmap,b.x,b.y,b.width,b.height,(size-w)/2,(size-h)/2,w,h);
}
function iconButton(className,label){
 const button=document.createElement('button');button.type='button';button.className=`icon-btn ${className}`;button.setAttribute('aria-label',label);button.title=label;return button;
}
function buildRow(layer,i){
 const row=document.createElement('article');row.className='layer-row';row.dataset.index=i;
 const handle=document.createElement('span');handle.className='drag-handle';handle.title='按住上下拖动，调整叠放顺序';handle.setAttribute('aria-hidden','true');
 handle.addEventListener('pointerdown',event=>startRowDrag(event,layer));
 const eye=iconButton('eye','');
 eye.onclick=event=>{event.stopPropagation();if(busy)return;remember();layer.visible=!layer.visible;if(!layer.visible&&selectedIndex===i)selectedIndex=-1;refreshSelection();renderComposition();};
 const thumb=document.createElement('canvas');thumb.className='layer-thumb';drawThumb(thumb,layer);
 const meta=document.createElement('div');meta.className='layer-meta';
 const name=document.createElement('input');name.className='layer-name';name.value=layer.label;name.maxLength=30;name.spellcheck=false;name.setAttribute('aria-label',`图层 ${pad2(i+1)} 名称`);
 name.oninput=()=>{layer.label=name.value.trim()||`图层 ${pad2(i+1)}`;refreshSelection();};
 name.onkeydown=event=>{if(event.key==='Enter'||event.key==='Escape')name.blur();};
 name.addEventListener('pointerdown',event=>{name.dataset.editing=event.button===0?'1':'';});
 name.addEventListener('blur',()=>{name.dataset.editing='';});
 const sub=document.createElement('span');sub.className='layer-sub';
 meta.append(name,sub);
 const lock=iconButton('lock','');
 lock.onclick=event=>{event.stopPropagation();if(busy)return;layer.locked=!layer.locked;refreshSelection();renderComposition();};
 const link=document.createElement('a');link.className='icon-btn';link.href=layer.url;link.download=layer.name;link.innerHTML=ICON.download;link.title='下载这一层的原始 PNG';link.setAttribute('aria-label',`下载图层 ${pad2(i+1)}`);link.onclick=event=>event.stopPropagation();
 row.append(handle,eye,thumb,meta,lock,link);
 row.addEventListener('contextmenu',event=>{
  // Keep the native menu (copy, paste) only while the name is being edited after a normal click.
  if(event.target===name&&name.dataset.editing)return;
  name.blur();
  event.preventDefault();if(busy)return;selectLayer(i);openLayerMenu(i,event.clientX,event.clientY);
 });
 row.onclick=event=>{
  if(busy||event.target.closest('button,a,input,.drag-handle'))return;
  if(!layer.bounds){notify('这一层是空的，没有可移动的内容。');return;}
  if(!layer.visible){remember();layer.visible=true;}
  selectLayer(i);$('composition').focus({preventScroll:true});
 };
 layer.row={row,eye,sub,lock,link};
 return row;
}
function orderRows(){
 // Rows read top-to-bottom the way the layers are stacked front-to-back.
 const order=displayLayers();
 $('layer-list').replaceChildren(...order.map(layer=>layer.row.row));
}
function analyzeBitmap(bitmap){
 const scratch=document.createElement('canvas');scratch.width=bitmap.naturalWidth;scratch.height=bitmap.naturalHeight;
 const ctx=scratch.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0);
 const pixels=ctx.getImageData(0,0,scratch.width,scratch.height).data;
 let minX=scratch.width,minY=scratch.height,maxX=-1,maxY=-1,filled=0;
 for(let y=0;y<scratch.height;y++)for(let x=0;x<scratch.width;x++)if(pixels[(y*scratch.width+x)*4+3]>12){filled++;if(x<minX)minX=x;if(y<minY)minY=y;if(x>maxX)maxX=x;if(y>maxY)maxY=y;}
 return {pixels,coverage:filled/(scratch.width*scratch.height),bounds:maxX<0?null:{x:minX,y:minY,width:maxX-minX+1,height:maxY-minY+1}};
}
async function loadLayers(items,zip,isSample){
 sample=isSample;
 const decoded=await Promise.all(items.map(async(item,i)=>{
  const bitmap=await readImage(item.url);
  const {pixels,coverage,bounds}=analyzeBitmap(bitmap);
  // A layer that fills the canvas is the backdrop: lock it so a stray click cannot drag it away.
  return {...item,bitmap,visible:true,locked:coverage>0.85,index:i,x:0,y:0,scale:1,pixels,coverage,bounds,
   label:isSample?sampleNames[i]:`图层 ${pad2(i+1)}`};
 }));
 layers=decoded;reverseStack=false;selectedIndex=-1;hoverIndex=-1;drag=null;past=[];future=[];
 // Treat the requested order as advisory; opaque backdrops must be below the foreground.
 manualOrder=initialLayerOrder(layers);
 layers.forEach((layer,i)=>buildRow(layer,i));orderRows();
 $('editor-controls').hidden=false;
 $('preview-image').hidden=true;$('composition').hidden=false;$('layers-section').hidden=false;
 $('empty-state').hidden=true;$('next-step').hidden=true;
 $('download-zip').href=zip;
 const first=layers[0].bitmap;
 $('image-meta').textContent=`${isSample?'真实调用示例 · ':''}组合预览 · ${first.naturalWidth} × ${first.naturalHeight}`;
 $('canvas-step').textContent='LAYERS';
 $('canvas-caption').textContent='拖动移动 · 拖角缩放 · ⌘Z 撤销';
 $('layer-note').textContent=isSample?'示例中产品与装饰仍合并在一层，背景层有主体残留。文字图层是像素图片。':'文字图层是像素图片。主体分离与背景补全效果因画面而异。';
 setFlow(3);
 paintComposition($('composition'),true);
 refreshSelection();fitStage();
}
function layerBox(layer){
 const b=layer.bounds,s=layer.scale||1;
 return {x:layer.x+b.x*s,y:layer.y+b.y*s,width:b.width*s,height:b.height*s};
}
function boxCorners(b){return [[b.x,b.y],[b.x+b.width,b.y],[b.x+b.width,b.y+b.height],[b.x,b.y+b.height]];}
function resizeLayer(layer,scale,anchor,local){
 layer.scale=Math.max(0.1,Math.min(4,scale));
 layer.x=anchor.x-local.x*layer.scale;layer.y=anchor.y-local.y*layer.scale;
}
function paintComposition(canvas,selection=false){
 if(!layers.length)return;
 const {width,height,scale:zoom,offsetX,offsetY}=canvasLayout();
 if(canvas.width!==width)canvas.width=width;
 if(canvas.height!==height)canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);
 if(outputRatio!=='auto'){ctx.fillStyle='#f8f7f1';ctx.fillRect(0,0,width,height);}
 const stack=[...displayLayers()].reverse();
 for(const layer of stack)if(layer.visible)ctx.drawImage(layer.bitmap,offsetX+layer.x*zoom,offsetY+layer.y*zoom,layer.bitmap.naturalWidth*(layer.scale||1)*zoom,layer.bitmap.naturalHeight*(layer.scale||1)*zoom);
 const chosen=layers[selectedIndex];
 if(selection&&chosen?.visible&&chosen.bounds){
  const scale=canvas.width/(canvas.getBoundingClientRect().width||canvas.width);const b=layerBox(chosen);
  ctx.lineWidth=2*scale;ctx.strokeStyle='#456b48';ctx.setLineDash([6*scale,4*scale]);
  ctx.strokeRect(offsetX+b.x*zoom,offsetY+b.y*zoom,b.width*zoom,b.height*zoom);
  if(!chosen.locked){
   ctx.setLineDash([]);ctx.fillStyle='#f8f7f1';const size=8*scale;
   for(const [x,y] of boxCorners(b)){ctx.fillRect(offsetX+x*zoom-size/2,offsetY+y*zoom-size/2,size,size);ctx.strokeRect(offsetX+x*zoom-size/2,offsetY+y*zoom-size/2,size,size);}
  }
 }
}
function renderComposition(){
 if(frame)return;
 frame=requestAnimationFrame(()=>{
  frame=0;const canvas=$('composition');
  paintComposition(canvas,true);
  const hovered=layers[hoverIndex];
  if(hovered&&hoverIndex!==selectedIndex&&hovered.visible&&hovered.bounds&&!drag){
   const ctx=canvas.getContext('2d'),scale=canvas.width/(canvas.getBoundingClientRect().width||canvas.width),b=layerBox(hovered);
   ctx.setLineDash([]);ctx.lineWidth=1.5*scale;ctx.strokeStyle='#456b4899';
   const layout=canvasLayout();
   ctx.strokeRect(layout.offsetX+b.x*layout.scale,layout.offsetY+b.y*layout.scale,b.width*layout.scale,b.height*layout.scale);
  }
 });
}
function refreshSelection(){
 const chosen=layers[selectedIndex];
 if(layers.length){
  $('selected-layer').textContent=chosen?`已选中：${chosen.label}`:'点击画面里的元素选中';
  $('layer-position').textContent=chosen?(chosen.locked?'已锁定，点右侧锁图标解锁后可移动':`偏移 X ${Math.round(chosen.x)} / Y ${Math.round(chosen.y)} px`):'';
  const shown=layers.filter(layer=>layer.visible).length;
  $('layer-count').textContent=`${layers.length} 个图层`;
  const layout=canvasLayout();
  $('layer-summary').textContent=`显示 ${shown} · 隐藏 ${layers.length-shown} · ${layout.width} × ${layout.height}`;
  $('image-meta').textContent=`${sample?'真实调用示例 · ':''}组合预览 · ${layout.width} × ${layout.height}`;
 }
 const moved=layers.some(layer=>layer.x||layer.y||(layer.scale||1)!==1);
 $('layer-scale').disabled=busy||!chosen||chosen.locked||!chosen.visible;
 if(document.activeElement!==$('layer-scale'))$('layer-scale').value=chosen?Math.round((chosen.scale||1)*100):100;
 $('reset-layer').disabled=busy||!chosen||!(chosen.x||chosen.y||(chosen.scale||1)!==1);
 $('reset-all').disabled=busy||!moved;
 $('undo').disabled=busy||!past.length;$('redo').disabled=busy||!future.length;
 $('select-all').disabled=busy||layers.every(layer=>layer.visible);
 layers.forEach((layer,i)=>{
  const {row,eye,sub,lock}=layer.row;
  row.classList.toggle('selected',i===selectedIndex);row.classList.toggle('off',!layer.visible);row.classList.toggle('locked',layer.locked);
  if(eye.dataset.on!==String(layer.visible)){eye.dataset.on=String(layer.visible);eye.innerHTML=layer.visible?ICON.eye:ICON.eyeOff;}
  const eyeLabel=layer.visible?'隐藏这一层':'显示这一层';eye.title=eyeLabel;eye.setAttribute('aria-label',`${eyeLabel}：${layer.label}`);eye.setAttribute('aria-pressed',String(layer.visible));
  if(lock.dataset.on!==String(layer.locked)){lock.dataset.on=String(layer.locked);lock.innerHTML=layer.locked?ICON.lock:ICON.unlock;}
  const lockLabel=layer.locked?'解锁，允许拖动':'锁定，防止误拖';lock.title=lockLabel;lock.setAttribute('aria-label',`${lockLabel}：${layer.label}`);lock.setAttribute('aria-pressed',String(layer.locked));
  const area=!layer.bounds?'空图层':`占画面 ${Math.max(1,Math.round(layer.coverage*100))}%`;
  const state=!layer.visible?' · 已隐藏':layer.locked?' · 已锁定':(layer.x||layer.y)?` · 已移动 ${Math.round(layer.x)}, ${Math.round(layer.y)}`:'';
  sub.textContent=area+state+((layer.scale||1)!==1?` · 缩放 ${Math.round(layer.scale*100)}%`:'');
 });
}
function selectLayer(index){
 selectedIndex=index;refreshSelection();renderComposition();
 if(index>=0)layers[index].row.row.scrollIntoView({block:'nearest'});
}

/* ---------- Undo ---------- */
const snapshot=()=>({reverseStack,outputRatio,manualOrder:[...manualOrder],layers:layers.map(layer=>[layer.x,layer.y,layer.visible,layer.scale||1])});
function remember(){past.push(snapshot());if(past.length>100)past.shift();future=[];}
function restore(state){
 layers.forEach((layer,i)=>{[layer.x,layer.y,layer.visible,layer.scale]=state.layers[i];});
 reverseStack=state.reverseStack;manualOrder=[...state.manualOrder];orderRows();
 outputRatio=state.outputRatio;$('output-ratio').value=outputRatio;
 if(selectedIndex>=0&&!layers[selectedIndex].visible)selectedIndex=-1;
 paintComposition($('composition'),true);refreshSelection();fitStage();
}
function undo(){if(busy||!past.length)return;future.push(snapshot());restore(past.pop());}
function redo(){if(busy||!future.length)return;past.push(snapshot());restore(future.pop());}
$('undo').onclick=undo;$('redo').onclick=redo;

/* ---------- Pointer and keyboard editing ---------- */
const composition=$('composition');composition.tabIndex=0;composition.setAttribute('aria-label','图层组合预览。点击选中图层并拖动，方向键微调位置。');
function canvasPoint(event){
 const rect=composition.getBoundingClientRect(),layout=canvasLayout();
 return {x:((event.clientX-rect.left)*composition.width/rect.width-layout.offsetX)/layout.scale,y:((event.clientY-rect.top)*composition.height/rect.height-layout.offsetY)/layout.scale};
}
function hitLayer(layer,point){
 if(!layer.visible)return false;
 const s=layer.scale||1,x=Math.floor((point.x-layer.x)/s),y=Math.floor((point.y-layer.y)/s);
 const width=layer.bitmap.naturalWidth,height=layer.bitmap.naturalHeight;
 return x>=0&&y>=0&&x<width&&y<height&&layer.pixels[(y*width+x)*4+3]>12;
}
function grabbable(layer,point){
 // Text is mostly gaps between strokes, so compact layers can also be grabbed anywhere inside their box.
 if(layer.locked||!layer.visible||!layer.bounds)return false;
 if(hitLayer(layer,point))return true;
 const b=layer.bounds,s=layer.scale||1,x=(point.x-layer.x)/s,y=(point.y-layer.y)/s;
 const compact=b.width*b.height<0.35*layer.bitmap.naturalWidth*layer.bitmap.naturalHeight;
 return compact&&x>=b.x&&y>=b.y&&x<b.x+b.width&&y<b.y+b.height;
}
function pick(point){
 // Keep the current selection if the pointer is on it, so a layer under another one stays draggable.
 const chosen=layers[selectedIndex];
 if(chosen&&grabbable(chosen,point))return selectedIndex;
 const topFirst=displayLayers();
 const hit=topFirst.find(layer=>grabbable(layer,point));
 return hit?hit.index:-1;
}
function resizeCorner(point){
 const chosen=layers[selectedIndex];if(!chosen?.visible||chosen.locked||!chosen.bounds)return -1;
 const radius=10*composition.width/composition.getBoundingClientRect().width/canvasLayout().scale;
 return boxCorners(layerBox(chosen)).findIndex(([x,y])=>Math.abs(point.x-x)<=radius&&Math.abs(point.y-y)<=radius);
}
composition.addEventListener('pointerdown',event=>{
 if(busy||!layers.length||event.button!==0||drag)return;
 const point=canvasPoint(event),corner=resizeCorner(point),index=corner>=0?selectedIndex:pick(point);
 selectLayer(index);composition.focus({preventScroll:true});
 if(index<0)return;
 event.preventDefault();composition.setPointerCapture(event.pointerId);
 drag={pointerId:event.pointerId,point,x:layers[index].x,y:layers[index].y,index,moved:false};
 if(corner>=0){
  const layer=layers[index],b=layer.bounds,opposite=(corner+2)%4;
  const [ax,ay]=boxCorners(layerBox(layer))[opposite];
  const [lx,ly]=boxCorners(b)[opposite];
  const [cx,cy]=boxCorners(layerBox(layer))[corner];
  Object.assign(drag,{resize:true,scale:layer.scale||1,anchor:{x:ax,y:ay},local:{x:lx,y:ly},vector:{x:cx-ax,y:cy-ay}});
 }
});
composition.addEventListener('pointermove',event=>{
 if(busy||!layers.length)return;
 const point=canvasPoint(event);
 if(!drag){
  composition.classList.toggle('can-resize',resizeCorner(point)>=0);
  const index=pick(point);composition.classList.toggle('can-move',index>=0);
  if(index!==hoverIndex){hoverIndex=index;renderComposition();}
  return;
 }
 if(drag.pointerId!==event.pointerId)return;
 const layer=layers[drag.index];
 if(drag.resize){
  const v=drag.vector;
  const factor=1+((point.x-drag.point.x)*v.x+(point.y-drag.point.y)*v.y)/(v.x*v.x+v.y*v.y);
  const scale=Math.max(0.1,Math.min(4,drag.scale*factor));
  if(scale===layer.scale)return;
  if(!drag.moved){remember();drag.moved=true;}
  resizeLayer(layer,scale,drag.anchor,drag.local);refreshSelection();renderComposition();return;
 }
 let x=Math.round(drag.x+point.x-drag.point.x),y=Math.round(drag.y+point.y-drag.point.y);
 // Snap back onto the original position when close; hold Alt to move freely.
 const snap=event.altKey?0:5*composition.width/composition.getBoundingClientRect().width/canvasLayout().scale;
 if(Math.abs(x)<snap)x=0;if(Math.abs(y)<snap)y=0;
 if(x===layer.x&&y===layer.y)return;
 if(!drag.moved){remember();drag.moved=true;composition.classList.add('dragging');}
 layer.x=x;layer.y=y;refreshSelection();renderComposition();
});
function endDrag(event){
 if(!drag||drag.pointerId!==event.pointerId)return;
 drag=null;composition.classList.remove('dragging');
 if(composition.hasPointerCapture(event.pointerId))composition.releasePointerCapture(event.pointerId);
 renderComposition();
}
composition.addEventListener('contextmenu',event=>{
 event.preventDefault();if(busy||!layers.length)return;
 const point=canvasPoint(event);let index=pick(point);
 // Locked layers are not draggable, but they can still be edited from the menu.
 if(index<0){const hit=displayLayers().find(layer=>layer.visible&&layer.bounds&&hitLayer(layer,point));index=hit?hit.index:-1;}
 if(index<0)return;
 selectLayer(index);openLayerMenu(index,event.clientX,event.clientY);
});
composition.addEventListener('pointerup',endDrag);composition.addEventListener('pointercancel',endDrag);
composition.addEventListener('lostpointercapture',()=>{drag=null;composition.classList.remove('dragging');});
composition.addEventListener('pointerleave',()=>{if(hoverIndex>=0&&!drag){hoverIndex=-1;composition.classList.remove('can-move');renderComposition();}});
document.addEventListener('keydown',event=>{
 if(!$('asset-library').hidden){if(event.key==='Escape')closeLibrary();return;}
 if(!$('layer-menu').hidden){if(event.key==='Escape'){event.preventDefault();closeLayerMenu();}return;}
 if(busy||!layers.length||event.target.closest('input,textarea,select,[role=tab]'))return;
 const command=event.metaKey||event.ctrlKey;
 if(command&&event.key.toLowerCase()==='z'){event.preventDefault();event.shiftKey?redo():undo();return;}
 if(command&&event.key.toLowerCase()==='y'){event.preventDefault();redo();return;}
 if(command||event.altKey)return;
 const chosen=layers[selectedIndex];if(!chosen)return;
 const moves={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]},delta=moves[event.key];
 if(delta){
  event.preventDefault();
  if(chosen.locked){notify('这一层已锁定，先点右侧的锁图标解锁。');return;}
  if(!event.repeat)remember();
  const step=event.shiftKey?10:1;chosen.x+=delta[0]*step;chosen.y+=delta[1]*step;refreshSelection();renderComposition();
 } else if(event.key==='Delete'||event.key==='Backspace'){
  event.preventDefault();remember();chosen.visible=false;selectedIndex=-1;refreshSelection();renderComposition();
  notify(`已隐藏「${chosen.label}」，可在右侧图层列表恢复，或按 ⌘Z 撤销。`);
 } else if(event.key==='ContextMenu'||(event.shiftKey&&event.key==='F10')){
  event.preventDefault();const rect=composition.getBoundingClientRect();openLayerMenu(selectedIndex,rect.left+rect.width/2,rect.top+rect.height/2);
 } else if(event.key==='Escape'){selectLayer(-1);}
});
$('layer-scale').onchange=()=>{
 const chosen=layers[selectedIndex];if(busy||!chosen||chosen.locked||!chosen.visible||!chosen.bounds)return;
 const value=Number($('layer-scale').value);
 if(!Number.isFinite(value)||value<10||value>400){$('layer-scale').value=Math.round((chosen.scale||1)*100);notify('缩放范围为 10%–400%。',true);return;}
 if(value/100===(chosen.scale||1))return;
 const b=chosen.bounds,box=layerBox(chosen);remember();
 resizeLayer(chosen,value/100,{x:box.x+box.width/2,y:box.y+box.height/2},{x:b.x+b.width/2,y:b.y+b.height/2});
 refreshSelection();renderComposition();
};
$('layer-scale').onkeydown=event=>{if(event.key==='Enter')$('layer-scale').blur();};
$('reset-layer').onclick=()=>{const chosen=layers[selectedIndex];if(chosen&&(chosen.x||chosen.y||(chosen.scale||1)!==1)){remember();chosen.x=0;chosen.y=0;chosen.scale=1;refreshSelection();renderComposition();}};
$('reset-all').onclick=()=>{remember();layers.forEach(layer=>{layer.x=0;layer.y=0;layer.scale=1;});refreshSelection();renderComposition();notify('所有图层已恢复原始位置和大小。');};
function reorderSelected(target){
 if(busy||selectedIndex<0)return;
 const order=displayLayers().map(layer=>layer.index),position=order.indexOf(selectedIndex);
 const next=target==='top'?0:target==='bottom'?order.length-1:position+target;
 if(next<0||next>=order.length||next===position)return;
 remember();order.splice(position,1);order.splice(next,0,selectedIndex);manualOrder=order;
 orderRows();refreshSelection();renderComposition();
 layers[selectedIndex].row.row.scrollIntoView({block:'nearest'});
}
/* ---------- Layer list dragging ---------- */
let rowDrag=null;
function startRowDrag(event,layer){
 if(busy||event.button!==0||rowDrag)return;
 event.preventDefault();event.stopPropagation();closeLayerMenu();
 // Listen on the document: moving the row in the DOM would drop a pointer capture held by the handle.
 rowDrag={pointerId:event.pointerId,layer,moved:false};layer.row.row.classList.add('dragging');
 const move=e=>{
  if(e.pointerId!==rowDrag?.pointerId)return;
  const list=$('layer-list'),row=layer.row.row,rect=list.getBoundingClientRect();
  if(e.clientY<rect.top+28)list.scrollTop-=12;else if(e.clientY>rect.bottom-28)list.scrollTop+=12;
  const target=[...list.children].find(other=>other!==row&&e.clientY<other.getBoundingClientRect().top+other.offsetHeight/2);
  if(target?(row.nextSibling===target):(row===list.lastElementChild))return;
  if(!rowDrag.moved){remember();rowDrag.moved=true;}
  target?list.insertBefore(row,target):list.append(row);
  manualOrder=[...list.children].map(child=>Number(child.dataset.index));
  refreshSelection();renderComposition();
 };
 const end=e=>{
  if(e.pointerId!==rowDrag?.pointerId)return;
  layer.row.row.classList.remove('dragging');rowDrag=null;
  document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',end);document.removeEventListener('pointercancel',end);
 };
 document.addEventListener('pointermove',move);document.addEventListener('pointerup',end);document.addEventListener('pointercancel',end);
}

/* ---------- Layer context menu ---------- */
let menuIndex=-1;
function openLayerMenu(index,x,y){
 const layer=layers[index];if(!layer)return;
 menuIndex=index;const menu=$('layer-menu');
 const position=displayLayers().findIndex(item=>item.index===index),last=layers.length-1;
 const item=action=>menu.querySelector(`[data-action="${action}"]`);
 item('top').disabled=item('up').disabled=position<=0;
 item('bottom').disabled=item('down').disabled=position>=last;
 item('hide').textContent=layer.visible?'隐藏':'显示';
 item('lock').textContent=layer.locked?'解锁':'锁定';
 item('reset').disabled=!(layer.x||layer.y||(layer.scale||1)!==1);
 menu.hidden=false;
 const width=menu.offsetWidth,height=menu.offsetHeight;
 menu.style.left=`${Math.max(8,Math.min(x,innerWidth-width-8))}px`;
 menu.style.top=`${Math.max(8,Math.min(y,innerHeight-height-8))}px`;
 menu.querySelector('button:not(:disabled)')?.focus();
}
function closeLayerMenu(){if(!$('layer-menu').hidden){$('layer-menu').hidden=true;menuIndex=-1;}}
document.addEventListener('pointerdown',event=>{if(!event.target.closest('#layer-menu'))closeLayerMenu();},true);
addEventListener('resize',closeLayerMenu);$('layer-list').addEventListener('scroll',closeLayerMenu);
$('layer-menu').addEventListener('keydown',event=>{
 const items=[...$('layer-menu').querySelectorAll('button:not(:disabled)')],at=items.indexOf(document.activeElement);
 if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();items[(at+(event.key==='ArrowDown'?1:items.length-1))%items.length]?.focus();}
});
$('layer-menu').onclick=event=>{
 const button=event.target.closest('button[data-action]');if(!button||button.disabled)return;
 const index=menuIndex,layer=layers[index];closeLayerMenu();if(!layer||busy)return;
 selectLayer(index);
 const action=button.dataset.action;
 if(action==='top'||action==='bottom')reorderSelected(action);
 else if(action==='up'||action==='down')reorderSelected(action==='up'?-1:1);
 else if(action==='hide'){remember();layer.visible=!layer.visible;if(!layer.visible)selectedIndex=-1;refreshSelection();renderComposition();}
 else if(action==='lock'){layer.locked=!layer.locked;refreshSelection();renderComposition();}
 else if(action==='reset'){remember();layer.x=0;layer.y=0;layer.scale=1;refreshSelection();renderComposition();}
 else if(action==='download')layer.row.link.click();
};

$('reverse-stack').onclick=()=>{remember();manualOrder=displayLayers().map(layer=>layer.index).reverse();reverseStack=!reverseStack;orderRows();refreshSelection();renderComposition();notify('已反转图层叠放顺序。');};
$('select-all').onclick=()=>{remember();layers.forEach(layer=>{layer.visible=true;});refreshSelection();renderComposition();};
$('export-composite').onclick=()=>{const output=document.createElement('canvas');paintComposition(output);output.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='cover-studio.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);},'image/png');};
async function init(){
 setPurpose('ecommerce');$('generate-ratio').value='3:4';updateStyleUI();
 await Promise.allSettled([
  (async()=>{
   try{
    const response=await fetch('/punk-styles.json');if(!response.ok)throw new Error();
    const catalog=await response.json();punkStyles=catalog.styles;
    if(punkStyles.length){
     const group=document.createElement('optgroup');group.label=`文章封面 · Punk（${punkStyles.length}）`;
     for(const style of punkStyles){const option=document.createElement('option');option.value=`punk:${style.id}`;option.textContent=style.name;group.append(option);}
     $('style-select').insertBefore(group,$('style-select').querySelector('optgroup'));
    }
   }catch(e){notify('Punk 风格库读取失败，仍可使用小红书模板或自由描述。',true);}
  })(),
  (async()=>{
   try{const response=await fetch('/example-prompt.txt');if(!response.ok)throw new Error();samplePrompt=await response.text();if(!$('generate-prompt').value)$('generate-prompt').value=samplePrompt;countPrompt();}
   catch(e){notify('示例提示词无法读取，请输入你的创作想法。',true);}
  })(),
  (async()=>{
   try{
    if(await CoverCloud.ready){$('asset-library').querySelector('.library-head p').textContent='素材保存在当前浏览器，清除网站数据后会移除。';}
    keyState();
   }catch(e){notify('服务连接失败，请刷新页面后重试。',true);}
  })()
 ]);
}
init();
