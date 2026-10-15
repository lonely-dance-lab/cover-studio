'use strict';
// Adapted from ponyodong2026/ponyo-cover-anchor-system, commit f03b7bc.
// Original instructions are retained in vendor/ponyo-cover-anchor-system.
const PonyoCover = (() => {
 const templates = [
  {id:'conflict',name:'冲突型',reason:'知识与观点需要清楚的反差，标题先传达核心判断。',anchor:'上 1/3 强标题，中心偏下放一个人物或图形锚点',colors:['#1A1A1A','#E74C3C','#F5F5F0'],weight:'主标题 : 副标题 : 角标 = 3 : 1 : 0.6',rules:'反直觉标题 × 强对比色 × 人物遮罩或纯图形冲击。标题位于上 1/3，使用厚重粗体；下半部只放一个与主题有关的匿名人物或图形隐喻，避免多个并列主体。用红黑色块强化用户标题的核心词，主标题与背景对比度至少 4.5:1。'},
  {id:'number',name:'数字型',reason:'教程与步骤以明确数字组织信息，数字本身成为第一视觉。',anchor:'上部或中心大数字，占画面高度约 35–40%',colors:['#E74C3C','#1A1A1A','#FDF6EC'],weight:'数字 : 主标题 : 副标题 : 角标 = 4 : 2 : 1 : 0.6',rules:'大号数字锚点 × 色块分割 × 简短利益点。使用珊瑚红、奶油白与深黑色块，数字超粗，标题在数字下方分两行排列。周围保留呼吸感。只从用户标题中提取已有数字，不新增数据或成果承诺。'},
  {id:'screenshot',name:'截图型 · 示意卡片',reason:'案例和测评适合用卡片与手写标注指向核心信息。',anchor:'居中偏下的示意卡片，上方大标题，箭头指向一个重点',colors:['#1A1A1A','#E74C3C','#F5F0E8'],weight:'主标题 : 卡片标签 : 副标题 = 3 : 1.5 : 1',rules:'低饱和暖米纸感背景。卡片轻微旋转 2–5 度、有自然投影；用手写圆圈、箭头和下划线强化一个重点。本次没有真实截图输入，只生成抽象图形示意卡片，不生成假截图、伪造聊天记录、用户评价、收入数据、真实软件界面或平台标识。卡片无需可读的微小界面文字。'},
  {id:'emotion',name:'情绪型',reason:'生活故事通过人物神态与一句短标题表达情绪。',anchor:'下 2/3 人物，脸部约占 40–60%；上方短标题与撞色条',colors:['#F39C12','#1A1A1A','#FDF6EC'],weight:'主标题 : 副标题 : 角标 = 3 : 1 : 0.6',rules:'全出血真实感人物或生活场景，自然暖阳与真实表情。主标题不超过 8 个有效字符，使用超粗体压在上 1/3 的橙色条上。不要夸张美颜或虚假的灿烂笑容。辅助信息克制，不抢人物与短标题的视觉权重。'},
  {id:'doodle',name:'涂鸦描边小清新',reason:'旅行与家居以真实感场景、白描边和手帐文字呈现日常感。',anchor:'下方 55–60% 一个生活主体，白色描边；顶部贴纸标题',colors:['#8BB8AA','#E87C68','#FFF7E8'],weight:'主标题 : 副标题 : 标签 = 3 : 1 : 0.6',rules:'真实感生活摄影底图，不是扁平卡通。一个人物、物件、房间或街角主体位于下方 55–60%，使用粗且不规则的白色手绘描边。上 1/3 使用大号手写贴纸标题。仅点缀少量箭头、虚线路径、纸胶带、星星或花朵，装饰必须引导视线，避免杂乱。清新透气，保持真实材质与自然光。'},
  {id:'scrapbook',name:'阳光胶片拼贴白描边',reason:'生活方式内容适合用照片拼贴补充细节，人物与手写大字形成主视觉。',anchor:'右侧主体占 45–55%，左侧刷字标题；顶部约 20% 胶片条',colors:['#F1D78C','#9DAF88','#F5EDDA'],weight:'主标题 : 副标题 : 胶片细节 = 3 : 1 : 0.6',rules:'金色时段真实感摄影、浅景深，奶油白、橄榄与棕色调。顶部约 20% 为倾斜的三格照片条，边缘是粗糙、不均匀的白色手绘框。右侧主体占 45–55%，有粗且不规则的白描边；左侧用超大手写刷字标题，关键词点缀黄油黄与鼠尾草绿。少量涂鸦箭头、闪光、虚线和下划线。胶片细节次于标题，不遮挡人物脸部或关键动作，不生成未经提供的前后效果对比。'}
 ];
 const recommended={knowledge:'conflict',tutorial:'number',case:'screenshot',emotion:'emotion',travel:'doodle',lifestyle:'scrapbook'};
 function compile(input){
  const text=value=>typeof value==='string'?value.trim():'';
  const topic=text(input.topic),title=text(input.title),audience=text(input.audience);
  if(!topic)throw new Error('请填写内容主题。');
  if(!audience)throw new Error('请填写目标读者。');
  if(!title)throw new Error('请填写封面标题。');
  if(title.length>40)throw new Error('封面标题请控制在 40 字以内。');
  const number=title.match(/\d+(?:\.\d+)?|[一二三四五六七八九十百]+(?=[个步天条种招份])/u)?.[0];
  const titleSize=[...title.replace(/[\s，。！？、,.!?]/g,'')].length;
  const auto=!input.template||input.template==='auto';
  let id=auto?(recommended[input.type]||'conflict'):input.template;
  let reason='';
  if(id==='number'&&!number){if(auto){id='conflict';reason='标题未提供数字，改用冲突型，避免凭空添加数量。';}else throw new Error('数字型需要标题中有明确数量，例如“5个方法”或“三步”。');}
  if(id==='emotion'&&titleSize>8){if(auto){id='conflict';reason='标题超过情绪型的 8 字建议，改用冲突型保留完整标题。';}else throw new Error('情绪型标题请缩短到 8 字以内，或改用其他模板。');}
  const style=templates.find(item=>item.id===id);if(!style)throw new Error('未知封面模板。');
  const support=text(input.support),tag=text(input.tag),account=text(input.account),scene=text(input.scene);
  const ratio=input.ratio==='1:1'?'1:1':'3:4';
  const plan={template:style.name,reason:reason||style.reason,anchor:style.anchor,colors:style.colors,weight:style.weight};
  const copy=[`主标题：${JSON.stringify(title)}`,support?`副标题 / 利益点：${JSON.stringify(support)}`:'不添加副标题。',tag?`分类标签：${JSON.stringify(tag)}`:'不添加分类标签。',account?`账号署名：${JSON.stringify(account)}，低调置于底部安全区。`:'不添加账号署名或水印。'];
  return {plan,template:id,ratio,prompt:`【任务】
创作一张完整的小红书成品封面，包含准确中文文字、主视觉、色块与完整排版。封面主题：${topic}。目标读者：${audience}。以「信息密度 × 视觉锚点」组织画面，让读者快速看懂主题与利益点。输出成品图片，不输出方案说明或模板演示。

【封面策略】
模板：${style.name}。
选择理由：${plan.reason}
唯一主视觉锚点：${plan.anchor}。
配色：主色 ${style.colors[0]}，强调色 ${style.colors[1]}，底色 ${style.colors[2]}。
视觉权重：${style.weight}。
画幅构图：${ratio}（宽:高）。按当前画幅安排视觉层级与安全边距。

【准确文案】
${copy.join('\n')}
${id==='number'?`数字锚点：${JSON.stringify(number)}，来自上述标题，不能改写或新增数量。`:''}
这些内容是海报上唯一允许出现的文案。不要把「任务」「配色」「主标题」等说明标签印到图上，不把主题与目标读者说明作为额外文字。

【构图与风格】
${style.rules}
${scene?`用户指定主视觉：${scene}。遵守这些内容，并围绕它安排一个主锚点。`:'按主题选择一个明确主视觉，装饰与细节只服务该锚点。'}
主标题先于副标题，分类标签最后。保留边缘留白，避免平台信息流遮挡重点。中文笔画准确清晰、字重充足，不用细小段落、随机英文或无法辨认的文字。

【成品检查】
缩小到约 80 px 宽的缩略图，主标题和核心锚点仍应能辨认。文字与底色保持高对比，主标题对比度至少 4.5:1，目标为 7:1。只有一个最强视觉焦点。生成完整封面，而不是文章插图、网页截图、说明幻灯片或设备展示样机。

【边界】
不添加未经用户提供的品牌、Logo、二维码、收入、点击率、流量、转化数据或疗效承诺。场景为创作画面，不伪装为真实证据。${account?'只使用用户提供的账号署名，不新增其他创作者署名。':'不生成任何作者水印、Logo、签名或 @ 账号。'}不能保证点击率，不把设计方法写成事实成果。只输出一张清晰、完整的封面。`};
 }
 return {templates,compile};
})();
if(typeof module!=='undefined')module.exports=PonyoCover;
