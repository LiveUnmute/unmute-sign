# Unmute MVP — Build Guide

**For:** a solo founder building this for the first time.
**Goal:** a working two-way conversation demo you can put in front of a hospital, built as fast as honestly possible.
**Written:** 22 October 2026.

---

## Read this first — four decisions you have to make before writing code

None of these are technical. All four change what you build, and three of them cost money or reputation if you get them wrong.

### Decision 1 — Which sign language? This is the big one.

Your landing page, your pitch and your demo all say **ASL**. The dataset you just sent is **Ghanaian Sign Language (GhSL)**. Those are different languages, with different grammar, different vocabulary and different Deaf communities.

You cannot train on GhSL and call the product ASL. That is not a marketing nuance — it is a factual claim that would be exposed the first time a Deaf ASL user opened the app.

There are three honest paths:

| Path | What it means | Cost | Time to demo |
|---|---|---|---|
| **A. Build on GhSL** | Pilot in Ghana. Rename ASL claims across the site, pitch and demo. Partner with KNUST/RAIL, who made the dataset. | Lowest | 3–4 weeks |
| **B. Build the pipeline on GhSL, port to ASL later** | Use GhSL to prove the architecture works, then collect ASL data with Deaf ASL signers. The *code* transfers; the *model* does not. | Low now, high later | 3 weeks + 3 months |
| **C. Stay ASL** | Ignore this dataset. Source ASL data (WLASL, How2Sign, or your own recordings). | Highest data cost | 3–6 months |

**My recommendation: B.** It is the only path where the work you do this month is not thrown away, and it is the only one where you can say something true on the landing page in the meantime. It also matches where you actually are — Enugu, next door to Ghana, with no Nigerian Sign Language healthcare corpus anywhere comparable.

Note the honest caveat with B: GhSL and ASL share some influence but are not mutually intelligible. A GhSL model proves the *machinery*. It proves nothing about ASL accuracy. Say that plainly when you show it.

> **Flag for later:** your landing page currently says ASL throughout. If you go with B, that needs revising before the site is shown to a Ghanaian clinical partner.

### Decision 2 — The dataset licence has two different answers. Resolve it in writing before you build on it.

I checked this specifically, and the sources disagree:

- The **Nature Scientific Reports paper** (doi 10.1038/s41598-026-43478-9) states the dataset *"is released under an academic license for non-commercial research purposes."*
- The **Kaggle dataset card** and at least one dataset index list it as **CC BY 4.0** (attribution only, commercial use permitted).

Those are not compatible. One allows you to sell a hospital subscription built on this data; the other does not.

**What to do:** email Dr Emmanuel Ahene and the Responsible AI Lab at KNUST (rail.knust.edu.gh) before you train anything you intend to commercialise. Ask one question: *"Is SignTalk-Gh cleared for use in a commercial product, and if so under what terms?"* Keep the reply.

This matters more than it looks. Your pricing page says $199/month per ward. That is commercial use. Building on a non-commercial licence and discovering it at pilot-contract stage would be very expensive.

**In the meantime:** build the pipeline on the **GSL Lexicon v1.0** (Leiden HANDS! Lab), which is unambiguously **CC BY 4.0** and includes per-frame OpenPose data for 1,200+ isolated signs. That gives you clean training data with no licence ambiguity while you wait for an answer.

### Decision 3 — Retrieval beats generation. Do not build an avatar.

Your instinct in the brief was *"a tablet... displays the corresponding supported ASL output."* There are two ways to produce that output:

- **Generation** — text → avatar animation, synthesised live.
- **Retrieval** — text → find the closest match in a library of pre-recorded signed sentences → play the clip.

The SignTalk-Gh paper itself concludes that **retrieval-based Text-to-Sign and Audio-to-Sign are the most suitable initial use cases** for this data, because a model trained by synthesis on five signers does not generalise.

