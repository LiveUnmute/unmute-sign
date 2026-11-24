# Signa AI: ASL output for the pilot

**Scope:** clinician English text → ASL avatar video. This is one direction of
Unmute's planned two-way workflow. Signa's reviewed API does **not** recognise
patient signing; patient ASL → English remains a separate Sign-Speak path and
is still scripted until that recognition integration is configured.

## Current implementation

The app sends clinician speech through the browser's speech-recognition feature
when available, then passes the resulting English text to Signa. Signa is
configured for English (`en`) → American Sign Language (`ase`). The proxy calls
Signa's documented endpoints in order:

1. `POST /v1/sign` to receive `.sgn` animation bytes.
2. `POST /v1/sign/video` to render an MP4 avatar video.

The browser calls only Unmute's same-origin `POST /api/signa/video` endpoint.
The Netlify Function reads the main Signa key, and returns the MP4; it does not
store the text, animation, or video. The Signa key is never sent to browser
code. There is no Signa live-audio/WebSocket path in this prototype.

## Add the sandbox key

The key has been created in the Signa dashboard, but it is not available to this
repository or to the browser. To enable the integration:

1. In the **Unmute app's Netlify site**, add an environment variable named
   `SIGNA_KEY` and paste the sandbox key as its value.
2. Redeploy the site so the function receives the new environment variable.
3. Check `GET /api/signa/status`. It should return `configured: true` and
   `to: "ase"`. This only confirms that a value is present; the first short
   signing request is what verifies that Signa accepts it.
4. Open the app's **Speak** direction and test one short, non-sensitive English
   sentence. The status chip should identify Signa as the live output engine.

Do **not** paste the key into chat, `index.html`, a meta tag, `UNMUTE_CONFIG`, or
a committed file. The local `.env` patterns are ignored by Git. For a local
server session, provide `SIGNA_KEY` through the process environment before
starting `node app/server.mjs`; the local server invokes the same function code.

## Safeguards and limits

- The proxy accepts one short sentence (up to 300 characters) per request,
  allows six video requests per IP per minute per warm function instance, and
  times out upstream work after 8.5 seconds.
- The browser receives an MP4, not the API key or a reusable client token. The
  patient-signing video is **not** sent to Signa by this integration.
- Use non-sensitive sample phrases only. Do not use it for patient care or
  clinical decisions; the avatar output has not been validated by Deaf ASL users
  or qualified sign-language professionals.
- Signa can skip words it cannot sign. Keep the clinician's English visible and
  review the signed result; do not assume the avatar conveyed every word.
- The sandbox dashboard reports a 20,000-character allowance, 60 live minutes,
  10 videos, and expiry on **2026-12-01**. A generated video consumes quota, so
  keep testing deliberate.
- `?provider=mock` forces the fully scripted demo without calling either vendor.
  `?provider=signspeak` selects Sign-Speak for English-to-sign comparison when
  its key is configured.

## What remains separate

| Direction | Provider | State |
|---|---|---|
| Clinician English → ASL avatar | Signa AI | Proxy integrated; awaiting `SIGNA_KEY` in the app environment and a live sandbox test |
| Patient ASL → English | Sign-Speak | Separate recognition provider; awaiting its response/key |

Signa's ASL **output** support does not establish ASL **recognition** support.
