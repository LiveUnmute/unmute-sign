# App screens

Four screens, in Unmute's own design language, wired to a scripted
conversation and a real microphone.

```
app/
├── index.html        the board on desktop · the app itself on a phone
├── app.html          the app, framed on desktop
├── TESTER_GUIDE.md   hand this to a tester — supported phrases and what to look for
├── css/app.css       all styling
├── js/screens.js     the four screens as markup
├── js/media.js       sign media + the pre-arranged conversation   ← edit here
├── js/app.js         navigation, microphone, simulation
├── assets/           logo, favicon
├── media/            patient-01…05, translator-01…05
└── server.mjs        static server on :8083
```

```bash
cd app && PORT=8083 node server.mjs
```

Open `/` on a desktop for the board, or open either page on a phone and it
becomes the app — no frame, no backdrop, safe-area insets respected.

## Changing an image to a video

Everything about a phrase lives in `js/media.js`. Each entry has a `media`
field, and the extension decides how it renders:

```js
{ id: "chest", text: "My chest hurts.", media: "media/patient-02.jpg" }   // still
{ id: "chest", text: "My chest hurts.", media: "media/patient-02.mp4" }   // video
{ id: "chest", text: "My chest hurts.", media: "https://…/sign-02.mp4" }  // remote
```

`.mp4`, `.webm`, `.mov` and `.m4v` all render as a muted, looping,
`playsinline` video. Nothing else changes. Drop the file in `media/` and edit
the one string.

**Framing:** the stage crops the sides only, never the top or bottom
(`object-position: center 34%`). Shoot or generate vertical media with the
subject centred and clear space above and below the hands. If a particular
clip needs letterboxing instead, add `data-fit="contain"` to `.stage` in
`renderSign`.

## Layout on the Sign screen

Nothing is panelled. The caption, the confidence label and the two direction
buttons float directly on the footage, so the signer is never hidden behind a
white sheet. Legibility comes from a gradient scrim at the foot of the frame
and a soft text shadow, not from a background box. The tab bar is glass on this
screen for the same reason.

If a particular clip is too bright at the bottom, darken `.scrim` rather than
reintroducing a panel.

## The two characters

- **Patient** — `media/patient-01…05.jpg`. Same woman, same wardrobe, same
  background, same framing; only the hands change.
- **Translator** — `media/translator-01…05.jpg`. Same man throughout, distinct
  from the patient, so a clinician never confuses who is on screen.

New poses should be generated from the existing images (image-to-image,
changing only the hands) so the character stays recognisable. Ten stills were
made that way; the prompts are in the commit history.

## What is real and what is scripted

| | |
|---|---|
| **Real** | The microphone permission prompt, the audio stream, and the live input-level ring around the speech button. Where the browser exposes `SpeechRecognition`, the transcript is genuinely what you said. |
| **Scripted** | The conversation. There is no sign-recognition model, so patient phrases come from `SCRIPT` in `media.js` and the confidence score is cosmetic. |

The app says which one you are getting on screen rather than leaving it
ambiguous. This matters because the deck's status slide says there is no
trained model — a prototype that quietly implied otherwise would contradict it.

**Speech recognition needs a secure context.** It works on `https://` and on
`localhost`; it will not prompt on a plain-`http` LAN address.

## The conversation

`SCRIPT` in `js/media.js` is the pre-arranged two-way exchange:

```
clinician  Where does it hurt?                      →  translator-01
patient    My chest hurts.                          →  patient-02
clinician  On a scale of 1 to 5, how bad is it?     →  translator-02
patient    It started two days ago.                 →  patient-03
clinician  Are you taking any medication?           →  translator-03
patient    My throat is sore.                       →  patient-04
clinician  I'm going to press here — tell me…       →  translator-05
patient    I get dizzy when I stand up.             →  patient-05
clinician  One moment, please.                      →  translator-04
patient    I don't understand.                      →  patient-01
```

Five exchanges each, then both directions loop back to the top.

The two directions keep independent cursors, so switching between Sign and
Speak never loses the thread.

## Known gaps

- The signer is a still photograph per phrase. Animation is the next step and
  is why the media layer takes video already.
- History and Settings are static.
- The board's four frames are fixed-size mockups; on a phone the app goes
  full-bleed instead.