Retrieval is also dramatically faster and cheaper for you: no animation rig, no per-frame inference, no latency budget, and the signing is *actually correct* because a real Deaf signer performed it. There is no Ghanaian Sign Language avatar product on the market — every text-to-sign vendor I could find (Sign-Speak, Hand Talk, Signapse, SignCaption, Kara) does ASL and/or BSL only.

**Build retrieval.** It is a database lookup and a `<video>` tag. It will work on day three.

### Decision 4 — What "recognise signing" means in v1

Free-flowing GhSL → English is a research problem, not a weekend project. Your MVP needs a **closed vocabulary**: 20–50 healthcare concepts, chosen with Deaf users and clinicians, that the model is trained to distinguish and nothing else.

The paper's own baseline results are moderate and it names signer-independent generalisation as the central challenge — the corpus has only **five professional signers**, so a model trained on it learns those five people's motion habits more than the language. Expect this and plan for it (Phase 5, enrolment).

---

## The architecture, in one picture

```
                        ┌──────────────────────────────┐
                        │        UNMUTE TABLET         │
                        │  camera · mic · screen · spk │
                        └──────────────────────────────┘

  DOCTOR  ──────────────────────────────────────────►  PATIENT
                                                    (sees sign)

   speaks                  ┌─────────────┐
     │                     │ Web Speech  │
     ▼                     │ API (free)  │
  ┌──────┐   English text  └─────────────┘
  │ mic  │──────────────────► "where does it hurt?"
  └──────┘                          │
                                    ▼
                          ┌───────────────────┐
                          │  PHRASE MATCHER   │  ← sentence embeddings
                          │  (runs locally)   │    or keyword rules
                          └───────────────────┘
                                    │  closest of 4,031 sentences
                                    ▼
                          ┌───────────────────┐
                          │  CLIP LIBRARY     │  ← pre-recorded GhSL MP4s
                          │  (Retrieval)      │    from SignTalk-Gh
                          └───────────────────┘
                                    │
                                    ▼
                              ▶ plays clip

  PATIENT ──────────────────────────────────────────►  DOCTOR
                                                    (sees + hears)

   signs                   ┌───────────────────┐
     │                     │  MediaPipe        │  543 landmarks
     ▼                     │  Holistic         │  per frame
  ┌──────┐                 └───────────────────┘
  │ cam  │─────────────────────────►│
  └──────┘                          ▼
                          ┌───────────────────┐
                          │  64-frame window  │
                          │  → Transformer    │  ← YOUR MODEL
                          └───────────────────┘
                                    │  top-3 classes + confidence
                                    ▼
                          ┌───────────────────┐
                          │  CONFIRM / FALLBACK│ ← patient taps if unsure
                          └───────────────────┘
                                    │
                          ┌─────────┴─────────┐
                          ▼                   ▼
                    English text      Web Speech Synthesis
                    on screen              → speaker
```

**The single most important idea in this whole document:** you never train on video. You convert every clip to **body/hand landmarks** once, then train on those numbers. A landmark file is ~1,000× smaller than the video and trains on a laptop. Almost every beginner tutorial gets this wrong and burns weeks on pixel-based models that never finish.

---

## Phase 0 — Set up your machine (4 hours)

### What you need

- A laptop with **20 GB free disk** minimum (23 GB for the dataset, or 8 GB if you take only the clips you need).
- Python 3.10 or 3.11.
- A free **Kaggle** account.
- A free **Google Colab** account (for GPU training — you do not need your own GPU).
- Node.js 18+ (you already have this — the demo runs on it).

### Commands

```bash
# 1. Python environment
python3 -m venv .venv
source .venv/bin/activate
pip install mediapipe opencv-python numpy pandas scikit-learn torch kaggle

# 2. Kaggle credentials
#    Go to kaggle.com → Account → Create New API Token
#    This downloads kaggle.json. Move it:
mkdir -p ~/.kaggle
mv ~/Downloads/kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json

# 3. Confirm it works
kaggle datasets list -s signtalk
```

You should see `responsibleailab/signtalk-ghana` in the output.

### What could go wrong

