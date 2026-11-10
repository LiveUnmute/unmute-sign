#!/usr/bin/env python3
"""
Builds the ten-slide AfCEN Build 2026 deck.

Slide order follows the scoring order, so a judge reading alongside the rubric
finds each criterion on its own slide:

    1  title              2  the ward
    3  the product        4  quality of AI        25%
    5  status / traction  6  impact and reach     30%
    7  responsible AI     8  policy alignment     10%
    9  team              10  the ask

"Builds the ten-slide AfCEN Build 2026 deck.

Copy is ordered against the published scoring:
    Impact 30 · Quality of AI 25 · Traction 20 · Responsible AI 15 · Policy 10.

Two outputs from one source:
    Unmute-AfCEN-10slides.pptx   editable, native shapes and text
    Unmute-AfCEN-10slides.pdf    what gets uploaded

Type is Arial in both. Web fonts would silently fall back on a judge's machine.

    /tmp/dv/bin/python build.py
"""

from pathlib import Path

from pptx import Presentation
from pptx.util import Inches as In, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

BONE  = RGBColor(0xE3, 0xE1, 0xDC)
INK   = RGBColor(0x12, 0x12, 0x12)
INK70 = RGBColor(0x45, 0x45, 0x40)
INK45 = RGBColor(0x7A, 0x78, 0x71)
BLUE  = RGBColor(0x00, 0x6A, 0xFE)
PALE  = RGBColor(0xE6, 0xF0, 0xFF)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
MUTE  = RGBColor(0xB8, 0xB6, 0xAE)
FAINT = RGBColor(0x8A, 0x88, 0x80)

FONT = "Arial"
OUT = Path(__file__).parent
W_IN, H_IN = 13.333, 7.5
M_IN = 0.85

CONTACT = "Prince Nzubechukwu Michael · Founder, Unmute · liveunmute.com · app.liveunmute.com"

# ── copy ─────────────────────────────────────────────────────────────────

S2_FACTS = [
    "An NSL interpreter has to be booked. In practice that means days — and often an interpreter in another state.",
    "So the encounter is carried by a relative, or by a pen and a scrap of paper.",
    "The three things that must never be guessed — where it hurts, what the patient is allergic to, and whether they consent — are exactly the three that get guessed.",
    "The Discrimination Against Persons with Disabilities (Prohibition) Act 2018 already requires effective communication in public services.",
]
S2_CALLOUT = ("Nigeria publishes no ratio of Deaf patients to qualified interpreters. "
              "The gap is not measured, which is part of why it does not move.")

S4_SYSTEMS = [
    ("SPEECH → TEXT", "The clinician speaks. Browser speech recognition turns it into text. No cloud round trip."),
    ("HAND SHAPE → MEANING", "The patient signs into the camera. A geometric classifier reads a closed set — yes, no, not sure, numerals 1 to 5."),
    ("TEXT → SIGN", "The reply is returned to the patient in Nigerian Sign Language, built on licensed engines we pay for."),
]
S4_FOOT = ("We do not claim to train a sign-language model. The AI we own is the layer that decides "
           "what is understood, what is refused, and what the patient has to confirm before it counts.")

S5_EXISTS = [
    "Live camera capture and hand tracking",
    "Reads yes, no, not sure, and the numerals 1 to 5",
    "Clinician speech to text; the patient's answer spoken aloud",
    "Refuses out loud when a phrase falls outside its set",
    "Runs in a browser, on ward wifi",
]
S5_MISSING = [
    "A trained NSL model",
    "A published accuracy number",
    "A hospital pilot",
    "A Deaf patient who has used it",
    "Revenue",
]
S5_NOTE = ("The refusal is the feature. A tool that invents a dosage is worse than one that admits it did not understand.")

S6_STATS = [
    ("0", "paid staff — the first hires are Deaf advisers and NSL interpreters"),
    ("200", "clinical terms is the whole scope. Same structure in every market"),
    ("0", "patient videos stored. Nothing a patient signs leaves the device in this build"),
]
S6_BODY = [
    ("REACH", "Deaf Nigerians, in public hospitals. Access is required by law and carried, in practice, by relatives and paper. No account, and no smartphone of the patient's own — it runs on a shared device a clinic already owns."),
    ("ACROSS BORDERS", "The clinical vocabulary is the product; the sign language is a parameter. Ghana, Kenya and South Africa share the interpreter shortage. Expansion is vocabulary and validation work, not a rebuild."),
    ("JOBS", "Every new market adds a paid vocabulary team — Deaf advisers and qualified interpreters. That is skilled work that barely exists as a paid role outside a few urban centres, and it stays in the region."),
]
S6_FOOT = "Healthcare is a service that public and private buyers already pay for. We are not asking them to buy something new."

