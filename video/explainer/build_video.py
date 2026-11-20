#!/usr/bin/env python3
"""
Unmute — motion-graphics explainer.

Renders 1080x1920 at 30 fps, silent. Every word that matters is on screen, so
the piece works with the sound off, in a waiting room, or for a Deaf viewer.
That is not a compromise — for this subject it is the correct default.

    /home/user/.venv_video/bin/python build_video.py

Output: Unmute-Explainer.mp4
"""

import math
import os
import subprocess
from pathlib import Path

import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).parent
FONTS = HERE.parent.parent / "pitch-deck" / "fonts"

W, H = 1080, 1920
FPS = 30
M = 96                      # side margin

INK = (13, 13, 13)
INK2 = (28, 28, 28)
BONE = (237, 235, 230)
BLUE = (0, 106, 254)
MUTE = (154, 152, 145)
DIM = (110, 108, 102)
LINE = (42, 42, 42)

AB = str(FONTS / "ArchivoBlack-Regular.ttf")
AX = str(FONTS / "Archivo-ExtraBold.ttf")
AR = str(FONTS / "Archivo-Bold.ttf")
SG = str(FONTS / "SpaceGrotesk-Medium.ttf")
SGB = str(FONTS / "SpaceGrotesk-Bold.ttf")

_cache = {}


def font(path, size):
    key = (path, size)
    if key not in _cache:
        _cache[key] = ImageFont.truetype(path, size)
    return _cache[key]


# ── easing ───────────────────────────────────────────────────────────────

def clamp(v, lo=0.0, hi=1.0):
    return max(lo, min(hi, v))


def ease_out(t, power=3):
    return 1 - (1 - clamp(t)) ** power


def ease_in_out(t):
    t = clamp(t)
    return 4 * t ** 3 if t < 0.5 else 1 - (-2 * t + 2) ** 3 / 2


def seg(t, start, dur):
    """Progress of a sub-animation that begins at `start` and runs for `dur`."""
    if dur <= 0:
        return 1.0 if t >= start else 0.0
    return clamp((t - start) / dur)


# ── drawing helpers ──────────────────────────────────────────────────────

def tracked_width(draw, text, fnt, tracking):
    if not text:
        return 0
    return draw.textlength(text, font=fnt) + tracking * (len(text) - 1)


def text_tracked(draw, xy, text, fnt, fill, tracking=0.0, anchor="la"):
    """PIL has no letter-spacing, so draw glyph by glyph."""
    if not tracking:
        draw.text(xy, text, font=fnt, fill=fill, anchor=anchor)
        return draw.textlength(text, font=fnt)
    x, y = xy
    if anchor[0] == "r":
        x -= tracked_width(draw, text, fnt, tracking)
    elif anchor[0] == "m":
        x -= tracked_width(draw, text, fnt, tracking) / 2
    for ch in text:
        draw.text((x, y), ch, font=fnt, fill=fill, anchor="l" + anchor[1])
        x += draw.textlength(ch, font=fnt) + tracking
    return x - tracking if text else 0


def fit_line(draw, text, path, size, maxw, floor=30, tracking=0.0):
    """Largest size at which THIS LINE fits the measure.

    The earlier version measured single words, which is why "HAS TO BE
    BOOKED." ran off the right edge: no individual word was too wide, the
    sentence was. Fit the line, not the words.
    """
    while size > floor:
        fnt = font(path, size)
        w = draw.textlength(text, font=fnt)
        if tracking:
            w += tracking * max(0, len(text) - 1)
        if w <= maxw:
            return fnt
        size -= 2
    return font(path, size)


def fit_font(draw, text, path, size, maxw, floor=40):
    """Kept for multi-line blocks: fit the longest of the lines given."""
    lines = [ln for ln in text.split("\n") if ln.strip()] or [text]
    return fit_line(draw, max(lines, key=len), path, size, maxw, floor)


def wrap(draw, text, fnt, maxw):
    words, lines, cur = text.split(), [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=fnt) <= maxw or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def para(draw, xy, text, fnt, fill, maxw, leading, tracking=0.0):
    x, y = xy
    for ln in wrap(draw, text, fnt, maxw):
        text_tracked(draw, (x, y), ln, fnt, fill, tracking)
        y += leading
    return y


def reveal(img, draw_fn, top, bottom, progress, bg=INK):
    """Draw onto a layer and reveal it downward from `top` to `bottom`.

    The layer is filled with the scene's own background: leaving it black
    punches a dark band through a light slide.
    """
    if progress <= 0:
        return
    layer = Image.new("RGB", img.size, bg)
    d = ImageDraw.Draw(layer)
    draw_fn(d)
    edge = top + (bottom - top) * ease_out(progress, 4)
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).rectangle([0, top - 40, W, edge], fill=255)
    img.paste(layer, (0, 0), mask)


