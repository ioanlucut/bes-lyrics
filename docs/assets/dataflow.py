"""Render docs/assets/dataflow.gif: one song edit travelling from a text file,
through the pull-request checks, to ProPresenter and the PDF songbook.

    python3 docs/assets/dataflow.py            # needs Pillow and ffmpeg

Fonts: Fira Sans and JetBrains Mono (both OFL), looked up in the usual
macOS/Linux font folders.
"""

import math
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 660  # output size
S = 2  # supersampling factor
FPS = 15
DURATION = 12.0

OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).with_name("dataflow.gif")

# ---------------------------------------------------------------- palette
BG = (247, 245, 240)
CARD = (255, 255, 255)
BORDER = (226, 221, 210)
INK = (31, 35, 40)
MUTED = (107, 111, 118)
FAINT = (190, 186, 178)
GREEN = (26, 127, 55)
GREEN_BG = (218, 244, 225)
RED = (207, 34, 46)
RED_BG = (255, 228, 230)
BLUE = (9, 105, 218)
PURPLE = (130, 80, 223)
AMBER = (154, 103, 0)
SLIDE = (22, 24, 29)

# ---------------------------------------------------------------- fonts
FONT_DIRS = [
    Path.home() / "Library/Fonts",
    Path("/Library/Fonts"),
    Path("/usr/share/fonts"),
    Path.home() / ".local/share/fonts",
]


def find_font(name):
    for d in FONT_DIRS:
        if d.exists():
            for p in d.rglob(name):
                return str(p)
    raise SystemExit(f"Font {name} not found; install Fira Sans and JetBrains Mono.")


F_REG = find_font("FiraSans-Regular.ttf")
F_MED = find_font("FiraSans-Medium.ttf")
F_SEMI = find_font("FiraSans-SemiBold.ttf")
F_BOLD = find_font("FiraSans-Bold.ttf")
F_MONO = find_font("JetBrainsMono-Regular.ttf")
F_MONO_B = find_font("JetBrainsMono-SemiBold.ttf")

_cache = {}


def font(path, size):
    key = (path, size)
    if key not in _cache:
        _cache[key] = ImageFont.truetype(path, size * S)
    return _cache[key]


# ---------------------------------------------------------------- helpers
def ease(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


def prog(t, start, end):
    return ease((t - start) / (end - start))


def mix(c1, c2, a):
    return tuple(int(round(c1[i] + (c2[i] - c1[i]) * a)) for i in range(3))


def sc(v):
    return int(round(v * S))


def box(d, x, y, w, h, fill, outline=None, r=14, width=1):
    d.rounded_rectangle(
        [sc(x), sc(y), sc(x + w), sc(y + h)],
        radius=sc(r),
        fill=fill,
        outline=outline,
        width=sc(width) if outline else 0,
    )


def text(d, x, y, s, f, fill, anchor="la"):
    d.text((sc(x), sc(y)), s, font=f, fill=fill, anchor=anchor)


def text_w(d, s, f):
    return d.textlength(s, font=f) / S


def check_icon(d, cx, cy, state, spin=0.0):
    """state: 0 pending, 1 running, 2 passed, 3 failed."""
    r = 11
    if state == 3:
        d.ellipse([sc(cx - r), sc(cy - r), sc(cx + r), sc(cy + r)], fill=RED)
        for a, b in (((-4, -4), (4, 4)), ((-4, 4), (4, -4))):
            d.line([sc(cx + a[0]), sc(cy + a[1]), sc(cx + b[0]), sc(cy + b[1])], fill=(255, 255, 255), width=sc(2.6))
    elif state == 2:
        d.ellipse([sc(cx - r), sc(cy - r), sc(cx + r), sc(cy + r)], fill=GREEN)
        pts = [(cx - 5, cy + 0.5), (cx - 1.5, cy + 4), (cx + 5.5, cy - 4)]
        d.line([(sc(px), sc(py)) for px, py in pts], fill=(255, 255, 255), width=sc(2.6), joint="curve")
    elif state == 1:
        d.ellipse([sc(cx - r), sc(cy - r), sc(cx + r), sc(cy + r)], outline=BORDER, width=sc(2.4))
        a0 = spin * 360
        d.arc([sc(cx - r), sc(cy - r), sc(cx + r), sc(cy + r)], a0, a0 + 110, fill=AMBER, width=sc(2.4))
    else:
        d.ellipse([sc(cx - r), sc(cy - r), sc(cx + r), sc(cy + r)], outline=FAINT, width=sc(2))


def dot_on_path(d, pts, p, color, radius=6):
    if p <= 0 or p >= 1:
        return
    # cumulative length along a polyline
    segs = [math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1)]
    total = sum(segs)
    target = p * total
    for i, L in enumerate(segs):
        if target <= L:
            a = target / L
            x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * a
            y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * a
            break
        target -= L
    for k, alpha in ((2.4, 0.18), (1.6, 0.35)):
        rr = radius * k
        glow = mix(BG, color, alpha)
        d.ellipse([sc(x - rr), sc(y - rr), sc(x + rr), sc(y + rr)], fill=glow)
    d.ellipse([sc(x - radius), sc(y - radius), sc(x + radius), sc(y + radius)], fill=color)


