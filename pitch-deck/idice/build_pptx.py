#!/usr/bin/env python3
"""
Builds the iDICE Demo Day deck as a real .pptx.

Layout follows the supplied reference: rounded dark panels, off-white page,
oversized tight display type, pill navigation, staggered card grids, and the
recurring circular button. The reference's mint accent becomes Unmute blue.

Everything is native PowerPoint shapes and text — no flattened images — so the
deck stays editable. Type is Arial: Pretendard and Syncopate are web fonts and
would silently fall back on a reviewer's machine.

    python build_pptx.py
"""

from pptx import Presentation
from pptx.util import Inches as In, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

# ── palette ──────────────────────────────────────────────────────────────
PAPER      = RGBColor(0xF1, 0xF1, 0xEE)
INK        = RGBColor(0x0B, 0x0B, 0x0B)
INK2       = RGBColor(0x17, 0x17, 0x17)
BLUE       = RGBColor(0x00, 0x6A, 0xFE)
BLUE_DEEP  = RGBColor(0x00, 0x56, 0xCC)
BLUE_PALE  = RGBColor(0xD8, 0xE7, 0xFF)
WHITE      = RGBColor(0xFF, 0xFF, 0xFF)
GRAY       = RGBColor(0x86, 0x84, 0x7C)
GRAY_LT    = RGBColor(0xB3, 0xB1, 0xA9)
WHITE_62   = RGBColor(0x9E, 0x9E, 0x9E)
WHITE_45   = RGBColor(0x7A, 0x7A, 0x7A)

FONT = "Arial"

W, H = 13.333, 7.5
M = 0.30

prs = Presentation()
prs.slide_width = In(W)
prs.slide_height = In(H)
BLANK = prs.slide_layouts[6]


# ── primitives ───────────────────────────────────────────────────────────
def slide():
    s = prs.slides.add_slide(BLANK)
    bg = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, In(W), In(H))
    bg.fill.solid(); bg.fill.fore_color.rgb = PAPER
    bg.line.fill.background(); bg.shadow.inherit = False
    return s


def rect(s, x, y, w, h, fill=None, line=None, lw=0.75, radius=None):
    kind = MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE
    sh = s.shapes.add_shape(kind, In(x), In(y), In(w), In(h))
    sh.shadow.inherit = False
    if radius:
        try:
            sh.adjustments[0] = radius
        except Exception:
            pass
    if fill:
        sh.fill.solid(); sh.fill.fore_color.rgb = fill
    else:
        sh.fill.background()
    if line:
        sh.line.color.rgb = line; sh.line.width = Pt(lw)
    else:
        sh.line.fill.background()
    sh.text_frame.word_wrap = True
    return sh


def txt(s, x, y, w, h, runs, size=10, color=INK, bold=False,
        align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, spacing=None,
        line_spacing=None, italic=False, font=FONT):
    """runs: a string, or a list of (text, dict-of-overrides)."""
    box = s.shapes.add_textbox(In(x), In(y), In(w), In(h))
    tf = box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = anchor
    p = tf.paragraphs[0]
    p.alignment = align

    if line_spacing:
        p.line_spacing = line_spacing

    items = runs if isinstance(runs, list) else [(runs, {})]
    for text, o in items:
        r = p.add_run()
        r.text = text
        f = r.font
        f.name = o.get("font", font)
        f.size = Pt(o.get("size", size))
        f.bold = o.get("bold", bold)
        f.italic = o.get("italic", italic)
        f.color.rgb = o.get("color", color)
        sp = o.get("spacing", spacing)
        if sp:
            r.font._rPr.set("spc", str(int(sp * 100)))
    return box


def multi(s, x, y, w, h, lines, size=10, color=INK, bold=False,
          align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, spacing=None,
          line_spacing=1.12):
    """Several paragraphs in one box."""
    box = s.shapes.add_textbox(In(x), In(y), In(w), In(h))
    tf = box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = anchor

    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = line_spacing
        items = line if isinstance(line, list) else [(line, {})]
        for text, o in items:
            r = p.add_run()
            r.text = text
            f = r.font
            f.name = FONT
            f.size = Pt(o.get("size", size))
            f.bold = o.get("bold", bold)
            f.italic = o.get("italic", False)
            f.color.rgb = o.get("color", color)
            sp = o.get("spacing", spacing)
            if sp:
                r.font._rPr.set("spc", str(int(sp * 100)))
    return box


