#!/usr/bin/env python3
"""
Unmute Sign — ten-slide pitch deck, 2026.

Written once, rendered twice:

    Unmute-Sign-Pitch-2026.pdf    Archivo Black + Space Grotesk, for upload
    Unmute-Sign-Pitch-2026.pptx   Arial Black / Arial fallbacks, for editing

House style is brutalist: hard rules, no rounded corners, no shadows, no
gradients, oversized type, one accent colour. Type is set large on purpose —
the previous decks were legible on a laptop screen and unreadable from the
back of a room.

    /home/user/venv/bin/python build.py
"""

import os
from pathlib import Path

from reportlab.pdfgen import canvas as pdfcanvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from pptx import Presentation
from pptx.util import Inches as In, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

HERE = Path(__file__).parent
FONTS = HERE.parent / "fonts"

W, H = 960.0, 540.0          # design canvas, points
M = 54.0                     # margin

# ── palette ──────────────────────────────────────────────────────────────
BONE  = "#EDEBE6"
PAPER = "#F7F6F3"
INK   = "#0D0D0D"
INK2  = "#1C1C1C"
BLUE  = "#006AFE"
BLUED = "#0056CC"
MUTE  = "#6B6A64"
MUTE2 = "#9A9891"
LINE  = "#C6C3BA"

# ── fonts ────────────────────────────────────────────────────────────────
# key -> (pdf name, pptx family, bold)
FACES = {
    "AB":  ("ArchivoBlack",     "Arial Black", True),
    "AX":  ("Archivo-ExtraBold","Arial Black", True),
    "AR":  ("Archivo-Bold",     "Arial",       True),
    "SG":  ("SpaceGrotesk-Med", "Arial",       False),
    "SGB": ("SpaceGrotesk-Bold","Arial",       True),
}

for name, fn in [
    ("ArchivoBlack", "ArchivoBlack-Regular.ttf"),
    ("Archivo-ExtraBold", "Archivo-ExtraBold.ttf"),
    ("Archivo-Bold", "Archivo-Bold.ttf"),
    ("SpaceGrotesk-Med", "SpaceGrotesk-Medium.ttf"),
    ("SpaceGrotesk-Bold", "SpaceGrotesk-Bold.ttf"),
]:
    pdfmetrics.registerFont(TTFont(name, str(FONTS / fn)))


def measure(s, font, size, track=0.0):
    w = pdfmetrics.stringWidth(s, FACES[font][0], size)
    if track and len(s) > 1:
        w += track * (len(s) - 1)
    return w


def wrap(s, font, size, maxw, track=0.0):
    out = []
    for para in s.split("\n"):
        if not para.strip():
            out.append("")
            continue
        words, cur = para.split(), ""
        for word in words:
            trial = (cur + " " + word).strip()
            if measure(trial, font, size, track) <= maxw or not cur:
                cur = trial
            else:
                out.append(cur)
                cur = word
        out.append(cur)
    return out


def fit(s, font, size, maxw, track=0.0, floor=18):
    """Shrink until it fits. Brutalist headlines must never wrap by accident."""
    while size > floor and measure(s, font, size, track) > maxw:
        size -= 1
    return size


# ── backends ─────────────────────────────────────────────────────────────