def path_line(d, pts, color, lit=0.0):
    col = mix(BORDER, color, lit)
    d.line([(sc(x), sc(y)) for x, y in pts], fill=col, width=sc(2.2), joint="curve")


# ---------------------------------------------------------------- layout
A_X, A_Y, A_W, A_H = 36, 132, 356, 470  # song file
B_X, B_Y, B_W, B_H = 432, 132, 344, 470  # checks
C_X, C_W = 816, 348  # outputs
PP_Y, PP_H = 132, 226
PDF_Y, PDF_H = 376, 226

# The checks `npm run build:ci` runs on every pull request, then the bot job.
CHECKS = [
    ("Structure", "title, sequence, every section in order"),
    ("Characters", "only Romanian ș ț and typographic quotes"),
    ("Unique IDs", "every song keeps one stable id"),
    ("Leadsheet sync", "chord twin has the same lyrics"),
    ("Metadata bot", "adds ids, hashes, file names"),
]
RUN = 0.34  # seconds a check spins
CHECK_T0 = 2.1
FAIL_T = CHECK_T0 + 0.42 + RUN  # "Characters" fails on the cedilla
FIX_T = FAIL_T + 1.0  # the author pushes the fix
RERUN_T = FIX_T + 0.15
STARTS = [CHECK_T0, CHECK_T0 + 0.42] + [RERUN_T + RUN + 0.08 + 0.42 * k for k in range(3)]
MERGE_T = STARTS[-1] + RUN + 0.3
SHIP_T = MERGE_T + 0.6
LIT_T = SHIP_T + 1.1


def check_state(i, t):
    if i == 1:
        if t < STARTS[1]:
            return 0
        if t < FAIL_T:
            return 1
        if t < RERUN_T:
            return 3
        return 1 if t < RERUN_T + RUN else 2
    if t < STARTS[i]:
        return 0
    return 1 if t < STARTS[i] + RUN else 2

# The first two lines of the real lead sheet for this song.
LEADSHEET = [
    "A^{D}ceasta mi-e do^{Bm}rința, să ^{G}Te-o^{D}no^{A}rez,",
    "^{Bm}Cu ființa-nt^{D}reagă să Te ^{C}slă^{A}vesc.",
]


def split_chords(line):
    """'A^{D}ceasta' -> ('Aceasta', [(1, 'D')])"""
    lyric, chords, i = "", [], 0
    while i < len(line):
        if line.startswith("^{", i):
            j = line.index("}", i)
            chords.append((len(lyric), line[i + 2 : j]))
            i = j + 1
        else:
            lyric += line[i]
            i += 1
    return lyric, chords


