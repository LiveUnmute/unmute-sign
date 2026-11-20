# Unmute Pre-Seed SAFE Deck ($300,000)

This directory contains a revised copy of the user-supplied 12-page PDF deck. The changes are limited to:

- The cover: adds the $300,000 pre-seed SAFE raise line (the supplied cover had no amount).
- The use-of-funds page: replaces the iDICE $10,000 grant allocation with the supplied $300,000 / 18-month allocation.
- The ask page: replaces the iDICE grant ask with the supplied $300,000 SAFE and target outcomes.

The other nine pages were preserved and verified pixel-identical to the source PDF. The two revised content pages label the outcomes as 18-month targets.

## Files

- `Unmute-Preseed-Source.pdf` — supplied source PDF.
- `Unmute-Preseed-300K-Updated.pdf` — revised 12-page PDF deliverable.
- `build.py` — rebuilds the PDF with PyMuPDF, preserving all unaffected pages.

Run from the repository root:

```bash
python -m pip install pymupdf
python pitch-deck/preseed-300k/build.py
```
