# App screens

Three phone screens, built to a supplied visual reference.

```
app/
├── index.html      the three screens side by side (the reference composition)
├── app.html        one phone you can drive — screen switch, capture, mic
├── css/app.css     all styling
├── js/screens.js   the three screens as markup, shared by both pages
├── js/app.js       launcher mount + the simulation
├── assets/         signer.jpg, hands.jpg, favicon.ico
└── server.mjs      static server on :8083
```

Run it:

```bash
cd app && PORT=8083 node server.mjs
```

No build step, no dependencies.

## What the reference supplied, and what it didn't

The reference supplied **layout only**: a blue field, three devices, a warm hero
card with a stacked pair of action buttons, a full-bleed camera view with a
tracking box and a caption sheet, and a thread with a signed-reply tile over a
single mic. That structure is reproduced.

The content is Unmute's own. The reference is a social product — its hero card
is a community panel, its feed is user posts. That belongs to a different
product, so the same slots hold the clinical version: recent conversations, a
198-phrase library, an ASL/English direction pair.

## This is a prototype, and it says so

There is no model. The capture button cycles five fixed phrases, the microphone
plays three fixed questions. Both pages say that in plain language, on the page,
because the deck's own status slide says there is no trained model and a design
build that quietly implies otherwise would undercut it.

Photography is illustrative and licence-free, not a customer.

## Screens

**01 Home** — warm hero card ("Sign with your patient"), primary
`Translate sign`, secondary `Speak to patient`, two recent items, four-tab bar.

**02 Translate** — full-bleed video, blue tracking box with a confidence chip, a
scanning sweep, and a white sheet carrying the recognised phrase with a shutter
and two secondary controls. The `DEMO` chip is always visible.

**03 Conversation** — ASL↔English direction pair with a swap control, a signed
patient bubble, a spoken clinician bubble, a signed-reply video tile with a
progress bar, and a single mic.

## Open thread

The layout is fixed at a 288×596 device. When this becomes a real screen it
should be built responsive — a 375-wide phone is the common case on the ward,
and the current fixed width will feel small there.