S7_LEFT = ("DATA", [
    "Conversations are not stored by default",
    "No patient data trains or fine-tunes a model",
    "A record, where a hospital asks for one, holds what was understood, the confidence on it, and what the patient confirmed — never raw video",
    "What leaves the device will be stated plainly, not implied",
])
S7_RIGHT = ("FAIRNESS AND INCLUSION", [
    "Nigerian Sign Language, built with paid Deaf advisers — not consulted once, employed",
    "American or British models do not transfer, and we say so",
    "Runs after first load on ward wifi that drops",
    "No account, no personal handset, no literacy requirement",
])
S7_FOOT = "Confidence is displayed, never hidden. Outside the vocabulary the app refuses and asks for a human interpreter."

S8_ITEMS = [
    ("01", "The 2018 Disability Act", "Requires effective communication in public services, health included. Unmute is the mechanism, not a new obligation."),
    ("02", "NITDA's digital economy agenda", "Local AI capability, applied to a public service, built by a Nigerian founder."),
    ("03", "Digital services that buyers rely on", "Hospitals already pay for interpreters and for paper processes. This is a service line, not a subsidy."),
]
S8_FOOT = "Aligned with the AfCEN Build theme: AI in the services that public and private buyers depend on, creating skilled work in the region."

S9_BODY = ("Prince Nzubechukwu Michael — founder, sole team member.\n\n"
           "Product, the clinical vocabulary scope, and the build. Built the prototype from a phone, "
           "without a laptop, using AI-assisted development. A year inside this problem: mapping the "
           "vendor landscape in both directions, and defining the clinical vocabulary that carries the "
           "risk in a routine encounter.\n\n"
           "No engineering team yet. The first hires are Deaf advisers and qualified NSL interpreters, "
           "not engineers — the model is bought, the vocabulary cannot be.")

S10_ASKS = [
    ("01", "Two pilot departments", "One general hospital and one community clinic in the FCT. Free for six months, in exchange for ward access, consented sessions, and the vocabulary that actually gets used."),
    ("02", "NSL advisers, paid", "Deaf advisers and qualified interpreters to build the two hundred terms. Not consulted once — employed."),
    ("03", "The network", "NITDA and Federal Ministry of Health digital health programmes. State hospitals already carry the accessibility obligation."),
]


# ── pptx helpers ─────────────────────────────────────────────────────────

def _spacing(run, pts):
    run._r.get_or_add_rPr().set("spc", str(int(pts * 100)))


def rect(slide, x, y, w, h, fill):
    shp = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, In(x), In(y), In(w), In(h))
    shp.fill.solid()
    shp.fill.fore_color.rgb = fill
    shp.line.fill.background()
    shp.shadow.inherit = False
    return shp


def text(slide, x, y, w, h, blocks, anchor=MSO_ANCHOR.TOP, align=PP_ALIGN.LEFT):
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


def page(slide, n, dark=False):
    c = FAINT if dark else INK45
    text(slide, M_IN, 6.92, 8.0, 0.3, [("UNMUTE · AfCEN BUILD 2026", 8, False, c, 0, 260)])
    text(slide, W_IN - M_IN - 1.0, 6.92, 1.0, 0.3, [(f"{n:02d}", 8, False, c, 0, 260)], align=PP_ALIGN.RIGHT)


def blank(prs, bg=BONE):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    s.background.fill.solid()
    s.background.fill.fore_color.rgb = bg
    return s


def head(slide, kick, title, lines=1):
    text(slide, M_IN, 0.62, 9.0, 0.3, [(kick, 9, False, BLUE, 0, 260)])
    text(slide, M_IN, 0.96, 11.8, 1.2, [(title, 31, True, INK, 0, 0)])


# ── slides ───────────────────────────────────────────────────────────────

