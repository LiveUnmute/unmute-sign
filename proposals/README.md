# One-page partnership proposal

`Unmute-Proposal-2026.pdf` — A4 portrait, one sheet, for hospital leadership and
for ASLIN (Association of Sign Language Interpreters of Nigeria).

```bash
/home/user/venv_deck/bin/python proposals/build_proposal.py
```

Requires `reportlab`; fonts are shared with the pitch deck at `pitch-deck/fonts/`.

## Why one document for two audiences

They are two halves of the same gap. A hospital can install software; it cannot
decide which signs a Deaf patient actually uses. Sending a hospital a pitch and
ASLIN a separate brief would imply the fix is two separate things. It is not.

## What it says

| Section | Claim |
|---|---|
| 01 The gap | Interpreter provision is rare, unscheduled and expensive; 21 hospitals visited, 2024 |
| 02 What Unmute is | Sign → text/speech, speech/text → sign, scoped to routine interactions |
| 03 What we are asking | Hospitals: one department, ≤10 practitioners, one month, no charge. ASLIN: a paid working session on real Nigerian signs |
| 04 Why one document | Neither half closes the gap alone |
| Right column | The numbers, and **what we are not claiming** |
| The pilot, in outline | Setup, scope, duration, measure, exit |
| Footer band | Next step, logo, email, phone, site |

## What it deliberately does not say

- **ASLIN is not described as a partner.** The audit
  (`unmute-audit/A_Intelligence_Report.md` §8) is explicit: one interview
  happened, no agreement or endorsement exists, and the word "partner" must not
  be used. The page carries the disclaimer in the black panel.
- **No accuracy figure.** There is no trained Nigerian Sign Language model, and
  the panel says so. A hospital that discovers this after signing would be right
  to walk.
- **No price.** `THE HOSPITAL PAYS. THE PATIENT NEVER DOES.` is deck language for
  investors; a procurement officer wants a number, and inventing one in a
  document ASLIN also reads would be a mistake. The pilot is offered free, which
  is true, instead.

## Editing

All copy is at the bottom of `build_proposal.py` in `build()`. Two guards:

- `SAFE` — the build **fails** if either column runs under the footer band. An
  orphaned heading is worse than no section: the page looks finished and the
  argument is missing.
- Body copy is measured into panels by a dry-run pass (`panel(draw=False)`), so
  the black block cannot outgrow its own text.

### Type and tracking

"Tracking" in this file widens **word** gaps, never letter gaps. Letter-spacing
is drawn with `charSpace`, and every PDF text extractor reproduces that as
`T H E G A P` — so a screen reader spells the label out. On a document about
communication that is not a cosmetic defect. Word spacing (`Tw`) applies only to
real space characters and leaves the text layer clean:

```bash
python -c "import pymupdf; print(pymupdf.open('proposals/Unmute-Proposal-2026.pdf')[0].get_text())"
```

Check that before shipping any edit. The catalog also declares `Lang = en-GB`.

## Contact details

`contact@liveunmute.com` · `+234 904 282 0707` · `liveunmute.com` · Abuja, Nigeria.
Phone number supplied by the founder, Oct 2026.

---

# The two proposals and the LOI

| File | Pages | For |
|---|---|---|
| `Unmute-Proposal-Hospital-Partnership-2026.pdf` | 4 | Hospital leadership |
| `Unmute-Proposal-ASLIN-2026.pdf` | 4 | ASLIN |
| `Unmute-Letter-of-Intent-2026.pdf` | 1 | Print, tick, sign, hand over |

```bash
/home/user/venv_deck/bin/python proposals/build_proposals.py
/home/user/venv_deck/bin/python proposals/build_loi.py
```

## The hospital proposal is the founder's text, word for word

Sections 1–10 are transcribed into `content.py` unchanged. **Do not edit for
style.** A test-style check used during the build confirms all 108 blocks appear
in the PDF text layer exactly:

```bash
python - <<'PY'
import pymupdf, re, sys; sys.path.insert(0,'proposals')
import content as C
flat = re.sub(r"\s+"," "," ".join(p.get_text() for p in
        pymupdf.open("proposals/Unmute-Proposal-Hospital-Partnership-2026.pdf")))
missing = [b for b in C.HOSPITAL
           if (b[2].upper() if b[0]=="h" else b[1] if b[0]=="s" else
               b[2] if b[0]=="n" else b[1]).upper() not in flat.upper()]
print("missing:", missing)
PY
```

## The ASLIN proposal shares sections 1, 2, 3 and 10 — and rewrites 4–9

Those four describe the problem and the product, so they are identical. The
middle sections are written for ASLIN, because an interpreter body asks
different questions of a tool like this than a hospital does: where ASL and
Nigerian Sign Language diverge, what the product should do when a sign is
unsupported, who gets credited, and how ASLIN's involvement is described in
public. Section 6 states plainly that no partnership or endorsement exists until
one is signed.

## The LOI is the paper version of landing/loi.html

The web form uses dropdowns. A printout cannot show which option was chosen and
a `<select>` has no place on a clipboard, so every fixed-choice question is a row
of 9pt tick boxes and the open questions are ruled lines. All 28 option labels
from the web form are present.

The build asserts the output is **one page** — two pages means the back of the
sheet falls off the clipboard.
