#!/usr/bin/env python3
"""
Shared typesetter for the Unmute documents.

A4 portrait, flowing text with automatic pagination, running headers and
footers, and the same palette and faces as the pitch deck so a document from
this folder is recognisably from the same press as the deck and the one-pager.

Two things here are deliberate and should not be "simplified":

1.  Every string is drawn through an explicit text object with charSpace 0 and
    any extra air supplied as *word* spacing (Tw). Letter-spacing would look
    the same but every PDF text extractor reproduces it as "T H E  G A P", so a
    screen reader spells the heading out loud. On these documents that is not a
    cosmetic defect.
2.  Dates are written "October 2026". The page carries a year, never a
    day-month-year that could be misread.
"""

from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfdoc, pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas as pdfcanvas

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "pitch-deck" / "fonts"

# ── page ─────────────────────────────────────────────────────────────────
PW, PH = 595.276, 841.890          # A4 portrait, points
M = 54.0                           # left and right margin
CW = PW - 2 * M                    # 487.276
TOP = PH - 62.0
BOTTOM = 74.0                      # nothing below this except furniture

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
    "AB": ("ArchivoBlack", "ArchivoBlack-Regular.ttf"),
    "AX": ("Archivo-ExtraBold", "Archivo-ExtraBold.ttf"),
    "AR": ("Archivo-Bold", "Archivo-Bold.ttf"),
    "SG": ("SpaceGrotesk-Med", "SpaceGrotesk-Medium.ttf"),
    "SGB": ("SpaceGrotesk-Bold", "SpaceGrotesk-Bold.ttf"),
}
for key, (name, fn) in FACES.items():
    pdfmetrics.registerFont(TTFont(name, str(FONTS / fn)))


class Doc:
    def __init__(self, path, title, subject="", total=None):
        self.path = path
        self.c = pdfcanvas.Canvas(str(path), pagesize=(PW, PH))
        self.c.setTitle(title)
        self.c.setAuthor("Unmute")
        self.c.setSubject(subject)
        self.page = 1
        self.total = total
        self.running = ""
        self.no_footer = False      # set for one-page forms
        self.bottom = BOTTOM        # per-document floor
        self.y = TOP

    # ── geometry ────────────────────────────────────────────────────────
    def need(self, h):
        """Start a new page if h points will not fit above the bottom margin."""
        if self.y - h < self.bottom:
            self.new_page()
            return True
        return False

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
        w = pdfmetrics.stringWidth(s, FACES[font][0], size)
        if track and " " in s:
            w += track * 4.0 * s.count(" ")
        return w

    def text(self, x, y, s, font, size, col=INK, track=0.0, align="left"):
        c = self.c
        w = self.measure(s, font, size, track)
        if align == "right":
            x -= w
        elif align == "center":
            x -= w / 2
        c.setFont(FACES[font][0], size)
        c.setFillColor(HexColor(col))
        t = c.beginText(x, y)
        t.setCharSpace(0)                       # never inherit sticky state
        t.setWordSpace(track * 4.0 if track else 0)
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

    def fit(self, s, font, size, maxw):
        while size > 5 and self.measure(s, font, size) > maxw:
            size -= 0.5
        return size

    def image(self, path, x, y, h):
        im = ImageReader(str(path))
        w = h * im.getSize()[0] / im.getSize()[1]
        self.c.drawImage(str(path), x, y, w, h, mask="auto")
        return w

    # ── flowing text ────────────────────────────────────────────────────
    def para(self, s, font="SG", size=9.4, col=INK, leading=None,
             indent=0.0, maxw=None, track=0.0, space_after=0.0):
        """Wrapped text that paginates. Returns nothing; advances self.y."""
        leading = leading or size * 1.48
        maxw = maxw or (CW - indent)
        for ln in self.wrap(s, font, size, maxw, track):
            self.need(leading)
            self.text(M + indent, self.y, ln, font, size, col, track)
            self.y -= leading
        self.y -= space_after

    def bullet(self, s, size=9.4, leading=None, indent=13.0, col=INK,
               marker=BLUE, marker_size=3.0):
        leading = leading or size * 1.48
        lines = self.wrap(s, "SG", size, CW - indent)
        for i, ln in enumerate(lines):
            self.need(leading)
            if i == 0:
                self.rect(M + 1.5, self.y + 3.0, marker_size, marker_size, marker)
            self.text(M + indent, self.y, ln, "SG", size, col)
            self.y -= leading

    def heading(self, num, title):
        """Section head: a big blue numeral in the margin, the title beside it."""
        self.need(52)
        self.y -= 14
        self.line(M, self.y + 20, M + CW, self.y + 20, LINE, 0.8)
        self.y -= 12
        self.text(M, self.y, str(num), "AB", 20, BLUE)
        size = self.fit(title.upper(), "AB", 15, CW - 34)
        self.text(M + 34, self.y + 1, title.upper(), "AB", size, INK)
        self.y -= 20

    def subhead(self, title):
        self.need(24)
        self.y -= 2
        self.text(M, self.y, title.upper(), "AR", 8.2, BLUE, track=0.5)
        self.y -= 12.4

    def numbered(self, n, s, size=9.4, leading=None):
        leading = leading or size * 1.48
        lines = self.wrap(s, "SG", size, CW - 20)
        for i, ln in enumerate(lines):
            self.need(leading)
            if i == 0:
                self.text(M + 1, self.y, str(n), "SGB", size, BLUE)
            self.text(M + 20, self.y, ln, "SG", size, INK)
            self.y -= leading

    # ── page furniture ──────────────────────────────────────────────────
    def footer(self, running=""):
        if self.no_footer:
            return
        c = self.c
        c.setLineWidth(0.8)
        c.setStrokeColor(HexColor(LINE))
        c.line(M, 46, M + CW, 46)
        self.text(M, 36, running.upper(), "AR", 6.4, MUTE2, track=0.9)
        right = f"PAGE {self.page}" + (f" OF {self.total}" if self.total else "")
        self.text(M + CW, 36, right, "AR", 6.4, MUTE2, track=0.9, align="right")

    def new_page(self):
        self.footer(self.running)
        self.c.showPage()
        self.page += 1
        self.y = TOP
        self.continuation()

    def continuation(self):
        """Running head on every page after the first."""
        self.rect(0, 0, PW, PH, PAPER)
        self.text(M, PH - 44, self.running.upper(), "AR", 6.8, MUTE2, track=0.9)
        self.text(M + CW, PH - 44, "UNMUTE", "AB", 6.8, INK, track=0.9, align="right")
        self.line(M, PH - 52, M + CW, PH - 52, LINE, 0.8)

    def save(self, end_page=True):
        """
        end_page=False for a document built entirely on page one: showPage()
        would otherwise leave a blank second page behind.
        """
        self.footer(self.running)
        try:
            self.c._doc.Catalog.Lang = pdfdoc.PDFString("en-GB")
        except Exception:
            pass
        if end_page:
            self.c.showPage()
        self.c.save()
        return self.page


def render(build, out, title, subject=""):
    """
    Render twice: once into a throwaway buffer to learn the page count, then
    for real so the footer can say "Page 2 of 5" instead of "Page 2".
    """
    import io

    probe = Doc(io.BytesIO(), title, subject)
    probe.running = ""
    total = build(probe)

    doc = Doc(out, title, subject, total=total)
    doc.running = ""
    build(doc)
    doc.save()
    return total