class Pdf:
    def __init__(self, path):
        self.c = pdfcanvas.Canvas(str(path), pagesize=(W, H))
        self.c.setTitle("Unmute Sign — Pitch Deck 2026")
        self.c.setAuthor("Prince Nzubechukwu Michael")
        self.c.setSubject("Two-way sign-language communication for healthcare")

    def bg(self, colour):
        self.c.setFillColor(HexColor(colour))
        self.c.rect(0, 0, W, H, stroke=0, fill=1)

    def rect(self, x, y, w, h, fill=None, stroke=None, lw=1.0):
        if fill:
            self.c.setFillColor(HexColor(fill))
        if stroke:
            self.c.setStrokeColor(HexColor(stroke))
            self.c.setLineWidth(lw)
        self.c.rect(x, H - y - h, w, h, stroke=1 if stroke else 0, fill=1 if fill else 0)

    def line(self, x1, y1, x2, y2, colour, lw=1.0):
        self.c.setStrokeColor(HexColor(colour))
        self.c.setLineWidth(lw)
        self.c.line(x1, H - y1, x2, H - y2)

    def circle(self, cx, cy, r, fill=None, stroke=None, lw=1.0):
        if fill:
            self.c.setFillColor(HexColor(fill))
        if stroke:
            self.c.setStrokeColor(HexColor(stroke))
            self.c.setLineWidth(lw)
        self.c.circle(cx, H - cy, r, stroke=1 if stroke else 0, fill=1 if fill else 0)

    def text(self, x, y, s, font, size, colour, align="left", track=0.0):
        """y is the top of the em box."""
        self.c.setFont(FACES[font][0], size)
        self.c.setFillColor(HexColor(colour))
        baseline = H - (y + size * 0.80)
        width = measure(s, font, size, track)
        if align == "right":
            x = x - width
        elif align == "center":
            x = x - width / 2
        t = self.c.beginText(x, baseline)
        t.setFont(FACES[font][0], size)
        t.setFillColor(HexColor(colour))
        t.setCharSpace(track)   # always: Tc is graphics state, it leaks between BT/ET
        t.textOut(s)
        self.c.drawText(t)
        return width

    def para(self, x, y, s, font, size, colour, maxw, leading=None, track=0.0):
        leading = leading or size * 1.38
        yy = y
        for ln in wrap(s, font, size, maxw, track):
            if ln:
                self.text(x, yy, ln, font, size, colour, track=track)
            yy += leading
        return yy

    def save(self):
        self.c.save()


class Pptx:
    def __init__(self):
        self.prs = Presentation()
        self.prs.slide_width = In(W / 72)
        self.prs.slide_height = In(H / 72)
        self.s = None
        self.n = 0

    def new(self):
        self.s = self.prs.slides.add_slide(self.prs.slide_layouts[6])
        self.n += 1

    def bg(self, colour):
        self.s.background.fill.solid()
        self.s.background.fill.fore_color.rgb = RGBColor.from_string(colour.lstrip("#"))

    def rect(self, x, y, w, h, fill=None, stroke=None, lw=1.0):
        shp = self.s.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, In(x / 72), In(y / 72), In(w / 72), In(h / 72))
        if fill:
            shp.fill.solid()
            shp.fill.fore_color.rgb = RGBColor.from_string(fill.lstrip("#"))
        else:
            shp.fill.background()
        if stroke:
            shp.line.color.rgb = RGBColor.from_string(stroke.lstrip("#"))
            shp.line.width = Pt(lw)
        else:
            shp.line.fill.background()
        shp.shadow.inherit = False
        return shp

    def line(self, x1, y1, x2, y2, colour, lw=1.0):
        from pptx.enum.shapes import MSO_CONNECTOR
        conn = self.s.shapes.add_connector(
            MSO_CONNECTOR.STRAIGHT, In(x1 / 72), In(y1 / 72), In(x2 / 72), In(y2 / 72))
        conn.line.color.rgb = RGBColor.from_string(colour.lstrip("#"))
        conn.line.width = Pt(lw)

    def circle(self, cx, cy, r, fill=None, stroke=None, lw=1.0):
        shp = self.s.shapes.add_shape(
            MSO_SHAPE.OVAL, In((cx - r) / 72), In((cy - r) / 72), In(2 * r / 72), In(2 * r / 72))
        if fill:
            shp.fill.solid()
            shp.fill.fore_color.rgb = RGBColor.from_string(fill.lstrip("#"))
        else:
            shp.fill.background()
        if stroke:
            shp.line.color.rgb = RGBColor.from_string(stroke.lstrip("#"))
            shp.line.width = Pt(lw)
        else:
            shp.line.fill.background()
        shp.shadow.inherit = False
        return shp

    def text(self, x, y, s, font, size, colour, align="left", track=0.0):
        # wide textbox so alignment matches the PDF's measured placement
        bw = W - x if align == "left" else (x if align != "center" else 2 * min(x, W - x))
        bw = max(bw, 40)
        if align == "right":
            left = x - bw
        elif align == "center":
            left = x - bw / 2
        else:
            left = x
        box = self.s.shapes.add_textbox(In(left / 72), In(y / 72), In(bw / 72), In(size * 1.6 / 72))
        tf = box.text_frame
        tf.word_wrap = False
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
        tf.vertical_anchor = MSO_ANCHOR.TOP
        p = tf.paragraphs[0]
        p.alignment = {"left": PP_ALIGN.LEFT, "right": PP_ALIGN.RIGHT, "center": PP_ALIGN.CENTER}[align]
        r = p.add_run()
        r.text = s
        r.font.size = Pt(size)
        r.font.bold = FACES[font][2]
        r.font.name = FACES[font][1]
        r.font.color.rgb = RGBColor.from_string(colour.lstrip("#"))
        if track:
            r._r.get_or_add_rPr().set("spc", str(int(track * 100)))
        return measure(s, font, size, track)

    def para(self, x, y, s, font, size, colour, maxw, leading=None, track=0.0):
        leading = leading or size * 1.38
        yy = y
        for ln in wrap(s, font, size, maxw, track):
            if ln:
                self.text(x, yy, ln, font, size, colour, track=track)
            yy += leading
        return yy

    def save(self, path):
        self.prs.save(str(path))


