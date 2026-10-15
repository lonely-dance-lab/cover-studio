# Text-Free Background Prompt Library

This is the legacy background-only prompt library. Use it only when the user explicitly wants to generate a text-free background and add typography manually later.

For normal Xiaohongshu / WeChat cover work, use `finished-cover-prompts.md` instead. Finished cover prompts include Chinese headline text, tags, badges, and the full cover composition.

## 使用说明

1. 所有提示词均为英文，直接复制进 ChatGPT（DALL-E 3）使用
2. 提示词末尾可附加比例说明：
   - 小红书封面：加 `in a 3:4 portrait aspect ratio`
   - 公众号头图：加 `in a 16:9 landscape banner format`
   - 正方形：加 `in a 1:1 square format`
3. 所有提示词均已注明「no text」，生成背景图后自行叠加文字
4. 生成后如不满意，重新生成即可（DALL-E 3 每次都会有差异）

---

## 🔴 冲突型提示词（3个子风格）

### 冲突型-A：博主人物版
> 适合：知识博主、IP建立、有人物出镜的内容

```
Editorial portrait photography of a confident Asian female content creator, 
looking directly into camera with a strong, assertive expression, 
positioned at lower-center of frame with face occupying 50% of composition, 
bold color-blocked background: deep crimson red (#C0392B) fills upper 65% 
and clean off-white (#F7F7F7) fills lower 35%, hard horizontal division, 
dramatic top-down studio lighting with strong shadows under chin, 
upper third of image is completely empty for headline text overlay, 
no text, no watermarks, no logos, magazine editorial cover style, 
high contrast, sharp focus on face, shallow depth of field on background, 
in a 3:4 portrait aspect ratio
```

### 冲突型-B：纯视觉版
> 适合：无人物出镜的内容、工具介绍、方法论分享

```
Bold minimalist graphic poster design for social media cover, 
high contrast color blocking composition, 
electric yellow (#F1C40F) diagonal band cuts across deep matte black (#1A1A1A) background, 
geometric precision, crisp hard edges between colors, 
large central area completely empty and ready for text overlay, 
no text, no symbols, no icons, no patterns, 
modern Swiss editorial design aesthetic, 
flat 2D design, perfectly clean execution, 
slight paper texture overlay for premium feel, 
in a 3:4 portrait aspect ratio
```

### 冲突型-C：对比实物版
> 适合：产品测评、前后对比、工具对比内容

```
Professional overhead flat lay photography, 
two objects side by side creating visual tension: 
left side shows old/worn/dull version, right side shows new/vibrant/improved version, 
clean white marble surface with subtle natural veining, 
soft diffused natural window light from upper left, 
perfect color contrast between two objects, 
empty space at top 30% of image for title overlay, 
minimal composition with intentional negative space, 
no text, no labels, no watermarks, 
high-end lifestyle product photography style, 
in a 3:4 portrait aspect ratio
```

---

## 🟡 数字型提示词（3个子风格）

### 数字型-A：极简色块版
> 适合：干货教程、攻略、步骤类内容

```
Ultra-minimal flat design background for social media cover, 
bold horizontal color block division: 
vivid coral red (#E74C3C) fills bottom 45% with perfect clean edge, 
warm cream white (#FDF6EC) fills upper 55%, 
razor-sharp horizontal boundary between colors, 
extremely large empty center area reserved for giant numeral placement, 
no text, no numbers, no icons, no decorative elements, 
pure flat 2D graphic design, zero visual noise, 
the emptiness is intentional and essential, 
in a 3:4 portrait aspect ratio
```

### 数字型-B：质感纸张版
> 适合：手账感、生活技巧、亲和力强的干货

```
Authentic handmade craft paper texture background, 
warm beige and aged cream tones (#F5EDD6 to #E8D5B7), 
realistic paper grain with subtle fiber texture visible, 
slight natural color variations and imperfections, 
soft shadows suggesting slight paper curl at edges, 
warm golden afternoon light gently washing from upper right, 
completely empty central composition for overlay content, 
no text, no stamps, no ink marks, no lines, 
nostalgic artisan stationery aesthetic, 
in a 3:4 portrait aspect ratio
```

### 数字型-C：渐变科技版
> 适合：AI工具、科技内容、数据类干货

```
Dark futuristic gradient background for tech content, 
deep space blue (#0D1B2A) at bottom transitioning to dark violet (#1A0533) at top, 
subtle glowing particle field with tiny light dots scattered throughout, 
very faint geometric grid lines suggesting data visualization, 
luminous glow in center-upper area creating natural focal point, 
large empty space throughout for text and number overlay, 
no text, no UI elements, no charts, no icons, 
cinematic sci-fi aesthetic meets data visualization, 
premium digital atmosphere, 
in a 3:4 portrait aspect ratio
```

---

## 🟢 截图型提示词（3个子风格）

### 截图型-A：手机框架版
> 适合：APP测评、工具展示、操作步骤