SONG = [
    ("[title]", "marker"),
    ("Aceasta mi-e dorința, să Te-onorez", "title"),
    ("", None),
    ("[sequence]", "marker"),
    ("v1,c,v2,c", "plain"),
    ("", None),
    ("[v1]", "marker"),
    ("Aceasta mi-e dorința, să Te-onorez,", "plain"),
    ("Cu fiin{FIX}a-ntreagă să Te slăvesc.", "fix"),
    ("Te ador, Stăpâne, și mă închin,", "plain"),
    ("", None),
    ("[c]", "marker"),
    ("Ție-Ți dau inima și sufletul meu,", "plain"),
    ("Pentru Tine vreau să trăiesc!", "plain"),
]


def draw_header(d):
    text(d, 36, 30, "bes-lyrics", font(F_SEMI, 15), PURPLE)
    text(d, 36, 52, "One text file per song. Checked on every pull request.", font(F_BOLD, 27), INK)
    text(
        d,
        36,
        90,
        "Merged lyrics reach the church screens and the printed songbook without anyone retyping them.",
        font(F_REG, 16),
        MUTED,
    )


def step_label(d, x, y, n, label, active):
    col = INK if active else MUTED
    d.ellipse([sc(x), sc(y), sc(x + 22), sc(y + 22)], fill=PURPLE if active else FAINT)
    text(d, x + 11, y + 11.5, str(n), font(F_BOLD, 13), (255, 255, 255), anchor="mm")
    text(d, x + 30, y + 2, label, font(F_SEMI, 15), col)


def draw_song(d, t):
    active = t < CHECK_T0 + 1.2
    box(d, A_X, A_Y, A_W, A_H, CARD, BORDER)
    step_label(d, A_X + 18, A_Y + 16, 1, "Edit a song", True)
    # file tab
    text(d, A_X + 18, A_Y + 50, "verified/.../Aceasta mi-e dorinta.txt", font(F_MONO, 11), MUTED)
    d.line([sc(A_X), sc(A_Y + 72), sc(A_X + A_W), sc(A_Y + 72)], fill=BORDER, width=sc(1))

    fixed = prog(t, FIX_T - 0.15, FIX_T + 0.2)
    typing = prog(t, FAIL_T - 0.1, FAIL_T + 0.3)
    y = A_Y + 86
    fm = font(F_MONO, 13)
    fmb = font(F_MONO_B, 13)
    for s, kind in SONG:
        if kind == "marker":
            text(d, A_X + 18, y, s, fmb, BLUE)
        elif kind == "title":
            text(d, A_X + 18, y, s, fmb, INK)
        elif kind == "fix":
            pre, post = s.split("{FIX}")
            x = A_X + 18
            text(d, x, y, pre, fm, INK)
            x += text_w(d, pre, fm)
            wrong, right = "ţ", "ț"  # cedilla (wrong) vs comma below (right)
            ch = right if fixed > 0.5 else wrong
            cw = text_w(d, ch, fm)
            if typing > 0:
                bg = mix(RED_BG, GREEN_BG, fixed)
                fg = mix(RED, GREEN, fixed)
                bgc = mix(CARD, bg, min(1, typing * 1.5))
                d.rounded_rectangle([sc(x - 2), sc(y - 2), sc(x + cw + 2), sc(y + 17)], radius=sc(3), fill=bgc)
                text(d, x, y, ch, fmb, fg)
            else:
                text(d, x, y, ch, fm, INK)
            x += cw
            text(d, x, y, post, fm, INK)
            # annotation pill
            if typing > 0:
                label = "fix pushed: ț (comma below)" if fixed > 0.5 else "ţ has a cedilla: rejected"
                col = GREEN if fixed > 0.5 else RED
                bgp = GREEN_BG if fixed > 0.5 else RED_BG
                a = min(1, typing * 1.3)
                pf = font(F_MED, 11)
                pw = text_w(d, label, pf) + 16
                px, py = A_X + A_W - pw - 14, y + 22
                box(d, px, py, pw, 20, mix(CARD, bgp, a), None, r=10)
                text(d, px + 8, py + 3.5, label, pf, mix(CARD, col, a))
                y += 22
        elif kind == "plain":
            text(d, A_X + 18, y, s, fm, INK)
        y += 21 if kind else 12
    # leadsheet twin hint
    fy = A_Y + A_H - 58
    d.line([sc(A_X), sc(fy), sc(A_X + A_W), sc(fy)], fill=BORDER, width=sc(1))
    text(d, A_X + 18, fy + 12, "leadsheets/ twin, same id, with chords:", font(F_REG, 12), MUTED)
    text(d, A_X + 18, fy + 31, LEADSHEET[0][:41] + "…", font(F_MONO, 10.5), AMBER)
    _ = active