# ── shared furniture ─────────────────────────────────────────────────────

def arrow(d, x1, y1, x2, y2, colour, lw=3.0, head=11.0):
    """A line with a real head. Reportlab's base fonts have no arrow glyph."""
    import math
    d.line(x1, y1, x2, y2, colour, lw)
    ang = math.atan2(y2 - y1, x2 - x1)
    for off in (0.42, -0.42):
        d.line(x2, y2, x2 - head * math.cos(ang + off), y2 - head * math.sin(ang + off), colour, lw)


def kicker(d, n, label, dark=False):
    col = BLUE
    d.text(M, 40, f"{n:02d}", "AB", 13, col)
    d.text(M + 30, 42, label.upper(), "AR", 10.5, col, track=2.2)


def footer(d, n, dark=False):
    col = MUTE2 if dark else MUTE
    d.line(M, 500, W - M, 500, "#2A2A2A" if dark else LINE, 1)
    d.text(M, 512, "UNMUTE SIGN", "AR", 8.5, col, track=1.8)
    d.text(W - M, 512, f"{n:02d} / 10", "AR", 8.5, col, align="right", track=1.8)


def headline(d, s, y, colour, size=46, maxw=None, leading=None):
    maxw = maxw or (W - 2 * M)
    size = fit(s, "AB", size, maxw)
    leading = leading or size * 1.06
    lines = wrap(s, "AB", size, maxw)
    yy = y
    for ln in lines:
        d.text(M, yy, ln, "AB", size, colour)
        yy += leading
    return yy


# ── slides ───────────────────────────────────────────────────────────────

