#!/usr/bin/env python3
"""
Unmute — one-page partnership proposal, A4 portrait.

Two audiences on one sheet, because they are two halves of the same gap:
hospitals hold the room, ASLIN holds the language. Neither can fix the gap
alone, and a Deaf patient needs both fixed at once.

House style is inherited from pitch-deck/deck-2026/build.py — same palette,
same faces, same hard rules and no rounded corners — so a hospital that has
seen the deck recognises the paper.

    /home/user/venv_deck/bin/python proposals/build_proposal.py
"""

from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfdoc, pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas as pdfcanvas

HERE = Path(__file__).parent
ROOT = HERE.parent
FONTS = ROOT / "pitch-deck" / "fonts"

# ── page ─────────────────────────────────────────────────────────────────
PW, PH = 595.276, 841.890          # A4 portrait, points
M = 40.0
CW = PW - 2 * M                    # 515.276
FOOTER_H = 120.0                   # the black band
SAFE = FOOTER_H + 16.0             # nothing but the band may go below this

# ── palette (see pitch-deck/README.md) ───────────────────────────────────
BONE = "#EDEBE6"
PAPER = "#F7F6F3"
INK = "#0D0D0D"
BLUE = "#006AFE"
MUTE = "#6B6A64"
MUTE2 = "#9A9891"
LINE = "#C6C3BA"
DARKLINE = "#2E2E2E"

FACES = {
    "AB": "ArchivoBlack",
    "AX": "Archivo-ExtraBold",
    "AR": "Archivo-Bold",
    "SG": "SpaceGrotesk-Med",
    "SGB": "SpaceGrotesk-Bold",
}
for key, fn in [
    ("AB", "ArchivoBlack-Regular.ttf"),
    ("AX", "Archivo-ExtraBold.ttf"),
    ("AR", "Archivo-Bold.ttf"),
    ("SG", "SpaceGrotesk-Medium.ttf"),
    ("SGB", "SpaceGrotesk-Bold.ttf"),
]:
    pdfmetrics.registerFont(TTFont(FACES[key], str(FONTS / fn)))


def pdf_literal(s):
    """A PDF string literal. ASCII stays readable; anything else goes UTF-16BE hex."""
    if all(ord(ch) < 128 for ch in s):
        return "(" + s.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)") + ")"
    return "<FEFF" + s.encode("utf-16-be").hex().upper() + ">"