def draw_checks(d, t):
    box(d, B_X, B_Y, B_W, B_H, CARD, BORDER)
    step_label(d, B_X + 18, B_Y + 16, 2, "Pull request checks", t > CHECK_T0 - 0.3)
    y = B_Y + 70
    for i, (title, sub) in enumerate(CHECKS):
        state = check_state(i, t)
        check_icon(d, B_X + 34, y + 16, state, spin=(t * 1.6) % 1)
        tc = INK if state else MUTED
        text(d, B_X + 56, y + 3, title, font(F_SEMI, 15), tc)
        text(d, B_X + 56, y + 22, sub, font(F_REG, 12.5), RED if state == 3 else MUTED)
        y += 62
    # merge pill
    m = prog(t, MERGE_T, MERGE_T + 0.35)
    pw, ph = B_W - 36, 40
    px, py = B_X + 18, B_Y + B_H - ph - 18
    box(d, px, py, pw, ph, mix(CARD, (240, 234, 253), m), mix(BORDER, PURPLE, m), r=20, width=1.4)
    failing = FAIL_T <= t < RERUN_T
    label = "Merged to main" if m > 0.5 else ("Blocked: 1 check failed" if failing else "Waiting for checks…")
    col = RED if failing else mix(MUTED, PURPLE, m)
    text(d, px + pw / 2, py + ph / 2 + 1, label, font(F_SEMI, 15), col, anchor="mm")


def draw_propresenter(d, t, lit):
    box(d, C_X, PP_Y, C_W, PP_H, CARD, mix(BORDER, BLUE, lit * 0.6))
    step_label(d, C_X + 18, PP_Y + 16, 3, "On screen · ProPresenter 7", lit > 0.2)
    sx, sy, sw, sh = C_X + 18, PP_Y + 50, C_W - 36, 118
    box(d, sx, sy, sw, sh, mix((236, 236, 238), SLIDE, lit), None, r=8)
    if lit > 0:
        a = prog(t, LIT_T - 0.2, LIT_T + 0.6)
        fc = mix(SLIDE, (255, 255, 255), a)
        fs = font(F_MED, 15)
        text(d, sx + sw / 2, sy + sh / 2 - 12, "Aceasta mi-e dorința, să Te-onorez,", fs, fc, anchor="mm")
        text(d, sx + sw / 2, sy + sh / 2 + 12, "Cu ființa-ntreagă să Te slăvesc.", fs, fc, anchor="mm")
    text(d, C_X + 18, PP_Y + PP_H - 44, "bes-propres7-migrator → Google Drive", font(F_REG, 12.5), MUTED)
    text(d, C_X + 18, PP_Y + PP_H - 26, "→ presentation Mac, only changed songs", font(F_REG, 12.5), MUTED)