- **`kaggle: command not found`** → the venv is not active. Run `source .venv/bin/activate` again.
- **403 on download** → you have not accepted the dataset's terms on the website. Open the dataset page in a browser and click through once.

---

## Phase 1 — Get the data (1 day, mostly waiting)

### Download

```bash
kaggle datasets download -d responsibleailab/signtalk-ghana -p ./data --unzip
```

23 GB. On a slow connection, run it overnight. Check it finished:

```bash
ls data/*.mp4 | wc -l          # expect ~9,879
ls data/*.xlsx data/*.csv      # metadata: sentence IDs, English, category, signer
```

### Understand what you actually have

| Property | Value |
|---|---|
| Videos | 9,879 |
| Unique signed sentences | 4,031 |
| Signers | 5 professional (3 male, 2 female) |
| Resolution / fps | 1920×1080 / 30 |
| Average length | 8 seconds |
| Format | MP4 |
| Themes | 26 clinical categories |

The metadata file is the most valuable part. It maps **sentence ID → English translation → thematic category → signer ID**. That mapping is your entire retrieval index for the doctor→patient direction.

### Narrow it down (important)

You do not need 4,031 sentences for an MVP. Load the metadata and pick **the 20 sentences from your brief**:

- greetings and introductions
- "what brought you in today?"
- "where does it hurt?"
- "when did it start?"
- "do you have a fever / dizziness / allergies?"
- "have you taken any medication?"
- "do you understand?"
- "please repeat that"
- plus the common patient replies: "my head hurts", "my stomach hurts", "yes", "no"

```python
import pandas as pd
meta = pd.read_excel("data/Metadata.xlsx")   # check the actual filename
print(meta.columns.tolist())
print(meta["sentence_id"].head())
print(meta["english_translation"].head())
```

Pin those ~20 to a JSON file. That file is your product's **supported vocabulary**, and everything downstream reads from it. The demo's `js/phrases.js` already does exactly this — you are swapping 12 hand-written phrases for 20 rows from the metadata.

### What could go wrong

- **Metadata column names won't match the paper.** They never do. Print `meta.columns` first and adapt. Do not guess.
- **Some sentences have 3 renditions.** Pick one rendition per sentence for retrieval — the cleanest — and keep the others as backup clips.

---

## Phase 2 — Doctor → patient, working in 2 days

This is the easy half, and it is where you should start because it produces something demoable immediately.

### 2a. Speech → text

Use the **browser's built-in Web Speech API**. Free, no key, no account, no latency, works offline in Chrome after first load.

```js
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = "en-US";
recognition.onresult = (e) => {
  const text = [...e.results].slice(e.resultIndex)
    .filter(r => r.isFinal).map(r => r[0].transcript).join(" ");
  if (text.trim()) handleDoctorSpeech(text);
};
recognition.start();
```

**You already have this working** in `demo/js/live.js`.

Limits worth knowing now:

- Chrome and Edge only. Safari and Firefox do not support it.
- Needs an internet connection (Chrome sends audio to Google).
- Accuracy drops with strong accents. Test with a Nigerian-accented speaker before you demo — this is the single most likely thing to embarrass you on stage.

**If it proves unreliable, the upgrade path is Whisper.** Either the OpenAI API (`whisper-1`, ~$0.006/minute — a ten-minute demo costs under five cents) or `whisper.cpp` running locally for free. Do not start there; start with Web Speech and only move if it fails you.

### 2b. Text → which signed sentence?

Two options, in order of effort:

**Option 1 — keyword rules (2 hours).** Already built in `demo/js/phrases.js`. Works for 20 fixed sentences. Fragile the moment the doctor paraphrases.

**Option 2 — sentence embeddings (1 day, better).** Turn each of your 20 English sentences into a vector once; turn the doctor's transcript into a vector at runtime; pick the closest by cosine similarity. Handles paraphrase properly.

