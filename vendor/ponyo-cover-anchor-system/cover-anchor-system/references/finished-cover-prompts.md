# Finished Cover Prompts

Use this file when the user wants ChatGPT Image 2 / DALL-E to generate a complete Xiaohongshu cover image directly, including headline text, tags, labels, subject, layout, and visual hierarchy.

Do not use the older background-only prompts in `image-prompts.md` unless the user explicitly wants a text-free background for manual typography.

## Contents

- Universal Prompt Contract
- 1. Conflict Type
  - Creator Portrait
  - Pure Graphic Impact
  - Before/After Comparison
- 2. Number Type
  - Minimal Big Number
  - Paper Checklist
  - Tech Neon Number
- 3. Screenshot Type
  - Phone Frame Review
  - Chat Screenshot Proof
  - Data Result Panel
- 4. Emotion Type
  - Emotional Portrait
  - Lifestyle Scene
  - Healing Minimal Atmosphere
- 5. Lifestyle Photo Styles
  - Sunlit Scrapbook Cutout
- Final Prompt Add-ons

## Universal Prompt Contract

Every finished-cover prompt should include:

- Canvas: `3:4 vertical Xiaohongshu cover, 1080x1440 style`
- Exact readable Chinese copy
- Template type: conflict, number, screenshot, or emotion
- Main visual anchor and its position
- Text hierarchy: headline first, supporting text second, tag last
- Mobile readability: large title, thick strokes, high contrast
- Avoid list: no garbled Chinese, no tiny paragraphs, no fake logos, no watermark
- Default watermark rule: do not add `波妞`, `PONYO`, author logos, creator signatures, or `@` handles. If the user provides their own account mark, include only that user-provided mark; otherwise leave the cover clean.

Use this replacement pattern before sending a prompt:

```text
Topic: <content topic>
Audience: <target reader>
Exact headline: "<8-14 Chinese characters if possible>"
Support line: "<short benefit or proof>"
Tag: "<category label>"
Account mark: "<optional; leave blank unless the user provides one>"
```

If the user's headline is too long, create a short cover headline and keep the full title for post body copy.

## 1. Conflict Type

### A. Creator Portrait

Use for knowledge creators, opinions, AI tools, and "mistake correction" content.

```text
Create a finished 3:4 vertical Xiaohongshu cover poster, optimized for mobile feed readability.

Template: conflict-style cover.
Topic: <topic>.
Audience: <audience>.

Exact readable Chinese copy:
- Top-left tag: "<tag>"
- Main headline, huge bold Chinese type: "<headline>"
- Supporting badge: "<support line>"

Composition:
- A confident Asian female creator portrait occupies the lower 55% of the image, centered slightly right, direct eye contact, strong editorial expression.
- The main headline sits in the top third, left aligned, white thick-stroke characters with a dark shadow or black outline.
- Add a diagonal red-black brush block behind the headline for impact.
- Put the small tag in a compact dark label at the upper-left corner.

Style:
High-impact social media cover, red/black/off-white palette, magazine editorial portrait, sharp lighting, strong contrast, commercial poster finish.

Constraints:
The Chinese text must be crisp, readable, and correctly written. No garbled characters, no tiny paragraphs, no fake logos, no watermark, no QR code.
```

### B. Pure Graphic Impact

Use when there is no person or product image, and the cover needs pure visual force.

```text
Create a finished 3:4 vertical Xiaohongshu cover poster with complete typography.

Template: pure graphic conflict-style cover.
Topic: <topic>.
Audience: <audience>.

Exact readable Chinese copy:
- Tag: "<tag>"
- Main headline: "<headline>"
- Bottom badge: "<support line>"

Composition:
- Huge Chinese headline takes 60% of the canvas, centered and slightly tilted.
- Use a black background with electric yellow and cobalt blue diagonal blocks cutting through the page.
- Add rough sticker edges, speed lines, and small emphasis marks around the headline.
- Bottom badge is a small blue rounded rectangle with white text.

Style:
Bold poster typography, street editorial design, high contrast, energetic, not elegant or quiet.

Constraints:
Readable at thumbnail size, no extra random text, no fake logos, no watermark, no garbled Chinese.
```

