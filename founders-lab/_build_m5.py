"""Build the completed Module 5 financial plan worksheet as .docx."""

from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

DARK_GREEN = RGBColor(0x06, 0x3B, 0x2B)
MID_GREEN = RGBColor(0x0B, 0x6B, 0x3A)
ACCENT_GREEN = RGBColor(0x1E, 0x8B, 0x45)
INK = RGBColor(0x1A, 0x1A, 0x1A)

doc = Document()
for s in doc.sections:
    s.top_margin = Inches(0.7)
    s.bottom_margin = Inches(0.7)
    s.left_margin = Inches(0.6)
    s.right_margin = Inches(0.6)

normal = doc.styles["Normal"]
normal.font.name = "Calibri"
normal.font.size = Pt(10)


def shade(cell, hexcolour):
    tcPr = cell._tc.get_or_add_tcPr()
    el = OxmlElement("w:shd")
    el.set(qn("w:val"), "clear")
    el.set(qn("w:fill"), hexcolour)
    tcPr.append(el)


def para(text="", size=10, bold=False, italic=False, colour=None, after=4, before=0):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.space_before = Pt(before)
    r = p.add_run(text)
    r.font.size = Pt(size)
    r.bold = bold
    r.italic = italic
    r.font.color.rgb = colour if colour else INK
    return p


def section(num, title):
    """Dark bar with a numbered chip, matching the worksheet's section headers."""
    t = doc.add_table(rows=1, cols=2)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    left, right = t.rows[0].cells
    left.width = Inches(0.55)
    right.width = Inches(6.5)
    shade(left, "0B6B3A")
    shade(right, "063B2B")
    lp = left.paragraphs[0]
    lp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    lr = lp.add_run(num)
    lr.bold = True
    lr.font.size = Pt(12)
    lr.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    rp = right.paragraphs[0]
    rr = rp.add_run("   " + title)
    rr.bold = True
    rr.font.size = Pt(12)
    rr.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)


def sub(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(9)
    p.paragraph_format.space_after = Pt(3)
    r = p.add_run(text)
    r.bold = True
    r.font.size = Pt(9.5)
    r.font.color.rgb = ACCENT_GREEN


def answer(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.left_indent = Inches(0.12)
    r = p.add_run(text)
    r.font.size = Pt(10)
    return p


def rule():
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    pPr = p._p.get_or_add_pPr()
    pbdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), "6")
    bottom.set(qn("w:space"), "1")
    bottom.set(qn("w:color"), "C9C9C9")
    pbdr.append(bottom)
    pPr.append(pbdr)

# ============================== COVER ==============================
para("Founders Lab  |  iDICE Startup Bridge", size=9, bold=True,
     colour=MID_GREEN, after=2)
para("Module 5: Funding and Finance", size=22, bold=True, colour=DARK_GREEN, after=0)
para("Develop a Financial Plan", size=13, colour=ACCENT_GREEN, after=2)
para("Budget period: November 2026 – April 2027", size=10, italic=True,
     colour=RGBColor(0xC8, 0x8A, 0x1E), after=16)

cover = doc.add_table(rows=4, cols=2)
cover.alignment = WD_TABLE_ALIGNMENT.CENTER
fields = [
    ("Participant Name", "Prince Michael"),
    ("Venture Name", "Unmute"),
    ("Cohort", "Founders Lab Cohort 2, 2026"),
    ("Date", "21 October 2026"),
]
for i, (k, v) in enumerate(fields):
    c0, c1 = cover.rows[i].cells
    c0.width = Inches(1.8)
    c1.width = Inches(4.5)
    shade(c0, "F2F6F3")
    kp = c0.paragraphs[0]
    kr = kp.add_run(k)
    kr.bold = True
    kr.font.size = Pt(10)
    kr.font.color.rgb = DARK_GREEN
    vp = c1.paragraphs[0]
    vr = vp.add_run(v)
    vr.font.size = Pt(10)

