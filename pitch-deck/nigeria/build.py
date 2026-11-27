#!/usr/bin/env python3
"""
Builds the six-slide Nigeria deck for the AI for Good Nigeria Summit 2026.

Two outputs from one source of copy:

    Unmute-AIForGood-6slides.pptx   editable, native shapes and text
    Unmute-AIForGood-6slides.pdf    what goes in Drive for the pitch-deck link

Type is Arial in both. Syncopate and Pretendard are web fonts and would
silently fall back on a reviewer's machine.

    /tmp/dv/bin/python build.py
"""

from pathlib import Path

from pptx import Presentation
from pptx.util import Inches as In, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# ── palette ──────────────────────────────────────────────────────────────

BONE  = RGBColor(0xE3, 0xE1, 0xDC)
INK   = RGBColor(0x12, 0x12, 0x12)
INK70 = RGBColor(0x45, 0x45, 0x40)
INK45 = RGBColor(0x7A, 0x78, 0x71)
BLUE  = RGBColor(0x00, 0x6A, 0xFE)
PALE  = RGBColor(0xE6, 0xF0, 0xFF)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)

FONT = "Arial"
OUT = Path(__file__).parent

W_IN, H_IN = 13.333, 7.5
M_IN = 0.85

# ── copy ─────────────────────────────────────────────────────────────────
# Every claim below is one the build can back. Slides 4 is deliberately the
# list of what does not exist; it is the credibility of the other five.

S2_FACTS = [
    "An NSL interpreter has to be booked. In practice that means days — and often an interpreter in another state.",
    "So the encounter is carried by a relative, or by a pen and a scrap of paper.",
    "The three things that must never be guessed — where it hurts, what the patient is allergic to, and whether they consent — are exactly the three that get guessed.",
    "The law already requires access: the Discrimination Against Persons with Disabilities (Prohibition) Act 2018.",
]

S2_CALLOUT = (
    "Nigeria publishes no ratio of Deaf patients to qualified interpreters. "
    "The gap is not measured, which is part of why it does not move."
)

S3_LEFT = ("PATIENT → CLINICIAN", [
    "The patient signs into the camera.",
    "Hand shapes are read on the device.",
    "English appears on the clinician's screen, and is spoken aloud.",
])

S3_RIGHT = ("CLINICIAN → PATIENT", [
    "The clinician speaks.",
    "Speech becomes text in the browser.",
    "The reply is played back to the patient in sign.",
])

S3_FOOT = (
    "Runs in the browser of the phone the nurse already carries. "
    "Nothing to install. No account. Works on ward wifi after the first load."
)

S4_EXISTS = [
    "Live camera capture and hand tracking, on the device",
    "Reads yes, no, not sure, and the numerals 1 to 5",
    "Clinician speech to text; the patient's answer spoken aloud",
    "Refuses out loud when a phrase falls outside its set",
    "Runs in a browser, on ward wifi",
]

S4_MISSING = [
    "English to signed video — a placeholder today, twelve clips in production",
    "A trained NSL model",
    "A published accuracy number",
    "A hospital pilot",
    "A Deaf patient who has used it",
    "Revenue",
]

S4_NOTE = (
    "The refusal is the feature. A tool that invents a dosage is worse than one "
    "that admits it did not understand."
)

S5_LEFT = ("WHAT WE LICENCE", "Translation between English and sign, both directions. Bought, not built.")
S5_RIGHT = ("WHAT WE OWN", "The clinical vocabulary. The refusal behaviour. The record of what was understood, and what was not.")

S5_ITEMS = [
    ("200", "signs and phrases that carry most of the routine clinical risk — pain location, severity, onset, allergies, medication, consent."),
    ("1", "confirmation step: on anything critical, the patient approves what was understood before it reaches the clinician."),
    ("0", "guesses. Outside the vocabulary the app says so, and asks a human to step in."),
]

S5_FOOT = (
    "General sign models are trained on broadcast and lecture footage. They know family, "
    "school and weather. They have never seen hypertension, NPO, or milligrams."
)

