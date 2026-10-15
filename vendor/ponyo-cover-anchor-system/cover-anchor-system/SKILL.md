---
name: cover-anchor-system
description: 波妞小红书强钩子爆款封面。小红书/公众号封面「信息密度 × 视觉锚点」设计系统。Use when the user wants Xiaohongshu covers, WeChat article covers, social-media title images, cover diagnosis, cover redesign, click-through-rate improvement, visual-anchor planning, cover color/type hierarchy, doodle-outline fresh covers, sunlit scrapbook cutout photo-collage covers, or ChatGPT Image 2 prompts for complete finished covers. Outputs template choice, anchor layout, color and type hierarchy, finished-cover generation prompts, and critique/checklist guidance.
---

# 波妞小红书强钩子爆款封面

## 核心逻辑

封面要解决的从来不是「好看」，是3秒内让人决定要不要点进来。

决定点击率的只有两个变量：
- **信息密度**：利益点在缩略图里清不清楚
- **视觉锚点**：有没有一个位置让眼睛「停住」

---

## Default Behavior

Unless the user explicitly asks for a text-free background, design a **complete finished cover**: title text, tag, visual anchor, color blocks, subject, and layout should all be generated in one image prompt.

Do not default to HTML/CSS mockups or background-only assets for social covers.

Do not hard-code the author's watermark, logo, `波妞`, `PONYO`, or any `@` handle into generated covers. If the user provides their own account mark, include only that user-provided mark; otherwise generate a clean cover with no watermark. The skill's attribution belongs in the repository/README, not inside default output images.

## Operating Flow

1. Identify the content type, audience, platform, and existing title.
2. Pick one template from the matrix below.
3. Read the relevant reference file:
   - New complete cover: `references/finished-cover-prompts.md`
   - Doodle-outline fresh cover: `references/doodle-outline-fresh-style.md`
   - Sunlit scrapbook cutout cover: `references/sunlit-scrapbook-cutout-style.md`
   - Existing cover critique/redesign: `references/cover-diagnosis-checklist.md`
   - Template measurements/colors: `references/template-formulas.md`
   - Text-free background assets only: `references/image-prompts.md`
4. Output a concise cover plan plus a ready-to-use image prompt.
5. If the user provided an existing cover, score it and give a replacement prompt.

---

## 模板选择矩阵

| 内容类型 | 推荐模板 | 核心锚点 |
|---------|---------|---------|
| 知识/观点/方法论 | 冲突型 | 人脸 + 标题撞色区 |
| 干货/教程/步骤 | 数字型 | 大号数字本身 |
| 案例/结果/对比 | 截图型 | 截图内容 + 标注箭头 |
| 情感/生活/故事 | 情绪型 | 人脸（天然最强锚点）|
| 品牌/产品/工具 | 冲突型 or 截图型 | 视情况选 |
| 旅行/家居/Vlog/Citywalk | 涂鸦描边小清新 | 真实照片主体 + 白色描边 + 手帐贴纸标题 |
| 旅行/穿搭/护肤/居家运动/生活方式 | 阳光胶片拼贴白描边 | 顶部胶片条 + 人物白描边 + 手写刷字标题 |

---

## 模板与风格一览

### 🔴 冲突型
反直觉标题 × 强对比色 × 人物遮罩
→ 适合：知识类、观点类、AI工具介绍

### 🟡 数字型
大号数字锚点 × 色块分割 × 悬念副标题
→ 适合：干货类、教程类、成果展示

### 🟢 截图型
真实截图遮罩 × 手写感标注 × 低饱和底色
→ 适合：案例类、前后对比、工具测评

### 🔵 情绪型
全出血人物图 × 单行大字 × 撞色条
→ 适合：情感类、生活类、vlog封面

### 🟣 涂鸦描边小清新
真实照片 × 白色描边 × 手帐贴纸标题
→ 适合：旅行、家居、日常Vlog、Citywalk、咖啡探店

### 🟤 阳光胶片拼贴白描边
阳光实拍 × 顶部胶片拼贴 × 人物白描边 × 手写刷字标题
→ 适合：旅行 Vlog、穿搭、护肤、居家运动、生活方式教程

---

## 输出规范

每次给出封面方案，必须包含：
1. **模板类型** + 选择理由
2. **锚点位置** — 精确描述（上1/3 / 中心 / 左下角等）
3. **配色方案** — 主色 + 撞色 + 底色（附 HEX 色值）
4. **字重层级** — 主标题 / 副标题 / 角标的视觉权重比
5. **ChatGPT Image 2 生图提示词** — 默认是完整成品封面提示词，包含准确中文文字

When diagnosing an existing cover, additionally include:

- information density score
- visual anchor score
- thumbnail readability score
- top 3 fixes
- replacement finished-cover prompt

---

## 参考文件

- `references/template-formulas.md` — 基础模板参数表（锚点规则、配色阈值、字重比）
- `references/finished-cover-prompts.md` — 多种完整成品封面 ChatGPT Image 2 提示词
- `references/doodle-outline-fresh-style.md` — 涂鸦描边小清新封面风格包（旅行/家居/Vlog/Citywalk）
- `references/sunlit-scrapbook-cutout-style.md` — 阳光胶片拼贴白描边封面风格包（旅行/穿搭/护肤/运动/生活方式）
- `references/cover-diagnosis-checklist.md` — 旧封面诊断、打分、改版规则
- `references/image-prompts.md` — 旧版 text-free 背景素材提示词，仅在用户明确要后期叠字时使用

---

## 平台尺寸规范

| 平台 | 封面比例 | 推荐尺寸 |
|------|---------|---------|
| 小红书封面 | 3:4 | 1080 × 1440px |
| 小红书正方 | 1:1 | 1080 × 1080px |
| 公众号头图 | 3:1 | 900 × 383px |
| 公众号次图 | 1:1 | 500 × 500px |

ChatGPT Image 2 / DALL-E 生图时在提示词里明确写比例和中文文字。小红书默认 3:4，公众号头图默认 3:1。

## Quality Bar

Every cover must pass these checks:

- Main headline remains readable when viewed as an 80px-wide thumbnail.
- The viewer sees one dominant anchor before any secondary detail.
- The cover headline is shorter than the article title and benefit-led.
- There are no dense explanatory paragraphs.
- Chinese text is large, crisp, and not garbled.
- No fake logos, fake QR codes, or invented revenue/data claims unless the user provides them.
- No hard-coded `波妞`, `PONYO`, logo, creator signature, or `@` handle unless the user explicitly provides their own account mark.
