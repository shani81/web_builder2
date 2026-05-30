# Builder Capabilities

> Generated from the live registry + schemas. Hash `bbbd0f784b0286e2`. Do not edit by hand — run `pnpm sync:build`.

**Blocks:** 23 (21 in palette). **Containers:** section, column, features.

## Components

### `section` _(not in palette)_ — Section _(layout)_

- container of: **column**
- `layout` (section-layout)
- `width` (select) — one of: `contained`, `wide`, `full`
- `columns` (section-columns)
- `gap` (number)
- `paddingY` (number)
- `background` (color)

### `column` _(not in palette)_ — Column _(layout)_

- container of: **any content block**
- `columnActions` (column-actions)
- `verticalAlign` (select) — one of: `top`, `center`, `bottom`
- `hiddenMobile` (toggle)
- `padding` (number)
- `background` (color)

### `navbar` — Navbar _(layout)_

- `brand` (navbar-brand) _(default: `"Brand"`)_
- `menu` (menu)
- `cta` (navbar-buttons)
- `background` (color) _(default: `"#FFFFFF"`)_
- `textColor` (color) _(default: `"#0F0F12"`)_
- `sticky` (toggle) _(default: `false`)_

### `hero` — Hero _(layout)_

- `headline` (text) _(default: `"Your big idea starts here"`)_
- `subtext` (textarea) _(default: `"A clear, compelling subheading that explains what you offer."`)_
- `ctaLabel` (text) _(default: `"Get started"`)_
- `ctaHref` (text) _(default: `"#"`)_
- `secondaryCtaLabel` (text)
- `secondaryCtaHref` (text) _(default: `"#"`)_
- `align` (select) — one of: `left`, `center` _(default: `"center"`)_
- `background` (color) _(default: `"#0F0F12"`)_
- `backgroundImage` (text)
- `textColor` (color) _(default: `"#FFFFFF"`)_
- `bxRadius` (select) — one of: `(default)`, `sm`, `md`, `lg`, `full`
- `bxWidth` (select) — one of: `(default)`, `contained`, `wide`
- `bxPadTop` (number)
- `bxPadBottom` (number)

### `features` — Features _(content)_

- container of: **feature-item**
- `heading` (text) _(default: `"Everything you need"`)_
- `subtext` (textarea)
- `columns` (select) — one of: `2`, `3`, `4` _(default: `"3"`)_
- `featureItems` (feature-items)
- `bxBg` (color)
- `bxRadius` (select) — one of: `(default)`, `sm`, `md`, `lg`, `full`
- `bxWidth` (select) — one of: `(default)`, `contained`, `wide`
- `bxPadTop` (number)
- `bxPadBottom` (number)

### `testimonials` — Testimonials _(content)_

- `heading` (text) _(default: `"Loved by teams everywhere"`)_
- `items` (textarea) _(default: `"This product changed how we work. | Jane Doe | CEO, Acme\nThe best tool we have adopted in years. | John Smith | CTO, Globex"`)_
- `bxBg` (color)
- `bxRadius` (select) — one of: `(default)`, `sm`, `md`, `lg`, `full`
- `bxWidth` (select) — one of: `(default)`, `contained`, `wide`
- `bxPadTop` (number)
- `bxPadBottom` (number)

### `cta` — CTA Banner _(layout)_

- `headline` (text) _(default: `"Ready to get started?"`)_
- `subtext` (textarea) _(default: `"Join thousands of teams building with us."`)_
- `ctaLabel` (text) _(default: `"Start free"`)_
- `ctaHref` (text) _(default: `"#"`)_
- `background` (color) _(default: `"#4F6EF7"`)_
- `backgroundImage` (text)
- `textColor` (color) _(default: `"#FFFFFF"`)_
- `bxRadius` (select) — one of: `(default)`, `sm`, `md`, `lg`, `full`
- `bxWidth` (select) — one of: `(default)`, `contained`, `wide`
- `bxPadTop` (number)
- `bxPadBottom` (number)

### `image` — Image _(media)_

- `src` (image)
- `alt` (text)
- `caption` (text)
- `link` (text)
- `width` (select) — one of: `contained`, `full` _(default: `"contained"`)_
- `rounded` (toggle) _(default: `true`)_
- `bxBg` (color)
- `bxPadTop` (number)
- `bxPadBottom` (number)

### `text` — Text _(content)_

- `heading` (text)
- `content` (textarea) _(default: `"Write something meaningful here. Click to edit this text block."`)_
- `align` (select) — one of: `left`, `center` _(default: `"left"`)_
- `bxBg` (color)
- `bxRadius` (select) — one of: `(default)`, `sm`, `md`, `lg`, `full`
- `bxWidth` (select) — one of: `(default)`, `contained`, `wide`
- `bxPadTop` (number)
- `bxPadBottom` (number)

### `heading` — Heading _(content)_

