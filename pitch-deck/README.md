# Unmute — Pitch Deck

A 21-slide deck (15 main + 6 appendix) built from `../unmute-pitch/03_DECK_OUTLINE.md`.

Single HTML file, no build step, no dependencies beyond two web fonts.

## View it

```bash
npm start          # or: node server.mjs
```

Then open <http://localhost:8082>.

| Action | Key |
|---|---|
| Next | → ↓ Space PageDown or click |
| Back | ← ↑ PageUp |
| First / last | Home / End |
| Link to a slide | add `#7` to the URL |

## Export to PDF

Open the deck in Chrome or Edge and press **Print** (the `PDF` button in the bottom bar).

- Destination: **Save as PDF**
- Layout: **Landscape**
- Margins: **None**
- **Background graphics: ON** — without this the dark slides print white

Each slide becomes exactly one page at 1280 × 720. Twenty-one pages.

## Editing

Everything lives in `index.html`. Colours, fonts and spacing are declared once in
`:root` at the top of the `<style>` block:

```css
--bone:  #E3E1DC;   /* page background */
--ink:   #121212;   /* dark slides, type */
--blue:  #006AFE;   /* Unmute accent */
```

Each slide is one `<section class="slide">`. The `data-label` attribute is just a
comment for whoever is editing — it is not rendered.

Slide furniture is consistent: a `.kicker` eyebrow, an `h1.head` assertion, a `.slide-body`
for the content, and a `.slide-foot` carrying the running label and page number.

## What this deck is, and is not

It is a **specification**. There is no trained model behind slide 7, and slide 8 says so
in the deck itself. The status flags from the outline are preserved in the running
footers — "Thesis — we are building this, not yet holding it", "Zero design partners
today", "Pending counsel review".

Do not let a designer add traction, logos, testimonials or a customer count. The
credibility of this deck is that it names its own gaps before a reviewer finds them.

## For the designer

Read `../unmute-pitch/03_DECK_OUTLINE.md` before redesigning anything. Each slide there
carries the speaker note explaining why it exists — the bar chart on slide 2 and the
three-column honesty on slide 7 are load-bearing, and flattening them into a generic
"problem / solution / market" flow removes the argument.

Three rules worth keeping:

1. Slide 2's chart is the most important slide. It should be one chart and no decoration.
2. Slide 7 says what the product will *not* do, and who it does not replace. Keep both columns.
3. No market-size slide. There is no defensible bottom-up TAM yet, and an invented one is worse than its absence.
