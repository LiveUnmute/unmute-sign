# App screens

Four screens, in Unmute's own design language.

```
app/
├── index.html      all four screens side by side (the board)
├── app.html        one phone you can drive — tabs, both directions, toggles
├── css/app.css     all styling, tokens taken from the website
├── js/screens.js   the four screens as markup, shared by both pages
├── js/app.js       board mount + the simulation
├── assets/         signer.jpg, hands.jpg, logo, favicon
└── server.mjs      static server on :8083
```

```bash
cd app && PORT=8083 node server.mjs
```

No build step, no dependencies.

## The four screens

**01 Home** — the entry point. Dark hero card, the single action
`Speak to patient`, two recent encounters, tab bar. The `Translate sign`
button is gone on purpose: the Sign screen carries both directions, so a
second entry button on Home only duplicated it.

**02 Sign** — the two-way screen. Full-bleed camera with a tracking frame and a
confidence read-out, a bone caption sheet, and **two buttons of equal weight**:
the hand (patient signs) and speech (clinician speaks). Those are the only
controls on the screen — no library, no camera flip, no share row.

**03 History** — past encounters, grouped by day, with duration and a flag on
the one that needs attention.

**04 Settings** — language pair, capture behaviour, accessibility, and the
consent switch that governs whether a capture is ever stored.

## Where the design comes from

Not invented. Taken from `landing/index.html`:

| Token | Value | Source |
|---|---|---|
| Bone | `#E3E1DC` | `--c-bg` |
| Ink | `#121212` | `--c-dark` |
| Blue | `#006AFE` | `--c-accent` |
| Deep blue | `#0056CC` | `--c-accent-deep` |
| Display | Syncopate, uppercase, `letter-spacing: .13–.2em` | `--font-display` |
| Body | Pretendard | `--font-body` |

Buttons are pills, cards are near-square, section breaks are 1px hairlines —
the same conventions as the site. The wordmark is the real
`unmute-logo-trimmed.png`, copied in so the folder is portable.

Type is loaded from the same CDNs the landing page uses, so the letterforms
match exactly rather than approximately.

## This is a prototype, and it says so

There is no model. The hand button cycles four fixed signed phrases; the
speech button plays three fixed questions. Both pages say that in plain
language, because the deck's status slide says there is no trained model and a
design build that quietly implied otherwise would undercut it.

Photography is illustrative and licence-free, not a customer.

## Open thread

The device is fixed at 292×606 to match the reference proportion. On a real
375-wide phone the screens should be rebuilt to fill the viewport rather than
sitting in a frame.