def bg(img, colour):
    ImageDraw.Draw(img).rectangle([0, 0, W, H], fill=colour)


def rule(d, y, colour=LINE, thickness=2, x0=M, x1=W - M, alpha=1.0):
    if alpha <= 0:
        return
    col = tuple(int(c * alpha + b * (1 - alpha)) for c, b in zip(colour, INK))
    d.rectangle([x0, y, x1, y + thickness - 1], fill=col)


# ── scenes ───────────────────────────────────────────────────────────────
# Each scene draws one frame at local time `t` (seconds).

def scene_title(t):
    img = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(img)

    # accent rule grows across the top
    w = (W - 2 * M) * ease_out(seg(t, 0, 0.7))
    d.rectangle([M, 120, M + w, 128], fill=BLUE)

    text_tracked(d, (M, 152), "UNMUTE", font(AB, 26), BONE, tracking=7)

    lines = ["EVERY VOICE", "DESERVES", "TO BE HEARD."]
    fnt = font(AB, 118)
    y = 560
    for i, ln in enumerate(lines):
        p = seg(t, 0.45 + i * 0.42, 0.55)
        if p <= 0:
            continue
        colour = BLUE if i == 2 else BONE
        reveal(img, lambda dd, ln=ln, y=y, colour=colour: text_tracked(
            dd, (M, y), ln, fnt, colour), y, y + 128, p, bg=INK)
        y += 138

    # subtitle rises last
    p = ease_out(seg(t, 2.1, 0.6))
    if p > 0:
        yy = 1180 + (1 - p) * 26
        d2 = ImageDraw.Draw(img)
        text_tracked(d2, (M, yy), "TWO-WAY SIGN LANGUAGE FOR HEALTHCARE",
                     font(AR, 27), MUTE, tracking=4)

    p = ease_out(seg(t, 2.6, 0.5))
    if p > 0:
        d.rectangle([M, 1300, M + 120 * p, 1304], fill=MUTE)
    return img


def scene_problem(t):
    """Three statements, full screen, one at a time. Each takes the whole
    frame so nothing from the previous line is left behind it."""
    beats = [
        (0.0, 2.0, "AN INTERPRETER", "HAS TO BE BOOKED.", BONE, INK),
        (2.0, 4.0, "IN PRACTICE,", "THAT MEANS DAYS.", BONE, INK),
        (4.0, 6.2, "SO THE ENCOUNTER", "IS CARRIED BY OTHERS.", INK, BONE),
    ]
    img = Image.new("RGB", (W, H), BONE)
    d = ImageDraw.Draw(img)

    for i, (t0, t1, l1, l2, box, fg) in enumerate(beats):
        if not (t0 <= t < t1):
            continue
        local = t - t0
        bg(img, box)
        d = ImageDraw.Draw(img)

        # full-bleed band behind the type, sized to the type
        f1 = fit_line(d, l1, AB, 96, W - 2 * M)
        f2 = fit_line(d, l2, AB, 96, W - 2 * M)
        fnt = min(f1, f2, key=lambda f: f.size)
        step = int(fnt.size * 1.16)
        band_top = 640
        band_h = step * 2 + 120
        d.rectangle([0, band_top - 70, W, band_top + band_h - 70],
                    fill=(INK if box == BONE else BONE))

        rise1 = ease_out(seg(local, 0.05, 0.5))
        rise2 = ease_out(seg(local, 0.30, 0.5))
        if rise1 > 0:
            text_tracked(d, (M, band_top + (1 - rise1) * 26), l1, fnt,
                         (BONE if box == BONE else INK))
        if rise2 > 0:
            text_tracked(d, (M, band_top + step + (1 - rise2) * 26), l2, fnt,
                         (BONE if box == BONE else INK))

        # chapter mark, always in the margin
        text_tracked(d, (M, 128), "01", font(AB, 24), BLUE, tracking=2)
        text_tracked(d, (M + 56, 132), "THE WARD, TODAY", font(AR, 21), BLUE, tracking=4)

        text_tracked(d, (M, H - 130), "UNMUTE", font(AR, 20),
                     (150, 148, 140) if box == BONE else (70, 68, 64), tracking=5)
        return img

    return img


