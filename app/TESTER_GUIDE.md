# Tester guide — Unmute prototype

Hand this to whoever is testing. One page.

---

## What this is

A prototype of the two-direction app flow. The clinician's English can be
rendered as an ASL avatar by Signa when `SIGNA_KEY` is configured. Patient
ASL → English recognition is a separate integration and remains scripted until
Sign-Speak is configured.

**This is not a clinically validated translator.** The patient's phrases and
recognition score are scripted unless a recognition provider is active. Signa
output is also being evaluated, not approved for patient care. Please test the
*flow* — not medical accuracy — with non-sensitive sample phrases and consenting
testers only.

---

## Test phrases

### Patient signs → text (patient on camera)

Until a recognition provider is configured, these phrases are demo content, not
read from the camera:

| Demo phrase | What it means |
|---|---|
| I don't understand. | Ask for clarification |
| My chest hurts. | Report pain |
| It started two days ago. | Give a duration |
| My throat is sore. | Report a symptom |
| I get dizzy when I stand up. | Report a symptom |

The scripted sequence cycles through these five phrases. If Sign-Speak is later
configured, the app will instead show its recognition result for patient video.

### Clinician speaks → ASL signer (clinician on screen)

When Signa is configured, the browser's English speech transcript is sent to
Signa for ASL output. Tap **Speak** once to start a continuing conversation.
The transcript stays visible; a pause of two seconds completes a chunk and
starts its signing request while the microphone remains active for the next
chunk. Try short, non-sensitive phrases such as:

- Where does it hurt?
- Are you taking any medication?
- One moment, please.

Without a live output provider, the transcript still appears but no ASL video
is generated. If browser speech recognition is unavailable, the app explains
that rather than inventing a transcript.

---

## How to run through it

1. Open the **Sign** tab.
2. **Sign mode** (hand button): tap the hand to move to the next patient
   phrase — five of them, then it loops. The camera frame and the confidence
   score belong to this mode.
3. **Speak mode** (speech button): the patient disappears and the signer
   appears. Tap **Speak** once — the browser will ask for microphone permission.
   Allow it, then talk. **Your words appear as a live transcript.** A pause of
   two seconds completes that chunk and starts its ASL translation; keep talking
   for another chunk without tapping again.
4. Tap **Repeat** to replay the sign for the most recently completed output.
   While a newer chunk is still rendering, Repeat keeps the previous completed
   sign available. Tap **Stop** (the same speech control) to end the session;
   any final recognized text is flushed for signing. Ask whether the toggle and
   repeat behavior are obvious and easy to use on a ward.

---

## Questions worth answering

- Would a Deaf patient trust this screen? What would make them trust it less?
- On the clinician side, is the difference between "the patient is signing"
  and "I am speaking" obvious without reading the labels?
- Is the text big enough to read across a bed, now that it sits directly on
  the footage with no panel behind it?
- When the app isn't sure, what should it do — say nothing, or say
  "I'm not sure"?
- What is missing that you would need on a real shift?

---

## Known limits — please don't report these, we know

- Patient sign → English is scripted until a separate recognition provider is configured.
- Signa's ASL output is not evidence of sign recognition and has not been validated by Deaf ASL users or qualified sign-language professionals.
- The animated idle Signa avatar API is not yet wired into Speak, so no static image is shown while waiting. The current text-to-video path produces an MP4 only after a phrase is translated.
- The history and settings screens are static mockups; nothing is saved and reloading resets the demo.
- Do not use real patient data or rely on the output for clinical decisions.
