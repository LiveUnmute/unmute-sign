# App screens

Four screens, in Unmute's own design language, wired to a scripted
conversation and a real microphone.

```
app/
├── index.html        the app — full bleed at every width
├── app.html          forwards to / (kept so old links work)
├── TESTER_GUIDE.md   hand this to a tester — supported phrases and what to look for
├── css/app.css       all styling
├── js/screens.js     the four screens as markup
├── js/media.js       sign media + the pre-arranged conversation   ← edit here
├── js/app.js         navigation, microphone, simulation
├── js/providers/     directional providers: Signa output, Sign-Speak, mock, Talksign skeleton
├── ROADMAP_TO_LIVE.md  remaining work and pilot-readiness gates
├── assets/           logo, favicon
├── media/            patient-01…05, translator-01…05
├── netlify.toml      deploy config for app.liveunmute.com
├── DEPLOY.md         how to ship it to the subdomain
└── server.mjs        static server on :8083
```

```bash
cd app && PORT=8083 node server.mjs
```

The local server also routes `/api/signa/*` to the same function handler used by
Netlify. Without `SIGNA_KEY` it stays in demo mode. Provide the key through your
local process environment for a sandbox test; never put it in a tracked file.

Open `/` — it is the app, at any width. No frame, no backdrop, no board: the
screens fill the window, with the content held to a readable column and the
background running edge to edge. On a phone, safe-area insets are respected.

There is no drawn status bar. On a phone the device's own status bar is the one
that should show, so the mock `9:41` strip was removed from all four screens
and the top padding now takes `env(safe-area-inset-top)` instead.

To deploy, see **DEPLOY.md** — the DNS for liveunmute.com is already on Netlify DNS, so the subdomain needs no Namecheap work.

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
| **Real** | The microphone permission prompt, audio stream, input-level ring, and browser speech transcript where `SpeechRecognition` is supported. The clinician Speak control stays active across turns; two seconds of silence completes a signing chunk. With a valid `SIGNA_KEY` in the matching deploy context, a short-lived client token lets Signa render the text as an ASL avatar video. |
| **Scripted until recognition is configured** | Patient sign → English. Signa does not recognise sign-language video; patient phrases still come from `SCRIPT` in `media.js` until a separate recognition provider such as Sign-Speak is configured. |

The sign screen labels the current direction's engine independently. A live
Signa avatar never implies that patient signing is being recognised. See
[`SIGNA_INTEGRATION.md`](./SIGNA_INTEGRATION.md) for setup and limits, and
[`INTEGRATION.md`](./INTEGRATION.md) for the Sign-Speak recognition path.

**Browser speech recognition needs a secure context.** It works on `https://`
and on `localhost`; it may not prompt on a plain-`http` LAN address.

## The conversation

`SCRIPT` in `js/media.js` remains the patient-side scripted demo. On the
clinician side, one tap on **Speak** starts a continuing speech-recognition
session. The transcript appears live; each two-second pause completes the
current English chunk and queues it for ASL output without closing the session.
A second tap ends recognition and the input meter. **Repeat** replays the most
recent successfully rendered chunk; if the next one is still rendering, the
previous output remains available.

Patient-demo poses keep their own cursor. Switching directions does not turn a
Signa avatar into patient-sign recognition.

## Known gaps

- Without a live output provider, the signer is a still demo pose. Signa can
  return an MP4 when configured, but that output is not clinically or
  linguistically validated.
- History and Settings are static.
- Signa's server function now mints short-lived client tokens; the browser
  calls Signa directly for `.sgn` and MP4 rendering so video work avoids the
  Netlify synchronous timeout. Verify `SIGNA_KEY` in the exact deploy context
  and complete a live sandbox test before treating output as connected.
- Patient ASL → English remains scripted until Sign-Speak recognition is
  configured. `talksign.js` is still an unverified skeleton.