S6_ASKS = [
    ("01", "Two pilot departments",
     "One general hospital and one community clinic in the FCT. Free for six months. "
     "In exchange: ward access, recorded sessions with patient consent, and the vocabulary that actually gets used."),
    ("02", "NSL advisers, paid",
     "Deaf advisers and qualified interpreters to build the two hundred terms. Not consulted once — employed."),
    ("03", "Introductions",
     "NITDA and Federal Ministry of Health digital health programmes. State hospitals already carry accessibility obligations."),
]

S6_FOOT = "Funding: self-funded. A pre-seed round is open, but the pilot matters more than the cheque."

CONTACT = "Prince Nzubechukwu Michael · Founder, Unmute · contact@liveunmute.com · liveunmute.com"


# ── pptx helpers ─────────────────────────────────────────────────────────

def _spacing(run, pts):
    run._r.get_or_add_rPr().set("spc", str(int(pts * 100)))


def rect(slide, x, y, w, h, fill, line=None, lw=0.75):
    shp = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, In(x), In(y), In(w), In(h))
    shp.fill.solid()
    shp.fill.fore_color.rgb = fill
    if line is None:
        shp.line.fill.background()
    else:
        shp.line.color.rgb = line
        shp.line.width = Pt(lw)
    shp.shadow.inherit = False
    return shp


def text(slide, x, y, w, h, blocks, anchor=MSO_ANCHOR.TOP, align=PP_ALIGN.LEFT):
    """blocks = [(content, size, bold, colour, space_after, spc)]"""
    box = slide.shapes.add_textbox(In(x), In(y), In(w), In(h))
    tf = box.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    first = True
    for content, size, bold, colour, after, spc in blocks:
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.alignment = align
        p.space_after = Pt(after)
        p.line_spacing = 1.18
        run = p.add_run()
        run.text = content
        run.font.size = Pt(size)
        run.font.bold = bold
        run.font.color.rgb = colour
        run.font.name = FONT
        if spc:
            _spacing(run, spc)
    return box


def page(slide, n, label, dark=False):
    c = INK45 if not dark else RGBColor(0x8A, 0x88, 0x80)
    text(slide, M_IN, 6.72, 8.0, 0.3, [(label.upper(), 8.5, False, c, 0, 240)])
    text(slide, W_IN - M_IN - 1.0, 6.72, 1.0, 0.3,
         [(f"{n:02d}", 8.5, False, c, 0, 240)], align=PP_ALIGN.RIGHT)


def blank(prs, bg=BONE):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    s.background.fill.solid()
    s.background.fill.fore_color.rgb = bg
    return s


# ── slides ───────────────────────────────────────────────────────────────

def slide_title(prs):
    s = blank(prs, INK)
    text(s, M_IN, 0.74, 10.5, 0.3,
         [("AI FOR GOOD NIGERIA SUMMIT 2026  ·  ABUJA  ·  10 DECEMBER", 9.5, False, BLUE, 0, 260)])
    text(s, M_IN, 1.72, 11.6, 2.6, [
        ("Nobody in the room\nspeaks both languages.", 54, True, BONE, 0, 0),
    ])
    text(s, M_IN, 3.34, 9.6, 1.2, [
        ("Unmute is the two-way interpreter that fits in a nurse's pocket.", 19, False, RGBColor(0xB8, 0xB6, 0xAE), 0, 0),
    ])
    rect(s, M_IN, 5.61, 1.5, 0.045, BLUE)
    text(s, M_IN, 5.92, 10.0, 0.9, [
        ("Prince Nzubechukwu Michael · Founder, Unmute", 12.5, True, BONE, 5, 0),
        ("contact@liveunmute.com · liveunmute.com · app.liveunmute.com", 11, False, RGBColor(0x8A, 0x88, 0x80), 0, 0),
    ])
    page(s, 1, "Unmute · AI for Good Nigeria 2026", dark=True)


def slide_problem(prs):
    s = blank(prs)
    text(s, M_IN, 0.72, 8.0, 0.3, [("THE WARD, TODAY", 9.5, False, BLUE, 0, 260)])
    text(s, M_IN, 1.08, 9.2, 1.0, [("The interpreter is\nnot in the room.", 40, True, INK, 0, 0)])

    y = 3.02
    for i, fact in enumerate(S2_FACTS, 1):
        text(s, M_IN, y, 0.45, 0.32, [(f"{i}", 13, True, BLUE, 0, 0)])
        text(s, M_IN + 0.5, y - 0.02, 7.35, 1.0, [(fact, 12.8, False, INK70, 0, 0)])
        y += 0.92

    # callout panel
    rect(s, 9.30, 1.08, 3.20, 3.30, INK)
    text(s, 9.58, 1.40, 2.64, 2.7, [
        ("THE MEASUREMENT", 8.5, False, BLUE, 12, 260),
        (S2_CALLOUT, 12.5, False, BONE, 0, 0),
    ])
    page(s, 2, "Unmute · AI for Good Nigeria 2026")