def draw_pdf(d, t, lit):
    box(d, C_X, PDF_Y, C_W, PDF_H, CARD, mix(BORDER, AMBER, lit * 0.6))
    step_label(d, C_X + 18, PDF_Y + 16, 3, "In print · PDF songbook", lit > 0.2)
    px, py, pw, ph = C_X + 18, PDF_Y + 50, C_W - 36, 118
    box(d, px, py, pw, ph, (252, 251, 248), BORDER, r=6)
    a = prog(t, LIT_T, LIT_T + 0.7) if lit > 0 else 0
    if lit > 0:
        text(d, px + 16, py + 12, "Aceasta mi-e dorința", font(F_BOLD, 14), mix((252, 251, 248), INK, a))
        cf = font(F_BOLD, 11.5)
        lf = font(F_REG, 13)
        for ry, line in zip((py + 40, py + 78), LEADSHEET):
            lyric, chords = split_chords(line)
            for pos, c in chords:
                cx = text_w(d, lyric[:pos], lf)
                text(d, px + 16 + cx, ry, c, cf, mix((252, 251, 248), AMBER, a))
            text(d, px + 16, ry + 15, lyric, lf, mix((252, 251, 248), INK, a))
    text(d, C_X + 18, PDF_Y + PDF_H - 44, "LaTeX leadsheets → GitHub release", font(F_REG, 12.5), MUTED)
    text(d, C_X + 18, PDF_Y + PDF_H - 26, "and Google Drive, rebuilt on every change", font(F_REG, 12.5), MUTED)


def frame(t):
    img = Image.new("RGB", (W * S, H * S), BG)
    d = ImageDraw.Draw(img)
    draw_header(d)

    # connectors (under the cards)
    ab = [(A_X + A_W, A_Y + A_H / 2), (B_X, A_Y + A_H / 2)]
    ay = B_Y + B_H - 38
    bc1 = [(B_X + B_W, ay), (B_X + B_W + 20, ay), (B_X + B_W + 20, PP_Y + PP_H / 2), (C_X, PP_Y + PP_H / 2)]
    bc2 = [(B_X + B_W, ay), (B_X + B_W + 20, ay), (B_X + B_W + 20, PDF_Y + PDF_H / 2), (C_X, PDF_Y + PDF_H / 2)]
    path_line(d, ab, PURPLE, prog(t, 1.2, 2.0))
    path_line(d, bc1, BLUE, prog(t, SHIP_T, SHIP_T + 1.0))
    path_line(d, bc2, AMBER, prog(t, SHIP_T, SHIP_T + 1.0))

    draw_song(d, t)
    draw_checks(d, t)
    lit = prog(t, LIT_T - 0.3, LIT_T + 0.3)
    draw_propresenter(d, t, lit)
    draw_pdf(d, t, lit)

    dot_on_path(d, ab, prog(t, 1.2, 2.0), PURPLE)
    sp = prog(t, SHIP_T, SHIP_T + 1.0)
    dot_on_path(d, bc1, sp, BLUE)
    dot_on_path(d, bc2, sp, AMBER)
    return img.resize((W, H), Image.LANCZOS)


def main():
    n = int(DURATION * FPS)
    fade_from = DURATION - 0.8
    start = frame(0.0)
    with tempfile.TemporaryDirectory() as tmp:
        for i in range(n):
            t = i / FPS
            img = frame(t)
            if t > fade_from:
                img = Image.blend(img, start, ease((t - fade_from) / (DURATION - fade_from)))
            img.save(f"{tmp}/f{i:04d}.png")
        pal = f"{tmp}/palette.png"
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", f"{tmp}/f%04d.png",
             "-vf", "palettegen=max_colors=128:stats_mode=full", pal],
            check=True,
        )
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", f"{tmp}/f%04d.png", "-i", pal,
             "-lavfi", "paletteuse=dither=none:diff_mode=rectangle", "-loop", "0", str(OUT)],
            check=True,
        )
        if os.environ.get("KEEP_FRAMES"):
            shutil.copytree(tmp, os.environ["KEEP_FRAMES"], dirs_exist_ok=True)
    print(f"wrote {OUT} ({OUT.stat().st_size / 1024:.0f} KiB, {n} frames)")


if __name__ == "__main__":
    main()
