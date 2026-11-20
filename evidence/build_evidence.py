#!/usr/bin/env python3
"""
Unmute — Supporting Evidence.

One document combining the technical design, the working product, and the
field work behind it, for an application that asks for exactly that:

    "Combine your technical designs, mockups, screenshots or other evidence
     showing the solution's development into one document."

    /home/user/venv_deck/bin/python evidence/build_evidence.py

Five categories, in the order a reviewer needs them: what was built, what the
public sees, how it is engineered, where the founder has been, and the room he
pitched it to. The travel and event photographs are not decoration — they are
evidence that the problem was met in person, which is the claim the product
rests on.

Everything printed here is either visible in the screenshots, drawn from the
repository, or photographed on location. No traction numbers and no accuracy
figure: the classifier is a geometric prototype, and the document says so in
the contents and again where the architecture is described.
"""

import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(ROOT / "proposals"))

from pdfkit import (BLUE, BONE, CW, INK, LINE, M, MUTE, MUTE2, PAPER, PH,
                    PW, Doc)  # noqa: E402

from PIL import Image  # noqa: E402

SRC = HERE / "src"
OUT = HERE / "Unmute-Supporting-Evidence-2026.pdf"
LOGO_W = ROOT / "pitch-deck" / "assets" / "unmute-logo-white.png"
TOTAL = 9

TOP = PH - 96


# ── drawing helpers ──────────────────────────────────────────────────────

def page_head(d, left, right):
    d.rect(0, 0, PW, PH, PAPER)
    d.rect(0, PH - 5, PW, 5, BLUE)
    d.text(M, PH - 44, left.upper(), "AR", 6.6, MUTE2, track=1.4)
    d.text(M + CW, PH - 44, right.upper(), "AR", 6.6, MUTE2, track=1.4, align="right")
    d.line(M, PH - 52, M + CW, PH - 52, LINE, 0.8)


def page_foot(d, num):
    d.line(M, 50, M + CW, 50, LINE, 0.8)
    d.text(M, 39, "UNMUTE · SUPPORTING EVIDENCE · 2026", "AR", 6.2, MUTE2, track=1.2)
    d.text(M + CW, 39, f"{num} / {TOTAL}", "AR", 6.2, MUTE2, track=1.2, align="right")


def section(d, num, title, blurb):
    y = TOP
    d.text(M, y, num, "AB", 26, BLUE)
    d.text(M + 40, y + 2, title.upper(), "AB",
           d.fit(title.upper(), "AB", 17, CW - 40), INK)
    y -= 16
    d.line(M, y + 6, M + CW, y + 6, INK, 1.2)
    y -= 12
    for ln in d.wrap(blurb, "SG", 8.6, CW * 0.80):
        d.text(M, y, ln, "SG", 8.6, "#3A3A36")
        y -= 11.6
    return y - 10


def block(d, x, y, w, text, size=8.2, leading=11.0, col="#3A3A36"):
    for ln in d.wrap(text, "SG", size, w):
        d.text(x, y, ln, "SG", size, col)
        y -= leading
    return y


def crop_copy(path, top=0, bottom=0):
    """Trim player bars off a phone photograph and cache the result in /tmp."""
    im = Image.open(path)
    w, h = im.size
    out = Path(tempfile.gettempdir()) / f"unmute-{path.stem}-crop.png"
    im.crop((0, top, w, h - bottom)).save(out)
    return out


def card(d, path, x, y_top, width, caption, body, num=None):
    im = Image.open(path)
    w, h = im.size
    height = width * h / w
    d.rect(x - 3, y_top - height - 3, width + 6, height + 6, None, LINE, 0.7)
    d.c.drawImage(str(path), x, y_top - height, width, height)

    ty = y_top - height - 17
    if num:
        d.text(x, ty, num, "AR", 6.4, BLUE, track=1.2)
        d.text(x + 16, ty, caption.upper(), "AR", 6.4, INK, track=1.2)
    else:
        d.text(x, ty, caption.upper(), "AR", 6.4, INK, track=1.2)
    return block(d, x, ty - 11, width, body, 7.6, 9.8, "#4A4A45") + 2