```python
# Offline, once — build the index
from sentence_transformers import SentenceTransformer
import json, numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")   # 80 MB, runs on CPU
vocab = json.load(open("vocab.json"))              # your 20 sentences
vectors = model.encode([v["english"] for v in vocab], normalize_embeddings=True)
np.save("index.npy", vectors)
```

```python
# At request time
q = model.encode([doctor_said], normalize_embeddings=True)[0]
scores = vectors @ q                    # cosine, because both are normalised
best = scores.argmax()
if scores[best] < 0.45:
    return {"match": None, "reason": "no confident match"}   # say so, don't guess
return vocab[best]
```

That threshold check is the most important line in the whole build. **When the doctor says something outside the set, the app must say so** — not play an approximate clip. In a clinical setting, a plausible wrong sentence is worse than an admitted gap. Your demo already does this; keep the behaviour.

You can run `all-MiniLM-L6-v2` in the browser via Transformers.js if you want zero backend, or on a tiny server. For 20 sentences, either is fine.

### 2c. Play the clip

```js
function playSigning(videoFile) {
  const v = document.getElementById("aslVideo");
  v.src = `/clips/${videoFile}`;   // the SignTalk-Gh MP4
  v.play();
}
```

That is the entire doctor→patient feature. A lookup and a `<video>` tag. No avatar, no synthesis, no GPU.

**Time to working: 2 days.** This is the part you can show a hospital next week.

> If you later need **ASL** rather than GhSL on this side, that is where a vendor fits: Sign-Speak's SDK does text→ASL avatar video. It does not do GhSL, which is why retrieval is the right call for now.

---

## Phase 3 — Convert every clip to landmarks (1 day of compute, run overnight)

This is the step that makes training possible on a laptop. Do it once and never look at the videos again.

### Why landmarks

| | Raw video | Landmarks |
|---|---|---|
| Size per 8s clip | ~2.5 MB | ~40 KB |
| Full dataset | 23 GB | ~400 MB |
| Trains on | a GPU cluster | your laptop |
| Contains | background, lighting, clothing | only body geometry |

Landmarks also strip out the studio backgrounds (the dataset was shot against white, green and grey) so the model cannot cheat by learning wall colour.

### The script

```python
import cv2, numpy as np, pandas as pd, mediapipe as mp
from pathlib import Path

holistic = mp.solutions.holistic.Holistic(
    static_image_mode=False, model_complexity=1,
    min_detection_confidence=0.5, min_tracking_confidence=0.5,
)

def extract(path, fps_target=15):
    cap = cv2.VideoCapture(str(path))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    step = max(1, int(round(fps / fps_target)))
    frames, i = [], 0
    while True:
        ok, frame = cap.read()
        if not ok: break
        if i % step == 0:
            res = holistic.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            frames.append(np.array([
                np.array(p).ravel() if (p := getattr(res, f"{part}_landmarks", None)) is not None
                else np.zeros(dim)
                for part, dim in (("pose", 132), ("left_hand", 63), ("right_hand", 63))
            ]))
        i += 1
    cap.release()
    return np.stack(frames) if frames else None

out = Path("landmarks"); out.mkdir(exist_ok=True)
for video in Path("data").glob("*.mp4"):
    arr = extract(video)
    if arr is not None:
        np.save(out / (video.stem + ".npy"), arr.astype(np.float16))
```

### Expect this

- **Runtime:** roughly 4–8 hours for the full set on a modern laptop. Run it with `nohup` and go to bed.
- **Output size:** ~400 MB total. Very manageable.
- **Some clips will fail** (occluded hands, signer off-frame). Log failures and move on; 5% loss is normal and acceptable.

### What could go wrong

- **`mp.solutions` is deprecated in newer MediaPipe.** If it errors, pin `pip install mediapipe==0.10.14`. The newer `tasks` API works too but needs a downloaded `.task` model file.
- **Hands missing on half the frames.** Check that signers are not cropped. If they are, lower `min_detection_confidence` to 0.3.

---

## Phase 4 — Train the recogniser (1–2 weeks, the real work)

