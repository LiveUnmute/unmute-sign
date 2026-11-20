#!/usr/bin/env python3
"""Update only the pre-seed ask, use-of-funds, and cover amount in the supplied PDF.

All other source pages are copied directly and preserved unchanged.
Requires: PyMuPDF (pymupdf).
"""
from __future__ import annotations

from pathlib import Path
import pymupdf

HERE = Path(__file__).resolve().parent
SOURCE = HERE / "Unmute-Preseed-Source.pdf"
OUTPUT = HERE / "Unmute-Preseed-300K-Updated.pdf"
FONT_DIR = HERE.parent / "fonts"
FONT_MED = FONT_DIR / "SpaceGrotesk-Medium.ttf"
FONT_BOLD = FONT_DIR / "SpaceGrotesk-Bold.ttf"

W, H = 959.976, 540.0
BLACK = (18 / 255, 15 / 255, 14 / 255)
INK = (15 / 255, 16 / 255, 17 / 255)
INK_SOFT = (29 / 255, 31 / 255, 33 / 255)
BLUE = (66 / 255, 106 / 255, 179 / 255)
BLUE_BRIGHT = (0 / 255, 106 / 255, 254 / 255)
PAPER = (250 / 255, 250 / 255, 248 / 255)
WHITE = (244 / 255, 242 / 255, 237 / 255)
MUTED = (164 / 255, 164 / 255, 160 / 255)
RULE = (71 / 255, 71 / 255, 69 / 255)
PALE = (241 / 255, 241 / 255, 239 / 255)


ALLOCATIONS = [
    ("Product engineering & AI development", 90_000,
     "Strengthen the core AI engine, two-way communication capabilities and platform reliability."),
    ("Sign-language data development", 55_000,
     "Build and curate quality sign-language datasets with professional and community input."),
    ("Clinical validation & pilots", 40_000,
     "Conduct structured testing with Deaf patients and healthcare professionals and support hospital pilots."),
    ("Strategic hires & technical talent", 55_000,
     "Bring in the technical and operational expertise needed to execute the roadmap."),
    ("Infrastructure, security & compliance", 25_000,
     "Strengthen hosting, data protection, platform security and relevant compliance requirements."),
    ("Hospital onboarding & business development", 20_000,
     "Support hospital integration, customer acquisition and commercial partnerships."),
    ("Contingency", 15_000,
     "Cover unforeseen costs and critical execution needs."),
]

OUTCOMES = [
    "A reliable, hospital-ready two-way communication platform.",
    "Structured validation with Deaf patients and healthcare professionals.",
    "Successful hospital pilots with measurable performance outcomes.",
    "Initial paying hospital customers and recurring revenue.",
    "A repeatable hospital onboarding and customer acquisition process.",
    "Preparation for expansion into the U.S. market.",
]


def box(page, rect, text, *, size, color=INK, font="med", align=0,
        lineheight=1.12, bold=False):
    fontfile = FONT_BOLD if (font == "bold" or bold) else FONT_MED
    fontname = "spacebold" if (font == "bold" or bold) else "spacemed"
    remainder = page.insert_textbox(
        pymupdf.Rect(rect), text,
        fontname=fontname,
        fontfile=str(fontfile),
        fontsize=size,
        color=color,
        align=align,
        lineheight=lineheight,
        overlay=True,
    )
    if remainder < -0.05:
        raise ValueError(f"Text overflow ({remainder:.2f} pt): {text!r}")
    return remainder


def line(page, x1, y1, x2, y2, color=RULE, width=0.7):
    page.draw_line((x1, y1), (x2, y2), color=color, width=width, overlay=True)


def band(page, text):
    page.draw_rect(pymupdf.Rect(0, 61, 285, 95), color=BLUE, fill=BLUE, overlay=True)
    box(page, (61, 68, 278, 91), text, size=10.8, color=WHITE,
        font="bold", lineheight=1.0)