doc.add_paragraph()
para(
    "This worksheet sets out a basic financial plan for Unmute over the six months from "
    "November 2026 to April 2027: projected revenue, direct and operating costs, the "
    "assumptions the figures rest on, and how actual results will be tracked against them.",
    size=9.5, italic=True, colour=RGBColor(0x55, 0x55, 0x55), after=8,
)

doc.add_page_break()

# ============================== 01 ==============================
section("01", "Your Business Snapshot")
para("Summarise what the business is, what it offers and how it earns money.",
     size=9, italic=True, colour=RGBColor(0x55, 0x55, 0x55), after=6)

for i, txt in enumerate([
    "An AI-powered sign-language communication platform that helps Deaf patients and hearing "
    "healthcare professionals communicate.",
    "A healthcare communication tool offering ASL-to-text/speech and text/speech-to-visual-sign "
    "output, with initial functionality focused on routine healthcare interactions.",
    "Monthly subscription plans for hospitals and healthcare institutions, including a team plan "
    "for up to 10 practitioners and custom enterprise plans for larger institutions.",
], 1):
    p = doc.add_paragraph(style="List Number")
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run(txt)
    r.font.size = Pt(10)

# ============================== 02 ==============================
section("02", "Classify Your Spending With the MoSCoW Framework")
para("Before building your budget, separate what you must spend from what you want to spend. "
     "List at least two items in each box that apply to your business.",
     size=9, italic=True, colour=RGBColor(0x55, 0x55, 0x55), after=8)

MOSCOW = [
    ("Must Have", "Non-negotiable to operate", "0B6B3A", [
        "MVP development, including essential software tools and hosting.",
        "ASL datasets, verified sign-language content and validation.",
        "Testing with Deaf ASL users, interpreters and healthcare professionals.",
        "Internet, electricity and essential development equipment.",
    ]),
    ("Should Have", "High priority, strong start", "1E8B45", [
        "A simple website and hospital demonstration materials.",
        "Outreach and pilot testing with hospitals.",
        "User feedback collection and product improvement.",
        "Business registration and basic legal documentation before commercial deployment.",
    ]),
    ("Could Have", "Nice if resources allow", "2E9B52", [
        "Advanced 3D sign-language avatars.",
        "Custom AI model training and expanded sign recognition.",
        "Integration with hospital management systems.",
        "A dedicated mobile application beyond the initial web-based MVP.",
    ]),
    ("Won't Have Now", "Defer to a later stage", "6B6B6B", [
        "Expansion into multiple sign languages.",
        "Large-scale international marketing.",
        "A physical office and full-time administrative team.",
        "Advanced enterprise integrations before validating demand.",
    ]),
]

for row_start in (0, 2):
    t = doc.add_table(rows=2, cols=2)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for col in range(2):
        title, note, colour, items = MOSCOW[row_start + col]
        head = t.rows[0].cells[col]
        head.width = Inches(3.5)
        shade(head, colour)
        hp = head.paragraphs[0]
        hp.paragraph_format.space_after = Pt(0)
        hr = hp.add_run(title)
        hr.bold = True
        hr.font.size = Pt(10.5)
        hr.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        note_p = head.add_paragraph()
        note_p.paragraph_format.space_after = Pt(3)
        hv = note_p.add_run(note)
        hv.italic = True
        hv.font.size = Pt(8)
        hv.font.color.rgb = RGBColor(0xE8, 0xF5, 0xEC)

        body = t.rows[1].cells[col]
        body.width = Inches(3.5)
        for j, item in enumerate(items, 1):
            p = body.paragraphs[0] if j == 1 else body.add_paragraph()
            p.paragraph_format.space_after = Pt(2)
            r = p.add_run(f"{j}.  {item}")
            r.font.size = Pt(9.5)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)

doc.add_page_break()

# ============================== 03 ==============================
section("03", "Your 3 to 6-Month Budget")
para("Fill in your projected figures. Base revenue estimates on realistic assumptions, not "
     "best-case scenarios. All figures in Nigerian Naira (₦).",
     size=9, italic=True, colour=RGBColor(0x55, 0x55, 0x55), after=4)
