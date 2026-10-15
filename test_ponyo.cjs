const assert=require('node:assert/strict');
const cover=require('./static/ponyo-cover.js');
const base={topic:'AI 视频教程',audience:'新手创作者',title:'5个AI视频提示词公式',support:'新手直接套用',tag:'AI创作',ratio:'3:4',type:'tutorial',template:'auto'};
const result=cover.compile(base);
assert.equal(result.template,'number');assert.equal(result.ratio,'3:4');
assert.ok(result.prompt.includes('5个AI视频提示词公式'));
assert.ok(result.plan.colors.every(c=>/^#[\da-f]{6}$/i.test(c)));
assert.ok(result.plan.weight&&result.plan.anchor&&result.plan.reason);
for(const style of cover.templates){const item=cover.compile({...base,template:style.id,title:style.id==='emotion'?'一个人也很好':base.title});assert.equal(item.template,style.id);assert.ok(item.prompt.length<16000);}
assert.equal(cover.compile({...base,title:'新手入门指南'}).template,'conflict');
assert.throws(()=>cover.compile({...base,template:'number',title:'新手入门指南'}),/明确数量/);
assert.throws(()=>cover.compile({...base,title:''}),/标题/);
assert.throws(()=>cover.compile({...base,template:'emotion'}),/8 字/);
assert.equal(cover.compile({...base,type:'travel',ratio:'1:1'}).template,'doodle');
assert.equal(cover.compile({...base,type:'lifestyle'}).template,'scrapbook');
assert.ok(cover.compile({...base,account:'我的创作日记'}).prompt.includes('账号署名："我的创作日记"'));
assert.ok(cover.compile({...base,template:'screenshot'}).prompt.includes('只生成抽象图形示意卡片'));
assert.ok(result.prompt.includes('不添加账号署名或水印'));
console.log('Ponyo 六类模板、自动选择、文案保留、署名和输入校验通过。');