def add_cover_raise(page):
    # The supplied cover had no raise amount; the user approved adding it there.
    box(page, (600, 498, 900, 519), "RAISING $300,000  ·  PRE-SEED SAFE",
        size=8.2, color=BLUE_BRIGHT, font="bold", align=2, lineheight=1.0)


def draw_use_of_funds(page) -> None:
    page.draw_rect(page.rect, color=BLACK, fill=BLACK, overlay=True)

    band(page, "PRE-SEED SAFE  ·  $300,000")
    box(page, (54, 111, 905, 163), "WHAT $300,000 FUNDS.",
        size=38.5, color=WHITE, font="med", lineheight=1.0)
    box(page, (56, 168, 700, 184), "18-MONTH USE OF FUNDS  /  FROM PROTOTYPE TO SCALE",
        size=8.2, color=MUTED, font="bold", lineheight=1.0)

    # Stacked bar, with widths proportional to the exact dollar allocations.
    bar_x, bar_y, bar_w, bar_h = 55.0, 195.0, 850.0, 22.0
    bar_colors = [
        (66 / 255, 106 / 255, 179 / 255),
        (82 / 255, 124 / 255, 190 / 255),
        (101 / 255, 142 / 255, 197 / 255),
        (122 / 255, 157 / 255, 204 / 255),
        (151 / 255, 179 / 255, 214 / 255),
        (186 / 255, 205 / 255, 225 / 255),
        (225 / 255, 234 / 255, 243 / 255),
    ]
    cur_x = bar_x
    for idx, (_, amount, _) in enumerate(ALLOCATIONS):
        seg_w = bar_w * amount / 300_000
        page.draw_rect(pymupdf.Rect(cur_x, bar_y, cur_x + seg_w - 1.2, bar_y + bar_h),
                       color=bar_colors[idx], fill=bar_colors[idx], overlay=True)
        cur_x += seg_w

    # Table header.
    header_y = 237
    box(page, (57, header_y, 278, header_y + 13), "ALLOCATION", size=7.2,
        color=MUTED, font="bold", lineheight=1.0)
    box(page, (294, header_y, 727, header_y + 13), "PURPOSE", size=7.2,
        color=MUTED, font="bold", lineheight=1.0)
    box(page, (744, header_y, 842, header_y + 13), "AMOUNT", size=7.2,
        color=MUTED, font="bold", align=2, lineheight=1.0)
    box(page, (849, header_y, 903, header_y + 13), "SHARE", size=7.2,
        color=MUTED, font="bold", align=2, lineheight=1.0)
    line(page, 55, 252, 905, 252, color=RULE, width=0.7)

    row_h = 30.5
    row_y = 254.0
    for idx, (name, amount, purpose) in enumerate(ALLOCATIONS):
        top = row_y + idx * row_h
        bottom = top + row_h
        fill = (25 / 255, 27 / 255, 29 / 255) if idx % 2 == 0 else (20 / 255, 22 / 255, 24 / 255)
        page.draw_rect(pymupdf.Rect(55, top, 905, bottom), color=fill, fill=fill, overlay=True)
        box(page, (58, top + 4, 284, bottom - 3), name,
            size=8.4, color=WHITE, font="bold", lineheight=1.02)
        box(page, (294, top + 4, 730, bottom - 3), purpose,
            size=8.0, color=WHITE, font="med", lineheight=1.05)
        box(page, (742, top + 4, 842, bottom - 3), f"${amount:,.0f}",
            size=9.2, color=WHITE, font="bold", align=2, lineheight=1.0)
        share = amount / 300_000 * 100
        share_label = f"{share:.0f}%" if share.is_integer() else f"{share:.1f}%"
        box(page, (850, top + 4, 903, bottom - 3), share_label,
            size=8.3, color=BLUE_BRIGHT, font="bold", align=2, lineheight=1.0)
        line(page, 55, bottom, 905, bottom, color=RULE, width=0.35)

    total_y = row_y + len(ALLOCATIONS) * row_h + 1.5
    page.draw_rect(pymupdf.Rect(55, total_y, 905, total_y + 24),
                   color=BLUE, fill=BLUE, overlay=True)
    box(page, (64, total_y + 5, 278, total_y + 20), "TOTAL", size=8.7,
        color=WHITE, font="bold", lineheight=1.0)
    box(page, (294, total_y + 5, 727, total_y + 20), "18-month deployment plan",
        size=8.0, color=WHITE, font="med", lineheight=1.0)
    box(page, (742, total_y + 5, 842, total_y + 20), "$300,000",
        size=9.0, color=WHITE, font="bold", align=2, lineheight=1.0)
    box(page, (850, total_y + 5, 903, total_y + 20), "100%",
        size=8.0, color=WHITE, font="bold", align=2, lineheight=1.0)

    box(page, (55, 496, 600, 506), "FROM PROTOTYPE TO SCALE  ·  18-MONTH PRE-SEED PLAN",
        size=6.8, color=MUTED, font="bold", lineheight=1.0)
    line(page, 55, 510, 905, 510, color=RULE, width=0.55)
    box(page, (55, 516, 200, 530), "UNMUTE SIGN", size=7.3,
        color=MUTED, font="bold", lineheight=1.0)
    box(page, (840, 516, 905, 530), "09 / 12", size=7.3,
        color=MUTED, font="bold", align=2, lineheight=1.0)


