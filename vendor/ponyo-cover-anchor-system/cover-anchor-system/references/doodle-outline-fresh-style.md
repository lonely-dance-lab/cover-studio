# Doodle Outline Fresh Style

Use this file when the user wants a fresh Xiaohongshu cover with doodle outlines, hand-drawn sticker typography, lifestyle photo texture, travel/home/Vlog/Citywalk topics, or a "小清新 / 涂鸦描边 / 手帐贴纸" look.

This style is for finished covers, not article illustrations. The output must look like a real Xiaohongshu cover someone would publish.

## Style Contract

- Canvas: `3:4 vertical Xiaohongshu cover, 1080x1440`
- Base: realistic lifestyle photo texture, not flat cartoon
- Anchor: one clear person/object/room/cafe/tabletop subject with thick irregular white doodle outline
- Typography: large hand-drawn sticker title, readable at thumbnail size
- Decor: sparse arrows, dotted route lines, tape labels, stars, hearts, flowers, camera/play/location icons
- Mood: fresh, clean, light, airy, cute, not cluttered
- Topics: travel, home decor, daily vlog, citywalk, cafe, personal lifestyle, gentle tutorials

## Watermark Policy

Do not add `波妞`, `PONYO`, logo marks, creator signatures, `@` handles, or any hard-coded author watermark to generated cover images.

If the user explicitly provides their own account name or signature, include only that user-provided mark. Otherwise output a clean cover with no watermark.

The skill's authorship can appear in the repository/README, but not inside generated covers by default.

## Visual Recipe

```text
Create a finished 3:4 vertical Xiaohongshu cover poster, 1080x1440 style.
Style: fresh doodle-outline sticker cover, realistic lifestyle photography base, cute hand-drawn annotations.

Composition:
- One dominant lifestyle subject in the lower 55-60% of the canvas.
- Add a thick irregular white hand-drawn outline around the subject, like a sticker cutout.
- Put the main headline in the top third, huge and readable.
- Add 1 small tag sticker and 1 support label.
- Add sparse doodle elements only where they guide the eye.

Text:
- Tag: "<tag>"
- Main headline: "<headline>"
- Support label: "<support>"

Hard constraints:
- No watermark, no creator signature, no logo, no @ handle unless the user provides one.
- No fake brand names, no QR code, no random extra words.
- Chinese text must be crisp, legible, correctly written, no garbled characters.
- Keep realistic photo texture; do not over-cartoonify the scene.
```

## Four Ready Prompts

### 1. Travel Vlog

```text
Create a finished 3:4 vertical Xiaohongshu cover poster, 1080x1440 style, compact 3:4 not 9:16.

Topic: weekend travel vlog.
Style: fresh doodle-outline sticker cover, realistic lifestyle photography base.

Subject:
A young Asian woman traveler from the back/three-quarter view, wearing a light cardigan and carrying a blank canvas tote, standing near a small countryside train-station platform with spring greenery and blue sky. Real photo texture, natural light, soft depth of field.

Layout:
The traveler occupies the lower 55% and has a thick irregular white hand-drawn sticker outline. Add a tiny sun, cloud, suitcase, route line, paper tape label, flower, and one arrow.

Exact readable text:
- Tag: "旅行Vlog"
- Main headline: "周末逃跑计划"
- Support label: "2天1夜小路线"

Palette:
Sky blue, leafy green, warm cream, coral-red accent, white doodle outline.

Constraints:
No watermark, no creator signature, no logo, no @ handle. No QR code, no random extra words, no fake brand marks. Chinese text must be crisp and correct.
```

### 2. Home Decor

```text
Create a finished 3:4 vertical Xiaohongshu cover poster, 1080x1440 style, compact 3:4 not 9:16.

Topic: cozy home decor inspiration.
Style: fresh doodle-outline sticker cover, realistic home lifestyle photography.

Subject:
A sunlit living room corner with a small round table, tulips in a glass vase, linen sofa edge, soft rug, pastel cushions, books, and warm window light. Keep materials realistic.

Layout:
The table and flower vase are the main anchor in the lower-middle area. Add a thick irregular white outline around the vase, table, and one cushion. Add sparkles, a tiny lamp icon, flower stickers, a hand-drawn arrow, and paper tape labels.

Exact readable text:
- Tag: "家居灵感"
- Main headline: "把家住成春天"
- Support label: "低成本软装"

Palette:
Mint green, warm cream, tulip pink, pale yellow sunlight, white doodle outline.

Constraints:
No watermark, no creator signature, no logo, no @ handle. No QR code, no random extra words. Chinese text must be crisp and correct.
```

### 3. Daily Vlog

```text
Create a finished 3:4 vertical Xiaohongshu cover poster, 1080x1440 style, compact 3:4 not 9:16.

Topic: daily vlog recording.
Style: fresh doodle-outline sticker cover, realistic cozy tabletop lifestyle scene.

Subject:
A bright window tabletop with a generic blank compact camera, iced coffee with a blank cup, open blank notebook with collage photos, white headphones, and a creator's hands placing a small sticker. No readable brand or notebook text.

Layout:
The tabletop objects occupy the lower-middle 55%. Add thick white hand-drawn outlines around camera, iced coffee, notebook, headphones, and hands. Add a red recording dot, tiny play button, hearts, stars, sparkles, and paper tape strips.

Exact readable text:
- Tag: "日常Vlog"
- Main headline: "今天也要记录"
- Support label: "普通一天也发光"

Palette:
Lemon yellow, sky blue, milk white, soft peach, pale wood.

Constraints:
No watermark, no creator signature, no logo, no @ handle. No camera brand, no English words, no fake UI text. Chinese text must be crisp and correct.
```

### 4. Citywalk

```text
Create a finished 3:4 vertical Xiaohongshu cover poster, 1080x1440 style, compact 3:4 not 9:16.

Topic: citywalk and cafe street route.
Style: fresh doodle-outline sticker cover, realistic travel lifestyle photography.

Subject:
A sunny city street corner with a small independent cafe facade, a bicycle, a takeaway coffee cup in hand, and a simple paper map/route card. No readable street names or cafe brand names.

Layout:
The person, cup, map, and bicycle occupy the lower 58%. Add thick irregular white outlines around the coffee cup, bicycle, map card, and cafe sign shape. Add route dashed line, location pin, tiny camera, heart, star, arrow, and paper tape sticker.

Exact readable text:
- Tag: "Citywalk"
- Main headline: "城市慢慢逛"
- Support label: "小众路线收藏"

Palette:
Orange-red, soft lavender, cream white, pale teal, warm cafe beige.

Constraints:
No watermark, no creator signature, no logo, no @ handle. No fake cafe names, no QR code, no random extra words. Chinese text must be crisp and correct.
```
