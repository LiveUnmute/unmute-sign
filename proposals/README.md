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