def draw_ask(page) -> None:
    page.draw_rect(page.rect, color=PAPER, fill=PAPER, overlay=True)

    band(page, "THE ASK  ·  PRE-SEED SAFE")
    box(page, (65, 116, 905, 161), "RAISING $300,000",
        size=30.5, color=INK, font="bold", lineheight=1.0)
    box(page, (66, 163, 905, 184), "To scale accessible healthcare communication.",
        size=16.0, color=BLUE, font="med", lineheight=1.0)

    # Left: round rationale and 18-month plan.
    left = pymupdf.Rect(55, 194, 424, 472)
    page.draw_rect(left, color=PALE, fill=PALE, overlay=True)
    box(page, (74, 208, 406, 224), "THE ROUND", size=7.8,
        color=BLUE, font="bold", lineheight=1.0)
    intro = ("Unmute is raising $300,000 through a SAFE to transform its working "
             "prototype into a reliable, hospital-ready AI communication platform.")
    box(page, (74, 230, 405, 282), intro, size=8.9,
        color=INK, font="med", lineheight=1.12)
    line(page, 74, 291, 405, 291, color=(190 / 255, 190 / 255, 185 / 255), width=0.7)
    box(page, (74, 303, 405, 319), "OVER THE NEXT 18 MONTHS", size=7.8,
        color=BLUE, font="bold", lineheight=1.0)

    focus_items = [
        "Product development",
        "AI and sign-language data development",
        "Clinical validation",
        "Hospital integration",
        "Commercial expansion",
    ]
    y = 340
    for n, item in enumerate(focus_items, 1):
        box(page, (74, y, 96, y + 15), f"{n:02d}", size=7.6,
            color=BLUE, font="bold", lineheight=1.0)
        box(page, (103, y, 405, y + 16), item, size=8.4,
            color=INK, font="med", lineheight=1.0)
        y += 21

    # Right: target outcomes (clearly a forward plan, not current traction).
    right = pymupdf.Rect(444, 194, 905, 472)
    page.draw_rect(right, color=(1.0, 1.0, 1.0), fill=(1.0, 1.0, 1.0), overlay=True)
    box(page, (464, 208, 884, 225), "WHAT THIS CAPITAL WILL ACHIEVE",
        size=10.6, color=INK, font="bold", lineheight=1.0)
    box(page, (464, 229, 884, 242), "18-MONTH TARGET OUTCOMES",
        size=7.2, color=BLUE, font="bold", lineheight=1.0)
    start_y = 251
    row_h = 34.2
    for idx, outcome in enumerate(OUTCOMES, 1):
        top = start_y + (idx - 1) * row_h
        if idx % 2 == 0:
            page.draw_rect(pymupdf.Rect(458, top - 2, 891, top + row_h - 2),
                           color=(248 / 255, 248 / 255, 246 / 255),
                           fill=(248 / 255, 248 / 255, 246 / 255), overlay=True)
        box(page, (467, top + 4, 493, top + 23), f"{idx:02d}", size=8.4,
            color=BLUE, font="bold", lineheight=1.0)
        box(page, (502, top + 3, 882, top + 28), outcome, size=8.4,
            color=INK, font="med", lineheight=1.08)
        line(page, 458, top + row_h - 2, 891, top + row_h - 2,
             color=(220 / 255, 220 / 255, 217 / 255), width=0.35)

    goal = ("Our goal is to move from early institutional validation to measurable product "
            "adoption and recurring hospital revenue, beginning in Nigeria and preparing "
            "for international expansion.")
    box(page, (55, 476, 905, 489), goal, size=8.0,
        color=INK, font="med", lineheight=1.0)
    objective = ("Our objective is not simply to build the technology. It is to make "
                 "accessible healthcare communication commercially viable and scalable.")
    box(page, (55, 492, 905, 504), objective, size=7.6,
        color=BLUE, font="bold", lineheight=1.0)
    line(page, 55, 509, 905, 509, color=(70 / 255, 70 / 255, 68 / 255), width=0.6)
    box(page, (55, 515, 200, 529), "UNMUTE SIGN", size=7.3,
        color=INK, font="bold", lineheight=1.0)
    box(page, (840, 515, 905, 529), "12 / 12", size=7.3,
        color=INK, font="bold", align=2, lineheight=1.0)