### 4a. Normalise before you train

Raw landmarks are in camera coordinates — a signer further away produces smaller numbers. Normalise every frame the same way:

1. Move the origin to the midpoint of the shoulders.
2. Scale everything by **shoulder width**, so distance from camera stops mattering.
3. Drop the z-axis noise or smooth it; MediaPipe's z is unreliable.

```python
def normalise(frame):
    pose = frame[0:132].reshape(44, 3)
    ls, rs = pose[11], pose[12]                 # shoulders
    origin = (ls + rs) / 2
    scale = np.linalg.norm(ls - rs) + 1e-6
    return (frame.reshape(-1, 3) - origin) / scale
```

This one function is the difference between a model that works and one that does not. Skipping it is the most common beginner failure on sign-language datasets.

### 4b. Pick your classes

Start with **20–50 classes**, not 4,031. The 20 sentences from Phase 1 are the right scope. If you try to classify 4,031 sentences with five signers, you will get a model that looks accurate on training data and fails on every new person.

### 4c. The model

A small Transformer over a fixed window — this mirrors the published recipe:

```
Input:   64 frames × 258 features  (pose 132 + left hand 63 + right hand 63)
Model:   3–4 Transformer encoder layers, d_model=128, 4 heads
Output:  N classes (your 20–50)
Loss:    cross-entropy with label smoothing
Epochs:  40–60, early stopping on validation
```

```python
import torch, torch.nn as nn

class SignClassifier(nn.Module):
    def __init__(self, n_features=258, n_classes=20, d=128, layers=4, heads=4):
        super().__init__()
        self.proj = nn.Linear(n_features, d)
        self.pos  = nn.Parameter(torch.zeros(1, 64, d))
        enc = nn.TransformerEncoderLayer(d, heads, 4*d, batch_first=True, dropout=0.2)
        self.encoder = nn.TransformerEncoder(enc, layers)
        self.head = nn.Linear(d, n_classes)

    def forward(self, x):                 # x: (B, 64, 258)
        h = self.proj(x) + self.pos
        h = self.encoder(h).mean(dim=1)   # mean-pool over time
        return self.head(h)
```

### 4d. Split by signer, not by clip

**This is the mistake that ruins the project.** If you split randomly, the same signer appears in train and test, and you will report a very high accuracy that collapses on a new person. (The specific numbers depend on your model — the pattern is what matters, and it is the one the SignTalk-Gh authors report seeing in their own baselines.)

```python
# Correct
train = meta[meta.signer_id != 5]
test  = meta[meta.signer_id == 5]      # a person the model has never seen

# Wrong — never do this
# train, test = train_test_split(meta, test_size=0.2, random_state=42)
```

Then do leave-one-signer-out: repeat with each of the five held out, and report the **worst** fold. That number is your honest accuracy. The SignTalk-Gh paper reports moderate results for exactly this reason; expect to see the same.

### 4e. Train on Colab (free)

```python
# In a Colab notebook
# 1. Upload landmarks/ (400 MB — use Google Drive, not the browser uploader)
# 2. Train
model = SignClassifier(n_classes=len(classes)).cuda()
opt = torch.optim.AdamW(model.parameters(), lr=1e-4, weight_decay=0.01)
# ... standard loop, ~40 epochs, early stopping on the held-out signer
torch.save(model.state_dict(), "sign_model.pt")
```

A free Colab T4 trains this in **20–60 minutes**. You do not need paid compute for the MVP.

### What could go wrong

- **Accuracy looks great, demo fails.** You split by clip, not signer. Go back to 4d.
- **Loss does not move.** Learning rate too high (try 1e-4) or normalisation missing.
- **Confused between two specific signs.** Look at them side by side; usually one is a movement variant the fixed 64-frame window is clipping. Add that pair to your "requires interpreter" list rather than forcing it.

---

## Phase 5 — Put it in the app (3–4 days)

### Browser vs server

Two choices for running the model:

| | On-device (ONNX Runtime Web) | Small server |
|---|---|---|
| Latency | ~30 ms | 200–500 ms |
| Privacy | video never leaves the tablet | video must be uploaded |
| Cost | free | ~$5–20/month |
| Complexity | higher (ONNX export) | lower |

For a hospital pilot, **on-device wins on privacy alone** — you can tell a hospital "no patient video leaves this device", which is a real procurement advantage. Export with `torch.onnx.export(model, dummy, "sign_model.onnx")` and run it in the browser.

Start with a server if you want it working sooner; the client code is a `fetch` either way.

### Pipeline in the client

```
camera → MediaPipe landmarks (30 fps)
       → rolling buffer of last 64 frames
       → normalise
       → model → top-3 + confidence
       → if top1 > 0.75 AND held for 3 consecutive frames → commit response
       → else → show chips, let the patient pick
```

Two guards matter:

1. **Hold before commit.** A single frame must never put words in a patient's mouth. Your demo already requires ~650 ms of stability before committing.
2. **Always offer the fallback.** Chips are not a failure state; they are the honest fallback your brief already specified.

### Enrolment — the fix for five signers

Because the corpus has only five signers, a new patient will be a stranger to the model. Add a **30-second enrolment** the first time someone uses it:

1. The tablet asks the patient to sign each of the ~20 concepts once.
2. You store those 20 samples as a *personal* fine-tune, or as extra prototypes for a nearest-neighbour layer.

This is the single highest-value feature you can add to a model trained on five people. It turns a limitation into a designed-for behaviour, and it gives the pilot something concrete to test.

### Then close the loop

```
recognised class → English text on the doctor's panel
                 → speechSynthesis.speak(englishText)  → speaker / AirPods
```

`window.speechSynthesis` is free and built in. For better voices, ElevenLabs or Azure TTS are drop-in replacements later — but ship free first.

---

## Phase 6 — The honesty layer (do not skip)

Every one of these is a sentence in the UI, and each one is doing real work:

1. **"No ASL/GhSL output for that phrase."** When the doctor says something outside the 20.
2. **"Only supported signs are recognised."** A caption under the camera, always visible.
3. **Top-3 with the patient choosing.** The model proposes; the patient decides.
4. **"Complex diagnosis, consent and emergencies need a qualified interpreter."** On the ready screen and in the summary.
5. **No accuracy figure anywhere** until you have a signer-independent number you can defend.

Unmute's pitch is that it reduces reliance on on-site interpreters. The honest version of that sentence is *"for routine interactions"* — and that qualifier is what makes a hospital able to say yes, because it is what a clinical governance person will need to hear.

---

## The API and endpoint list

| Need | Recommended | Cost | When to upgrade |
|---|---|---|---|
| **Speech → text** | Web Speech API (browser) | free | OpenAI Whisper `whisper-1` (~$0.006/min) or `whisper.cpp` locally if accents fail |
| **Text → signed clip** | Your own retrieval index | free | Sign-Speak SDK — **ASL only**, not GhSL |
| **Sentence matching** | `all-MiniLM-L6-v2` via sentence-transformers | free | OpenAI `text-embedding-3-small` if you go multi-lingual |
| **Landmarks** | MediaPipe Holistic | free | MediaPipe Tasks (Pose + Hand) for browser |
| **Sign recogniser** | Your own Transformer | free | — | 
| **Text → speech** | Web Speech Synthesis | free | ElevenLabs / Azure Neural TTS |
| **Camera** | `getUserMedia` | free | — |
| **Hosting** | Any static host + one small function | ~$0–20/mo | — |

**Endpoints you will actually write, whole list:**

```
POST /api/match        { text }  → { clip, sentenceId, score } | { match: null }
GET  /clips/:id.mp4             → the signed video
POST /api/confirm      { classId } → { english }        (optional, server model only)
```

Three endpoints. That is the whole backend. Everything else — mic, camera, landmarks, speech playback — runs in the browser.

---

## Costs, honestly