def slide_product(prs):
    s = blank(prs)
    text(s, M_IN, 0.72, 8.0, 0.3, [("THE PRODUCT", 9.5, False, BLUE, 0, 260)])
    text(s, M_IN, 1.08, 10.0, 0.8, [("Two directions. One screen.", 40, True, INK, 0, 0)])

    colw = 5.05
    for x, (head, items) in ((M_IN, S3_LEFT), (W_IN - M_IN - colw, S3_RIGHT)):
        rect(s, x, 2.55, colw, 2.55, WHITE)
        text(s, x + 0.34, 2.80, colw - 0.68, 0.3, [(head, 8.5, False, BLUE, 0, 260)])
        y = 3.22
        for it in items:
            text(s, x + 0.34, y, colw - 0.68, 0.7, [(it, 13, False, INK70, 0, 0)])
            y += 0.60

    rect(s, M_IN + colw + 0.20, 3.72, W_IN - 2 * M_IN - 2 * colw - 0.40, 0.05, BLUE)

    text(s, M_IN, 5.34, 11.6, 0.9, [(S3_FOOT, 13, False, INK45, 0, 0)])
    page(s, 3, "Unmute · AI for Good Nigeria 2026")


def slide_status(prs):
    s = blank(prs)
    text(s, M_IN, 0.72, 8.0, 0.3, [("STATUS", 9.5, False, BLUE, 0, 260)])
    text(s, M_IN, 1.08, 10.0, 0.8, [("What works today. What does not.", 40, True, INK, 0, 0)])

    colw = 5.55
    rect(s, M_IN, 2.28, colw, 3.30, PALE)
    text(s, M_IN + 0.36, 2.52, colw - 0.70, 0.3, [("EXISTS", 8.5, False, BLUE, 0, 260)])
    text(s, M_IN + 0.36, 2.92, colw - 0.70, 2.4,
         [(f"—  {i}", 12.4, False, INK, 9, 0) for i in S4_EXISTS])

    x2 = W_IN - M_IN - colw
    rect(s, x2, 2.28, colw, 3.30, INK)
    text(s, x2 + 0.36, 2.52, colw - 0.70, 0.3, [("DOES NOT EXIST", 8.5, False, BLUE, 0, 260)])
    text(s, x2 + 0.36, 2.92, colw - 0.70, 2.4,
         [(f"—  {i}", 12.4, False, RGBColor(0xB8, 0xB6, 0xAE), 9, 0) for i in S4_MISSING])

    text(s, M_IN, 5.86, 11.0, 0.7, [(S4_NOTE, 13.5, True, INK, 0, 0)])
    page(s, 4, "Unmute · AI for Good Nigeria 2026")


def slide_wedge(prs):
    s = blank(prs)
    text(s, M_IN, 0.72, 9.0, 0.3, [("THE WEDGE", 9.5, False, BLUE, 0, 260)])
    text(s, M_IN, 1.08, 11.8, 1.5, [("Two hundred clinical signs,\nnot a bigger model.", 40, True, INK, 0, 0)])

    colw = 5.55
    for x, (head, body) in ((M_IN, S5_LEFT), (W_IN - M_IN - colw, S5_RIGHT)):
        text(s, x, 2.90, colw, 0.3, [(head, 8.5, False, INK45, 0, 260)])
        text(s, x, 3.22, colw, 1.0, [(body, 13.5, False, INK, 0, 0)])

    rect(s, M_IN, 4.34, W_IN - 2 * M_IN, 0.02, RGBColor(0xC8, 0xC5, 0xBE))

    y = 4.58
    for num, body in S5_ITEMS:
        text(s, M_IN, y - 0.06, 0.95, 0.5, [(num, 26, True, BLUE, 0, 0)])
        text(s, M_IN + 1.05, y, 9.9, 0.6, [(body, 12.8, False, INK70, 0, 0)])
        y += 0.56

    text(s, M_IN, 6.08, 11.4, 0.6, [(S5_FOOT, 11.5, False, INK45, 0, 0)])
    page(s, 5, "Unmute · AI for Good Nigeria 2026")