```
Premium smartphone product mockup photography, 
modern thin-bezel smartphone floating at slight 5-degree angle, 
phone screen is completely blank and dark/empty ready for screenshot placement, 
soft realistic drop shadow beneath device, 
background: smooth gradient from soft lavender (#E8E0F5) to light periwinkle (#D4E6F7), 
professional product photography lighting, three-quarter view angle, 
generous empty space around phone for text placement, 
no screen content, no UI, no text anywhere, no reflections on screen, 
clean commercial product shot style, 
in a 3:4 portrait aspect ratio
```

### 截图型-B：对话框氛围版
> 适合：截图分享、对话截图、用户评价展示

```
Minimalist chat conversation UI mockup illustration, 
three empty rounded rectangle chat bubbles arranged vertically, 
suggesting a conversation flow without any actual text, 
two bubbles in soft mint green (#B2DFDB) on right side, 
one bubble in light gray (#F0F0F0) on left side, 
clean white background with very subtle shadow, 
modern messaging app aesthetic, 
plenty of empty space above bubbles for title text, 
all bubbles completely empty, no text, no emoji, no timestamps, 
flat vector illustration style, 
in a 3:4 portrait aspect ratio
```

### 截图型-C：数据面板版
> 适合：数据展示、成果炫耀、前后对比数据

```
Clean SaaS dashboard mockup background design, 
modern analytics interface aesthetic with empty placeholder cards, 
white card panels with subtle box shadows on light gray (#F4F6F9) background, 
empty rectangular spaces suggesting charts, graphs, and statistics panels, 
thin border radius cards in clean grid layout, 
subtle blue accent lines suggesting growth charts, 
all panels and charts completely empty, no numbers, no text, no data points, 
professional fintech or analytics platform visual style, 
space at top for headline overlay, 
in a 3:4 portrait aspect ratio
```

---

## 🔵 情绪型提示词（3个子风格）

### 情绪型-A：人物特写版
> 适合：情感类、个人成长、自我表达内容

```
Cinematic portrait photography with strong emotional atmosphere, 
Asian woman in her late 20s, authentic contemplative expression, 
face positioned at lower-center occupying 55% of frame, 
upper third completely empty for text overlay, 
warm golden hour backlighting creating soft rim light around hair, 
beautiful bokeh background in warm amber and gold tones, 
shallow depth of field, 
film photography aesthetic with slight grain, 
warm color grading (#D4956A, #C8874F tones), 
authentic raw emotion, no artificial smile, 
no text, no watermarks, 
in a 3:4 portrait aspect ratio
```

### 情绪型-B：生活场景版
> 适合：生活方式、日常vlog、城市生活内容

```
Atmospheric lifestyle photography in a cozy independent cafe, 
warm ambient evening light from string lights and candles, 
shallow depth of field with bokeh background, 
single coffee cup and open journal on foreground table surface, 
blurred silhouette of person sitting alone in soft background, 
moody autumnal color palette: deep amber, warm brown, soft orange, 
cinematic widescreen composition cropped to portrait, 
emotionally resonant quiet solitude atmosphere, 
no text, no readable signs, no logos, 
in a 3:4 portrait aspect ratio
```

### 情绪型-C：纯氛围版
> 适合：治愈系内容、冥想、心理健康类

```
Dreamy abstract atmospheric photography, 
soft morning light rays breaking through sheer white linen curtains, 
gentle lens flare and light diffusion effect, 
high key brightness with soft overexposure, 
pale cream and soft white color palette (#FAFAFA, #F0EDE8), 
completely minimal and empty composition, 
no person, no objects, just light and texture, 
meditative and contemplative mood, 
vast empty space throughout entire image for text overlay, 
fine art photography aesthetic, 
in a 3:4 portrait aspect ratio
```

---

## 公众号头图适配说明

公众号头图比例为 3:1 横版，将上方所有提示词末尾的比例说明替换为：

```
in a 3:1 ultra-wide banner format, landscape orientation, 
subject positioned in left or center third, 
right portion left empty for text overlay
```

横版特别注意：
- 主体（人物/数字/截图）应置于左侧或中央
- 右侧或左侧留出 1/3 作为文字叠加区
- 情绪型人物建议换成「左侧构图，头肩入画，右侧留白」

---

## 进阶调整指令

在基础提示词后可追加以下调整语句：

| 想要的效果 | 追加语句 |
|----------|---------|
| 更温暖 | `warmer color temperature, golden tones` |
| 更现代 | `ultra modern, 2024 design trends` |
| 更高端 | `luxury aesthetic, premium quality` |
| 更接地气 | `authentic, candid, real life feel` |
| 更有质感 | `film grain texture, analog photography` |
| 更干净 | `ultra clean, minimal, white space` |
| 暗色系 | `dark mode aesthetic, deep shadows` |
| 明亮活泼 | `bright, vibrant, high saturation, energetic` |