def s1(prs):
    s = blank(prs, INK)
    text(s, M_IN, 0.78, 11.0, 0.3, [("AfCEN BUILD 2026  ·  NIGERIA", 9.5, False, BLUE, 0, 260)])
    text(s, M_IN, 1.80, 11.7, 2.4, [("Nobody in the room\nspeaks both languages.", 50, True, BONE, 0, 0)])
    text(s, M_IN, 4.24, 10.2, 1.0, [("A two-way sign-language interpreter that fits in a nurse's pocket.", 18, False, MUTE, 0, 0)])
    rect(s, M_IN, 5.62, 1.5, 0.045, BLUE)
    text(s, M_IN, 5.94, 11.0, 0.9, [
        ("Prince Nzubechukwu Michael · Founder, Unmute", 12.5, True, BONE, 5, 0),
        ("liveunmute.com · app.liveunmute.com · Abuja, Nigeria", 11, False, FAINT, 0, 0)])
    page(s, 1, dark=True)


def s2(prs):
    s = blank(prs)
    head(s, "THE WARD, TODAY", "The interpreter is not in the room.")
    y = 2.55
    for i, f in enumerate(S2_FACTS, 1):
        text(s, M_IN, y, 0.45, 0.32, [(str(i), 11, True, BLUE, 0, 0)])
        text(s, M_IN + 0.48, y - 0.03, 7.30, 1.0, [(f, 12.6, False, INK70, 0, 0)])
        y += 0.98
    rect(s, 9.35, 1.30, 3.15, 2.30, INK)
    text(s, 9.62, 1.62, 2.62, 1.9, [
        ("THE MEASUREMENT", 8.5, False, BLUE, 12, 260),
        (S2_CALLOUT, 12.2, False, BONE, 0, 0)])
    page(s, 2)


def s3(prs):
    s = blank(prs)
    head(s, "THE PRODUCT", "Two directions. One screen.")
    colw = 5.05
    left = ("PATIENT → CLINICIAN", ["The patient signs into the camera.",
                                   "Hand shapes are read on the device.",
                                   "English appears on the clinician's screen, and is spoken aloud."])
    right = ("CLINICIAN → PATIENT", ["The clinician speaks.",
                                    "Speech becomes text in the browser.",
                                    "The reply is played back to the patient in sign."])
    for x, (h, items) in ((M_IN, left), (W_IN - M_IN - colw, right)):
        rect(s, x, 2.05, colw, 2.55, WHITE)
        text(s, x + 0.34, 2.32, colw - 0.68, 0.3, [(h, 8.5, False, BLUE, 0, 260)])
        yy = 2.76
        for it in items:
            text(s, x + 0.34, yy, colw - 0.68, 0.7, [(it, 12.6, False, INK70, 0, 0)])
            yy += 0.60
    text(s, M_IN, 5.10, 11.5, 0.9, [("Runs in the browser of the phone the nurse already carries. "
                                    "Nothing to install. No account. Survives ward wifi that drops after first load.",
                                    12.6, False, INK45, 0, 0)])
    page(s, 3)


def s4(prs):
    s = blank(prs)
    head(s, "QUALITY OF AI  ·  25%", "Three systems, one rule: never guess into a decision.")
    colw = 3.72
    x = M_IN
    for kick, body in S4_SYSTEMS:
        rect(s, x, 1.95, colw, 2.30, WHITE)
        text(s, x + 0.28, 2.20, colw - 0.56, 0.3, [(kick, 8, False, BLUE, 0, 260)])
        text(s, x + 0.28, 2.58, colw - 0.56, 1.5, [(body, 11.6, False, INK70, 0, 0)])
        x += colw + 0.29
    rect(s, M_IN, 4.62, W_IN - 2 * M_IN, 0.02, RGBColor(0xC8, 0xC5, 0xBE))
    text(s, M_IN, 4.86, 11.4, 1.2, [(S4_FOOT, 12.4, True, INK, 0, 0)])
    page(s, 4)