def scene_stats(t):
    img = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(img)

    text_tracked(d, (M, 128), "02", font(AB, 24), BLUE, tracking=2)
    text_tracked(d, (M + 56, 132), "THE EVIDENCE", font(AR, 21), BLUE, tracking=4)

    fnt_h = fit_font(d, "FEW DEAF PATIENTS CAN TALK TO THEIR DOCTOR.", AB, 84, W - 2 * M)
    step = int(fnt_h.size * 1.14)
    y = 300
    text_tracked(d, (M, y), "FEW DEAF PATIENTS", fnt_h, BONE)
    text_tracked(d, (M, y + step), "CAN TALK TO", fnt_h, BONE)
    text_tracked(d, (M, y + step * 2), "THEIR DOCTOR.", fnt_h, BLUE)

    stats = [
        ("COULD COMMUNICATE WITH THEIR DOCTORS", 7, BONE),
        ("REPORTED FULL COMMUNICATION IN CARE", 8, BONE),
        ("NO PUBLIC-HEALTH INFO IN SIGN LANGUAGE", 76, BLUE),
    ]
    barw = W - 2 * M - 210
    y = 830
    for i, (label, val, colour) in enumerate(stats):
        p = seg(t, 1.5 + i * 0.9, 1.1)
        if p <= 0:
            continue
        d2 = ImageDraw.Draw(img)
        text_tracked(d2, (M, y), label, font(AR, 19), DIM, tracking=2.5)
        d2.rectangle([M, y + 44, M + barw, y + 82], fill=(32, 32, 32))
        grow = barw * (val / 100.0) * ease_out(p, 4)
        d2.rectangle([M, y + 44, M + max(4, grow), y + 82], fill=colour)
        num = int(round(val * ease_out(p, 3)))
        text_tracked(d2, (W - M, y + 20), f"{num}%", font(AB, 62), colour, anchor="ra")
        y += 176

    p = ease_out(seg(t, 4.6, 0.6))
    if p > 0:
        d2 = ImageDraw.Draw(img)
        rule(d2, 1420, LINE, 2)
        text_tracked(d2, (M, 1452), "2024 DEAF NIGERIA PILOT",
                     font(AR, 21), MUTE, tracking=3.5)
    return img


def scene_hospitals(t):
    img = Image.new("RGB", (W, H), BONE)
    d = ImageDraw.Draw(img)

    text_tracked(d, (M, 128), "03", font(AB, 24), BLUE, tracking=2)
    text_tracked(d, (M + 56, 132), "WE WENT AND ASKED", font(AR, 21), BLUE, tracking=4)

    fnt_h = fit_font(d, "TWENTY-ONE HOSPITALS.", AB, 84, W - 2 * M)
    step = int(fnt_h.size * 1.14)
    text_tracked(d, (M, 250), "TWENTY-ONE", fnt_h, INK)
    text_tracked(d, (M, 250 + step), "HOSPITALS.", fnt_h, INK)

    # 21 squares, appearing in sequence
    cols, per = 7, 7
    sq, gap = 104, 20
    ox, oy = M, 500
    appeared = 0
    for i in range(21):
        p = seg(t, 1.1 + i * 0.075, 0.35)
        if p <= 0:
            continue
        appeared += 1
        r, c = divmod(i, per)
        x = ox + c * (sq + gap)
        y = oy + r * (sq + gap)
        s = sq * (0.6 + 0.4 * ease_out(p, 4))
        off = (sq - s) / 2
        d.rectangle([x + off, y + off, x + off + s, y + off + s], fill=INK)

    # then they empty out
    empty = ease_out(seg(t, 2.9, 1.0))
    if empty > 0:
        for i in range(appeared):
            r, c = divmod(i, per)
            x = ox + c * (sq + gap)
            y = oy + r * (sq + gap)
            d.rectangle([x, y, x + sq, y + sq], fill=BONE, outline=INK, width=4)

    # the zero
    p = seg(t, 3.5, 0.8)
    if p > 0:
        d2 = ImageDraw.Draw(img)
        d2.rectangle([M, 1100, M + 900 * ease_out(p, 4), 1106], fill=INK, width=0)
        text_tracked(d2, (M, 1140), "HAD AN INTERPRETER", font(AR, 22), (90, 88, 82), tracking=4)
        zero = int(round(21 * (1 - ease_out(seg(t, 3.6, 0.9), 3))))
        text_tracked(d2, (M, 1190), str(zero), font(AB, 200), BLUE)

    p = ease_out(seg(t, 4.8, 0.6))
    if p > 0:
        d2 = ImageDraw.Draw(img)
        text_tracked(d2, (M, 1470), "NOT ONE INTERPRETER, IN ANY OF THEM.",
                     font(AR, 28), (60, 58, 54), tracking=1)
    return img