def pic(s, path, x, y, w, h, crop_fill=True):
    return s.shapes.add_picture(path, In(x), In(y), In(w), In(h))


def label(s, x, y, w, text, color=GRAY, size=6.5, spacing=1.6):
    return txt(s, x, y, w, 0.22, text.upper(), size=size, color=color,
               bold=True, spacing=spacing)


def pill(s, x, y, w, text, fill=None, line=GRAY_LT, color=INK, h=0.26, size=6.5):
    sh = rect(s, x, y, w, h, fill=fill, line=None if fill else line,
              lw=0.75, radius=0.5)
    txt(s, x, y + 0.055, w, h - 0.08, text.upper(), size=size, color=color,
        bold=True, align=PP_ALIGN.CENTER, spacing=1.4)
    return sh


def orb(s, cx, cy, d=0.30, fill=BLUE, glyph="+"):
    rect(s, cx, cy, d, d, fill=fill, radius=0.5)
    txt(s, cx, cy + 0.045, d, d - 0.08, glyph, size=11, color=WHITE,
        bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)


def bar(s, page, section):
    """Top navigation bar, identical on every slide."""
    pic(s, "assets/unmute-logo-trimmed.png", M, 0.145, 0.92, 0.155)
    nav = ["Overview", "Problem", "Solution", "Product", "Market", "Traction", "Team"]
    x = 1.42
    for n in nav:
        txt(s, x, 0.155, 1.0, 0.18, n, size=8, color=GRAY)
        x += max(0.62, len(n) * 0.062 + 0.28)
    pill(s, W - M - 1.72, 0.115, 0.86, f"{page} / 13", color=GRAY)
    pill(s, W - M - 0.78, 0.115, 0.78, "2026", fill=INK, color=PAPER)
    if section:
        pill(s, W - M - 3.02, 0.115, 1.20, section, color=GRAY)


# ═══════════════════════════════════════════════════════ 01 · COVER ════════
s = slide()
bar(s, "01", None)

# dark panel
rect(s, M, 0.52, 12.73, 5.28, fill=INK, radius=0.055)

label(s, 0.62, 0.95, 5.0, "iDICE · Founders Lab · Demo Day", color=WHITE_62)
txt(s, 0.62, 1.32, 8.2, 2.6,
    "Every voice deserves\nto be understood.",
    size=41, color=PAPER, bold=True, spacing=-1.2, line_spacing=0.96)
txt(s, 0.62, 4.30, 5.6, 1.0,
    "Unmute is two-way sign-language translation for hospitals \u2014 so a Deaf "
    "patient is understood at the point of care, not when an interpreter "
    "becomes free.",
    size=9.5, color=WHITE_62, line_spacing=1.45)

# three image tiles
for i, f in enumerate(["patient-01", "translator-02", "patient-03"]):
    x = 9.42 + i * 1.16
    pic(s, f"assets/{f}.jpg", x, 0.82, 1.04, 4.68)

# foot cards
rect(s, M, 6.02, 4.95, 1.16, fill=BLUE, radius=0.14)
label(s, 0.52, 6.20, 3.0, "The product", color=WHITE)
txt(s, 0.52, 6.45, 4.2, 0.36, "Two-way translation, in one screen",
    size=12.5, color=WHITE, bold=True, spacing=-0.4)
txt(s, 0.52, 6.83, 4.2, 0.28,
    "The patient signs. The clinician speaks. Both are understood.",
    size=7.5, color=BLUE_PALE)

rect(s, 5.39, 6.02, 3.25, 1.16, fill=WHITE, radius=0.14)
label(s, 5.56, 6.20, 2.0, "Raising")
txt(s, 5.56, 6.38, 2.6, 0.50, "$250K", size=25, color=INK, bold=True, spacing=-0.8)
txt(s, 5.56, 6.86, 2.6, 0.22, "Pre-seed, 18 months", size=7.5, color=GRAY)

rect(s, 8.78, 6.02, 4.28, 1.16, fill=INK2, radius=0.14)
label(s, 8.95, 6.20, 3.0, "The wedge", color=WHITE_45)
txt(s, 8.95, 6.45, 3.6, 0.36, "200 clinical phrases",
    size=12.5, color=PAPER, bold=True, spacing=-0.4)