### C. Before/After Comparison

Use for comparison, transformation, design critiques, case studies, and "before vs after" posts.

```text
Create a finished 3:4 vertical Xiaohongshu cover poster.

Template: before-after conflict cover.
Topic: <topic>.
Audience: <audience>.

Exact readable Chinese copy:
- Top tag: "<tag>"
- Main headline: "<headline>"
- Center comparison label: "改前 VS 改后"
- Supporting line: "<support line>"

Composition:
- Split the canvas into left "before" and right "after" panels.
- The left panel looks messy, dull, and low-contrast; the right panel looks clean, bright, and improved.
- Put a large "VS" in the center as the visual anchor.
- Main headline is at the top in bold black and red Chinese typography.
- Add hand-drawn arrows, circles, check/cross marks, and small emphasis strokes.

Style:
Practical case-study cover, bright white background, red/green accent marks, tactile desk or notebook details when relevant.

Constraints:
Text must be large and accurate. Avoid fake interface details unless the user provides them. No watermark, no QR code.
```

## 2. Number Type

### A. Minimal Big Number

Use for checklists, step-by-step tutorials, and beginner guides.

```text
Create a finished 3:4 vertical Xiaohongshu cover poster.

Template: number-style cover.
Topic: <topic>.
Audience: <audience>.

Exact readable Chinese copy:
- Tag: "<tag>"
- Giant number: "<number>"
- Main headline: "<headline>"
- Supporting line: "<support line>"

Composition:
- The giant number is the main visual anchor, occupying 35-45% of the image height.
- Place the number in the upper or center area, with a bold shadow and thick outline.
- Put the main headline under the number in two short lines.
- Use simple color-block composition with coral red, cream white, and black.

Style:
Minimal but loud, clean geometry, thick Chinese display typography, beginner-friendly tutorial cover.

Constraints:
No extra tiny copy. Main headline and number must remain readable at 80px thumbnail width. No garbled Chinese, no watermark.
```

### B. Paper Checklist

Use for lifestyle tips, friendly guides, creator routines, and softer teaching posts.

```text
Create a finished 3:4 vertical Xiaohongshu cover poster.

Template: warm paper number cover.
Topic: <topic>.
Audience: <audience>.

Exact readable Chinese copy:
- Tag: "<tag>"
- Giant number: "<number>"
- Main headline: "<headline>"
- Small label: "<support line>"

Composition:
- Warm handmade paper texture background.
- A large stitched or cut-paper number sits in the center as the anchor.
- Main headline is below the number in dark green or charcoal bold Chinese type.
- Add small hand-drawn arrows, tape, leaf marks, or checklist ticks without clutter.

Style:
Warm craft-paper, friendly, helpful, notebook-like, clean enough for mobile feed.

Constraints:
Keep all text large and accurate. No fake dense handwriting, no watermark, no random English.
```

### C. Tech Neon Number

Use for AI tools, data tutorials, prompts, and high-tech content.

```text
Create a finished 3:4 vertical Xiaohongshu cover poster.

Template: tech number cover.
Topic: <topic>.
Audience: <audience>.

Exact readable Chinese copy:
- Tag: "<tag>"
- Giant number: "<number>"
- Main headline: "<headline>"
- Bottom CTA badge: "<support line>"

Composition:
- Dark blue and violet futuristic background with a glowing giant number in the center.
- Main headline is stacked below the number with white and neon yellow typography.
- Add subtle circuit lines, particles, HUD glow, and depth, but do not create a complex dashboard.
- Bottom CTA badge is small, bright, and centered.

Style:
Premium AI tool cover, neon blue, electric purple, yellow accent, dramatic but readable.

Constraints:
Chinese typography must be crisp. No fake logos, no unreadable UI microtext, no watermark.
```