def s5(prs):
    s = blank(prs)
    head(s, "STATUS  ·  TRACTION 20%", "What works today. What does not.")
    colw = 5.55
    rect(s, M_IN, 1.95, colw, 2.90, PALE)
    text(s, M_IN + 0.34, 2.16, colw - 0.68, 0.3, [("EXISTS", 8.5, False, BLUE, 0, 260)])
    text(s, M_IN + 0.34, 2.52, colw - 0.68, 2.1, [(f"—  {i}", 11.6, False, INK, 7, 0) for i in S5_EXISTS])
    x2 = W_IN - M_IN - colw
    rect(s, x2, 1.95, colw, 2.90, INK)
    text(s, x2 + 0.34, 2.16, colw - 0.68, 0.3, [("DOES NOT EXIST", 8.5, False, BLUE, 0, 260)])
    text(s, x2 + 0.34, 2.52, colw - 0.68, 2.1, [(f"—  {i}", 11.6, False, MUTE, 7, 0) for i in S5_MISSING])
    text(s, M_IN, 5.20, 11.2, 0.9, [(S5_NOTE, 13, True, INK, 0, 0)])
    page(s, 5)


def s6(prs):
    s = blank(prs)
    head(s, "IMPACT AND REACH  ·  30%", "A law already says yes. Nothing delivers it.")
    colw = 3.72
    x = M_IN
    for num, cap in S6_STATS:
        text(s, x, 1.78, colw, 0.8, [(num, 40, True, BLUE, 0, 0)])
        text(s, x, 2.42, colw - 0.20, 0.9, [(cap, 10.6, False, INK45, 0, 0)])
        x += colw + 0.29
    rect(s, M_IN, 3.34, W_IN - 2 * M_IN, 0.02, RGBColor(0xC8, 0xC5, 0xBE))
    y = 3.56
    for kick, body in S6_BODY:
        text(s, M_IN, y, 2.05, 0.3, [(kick, 8, False, BLUE, 0, 260)])
        text(s, M_IN + 2.15, y - 0.04, 9.3, 0.9, [(body, 10.9, False, INK70, 0, 0)])
        y += 0.96
    text(s, M_IN, 6.42, 11.2, 0.4, [(S6_FOOT, 10.4, False, INK45, 0, 0)])
    page(s, 6)


def s7(prs):
    s = blank(prs)
    head(s, "RESPONSIBLE AI AND INCLUSION  ·  15%", "Built so a clinician can see when it is unsure.")
    colw = 5.55
    for x, (h, items) in ((M_IN, S7_LEFT), (W_IN - M_IN - colw, S7_RIGHT)):
        text(s, x, 1.86, colw, 0.3, [(h, 8.5, False, BLUE, 0, 260)])
        yy = 2.22
        for it in items:
            text(s, x, yy, 0.30, 0.3, [("—", 11, False, BLUE, 0, 0)])
            text(s, x + 0.34, yy - 0.02, colw - 0.40, 1.0, [(it, 11.4, False, INK70, 0, 0)])
            yy += 0.86
    text(s, M_IN, 5.92, 11.3, 0.9, [(S7_FOOT, 12.8, True, INK, 0, 0)])
    page(s, 7)


def s8(prs):
    s = blank(prs)
    head(s, "POLICY ALIGNMENT  ·  10%", "The obligation exists. The delivery does not.")
    y = 2.10
    for num, h, body in S8_ITEMS:
        text(s, M_IN, y, 0.75, 0.4, [(num, 15, True, BLUE, 0, 0)])
        text(s, M_IN + 0.90, y - 0.03, 4.2, 0.4, [(h, 13.5, True, INK, 0, 0)])
        text(s, M_IN + 0.90, y + 0.38, 9.4, 0.8, [(body, 11.6, False, INK70, 0, 0)])
        y += 1.24
    text(s, M_IN, 6.02, 11.2, 0.8, [(S8_FOOT, 10.8, False, INK45, 0, 0)])
    page(s, 8)


def s9(prs):
    s = blank(prs)
    head(s, "TEAM", "One founder. The gap is the team, and I know it.")
    text(s, M_IN, 2.05, 9.6, 3.4, [(S9_BODY, 13.2, False, INK70, 0, 0)])
    rect(s, 10.45, 2.05, 2.05, 2.05, INK)
    text(s, 10.70, 2.34, 1.60, 1.6, [
        ("FIRST HIRES", 7.5, False, BLUE, 8, 260),
        ("Deaf advisers", 10.5, True, BONE, 3, 0),
        ("NSL interpreters", 10.5, True, BONE, 0, 0)])
    page(s, 9)


