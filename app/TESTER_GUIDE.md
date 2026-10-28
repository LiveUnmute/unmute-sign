# Tester guide — Unmute prototype

Hand this to whoever is testing. One page.

---

## What this is

A prototype of the app a clinician would open on the ward. The patient signs,
the app shows text; the clinician speaks, the app shows a signer.

**It is not a working translator.** There is no sign-recognition model behind
it. The phrases come from a fixed list, and the recognition score on screen is
cosmetic. Please test the *flow* — where your eyes go, what is confusing, what
is missing — not the accuracy.

---

## The supported phrases

These are the only sentences the prototype knows. Nothing outside this list
will be recognised, and the app will not invent anything.

### Patient signs → text  (the patient is on camera)

| Gesture | What it means in the app |
|---|---|
| Both palms open, raised | I don't understand. |
| Hand flat on the chest | My chest hurts. |
| Two fingers raised | It started two days ago. |
| Hand at the throat | My throat is sore. |
| Hand at the temple | I get dizzy when I stand up. |

### Clinician speaks → signer  (the clinician is on screen)

| The clinician says | The signer renders |
|---|---|
| Where does it hurt? | "Where does it hurt?" |
| On a scale of 1 to 5, how bad is it? | the severity question |
| Are you taking any medication? | the medication question |
| One moment, please. | the wait |

---

## How to run through it

1. Open the **Sign** tab.
2. **Sign mode** (hand button): tap the hand to move to the next patient
   phrase. The camera frame and the confidence score belong to this mode.
3. **Speak mode** (speech button): the patient disappears and the signer
   appears. Tap speech once — the browser will ask for microphone permission.
   Allow it, say something, and wait.

   - If the browser supports speech recognition, **your words appear as text**.
   - If it doesn't, the app falls back to the next scripted line and says so
     underneath.
4. **Tap Repeat** (top right of the sheet) to replay the same translation.
   Ask yourself: is it obvious what it does? Is the button big enough on a
   ward, in a hurry?

---

## Questions worth answering

- Would a Deaf patient trust this screen? What would make them trust it less?
- On the clinician side, is the difference between "the patient is signing"
  and "I am speaking" obvious without reading the labels?
- Is the text big enough to read across a bed?
- When the app isn't sure, what should it do — say nothing, or say
  "I'm not sure"?
- What is missing that you would need on a real shift?

---

## Known limits — please don't report these, we know

- The patient phrases are scripted, not recognised.
- The signer is a still photograph, not animation.
- The history and settings screens are static mockups.
- Nothing is saved; reloading resets everything.