## 3. Screenshot Type

### A. Phone Frame Review

Use for app reviews, AI tools, workflow demos, and operation tutorials.

```text
Create a finished 3:4 vertical Xiaohongshu cover poster.

Template: screenshot-style phone cover.
Topic: <topic>.
Audience: <audience>.

Exact readable Chinese copy:
- Tag: "<tag>"
- Main headline: "<headline>"
- Supporting line: "<support line>"

Composition:
- A tilted smartphone mockup sits in the lower 60%, screen showing a clean generic app review interface with simple placeholder shapes.
- Main headline sits above the phone in huge bold black Chinese type.
- Add red hand-drawn circles and arrows pointing at 2-3 important screen areas.
- Use a soft lavender or pale blue background with realistic phone shadow.

Style:
Trustworthy tool-review cover, clean, practical, screenshot realism plus annotation marks.

Constraints:
Do not use real app logos unless provided. Avoid fake readable UI details. Cover text must be correct and large.
```

### B. Chat Screenshot Proof

Use for testimonials, feedback screenshots, chat-based proof, and user review posts.

```text
Create a finished 3:4 vertical Xiaohongshu cover poster.

Template: screenshot-style chat proof cover.
Topic: <topic>.
Audience: <audience>.

Exact readable Chinese copy:
- Tag: "<tag>"
- Main headline: "<headline>"
- Supporting stamp: "<support line>"

Composition:
- Main headline at top in heavy black Chinese typography with one green or red emphasis phrase.
- Lower area contains 3-4 large chat bubbles or review cards, arranged vertically, with simple short pseudo-review marks but no dense readable microtext.
- Add red hand-drawn circles, arrows, and underlines around the proof points.
- Background is warm white or mint-white, low saturation.

Style:
Authentic, useful, screenshot-proof cover, light and credible, not luxury.

Constraints:
No real private user data, no fake profile photos, no unreadable tiny text, no watermark.
```

### C. Data Result Panel

Use for results, analytics, growth, before/after metrics, and case reports.

```text
Create a finished 3:4 vertical Xiaohongshu cover poster.

Template: screenshot-style data result cover.
Topic: <topic>.
Audience: <audience>.

Exact readable Chinese copy:
- Tag: "<tag>"
- Main headline: "<headline>"
- Highlight strip: "<support line>"

Composition:
- Dark dashboard-style result panel fills the bottom 65% of the cover.
- Main headline is in the upper third, bold white with yellow highlight.
- Dashboard contains clean generic charts, circles, and cards, with abstract numbers only if provided by the user.
- Add yellow or red circles and arrows to show where the eye should look.

Style:
High-trust data case cover, dark analytics UI, neon yellow and cyan accents, strong contrast.

Constraints:
Do not invent specific revenue, views, or conversion numbers unless provided. No fake logos, no watermark, no unreadable UI microtext.
```

## 4. Emotion Type

### A. Emotional Portrait

Use for self-growth, anxiety, career, emotional essays, and personal storytelling.

```text
Create a finished 3:4 vertical Xiaohongshu cover poster.

Template: emotion-style portrait cover.
Topic: <topic>.
Audience: <audience>.

Exact readable Chinese copy:
- Tag: "<tag>"
- Main headline: "<headline>"
- Supporting line: "<support line>"

Composition:
- Cinematic portrait of an Asian woman in the lower two-thirds, warm golden-hour rim light, authentic reflective expression.
- Main headline in huge white or cream Chinese type overlays the upper third or a warm orange brush band.
- Keep headline short and emotionally direct.
- Add one small tag in the upper-left corner.

Style:
Cinematic, emotional, warm, high-end creator story cover, not influencer selfie.

Constraints:
No artificial smile, no excessive beauty retouching, no garbled Chinese, no watermark.
```