def s01(d):
    """WHY — the cover carries the human cost."""
    d.bg(INK)
    d.rect(0, 0, W, 9, BLUE)

    d.text(M, 44, "UNMUTE SIGN", "AB", 15, BONE, track=2.5)
    d.text(W - M, 46, "PITCH DECK · 2026", "AR", 10.5, MUTE2, align="right", track=2.2)

    size = fit("EVERY VOICE", "AB", 78, W - 2 * M)
    d.text(M, 118, "EVERY VOICE", "AB", size, BONE)
    d.text(M, 118 + size * 1.03, "DESERVES TO", "AB", size, BONE)
    d.text(M, 118 + size * 2.06, "BE HEARD.", "AB", size, BLUE)

    d.line(M, 356, W - M, 356, "#333333", 1)

    t = ("On 2 May 2025, Kyellu Hassan died in childbirth at Muhammad Shuwa Memorial "
         "Hospital, Maiduguri. She was Deaf. No interpreter was in the room.")
    d.para(M, 374, t, "SG", 15.5, "#C9C6BE", 560, leading=23)

    d.text(W - M, 374, "02.05.2025", "AB", 21, BONE, align="right")
    d.text(W - M, 402, "MAIDUGURI, BORNO STATE", "AR", 9.5, MUTE2, align="right", track=1.6)

    d.line(M, 470, W - M, 470, "#333333", 1)
    d.text(M, 484, "PRINCE NZUBUCHUKWU MICHAEL · FOUNDER", "AR", 9.5, BONE, track=1.6)
    d.text(W - M, 484, "TWO-WAY SIGN LANGUAGE FOR HEALTHCARE", "AR", 9.5, MUTE2,
           align="right", track=1.6)


def s02(d):
    """PROBLEM — the evidence, as a bar chart."""
    d.bg(BONE)
    kicker(d, 1, "The problem")
    headline(d, "THE INTERPRETER IS NOT IN THE ROOM.", 78, INK, 45)

    bars = [
        ("Could communicate with their doctors", 7),
        ("Reported full communication in healthcare", 8),
        ("Deaf women: no public-health information in NSL", 76),
    ]
    x0, barw = M, 424.0
    y = 210
    for label, val in bars:
        d.text(x0, y, label.upper(), "AR", 10, MUTE, track=1.3)
        d.rect(x0, y + 20, barw, 26, "#DDDAD2")
        w = max(6, barw * val / 100.0)
        d.rect(x0, y + 20, w, 26, BLUE if val < 50 else INK)
        d.text(x0 + barw + 16, y + 14, f"{val}%", "AB", 29, INK)
        y += 86

    # the zero
    bx = 640
    d.rect(bx, 196, W - M - bx, 234, INK)
    d.text(bx + 24, 216, "HOSPITALS VISITED", "AR", 9, MUTE2, track=1.6)
    d.text(bx + 26, 238, "21", "AB", 56, BONE)
    d.text(bx + 26, 316, "HAD AN INTERPRETER", "AR", 9, MUTE2, track=1.6)
    d.text(bx + 26, 338, "0", "AB", 56, BLUE)
    d.rect(bx + 26, 410, 40, 3, BONE)

    d.line(M, 466, W - M, 466, LINE, 1)
    d.text(M, 476, "2024 Deaf Nigeria Pilot · Unmute field visits, 21 hospitals",
           "SG", 10.5, MUTE)
    footer(d, 2)


def s03(d):
    """OPPORTUNITY — global scale, five numbers."""
    d.bg(INK)
    kicker(d, 2, "The opportunity")
    headline(d, "A LOCAL PROBLEM WITH A GLOBAL MARKET.", 78, BONE, 45)

    stats = [
        ("70M", "Deaf people in signing communities worldwide"),
        ("300+", "Distinct sign languages in use"),
        ("500K", "Culturally Deaf ASL users in the US"),
        ("48.2%", "Idaho ASL patients told no interpreter was available"),
        ("$62", "Median company-paid interpreter rate, per hour"),
    ]
    x = M
    cw = (W - 2 * M) / 5.0
    d.line(M, 196, W - M, 196, "#333333", 1)
    for i, (big, cap) in enumerate(stats):
        d.text(x, 216, big, "AB", 34 if len(big) < 5 else 30, BLUE if i in (0, 3) else BONE)
        d.para(x, 258, cap, "SG", 10.8, "#A9A79F", cw - 18, leading=15)
        if i:
            d.line(x - 12, 210, x - 12, 330, "#333333", 1)
        x += cw

    d.line(M, 360, W - M, 360, "#333333", 1)

    d.text(M, 376, "SIGN LANGUAGE IS NOT UNIVERSAL", "AR", 10.5, BLUE, track=1.8)
    d.para(M, 398,
           "Unmute begins with a focused ASL healthcare use case. Every additional sign "
           "language needs its own vocabulary, its own validation and its own Deaf "
           "advisers. Nothing here transfers for free — and we do not claim it does.",
           "SG", 14.5, "#C9C6BE", 560, leading=22)
    d.text(628, 396, "1 IN 10", "AB", 42, BONE)
    d.para(628, 444, "US ENCOUNTERS INVOLVE A PROFESSIONAL INTERPRETER", "AR", 8.5, MUTE2,
           268, leading=12, track=1.0)
    footer(d, 3, dark=True)