def scene_product(t):
    img = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(img)

    text_tracked(d, (M, 128), "04", font(AB, 24), BLUE, tracking=2)
    text_tracked(d, (M + 56, 132), "WHAT UNMUTE DOES", font(AR, 21), BLUE, tracking=4)

    fnt_h = fit_font(d, "TWO DIRECTIONS. ONE SCREEN.", AB, 86, W - 2 * M)
    step = int(fnt_h.size * 1.16)
    p = seg(t, 0.2, 0.7)
    if p > 0:
        reveal(img, lambda dd: text_tracked(dd, (M, 260), "TWO DIRECTIONS.", fnt_h, BONE),
               258, 260 + step, p, bg=INK)
    if t > 1.0:
        d2 = ImageDraw.Draw(img)
        text_tracked(d2, (M, 262 + step), "ONE SCREEN.", fnt_h, BLUE)

    # two panels
    ph = seg(t, 1.6, 0.5)
    if ph > 0:
        d2 = ImageDraw.Draw(img)
        h = 300 * ease_out(ph, 3)
        d2.rectangle([M, 560, W - M, 560 + h], fill=INK2)
        if ph > 0.6:
            text_tracked(d2, (M + 44, 596), "CLINICIAN TO PATIENT", font(AR, 22), BLUE, tracking=3)
            for i, line in enumerate(["Speaks a supported phrase",
                                      "The reply is signed back"]):
                text_tracked(d2, (M + 44, 660 + i * 68), line, font(SG, 34), (214, 211, 203))

    ph2 = seg(t, 2.4, 0.5)
    if ph2 > 0:
        d2 = ImageDraw.Draw(img)
        y0 = 1180
        h = 300 * ease_out(ph2, 3)
        d2.rectangle([M, y0, W - M, y0 + h], fill=BONE)
        if ph2 > 0.6:
            text_tracked(d2, (M + 44, y0 + 36), "PATIENT TO CLINICIAN", font(AR, 22), BLUE, tracking=3)
            for i, line in enumerate(["Signs into the camera",
                                      "Read as text, spoken aloud"]):
                text_tracked(d2, (M + 44, y0 + 100 + i * 68), line, font(SG, 34), (42, 42, 38))

    # the arrow between
    p = seg(t, 2.15, 0.45)
    if p > 0:
        d2 = ImageDraw.Draw(img)
        cy = 900
        half = 300 * ease_out(p, 3)
        d2.rectangle([W // 2 - half, cy - 5, W // 2 + half, cy + 5], fill=BLUE)
        for sx in (-1, 1):
            if half > 260:
                tip = W // 2 + sx * half
                d2.polygon([(tip, cy), (tip - sx * 34, cy - 24), (tip - sx * 34, cy + 24)], fill=BLUE)
    return img


def scene_scope(t):
    img = Image.new("RGB", (W, H), BONE)
    d = ImageDraw.Draw(img)

    text_tracked(d, (M, 128), "05", font(AB, 24), BLUE, tracking=2)
    text_tracked(d, (M + 56, 132), "THE HONEST LIMIT", font(AR, 21), BLUE, tracking=4)

    fnt_h = fit_font(d, "ABOUT TWENTY EXPRESSIONS.", AB, 86, W - 2 * M)
    step = int(fnt_h.size * 1.16)
    p = seg(t, 0.2, 0.7)
    if p > 0:
        reveal(img, lambda dd: text_tracked(dd, (M, 250), "ABOUT TWENTY", fnt_h, INK),
               248, 250 + step, p, bg=BONE)
    if t > 1.0:
        d2 = ImageDraw.Draw(img)
        text_tracked(d2, (M, 252 + step), "EXPRESSIONS.", fnt_h, INK)

    beats = [
        (1.7, "ROUTINE INTERACTIONS ONLY."),
        (2.8, "NOT UNRESTRICTED TRANSLATION."),
        (3.9, "OUTSIDE THAT SET,"),
        (5.0, "IT SAYS SO."),
    ]
    y = 700
    for start, txt in beats:
        p = seg(t, start, 0.55)
        if p <= 0:
            continue
        d2 = ImageDraw.Draw(img)
        yy = y + (1 - ease_out(p)) * 24
        colour = BLUE if txt == "IT SAYS SO." else (50, 48, 44)
        text_tracked(d2, (M, yy), txt, font(AR, 40), colour, tracking=1)
        y += 96

    p = ease_out(seg(t, 5.9, 0.6))
    if p > 0:
        d2 = ImageDraw.Draw(img)
        rule(d2, 1360, (198, 195, 186), 3)
        para(d2, (M, 1392),
             "A tool that invents a dosage is worse than one that admits it did not understand.",
             font(SG, 34), (60, 58, 54), W - 2 * M, 46)
    return img


def scene_end(t):
    img = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(img)

    w = (W - 2 * M) * ease_out(seg(t, 0, 0.6))
    d.rectangle([M, 120, M + w, 128], fill=BLUE)

    # the mark: five bars, drawn in sequence
    bars = [(0, 34), (1, 74), (2, 118), (3, 74), (4, 34)]
    cx, cy = W // 2, 640
    total = 5 * 44
    x0 = cx - total // 2
    for i, (idx, hgt) in enumerate(bars):
        p = seg(t, 0.3 + i * 0.09, 0.35)
        if p <= 0:
            continue
        hh = hgt * ease_out(p, 4)
        x = x0 + i * 44
        d.rectangle([x + 8, cy - hh / 2, x + 30, cy + hh / 2], fill=BLUE)

    p = seg(t, 1.0, 0.6)
    if p > 0:
        d2 = ImageDraw.Draw(img)
        reveal(img, lambda dd: text_tracked(dd, (cx, 820), "UNMUTE", font(AB, 96), BONE,
                                            tracking=16, anchor="ma"), 818, 930, p, bg=INK)

    p = seg(t, 1.5, 0.6)
    if p > 0:
        d2 = ImageDraw.Draw(img)
        text_tracked(d2, (cx, 980), "EVERY VOICE DESERVES TO BE HEARD.",
                     font(AR, 30), MUTE, tracking=3, anchor="ma")

    p = ease_out(seg(t, 2.1, 0.6))
    if p > 0:
        d2 = ImageDraw.Draw(img)
        d2.rectangle([cx - 260, 1150, cx + 260, 1154], fill=(40, 40, 40))
        text_tracked(d2, (cx, 1192), "LIVEUNMUTE.COM", font(AR, 30), BONE,
                     tracking=5, anchor="ma")
        text_tracked(d2, (cx, 1250), "APP.LIVEUNMUTE.COM", font(AR, 22), DIM,
                     tracking=4, anchor="ma")

    # gentle fade out at the very end
    return img


# (scene function, duration in seconds)
TIMELINE = [
    (scene_title, 3.4),
    (scene_problem, 6.2),
    (scene_stats, 5.6),
    (scene_hospitals, 5.6),
    (scene_product, 4.6),
    (scene_scope, 6.4),
    (scene_end, 4.2),
]


def crossfade(a, b, amount):
    return Image.blend(a, b, amount)


def render(out_path):
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    total = sum(d for _, d in TIMELINE)
    frames = int(total * FPS)
    print(f"rendering {frames} frames ({total:.1f}s) at {W}x{H}")

    cmd = [
        ffmpeg, "-y",
        "-f", "rawvideo", "-vcodec", "rawvideo",
        "-s", f"{W}x{H}", "-pix_fmt", "rgb24",
        "-r", str(FPS), "-i", "-",
        # -an is tempting (the piece is silent) but Google Drive's player
        # refuses a file with no audio stream. Encode silence instead.
        "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
        "-shortest",
        "-c:v", "libx264", "-profile:v", "main", "-level", "4.0",
        "-preset", "medium", "-crf", "20",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart",
        "-c:a", "aac", "-b:a", "96k", "-ar", "44100",
        str(out_path),
    ]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE,
                            stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

    XF = 0.32  # crossfade, seconds
    starts, acc = [], 0.0
    for fn, dur in TIMELINE:
        starts.append(acc)
        acc += dur

    def scene_at(i, t):
        fn, dur = TIMELINE[i]
        return fn(min(t, dur))

    for f in range(frames):
        t = f / FPS
        idx = max(k for k in range(len(TIMELINE)) if starts[k] <= t)
        local = t - starts[idx]
        dur = TIMELINE[idx][1]
        frame = scene_at(idx, local)

        # crossfade into the next scene during its final XF seconds
        if idx + 1 < len(TIMELINE) and local > dur - XF:
            nxt = scene_at(idx + 1, t - starts[idx + 1])
            frame = crossfade(frame, nxt, (local - (dur - XF)) / XF)

        proc.stdin.write(frame.tobytes())
        if f % 120 == 0:
            print(f"  {f}/{frames}", flush=True)

    proc.stdin.close()
    err = proc.stderr.read().decode()[-800:]
    proc.wait()
    if proc.returncode:
        raise SystemExit(f"ffmpeg failed:\n{err}")
    print("wrote", out_path, f"{os.path.getsize(out_path)/1024/1024:.1f} MB")


if __name__ == "__main__":
    render(HERE / "Unmute-Explainer.mp4")