def redact_page(page, fill) -> None:
    page.add_redact_annot(page.rect, fill=fill, cross_out=False)
    page.apply_redactions(images=2, graphics=1, text=0)
    page.draw_rect(page.rect, color=fill, fill=fill, overlay=True)


def main() -> None:
    if not SOURCE.exists():
        raise FileNotFoundError(SOURCE)
    if not FONT_MED.exists() or not FONT_BOLD.exists():
        raise FileNotFoundError("Expected Space Grotesk fonts under pitch-deck/fonts")

    source = pymupdf.open(SOURCE)
    if len(source) != 12:
        raise ValueError(f"Expected the attached 12-page deck, found {len(source)} pages")

    # Save incrementally on a byte-for-byte copy of the supplied source so untouched
    # pages retain their original resources, colors, and rendering exactly.
    OUTPUT.write_bytes(SOURCE.read_bytes())
    output = pymupdf.open(OUTPUT)
    if not output.can_save_incrementally():
        raise RuntimeError("Cannot save the source-preserving PDF incrementally")

    add_cover_raise(output[0])
    redact_page(output[8], BLACK)
    draw_use_of_funds(output[8])
    redact_page(output[11], PAPER)
    draw_ask(output[11])
    output.saveIncr()

    # Render-level preservation check for every untouched interior page.
    check = pymupdf.open(OUTPUT)
    if len(check) != 12:
        raise AssertionError(f"Expected 12 pages, got {len(check)}")
    unchanged = [1, 2, 3, 4, 5, 6, 7, 9, 10]
    for idx in unchanged:
        a = source[idx].get_pixmap(matrix=pymupdf.Matrix(1, 1), alpha=False)
        b = check[idx].get_pixmap(matrix=pymupdf.Matrix(1, 1), alpha=False)
        if (a.width, a.height, a.samples) != (b.width, b.height, b.samples):
            raise AssertionError(f"Untouched page {idx + 1} changed during PDF assembly")

    for idx in (8, 11):
        text = check[idx].get_text("text", sort=True)
        if "$10,000" in text or "National Demo Day" in text:
            raise AssertionError(f"Grant-specific content remains on replacement page {idx + 1}")
    for idx in (8, 11):
        if "$300,000" not in check[idx].get_text("text", sort=True):
            raise AssertionError(f"$300,000 missing from replacement page {idx + 1}")

    print(f"Created {OUTPUT}")
    print(f"Pages: {len(check)}; untouched interior pages pixel-identical: {len(unchanged)}")
    print(f"Output size: {OUTPUT.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