def arrow_v(d, x, y_from, y_to):
    d.line(x, y_from, x, y_to + 4, LINE, 1)
    d.line(x, y_to + 4, x - 3, y_to + 8, LINE, 1)
    d.line(x, y_to + 4, x + 3, y_to + 8, LINE, 1)


# ═════════════════════════════════════════════════════════════════════════

def build():
    d = Doc(OUT, "Unmute — Supporting Evidence 2026",
            "Technical design, the working product, and field work")
    d.no_footer = True

    # ── 1 cover ─────────────────────────────────────────────────────────
    d.rect(0, 0, PW, PH, INK)
    d.rect(0, PH - 8, PW, 8, BLUE)

    d.image(LOGO_W, M, PH - 74, 24)
    d.text(M + CW, PH - 56, "2026", "AR", 7, MUTE2, track=1.4, align="right")
    d.text(M + CW, PH - 69, "ABUJA · NIGERIA", "AR", 7, MUTE2, track=1.4, align="right")

    d.line(M, PH - 104, M + CW, PH - 104, "#333333", 1)

    size = d.fit("SUPPORTING", "AB", 62, CW)
    d.text(M, PH - 190, "SUPPORTING", "AB", size, BONE)
    d.text(M, PH - 190 - size * 1.02, "EVIDENCE", "AB", size, BLUE)

    d.text(M, PH - 396,
           "TECHNICAL DESIGN · THE WORKING PRODUCT · FIELD WORK",
           "AR", 8, MUTE2, track=2.0)

    y = PH - 430
    y = block(d, M, y, CW * 0.80,
              "Unmute is two-way sign-language communication for healthcare, built "
              "to run at the bedside on the phone a nurse already carries. This "
              "document collects what has been designed, what has been built, and "
              "where the work has been taken in person.",
              10.4, 15, "#C9C6BE")

    cats = [
        ("01", "The working product", "Three screens, captured on a live device"),
        ("02", "The public face", "The site, the navigation, the Letter of Intent"),
        ("03", "The build", "Architecture, repository, automated checks"),
        ("04", "The field", "A special school in Enugu, and the work in transit"),
        ("05", "Pitching", "Hackaholics 7.0, Wema Bank / ALAT"),
    ]
    y = 244
    for num, title, note in cats:
        d.line(M, y + 12, M + CW, y + 12, "#2A2A2A", 0.8)
        d.text(M, y, num, "AR", 7.4, BLUE, track=1.2)
        d.text(M + 30, y, title.upper(), "AR", 7.4, BONE, track=1.2)
        d.text(M + CW, y, note, "SG", 7.8, MUTE2, align="right")
        y -= 20

    d.text(M, 74, "PRINCE NZUBUCHUKWU MICHAEL  ·  FOUNDER", "AR", 7, MUTE2, track=1.4)
    d.text(M, 60, "contact@liveunmute.com  ·  +234 904 282 0707", "SG", 7.6, MUTE2)

    # ── 2 contents ──────────────────────────────────────────────────────
    d.c.showPage()
    page_head(d, "Supporting evidence", "Contents")

    d.text(M, PH - 116, "WHAT THIS", "AB", 30, INK)
    d.text(M, PH - 148, "DOCUMENT IS.", "AB", 30, BLUE)

    y = block(d, M, PH - 198, CW * 0.92,
              "An application asked for technical designs, mockups, screenshots or "
              "other evidence of the solution's development, combined into one "
              "document. This is that document, in five parts, so a reviewer can "
              "start with the thing itself and finish with the rooms it was pitched in.",
              9.4, 13.6, INK)

    entries = [
        ("01", "The working product", "3 screens", "p. 3\u20134",
         "The patient signs into the camera and the clinician speaks back, on a phone, "
         "on the live site. Includes what is real and what is scripted."),
        ("02", "The public face", "3 screens", "p. 5",
         "The site a hospital or partner lands on, and the non-binding Letter of "
         "Intent a willing institution signs."),
        ("03", "The build", "architecture + repo", "p. 6",
         "The pipeline the demo runs on, and the automated checks that run on every "
         "change to it."),
        ("04", "The field", "2 photographs", "p. 7",
         "A school for Deaf pupils in Enugu, and the laptop that travels between "
         "site visits."),
        ("05", "Pitching", "1 photograph", "p. 8",
         "On stage at Hackaholics 7.0, Wema Bank's hackathon."),
    ]

    y -= 16
    for num, title, count, where, body in entries:
        d.line(M, y + 15, M + CW, y + 15, LINE, 0.9)
        d.text(M, y, num, "AB", 11, BLUE)
        d.text(M + 30, y, title.upper(), "AR", 8.6, INK, track=0.8)
        d.text(M + CW, y, where, "AR", 6.6, MUTE2, track=1.0, align="right")
        d.text(M + CW - 62, y, count.upper(), "AR", 6.6, MUTE2, track=1.0, align="right")
        y -= 13.5
        y = block(d, M + 30, y, CW - 30, body, 8.2, 10.9, "#3A3A36")
        y -= 30

    # the honest note, anchored above the footer
    box_y, box_h = 168, 104
    d.rect(M, box_y, CW, box_h, BONE)
    d.rect(M, box_y, 3, box_h, BLUE)
    d.text(M + 14, box_y + box_h - 16, "WHAT THIS EVIDENCE DOES AND DOES NOT SHOW",
           "AR", 6.6, BLUE, track=1.4)
    block(d, M + 14, box_y + box_h - 32, CW - 32,
          "It shows a working interface, a working camera path, a working site and a "
          "working repository. It does not show a trained recognition model. The "
          "classifier behind the demo is a geometric prototype — 21 hand landmarks "
          "matched against hand-authored templates — with no training data, no accuracy "
          "figure and no signer-independent evaluation. That is why the product puts the "
          "patient's confirmation between the model and the record.",
          7.8, 10.8)

    page_foot(d, 2)

    # ── 3 product, part one ─────────────────────────────────────────────
    d.c.showPage()
    page_head(d, "01 · The working product", "Captured on a phone")
    y = section(d, "01", "The working product",
                "Two directions, one screen. The patient signs into the camera and is "
                "read; the clinician speaks and the reply is rendered as sign. Both "
                "captures are from app.liveunmute.com on an Android phone.")

    w = (CW - 24) / 2
    card(d, SRC / "01-sign-screen.jpg", M, y, w, "The patient signs",
         "The camera is live and the face is tracked. The app proposes a transcript — "
         "\u201cMy chest hurts.\u201d — at 98% confidence. It is not spoken until the "
         "patient confirms it.", "01")
    card(d, SRC / "02-clinician-speaks.jpg", M + w + 24, y, w, "The clinician replies",
         "The other direction. The clinician speaks and the reply is shown as sign, "
         "with a repeat control so the patient can ask for it again without saying so.",
         "02")

    page_foot(d, 3)

    # ── 4 product, part two ─────────────────────────────────────────────
    d.c.showPage()
    page_head(d, "01 · The working product", "What is real and what is scripted")
    y = TOP

    card(d, SRC / "03-home.jpg", M, y, 236, "Ward home",
         "The screen a clinician opens between patients: the record, one primary "
         "action, and the last exchange \u2014 \u201cChest pain, two days, signed "
         "reply, 2 min ago.\u201d", "03")

    x = M + 236 + 32
    w = CW - 236 - 32

    yy = y - 6
    d.text(x, yy, "A NOTE ON HONESTY", "AR", 7, BLUE, track=1.6)
    yy = block(d, x, yy - 20, w,
               "Every screenshot in this pack carries a DEMO chip when the transcript "
               "is scripted. That chip is not modesty; it is the design. A clinician who "
               "cannot tell what the machine actually understood will not trust it with "
               "a patient, and should not.", 8.6, 12.0, INK)

    yy -= 16
    d.text(x, yy, "REAL", "AR", 6.8, BLUE, track=1.6)
    yy = block(d, x, yy - 13, w,
               "The camera, the consent gate, the recording, the clip itself, the "
               "microphone, and the clinician's speech where the browser supports it.",
               8.2, 11.0)
    yy -= 14
    d.text(x, yy, "SCRIPTED", "AR", 6.8, MUTE, track=1.6)
    yy = block(d, x, yy - 13, w,
               "The reading of the signs. No recognition engine is configured in this "
               "build, so the transcript comes from a fixed script.", 8.2, 11.0)

    # the flow, in five steps
    yy -= 24
    d.line(x, yy + 10, x + w, yy + 10, LINE, 0.9)
    d.text(x, yy - 2, "THE FLOW, IN FIVE STEPS", "AR", 6.8, INK, track=1.4)
    yy -= 22
    steps = [
        ("Consent", "The camera does not open until the patient agrees. Declining "
                    "leaves the session working in speech alone."),
        ("Capture", "Hand landmarks are read in the browser tab. No frame is uploaded."),
        ("Propose", "The classifier offers a reading rather than asserting one."),
        ("Confirm", "The patient accepts, corrects, or rejects it before it is spoken."),
        ("Record", "Only confirmed lines enter the timeline, each stamped with time."),
    ]
    for i, (label, body) in enumerate(steps, 1):
        d.text(x, yy, str(i), "AR", 6.4, BLUE, track=1.0)
        d.text(x + 12, yy, label.upper(), "AR", 6.8, INK, track=1.0)
        yy = block(d, x, yy - 11, w - 12, body, 7.8, 10.2) - 7

    page_foot(d, 4)

    # ── 5 public face ───────────────────────────────────────────────────
    d.c.showPage()
    page_head(d, "02 · The public face", "liveunmute.com")
    y = section(d, "02", "The public face",
                "What a hospital, a partner, or a journalist finds when they look the "
                "company up. Three screens from the live site, including the "
                "non-binding Letter of Intent.")

    w3 = (CW - 2 * 16) / 3
    card(d, SRC / "04-landing.jpg", M, y, w3, "The site",
         "One claim, one line, one action.", "01")
    card(d, SRC / "05-nav.jpg", M + w3 + 16, y, w3, "The navigation",
         "Four sections, and two ways in: the waitlist and the Letter of Intent.", "02")
    card(d, SRC / "06-loi.jpg", M + 2 * (w3 + 16), y, w3, "Letter of Intent",
         "A non-binding form an institution can finish in minutes. It is the paper "
         "that turns interest into a pilot conversation.", "03")

    # band across the foot of the page
    by = 132
    d.line(M, by + 86, M + CW, by + 86, LINE, 0.9)
    cols = [
        ("What it commits to", "No interpreter on the ward. A clinician speaks, the "
                               "patient signs, both are understood."),
        ("What it asks for", "A waitlist address; from institutions, a signature "
                             "from someone authorised to give one."),
        ("What it gives back", "A Letter of Intent that costs nothing and commits "
                               "nobody to a purchase."),
    ]
    cw = (CW - 32) / 3
    for i, (head, body) in enumerate(cols):
        cx = M + i * (cw + 16)
        d.text(cx, by + 66, head.upper(), "AR", 6.6, BLUE, track=1.3)
        block(d, cx, by + 52, cw, body, 8.0, 10.8)

    page_foot(d, 5)

    # ── 6 the build ─────────────────────────────────────────────────────
    d.c.showPage()
    page_head(d, "03 · The build", "github.com/LiveUnmute/unmute-sign")
    y = section(d, "03", "The build",
                "The repository that produces the demo, public and readable. This is "
                "the pipeline a recognition model would eventually plug into; nothing "
                "else in the product has to change when it does.")

    # the pipeline, drawn
    stages = [
        ("01", "Camera", "browser MediaStream"),
        ("02", "Landmarks", "MediaPipe, 21 points"),
        ("03", "Classifier", "template match"),
        ("04", "Context filter", "ward vocabulary"),
        ("05", "Confirmation", "patient decides"),
        ("06", "Record", "timeline, on device"),
    ]
    bw = (CW - 5 * 9) / 6
    bh = 58
    for i, (num, name, note) in enumerate(stages):
        bx = M + i * (bw + 9)
        fill = INK if i == 2 else None
        d.rect(bx, y - bh, bw, bh, fill, INK if fill else LINE, 0.8)
        d.text(bx + 7, y - 14, num, "AR", 6.2, BLUE if not fill else BLUE, track=1.0)
        col = BONE if fill else INK
        d.text(bx + 7, y - 28, name.upper(), "AR", 7.2, col, track=0.6)
        d.text(bx + 7, y - 44, note, "SG", 6.2, MUTE2 if fill else MUTE)
        if i < 5:
            ax = bx + bw + 2
            d.line(ax, y - bh / 2, ax + 5, y - bh / 2, MUTE2, 1)

    y -= bh + 20
    d.text(M, y, "THE CLASSIFIER IS ONE FUNCTION. REPLACING IT DOES NOT TOUCH THE REST.",
           "AR", 6.4, MUTE2, track=1.0)
    y -= 18

    # repo column
    rx = M + 150 + 26
    rw = CW - 150 - 26
    yy = y
    for label, body in [
        ("Automated checks",
         "29 checks across three files, run on every change: classifier behaviour, a "
         "full walkthrough in a real DOM, and the permission path that stops a camera "
         "opening inside a preview frame."),
        ("No backend",
         "No video, image or landmark data leaves the browser tab. There is no server "
         "to breach and no retention policy to write, which is a stronger answer in a "
         "procurement conversation than most certifications."),
        ("Written for a sceptic",
         "The README says plainly what the demo is and is not, including that there is "
         "no trained model. A reviewer who checks will find the same claim there."),
    ]:
        d.text(rx, yy, label.upper(), "AR", 6.6, BLUE, track=1.3)
        yy = block(d, rx, yy - 12, rw, body, 8.2, 11.2)
        yy -= 13

    # run it yourself
    yy -= 2
    d.text(rx, yy, "RUN IT YOURSELF", "AR", 6.6, BLUE, track=1.3)
    yy -= 14
    d.rect(rx, yy - 46, rw, 46, INK)
    d.text(rx + 10, yy - 16, "$ npm test", "SG", 8.2, BONE)
    d.text(rx + 10, yy - 32, "classifier · walkthrough · permissions", "SG", 7.2, MUTE2)

    yy -= 60
    d.text(rx, yy, "WHY CONFIRMATION, NOT ACCURACY", "AR", 6.6, BLUE, track=1.3)
    block(d, rx, yy - 13, rw,
          "Published isolated ASL recognition on WLASL-100 reaches roughly 63% top-1 "
          "with pose-only methods and 78–81% with heavy multi-modal fusion, on unseen "
          "signers. A ward cannot carry a one-in-five error silently, so the product asks "
          "the patient instead of guessing at them. That is a design decision, and it is "
          "the one thing a better model will not change.", 8.0, 10.8)

    card(d, SRC / "07-github.jpg", M, y, 150, "The repository",
         "Public, and documented as it stands.", "01")

    page_foot(d, 6)

    # ── 7 the field ─────────────────────────────────────────────────────
    d.c.showPage()
    page_head(d, "04 · The field", "Enugu and between")
    y = section(d, "04", "The field",
                "The product was built from conversations in rooms the founder had to "
                "travel to. This is the part a repository cannot show, and the reason "
                "the interface is shaped the way it is.")

    w2 = (CW - 26) / 2
    card(d, crop_copy(SRC / "08-school.jpg", 200, 210), M, y, w2,
         "Evami Special School, Enugu",
         "A school for Deaf and special-needs pupils, visited in 2026. The "
         "people this is for are not an abstraction in a market report.", "01")
    card(d, crop_copy(SRC / "09-travel.jpg", 200, 210), M + w2 + 26, y, w2,
         "Building between visits",
         "The laptop that goes to the school, the hospital and the pitch, and the "
         "hours in between spent on the build.", "02")

    by = 96
    d.line(M, by + 74, M + CW, by + 74, LINE, 0.9)
    d.text(M, by + 54, "WHY THIS BELONGS IN A TECHNICAL DOCUMENT", "AR", 6.6, BLUE,
           track=1.3)
    block(d, M, by + 40, CW * 0.72,
          "Because the interface is a response to what was seen. A clinician with both "
          "hands occupied cannot also hold a tablet, and a patient in pain will not spell "
          "a sentence out letter by letter. Those two constraints shaped the capture flow "
          "before any requirement was written down.", 8.4, 11.6)

    page_foot(d, 7)

    # ── 8 pitching ──────────────────────────────────────────────────────
    d.c.showPage()
    page_head(d, "05 · Pitching", "Hackaholics 7.0")
    y = section(d, "05", "Pitching",
                "Where the company has been asked to explain itself in public, and to "
                "whom. The pitch is the same argument as this document.")

    im = Image.open(SRC / "10-stage.jpg")
    iw, ih = im.size
    w = CW
    h = w * ih / iw
    d.rect(M - 3, y - h - 3, w + 6, h + 6, None, LINE, 0.7)
    d.c.drawImage(str(SRC / "10-stage.jpg"), M, y - h, w, h)

    ty = y - h - 18
    d.text(M, ty, "01", "AR", 6.4, BLUE, track=1.2)
    d.text(M + 16, ty, "HACKAHOLICS 7.0 · WEMA BANK / ALAT",
           "AR", 6.4, INK, track=1.2)
    ty = block(d, M, ty - 11, CW,
               "Presenting Unmute to a room of builders, bankers and operators at "
               "Hackaholics, Wema Bank's hackathon.", 7.6, 9.8, "#4A4A45")

    ty = 196
    cw3 = (CW - 32) / 3
    for i, (head, body) in enumerate([
        ("The room", "Engineers, bank product teams and investors — a room that asks "
                     "how it works before it asks how it feels."),
        ("What was shown", "The same two directions as section 01, on a phone, held up "
                           "so the room could see the screen fill."),
        ("Why that room", "Bank product teams decide whether a ward pilot gets "
                           "budget. A pitch there is procurement, not publicity."),
    ]):
        cx = M + i * (cw3 + 16)
        d.text(cx, ty, head.upper(), "AR", 6.6, BLUE, track=1.3)
        block(d, cx, ty - 14, cw3, body, 8.0, 10.8)

    page_foot(d, 8)

    # ── 9 close ─────────────────────────────────────────────────────────
    d.c.showPage()
    page_head(d, "Supporting evidence", "2026")

    d.text(M, PH - 124, "WHAT ALL OF THIS", "AB", 26, INK)
    d.text(M, PH - 154, "ADDS UP TO.", "AB", 26, BLUE)

    y = block(d, M, PH - 200, CW * 0.92,
              "A working interface a clinician can use without training, a camera that "
              "asks for consent before it opens, a site a partner can act on, and a "
              "founder who has been to the school, the wards and the stage himself.",
              10.4, 15, INK)

    y -= 22
    d.line(M, y, M + CW, y, LINE, 0.9)
    y -= 22

    for title, body in [
        ("Built, not mocked",
         "Every screen in section 01 is running code, not a design file."),
        ("Honest about the model",
         "The classifier is a prototype and the product is designed around that, not "
         "in spite of it."),
        ("Met in person",
         "Schools, hospitals and stages. The problem was not researched from a desk."),
    ]:
        d.text(M, y, title.upper(), "AR", 8, INK, track=1.0)
        y -= 12
        y = block(d, M, y, CW * 0.86, body, 8.6, 11.4)
        y -= 15

    # where to check it
    y -= 6
    d.rect(M, y - 92, CW, 92, BONE)
    d.text(M + 14, y - 18, "WHERE TO CHECK ANY OF THIS", "AR", 6.6, BLUE, track=1.4)
    checks = [
        ("The product", "app.liveunmute.com"),
        ("The site", "liveunmute.com"),
        ("The code", "github.com/LiveUnmute/unmute-sign"),
    ]
    cy = y - 36
    for label, url in checks:
        d.text(M + 14, cy, label.upper(), "AR", 6.8, MUTE, track=1.0)
        d.text(M + 120, cy, url, "SGB", 8.4, INK)
        cy -= 16

    d.rect(M, 150, CW, 84, INK)
    d.image(LOGO_W, M + 18, 150 + 50, 14)
    d.text(M + 18, 150 + 34, "TWO-WAY SIGN LANGUAGE FOR HEALTHCARE", "AR", 6.2,
           MUTE2, track=1.4)
    d.text(M + CW - 18, 150 + 58, "contact@liveunmute.com", "SGB", 9, BONE,
           align="right")
    d.text(M + CW - 18, 150 + 44, "+234 904 282 0707", "SGB", 9, BONE, align="right")
    d.text(M + CW - 18, 150 + 30, "liveunmute.com  ·  app.liveunmute.com",
           "SG", 6.8, MUTE2, align="right")

    page_foot(d, 9)

    d.save(end_page=False)

    import pymupdf
    pages = pymupdf.open(OUT).page_count
    print(f"{OUT.name}: {pages} pages, {OUT.stat().st_size:,} bytes")
    if pages != TOTAL:
        raise SystemExit(f"expected {TOTAL} pages, got {pages}")


if __name__ == "__main__":
    build()