para("Timeline covered by this budget — Start month: November 2026     End month: April 2027",
     size=9.5, bold=True, after=8)

HEADERS = ["Item", "Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"]
ROWS = [
    ("band", "Revenue — Nigerian Naira (₦)", None),
    ("item", "Paying institutions", ["0", "0", "30", "50", "100", "500"]),
    ("item", "Average monthly subscription", ["0", "0", "150,000", "150,000", "150,000", "150,000"]),
    ("bold", "Total projected revenue", ["0", "0", "4,500,000", "7,500,000", "15,000,000", "75,000,000"]),
    ("band", "Cost of Goods Sold (Direct Costs)", None),
    ("item", "Hosting / API / software usage", ["10,000", "15,000", "85,000", "150,000", "300,000", "1,200,000"]),
    ("item", "Other direct costs", ["5,000", "5,000", "10,000", "12,000", "20,000", "100,000"]),
    ("item", "Packaging / delivery", ["", "", "", "", "", ""]),
    ("bold", "Total COGS", ["15,000", "20,000", "95,000", "162,000", "320,000", "1,300,000"]),
    ("bold", "Gross profit", ["-15,000", "-20,000", "4,405,000", "7,338,000", "14,680,000", "73,700,000"]),
    ("band", "Fixed Operating Expenses", None),
    ("item", "Rent / workspace", ["0", "0", "85,000", "85,000", "85,000", "85,000"]),
    ("item", "Salaries / wages", ["0", "0", "0", "200,000", "200,000", "350,000"]),
    ("item", "Loan repayments", ["0", "0", "0", "0", "0", "0"]),
    ("item", "Business registration / legal", ["70,000", "0", "98,000", "0", "0", "0"]),
    ("band", "Variable Operating Expenses", None),
    ("item", "Marketing / advertising", ["0", "0", "30,000", "50,000", "70,000", "100,000"]),
    ("item", "Utilities (electricity, data, fuel)", ["50,000", "50,000", "50,000", "70,000", "100,000", "150,000"]),
    ("item", "Transport / logistics", ["20,000", "20,000", "35,000", "55,000", "55,000", "100,000"]),
    ("item", "Other variable costs", ["5,000", "5,000", "15,000", "35,000", "50,000", "85,000"]),
    ("bold", "Total operating expenses", ["145,000", "75,000", "313,000", "460,000", "760,000", "1,370,000"]),
    ("band", "Summary", None),
    ("bold", "Net profit / (loss)", ["-160,000", "-95,000", "4,092,000", "6,878,000", "13,920,000", "72,330,000"]),
    ("item", "Opening cash balance", ["285,000", "125,000", "5,030,000", "9,122,000", "16,000,000", "29,920,000"]),
    ("bold", "Closing cash balance", ["125,000", "30,000", "9,122,000", "16,000,000", "29,920,000", "102,250,000"]),
]

table = doc.add_table(rows=1, cols=7)
table.style = "Table Grid"
table.alignment = WD_TABLE_ALIGNMENT.CENTER

hdr = table.rows[0].cells
for i, h in enumerate(HEADERS):
    shade(hdr[i], "0B6B3A")
    p = hdr[i].paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT if i == 0 else WD_ALIGN_PARAGRAPH.RIGHT
    r = p.add_run(h)
    r.bold = True
    r.font.size = Pt(8.5)
    r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

for kind, label, values in ROWS:
    cells = table.add_row().cells
    if kind == "band":
        merged = cells[0].merge(cells[6])
        shade(merged, "E6F2EA")
        p = merged.paragraphs[0]
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(label)
        r.bold = True
        r.font.size = Pt(8.5)
        r.font.color.rgb = DARK_GREEN
        continue

    p = cells[0].paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(label)
    r.font.size = Pt(8.5)
    if kind == "bold":
        r.bold = True

    for i, v in enumerate(values, 1):
        p = cells[i].paragraphs[0]
        p.paragraph_format.space_after = Pt(2)
        p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r = p.add_run(v)
        r.font.size = Pt(8.5)
        if kind == "bold":
            r.bold = True