txt(s, 8.95, 6.83, 3.9, 0.28,
    "The vocabulary that carries routine risk.",
    size=7.5, color=WHITE_45)


# ══════════════════════════════════════════════════ 02 · CONTENTS ════════
s = slide()
bar(s, "02", None)

TOC = [
    ("01", "Startup Overview", "What Unmute is, in one slide"),
    ("02", "Problem", "Who is affected, and the evidence"),
    ("03", "Solution", "How it works, and what is new"),
    ("04", "The product", "Three screens, in the room"),
    ("05", "Growth", "Market and reach"),
    ("06", "Validation", "What testing changed"),
    ("07", "Business model", "Revenue and alternatives"),
    ("08", "Traction", "Where we actually are"),
    ("09", "Team", "Who builds it, and the gap"),
    ("10", "The $10,000", "What the grant buys"),
]
CW, GAP = 2.45, 0.12
for i, (n, t, d) in enumerate(TOC):
    row, col = divmod(i, 5)
    x = M + col * (CW + GAP)
    y = 0.62 + row * 1.62
    style = i
    if style == 0:
        fill, fg, sub = BLUE, WHITE, BLUE_PALE
    elif style == 7:
        fill, fg, sub = INK, PAPER, WHITE_45
    else:
        fill, fg, sub = WHITE, INK, GRAY
    rect(s, x, y, CW, 1.50, fill=fill, radius=0.10)
    label(s, x + 0.16, y + 0.16, CW - 0.3, n, color=sub)
    txt(s, x + 0.16, y + 0.48, CW - 0.30, 0.55, t, size=10.5, color=fg,
        bold=True, spacing=-0.2, line_spacing=1.05)
    txt(s, x + 0.16, y + 1.12, CW - 0.30, 0.30, d, size=7, color=sub,
        line_spacing=1.2)

txt(s, M, 4.30, 6.4, 1.5, "Contents of this\npresentation",
    size=34, color=INK, bold=True, spacing=-1.0, line_spacing=0.98)
txt(s, 9.30, 5.02, 2.55, 0.5,
    "Ten sections, following the\nFounders Lab Demo Day brief.",
    size=8, color=GRAY, align=PP_ALIGN.RIGHT, line_spacing=1.35)
orb(s, 12.05, 4.86, 0.34)


# ══════════════════════════════════════════════════ 03 · OVERVIEW ════════
s = slide()
bar(s, "03", "01 · Overview")

pic(s, "assets/patient-02.jpg", M, 0.60, 6.30, 4.10)

rect(s, 6.78, 0.60, 5.95, 1.92, fill=WHITE, radius=0.10)
label(s, 6.98, 0.78, 3.0, "The gap")
txt(s, 6.98, 1.02, 3.0, 0.46, "50 : 1", size=25, color=INK, bold=True, spacing=-0.8)
txt(s, 6.98, 1.56, 5.5, 0.80,
    "Deaf ASL users to certified interpreters in the United States, before "
    "accounting for geography or hours.",
    size=8, color=GRAY, line_spacing=1.4)

rect(s, 6.78, 2.66, 5.95, 2.04, fill=BLUE, radius=0.10)
label(s, 6.98, 2.84, 3.0, "The product", color=WHITE)
txt(s, 6.98, 3.12, 5.0, 0.85, "One screen.\nBoth directions.",
    size=17, color=WHITE, bold=True, spacing=-0.6, line_spacing=1.0)
txt(s, 6.98, 4.20, 5.4, 0.42,
    "Sign to English, and English back to sign, without booking anyone.",
    size=8, color=BLUE_PALE, line_spacing=1.4)

txt(s, M, 5.05, 8.6, 1.4, "A hospital conversation,\nhandled in the room.",
    size=33, color=INK, bold=True, spacing=-1.0, line_spacing=0.98)
txt(s, 9.55, 5.55, 3.18, 0.80,
    "Built for the ward, not the app store. Sold to the department that carries "
    "the compliance obligation.",
    size=7.5, color=GRAY, align=PP_ALIGN.RIGHT, line_spacing=1.4)


# ═══════════════════════════════════════════════════ 04 · PROBLEM ════════
s = slide()
bar(s, "04", "02 · Problem")

def rule(s, x, y, w, c=GRAY_LT):
    ln = s.shapes.add_connector(1, In(x), In(y), In(x + w), In(y))
    ln.line.color.rgb = c
    ln.line.width = Pt(0.6)