def s04(d):
    """SOLUTION — two directions, honestly scoped."""
    d.bg(BONE)
    kicker(d, 3, "The solution")
    headline(d, "TWO DIRECTIONS. ONE SCREEN.", 78, INK, 45)

    colw = 372.0
    d.rect(M, 186, colw, 190, INK)
    d.text(M + 28, 206, "CLINICIAN TO DEAF PATIENT", "AR", 9.5, BLUE, track=1.7)
    for i, ln in enumerate(["Speaks or types a supported phrase",
                            "Unmute delivers the matching sign content",
                            "Patient watches it on the same screen"]):
        d.text(M + 28, 238 + i * 44, ln, "SG", 13.2, "#D6D3CB")

    d.rect(W - M - colw, 186, colw, 190, PAPER, stroke=INK, lw=2)
    d.text(W - M - colw + 28, 206, "DEAF PATIENT TO CLINICIAN", "AR", 9.5, BLUE, track=1.7)
    for i, ln in enumerate(["Patient signs into the camera",
                            "Supported expressions recognised",
                            "Meaning shown as text and spoken aloud"]):
        d.text(W - M - colw + 28, 238 + i * 44, ln, "SG", 13.2, "#3A3A36")

    # a two-headed arrow in the gap between the panels
    cx = W / 2
    arrow(d, cx, 281, cx - 48, 281, BLUE, 3.2)
    arrow(d, cx, 281, cx + 48, 281, BLUE, 3.2)

    d.line(M, 404, W - M, 404, LINE, 1)
    d.text(M, 418, "SCOPE", "AR", 9.5, BLUE, track=1.8)
    d.para(M + 90, 416,
           "About 20 healthcare expressions. Routine interactions only — not unrestricted "
           "translation. Outside the set, Unmute says so instead of guessing.",
           "SG", 13.5, "#3A3A36", 700, leading=20)

    d.text(W - M, 402, "SUPPORTED EXPRESSIONS", "AR", 8.5, MUTE, align="right", track=1.4)
    d.text(W - M, 420, "~20", "AB", 40, INK, align="right")
    footer(d, 4)


def s05(d):
    """TECHNOLOGY — the pipeline."""
    d.bg(INK)
    kicker(d, 4, "The technology")
    headline(d, "CAMERA IN. MEANING OUT.", 78, BONE, 45)

    steps = [
        ("01", "CAPTURE", "Camera input in the browser. No app to install."),
        ("02", "RECOGNISE", "Computer vision reads supported hand shapes and expressions."),
        ("03", "INTERPRET", "Mapped to healthcare meaning, not free-form translation."),
        ("04", "DELIVER", "Text and speech for the clinician; sign content for the patient."),
    ]
    gap = 26.0
    bw = (W - 2 * M - gap * 3) / 4
    for i, (num, title, body) in enumerate(steps):
        x = M + i * (bw + gap)
        d.rect(x, 190, bw, 168, INK2)
        d.text(x + 20, 206, num, "AB", 15, BLUE)
        d.text(x + 20, 230, title, "AR", 11.5, BONE, track=1.6)
        d.para(x + 20, 256, body, "SG", 11.4, "#A9A79F", bw - 40, leading=16)
        if i < 3:
            ax = x + bw + 5
            d.line(ax, 274, ax + gap - 10, 274, BLUE, 2.5)
            d.line(ax + gap - 10, 274, ax + gap - 18, 269, BLUE, 2.5)
            d.line(ax + gap - 10, 274, ax + gap - 18, 279, BLUE, 2.5)

    d.line(M, 382, W - M, 382, "#333333", 1)
    d.text(M, 396, "CURRENT STAGE", "AR", 9.5, BLUE, track=1.8)
    d.text(M + 140, 392, "TWO-WAY PROTOTYPE — BOTH DIRECTIONS WORKING", "AR", 15, BONE, track=0.6)
    d.para(M + 140, 418,
           "Next: recognition accuracy, expanded healthcare vocabulary, and preparation "
           "for controlled hospital pilots.", "SG", 12.4, "#A9A79F", 640, leading=18)
    footer(d, 5, dark=True)