for row in table.rows:
    row.cells[0].width = Inches(2.05)
    for i in range(1, 7):
        row.cells[i].width = Inches(0.83)

para("Note: the ₦5,000,000 opening balance uplift in Month 3 is the iDICE grant "
     "(US$4,000), described in Assumption 3. It is not a revenue line.",
     size=8, italic=True, colour=RGBColor(0x66, 0x66, 0x66), before=5)

doc.add_page_break()

# ============================== 04 ==============================
section("04", "Your Budget Assumptions")
para("Name the three most important assumptions your budget is based on. Good assumptions are "
     "grounded in market research, conversations with others in your industry, or your own past data.",
     size=9, italic=True, colour=RGBColor(0x55, 0x55, 0x55), after=8)

sub("Assumption 1")
answer("Unmute will acquire its first paying healthcare institutions within three months of the "
       "MVP becoming available, and 500 paying healthcare institutions in the following 3 months "
       "is very realistic with the right approach.")
rule()
sub("Source or basis for this assumption")
answer("Planned outreach to hospitals and healthcare professionals, followed by product "
       "demonstrations and pilot discussions. This is an unvalidated assumption; there are no "
       "confirmed paying customers yet.")
rule()

sub("Assumption 2")
answer("The initial team subscription can be priced at approximately ₦150,000 per month for up "
       "to 10 practitioners.")
rule()
sub("Source or basis for this assumption")
answer("Unmute's monthly Team subscription price will be based on what healthcare institutions "
       "currently spend on sign-language interpreters, including hourly rates and booking costs. "
       "Pricing will be validated through hospital interviews and set to reflect potential cost "
       "savings, usage and Unmute's operating costs.")
rule()

sub("Assumption 3")
answer("Unmute can develop and test its initial MVP with relatively low operating costs by using "
       "existing tools and a founder-led development process.")
answer("Unmute will secure a $4,000 grant from iDICE, which explains the injected ₦5,000,000 in "
       "Month 3.")
rule()
sub("Source or basis for this assumption")
answer("The planned limited ASL-focused MVP, use of existing datasets and potential third-party "
       "sign-language APIs.")
answer("Actual API access fees, hosting costs, licensing requirements and testing expenses remain "
       "to be confirmed.")
answer("The iDICE program has assured to give high performing startups a $4,000 grant at the end "
       "of the program, which aligns with the timeline in the projections I made. The grant will "
       "be awarded to 50 out of 200 startups that are currently in the program, and I believe that "
       "with the level of commitment and progress that Unmute has made within the space of 2 months "
       "since the program began, we would be one of the recipients of the award. Grace and Grit.")

# ============================== 05 ==============================
section("05", "Budget Versus Actual")
para("Plan how you will track your actual results and compare them against what you projected.",
     size=9, italic=True, colour=RGBColor(0x55, 0x55, 0x55), after=6)

sub("How will you record your actual income and expenses during this period?")
answer("Google Sheets, with receipts, invoices and payment confirmations saved in a dedicated "
       "Unmute finance folder.")
rule()

sub("How often will you compare your budget to actual results?")
answer("Monthly, with a brief weekly cash-balance check.")
rule()

sub("Three questions to ask at each review")
for q in [
    "How much revenue did Unmute actually collect from hospital subscriptions, compared with the "
    "number of institutions we expected to onboard?",
    "What did it actually cost to develop, host and validate the MVP, and which expenses exceeded "
    "the budget?",
    "How much cash remains to fund the next month, and do we need to reduce spending, adjust "
    "pricing or secure additional funding?",
]:
    p = doc.add_paragraph(style="List Number")
    p.paragraph_format.space_after = Pt(3)
    r = p.add_run(q)
    r.font.size = Pt(10)

doc.add_paragraph()
para("Founders Lab  |  iDICE Startup Bridge  |  www.idicestartupbridge.ng",
     size=8, colour=RGBColor(0x88, 0x88, 0x88), after=0)

doc.save("/home/user/unmute-sign/founders-lab/Module_5_Financial_Plan_ANSWERS.docx")
print("saved")