rule(s, M, 1.02, 7.10)
label(s, M, 1.12, 4.0, "01 · The baseline")
txt(s, M, 1.42, 6.90, 1.05,
    [("Fewer than one in ten encounters with a Deaf patient involves a "
      "professional interpreter. ", {}),
     ("63.9% rely on a family member.", {"bold": True, "color": INK}),
     (" In the same 166-physician survey, 90.4% of staff knew no sign "
      "language at all.", {})],
    size=9.5, color=RGBColor(0x55, 0x53, 0x4D), line_spacing=1.5)

rule(s, M, 2.72, 7.10)
label(s, M, 2.82, 4.0, "02 · The consequence")
txt(s, M, 3.12, 6.90, 0.90,
    "Consent, allergies and dosages get relayed by a relative, or written on "
    "paper. Care is improvised exactly where the vocabulary matters most.",
    size=9.5, color=RGBColor(0x55, 0x53, 0x4D), line_spacing=1.5)

txt(s, M, 4.60, 7.0, 1.5, "The interpreter\nis not in the room.",
    size=34, color=INK, bold=True, spacing=-1.0, line_spacing=0.98)

pic(s, "assets/patient-04.jpg", 7.62, 0.60, 5.41, 3.75)
rect(s, 7.62, 4.45, 5.41, 1.06, fill=BLUE_PALE, radius=0.10)
label(s, 7.80, 4.60, 3.0, "Evidence", color=RGBColor(0x3E, 0x4A, 0x63))
txt(s, 7.80, 4.84, 5.05, 0.58,
    "Akeely et al., Cureus, 2022 \u2014 n = 166 emergency physicians. "
    "Corroborated by Pennsylvania Patient Safety Authority (2025).",
    size=7, color=RGBColor(0x2C, 0x3A, 0x52), line_spacing=1.35)


# ══════════════════════════════════════════════════ 05 · SOLUTION ════════
s = slide()
bar(s, "05", "03 · Solution")

rect(s, M, 0.60, 5.55, 3.18, fill=INK, radius=0.11)
label(s, 0.50, 0.80, 4.0, "01 · SIGN \u2192 ENGLISH", color=WHITE_45)
txt(s, 0.50, 1.10, 4.6, 0.75, "Palm 1.0 reads\ncontinuous ASL",
    size=15, color=PAPER, bold=True, spacing=-0.5, line_spacing=1.02)
txt(s, 0.50, 2.62, 4.75, 0.80,
    "Landmarks extracted on device. Text and speech returned to the clinician, "
    "with a confidence value shown, never hidden.",
    size=8, color=WHITE_45, line_spacing=1.45)

rect(s, M, 3.96, 5.55, 3.20, fill=BLUE, radius=0.11)
label(s, 0.50, 4.16, 4.0, "02 · ENGLISH \u2192 SIGN", color=WHITE)
txt(s, 0.50, 4.46, 4.6, 0.75, "Echo 1.0 renders\nthe reply",
    size=15, color=WHITE, bold=True, spacing=-0.5, line_spacing=1.02)
txt(s, 0.50, 5.98, 4.75, 0.80,
    "The clinician's sentence becomes signing, at 30 FPS. A repeat control "
    "lets the patient ask for it again.",
    size=8, color=BLUE_PALE, line_spacing=1.45)

pill(s, 6.20, 0.62, 0.92, "Built for a ward", fill=BLUE, color=WHITE)
orb(s, 12.36, 0.60, 0.30)
txt(s, 6.20, 1.06, 6.5, 1.3, "Solution &\nTechnology",
    size=33, color=INK, bold=True, spacing=-1.0, line_spacing=0.98)
txt(s, 6.20, 2.52, 5.35, 1.05,
    "Unmute does not train a model. It integrates verified engines behind a "
    "clinical interface, and owns the three things a vendor cannot: the "
    "vocabulary, the confirmation step, and the record.",
    size=9, color=RGBColor(0x55, 0x53, 0x4D), line_spacing=1.45)
pic(s, "assets/translator-02.jpg", 6.20, 3.78, 6.83, 3.38)


# ═══════════════════════════════════════════════════ 06 · PRODUCT ════════
s = slide()
bar(s, "06", "04 · Product")

txt(s, M, 0.60, 6.5, 1.3, "What the clinician\nactually holds.",
    size=32, color=INK, bold=True, spacing=-1.0, line_spacing=0.98)