def s06(d):
    """VALIDATION — the unit chart is the whole slide."""
    d.bg(BONE)
    kicker(d, 5, "Customer validation")
    headline(d, "21 HOSPITALS VISITED. 16 SIGNED LETTERS.", 78, INK, 42)

    # unit chart: 21 squares, 16 filled
    sq, gp, per = 21.0, 9.0, 7
    ox, oy = M, 200
    for i in range(21):
        r, cidx = divmod(i, per)
        x = ox + cidx * (sq + gp)
        y = oy + r * (sq + gp)
        if i < 16:
            d.rect(x, y, sq, sq, BLUE)
        else:
            d.rect(x, y, sq, sq, None, stroke=INK, lw=1.6)

    d.rect(ox, 302, 10, 10, BLUE)
    d.text(ox + 18, 299, "16 SIGNED LETTERS OF INTENT", "AR", 10, INK, track=1.2)
    d.rect(ox, 322, 10, 10, None, stroke=INK, lw=1.4)
    d.text(ox + 18, 319, "5 VISITED, NOT YET SIGNED", "AR", 10, MUTE, track=1.2)

    d.line(360, 186, 360, 400, LINE, 1)

    items = [
        ("21", "hospitals visited and engaged"),
        ("16", "signed letters of intent"),
        ("DEAF", "community and NSL stakeholders engaged"),
        ("NSL", "professionals guiding development"),
    ]
    y = 196
    for big, cap in items:
        d.text(392, y, big, "AB", 22, INK)
        d.para(392 + 118, y + 2, cap, "SG", 11.8, "#3A3A36", 340, leading=15)
        d.line(392, y + 44, W - M, y + 44, LINE, 0.8)
        y += 60

    d.rect(M, 424, W - 2 * M, 52, INK)
    d.text(M + 24, 440, "NEXT MILESTONE —", "AR", 10, BLUE, track=1.6)
    d.text(M + 190, 436, "MOVE FROM PROTOTYPE VALIDATION TO STRUCTURED HOSPITAL PILOTS",
           "AR", 13, BONE, track=0.4)
    footer(d, 6)


def s07(d):
    """BUSINESS MODEL — who pays."""
    d.bg(INK)
    kicker(d, 6, "Business model")
    headline(d, "THE HOSPITAL PAYS. THE PATIENT NEVER DOES.", 78, BONE, 40)

    tiers = [
        ("WARD", "Up to 10 practitioners", "Routine bedside interactions"),
        ("DEPARTMENT", "Up to 50 practitioners", "Shared vocabulary, named admin"),
        ("ENTERPRISE", "Unlimited seats", "Integration, deployment support"),
    ]
    cw = (W - 2 * M - 2 * 24) / 3
    for i, (name, seats, note) in enumerate(tiers):
        x = M + i * (cw + 24)
        d.line(x, 196, x + cw, 196, BONE if i == 1 else "#333333", 4 if i == 1 else 1)
        d.text(x, 210, name, "AR", 12, BLUE if i == 1 else BONE, track=1.8)
        d.text(x, 234, seats.upper(), "SG", 13, "#C9C6BE")
        d.text(x, 258, note, "SG", 11.2, MUTE2)

    d.line(M, 310, W - M, 310, "#333333", 1)

    d.text(M, 326, "SO WHY US", "AR", 9.5, BLUE, track=1.8)
    reasons = [
        "Built for healthcare, not general conversation",
        "Both directions, not one",
        "Practical predefined interactions, so it can be trusted",
        "Cuts dependence on interpreter availability for routine moments",
        "Built with Deaf stakeholders and sign-language professionals",
    ]
    y = 348
    for rtext in reasons:
        d.text(M, y, "—", "AR", 11, BLUE)
        d.text(M + 22, y, rtext, "SG", 12.4, "#C9C6BE")
        y += 26

    d.text(620, 326, "GRANTS AND PARTNERSHIPS", "AR", 9.5, MUTE2, track=1.6)
    d.para(620, 350,
           "Sponsored deployments extend access to under-resourced facilities without "
           "making the company dependent on donations. Revenue stays the model.",
           "SG", 11.6, "#8F8D86", 286, leading=17)
    footer(d, 7, dark=True)