def s10(prs):
    s = blank(prs, INK)
    text(s, M_IN, 0.80, 9.0, 0.3, [("THE ASK", 9.5, False, BLUE, 0, 260)])
    text(s, M_IN, 1.16, 11.0, 0.8, [("Three things, none of them a cheque.", 38, True, BONE, 0, 0)])
    y = 2.62
    for num, h, body in S10_ASKS:
        text(s, M_IN, y, 0.8, 0.5, [(num, 20, True, BLUE, 0, 0)])
        text(s, M_IN + 0.95, y - 0.04, 4.6, 0.5, [(h, 15, True, BONE, 0, 0)])
        text(s, M_IN + 0.95, y + 0.36, 9.3, 0.8, [(body, 11.6, False, MUTE, 0, 0)])
        y += 1.20
    text(s, M_IN, 6.24, 11.2, 0.4, [(CONTACT, 10.5, True, BONE, 0, 0)])
    page(s, 10, dark=True)


def build_pptx():
    prs = Presentation()
    prs.slide_width = In(W_IN)
    prs.slide_height = In(H_IN)
    for fn in (s1, s2, s3, s4, s5, s6, s7, s8, s9, s10):
        fn(prs)
    p = OUT / "Unmute-AfCEN-10slides.pptx"
    prs.save(p)
    return p


# ── pdf ──────────────────────────────────────────────────────────────────