txt(s, 9.55, 0.92, 3.18, 0.80,
    "Four screens. No onboarding, no training session \u2014 a nurse has to use "
    "this on the first shift.",
    size=7.5, color=GRAY, align=PP_ALIGN.RIGHT, line_spacing=1.4)

PH = [
    ("translator-01", "Home", "Speak to patient", True, False),
    ("patient-02", "Patient signed", "My chest hurts.", True, False),
    ("translator-04", "Clinician speaking", "Where does it hurt?", False, True),
]
for i, (img, kick, cap, hand_on, speak_on) in enumerate(PH):
    x = M + i * 4.245
    rect(s, x, 1.95, 4.10, 5.28, fill=INK, radius=0.10)
    pic(s, f"assets/{img}.jpg", x + 0.06, 2.01, 3.98, 5.16)

    # scrim panel behind the caption so white text always reads
    rect(s, x + 0.06, 5.62, 3.98, 1.55, fill=INK, radius=0.06)

    label(s, x + 0.26, 5.78, 3.6, kick, color=WHITE_62)
    txt(s, x + 0.26, 6.02, 3.55, 0.34, cap, size=12.5, color=WHITE,
        bold=True, spacing=-0.4)

    # the two direction buttons
    bx = x + 0.24
    for j, on in enumerate((hand_on, speak_on)):
        cx = bx + j * 0.40
        rect(s, cx, 6.48, 0.28, 0.28, fill=BLUE if on else None,
             line=None if on else WHITE, lw=1.0, radius=0.5)


# ════════════════════════════════════════════════════ 07 · GROWTH ════════
s = slide()
bar(s, "07", "05 · Growth")

label(s, M, 0.62, 4.0, "The opportunity")
txt(s, M, 0.94, 4.6, 1.3, "Growth &\nScalability",
    size=33, color=INK, bold=True, spacing=-1.0, line_spacing=0.98)
txt(s, M, 5.15, 4.35, 1.35,
    "Start with the 200 phrases that carry routine clinical risk. Then every "
    "department. Then every sign language \u2014 the same architecture, a "
    "different corpus.",
    size=9, color=RGBColor(0x55, 0x53, 0x4D), line_spacing=1.5)

BARS = [
    ("Deaf adults in the US who use ASL",
     "The smaller, defensible figure \u2014 a million sign to some degree",
     "500,000", WHITE, INK, GRAY),
    ("Certified ASL interpreters",
     "Registry of Interpreters for the Deaf",
     "10,000", INK, PAPER, WHITE_45),
    ("Departments with no policy for Deaf patients",
     "Of 166 emergency departments surveyed",
     "74.1%", BLUE, WHITE, BLUE_PALE),
    ("Staff who knew any sign language",
     "The same survey \u2014 the reason a tool beats a booking system",
     "9.6%", BLUE_PALE, INK, RGBColor(0x3E, 0x4A, 0x63)),
]
for i, (t, sub, v, fill, fg, subc) in enumerate(BARS):
    y = 1.28 + i * 1.28
    rect(s, 5.20, y, 7.83, 1.14, fill=fill, radius=0.09)
    txt(s, 5.44, y + 0.24, 5.0, 0.26, t, size=9.5, color=fg, bold=True,
        spacing=-0.1)
    txt(s, 5.44, y + 0.56, 5.4, 0.26, sub, size=7.5, color=subc)
    txt(s, 10.30, y + 0.30, 2.55, 0.50, v, size=21, color=fg, bold=True,
        align=PP_ALIGN.RIGHT, spacing=-0.8)


# ════════════════════════════════════════════════ 08 · VALIDATION ════════
s = slide()
bar(s, "08", "06 · Validation")

label(s, M, 0.62, 4.0, "What testing changed")
txt(s, M, 0.96, 7.30, 1.55,
    [("\u201cI built a general-purpose translator first. The first clinician "
      "who used it asked what it does about dosages. ", {}),
     ("It did nothing about dosages.\u201d", {"color": BLUE})],
    size=18.5, color=INK, spacing=-0.5, line_spacing=1.18)

txt(s, M, 2.72, 7.20, 1.20,
    "16\u201320 people have used the prototype. 21+ have seen it. Each round "
    "narrowed the product: general translation \u2192 hospital communication "
    "\u2192 200 clinical phrases with a confirmation step the patient approves "
    "before anything is spoken.",
    size=9, color=RGBColor(0x55, 0x53, 0x4D), line_spacing=1.5)

