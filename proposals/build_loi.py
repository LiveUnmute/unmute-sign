#!/usr/bin/env python3
"""
Unmute — one-page Letter of Intent, for printing and signing by hand.

    /home/user/venv_deck/bin/python proposals/build_loi.py

This is the paper version of landing/loi.html. The web form's dropdowns are the
problem: a printout cannot show which option was chosen, and a <select> has no
place on a clipboard. Every fixed-choice question here is a row of tick boxes
instead, and the open questions are ruled lines.

Three details that matter when somebody fills this in with a pen:

* 9pt boxes with generous spacing. Boxes that are too small are the first thing
  a person over fifty complains about, and a tick that lands outside the box
  reads as an unanswered question.
* Nothing is justified and no writing line is shorter than 100pt, because a
  signature needs room and a date written 20/10/26 must not look like 20/10/28.
* It must be exactly one page. Two pages means the back of the sheet falls off
  the clipboard, so the build fails rather than spilling.
"""

from pathlib import Path

from pdfkit import (BLUE, BONE, BOTTOM, CW, INK, LINE, M, MUTE, MUTE2, PAPER,
                    PH, PW, ROOT, Doc)

HERE = Path(__file__).resolve().parent
OUT = HERE / "Unmute-Letter-of-Intent-2026.pdf"
COLOR_LOGO = ROOT / "app" / "assets" / "unmute-logo-trimmed.png"
WHITE_LOGO = ROOT / "pitch-deck" / "assets" / "unmute-logo-white.png"

BX = 9.0          # tick box edge, points
SPREAD = 0.0      # extra air between sections, set by the layout pass
GAP = 3.6         # between box and label
LABEL_W = 112.0   # width of the question-label gutter
BAND_H = 40.0


# ── form primitives ──────────────────────────────────────────────────────

def box(d, x, y):
    d.rect(x, y - BX + 2.4, BX, BX, None, MUTE, 0.75)


def rule(d, x1, y, x2):
    d.line(x1, y - 3.0, x2, y - 3.0, MUTE2, 0.7)


def field_row(d, specs):
    """specs: [(label, frac), ...] laid out side by side across the measure."""
    d.need(22)
    total = CW
    x = M
    for label, frac in specs:
        w = total * frac
        lw = d.measure(label, "SG", 8.4)
        d.text(x, d.y, label, "SG", 8.4, INK)
        rule(d, x + lw + 6, d.y, x + w - 12)
        x += w
    d.y -= 21.5


def options(d, label, opts, above=False, size=8.2):
    """
    A tick-box question. Options wrap onto further rows rather than shrinking
    the boxes, so every box stays the same size on the page — a grid of boxes
    at three different sizes looks like three different kinds of question.

    above=True puts the label on its own line and gives the options the full
    measure. Use it when the row would otherwise leave one orphaned option
    hanging under the gutter.
    """
    gutter = 0 if above else LABEL_W
    start_x = M + gutter

    # what fits per row, at a fixed gap, decided before drawing anything
    gap = 20.0
    rows, cur, used = [], [], 0.0
    avail = CW - gutter
    for text in opts:
        w = BX + GAP + 2 + d.measure(text, "SG", size) + gap
        if cur and used + w > avail + 0.01:
            rows.append(cur)
            cur, used = [], 0.0
        cur.append(text)
        used += w
    if cur:
        rows.append(cur)

    d.need((16 if above else 0) + 15.8 * len(rows) + 2)
    if above:
        d.text(M, d.y, label, "SG", 8.4, INK)
        d.y -= 13

    for i, row in enumerate(rows):
        if i == 0 and not above and label:
            d.text(M, d.y, label, "SG", 8.4, INK)
        if len(row) == 1:
            x = start_x                      # a lone option starts at the gutter
        else:
            x = start_x
        for text in row:
            box(d, x, d.y)
            d.text(x + BX + GAP + 2, d.y, text, "SG", size, INK)
            x += BX + GAP + 2 + d.measure(text, "SG", size) + gap
        d.y -= 15.8


def checkboxes_2col(d, items):
    """Two columns of tick boxes, column-major (reads down, then across)."""
    left = [t for t, c in items if c == 0]
    right = [t for t, c in items if c == 1]
    n = max(len(left), len(right))
    colw = CW / 2
    for i in range(n):
        d.need(16)
        for col, texts in ((0, left), (1, right)):
            if i >= len(texts):
                continue
            x = M + col * colw
            box(d, x, d.y)
            d.text(x + BX + GAP + 2, d.y, texts[i], "SG", 8.4, INK)
        d.y -= 15.8


def section(d, num, title):
    d.need(40)
    d.y -= 9 + SPREAD
    d.line(M, d.y + 16, M + CW, d.y + 16, LINE, 0.8)
    d.y -= 9
    d.text(M, d.y, str(num), "AB", 15, BLUE)
    d.text(M + 26, d.y + 1, title.upper(), "AB", 12.4, INK)
    d.y -= 17


def sig(d):
    d.need(40)
    d.y -= 4
    w = (CW - 16) / 3
    for i, label in enumerate(["Signature", "Name in block capitals", "Date"]):
        x = M + i * (w + 8)
        d.line(x, d.y, x + w, d.y, MUTE, 0.8)
        d.text(x, d.y - 10, label.upper(), "AR", 6.0, MUTE2, track=1.1)
    d.y -= 24


