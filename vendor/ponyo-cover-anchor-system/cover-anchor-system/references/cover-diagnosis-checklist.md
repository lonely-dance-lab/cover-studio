# Cover Diagnosis Checklist

Use this file when the user asks why a cover does not work, wants a redesign direction, or provides an existing Xiaohongshu / WeChat cover for critique.

## Contents

- Fast Diagnosis Output Format
- 10-Point Audit
  - Template Match
  - One-Glance Promise
  - Visual Anchor
  - Anchor Position
  - Thumbnail Test
  - Text Hierarchy
  - Color Contrast
  - Text Length
  - Trust Signal
  - Platform Fit
- Common Problems And Fixes
- Redesign Recipe
- Headline Rewrite Patterns
- Thumbnail Test Prompt

## Fast Diagnosis Output Format

Return the critique in this structure:

```markdown
## Diagnosis

Template fit: <conflict / number / screenshot / emotion / mixed>
Main problem: <one sentence>
Click risk: <why users may skip it in the feed>

## Scores

- Information density: <1-10>
- Visual anchor: <1-10>
- Thumbnail readability: <1-10>
- Color contrast: <1-10>
- Trust / realism: <1-10>

## Fix Plan

1. <highest-impact change>
2. <second change>
3. <third change>

## Replacement Prompt

<a ready-to-use finished-cover prompt>
```

Keep the diagnosis direct. Do not flatter weak covers.

## 10-Point Audit

### 1. Template Match

Ask: does the cover use the right template for the content?

| Content type | Good template | Bad sign |
|---|---|---|
| Strong opinion / mistake correction | Conflict | Too soft, no tension |
| Step tutorial / checklist | Number | No clear number anchor |
| Case / proof / tool review | Screenshot | Looks too fictional |
| Story / emotion / lifestyle | Emotion | Too much technical clutter |
| Product / service | Conflict or screenshot | No proof, only slogan |

### 2. One-Glance Promise

The viewer should understand the benefit in under 3 seconds.

Good:
- "3 个封面锚点"
- "工具测评这样做"
- "改前 VS 改后"

Weak:
- abstract slogans
- long article titles
- clever but unclear metaphors
- subtitles that carry the real benefit while the main title says nothing

### 3. Visual Anchor

There must be one dominant stop point:

- face
- giant number
- phone/screenshot
- before/after split
- dashboard result
- object with strong silhouette

If everything has equal weight, the cover has no anchor.

### 4. Anchor Position

Best default positions:

- Top third: headline
- Center: number / comparison / phone
- Lower center: face / product / object
- Upper-left: small category tag

Avoid placing the most important anchor in the bottom-right corner unless the layout deliberately leads the eye there.

### 5. Thumbnail Test

Shrink the cover to roughly 80px wide.

Pass:
- main headline still readable
- one anchor still obvious
- color blocks remain distinct

Fail:
- headline turns into texture
- screenshot details disappear
- low-contrast light text vanishes
- more than two text clusters compete

### 6. Text Hierarchy

Use a 3-level hierarchy:

1. Main headline: 60-75% of text weight
2. Support line: 20-30%
3. Tag/label: 5-10%

If the tag is more eye-catching than the headline, reduce it.

### 7. Color Contrast

Minimum:

- headline vs background: 4.5:1
- thumbnail mode: aim for 7:1
- light healing covers still need dark enough text

Safe contrast pairs:

- black / yellow
- white / red
- white / dark blue
- black / coral
- dark green / cream

Risky pairs:

- pale green / white
- beige / light gray
- red / orange
- blue / purple without white separation

### 8. Text Length

Recommended main headline length:

- Conflict: 6-12 Chinese characters
- Number: number + 4-10 characters
- Screenshot: 8-14 characters
- Emotion: 4-10 characters

If the title is longer than 16 Chinese characters, split it:

- Cover headline: short, blunt, benefit-led
- Support line: proof/context
- Body title: full article title

### 9. Trust Signal

Choose a trust signal by template:

- Conflict: confident face, strong title, clear stance
- Number: concrete count, simple promise
- Screenshot: believable UI/mockup, annotation marks
- Emotion: authentic expression and natural scene

Avoid fake screenshots with dense unreadable UI, fake brand logos, or invented revenue numbers.

### 10. Platform Fit

Xiaohongshu covers are scanned fast and small.

Default:

- 3:4 vertical
- 1080 x 1440 style
- heavy headline
- fewer than 3 text regions
- no explanatory paragraphs

WeChat hero images are wider and should use fewer huge objects, more horizontal balance.

## Common Problems And Fixes

| Problem | Diagnosis | Fix |
|---|---|---|
| Looks pretty but not clickable | weak information density | rewrite headline around benefit |
| Lots of text, no focus | no visual anchor | choose one anchor and enlarge it |
| Screenshot cover feels fake | too polished / no annotation | add hand-drawn marks and realistic shadow |
| Healing cover unreadable | low contrast | darken text or add translucent text band |
| AI tool cover generic | no proof or category | use screenshot/tech number template |
| Emotion cover feels like stock photo | weak subject expression | crop tighter on face or add a direct headline |
| Design tutorial looks like article slide | explanatory layout | turn it into a real cover case, not a diagram |

## Redesign Recipe

When redesigning, follow this order:

1. Rewrite the cover headline first.
2. Pick one template, not a hybrid unless necessary.
3. Pick one anchor.
4. Choose two dominant colors and one accent.
5. Decide title position.
6. Generate a complete finished cover prompt from `finished-cover-prompts.md`.
7. Run the 80px thumbnail test.

## Headline Rewrite Patterns

Use these when the existing title is too long or abstract:

```text
不要再 <wrong behavior>
```

```text
<number> 个 <result> 方法
```

```text
改前 VS 改后
```

```text
<tool/product> 这样用
```

```text
先别 <common mistake>
```

```text
<emotional state>，然后呢
```

## Thumbnail Test Prompt

Use this when asking an image model to self-correct:

```text
Revise the cover so it passes an 80px thumbnail test: the main headline remains readable, one visual anchor dominates, color contrast is stronger, and all secondary text is reduced or removed.
```