for i, t in enumerate(["21+ demos", "16\u201320 testers", "10\u201315 LOIs"]):
    pill(s, M + i * 1.24, 4.30, 1.15,
         t, fill=BLUE if i == 0 else None, color=WHITE if i == 0 else INK)

pic(s, "assets/patient-05.jpg", 8.15, 0.60, 4.88, 6.55)


# ════════════════════════════════════════════════════ 09 · MODEL ═════════
s = slide()
bar(s, "09", "07 · Business model")

txt(s, M, 0.60, 8.0, 0.62, "Revenue, and the alternatives.",
    size=31, color=INK, bold=True, spacing=-1.0)

def money_col(x, head, rows, card_fill, card_fg, card_label, card_text):
    label(s, x, 1.42, 5.0, head)
    y = 1.70
    for t, sub, v in rows:
        rule(s, x, y, 6.22)
        txt(s, x, y + 0.08, 4.55, 0.24, t, size=9, color=INK)
        txt(s, x, y + 0.30, 4.55, 0.22, sub, size=7.5, color=GRAY)
        txt(s, x + 4.55, y + 0.10, 1.67, 0.30, v, size=12, color=INK,
            bold=True, align=PP_ALIGN.RIGHT, spacing=-0.4)
        y += 0.72

    rect(s, x, 4.42, 6.22, 1.02, fill=card_fill, radius=0.10)
    label(s, x + 0.18, 4.56, 4.0, card_label, color=card_fg)
    txt(s, x + 0.18, 4.78, 5.85, 0.58, card_text, size=7.5, color=card_fg,
        line_spacing=1.35)

money_col(
    M, "How Unmute earns",
    [("Care team \u2014 up to 10 practitioners",
      "Routine interactions, one department", "$199/mo"),
     ("Department \u2014 unlimited practitioners",
      "Every shift covered, one floor", "$599/mo"),
     ("Institution", "Custom: SSO, BAA, audit log", "Quoted")],
    INK, WHITE_45, "Why a subscription",
    "Hospitals already buy interpreter hours by the block. Priced against the "
    "encounter it replaces, not against other apps.")

money_col(
    6.81, "What a Deaf patient has today",
    [("Booked interpreter", "$60\u2013150 per hour, scheduled days ahead", "Scarce"),
     ("Video remote interpreter", "Better, still needs a cart and a connection", "On request"),
     ("Consumer sign apps",
      "Free; no clinical vocabulary, no confidence, no record", "Not clinical")],
    BLUE_PALE, RGBColor(0x3E, 0x4A, 0x63), "Where we differ",
    "Nothing currently on a ward is both immediate and clinical. That "
    "intersection is the product.")


# ═════════════════════════════════════════════════ 10 · TRACTION ═════════
s = slide()
bar(s, "10", "08 · Traction")

txt(s, M, 0.60, 7.0, 0.62, "Where we actually are.",
    size=31, color=INK, bold=True, spacing=-1.0)
txt(s, 9.20, 0.74, 3.53, 0.62,
    "As of October 2026. Every number below is one we can evidence if asked.",
    size=7.5, color=GRAY, align=PP_ALIGN.RIGHT, line_spacing=1.4)

STATS = [
    ("16\u201320", "People have used", "the working prototype directly", BLUE, WHITE, BLUE_PALE),
    ("21+", "Demonstrated", "to prospective users and clinicians", WHITE, INK, GRAY),
    ("10\u201315", "Letters of intent", "from interested organisations", WHITE, INK, GRAY),
    ("198", "Clinical phrases", "scoped and specified", INK, PAPER, WHITE_45),
]
CW2 = 3.08
for i, (v, b, a, fill, fg, sub) in enumerate(STATS):
    x = M + i * (CW2 + 0.14)
    rect(s, x, 1.72, CW2, 1.86, fill=fill, radius=0.10)
    txt(s, x + 0.20, 1.92, 2.7, 0.50, v, size=25, color=fg, bold=True,
        spacing=-0.9)
    txt(s, x + 0.20, 2.54, 2.70, 0.90,
        [(b, {"bold": True, "color": fg}), (" " + a, {"color": sub})],
        size=8.5, line_spacing=1.4)