- `text` (text) _(default: `"Your heading"`)_
- `level` (select) — one of: `h1`, `h2`, `h3`, `h4`, `h5`, `h6` _(default: `"h2"`)_
- `align` (select) — one of: `left`, `center`, `right` _(default: `"left"`)_
- `weight` (select) — one of: `normal`, `medium`, `semibold`, `bold` _(default: `"bold"`)_
- `color` (color)
- `bxBg` (color)
- `bxRadius` (select) — one of: `(default)`, `sm`, `md`, `lg`, `full`
- `bxWidth` (select) — one of: `(default)`, `contained`, `wide`
- `bxPadTop` (number)
- `bxPadBottom` (number)

### `button` — Button _(content)_

- `label` (text) _(default: `"Get started"`)_
- `href` (text) _(default: `"#"`)_
- `newTab` (toggle) _(default: `false`)_
- `variant` (select) — one of: `filled`, `outline`, `ghost` _(default: `"filled"`)_
- `size` (select) — one of: `sm`, `md`, `lg` _(default: `"md"`)_
- `align` (select) — one of: `left`, `center`, `right` _(default: `"left"`)_
- `fullWidth` (toggle) _(default: `false`)_
- `bg` (color) _(default: `"#4F6EF7"`)_
- `color` (color) _(default: `"#FFFFFF"`)_
- `radius` (select) — one of: `none`, `sm`, `md`, `lg`, `full` _(default: `"md"`)_
- `shadow` (select) — one of: `none`, `sm`, `md`, `lg` _(default: `"none"`)_
- `bxPadTop` (number)
- `bxPadBottom` (number)

### `divider` — Divider _(content)_

- `text` (text)
- `position` (select) — one of: `left`, `center`, `right` _(default: `"center"`)_
- `textColor` (color) _(default: `"#6B7280"`)_
- `color` (color) _(default: `"#E5E7EB"`)_
- `thickness` (number) _(default: `1`)_
- `lineStyle` (select) — one of: `solid`, `dashed`, `dotted` _(default: `"solid"`)_
- `spacingY` (number) _(default: `24`)_
- `bxPadTop` (number)
- `bxPadBottom` (number)

### `footer` — Footer _(layout)_

- `brand` (text) _(default: `"Brand"`)_
- `tagline` (text) _(default: `"Building the web, one block at a time."`)_
- `links` (textarea) _(default: `"Privacy, Terms, Contact"`)_
- `social` (textarea) _(default: `"Twitter, GitHub, LinkedIn"`)_
- `text` (text) _(default: `"© 2026 All rights reserved."`)_
- `columns` (select) — one of: `1`, `2`, `3`, `4`, `5`, `6` _(default: `"3"`)_
- `columnsMobile` (select) — one of: `1`, `2` _(default: `"2"`)_
- `bxBg` (color)
- `bxRadius` (select) — one of: `(default)`, `sm`, `md`, `lg`, `full`
- `bxWidth` (select) — one of: `(default)`, `contained`, `wide`
- `bxPadTop` (number)
- `bxPadBottom` (number)

### `pricing` — Pricing _(content)_

- `heading` (text) _(default: `"Simple, transparent pricing"`)_
- `subtext` (textarea)
- `highlightIndex` (number) _(default: `1`)_
- `items` (textarea) _(default: `"Starter | $9 | /mo | 1 project; Email support; 1 GB storage\nPro | $29 | /mo | Unlimited projects; Priority support; 50 GB\nTeam | $99 | /mo | Everything in Pro; SSO; 500 GB"`)_
- `bxBg` (color)
- `bxRadius` (select) — one of: `(default)`, `sm`, `md`, `lg`, `full`
- `bxWidth` (select) — one of: `(default)`, `contained`, `wide`
- `bxPadTop` (number)
- `bxPadBottom` (number)

### `faq` — FAQ _(content)_

- `heading` (text) _(default: `"Frequently asked questions"`)_
- `items` (textarea) _(default: `"How does the free trial work? | Full access for 14 days, no card required.\nCan I cancel anytime? | Yes — cancel in one click.\nDo you offer refunds? | 30-day money-back guarantee."`)_
- `bxBg` (color)
- `bxRadius` (select) — one of: `(default)`, `sm`, `md`, `lg`, `full`
- `bxWidth` (select) — one of: `(default)`, `contained`, `wide`
- `bxPadTop` (number)
- `bxPadBottom` (number)

### `stats` — Stats _(content)_

- `heading` (text)
- `columns` (select) — one of: `2`, `3`, `4` _(default: `"4"`)_
- `items` (textarea) _(default: `"10k+ | Active users\n99.9% | Uptime\n4.9/5 | Rating\n24/7 | Support"`)_
- `bxBg` (color)
- `bxRadius` (select) — one of: `(default)`, `sm`, `md`, `lg`, `full`
- `bxWidth` (select) — one of: `(default)`, `contained`, `wide`
- `bxPadTop` (number)
- `bxPadBottom` (number)

