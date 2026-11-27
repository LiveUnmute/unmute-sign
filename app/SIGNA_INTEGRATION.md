# Signa AI: English → ASL output

**Scope:** clinician English text → ASL avatar video. Signa's reviewed API
supports signed output; it does **not** recognise patient signing. Patient
ASL → English remains a separate recognition path and is a scripted demo until
that provider is configured. Nothing here establishes clinical validation.

## Signa 504 diagnosis and fix

The 504 text in the preview — `Signa did not finish rendering within the
serverless time limit` — came from Unmute's old Netlify Function. That function
ran both Signa requests (`/v1/sign`, then `/v1/sign/video`) synchronously and
aborted its upstream request after 8.5 seconds. The exact wording was generated
by that local timeout. A repeatable 504 on a one-word input therefore did not
show that the word was too long; the serverless request was timing out while
waiting for Signa's render.

The flow now uses Signa's documented short-lived client-token pattern:

1. The browser asks `POST /api/signa/token` for a five-minute client token.
2. The Netlify Function uses `SIGNA_KEY` only to mint that token. It does not
   sign text or render video.
3. The browser calls Signa directly with the short-lived token:
   `POST /v1/sign` (`from: "en"`, `to: "ase"`) for `.sgn` bytes, then
   `POST /v1/sign/video` for the MP4.

This removes video rendering from Netlify's synchronous-function time limit.
The browser allows up to 45 seconds for the two Signa calls. A Signa-side HTTP
error, including a vendor 504, is shown as a Signa response instead of being
relabelled as Unmute's serverless timeout. The serverless function can still
return a distinct timeout if Signa's **token service** itself does not respond.

The main key is never put in browser code. The browser holds a `ct_…` token in
module memory only; it is not persisted. Signa's client-token documentation
allows client tokens to call signing and video endpoints from a web page.

## Configure and verify the deployment

The deployed `SIGNA_KEY` status must be checked in the exact Netlify deploy
context being tested; the repository cannot see the value. In the Unmute app's
Netlify site, set `SIGNA_KEY` as a server-side environment variable and include
the **Deploy previews** context if testing a pull-request preview. Then redeploy.

Check `GET /api/signa/status` on that same deployment. It returns only whether
a non-empty key is present, the vendor and direction (`en` → `ase`); it never
returns or tests the key. `configured: true` does not prove Signa accepts it.
The first approved test phrase verifies authentication and rendering.

Use a short, non-sensitive English phrase in the clinician **Speak** direction.
A successful test should produce an MP4. If it fails, copy the displayed stage
and HTTP status (`token`, `sign`, or `video`) for diagnosis. Do not infer that a
shorter sentence will fix a timeout. A `401` means the server-side key was
rejected; a `403`/`429`/`5xx` should be read with the returned stage and vendor
message.

Do **not** paste the key into chat, `index.html`, a meta tag, `UNMUTE_CONFIG`,
or a committed file. For local testing, provide `SIGNA_KEY` in the process
environment before starting `node app/server.mjs`.

## Speak stage and the idle avatar

The current implementation calls `/v1/sign` with English text, then
`/v1/sign/video` to get a generated MP4. It does not yet initialize the
animated idle-avatar session shown in the Signa demonstration. Speak now has a
dedicated API mount and deliberately shows no static image or scripted signer.
The idle-avatar API/SDK initialization must be added before an animated avatar
can appear while waiting; the current generated-video flow remains available
after a phrase is translated.

## Clinician conversation flow

- Tap **Speak** once to start a continuous browser speech-recognition session.
- The recognized transcript stays visible as the clinician talks.
- Two seconds of detected silence completes the current chunk and queues its
  English → ASL output. Listening remains active for the next chunk.
- Tap **Speak / Stop** again to end recognition and the microphone meter. Any
  final transcript text is flushed for signing.
- **Repeat** replays the most recently completed *successful* sign output. If a
  newer chunk is still rendering, the previous completed output remains
  repeatable.

Browser `SpeechRecognition` support varies. If it is unavailable, the app says
so; it does not fabricate a transcript. The browser's speech-recognition
service is separate from Signa. Signa receives English text, not microphone
audio. Do not use patient information for testing.

## Safeguards and limits

- Each Signa text request is capped at 300 characters. A generated MP4 consumes
  video quota; a failed video is not charged according to Signa's docs.
- The token endpoint allows six requests per IP per minute per warm function
  instance. The browser reuses a token while it is valid. This is a burst guard,
  not user authentication or a durable global quota.
- The Netlify function does not store transcript, `.sgn`, token, or video. The
  browser keeps the token and MP4 object URL in memory for the page session.
- Signa may skip words it cannot sign. Keep the clinician's English transcript
  visible and review the generated signing; do not assume every word was
  conveyed.
- The avatar output has not been validated by Deaf ASL users or qualified
  sign-language professionals. Do not use it for patient care or clinical
  decisions.
- `?provider=mock` forces the scripted demo without contacting either vendor.
  `?provider=signspeak` selects Sign-Speak for English-to-sign comparison when
  its provider is configured.

## Direction status

| Direction | Provider | Status |
|---|---|---|
| Clinician English → ASL avatar | Signa AI | Short-lived client-token flow implemented; deploy-context key status and live sandbox result must be verified. |
| Patient ASL → English | Separate recognition provider | Signa does not provide this direction; it remains separate and may be scripted. |

Signa's ASL **output** support does not establish ASL **recognition** support.