rect(s, M, 3.86, 12.73, 1.28, fill=WHITE, radius=0.10)
orb(s, 0.50, 4.28, 0.30, fill=INK, glyph="!")
txt(s, 0.98, 4.06, 8.0, 0.26, "What does not exist yet", size=11, color=INK,
    bold=True, spacing=-0.3)
txt(s, 0.98, 4.38, 11.6, 0.62,
    "A trained model \u00b7 a deployed pilot \u00b7 a signed design partner \u00b7 "
    "revenue. Stated plainly here because it is faster to say it than to be "
    "asked, and because the next twelve months are precisely the work of "
    "creating them.",
    size=8, color=GRAY, line_spacing=1.45)

txt(s, M, 5.55, 12.0, 0.90,
    "Two-way prototype tested by 16\u201320 people. 198 clinical phrases scoped. "
    "Ten to fifteen letters of intent in hand \u2014 the strongest asset we have, "
    "and the one we can produce on request.",
    size=9, color=RGBColor(0x55, 0x53, 0x4D), line_spacing=1.5)


# ═════════════════════════════════════════════════════ 11 · TEAM ═════════
s = slide()
bar(s, "11", "09 · Team")

label(s, M, 0.62, 4.0, "Who builds this")
txt(s, M, 0.94, 4.60, 1.55, "One founder.\nA specific gap.",
    size=32, color=INK, bold=True, spacing=-1.0, line_spacing=0.98)
txt(s, M, 5.10, 4.35, 1.30,
    "Solo at pre-seed, full time. The role that is hired first is clinical, "
    "not engineering.",
    size=9, color=RGBColor(0x55, 0x53, 0x4D), line_spacing=1.5)