def slide_ask(prs):
    s = blank(prs, INK)
    text(s, M_IN, 0.78, 9.0, 0.3, [("THE ASK", 9.5, False, BLUE, 0, 260)])
    text(s, M_IN, 1.14, 11.0, 0.8, [("What we want from this summit.", 40, True, BONE, 0, 0)])

    y = 2.42
    for num, head, body in S6_ASKS:
        text(s, M_IN, y - 0.02, 0.8, 0.5, [(num, 22, True, BLUE, 0, 0)])
        text(s, M_IN + 0.95, y - 0.04, 4.4, 0.5, [(head, 15.5, True, BONE, 0, 0)])
        text(s, M_IN + 0.95, y + 0.38, 9.4, 0.8,
             [(body, 12.2, False, RGBColor(0xB8, 0xB6, 0xAE), 0, 0)])
        y += 1.24

    text(s, M_IN, 6.05, 9.6, 0.4, [(S6_FOOT, 11.5, False, RGBColor(0x8A, 0x88, 0x80), 0, 0)])
    text(s, M_IN, 6.42, 11.4, 0.4, [(CONTACT, 11, True, BONE, 0, 0)])
    page(s, 6, "Unmute · AI for Good Nigeria 2026", dark=True)


def build_pptx():
    prs = Presentation()
    prs.slide_width = In(W_IN)
    prs.slide_height = In(H_IN)
    for fn in (slide_title, slide_problem, slide_product, slide_status, slide_wedge, slide_ask):
        fn(prs)
    path = OUT / "Unmute-AIForGood-6slides.pptx"
    prs.save(path)
    return path


# ── pdf ──────────────────────────────────────────────────────────────────

