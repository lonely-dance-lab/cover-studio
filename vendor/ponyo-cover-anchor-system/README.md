# 波妞小红书强钩子爆款封面

小红书 / 公众号封面「信息密度 × 视觉锚点」生成系统。

封面要解决的从来不是“好看”，而是让用户在信息流里 3 秒内决定：这条内容和我有没有关系。

Made by 波妞 PONYO. 作者归属只放在 skill 文档和仓库说明里；默认生成的封面不会硬塞“波妞”水印，用户可以自行提供自己的账号署名。

![12 cover cases](examples/cover-cases/preview_12_final.jpg)

![doodle outline fresh cases](examples/doodle-outline-fresh/preview_4_doodle_fresh.jpg)

## What It Does

输入主题、目标人群和内容类型后，这个 skill 会输出：

- 推荐封面模板
- 锚点位置
- 配色方案
- 字重层级
- 可直接用于 ChatGPT Image 2 / DALL-E 的完整成品封面提示词
- 涂鸦描边小清新风格提示词（旅行 / 家居 / Vlog / Citywalk）
- 阳光胶片拼贴白描边风格提示词（旅行 / 穿搭 / 护肤 / 居家运动 / 生活方式）
- 旧封面诊断和改版建议
- 排版指导

## Core Formula

点击率主要由两个变量决定：

- **信息密度**：利益点在缩略图里是否一眼看清
- **视觉锚点**：画面里是否有一个让眼睛停住的位置

## Cover Templates And Styles

| Template | Formula | Best For |
|---|---|---|
| 冲突型 | 反直觉标题 × 强对比色 × 人物遮罩 | 知识、观点、AI 工具 |
| 数字型 | 大号数字锚点 × 色块分割 × 悬念副标题 | 干货、教程、步骤 |
| 截图型 | 真实截图遮罩 × 手写感标注 × 低饱和底色 | 案例、结果、测评 |
| 情绪型 | 全出血人物图 × 单行大字 × 撞色条 | 情感、生活、故事 |
| 涂鸦描边小清新 | 真实照片 × 白色描边 × 手帐贴纸标题 | 旅行、家居、Vlog、Citywalk |
| 阳光胶片拼贴白描边 | 阳光实拍 × 顶部胶片条 × 人物白描边 × 手写刷字 | 旅行、穿搭、护肤、运动、生活方式 |

## Workflows

### 1. Generate a Finished Cover

Use `cover-anchor-system/references/finished-cover-prompts.md`.

This is the default workflow. It asks ChatGPT Image 2 to generate a complete social-media cover in one image, including:

- Chinese headline
- category tag
- supporting badge
- main visual anchor
- color blocks
- screenshot / number / portrait / emotion scene

### 2. Diagnose and Redesign a Cover

Use `cover-anchor-system/references/cover-diagnosis-checklist.md`.

This workflow scores an existing cover on:

- information density
- visual anchor
- thumbnail readability
- color contrast
- trust / realism

It then returns the top fixes and a replacement finished-cover prompt.

### 3. Generate a Doodle-Outline Fresh Cover

Use `cover-anchor-system/references/doodle-outline-fresh-style.md`.

This workflow creates fresh 3:4 Xiaohongshu covers for travel, home decor, daily vlog, citywalk, cafe, and other lifestyle topics:

- realistic lifestyle photo base
- thick white doodle outline around the visual anchor
- handwritten sticker headline
- sparse arrows, route lines, tape labels, hearts, stars, flowers, and small icons
- no hard-coded author watermark by default

### 4. Generate a Sunlit Scrapbook Cutout Cover

Use `cover-anchor-system/references/sunlit-scrapbook-cutout-style.md`.

This workflow creates warm lifestyle covers inspired by sunlit scrapbook photo collages:

- golden-hour realistic photography
- tilted top photo strip with rough white hand-drawn borders
- main subject on the right with thick irregular white cutout outline
- oversized handwritten brush Chinese title on the left
- butter-yellow and sage-green keyword highlights
- sparse doodle arrows, hearts, sparkles, dashed paths, and underlines
- no hard-coded author watermark by default

## Repository Structure

```text
cover-anchor-system/
  SKILL.md
  references/
    template-formulas.md
    finished-cover-prompts.md
    doodle-outline-fresh-style.md
    sunlit-scrapbook-cutout-style.md
    cover-diagnosis-checklist.md
    image-prompts.md
examples/
  cover-cases/
    preview_12_final.jpg
    01_*.png ... 12_*.png
  doodle-outline-fresh/
    preview_4_doodle_fresh.jpg
    01_*.png ... 04_*.png
```

## Install

Copy the `cover-anchor-system` folder into your local skills directory, then call it when designing covers:

```text
~/.codex/skills/cover-anchor-system
```

Or read `cover-anchor-system/SKILL.md` directly and use the prompt library inside `references/finished-cover-prompts.md`.

## Size Reference

| Platform | Ratio | Recommended Size |
|---|---:|---:|
| 小红书封面 | 3:4 | 1080 × 1440px |
| 小红书正方 | 1:1 | 1080 × 1080px |
| 公众号头图 | 3:1 | 900 × 383px |
| 公众号次图 | 1:1 | 500 × 500px |

## Example Cases

The `examples/cover-cases` folder contains 12 ChatGPT Image 2 cover examples:

- 3 conflict-style covers
- 3 number-style covers
- 3 screenshot-style covers
- 3 emotional-style covers

These examples are included to show the intended visual output: real social-media covers, not explanatory slides or article illustrations.

The `examples/doodle-outline-fresh` folder contains 4 fresh doodle-outline cases:

- travel vlog
- cozy home decor
- daily vlog
- citywalk

The `sunlit-scrapbook-cutout-style.md` reference contains prompt templates for:

- travel / Citywalk
- outfit / fashion
- skincare / beauty
- home workout / wellness

## Quick Prompt

```text
Use $cover-anchor-system to create a Xiaohongshu cover for:
Topic: AI video prompts
Audience: beginner creators
Goal: make people click from the feed
Title: 5个AI视频提示词公式
Style: tech, high contrast, complete finished cover with Chinese text
```

## Watermark Rule

The skill itself is credited to 波妞 PONYO in the repository and docs. Generated covers should not contain `波妞`, `PONYO`, logos, signatures, or `@` handles unless the user explicitly supplies their own account mark.

## Notes

`references/image-prompts.md` is kept for text-free background generation. For normal social-media publishing, prefer `references/finished-cover-prompts.md` because the cover should be a finished poster, not a blank background waiting for manual text overlay.