### `team` — Team _(content)_

- `heading` (text) _(default: `"Meet the team"`)_
- `items` (textarea) _(default: `"Alex Rivera | Founder & CEO |\nSam Chen | Head of Product |\nJordan Lee | Lead Engineer |"`)_
- `bxBg` (color)
- `bxRadius` (select) — one of: `(default)`, `sm`, `md`, `lg`, `full`
- `bxWidth` (select) — one of: `(default)`, `contained`, `wide`
- `bxPadTop` (number)
- `bxPadBottom` (number)

### `contact` — Contact _(content)_

- `heading` (text) _(default: `"Get in touch"`)_
- `subtext` (textarea) _(default: `"We usually reply within one business day."`)_
- `buttonLabel` (text) _(default: `"Send message"`)_
- `bxBg` (color)
- `bxRadius` (select) — one of: `(default)`, `sm`, `md`, `lg`, `full`
- `bxWidth` (select) — one of: `(default)`, `contained`, `wide`
- `bxPadTop` (number)
- `bxPadBottom` (number)

### `newsletter` — Newsletter _(content)_

- `heading` (text) _(default: `"Stay in the loop"`)_
- `subtext` (textarea) _(default: `"Get product updates and tips in your inbox."`)_
- `placeholder` (text) _(default: `"you@example.com"`)_
- `buttonLabel` (text) _(default: `"Subscribe"`)_
- `background` (color) _(default: `"#0F0F12"`)_
- `textColor` (color) _(default: `"#FFFFFF"`)_
- `align` (select) — one of: `left`, `center`, `right` _(default: `"center"`)_
- `alignMobile` (select) — one of: `left`, `center`, `right` _(default: `"center"`)_
- `bxRadius` (select) — one of: `(default)`, `sm`, `md`, `lg`, `full`
- `bxWidth` (select) — one of: `(default)`, `contained`, `wide`
- `bxPadTop` (number)
- `bxPadBottom` (number)

### `gallery` — Gallery _(media)_

- `heading` (text)
- `columns` (select) — one of: `2`, `3`, `4` _(default: `"3"`)_
- `columnsMobile` (select) — one of: `1`, `2` _(default: `"2"`)_
- `images` (textarea)
- `bxBg` (color)
- `bxRadius` (select) — one of: `(default)`, `sm`, `md`, `lg`, `full`
- `bxWidth` (select) — one of: `(default)`, `contained`, `wide`
- `bxPadTop` (number)
- `bxPadBottom` (number)

### `video` — Video _(media)_

- `url` (text)
- `caption` (text)
- `bxBg` (color)
- `bxRadius` (select) — one of: `(default)`, `sm`, `md`, `lg`, `full`
- `bxWidth` (select) — one of: `(default)`, `contained`, `wide`
- `bxPadTop` (number)
- `bxPadBottom` (number)

### `countdown` — Countdown _(advanced)_

- `heading` (text) _(default: `"Launching soon"`)_
- `targetDate` (date) _(default: `"2026-12-31"`)_
- `expiredText` (text) _(default: `"We're live!"`)_
- `bxBg` (color)
- `bxRadius` (select) — one of: `(default)`, `sm`, `md`, `lg`, `full`
- `bxWidth` (select) — one of: `(default)`, `contained`, `wide`
- `bxPadTop` (number)
- `bxPadBottom` (number)

### `logos` — Logo Cloud _(content)_

- `heading` (text) _(default: `"Trusted by leading teams"`)_
- `items` (textarea) _(default: `"Acme, Globex, Initech, Umbrella, Hooli, Vehement"`)_
- `bxBg` (color)
- `bxRadius` (select) — one of: `(default)`, `sm`, `md`, `lg`, `full`
- `bxWidth` (select) — one of: `(default)`, `contained`, `wide`
- `bxPadTop` (number)
- `bxPadBottom` (number)

## Theme tokens

- Colors (hex): primaryColor, secondaryColor, accentColor, backgroundColor, textColor
- Fonts: fontHeading, fontBody
- borderRadius: none, sm, md, lg, full
- spacing: compact, normal, relaxed

## Page schema

```json
{
  "id": "string",
  "type": "one of allowedBlockTypes",
  "props": "object (per component)",
  "styles": "Record<string, string|number>",
  "children": "Block[] (containers only)",
  "locked": "boolean",
  "visible": "boolean",
  "responsive": "{ desktop:{}, tablet:{}, mobile:{} }"
}
```

Allowed block types: section, column, hero, navbar, features, feature-item, pricing, testimonials, cta, gallery, contact, footer, text, heading, button, image, video, embed, spacer, divider, countdown, form, map, social, code, faq, stats, team, newsletter, logos, ai-generated