rect(s, 5.05, 0.60, 7.98, 1.10, fill=INK, radius=0.10)
rect(s, 5.28, 0.86, 0.58, 0.58, fill=BLUE, radius=0.5)
txt(s, 5.28, 0.86, 0.58, 0.58, "U", size=13, color=WHITE, bold=True,
    align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
txt(s, 6.02, 0.92, 6.5, 0.28, "Founder \u2014 name on application",
    size=13, color=PAPER, bold=True, spacing=-0.3)
txt(s, 6.02, 1.24, 6.5, 0.24,
    "AI research \u00b7 NLP \u00b7 product \u00b7 integration and evaluation",
    size=8, color=WHITE_45)

rect(s, 5.05, 1.86, 7.98, 1.10, fill=BLUE_PALE, radius=0.10)
txt(s, 5.23, 2.02, 7.6, 0.26,
    "The gap: two advisors, being recruited", size=10.5, color=INK,
    bold=True, spacing=-0.2)
txt(s, 5.23, 2.32, 7.60, 0.55,
    "An ASL linguistics advisor for annotation protocol and regional variation, "
    "and a clinical advisor for vocabulary and validation. Both are being "
    "recruited \u2014 neither is claimed as filled.",
    size=7.5, color=RGBColor(0x3E, 0x4A, 0x63), line_spacing=1.4)

rect(s, 5.05, 3.12, 7.98, 1.34, fill=WHITE, radius=0.10)
label(s, 5.23, 3.28, 6.0, "Why a solo founder can ship this")
txt(s, 5.23, 3.52, 7.60, 0.84,
    "The machine translation is licensed, not built. What Unmute actually ships "
    "is a clinical interface, a vocabulary and a corpus protocol \u2014 all of "
    "which one person can own, and all of which compound with every "
    "conversation.",
    size=7.5, color=RGBColor(0x55, 0x53, 0x4D), line_spacing=1.45)


# ══════════════════════════════════════════════════════ 12 · GRANT ═══════
s = slide()
bar(s, "12", "10 · Use of grant")

txt(s, M, 0.60, 7.0, 0.62, "What $10,000 buys.",
    size=31, color=INK, bold=True, spacing=-1.0)
txt(s, 9.20, 0.74, 3.53, 0.62,
    "Not runway. The specific inputs that turn a prototype into a measured "
    "product.",
    size=7.5, color=GRAY, align=PP_ALIGN.RIGHT, line_spacing=1.4)

USE = [
    ("Clinical corpus \u2014 60 consented recordings, annotated", "45%", "$4,500"),
    ("Clinical validation \u2014 3 design partners, 12 weeks", "15%", "$1,500"),
    ("Compliance groundwork \u2014 HIPAA counsel, BAA review", "15%", "$1,500"),
    ("Engine credits \u2014 Palm 1.0 & Echo 1.0, speech", "12%", "$1,200"),
    ("Deaf design panel \u2014 5 paid participants", "7.5%", "$750"),
    ("Contingency", "5.5%", "$550"),
]
y = 1.52
for t, p, v in USE:
    rule(s, M, y, 7.10)
    txt(s, M, y + 0.07, 5.5, 0.24, t, size=8.5, color=INK)
    txt(s, 6.20, y + 0.09, 0.60, 0.22, p, size=7, color=GRAY,
        align=PP_ALIGN.RIGHT)
    txt(s, 6.90, y + 0.04, 1.20, 0.28, v, size=10.5, color=INK, bold=True,
        align=PP_ALIGN.RIGHT, spacing=-0.3)
    y += 0.62

ln = s.shapes.add_connector(1, In(M), In(y), In(7.10), In(y))
ln.line.color.rgb = INK; ln.line.width = Pt(1.5)
txt(s, M, y + 0.10, 4.0, 0.26, "Total", size=9.5, color=INK, bold=True)
txt(s, 5.90, y + 0.04, 2.20, 0.34, "$10,000", size=16, color=INK, bold=True,
    align=PP_ALIGN.RIGHT, spacing=-0.5)

MILES = [
    ("MILESTONE 01", "A corpus, not a demo",
     "60 clinical recordings, consented, annotated to a protocol written with "
     "an ASL linguist.", BLUE, WHITE, BLUE_PALE, 2.30),
    ("MILESTONE 02", "Three design partners live",
     "Real departments using it on real shifts, with the failures recorded "
     "rather than hidden.", BLUE_PALE, INK, RGBColor(0x3E, 0x4A, 0x63), 2.20),
    ("MILESTONE 03", "A number we can publish",
     "Clinical accuracy on our own vocabulary, measured by a method a reviewer "
     "can reproduce.", INK, PAPER, WHITE_45, 2.05),
]
y = 0.60
for n, t, d, fill, fg, sub, hh in MILES:
    rect(s, 7.62, y, 5.41, hh, fill=fill, radius=0.10)
    label(s, 7.82, y + 0.20, 4.0, n, color=sub)
    txt(s, 7.82, y + 0.46, 4.9, 0.30, t, size=12, color=fg, bold=True,
        spacing=-0.3)
    txt(s, 7.82, y + 0.80, 4.95, 0.70, d, size=7.5, color=sub,
        line_spacing=1.4)
    y += hh + 0.16


# ═════════════════════════════════════════════════════ 13 · CLOSING ═══════
s = slide()
bar(s, "13", "Closing")

pic(s, "assets/patient-01.jpg", M, 0.60, 4.60, 6.55)

pill(s, 5.20, 0.62, 0.96, "Next priorities")
txt(s, 5.20, 1.06, 6.5, 1.30, "What we do\nnext.",
    size=33, color=INK, bold=True, spacing=-1.0, line_spacing=0.98)
txt(s, 5.20, 2.52, 5.60, 1.10,
    "The jury's recognition would buy the one thing that cannot be faked in a "
    "slide: recorded, consented, clinical signing data \u2014 and the accuracy "
    "figure that comes out of it.",
    size=9, color=RGBColor(0x55, 0x53, 0x4D), line_spacing=1.5)

END = [
    ("90 days", "200-term library live. Three design partners using it on shift.",
     BLUE, WHITE, BLUE_PALE),
    ("12 months", "First published clinical accuracy number. First paying care team.",
     WHITE, INK, GRAY),
    ("Contact", "contact@liveunmute.com\napp.liveunmute.com", INK, PAPER, WHITE_45),
]
for i, (h, d, fill, fg, sub) in enumerate(END):
    x = 5.20 + i * 2.60
    rect(s, x, 5.30, 2.45, 1.85, fill=fill, radius=0.10)
    label(s, x + 0.18, 5.46, 2.1, h, color=sub)
    txt(s, x + 0.18, 5.74, 2.10, 1.20, d, size=7.5, color=sub if i < 2 else sub,
        line_spacing=1.4)


out = "Unmute-iDICE-DemoDay-2026.pptx"
prs.save(out)
print(f"wrote {out}  ·  {len(prs.slides.__iter__.__self__._sldIdLst)} slides")