def band(d):
    d.rect(0, 0, PW, BAND_H, INK)
    d.image(WHITE_LOGO, M, BAND_H - 22, 12)
    d.text(M, BAND_H - 32, "TWO-WAY SIGN LANGUAGE FOR HEALTHCARE",
           "AR", 5.4, MUTE2, track=1.2)
    d.text(M + CW, BAND_H - 15, "contact@liveunmute.com  ·  +234 904 282 0707",
           "SGB", 8, BONE, align="right")
    d.text(M + CW, BAND_H - 26, "liveunmute.com  ·  app.liveunmute.com",
           "SG", 6.4, MUTE2, align="right")


# ── the form ─────────────────────────────────────────────────────────────

def _build_into(d):
    """Draw the whole form into an existing Doc. Returns the finishing cursor."""
    d.running = "Unmute · Letter of Intent"
    d.no_footer = True
    d.bottom = BAND_H + 14      # the band is the floor, not the usual footer
    d.rect(0, 0, PW, PH, PAPER)
    d.rect(0, PH - 6, PW, 6, BLUE)

    # masthead
    d.image(COLOR_LOGO, M, PH - 56, 20)
    d.text(M + CW, PH - 38, "LETTER OF INTENT", "AR", 6.8, MUTE, track=1.2,
           align="right")
    d.text(M + CW, PH - 49, "NON-BINDING · 2026", "AR", 6.8, MUTE2, track=1.2,
           align="right")
    d.line(M, PH - 66, M + CW, PH - 66, INK, 1.4)

    d.y = PH - 92
    d.text(M, d.y, "LETTER OF INTENT", "AB", 21, INK)
    d.y -= 15
    d.para("A non-binding statement of intent to evaluate and deploy Unmute, for healthcare "
           "institutions and accessibility organisations.", size=8.2, leading=11.0,
           maxw=CW * 0.70)

    # 1 organisation
    section(d, 1, "Organisation")
    field_row(d, [("Legal name", 0.72)])
    field_row(d, [("Registered address", 1.0)])
    d.y -= 1
    options(d, "Organisation type", [
        "Hospital", "Clinic", "Primary care", "Teaching hospital",
        "Government agency", "NGO / charity", "Deaf association", "Other",
    ])

    # 2 scope
    section(d, 2, "Intended scope of engagement")
    d.text(M, d.y, "Tick all that apply.", "SG", 7.4, MUTE2)
    d.y -= 13
    checkboxes_2col(d, [
        ("Patient\u2013provider communication (healthcare)", 0),
        ("Accessible internal meetings", 1),
        ("Inclusive learning / education", 0),
        ("Customer service / front desk", 1),
        ("Public services / government", 0),
        ("Events and conferences", 1),
        ("Workplace accessibility / HR", 0),
        ("Transport and travel", 1),
        ("Other", 0),
    ])

    # 3 scale
    section(d, 3, "Indicative deployment scale")
    options(d, "Estimated annual usage", [
        "Under 1,000 signed minutes", "1,000 \u2013 10,000",
        "10,000 \u2013 50,000", "Over 50,000", "Not yet known",
    ], above=True)

    # 4 statement
    section(d, 4, "Statement")
    stmt = ("The Organisation confirms the signatory is authorised to sign on its behalf, and "
            "indicates its intention to explore an evaluation of Unmute. This letter is "
            "non-binding and creates no obligation on either party. It is not a commitment to "
            "purchase, deploy, or recommend the product. Any testing involving patients, "
            "clinical workflows, or personal information requires separate institutional "
            "authorisation, consent, privacy safeguards, and clinical oversight.")
    lead = 10.2
    lines = d.wrap(stmt, "SG", 7.7, CW - 22)
    h = len(lines) * lead + 10
    d.need(h)
    top = d.y + 2
    d.rect(M, top - h, CW, h, BONE)
    d.rect(M, top - h, 2.5, h, BLUE)
    d.y -= 2
    d.para(stmt, size=7.7, leading=lead, indent=12, maxw=CW - 22)
    d.y -= 2


    # 5 signatory
    section(d, 5, "Authorised signatory")
    field_row(d, [("Name", 0.62), ("Job title", 0.38)])
    options(d, "Position", [
        "Doctor / physician", "Nurse", "Clinical lead", "Department head",
        "Administrator", "Procurement", "IT / digital", "Other",
    ])
    field_row(d, [("Email", 0.60), ("Phone", 0.40)])
    field_row(d, [("Country", 0.45)])
    sig(d)

    band(d)
    return d.y


def build(spread):
    """Draw the form to OUT with the given inter-section spacing."""
    global SPREAD
    SPREAD = spread
    d = Doc(OUT, "Unmute — Letter of Intent 2026",
            "Non-binding statement of intent to evaluate and deploy Unmute")
    end = _build_into(d)

    # one page, or the back of the sheet falls off the clipboard
    if end < BAND_H + 12:
        raise SystemExit(f"the form overflows the sheet by {BAND_H + 12 - end:.0f}pt")
    d.save(end_page=False)
    return end


if __name__ == "__main__":
    import pymupdf

    # First pass measures the leftover; the second spends it as air between
    # sections, so the sheet is balanced rather than top-heavy with a blank
    # lower half — which on a form reads as "someone stopped designing".
    probe = Doc(OUT, "probe", "")
    SPREAD = 0.0
    end = _build_into(probe)
    # Four gaps between five sections. Anything above ~18pt pushes the signature
    # block onto a second page, so the spare goes into the form's own breathing
    # room rather than into a page break.
    leftover = max(0.0, end - (BAND_H + 16))
    spread = min(18.0, leftover / 4.0)
    build(spread=spread)

    pages = pymupdf.open(OUT).page_count
    if pages != 1:
        raise SystemExit(f"{OUT.name} came out {pages} pages, must be 1")
    print(f"{OUT.name}: {pages} page, {OUT.stat().st_size:,} bytes, "
          f"leftover {leftover:.0f}pt, spread {spread:.1f}pt")
