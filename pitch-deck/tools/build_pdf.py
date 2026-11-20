#!/usr/bin/env python3
"""
Renders the pitch deck to PDF.

The HTML deck is the master. This is a print path for the Drive upload, so a
reviewer gets a file they can open with one click instead of an .html they have
to download first.

Design coordinates are the same 1280x720 the HTML uses; the canvas is scaled to
0.75 so the page is 960x540pt (16:9), which is the usual presentation size.

Type: Syncopate is not embeddable here, so headlines fall back to
Helvetica-Bold. The structure and colour are preserved; the letterforms are not.
"""
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader

W, H = 1280, 720          # design space
SCALE = 0.75              # -> 960x540pt pages
M = 76                    # side margin
TOP = 64
BOT = 56

BONE   = HexColor("#E3E1DC")
PAPER  = HexColor("#F7F6F3")
INK    = HexColor("#121212")
INK70  = HexColor("#454540")
INK45  = HexColor("#7A7871")
BLUE   = HexColor("#006AFE")
BLUELO = HexColor("#E6F0FF")
LBLUE  = HexColor("#6FA8FF")
RED    = HexColor("#B3261E")
AMBER  = HexColor("#C97C13")

TOTAL = 21


def wrap(c, text, font, size, max_w):
    """Greedy wrap. Good enough for the measure widths used here."""
    c.setFont(font, size)
    words, lines, cur = text.split(), [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if c.stringWidth(trial, font, size) <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


class Deck:
    def __init__(self, path):
        self.c = canvas.Canvas(path, pagesize=(W * SCALE, H * SCALE))
        self.n = 0

    def new(self, bg=BONE):
        if self.n:
            self.c.showPage()
        self.n += 1
        self.c.saveState()
        self.c.scale(SCALE, SCALE)
        self.c.setFillColor(bg)
        self.c.rect(0, 0, W, H, fill=1, stroke=0)

    def done(self):
        self.c.showPage()
        self.c.save()

    # ---------- furniture ----------
    def kicker(self, text, dark=False, y=None):
        y = H - TOP if y is None else y
        c = self.c
        c.setFillColor(HexColor("#8A8880") if dark else INK45)
        c.setFont("Helvetica-Bold", 9.5)
        c.drawString(M + 44, y, text.upper())
        c.setLineWidth(1)
        c.setStrokeColor(HexColor("#8A8880") if dark else INK45)
        c.line(M, y + 3, M + 32, y + 3)
        return y

    def head(self, text, y, size=40, dark=False, width=None, leading=None):
        c = self.c
        width = width or (W - 2 * M - 40)
        leading = leading or size * 1.12
        c.setFillColor(BONE if dark else INK)
        lines = wrap(c, text, "Helvetica-Bold", size, width)
        for i, ln in enumerate(lines):
            c.setFont("Helvetica-Bold", size)
            c.drawString(M, y - i * leading, ln)
        return y - (len(lines) - 1) * leading - leading * 0.85

    def foot(self, left, right, dark=False):
        c = self.c
        c.setFillColor(HexColor("#6E6C66") if dark else HexColor("#A5A39C"))
        c.setFont("Helvetica-Bold", 7.5)
        c.drawString(M, 26, left.upper())
        c.drawRightString(W - M, 26, str(right).upper())

    def body(self, text, y, size=15, dark=False, width=None, leading=None, color=None):
        c = self.c
        width = width or (W - 2 * M - 120)
        leading = leading or size * 1.5
        c.setFillColor(color or (HexColor("#B9B6AE") if dark else INK70))
        lines = wrap(c, text, "Helvetica", size, width)
        for i, ln in enumerate(lines):
            c.setFont("Helvetica", size)
            c.drawString(M, y - i * leading, ln)
        return y - (len(lines) - 1) * leading - leading * 0.6


d = Deck("/home/user/unmute-sign/pitch-deck/Unmute-Pitch-Deck.pdf")

# ============ 1 TITLE ============
d.new(INK)
c = d.c
c.drawImage(ImageReader("/home/user/unmute-sign/pitch-deck/assets/hero.jpg"),
            0, 0, W, H, preserveAspectRatio=False, mask='auto')
c.setFillColor(INK); c.setFillAlpha(0.80); c.rect(0, 0, W, H, fill=1, stroke=0)
c.setFillAlpha(0.55); c.rect(0, H * 0.55, W, H * 0.45, fill=1, stroke=0)
c.setFillAlpha(1)
c.setFillColor(BONE)
c.setFont("Helvetica-Bold", 17); c.drawString(M, H - 150, "U N M U T E")
c.setStrokeColor(HexColor("#4A4A46")); c.setLineWidth(1); c.line(M, H - 168, W - M, H - 168)
c.setFont("Helvetica-Bold", 44)
c.drawString(M, 300, "Most Deaf patients never")
c.drawString(M, 250, "get an interpreter.")
c.setFillColor(LBLUE)
c.drawString(M, 176, "Unmute is what's there instead.")
c.setFillColor(HexColor("#B9B6AE")); c.setFont("Helvetica", 11)
c.setStrokeColor(HexColor("#4A4A46")); c.line(M, 128, W - M, 128)
c.drawString(M, 108, "Pre-seed  ·  2026")
c.drawString(M + 230, 108, "liveunmute.com")
c.drawString(M + 470, 108, "contact@liveunmute.com")
d.foot("Two-way sign-language communication for hospitals", "01", dark=True)

# ============ 2 BASELINE ============
d.new()
d.kicker("The baseline")
y = d.head("Under one in ten encounters involves a professional interpreter.", H - 118, size=34)
rows = [("A family member interprets", 63.9, True), ("The patient writes on paper", 16.9, False),
        ("A friend interprets", 6.0, False), ("A hospital interpreter", 4.8, False),
        ("Video link to an interpreter", 3.6, False)]
by = y - 30
label_x = M + 300
bar_x = M + 330
bar_w = 620
for name, pct, hi in rows:
    c.setFillColor(INK if hi else INK70)
    c.setFont("Helvetica-Bold" if hi else "Helvetica", 13)
    c.drawRightString(label_x, by, name)
    c.setFillColor(HexColor("#ECEAE5")); c.rect(bar_x, by - 6, bar_w, 22, fill=1, stroke=0)
    c.setFillColor(BLUE if hi else INK); c.rect(bar_x, by - 6, bar_w * pct / 100, 22, fill=1, stroke=0)
    c.setFillColor(INK); c.setFont("Helvetica-Bold", 12)
    c.drawString(bar_x + bar_w + 14, by, f"{pct}%")
    by -= 40
c.setStrokeColor(HexColor("#D3D1CB")); c.setLineWidth(1); c.line(M, 116, W - M, 116)
d.body("How emergency physicians actually communicate with Deaf patients (n = 166). "
       "Akeely et al., Cureus, 2022. In the same study, 74.1% of departments had no policy "
       "for Deaf patients and 90.4% of staff knew no sign language.", 96, size=10.5,
       width=W - 2 * M, color=INK45, leading=15)
d.foot("Unmute", "02")

# ============ 3 ARITHMETIC ============
d.new(INK)
d.kicker("The arithmetic", dark=True)
y = d.head("Fifty Deaf ASL users for every certified interpreter.", H - 118, size=34, dark=True)
stats = [("500,000", "Deaf adults in the US who use ASL as a primary language", False),
         ("10,000", "Certified ASL interpreters in the US", False),
         ("50 : 1", "Before accounting for geography, hours, or scheduling", True)]
sy = y - 60
c.setStrokeColor(HexColor("#3A3A36")); c.setLineWidth(1); c.line(M, sy + 26, W - M, sy + 26)
colw = (W - 2 * M) / 3
for i, (num, label, hi) in enumerate(stats):
    x = M + i * colw
    c.setFillColor(LBLUE if hi else BONE); c.setFont("Helvetica-Bold", 46)
    c.drawString(x, sy - 20, num)
    c.setFillColor(HexColor("#B9B6AE")); c.setFont("Helvetica", 12)
    for j, ln in enumerate(wrap(c, label, "Helvetica", 12, colw - 40)):
        c.drawString(x, sy - 50 - j * 17, ln)
    if i:
        c.setStrokeColor(HexColor("#3A3A36")); c.line(x - 24, sy + 26, x - 24, sy - 96)
c.setStrokeColor(HexColor("#3A3A36")); c.line(M, sy - 110, W - M, sy - 110)
d.body("A million deaf and hard-of-hearing adults use some form of signing. "
       "We quote the smaller, defensible figure of 500,000 on purpose.", sy - 138,
       size=14, dark=True, width=760)
d.foot("Sources: AAFP 2024  ·  Registry of Interpreters for the Deaf", "03", dark=True)

# ============ 4 CONSEQUENCE ============
d.new()
d.kicker("The consequence")
y = d.head("In the vacuum, care is improvised — and sometimes it goes wrong.", H - 118, size=32)
qy = y - 24
quotes = [
    ("“Interpreter access was uncertain, delayed or absent at key points of\nemergency care, including assessment and consent.”",
     "Hazelwood et al., Journal of Clinical Nursing, 2026"),
    ("A triage delayed awaiting an ASL interpreter. A Deaf patient restrained\nfor a scan, unable to tear skin trying to get free.",
     "Pennsylvania Patient Safety Authority, 2025"),
]
for txt, cite in quotes:
    c.setStrokeColor(BLUE); c.setLineWidth(3); c.line(M, qy - 2, M, qy - 62)
    c.setFillColor(INK); c.setFont("Helvetica-Oblique", 18)
    for j, ln in enumerate(txt.split("\n")):
        c.drawString(M + 20, qy, ln); qy -= 25
    c.setFillColor(INK45); c.setFont("Helvetica", 9)
    c.drawString(M + 20, qy - 4, cite.upper())
    qy -= 44
c.setFillColor(INK45); c.setFont("Helvetica", 12.5)
c.drawString(M, qy, "What fills the gap in practice:  handwritten notes  ·  lip-reading  ·  a relative's phone  ·  gestures")
d.foot("Unmute", "04")

# ============ 5 OBSTACLE ============
d.new()
d.kicker("The obstacle")
y = d.head("General sign models fail exactly where clinical communication lives.", H - 118, size=32)
fails = [("VOCABULARY", "Trained on broadcast and lecture footage. Knows family, school, weather.",
          "Has never seen hypertension, NPO after midnight, or a fingerspelled drug name."),
         ("NUMERACY", "Fifteen milligrams and fifty milligrams differ by one handshape.",
          "Dosage is the highest-consequence token in the room."),
         ("GRAMMAR", "ASL has its own syntax and non-manual markers.",
          "Anything that transcribes word-for-word produces signed English, which Deaf users correctly reject.")]
fw = (W - 2 * M - 52) / 3
for i, (t, p1, p2) in enumerate(fails):
    x = M + i * (fw + 26)
    c.setStrokeColor(INK); c.setLineWidth(2); c.line(x, y - 6, x + fw, y - 6)
    c.setFillColor(INK); c.setFont("Helvetica-Bold", 10)
    c.drawString(x, y - 26, t)
    ty = y - 52
    for para in (p1, p2):
        c.setFillColor(INK70); c.setFont("Helvetica", 12)
        for ln in wrap(c, para, "Helvetica", 12, fw):
            c.drawString(x, ty, ln); ty -= 17
        ty -= 8
d.foot("Unmute", "05")

# ============ 6 WEDGE ============
d.new()
d.kicker("The wedge")
y = d.head("Two hundred signs and phrases carry most of the routine clinical risk.", H - 118, size=32)
vocab = [("PAIN", "Location, severity, onset, duration"),
         ("HISTORY", "Allergies, current medication, prior conditions"),
         ("CONSENT", "Affirmation, teach-back, understanding check"),
         ("DISCHARGE", "Dose, frequency, warning signs, follow-up")]
vw = (W - 2 * M - 60) / 4
vy = y - 40
for i, (t, p) in enumerate(vocab):
    x = M + i * (vw + 20)
    c.setStrokeColor(HexColor("#D3D1CB")); c.setLineWidth(1); c.line(x, vy, x + vw, vy)
    c.setFillColor(BLUE); c.setFont("Helvetica-Bold", 9.5); c.drawString(x, vy - 18, t)
    c.setFillColor(INK70); c.setFont("Helvetica", 11)
    for j, ln in enumerate(wrap(c, p, "Helvetica", 11, vw)):
        c.drawString(x, vy - 38 - j * 15, ln)
c.setFillColor(INK); c.setFont("Helvetica-Oblique", 21)
c.drawString(M, 200, "Bounded vocabulary. High stakes.")
c.drawString(M, 172, "Repeated thousands of times a day, in every hospital in the country.")
d.foot("Unmute", "06")

# ============ 7 PRODUCT ============
d.new(PAPER)
d.kicker("The product")
y = d.head("Three flows. One direction. Measured, not promised.", H - 118, size=32)
cols = [
    ("v1 SHIPS", BLUE, ["Sign → text, on the patient's device", "Sign → speech, for the clinician",
     "Clinician → patient via recorded human signing, fixed clinical phrase set",
     "Runs on the hardware already in the room"]),
    ("NOT IN v1", INK, ["Generative signing avatars", "Text → sign synthesis", "Multilingual",
     "EHR integration", "Offline mode"]),
    ("A QUALIFIED INTERPRETER IS STILL ENGAGED", RED, ["Consent for procedures", "Diagnosis disclosure",
     "Mental health assessment", "Complex discharge planning", "End-of-life discussions"]),
]
cws = [1.15, 1.0, 1.0]
tot = sum(cws)
avail = W - 2 * M - 52
cx = M
for i, (title, colour, items) in enumerate(cols):
    cw = avail * cws[i] / tot
    c.setStrokeColor(colour); c.setLineWidth(2); c.line(cx, y - 6, cx + cw, y - 6)
    c.setFillColor(colour); c.setFont("Helvetica-Bold", 8.5)
    for j, ln in enumerate(wrap(c, title, "Helvetica-Bold", 8.5, cw)):
        c.drawString(cx, y - 22 - j * 12, ln)
    iy = y - 56
    for it in items:
        c.setFillColor(INK70); c.setFont("Helvetica", 11.5)
        for j, ln in enumerate(wrap(c, it, "Helvetica", 11.5, cw - 14)):
            c.drawString(cx + 12, iy - j * 15, ln)
        iy -= 15 * max(1, len(wrap(c, it, "Helvetica", 11.5, cw - 14))) + 8
    cx += cw + 26
d.foot("Specification, not a shipped build", "07")

# ============ 8 STATUS ============
d.new()
d.kicker("Status")
y = d.head("What exists, and what doesn't.", H - 118, size=34)
cols = [("EXISTS", INK, ["Problem definition, grounded in published clinical evidence",
         "Vendor landscape mapped and priced for both directions",
         "Clinical vocabulary scope defined", "A founder who has worked this problem for a year"]),
        ("DOES NOT EXIST", RED, ["A trained model", "A published clinical accuracy number",
         "A pilot", "A signed design partner", "Revenue"])]
cw = (W - 2 * M - 34) / 2
for i, (title, colour, items) in enumerate(cols):
    x = M + i * (cw + 34)
    c.setStrokeColor(colour); c.setLineWidth(2); c.line(x, y - 6, x + cw, y - 6)
    c.setFillColor(colour); c.setFont("Helvetica-Bold", 9.5); c.drawString(x, y - 24, title)
    iy = y - 50
    for it in items:
        c.setFillColor(colour); c.rect(x, iy - 2, 6, 6, fill=1, stroke=0)
        c.setFillColor(INK70); c.setFont("Helvetica", 12.5)
        for j, ln in enumerate(wrap(c, it, "Helvetica", 12.5, cw - 20)):
            c.drawString(x + 16, iy - j * 16, ln)
        iy -= 16 * max(1, len(wrap(c, it, "Helvetica", 12.5, cw - 20))) + 14
d.foot("Unmute", "08")

# ============ 9 MOAT ============
d.new()
d.kicker("Defensibility")
y = d.head("The only defensible asset here is a corpus nobody can scrape.", H - 118, size=32)
moats = [("01", "DATA", "Consented clinical ASL. Deaf patients and qualified interpreters, recording clinical vocabulary in clinical context, annotated to a protocol written with an ASL linguist, regional variation preserved rather than averaged away."),
         ("02", "BENCHMARK", "The published clinical accuracy number becomes what procurement asks every vendor for."),
         ("03", "WORKFLOW", "Embedded in triage. Switching cost rises with every shift that runs on it."),
         ("04", "INSTITUTION", "Security review completed, BAA signed, procurement navigated. Paperwork is a moat when your competitor is a solo founder.")]
my = y - 10
for n, t, desc in moats:
    c.setStrokeColor(HexColor("#D3D1CB")); c.setLineWidth(1); c.line(M, my, W - M, my)
    c.setFillColor(BLUE); c.setFont("Helvetica-Bold", 10); c.drawString(M, my - 20, n)
    c.setFillColor(INK); c.setFont("Helvetica-Bold", 10); c.drawString(M + 40, my - 20, t)
    c.setFillColor(INK70); c.setFont("Helvetica", 11.5)
    lines = wrap(c, desc, "Helvetica", 11.5, W - 2 * M - 200)
    for j, ln in enumerate(lines):
        c.drawString(M + 190, my - 20 - j * 15, ln)
    my -= 34 + 15 * (len(lines) - 1)
c.setStrokeColor(HexColor("#D3D1CB")); c.line(M, my, W - M, my)
d.foot("Thesis — we are building this, not yet holding it", "09")

# ============ 10 MODEL ============
d.new()
d.kicker("Model")
y = d.head("Subscription, per care team. Priced against the encounter it covers.", H - 118, size=30)
tiers = [("WARD", "~$199", "/ mo", "Up to 10 practitioners", "Nurse manager, clinic manager, ADA coordinator", False),
         ("DEPARTMENT", "~$599", "/ mo", "Up to 50 practitioners", "Department head, accessibility lead", True),
         ("ENTERPRISE", "Custom", "", "50+ practitioners", "Procurement, IT security, legal", False)]
tw = (W - 2 * M - 40) / 3
for i, (name, price, per, who, buyer, hi) in enumerate(tiers):
    x = M + i * (tw + 20)
    c.setStrokeColor(INK if hi else HexColor("#D3D1CB")); c.setLineWidth(2 if hi else 1)
    c.rect(x, y - 178, tw, 168, fill=1, stroke=1)
    c.setFillColor(INK45); c.setFont("Helvetica-Bold", 9); c.drawString(x + 20, y - 32, name)
    c.setFillColor(INK); c.setFont("Helvetica-Bold", 26); c.drawString(x + 20, y - 70, price)
    if per:
        c.setFillColor(INK45); c.setFont("Helvetica", 10); c.drawString(x + 24 + c.stringWidth(price, "Helvetica-Bold", 26), y - 70, per)
    c.setFillColor(INK45); c.setFont("Helvetica", 10.5); c.drawString(x + 20, y - 94, who)
    c.setStrokeColor(HexColor("#D3D1CB")); c.line(x + 20, y - 108, x + tw - 20, y - 108)
    c.setFillColor(INK); c.setFont("Helvetica-Bold", 7.5); c.drawString(x + 20, y - 126, "BUYER")
    c.setFillColor(INK70); c.setFont("Helvetica", 10)
    for j, ln in enumerate(wrap(c, buyer, "Helvetica", 10, tw - 40)):
        c.drawString(x + 20, y - 142 - j * 13, ln)
c.setFillColor(INK45); c.setFont("Helvetica", 11)
c.drawString(M, 150, "Billed monthly  ·  annual prepay discount  ·  BAA included from the Ward tier up.")
c.setFillColor(BLUE); c.setFont("Helvetica-Bold", 11)
c.drawString(M, 128, "These prices are a hypothesis, being tested in ten conversations.")
d.foot("Unmute", "10")

# ============ 11 OBJECTION ============
d.new()
d.kicker("The objection")
y = d.head("The current alternative is free. That is the thing to answer.", H - 118, size=30)
c.setFillColor(HexColor("#FBEBE9")); c.rect(M, y - 56, W - 2 * M, 46, fill=1, stroke=0)
c.setFillColor(RED); c.rect(M, y - 56, 3, 46, fill=1, stroke=0)
c.setFillColor(INK); c.setFont("Helvetica-Oblique", 20)
c.drawString(M + 20, y - 40, "“A family member does it for free.”")
ty = y - 88
c.setFillColor(INK45); c.setFont("Helvetica-Bold", 8)
c.drawString(M, ty, "ASPECT"); c.drawString(M + 210, ty, "CURRENT PRACTICE"); c.drawString(M + 620, ty, "UNMUTE")
c.setStrokeColor(INK); c.setLineWidth(1); c.line(M, ty - 8, W - M, ty - 8)
rows = [("COST", "$0", "~$199/month, up to 10 practitioners"),
        ("COMPLIANCE POSTURE", "Discouraged by the National Association of the Deaf — no impartiality, no medical vocabulary, no capacity for distress", "Purpose-built, documented, auditable"),
        ("RECORD OF THE ENCOUNTER", "None", "Communication log"),
        ("RISK IF IT GOES WRONG", "The hospital chose the free option knowingly", "A documented attempt at communication")]
ry = ty - 26
for a, b, cc in rows:
    c.setFillColor(INK); c.setFont("Helvetica-Bold", 8); c.drawString(M, ry, a)
    c.setFillColor(INK70); c.setFont("Helvetica", 10.5)
    for j, ln in enumerate(wrap(c, b, "Helvetica", 10.5, 380)):
        c.drawString(M + 210, ry - j * 14, ln)
    bh = 14 * len(wrap(c, b, "Helvetica", 10.5, 380))
    c.setFillColor(HexColor("#0E6B3A")); c.setFont("Helvetica", 10.5)
    for j, ln in enumerate(wrap(c, cc, "Helvetica", 10.5, 400)):
        c.drawString(M + 620, ry - j * 14, ln)
    ch = 14 * len(wrap(c, cc, "Helvetica", 10.5, 400))
    ry -= max(bh, ch, 18) + 12
    c.setStrokeColor(HexColor("#E0DED8")); c.setLineWidth(0.7); c.line(M, ry + 8, W - M, ry + 8)
d.foot("The choice is not Unmute vs. $0 — it is Unmute vs. a practice their own guidance discourages", "11")

# ============ 12 GTM ============
d.new()
d.kicker("Distribution")
y = d.head("Three design partners, not a sales team.", H - 118, size=34)
gtm = [("0 – 6 MONTHS", "Design partners", "Three departments — one ED, one outpatient clinic, one community health centre. Free for six months. In exchange: workflow access, data collection consent, a named testimonial."),
       ("6 – 12 MONTHS", "Paid ward deployments", "Bottom-up. A nurse manager buys the Ward tier on a card. No procurement committee, no RFP, no six-month cycle."),
       ("12 – 24 MONTHS", "Enterprise", "The first two steps generate the security review, the BAA template and the reference customer that enterprise sales requires.")]
gw = (W - 2 * M - 48) / 3
for i, (when, title, desc) in enumerate(gtm):
    x = M + i * (gw + 24)
    c.setStrokeColor(INK); c.setLineWidth(2); c.line(x, y - 6, x + gw, y - 6)
    c.setFillColor(BLUE); c.setFont("Helvetica-Bold", 8.5); c.drawString(x, y - 24, when)
    c.setFillColor(INK); c.setFont("Helvetica-Bold", 14); c.drawString(x, y - 46, title)
    c.setFillColor(INK70); c.setFont("Helvetica", 11)
    for j, ln in enumerate(wrap(c, desc, "Helvetica", 11, gw)):
        c.drawString(x, y - 68 - j * 15, ln)
c.setFillColor(INK); c.setFont("Helvetica", 15)
c.drawString(M, 180, "Channels: Deaf community organisations and interpreter agencies as referrers — not competitors.")
d.foot("Zero design partners today", "12")

# ============ 13 ROADMAP ============
d.new()
d.kicker("Plan")
y = d.head("Eighteen months. Three milestones. One number we're willing to publish.", H - 118, size=29)
ms = [("M1 · 0–6 MONTHS", "Clinical ASL model, 200-term scope", "Accuracy measured on held-out clinical data.", "Proof: the number is published, with its failure modes."),
      ("M2 · 6–12 MONTHS", "Three design partners live", "Deaf user and clinician testing in real departments.", "Proof: measured time-to-communication, not satisfaction scores."),
      ("M3 · 12–18 MONTHS", "First paid contract and corpus", "One Ward-tier customer paying, and an annotated corpus at a defensible size.", "Proof: revenue, and data a competitor cannot buy.")]
mw = (W - 2 * M - 56) / 3
for i, (when, title, desc, proof) in enumerate(ms):
    x = M + i * (mw + 28)
    c.setStrokeColor(INK); c.setLineWidth(2); c.line(x, y - 6, x + mw, y - 6)
    c.setFillColor(BLUE); c.setFont("Helvetica-Bold", 8.5); c.drawString(x, y - 24, when)
    c.setFillColor(INK); c.setFont("Helvetica-Bold", 13)
    ty = y - 46
    for ln in wrap(c, title, "Helvetica-Bold", 13, mw):
        c.drawString(x, ty, ln); ty -= 17
    c.setFillColor(INK70); c.setFont("Helvetica", 11)
    ty -= 6
    for ln in wrap(c, desc, "Helvetica", 11, mw):
        c.drawString(x, ty, ln); ty -= 15
    c.setStrokeColor(HexColor("#D3D1CB")); c.setLineWidth(1); c.line(x, ty - 6, x + mw, ty - 6)
    c.setFillColor(INK45); c.setFont("Helvetica", 9.5)
    for j, ln in enumerate(wrap(c, proof, "Helvetica", 9.5, mw)):
        c.drawString(x, ty - 22 - j * 13, ln)
c.setStrokeColor(BLUE); c.setLineWidth(3); c.line(M, 122, M, 96)
c.setFillColor(INK); c.setFont("Helvetica-Oblique", 17)
c.drawString(M + 18, 108, "If we miss M1, you'll know before we do — because we'll have published the number.")
d.foot("Unmute", "13")

# ============ 14 TEAM ============
d.new()
d.kicker("Team")
y = d.head("One founder today. The gap is the pitch.", H - 118, size=34)
c.setStrokeColor(INK); c.setLineWidth(2); c.line(M, y - 6, M + 480, y - 6)
c.setFillColor(INK); c.setFont("Helvetica-Bold", 9.5); c.drawString(M, y - 24, "TODAY")
c.setFillColor(INK); c.setFont("Helvetica-Bold", 13); c.drawString(M, y - 50, "Founder — AI research, NLP, product")
c.setFillColor(INK70); c.setFont("Helvetica", 11.5)
c.drawString(M, y - 68, "Built the ASL data pipeline. One year inside this problem.")
rx = M + 520
c.setStrokeColor(AMBER); c.setLineWidth(2); c.line(rx, y - 6, W - M, y - 6)
c.setFillColor(AMBER); c.setFont("Helvetica-Bold", 9.5); c.drawString(rx, y - 24, "BEING RECRUITED — BEFORE OR ALONGSIDE THIS ROUND")
rec = [("Deaf co-founder / Head of Product", "Decision authority, not an advisory title."),
       ("Clinical advisor", "Emergency medicine or nursing, currently practising."),
       ("ASL linguistics advisor", "Owns the corpus annotation protocol."),
       ("Paid Deaf design panel", "5–8 people, paid, with veto power over releases.")]
ry = y - 52
for role, desc in rec:
    c.setFillColor(INK); c.setFont("Helvetica-Bold", 12); c.drawString(rx, ry, role)
    c.setFillColor(INK70); c.setFont("Helvetica", 10.5); c.drawString(rx, ry - 15, desc)
    ry -= 40
d.foot("Names must be real or absent — no implied advisors", "14")

# ============ 15 THE ASK ============
d.new(INK)
d.kicker("The ask", dark=True)
y = d.head("Raising $250,000 to reach a number we can publish.", H - 118, size=30, dark=True)
c.setFillColor(LBLUE); c.setFont("Helvetica-Bold", 58); c.drawString(M, y - 46, "$250k")
c.setFillColor(BONE); c.setFont("Helvetica-Bold", 13); c.drawString(M + 230, y - 24, "Pre-seed  ·  18 months")
c.setFillColor(HexColor("#B9B6AE")); c.setFont("Helvetica", 10.5)
c.drawString(M + 230, y - 42, "Built bottom-up from the six lines below, not chosen as a round figure.")
c.setStrokeColor(HexColor("#3A3A36")); c.setLineWidth(1); c.line(M, y - 66, W - M, y - 66)
ay = y - 88
c.setFillColor(HexColor("#8D8B84")); c.setFont("Helvetica-Bold", 7.5)
c.drawString(M, ay, "USE OF FUNDS"); c.drawRightString(W - M - 60, ay, "AMOUNT"); c.drawRightString(W - M, ay, "SHARE")
ay -= 16
c.setStrokeColor(HexColor("#4A4A46")); c.line(M, ay, W - M, ay)
funds = [("Corpus collection & annotation — 200 terms, 5+ signers, linguist-annotated", "$85,000", "34%"),
         ("Founder runway & operations", "$45,000", "18%"),
         ("Clinical validation — three design partners", "$35,000", "14%"),
         ("Compliance — HIPAA posture, BAA, security review, counsel", "$30,000", "12%"),
         ("Deaf design panel & advisory — ASL linguistics, clinical", "$30,000", "12%"),
         ("Model development & compute", "$25,000", "10%")]
ay -= 20
for label, amt, pct in funds:
    c.setFillColor(HexColor("#CFCCC5")); c.setFont("Helvetica", 11.5); c.drawString(M, ay, label)
    c.setFillColor(BONE); c.setFont("Helvetica-Bold", 11); c.drawRightString(W - M - 60, ay, amt)
    c.setFillColor(HexColor("#8D8B84")); c.setFont("Helvetica", 10); c.drawRightString(W - M, ay, pct)
    ay -= 11
    c.setStrokeColor(HexColor("#333330")); c.setLineWidth(0.6); c.line(M, ay, W - M, ay)
    ay -= 17
c.setFillColor(LBLUE); c.setFont("Helvetica-Bold", 10.5); c.drawString(M, ay - 4, "Staged, not lumped:")
c.setFillColor(HexColor("#B9B6AE")); c.setFont("Helvetica", 10.5)
c.drawString(M + 110, ay - 4, "the first $110,000 buys the corpus and the compute — that is M1, the published accuracy number.")
d.foot("Milestone: published accuracy · three design partners · one paying customer", "15", dark=True)

# ============ A1 SOURCES ============
d.new(PAPER)
c.setFillColor(INK); c.rect(M, H - 82, 96, 18, fill=1, stroke=0)
c.setFillColor(BONE); c.setFont("Helvetica-Bold", 7.5); c.drawString(M + 8, H - 77, "APPENDIX A1")
d.head("Evidence and sources.", H - 112, size=28)
srcs = ["[1] Graham Center, “Understanding the Health Care Needs of the Deaf Community Through Medical Interpreters,” American Family Physician, Oct 2024.",
        "[2] Mitchell & Young, “How Many People Use Sign Language?” NHIS 2010–2018; RIT Libraries summary.",
        "[3] Registry of Interpreters for the Deaf, ~10,000 certified interpreters, cited by Deaf Services Unlimited.",
        "[4] US Dept. of Justice, “ADA Business Brief: Communicating with People Who Are Deaf or Hard of Hearing in Hospital Settings.”",
        "[5] National Association of the Deaf, “Position Statement on Health Care Access for Deaf Patients.”",
        "[6] Hazelwood et al., Journal of Clinical Nursing, Oct 2026.",
        "[7] Wilson-Menzfeld et al., Health & Social Care in the Community, 2025.",
        "[8] Pennsylvania Patient Safety Authority, May 2025.",
        "[9] Gallaudet University, “How Many People Use ASL in the United States?”",
        "[10] Akeely et al., Cureus, Nov 2022. n = 166 emergency physicians.",
        "[11] Reeves et al. (2002), cited in Frontiers in Communication, 2020."]
colw = (W - 2 * M - 40) / 2
for i, s in enumerate(srcs):
    col, row = divmod(i, 6)
    x = M + col * (colw + 40)
    yy = H - 150 - row * 52
    c.setFillColor(INK70); c.setFont("Helvetica", 9.5)
    for j, ln in enumerate(wrap(c, s, "Helvetica", 9.5, colw)):
        c.drawString(x, yy - j * 13, ln)
d.foot("Every figure in this deck traces to a published source", "A1")

# ============ A2 COMPETITION ============
d.new(PAPER)
c.setFillColor(INK); c.rect(M, H - 82, 96, 18, fill=1, stroke=0)
c.setFillColor(BONE); c.setFont("Helvetica-Bold", 7.5); c.drawString(M + 8, H - 77, "APPENDIX A2")
y = d.head("The competitive landscape, named.", H - 112, size=28)
rows = [("VRI providers", "Video remote interpreting, human interpreters", "Human, scheduled, per-minute. We cover the encounters that never get booked."),
        ("Interpreter agencies", "Supply qualified humans", "Referral channel, not a competitor. They hold the hospital relationships."),
        ("Google SL2T", "Best-in-class ASL→English, Pixel 11 only", "No API, no SDK, and medical use explicitly excluded from its intended use."),
        ("Signapse", "Photorealistic English→ASL generation", "Generation only. Their own docs confirm no recognition direction."),
        ("Sign-Speak / SignCaption", "Two-way recognition and avatars", "General purpose. Consumer terms are non-commercial and train on uploaded content."),
        ("Unmute", "Clinical ASL, bounded vocabulary, measured", "Narrow on purpose, so an accuracy number is possible at all.")]
ty = y - 12
c.setFillColor(INK45); c.setFont("Helvetica-Bold", 7.5)
c.drawString(M, ty, "PLAYER"); c.drawString(M + 160, ty, "WHAT THEY DO"); c.drawString(M + 480, ty, "WHY THEY ARE NOT THIS")
c.setStrokeColor(INK); c.setLineWidth(1); c.line(M, ty - 8, W - M, ty - 8)
ty -= 26
for i, (a, b, cc) in enumerate(rows):
    us = (a == "Unmute")
    if us:
        c.setFillColor(BLUELO); c.rect(M - 8, ty - 24, W - 2 * M + 16, 34, fill=1, stroke=0)
    c.setFillColor(BLUE if us else INK); c.setFont("Helvetica-Bold", 10); c.drawString(M, ty, a)
    c.setFillColor(INK70); c.setFont("Helvetica", 9.5); c.drawString(M + 160, ty, b)
    lines = wrap(c, cc, "Helvetica", 9.5, W - M - (M + 480))
    for j, ln in enumerate(lines):
        c.drawString(M + 480, ty - j * 12, ln)
    ty -= max(12 * len(lines), 14) + 18
    c.setStrokeColor(HexColor("#E0DED8")); c.setLineWidth(0.6); c.line(M, ty + 10, W - M, ty + 10)
d.foot("Vendor claims verified against primary documentation, 2026", "A2")

# ============ A3 REGULATORY ============
d.new(PAPER)
c.setFillColor(INK); c.rect(M, H - 82, 96, 18, fill=1, stroke=0)
c.setFillColor(BONE); c.setFont("Helvetica-Bold", 7.5); c.drawString(M + 8, H - 77, "APPENDIX A3")
y = d.head("Regulatory posture.", H - 112, size=28)
y = d.body("The ADA requires hospitals to provide effective communication, including a qualified "
           "interpreter where necessary for meaningful access. Unmute sits alongside that obligation, "
           "addressing the routine encounters where no interpreter was ever booked.",
           y - 14, size=13, width=W - 2 * M - 60)
c.setFillColor(HexColor("#FBEBE9")); c.rect(M, y - 74, W - 2 * M, 66, fill=1, stroke=0)
c.setFillColor(RED); c.rect(M, y - 74, 3, 66, fill=1, stroke=0)
c.setFillColor(INK); c.setFont("Helvetica-Bold", 11.5)
c.drawString(M + 18, y - 24, "Unmute does not satisfy the requirement for a qualified interpreter and is not positioned as doing so.")
c.setFillColor(INK70); c.setFont("Helvetica", 10.5)
for j, ln in enumerate(wrap(c, "Consent for procedures, diagnosis disclosure, mental health assessment and end-of-life discussions "
                              "remain human-interpreter conversations. This positioning must be reviewed by US healthcare counsel before external use.",
                              "Helvetica", 10.5, W - 2 * M - 40)):
    c.drawString(M + 18, y - 42 - j * 14, ln)
d.foot("Pending counsel review", "A3")

# ============ A4 DATA ETHICS ============
d.new(PAPER)
c.setFillColor(INK); c.rect(M, H - 82, 96, 18, fill=1, stroke=0)
c.setFillColor(BONE); c.setFont("Helvetica-Bold", 7.5); c.drawString(M + 8, H - 77, "APPENDIX A4")
y = d.head("Data ethics and consent.", H - 112, size=28)
cols = [("HOW THE CORPUS IS COLLECTED", INK, ["Consented, paid Deaf participants and qualified interpreters",
         "Recorded for vocabulary, not for patient encounters",
         "Annotated to a protocol owned by an ASL linguistics advisor",
         "Regional variation preserved, not averaged away"]),
        ("WHAT WE WILL NOT DO", RED, ["Train on patient data from pilots",
         "Accept terms that grant a vendor rights to our recordings",
         "Scrape existing sign-language dictionaries",
         "Publish a model we cannot explain the data provenance of"])]
cw = (W - 2 * M - 34) / 2
for i, (title, colour, items) in enumerate(cols):
    x = M + i * (cw + 34)
    c.setStrokeColor(colour); c.setLineWidth(2); c.line(x, y - 6, x + cw, y - 6)
    c.setFillColor(colour); c.setFont("Helvetica-Bold", 9); c.drawString(x, y - 24, title)
    iy = y - 50
    for it in items:
        c.setFillColor(colour); c.rect(x, iy - 2, 6, 6, fill=1, stroke=0)
        c.setFillColor(INK70); c.setFont("Helvetica", 11.5)
        lines = wrap(c, it, "Helvetica", 11.5, cw - 20)
        for j, ln in enumerate(lines):
            c.drawString(x + 16, iy - j * 15, ln)
        iy -= 15 * len(lines) + 14
d.foot("Highest legal exposure in the venture — and the slide most likely to be probed", "A4")

# ============ A5 NOT DOING ============
d.new(PAPER)
c.setFillColor(INK); c.rect(M, H - 82, 96, 18, fill=1, stroke=0)
c.setFillColor(BONE); c.setFont("Helvetica-Bold", 7.5); c.drawString(M + 8, H - 77, "APPENDIX A5")
y = d.head("What we are deliberately not doing.", H - 112, size=28)
items = [("Multilingual", "ASL first, because the data and the benchmark exist, and because the buyer with budget exists."),
         ("Avatar synthesis", "A generative avatar producing signed English is a liability in a clinical setting."),
         ("EHR integration", "Valuable, not load-bearing for a first pilot, and a long procurement cycle."),
         ("Consumer app", "The buyer is a hospital. A consumer product would change the entire compliance story."),
         ("A general translator", "Unbounded vocabulary makes an accuracy number impossible to state."),
         ("Replacing interpreters", "Never. The product covers what nothing currently covers.")]
colw = (W - 2 * M - 40) / 2
for i, (title, desc) in enumerate(items):
    col, row = divmod(i, 3)
    x = M + col * (colw + 40)
    yy = y - 14 - row * 84
    c.setFillColor(RED); c.setFont("Helvetica-Bold", 9); c.drawString(x, yy, "✕")
    c.setFillColor(INK); c.setFont("Helvetica-Bold", 12); c.drawString(x + 16, yy, title)
    c.setFillColor(INK70); c.setFont("Helvetica", 10.5)
    for j, ln in enumerate(wrap(c, desc, "Helvetica", 10.5, colw - 16)):
        c.drawString(x + 16, yy - 17 - j * 14, ln)
d.foot("Listing exclusions is a signal of judgement", "A5")

# ============ A6 NSL ============
d.new(PAPER)
c.setFillColor(INK); c.rect(M, H - 82, 96, 18, fill=1, stroke=0)
c.setFillColor(BONE); c.setFont("Helvetica-Bold", 7.5); c.drawString(M + 8, H - 77, "APPENDIX A6")
y = d.head("Why not Nigeria first?", H - 112, size=28)
y = d.body("ASL was chosen because the published clinical evidence, the open datasets, and the payer "
           "with budget all exist there. Nigerian Sign Language is the founder's home context and a "
           "genuine second-market ambition.", y - 14, size=13.5, width=W - 2 * M - 80)
c.setFillColor(HexColor("#FDF4E7")); c.rect(M, y - 70, W - 2 * M, 62, fill=1, stroke=0)
c.setFillColor(AMBER); c.rect(M, y - 70, 3, 62, fill=1, stroke=0)
c.setFillColor(INK); c.setFont("Helvetica-Bold", 11.5); c.drawString(M + 18, y - 22, "NSL is not a current capability.")
c.setFillColor(INK70); c.setFont("Helvetica", 10.5)
for j, ln in enumerate(wrap(c, "ASL and NSL are distinct languages with different grammar and vocabularies. "
                              "Nothing in this deck, and nothing in the v1 product, applies to Nigerian Sign Language "
                              "without a separate corpus and validation.", "Helvetica", 10.5, W - 2 * M - 40)):
    c.drawString(M + 18, y - 40 - j * 14, ln)
d.foot("Home market ambition, second-market timing", "A6")

d.done()
print(f"wrote {d.n} pages")
