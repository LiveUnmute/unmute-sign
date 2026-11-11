#!/usr/bin/env python3
"""
Render the two proposals.

    Unmute-Proposal-Hospital-Partnership-2026.pdf
    Unmute-Proposal-ASLIN-2026.pdf

    /home/user/venv_deck/bin/python proposals/build_proposals.py
"""

from pathlib import Path

from pdfkit import (BLUE, BONE, BOTTOM, CW, INK, LINE, M, MUTE, MUTE2, PAPER,
                    PH, PW, ROOT, Doc, render)
from reportlab.lib.colors import HexColor

import content as C

HERE = Path(__file__).resolve().parent
OUT = HERE
ASSETS = ROOT / "pitch-deck" / "assets"
COLOR_LOGO = ROOT / "app" / "assets" / "unmute-logo-trimmed.png"


def smart(s):
    """Typographic apostrophes. The wording is untouched."""
    return s.replace("'", "\u2019")


# ══════════════════════════════════════════════════════════════════════════
# masthead
# ══════════════════════════════════════════════════════════════════════════

def masthead(d, title_lines, meta, eyebrow):
    d.rect(0, PH - 6, PW, 6, BLUE)

    d.image(COLOR_LOGO, M, PH - 60, 23)
    d.text(M + CW, PH - 44, eyebrow, "AR", 7, MUTE, track=1.3, align="right")
    d.text(M + CW, PH - 56, "2026", "AR", 7, MUTE2, track=1.3, align="right")

    d.line(M, PH - 74, M + CW, PH - 74, INK, 1.4)

    size = 29.0
    while size > 12 and max(d.measure(l, "AB", size) for l in title_lines) > CW:
        size -= 0.5

    y = PH - 74 - size * 1.06
    for i, line in enumerate(title_lines):
        d.text(M, y, line, "AB", size, BLUE if i == len(title_lines) - 1 else INK)
        y -= size * 1.06

    y -= 14
    for label, value in meta:
        label_w = 96.0
        lines = d.wrap(smart(value), "SG", 8.8, CW - label_w)
        d.text(M, y, label.upper(), "AR", 6.6, MUTE2, track=1.2)
        yy = y
        for ln in lines:
            d.text(M + label_w, yy, ln, "SG", 8.8, INK)
            yy -= 11.4
        y = min(y, yy) - 5.6
        d.line(M, y + 9, M + CW, y + 9, LINE, 0.7)

    d.y = y - 6


# ══════════════════════════════════════════════════════════════════════════
# body
# ══════════════════════════════════════════════════════════════════════════

def body(d, blocks):
    prev = None
    for blk in blocks:
        kind = blk[0]

        # a little air when a list ends and prose resumes
        if prev in ("b", "n") and kind not in ("b", "n"):
            d.y -= 4

        if kind == "h":
            _, num, title = blk
            d.heading(num, smart(title))
        elif kind == "p":
            d.para(smart(blk[1]), size=9.4, leading=13.9, space_after=6.2)
        elif kind == "b":
            d.bullet(smart(blk[1]), size=9.4, leading=13.2)
        elif kind == "n":
            _, n, text = blk
            d.numbered(n, smart(text), size=9.4, leading=13.2)
        elif kind == "s":
            d.subhead(smart(blk[1]))
            prev = blk[0]
            continue

        prev = kind


def closing(d):
    """Contact block. Sits at the foot of the last page, never split."""
    d.need(118)
    d.y -= 10
    d.line(M, d.y, M + CW, d.y, LINE, 0.8)
    d.y -= 16
    d.text(M, d.y, "CONTACT DETAILS", "AR", 6.8, MUTE2, track=1.4)
    d.y -= 16

    rows = list(C.CONTACT.items())
    half = 3
    for i, (k, v) in enumerate(rows):
        col = 0 if i < half else 1
        row = i if i < half else i - half
        x = M + col * (CW / 2)
        y = d.y - row * 15
        d.text(x, y, k.upper(), "AR", 6.2, MUTE2, track=1.1)
        d.text(x + 62, y, v, "SG", 9, INK)

    d.y -= half * 15 - 4

    # ── black band ──
    h = 60.0
    d.need(h + 8)
    d.y -= 10
    d.rect(M, d.y - h, CW, h, INK)
    d.image(ASSETS / "unmute-logo-white.png", M + 18, d.y - 34, 14)
    d.text(M + 18, d.y - 46, "TWO-WAY SIGN LANGUAGE FOR HEALTHCARE",
           "AR", 6.0, MUTE2, track=1.2)
    d.text(M + CW - 18, d.y - 26, "contact@liveunmute.com", "SGB", 9, BONE,
           align="right")
    d.text(M + CW - 18, d.y - 39, "+234 904 282 0707", "SGB", 9, BONE,
           align="right")
    d.text(M + CW - 18, d.y - 50, "liveunmute.com  ·  app.liveunmute.com",
           "SG", 6.8, MUTE2, align="right")

    d.y -= h


# ══════════════════════════════════════════════════════════════════════════
# documents
# ══════════════════════════════════════════════════════════════════════════

def build_hospital(d):
    d.running = C.HOSPITAL_RUNNING
    d.rect(0, 0, PW, PH, PAPER)
    masthead(d, C.HOSPITAL_TITLE, C.HOSPITAL_META, "PROPOSAL · HOSPITAL PARTNERSHIP")
    body(d, C.HOSPITAL)
    closing(d)
    return d.page


def build_aslin(d):
    d.running = C.ASLIN_RUNNING
    d.rect(0, 0, PW, PH, PAPER)
    masthead(d, C.ASLIN_TITLE, C.ASLIN_META, "PROPOSAL · ASLIN LANGUAGE PARTNERSHIP")
    body(d, C.ASLIN)
    closing(d)
    return d.page


if __name__ == "__main__":
    p1 = OUT / "Unmute-Proposal-Hospital-Partnership-2026.pdf"
    n1 = render(build_hospital, p1,
                "Unmute — Proposal for Hospital Partnership and Pilot Evaluation",
                "Institutional collaboration, product evaluation, and potential pilot partnership")
    print(f"{p1.name}: {n1} pages, {p1.stat().st_size:,} bytes")

    p2 = OUT / "Unmute-Proposal-ASLIN-2026.pdf"
    n2 = render(build_aslin, p2,
                "Unmute — Proposal for ASLIN Language Partnership and Clinical Evaluation",
                "Language partnership, interpreter review, and controlled clinical evaluation")
    print(f"{p2.name}: {n2} pages, {p2.stat().st_size:,} bytes")