def s08(d):
    """GROWTH — three phases on a timeline."""
    d.bg(BONE)
    kicker(d, 7, "Growth and scalability")
    headline(d, "NIGERIA FIRST. THEN ASL. THEN EVERY LANGUAGE.", 78, INK, 40)

    phases = [
        ("01", "NIGERIA · VALIDATION", INK, [
            "Complete the ASL healthcare MVP",
            "Work with initial hospital pilot partners",
            "Validate accuracy, usability and demand"]),
        ("02", "ASL MARKET EXPANSION", "#3A3A36", [
            "Additional institutions in ASL-using markets",
            "Integrations and institutional partnerships",
            "Improve the platform on real-world feedback"]),
        ("03", "LANGUAGE LOCALISATION", MUTE, [
            "New sign-language datasets and models",
            "Local Deaf communities and qualified professionals",
            "New healthcare markets, including Nigerian Sign Language"]),
    ]
    cw = (W - 2 * M - 2 * 26) / 3
    d.line(M, 214, W - M, 214, INK, 2)
    for i, (num, title, col, items) in enumerate(phases):
        x = M + i * (cw + 26)
        d.rect(x, 186, 12, 12, BLUE if i == 0 else MUTE)
        d.text(x + 22, 178, num, "AB", 16, BLUE if i == 0 else MUTE)
        d.text(x, 236, title, "AR", 10.5, col, track=1.4)
        yy = 262
        for it in items:
            d.para(x, yy, it, "SG", 11.8, "#3A3A36", cw - 10, leading=17)
            yy += 42

    d.rect(M, 430, W - 2 * M, 46, INK)
    d.text(M + 22, 444, "THE LONG-TERM POSITION —", "AR", 9.5, BLUE, track=1.5)
    d.text(M + 262, 442, "ACCESSIBLE COMMUNICATION AS STANDARD HEALTHCARE INFRASTRUCTURE",
           "AR", 12, BONE, track=0.4)
    footer(d, 8)


def s09(d):
    """THE $10,000 — stacked allocation bar."""
    d.bg(INK)
    kicker(d, 8, "The $10,000")
    headline(d, "WHAT $10,000 BUYS.", 78, BONE, 48)

    alloc = [
        ("PRODUCT", 40, 4000),
        ("SIGN-LANGUAGE DATA", 20, 2000),
        ("PILOT PREP", 20, 2000),
        ("PRIVACY", 10, 1000),
        ("M&E", 10, 1000),
    ]
    x0, barw, bh = M, W - 2 * M, 54
    x = x0
    shades = [BLUE, "#4D93FF", "#8DB8FF", "#C0D5F7", "#E4EDFB"]
    d.line(x0, 196, x0 + barw, 196, "#333333", 1)
    for i, (name, pct, amt) in enumerate(alloc):
        w = barw * pct / 100.0
        d.rect(x, 204, w - 2, bh, shades[i])
        d.text(x, 274, f"{pct}%", "AB", 22, BONE)
        d.text(x, 302, f"${amt:,}", "SG", 11.5, MUTE2)
        d.text(x, 318, name, "AR", 8.5, BLUE, track=1.2)
        x += w

    y = 366
    d.line(M, y - 12, W - M, y - 12, "#333333", 1)
    outcomes = [
        ("A", "More reliable healthcare MVP"),
        ("B", "Validated sign-language content"),
        ("C", "Initial hospital pilot deployments"),
        ("D", "Measurable performance and acceptance data"),
    ]
    for i, (letter, txt) in enumerate(outcomes):
        x = M + i * ((W - 2 * M) / 4)
        d.text(x, y, letter, "AB", 13, BLUE)
        d.para(x, y + 22, txt, "SG", 11.4, "#C9C6BE", (W - 2 * M) / 4 - 22, leading=16)

    d.text(M, 462, "FROM VALIDATED PROTOTYPE TO HOSPITAL-READY MVP", "AR", 10, MUTE2, track=1.6)
    footer(d, 9, dark=True)