### B. Lifestyle Scene

Use for solitude, city life, diary, work-life, and slow-living topics.

```text
Create a finished 3:4 vertical Xiaohongshu cover poster.

Template: emotion-style lifestyle cover.
Topic: <topic>.
Audience: <audience>.

Exact readable Chinese copy:
- Tag: "<tag>"
- Main headline: "<headline>"
- Supporting line: "<support line>"

Composition:
- Cozy cafe or desk scene fills the background: coffee cup, open journal, warm lamp, blurred person silhouette in the distance.
- Main headline overlays the lower or middle third in elegant but bold Chinese typography.
- Add a small subtitle beneath it, with letter spacing normal and high readability.

Style:
Quiet cinematic lifestyle, warm brown, amber, deep blue shadow, emotional but not depressing.

Constraints:
No readable shop signs, no brand logos, no tiny decorative text, no watermark.
```

### C. Healing Minimal Atmosphere

Use for healing, mental reset, self-care, slow growth, and calm essays.

```text
Create a finished 3:4 vertical Xiaohongshu cover poster.

Template: emotion-style healing cover.
Topic: <topic>.
Audience: <audience>.

Exact readable Chinese copy:
- Tag: "<tag>"
- Main headline: "<headline>"
- Supporting line: "<support line>"

Composition:
- Soft white-green morning light, sheer curtains, plant shadows, a ceramic cup or notebook as the small visual anchor.
- Use large gentle Chinese headline centered or slightly upper center.
- Keep the design airy, with enough negative space and one soft accent color.

Style:
Healing editorial cover, white, pale green, soft sunlight, calm and refined.

Constraints:
Text must be clear despite light palette. Avoid low-contrast pale text, no garbled characters, no watermark.
```

## 5. Lifestyle Photo Styles

### A. Sunlit Scrapbook Cutout

Use for travel Vlog, Citywalk, outfit, skincare, beauty, home workout, wellness, and warm lifestyle routine covers.

This style has its own full style pack in `sunlit-scrapbook-cutout-style.md`. Load that file before writing the final prompt when the user asks for:

- 阳光胶片拼贴
- 人物白描边
- 手写刷字标题
- 顶部胶片条
- lifestyle photo collage covers
- skincare / outfit / travel / home workout reference-cover style

Quick prompt skeleton:

```text
Create a finished 3:4 vertical social-media cover poster, 1080x1440 style.
Style: sunlit scrapbook cutout cover, warm real-life lifestyle photo collage, handwritten brush typography.

Composition:
- Warm golden-hour lifestyle photography base, shallow depth of field, cream olive brown color grading.
- Top 20% tilted photo-strip collage with 3 panels, separated by rough uneven white hand-drawn borders.
- Main subject on the right, occupying 45-55% of the canvas, with thick irregular white hand-drawn cutout outline.
- Oversized handwritten brush Chinese title on the left, white base text with butter-yellow and sage-green keyword highlights.

Exact readable Chinese copy:
- Main headline: "<headline>"
- Supporting line: "<support line>"
- Small note: "<optional tiny note>"

Decor:
Sparse doodle arrows, sparkles, hearts, dashed path, small sun icon, and casual underlines.

Constraints:
No watermark, no creator signature, no logo, no @ handle unless the user provides one. No QR code, no random extra words, no fake platform UI. Chinese text must be crisp, legible, and correctly written.
```

## Final Prompt Add-ons

Add one of these when needed:

```text
Make the cover more aggressive and thumb-stopping, with stronger contrast and heavier headline strokes.
```

```text
Make the cover more premium and restrained, with cleaner spacing and fewer decoration marks.
```

```text
Create 3 distinct color variants while keeping the same headline and template logic.
```

```text
The cover must pass an 80px thumbnail test: the main headline and visual anchor remain readable when shrunk very small.
```