| Item | One-off | Monthly |
|---|---|---|
| Dataset | £0 | — |
| Colab training | £0 (free T4) | — |
| Hosting | £0 | £0–15 |
| Domain (you have one) | — | ~£1 |
| Optional: Whisper | — | pennies per demo |
| Optional: better TTS | — | ~£5 |
| **Total to a working demo** | **£0** | **£0–20** |

You do not need to spend money to build this. The constraint is your time and the licence question, not budget.

---

## What to skip

Being explicit, because scope creep is what kills solo projects:

- ✗ **A text-to-sign avatar.** No GhSL avatar exists; retrieval is correct and also free.
- ✗ **Free-flowing sign translation.** Not a v1 capability, and pretending otherwise will end the pilot.
- ✗ **Your own ASR model.** Web Speech, then Whisper if needed.
- ✗ **A backend database.** A JSON file and a folder of MP4s.
- ✗ **User accounts, auth, multi-tenancy.** Not until a hospital asks.
- ✗ **Fine-tuning on all 4,031 sentences.** Twenty is the MVP.
- ✗ **Phone app.** A web page on a tablet is the product.
- ✗ **Nigerian Sign Language data collection.** Only after the pipeline works on GhSL.

---

## Timeline

| Week | What you build | Output |
|---|---|---|
| **0** | Setup, licence email sent, decide GhSL vs ASL | Data on disk |
| **1** | Download, pick 20 sentences, retrieval + Web Speech | **Doctor→patient works** |
| **1** | Landmark extraction (overnight) | 400 MB of training data |
| **2** | Train on Colab, signer-independent split | Honest accuracy number |
| **3** | Wire into app, add enrolment, add fallback | **Both directions work** |
| **4** | Polish, test with a Deaf user, rehearse demo | Pilot-ready |

**Four weeks.** The doctor→patient half is two days of that.

---

## The demo script (one complete exchange)

Your brief is right that this should be one exchange, not a feature list.

1. Open Unmute. Pick front camera. **Start conversation.**
2. Doctor, aloud: *"Where does it hurt?"*
3. Tablet plays the signed clip. *(Patient sees sign.)*
4. Patient signs: **stomach**.
5. Doctor's panel: *"My stomach hurts"* — and it is spoken aloud.
6. Doctor, without restarting: *"How long has this been going on?"*
7. Patient signs: **a few days**.
8. Doctor's panel updates. Conversation continues.

Then the three questions from your brief — and the third one is the one that matters:

> *"Would your facility nominate practitioners to test this with Deaf users and give structured feedback?"*

That is the start of a pilot. It is not a sales request, and asking it is what moves you from demo to data.

---

## The two things that will decide whether this works

**1. The signer problem.** Five signers is the fundamental limitation, and it is the same one the dataset's authors name in their own paper. Enrolment is your answer. Test it early with someone the model has never seen — not with a colleague, and not with the signer whose clips you trained on.

**2. The interpreter question.** Your pitch says Unmute reduces reliance on on-site interpreters. That is defensible for routine interactions and indefensible for consent, diagnosis and emergencies — and a hospital's governance team will ask about exactly that boundary. Put it in the product, in the copy, and in the demo. It is not a hedge; it is the thing that makes the claim credible.

---

## Reference links

- **SignTalk-Gh on Kaggle** — kaggle.com/datasets/responsibleailab/signtalk-ghana
- **Paper** — Nature Scientific Reports, doi 10.1038/s41598-026-43478-9
- **SignTalk-Seq** — 36,450 clips, 54 sentences, 7 signers, better for continuous signing
- **GSL Lexicon v1.0** — Leiden HANDS! Lab, CC BY 4.0, 1,200+ isolated signs with per-frame OpenPose
- **Community baseline** — `github.com/Amasa614/gsl-signtalk-calibration` (MediaPipe Holistic + shoulder normalisation + Transformer over 64-frame windows — the same recipe as Phase 4)
- **Responsible AI Lab, KNUST** — rail.knust.edu.gh (the licence question goes here)