def s10(d):
    """FOUNDER — and the close."""
    d.bg(BONE)
    kicker(d, 9, "Founder and next chapter")
    d.rect(0, 0, 9, H, INK)

    size = fit("NOBODY SHOULD", "AB", 52, 520)
    d.text(M, 96, "NOBODY SHOULD", "AB", size, INK)
    d.text(M, 96 + size * 1.04, "BE LEFT", "AB", size, INK)
    d.text(M, 96 + size * 2.08, "UNHEARD.", "AB", size, BLUE)

    d.para(M, 344,
           "Solo founder across product, research, partnerships and delivery. I took this "
           "to hospitals myself, sat with the Deaf community, and built relationships with "
           "sign-language professionals so the product answers a real need.",
           "SG", 12.6, "#3A3A36", 520, leading=19)

    d.text(M, 452, "PRINCE NZUBUCHUKWU MICHAEL · FOUNDER", "AR", 9.5, INK, track=1.6)

    px = 610
    d.text(px, 96, "IMMEDIATE PRIORITIES", "AR", 9.5, BLUE, track=1.8)
    d.line(px, 116, W - M, 116, INK, 2)
    y = 132
    for i, item in enumerate(["Complete the hospital-ready MVP",
                              "Begin structured hospital pilots",
                              "Establish a repeatable subscription model"], 1):
        d.text(px, y, f"0{i}", "AB", 15, BLUE)
        d.para(px + 34, y - 2, item, "SG", 12.6, "#3A3A36", W - M - px - 34, leading=17)
        y += 54

    d.text(px, 316, "GUIDANCE", "AR", 9.5, MUTE, track=1.8)
    d.para(px, 336,
           "Work is strengthened by people with practical experience in the Deaf community "
           "and the sign-language ecosystem. They are not yet members of the core team — "
           "supporting voices, not claimed staff.",
           "SG", 11.2, MUTE, W - M - px, leading=16)

    d.line(M, 496, W - M, 496, INK, 2)
    d.text(M, 506, "UNMUTE — EVERY VOICE DESERVES TO BE HEARD.", "AB", 11, INK, track=1.2)
    d.text(W - M, 508, "10 / 10", "AR", 8.5, MUTE, align="right", track=1.8)


SLIDES = [s01, s02, s03, s04, s05, s06, s07, s08, s09, s10]


def build_pdf(path):
    d = Pdf(path)
    for fn in SLIDES:
        fn(d)
        d.c.showPage()
    d.save()
    return path


def build_pptx(path):
    d = Pptx()
    for fn in SLIDES:
        d.new()
        fn(d)
    d.save(path)
    return path


if __name__ == "__main__":
    pdf = build_pdf(HERE / "Unmute-Sign-Pitch-2026.pdf")
    pptx = build_pptx(HERE / "Unmute-Sign-Pitch-2026.pptx")
    print("pdf :", pdf, f"{os.path.getsize(pdf)/1024:.0f} KB")
    print("pptx:", pptx, f"{os.path.getsize(pptx)/1024:.0f} KB")