class Doc:
    def __init__(self, path):
        self.c = pdfcanvas.Canvas(str(path), pagesize=(PW, PH))
        self.c.setTitle("Unmute — Partnership Proposal 2026")
        self.c.setAuthor("Unmute")
        self.c.setSubject("Two-way sign language for healthcare — proposal to hospitals and ASLIN")
        self.c.setCreator("Unmute")

    # ── primitives ──────────────────────────────────────────────────────
    def rect(self, x, y, w, h, fill=None, stroke=None, lw=1.0):
        c = self.c
        if fill:
            c.setFillColor(HexColor(fill))
        if stroke:
            c.setStrokeColor(HexColor(stroke))
            c.setLineWidth(lw)
        c.rect(x, y, w, h, stroke=1 if stroke else 0, fill=1 if fill else 0)

    def line(self, x1, y1, x2, y2, col=LINE, lw=1.0):
        self.c.setStrokeColor(HexColor(col))
        self.c.setLineWidth(lw)
        self.c.line(x1, y1, x2, y2)

    def measure(self, s, font, size, track=0.0):
        """
        Width of a string. "Tracking" widens the gaps *between words*, never
        between letters.

        Letter-spacing would be drawn with charSpace, which every PDF text
        extractor faithfully reproduces as "T H E G A P" — so a screen reader
        spells the label out loud. PDF word spacing (Tw) applies only to real
        space characters, so the text layer stays intact and the small-caps
        labels keep their airy look.
        """
        w = pdfmetrics.stringWidth(s, FACES[font], size)
        if track and " " in s:
            w += track * 3.0 * s.count(" ")
        return w

    def text(self, x, y, s, font, size, col=INK, track=0.0, align="left"):
        c = self.c
        c.setFont(FACES[font], size)
        c.setFillColor(HexColor(col))

        w = self.measure(s, font, size, track)
        if align == "right":
            x -= w
        elif align == "center":
            x -= w / 2

        # Explicit charSpace(0) every time: canvas state is sticky, and one
        # tracked line would otherwise letterspace everything after it.
        t = c.beginText(x, y)
        t.setCharSpace(0)
        t.setWordSpace(track * 3.0 if track else 0)
        t.textOut(s)
        c.drawText(t)

    def wrap(self, s, font, size, maxw, track=0.0):
        out, cur = [], ""
        for word in s.split():
            trial = (cur + " " + word).strip()
            if self.measure(trial, font, size, track) <= maxw or not cur:
                cur = trial
            else:
                out.append(cur)
                cur = word
        if cur:
            out.append(cur)
        return out

    def para(self, x, y, s, font, size, col=INK, maxw=CW, leading=None, track=0.0):
        """Draw wrapped text; y is the first baseline. Returns the next baseline."""
        leading = leading or size * 1.38
        for ln in self.wrap(s, font, size, maxw, track):
            self.text(x, y, ln, font, size, col, track)
            y -= leading
        return y

    def para_h(self, s, font, size, maxw, leading=None, track=0.0):
        """Height of wrapped text without drawing it, so panels can be sized first."""
        leading = leading or size * 1.38
        return len(self.wrap(s, font, size, maxw, track)) * leading

    def fit(self, s, font, size, maxw):
        while size > 6 and self.measure(s, font, size) > maxw:
            size -= 0.5
        return size

    def image(self, path, x, y, h):
        im = ImageReader(str(path))
        w = h * im.getSize()[0] / im.getSize()[1]
        self.c.drawImage(str(path), x, y, w, h, mask="auto")
        return w

    def kicker(self, x, y, num, label, col=BLUE):
        self.text(x, y, num, "AR", 8, col, track=1.4)
        self.text(x + 18, y, label, "AR", 8, MUTE, track=1.7)

    def save(self):
        self.c.showPage()
        try:
            # A document about communication should declare its own language.
            self.c._doc.Catalog.Lang = pdfdoc.PDFString("en-GB")
        except Exception:
            pass
        self.c.save()


