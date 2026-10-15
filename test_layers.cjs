const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(__dirname+'/static/app.js','utf8');
const paint = source.slice(source.indexOf('function paintComposition('),source.indexOf('function renderComposition('));
const transforms=source.slice(source.indexOf('function layerBox('),source.indexOf('function paintComposition('));
const ordering=source.slice(source.indexOf('function displayLayers('),source.indexOf("let outputRatio ="));
const calls=[];
const ctx={clearRect(){},fillRect(){},drawImage(...args){calls.push(['image',...args]);},setLineDash(){},strokeRect(...args){calls.push(['selection',...args]);}};
const canvas={width:0,height:0,getContext:()=>ctx,getBoundingClientRect:()=>({width:200})};
const layers=[
 {bitmap:{naturalWidth:400,naturalHeight:500},x:40,y:-20,visible:true,bounds:{x:10,y:10,width:100,height:100}},
 {bitmap:{naturalWidth:400,naturalHeight:500},x:0,y:0,visible:false},
 {bitmap:{naturalWidth:400,naturalHeight:500},x:-5,y:9,visible:true}
];
const layoutSource=source.slice(source.indexOf('const OUTPUT_SIZES='),source.indexOf("$('output-ratio').onchange"));
const context={layers,selectedIndex:0,reverseStack:false,manualOrder:[],outputRatio:'auto'};vm.createContext(context);vm.runInContext(ordering+layoutSource+transforms+paint,context);
context.paintComposition(canvas);
assert.equal(canvas.width,400);assert.equal(canvas.height,500);
assert.deepEqual(calls.map(c=>c.slice(2)),[[-5,9,400,500],[40,-20,400,500]]);
assert.equal(calls.some(c=>c[0]==='selection'),false,'导出图不能包含选中框');
calls.length=0;context.paintComposition(canvas,true);
assert.deepEqual(calls.find(c=>c[0]==='selection'),['selection',50,-10,100,100]);
calls.length=0;context.reverseStack=true;context.paintComposition(canvas);
assert.deepEqual(calls.map(c=>c.slice(2)),[[40,-20,400,500],[-5,9,400,500]]);
console.log('图层偏移、显隐、叠放顺序和无选中框导出检查通过');

for(const [ratio,size] of Object.entries({'1:1':[1600,1600],'9:16':[1080,1920],'16:9':[1920,1080],'5:2':[1500,600],'4:3':[1600,1200],'3:4':[1200,1600]})){
 context.outputRatio=ratio;calls.length=0;context.paintComposition(canvas);
 assert.equal(canvas.width,size[0]);assert.equal(canvas.height,size[1]);
 const layout=context.canvasLayout();
 assert.ok(layout.offsetX>=0&&layout.offsetY>=0,'完整保留原图');
 const drawn=calls[0];
 assert.ok(Math.abs(drawn[4]/drawn[5]-400/500)<1e-10,'不能拉伸原图');
 assert.equal(calls.some(c=>c[0]==='selection'),false);
}
// Coordinates used to select and drag must map back into source pixels.
context.composition={width:1500,height:600,getBoundingClientRect:()=>({left:10,top:20,width:750,height:300})};
context.outputRatio='5:2';
vm.runInContext(source.slice(source.indexOf('function canvasPoint('),source.indexOf('function hitLayer(')),context);
const layout=context.canvasLayout();
const point=context.canvasPoint({clientX:10+(layout.offsetX+100*layout.scale)/2,clientY:20+(layout.offsetY+200*layout.scale)/2});
assert.ok(Math.abs(point.x-100)<1e-10&&Math.abs(point.y-200)<1e-10);
console.log('六种画布尺寸、不拉伸导出与拖动坐标映射检查通过');

context.outputRatio='auto';context.reverseStack=false;
const layer=layers[0],original=context.layerBox(layer);
context.resizeLayer(layer,2,{x:original.x+original.width/2,y:original.y+original.height/2},{x:60,y:60});
const resized=context.layerBox(layer);
assert.equal(resized.width,200);assert.equal(resized.height,200);
assert.equal(resized.x+resized.width/2,original.x+original.width/2);
assert.equal(resized.y+resized.height/2,original.y+original.height/2);
calls.length=0;context.paintComposition(canvas);
assert.deepEqual(calls.at(-1).slice(4),[800,1000]);
assert.equal(calls.some(c=>c[0]==='selection'),false);
context.resizeLayer(layer,0.01,{x:0,y:0},{x:0,y:0});assert.equal(layer.scale,0.1);
context.resizeLayer(layer,10,{x:0,y:0},{x:0,y:0});assert.equal(layer.scale,4);
layer.pixels=new Uint8ClampedArray(400*500*4);layer.pixels[(20*400+20)*4+3]=255;
vm.runInContext(source.slice(source.indexOf('function hitLayer('),source.indexOf('function pick(')),context);
assert.equal(context.hitLayer(layer,{x:80,y:80}),true);
assert.equal(context.hitLayer(layer,{x:20,y:20}),false);
console.log('图层等比缩放、中心保持、导出与缩放后选中检查通过');