def build_pdf():
    """Same copy, rendered top-down. All `top` values are distances from the
    top of the page, which is the only coordinate system that stays sane."""
    from reportlab.pdfgen import canvas
    from reportlab.lib.colors import HexColor

    PW, PH = 960, 540
    S = 960 / W_IN  # inches -> points
    L = M_IN * S
    RIGHT = PW - L

    c = canvas.Canvas(str(OUT / "Unmute-AIForGood-6slides.pdf"), pagesize=(PW, PH))
    c.setTitle("Unmute — AI for Good Nigeria Summit 2026")
    c.setAuthor("Prince Nzubechukwu Michael")

    CBONE  = HexColor("#E3E1DC")
    CINK   = HexColor("#121212")
    CINK70 = HexColor("#454540")
    CINK45 = HexColor("#7A7871")
    CBLUE  = HexColor("#006AFE")
    CPALE  = HexColor("#E6F0FF")
    CWHITE = HexColor("#FFFFFF")
    CMUTE  = HexColor("#B8B6AE")
    CFAINT = HexColor("#8A8880")

    def at(top):
        """baseline for a line whose top is `top` pt below the page top"""
        return PH - top

    def fill(bg):
        c.setFillColor(bg)
        c.rect(0, 0, PW, PH, stroke=0, fill=1)

    def wrap(txt, font, size, maxw):
        out = []
        for para_ in txt.split("\n"):
            words, cur = para_.split(), ""
            for w in words:
                trial = (cur + " " + w).strip()
                if c.stringWidth(trial, font, size) <= maxw or not cur:
                    cur = trial
                else:
                    out.append(cur)
                    cur = w
            out.append(cur)
        return out

    def para(txt, x, top, maxw, font, size, colour, leading=1.32):
        """Draw wrapped text with its first line's top at `top`. Returns the
        top of the next free line."""
        c.setFont(font, size)
        c.setFillColor(colour)
        step = size * leading
        y = top
        for line in wrap(txt, font, size, maxw):
            c.drawString(x, PH - y - size, line)
            y += step
        return y

    def measure(txt, font, size, maxw, leading=1.32):
        return len(wrap(txt, font, size, maxw)) * size * leading

    def kicker(txt, x, top, colour=CBLUE):
        c.setFont("Helvetica-Bold", 7.4)
        c.setFillColor(colour)
        c.drawString(x, PH - top, " ".join(txt))

    def footer(n, label, dark=False):
        col = CFAINT if dark else CINK45
        c.setFont("Helvetica", 6.8)
        c.setFillColor(col)
        c.drawString(L, 26, " ".join(label.upper()))
        c.drawRightString(RIGHT, 26, f"{n:02d}")

    # ── 1 ────────────────────────────────────────────────────────────────
    fill(CINK)
    kicker("AI FOR GOOD NIGERIA SUMMIT 2026  ·  ABUJA  ·  10 DECEMBER", L, 54)
    c.setFont("Helvetica-Bold", 42)
    c.setFillColor(CBONE)
    c.drawString(L, at(96), "Nobody in the room")
    c.drawString(L, at(144), "speaks both languages.")
    para("Unmute is the two-way interpreter that fits in a nurse's pocket.",
         L, 300, 590, "Helvetica", 14.5, CMUTE)
    c.setFillColor(CBLUE)
    c.rect(L, at(408), 108, 3, stroke=0, fill=1)
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(CBONE)
    c.drawString(L, at(442), "Prince Nzubechukwu Michael · Founder, Unmute")
    c.setFont("Helvetica", 8.6)
    c.setFillColor(CFAINT)
    c.drawString(L, at(459), "contact@liveunmute.com · liveunmute.com · app.liveunmute.com")
    footer(1, "Unmute · AI for Good Nigeria 2026", dark=True)
    c.showPage()

    # ── 2 ────────────────────────────────────────────────────────────────
    fill(CBONE)
    kicker("THE WARD, TODAY", L, 46)
    c.setFont("Helvetica-Bold", 31)
    c.setFillColor(CINK)
    c.drawString(L, at(84), "The interpreter is")
    c.drawString(L, at(122), "not in the room.")

    y = 196
    for i, fact in enumerate(S2_FACTS, 1):
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(CBLUE)
        c.drawString(L, at(y + 3), str(i))
        nxt = para(fact, L + 24, y, 512, "Helvetica", 9.8, CINK70)
        y = nxt + 26

    PX, PT, PWD = 686, 168, 226
    ph = 26 + 16 + measure(S2_CALLOUT, "Helvetica", 9.3, PWD - 40) + 24
    c.setFillColor(CINK)
    c.rect(PX, at(PT + ph), PWD, ph, stroke=0, fill=1)
    kicker("THE MEASUREMENT", PX + 20, PT + 26, CBLUE)
    para(S2_CALLOUT, PX + 20, PT + 52, PWD - 40, "Helvetica", 9.3, CBONE)
    footer(2, "Unmute · AI for Good Nigeria 2026")
    c.showPage()

    # ── 3 ────────────────────────────────────────────────────────────────
    fill(CBONE)
    kicker("THE PRODUCT", L, 46)
    c.setFont("Helvetica-Bold", 31)
    c.setFillColor(CINK)
    c.drawString(L, at(84), "Two directions. One screen.")
    colw = 348
    CTOP, CFS, CGAP = 168, 10.2, 19
    card_h = 30 + 20 + sum(measure(i, "Helvetica", CFS, colw - 44) + CGAP for i in S3_LEFT[1]) + 12
    for x, (head, items) in ((L, S3_LEFT), (RIGHT - colw, S3_RIGHT)):
        c.setFillColor(CWHITE)
        c.rect(x, at(CTOP + card_h), colw, card_h, stroke=0, fill=1)
        kicker(head, x + 24, CTOP + 30, CBLUE)
        yy = CTOP + 66
        for it in items:
            yy = para(it, x + 24, yy, colw - 48, "Helvetica", CFS, CINK70) + CGAP

    # a two-headed arrow in the gap, not a rule running under the cards
    ax0 = L + colw + 16
    ax1 = RIGHT - colw - 16
    ay = CTOP + card_h / 2
    c.setStrokeColor(CBLUE)
    c.setLineWidth(1.6)
    c.line(ax0, at(ay), ax1, at(ay))
    for x, d in ((ax0, 1), (ax1, -1)):
        p = c.beginPath()
        p.moveTo(x, at(ay))
        p.lineTo(x + 7 * d, at(ay - 4.5))
        p.lineTo(x + 7 * d, at(ay + 4.5))
        p.close()
        c.setFillColor(CBLUE)
        c.drawPath(p, stroke=0, fill=1)
    para(S3_FOOT, L, CTOP + card_h + 44, 690, "Helvetica", 10, CINK45)
    footer(3, "Unmute · AI for Good Nigeria 2026")
    c.showPage()

    # ── 4 ────────────────────────────────────────────────────────────────
    fill(CBONE)
    kicker("STATUS", L, 46)
    c.setFont("Helvetica-Bold", 31)
    c.setFillColor(CINK)
    c.drawString(L, at(84), "What works today. What does not.")
    colw = 372

    FS, IGAP = 9.6, 12

    def col_h(items):
        return 28 + 20 + sum(measure("—  " + i, "Helvetica", FS, colw - 44) + IGAP for i in items) + 14

    box_h = max(col_h(S4_EXISTS), col_h(S4_MISSING))
    for x, head, items, bg, fg in (
        (L, "EXISTS", S4_EXISTS, CPALE, CINK),
        (RIGHT - colw, "DOES NOT EXIST", S4_MISSING, CINK, CMUTE),
    ):
        c.setFillColor(bg)
        c.rect(x, at(164 + box_h), colw, box_h, stroke=0, fill=1)
        kicker(head, x + 24, 164 + 30, CBLUE)
        yy = 164 + 68
        for it in items:
            yy = para("—  " + it, x + 24, yy, colw - 48, "Helvetica", FS, fg) + IGAP
    para(S4_NOTE, L, 164 + box_h + 46, 700, "Helvetica-Bold", 13, CINK)
    footer(4, "Unmute · AI for Good Nigeria 2026")
    c.showPage()

    # ── 5 ────────────────────────────────────────────────────────────────
    fill(CBONE)
    kicker("THE WEDGE", L, 46)
    c.setFont("Helvetica-Bold", 31)
    c.setFillColor(CINK)
    c.drawString(L, at(84), "Two hundred clinical signs,")
    c.drawString(L, at(122), "not a bigger model.")
    colw = 380
    for x, (head, body) in ((L, S5_LEFT), (RIGHT - colw, S5_RIGHT)):
        kicker(head, x, 190, CINK45)
        para(body, x, 210, colw - 24, "Helvetica", 9.8, CINK)
    c.setFillColor(HexColor("#C8C5BE"))
    c.rect(L, at(300), PW - 2 * L, 1.4, stroke=0, fill=1)
    y = 322
    for num, body in S5_ITEMS:
        c.setFont("Helvetica-Bold", 19)
        c.setFillColor(CBLUE)
        c.drawString(L, at(y + 10), num)
        para(body, L + 62, y, 700, "Helvetica", 9.6, CINK70)
        y += 44
    para(S5_FOOT, L, 452, 700, "Helvetica", 8.6, CINK45)
    footer(5, "Unmute · AI for Good Nigeria 2026")
    c.showPage()

    # ── 6 ────────────────────────────────────────────────────────────────
    fill(CINK)
    kicker("THE ASK", L, 54)
    c.setFont("Helvetica-Bold", 31)
    c.setFillColor(CBONE)
    c.drawString(L, at(94), "What we want from this summit.")
    y = 172
    for num, head, body in S6_ASKS:
        c.setFont("Helvetica-Bold", 15)
        c.setFillColor(CBLUE)
        c.drawString(L, at(y + 2), num)
        c.setFont("Helvetica-Bold", 11.5)
        c.setFillColor(CBONE)
        c.drawString(L + 54, at(y + 2), head)
        para(body, L + 54, y + 18, 640, "Helvetica", 9.0, CMUTE)
        y += 82
    para(S6_FOOT, L, 432, 600, "Helvetica", 8.3, CFAINT)
    c.setFont("Helvetica-Bold", 8.6)
    c.setFillColor(CBONE)
    c.drawString(L, 60, CONTACT)
    footer(6, "Unmute · AI for Good Nigeria 2026", dark=True)
    c.showPage()

    c.save()
    return OUT / "Unmute-AIForGood-6slides.pdf"


if __name__ == "__main__":
    print("pptx:", build_pptx())
    print("pdf: ", build_pdf())