def build(out: Path):
    d = Doc(out)

    # ══ ground ══════════════════════════════════════════════════════════
    d.rect(0, 0, PW, PH, PAPER)
    d.rect(0, PH - 6, PW, 6, BLUE)

    # ══ masthead ════════════════════════════════════════════════════════
    d.image(ROOT / "app" / "assets" / "unmute-logo-trimmed.png", M, PH - 60, 24)

    d.text(PW - M, PH - 44, "PARTNERSHIP PROPOSAL · OCTOBER 2026", "AR", 8, INK,
           track=1.6, align="right")
    d.text(PW - M, PH - 57, "HOSPITALS  ·  ASLIN", "AR", 8, MUTE,
           track=1.6, align="right")

    d.line(M, PH - 74, PW - M, PH - 74, LINE, 1)

    # ══ headline ════════════════════════════════════════════════════════
    top = PH - 110
    size = d.fit("EVERY VOICE DESERVES", "AB", 36, CW)
    d.text(M, top, "EVERY VOICE DESERVES", "AB", size, INK)
    d.text(M, top - size * 1.04, "TO BE HEARD.", "AB", size, BLUE)

    y = top - size * 1.04 - 16
    y = d.para(
        M, y,
        "A proposal to hospital leadership, and to the Association of Sign Language "
        "Interpreters of Nigeria — the room and the language, addressed together.",
        "SG", 9.4, "#3A3A36", 452, leading=12.4)

    y -= 12
    d.line(M, y, PW - M, y, INK, 1.6)
    TOP = y - 17

    # ══ body split ══════════════════════════════════════════════════════
    LEFT_W = 306.0
    GAPC = 18.0
    RX = M + LEFT_W + GAPC
    RW = PW - M - RX

    # ───────────── left column ─────────────
    yl = TOP

    d.kicker(M, yl, "01", "THE GAP")
    yl -= 15
    yl = d.para(
        M, yl,
        "Interpreter provision in Nigerian hospitals is rare, unscheduled and expensive. "
        "In 2024 we visited 21 hospitals to ask who interprets when a Deaf patient arrives.",
        "SG", 8.9, "#2B2B28", LEFT_W, leading=12.2)
    yl -= 3
    yl = d.para(
        M, yl,
        "The answer was consistent: a relative, another patient, or a clinician improvising "
        "gestures. The conversation still happens. It just is not safe.",
        "SG", 8.9, "#2B2B28", LEFT_W, leading=11.9)
    yl -= 11
    d.line(M, yl, M + LEFT_W, yl, LINE, 0.8)
    yl -= 14

    d.kicker(M, yl, "02", "WHAT UNMUTE IS")
    yl -= 16
    rows = [
        ("01", "THE PATIENT SIGNS",
         "Supported sign language is turned into text and speech the clinician can read "
         "or hear immediately."),
        ("02", "THE CLINICIAN REPLIES",
         "A spoken or typed reply becomes visual sign-language output on the same screen, "
         "so the loop closes in the room."),
        ("03", "ROUTINE, NOT EVERYTHING",
         "Built around a predefined set of routine clinical interactions — pain, history, "
         "consent, next steps — so what it says can be reviewed before it is trusted."),
    ]
    for num, head, body in rows:
        d.text(M, yl, num, "AB", 9, BLUE)
        d.text(M + 21, yl, head, "AR", 8.3, INK, track=0.9)
        yl -= 12
        yl = d.para(M + 21, yl, body, "SG", 8.3, "#3A3A36", LEFT_W - 21, leading=11.0)
        yl -= 7
    yl -= 2
    d.line(M, yl, M + LEFT_W, yl, LINE, 0.8)
    yl -= 14

    d.kicker(M, yl, "03", "WHAT WE ARE ASKING")
    yl -= 15

    asks = [
        ("FROM HOSPITALS", BLUE,
         "A named clinical lead, one department, up to ten practitioners, and one month of "
         "routine use. We install, we train, we measure accuracy and usability with you. "
         "No charge for the pilot."),
        ("FROM ASLIN", INK,
         "A working session on the signs Nigerian patients and clinicians actually reach for, "
         "including regional and local variants. We fund the sessions, credit every "
         "contributor, and treat Nigerian Sign Language as a language in its own right — "
         "not a dialect of ASL."),
    ]
    for label, col, body in asks:
        d.rect(M, yl - 6.5, 3, 8.5, col)
        d.text(M + 10, yl, label, "AR", 8, col, track=1.4)
        yl -= 13
        yl = d.para(M + 10, yl, body, "SG", 8.3, "#3A3A36", LEFT_W - 10, leading=11.0)
        yl -= 9

    # ───────────── why one document ─────────────
    yl -= 14
    d.line(M, yl, M + LEFT_W, yl, LINE, 0.8)
    yl -= 14
    d.kicker(M, yl, "04", "WHY ONE DOCUMENT")
    yl -= 15
    yl = d.para(
        M, yl,
        "A hospital can install software, but it cannot decide which signs a Deaf patient "
        "uses. Neither half of the gap closes on its own.",
        "SG", 8.9, "#2B2B28", LEFT_W, leading=11.9)
    LEFT_BOTTOM = yl

    # ───────────── right column: the numbers ─────────────
    PANEL_TOP = TOP + 2
    px, pw = RX + 15, RW - 30

    stats = [("21", "HOSPITALS VISITED", BONE),
             ("0", "HAD AN INTERPRETER ON SITE", BLUE),
             ("16", "SIGNED LETTERS OF INTENT", BONE)]
    disc1 = ("There is no validated Nigerian Sign Language model yet. Unmute begins with "
             "ASL and routine interactions. A pilot is an evaluation, not a deployment.")
    disc2 = ("This document is a proposal to ASLIN. It implies no partnership, "
             "endorsement or agreement until one is signed.")

    def panel(draw):
        """The black block. Runs twice: once to measure, once to draw.

        Keeping the measuring and the drawing in one function is the only way
        they cannot drift — a hand-summed height is what put the outline under
        the footer on the first attempt.
        """
        py = PANEL_TOP - 20
        if draw:
            d.text(px, py, "THE GAP IN NUMBERS", "AR", 7, BLUE, track=1.4)
        py -= 15
        py = d.para(px, py, "Unmute field visits, 21 Nigerian hospitals, 2024.",
                    "SG", 6.8, MUTE2, pw, leading=9) if draw else py - 9
        py -= 13

        for big, cap, col in stats:
            if draw:
                d.text(px, py, big, "AB", 29, col)
            py -= 10
            for ln in d.wrap(cap, "AR", 6.6, pw, 1.0):
                if draw:
                    d.text(px, py, ln, "AR", 6.6, "#C9C6BE", track=1.0)
                py -= 8.4
            py -= 10
            if draw:
                d.line(px, py + 5, px + pw, py + 5, DARKLINE, 0.7)
            py -= 11

        py -= 1
        if draw:
            d.text(px, py, "WHAT WE ARE NOT CLAIMING", "AR", 7, BLUE, track=1.4)
        py -= 11
        py = (d.para(px, py, disc1, "SG", 7, "#9A9891", pw, leading=9.6) if draw
              else py - d.para_h(disc1, "SG", 7, pw, 9.6))
        py -= 10
        py = (d.para(px, py, disc2, "SG", 7, "#9A9891", pw, leading=9.6) if draw
              else py - d.para_h(disc2, "SG", 7, pw, 9.6))
        return py

    PANEL_BOTTOM = panel(draw=False) + 4
    d.rect(RX, PANEL_BOTTOM, RW, PANEL_TOP - PANEL_BOTTOM, INK)
    panel(draw=True)

    # ───────────── right column: the pilot, in outline ─────────────
    oy = PANEL_BOTTOM - 20
    d.text(RX, oy, "THE PILOT, IN OUTLINE", "AR", 7, INK, track=1.4)
    oy -= 6
    d.line(RX, oy, RX + RW, oy, INK, 1.2)
    oy -= 14

    steps = [
        ("SETUP", "Half a day on site: install, account setup, and training for the team."),
        ("SCOPE", "One department, up to ten practitioners, routine clinical interactions."),
        ("DURATION", "Four weeks of ordinary use — not a scripted demonstration."),
        ("MEASURE", "Recognition accuracy, time saved, and where it fails. Reported to you."),
        ("EXIT", "No obligation. If it does not earn its place, we stop and say so."),
    ]
    for label, body in steps:
        d.text(RX, oy, label, "AR", 6.6, BLUE, track=1.2)
        oy -= 9.5
        oy = d.para(RX, oy, body, "SG", 7.2, "#2B2B28", RW, leading=9.6)
        oy -= 6

    RIGHT_BOTTOM = oy

    # A heading that lands under the footer is worse than no section at all:
    # the page looks finished and the argument is missing. Fail instead.
    for name, bottom in [("left column", LEFT_BOTTOM), ("right column", RIGHT_BOTTOM)]:
        if bottom < SAFE:
            raise SystemExit(
                f"{name} runs {SAFE - bottom:.0f}pt into the footer band "
                f"(bottom {bottom:.0f}, safe limit {SAFE:.0f}). Tighten the copy.")

    # ══ the ask + contact band ══════════════════════════════════════════
    d.rect(0, 0, PW, FOOTER_H, INK)

    d.text(M, FOOTER_H - 24, "NEXT STEP", "AR", 7.2, BLUE, track=1.6)
    d.text(M + 74, FOOTER_H - 24, "One visit, thirty minutes, at your hospital.",
           "SG", 9.2, BONE)
    d.text(M, FOOTER_H - 38,
           "Bring the clinical lead — and whoever already interprets for your Deaf patients.",
           "SG", 8, MUTE2)

    d.line(M, FOOTER_H - 54, PW - M, FOOTER_H - 54, DARKLINE, 0.8)

    d.image(ROOT / "pitch-deck" / "assets" / "unmute-logo-white.png", M, FOOTER_H - 86, 15)
    d.text(M, FOOTER_H - 102, "PRINCE NZUBUCHUKWU MICHAEL  ·  FOUNDER",
           "AR", 6.4, MUTE2, track=1.3)

    d.text(PW - M, FOOTER_H - 76, "contact@liveunmute.com", "SGB", 10, BONE, align="right")
    d.text(PW - M, FOOTER_H - 91, "+234 904 282 0707", "SGB", 10, BONE, align="right")
    d.text(PW - M, FOOTER_H - 105, "liveunmute.com  ·  Abuja, Nigeria",
           "SG", 7.2, MUTE2, align="right")

    d.save()
    return out


if __name__ == "__main__":
    out = Path(__file__).parent / "Unmute-Proposal-2026.pdf"
    build(out)
    print(f"wrote {out}  ({out.stat().st_size:,} bytes)")