// A mixed sequence must restore the stack as well as the prior edit.
const historySource = source.slice(source.indexOf('const snapshot='), source.indexOf("$('undo').onclick"));
const historyContext = {
 layers:[{x:0,y:0,visible:true}],reverseStack:false,selectedIndex:0,
 outputRatio:'auto',manualOrder:[],past:[],future:[],busy:false,orderRows(){},refreshSelection(){},renderComposition(){},paintComposition(){},fitStage(){},$:()=>({})
};
vm.createContext(historyContext);vm.runInContext(historySource,historyContext);
historyContext.remember();historyContext.layers[0].x=40;
historyContext.remember();historyContext.reverseStack=true;
historyContext.undo();
assert.equal(historyContext.reverseStack,false);
assert.equal(historyContext.layers[0].x,40,'撤销顺序不应撤销移动');
historyContext.undo();assert.equal(historyContext.layers[0].x,0);
historyContext.redo();assert.equal(historyContext.layers[0].x,40);
historyContext.redo();assert.equal(historyContext.reverseStack,true);
console.log('移动与反转顺序的连续撤销、重做检查通过');
historyContext.remember();historyContext.outputRatio='5:2';
historyContext.undo();assert.equal(historyContext.outputRatio,'auto');
historyContext.redo();assert.equal(historyContext.outputRatio,'5:2');

historyContext.remember();historyContext.layers[0].scale=2;
historyContext.undo();assert.equal(historyContext.layers[0].scale,1);
historyContext.redo();assert.equal(historyContext.layers[0].scale,2);

// Reordering must keep selection, offsets and bitmap identities stable.
const orderingContext={layers:[{index:0,x:8,row:{row:{scrollIntoView(){}}}},{index:1,x:9,row:{row:{scrollIntoView(){}}}},{index:2,x:10,row:{row:{scrollIntoView(){}}}}],manualOrder:[0,1,2],selectedIndex:1,busy:false,reverseStack:false,remember(){},orderRows(){},refreshSelection(){},renderComposition(){}};
vm.createContext(orderingContext);
vm.runInContext(ordering+source.slice(source.indexOf('function reorderSelected('),source.indexOf('/* ---------- Layer list dragging')),orderingContext);
orderingContext.reorderSelected('top');
assert.deepEqual(Array.from(orderingContext.manualOrder),[1,0,2]);
assert.equal(orderingContext.selectedIndex,1);assert.equal(orderingContext.layers[1].x,9);
orderingContext.reorderSelected(1);assert.deepEqual(Array.from(orderingContext.manualOrder),[0,1,2]);
orderingContext.reorderSelected('bottom');assert.deepEqual(Array.from(orderingContext.manualOrder),[0,2,1]);
assert.deepEqual(Array.from(orderingContext.initialLayerOrder([{coverage:1},{coverage:.2},{coverage:.01}])),[1,2,0]);
historyContext.remember();historyContext.manualOrder=[2,0,1];
historyContext.undo();assert.deepEqual(Array.from(historyContext.manualOrder),[]);
historyContext.redo();assert.deepEqual(Array.from(historyContext.manualOrder),[2,0,1]);
console.log('单层上移、下移、置顶置底、背景置底与顺序撤销检查通过');

// Credentials remain user-entered; runtime discovery must not populate a key.
(async()=>{
 const initSource=source.slice(source.indexOf('async function init(){'),source.lastIndexOf('init();'));
 async function checkInit(enteredKey,enteredPrompt,configOK=true){
  const fields={'api-key':{value:enteredKey},'generate-prompt':{value:enteredPrompt},'generate-ratio':{value:'auto'},'style-select':{disabled:false,insertBefore(){},querySelector(){}}};
  const notices=[];
  const sandbox={
   $:id=>fields[id],samplePrompt:'',punkStyles:[],countPrompt(){},keyState(){},setPurpose(){},updateStyleUI(){},
   CoverCloud:{ready:configOK?Promise.resolve(false):Promise.reject(new Error('offline'))},
   notify:message=>notices.push(message),
   fetch:async url=>url==='/punk-styles.json'?{ok:true,json:async()=>({styles:[]})}:url==='/api/config'
    ?{ok:configOK,json:async()=>({default_key:'test-local-key'})}
    :{ok:true,text:async()=>'example prompt'}
  };
  vm.createContext(sandbox);vm.runInContext(initSource,sandbox);await sandbox.init();
  return {fields,notices};
 }
 const loaded=await checkInit('','');
 assert.equal(loaded.fields['api-key'].value,'');
 assert.equal(loaded.fields['generate-prompt'].value,'example prompt');
 const entered=await checkInit('user-key','user prompt');
 assert.equal(entered.fields['api-key'].value,'user-key');
 assert.equal(entered.fields['generate-prompt'].value,'user prompt');
 const unavailable=await checkInit('','',false);
 assert.equal(unavailable.fields['api-key'].value,'');
 assert.equal(unavailable.fields['generate-prompt'].value,'example prompt');
 assert.equal(unavailable.notices.length,1);
 console.log('Key 不自动填入、用户输入保留和配置失败处理检查通过');
})().catch(error=>{console.error(error);process.exitCode=1;});