def build_pdf():
    from reportlab.pdfgen import canvas
    from reportlab.lib.colors import HexColor

    PW, PH = 960, 540
    S = 960 / W_IN
    L = M_IN * S
    R = PW - L

    c = canvas.Canvas(str(OUT / "Unmute-AfCEN-10slides.pdf"), pagesize=(PW, PH))
    c.setTitle("Unmute — AfCEN Build 2026")
    c.setAuthor("Prince Nzubechukwu Michael")

    CBONE  = HexColor("#E3E1DC"); CINK = HexColor("#121212")
    CINK70 = HexColor("#454540"); CINK45 = HexColor("#7A7871")
    CBLUE  = HexColor("#006AFE"); CPALE = HexColor("#E6F0FF")
    CWHITE = HexColor("#FFFFFF"); CMUTE = HexColor("#B8B6AE")
    CFAINT = HexColor("#8A8880"); CLINE = HexColor("#C8C5BE")

    def at(t):
        return PH - t

    def fill(bg):
        c.setFillColor(bg)
        c.rect(0, 0, PW, PH, stroke=0, fill=1)

    def wrap(txt, font, size, maxw):
        out = []
        for para_ in txt.split("\n"):
            if not para_.strip():
                out.append("")
                continue
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
        c.setFont(font, size)
        c.setFillColor(colour)
        step = size * leading
        y = top
        for line in wrap(txt, font, size, maxw):
            if line:
                c.drawString(x, PH - y - size, line)
            y += step
        return y

    def measure(txt, font, size, maxw, leading=1.32):
        return len(wrap(txt, font, size, maxw)) * size * leading

    def kicker(txt, x, top, colour=CBLUE, size=7.4):
        c.setFont("Helvetica-Bold", size)
        c.setFillColor(colour)
        c.drawString(x, PH - top, " ".join(txt))

    def footer(n, dark=False):
        col = CFAINT if dark else CINK45
        c.setFont("Helvetica", 6.8)
        c.setFillColor(col)
        c.drawString(L, 22, " ".join("UNMUTE · AfCEN BUILD 2026".upper()))
        c.drawRightString(R, 22, f"{n:02d}")

    def title(kick, txt):
        kicker(kick, L, 46)
        c.setFont("Helvetica-Bold", 31)
        c.setFillColor(CINK)
        c.drawString(L, at(84), txt)

    # 1
    fill(CINK)
    kicker("AfCEN BUILD 2026  ·  NIGERIA", L, 56)
    c.setFont("Helvetica-Bold", 44)
    c.setFillColor(CBONE)
    c.drawString(L, at(128), "Nobody in the room")
    c.drawString(L, at(180), "speaks both languages.")
    para("A two-way sign-language interpreter that fits in a nurse's pocket.",
         L, 244, 620, "Helvetica", 15, CMUTE)
    c.setFillColor(CBLUE)
    c.rect(L, at(408), 108, 3, stroke=0, fill=1)
    c.setFont("Helvetica-Bold", 10.5)
    c.setFillColor(CBONE)
    c.drawString(L, at(442), "Prince Nzubechukwu Michael · Founder, Unmute")
    c.setFont("Helvetica", 9)
    c.setFillColor(CFAINT)
    c.drawString(L, at(460), "liveunmute.com · app.liveunmute.com · Abuja, Nigeria")
    footer(1, dark=True)
    c.showPage()

    # 2
    fill(CBONE)
    title("THE WARD, TODAY", "The interpreter is not in the room.")
    y = 214
    for i, f in enumerate(S2_FACTS, 1):
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(CBLUE)
        c.drawString(L, at(y + 4), str(i))
        nxt = para(f, L + 26, y, 520, "Helvetica", 10.2, CINK70)
        y = nxt + 26
    PX, PT, PWD = 682, 140, 240
    ph = 28 + 18 + measure(S2_CALLOUT, "Helvetica", 9.6, PWD - 40)
    c.setFillColor(CINK)
    c.rect(PX, at(PT + ph), PWD, ph, stroke=0, fill=1)
    kicker("THE MEASUREMENT", PX + 20, PT + 26)
    para(S2_CALLOUT, PX + 20, PT + 54, PWD - 40, "Helvetica", 9.6, CBONE)
    footer(2)
    c.showPage()

    # 3
    fill(CBONE)
    title("THE PRODUCT", "Two directions. One screen.")
    colw = 348
    for x, (h, items) in ((L, ("PATIENT → CLINICIAN",
                                ["The patient signs into the camera.",
                                 "Hand shapes are read on the device.",
                                 "English appears on the clinician's screen, and is spoken aloud."])),
                          (R - colw, ("CLINICIAN → PATIENT",
                                      ["The clinician speaks.",
                                       "Speech becomes text in the browser.",
                                       "The reply is played back to the patient in sign."]))):
        c.setFillColor(CWHITE)
        c.rect(x, at(150 + 190), colw, 190, stroke=0, fill=1)
        kicker(h, x + 24, 178)
        yy = 216
        for it in items:
            yy = para(it, x + 24, yy, colw - 48, "Helvetica", 10.4, CINK70) + 16
    ax0, ax1, ay = L + colw + 16, R - colw - 16, 150 + 95
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
    c.setFont("Helvetica-Bold", 6.6)
    c.setFillColor(CBLUE)
    c.drawCentredString((ax0 + ax1) / 2, at(ay - 12), "BOTH WAYS")
    para("Runs in the browser of the phone the nurse already carries. Nothing to install. "
         "No account. Survives ward wifi that drops after first load.",
         L, 400, 700, "Helvetica", 10.4, CINK45)
    footer(3)
    c.showPage()

    # 4
    fill(CBONE)
    title("QUALITY OF AI  ·  25%", "Three systems, one rule: never guess into a decision.")
    colw = 268
    ch = 26 + 16 + max(measure(b, "Helvetica", 9.6, colw - 40) for _, b in S4_SYSTEMS) + 20
    x = L
    for kick, body in S4_SYSTEMS:
        c.setFillColor(CWHITE)
        c.rect(x, at(150 + ch), colw, ch, stroke=0, fill=1)
        kicker(kick, x + 20, 176, CBLUE, 7.0)
        para(body, x + 20, 204, colw - 40, "Helvetica", 9.6, CINK70)
        x += colw + 21
    c.setFillColor(CLINE)
    c.rect(L, at(150 + ch + 34), PW - 2 * L, 1.5, stroke=0, fill=1)
    para(S4_FOOT, L, 150 + ch + 52, 740, "Helvetica-Bold", 11.4, CINK)
    para("Speech recognition and hand tracking run in the browser. Nothing a patient signs leaves the device in this build.",
         L, 150 + ch + 118, 720, "Helvetica", 9.6, CINK45)
    footer(4)
    c.showPage()

    # 5
    fill(CBONE)
    title("STATUS  ·  TRACTION 20%", "What works today. What does not.")
    colw = 400
    for x, h, items, bg, fg in ((L, "EXISTS", S5_EXISTS, CPALE, CINK),
                                (R - colw, "DOES NOT EXIST", S5_MISSING, CINK, CMUTE)):
        c.setFillColor(bg)
        c.rect(x, at(150 + 206), colw, 206, stroke=0, fill=1)
        kicker(h, x + 22, 176)
        yy = 204
        for it in items:
            yy = para("—  " + it, x + 22, yy, colw - 46, "Helvetica", 10.0, fg) + 12
    para(S5_NOTE, L, 398, 720, "Helvetica-Bold", 12.4, CINK)
    footer(5)
    c.showPage()

    # 6
    fill(CBONE)
    title("IMPACT AND REACH  ·  30%", "A law already says yes. Nothing delivers it.")
    colw = 268
    x = L
    for num, cap in S6_STATS:
        c.setFont("Helvetica-Bold", 32)
        c.setFillColor(CBLUE)
        c.drawString(x, at(186), num)
        para(cap, x, 200, colw - 18, "Helvetica", 9.0, CINK45)
        x += colw + 21
    c.setFillColor(CLINE)
    c.rect(L, at(268), PW - 2 * L, 1.5, stroke=0, fill=1)
    y = 288
    for kick, body in S6_BODY:
        kicker(kick, L, y + 8, CBLUE, 7.0)
        yy = para(body, L + 160, y, 640, "Helvetica", 9.6, CINK70)
        y = max(yy + 12, y + 62)
    para(S6_FOOT, L, 470, 720, "Helvetica", 9.0, CINK45)
    footer(6)
    c.showPage()

    # 7
    fill(CBONE)
    title("RESPONSIBLE AI AND INCLUSION  ·  15%", "Built so a clinician can see when it is unsure.")
    colw = 380
    for x, (h, items) in ((L, S7_LEFT), (R - colw, S7_RIGHT)):
        kicker(h, x, 152)
        yy = 178
        for it in items:
            c.setFont("Helvetica-Bold", 12)
            c.setFillColor(CBLUE)
            c.drawString(x, at(yy + 9), "—")
            yy = para(it, x + 18, yy, colw - 26, "Helvetica", 10.0, CINK70) + 16
    para(S7_FOOT, L, 436, 740, "Helvetica-Bold", 12.0, CINK)
    footer(7)
    c.showPage()

    # 8
    fill(CBONE)
    title("POLICY ALIGNMENT  ·  10%", "The obligation exists. The delivery does not.")
    y = 168
    for num, h, body in S8_ITEMS:
        c.setFont("Helvetica-Bold", 14)
        c.setFillColor(CBLUE)
        c.drawString(L, at(y + 4), num)
        c.setFont("Helvetica-Bold", 12.5)
        c.setFillColor(CINK)
        c.drawString(L + 58, at(y + 4), h)
        para(body, L + 58, y + 24, 640, "Helvetica", 10.0, CINK70)
        y += 92
    para(S8_FOOT, L, 462, 740, "Helvetica", 9.0, CINK45)
    footer(8)
    c.showPage()

    # 9
    fill(CBONE)
    title("TEAM", "One founder. The gap is the team, and I know it.")
    para(S9_BODY, L, 168, 720, "Helvetica", 11.6, CINK70, leading=1.5)
    BX, BT, BS = 790, 168, 140
    c.setFillColor(CINK)
    c.rect(BX, at(BT + BS), BS, BS, stroke=0, fill=1)
    kicker("FIRST HIRES", BX + 18, BT + 26, CBLUE, 6.6)
    c.setFont("Helvetica-Bold", 9.6)
    c.setFillColor(CBONE)
    c.drawString(BX + 18, at(BT + 58), "Deaf advisers")
    c.drawString(BX + 18, at(BT + 76), "NSL interpreters")
    footer(9)
    c.showPage()

    # 10
    fill(CINK)
    kicker("THE ASK", L, 56)
    c.setFont("Helvetica-Bold", 34)
    c.setFillColor(CBONE)
    c.drawString(L, at(96), "Three things, none of them a cheque.")
    y = 186
    for num, h, body in S10_ASKS:
        c.setFont("Helvetica-Bold", 16)
        c.setFillColor(CBLUE)
        c.drawString(L, at(y + 4), num)
        c.setFont("Helvetica-Bold", 12.5)
        c.setFillColor(CBONE)
        c.drawString(L + 56, at(y + 4), h)
        para(body, L + 56, y + 24, 640, "Helvetica", 10.0, CMUTE)
        y += 100
    c.setFont("Helvetica-Bold", 9.4)
    c.setFillColor(CBONE)
    c.drawString(L, 60, CONTACT)
    footer(10, dark=True)
    c.showPage()

    c.save()
    return OUT / "Unmute-AfCEN-10slides.pdf"


if __name__ == "__main__":
    print("pptx:", build_pptx())
    print("pdf: ", build_pdf())
