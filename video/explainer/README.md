# Unmute — motion-graphics explainer

36 seconds. 1080 × 1920, 30 fps, **silent on purpose**.

Every word that matters is set as type on screen. The piece works with the
sound off, in a waiting room, or for a Deaf viewer — which for this subject is
not a limitation to apologise for, it is the correct default. It is also
caption-safe by construction: no transcript is needed because there is no
speech to transcribe.

```bash
/home/user/.venv_video/bin/python build_video.py     # ~25 s to render
```

Requires `pillow` and `imageio-ffmpeg` (ships a static ffmpeg; none is
installed on this machine).

## Structure

| # | Seconds | Scene |
|---|---|---|
| 1 | 0.0 – 3.4 | Title |
| 2 | 3.4 – 9.6 | The ward — three statements, full screen each |
| 3 | 9.6 – 15.2 | The evidence — 7 / 8 / 76 % counting bars |
| 4 | 15.2 – 20.8 | 21 hospitals, then they empty to 0 |
| 5 | 20.8 – 25.4 | Two directions, one screen |
| 6 | 25.4 – 31.8 | The honest limit — twenty expressions |
| 7 | 31.8 – 36.0 | Close |

## What this is not

**It is not a screen recording of the product.** Nobody is showing the app
working, because that requires a browser with a camera and a hand in front of
it. This is typography and data, built frame by frame.

A real product walkthrough has to be captured by hand on a phone — see
`SCREEN-RECORDING.md`.

## Drive will not play a file with no audio track

The first upload failed in Drive's player — "an unexpected error occurred" — on a
perfectly valid H.264 file. It had **no audio stream**, because the render passed
`-an`. Google's player expects one. Encode silence:

```bash
ffmpeg -i in.mp4 -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 \
  -shortest -c:v libx264 -profile:v main -level 4.0 -pix_fmt yuv420p \
  -c:a aac -b:a 96k -movflags +faststart out.mp4
```

High → Main profile costs nothing on flat graphics and widens player support.

## The trap that cost the most time

`fit_font` initially measured single words, so "HAS TO BE BOOKED." passed the
check while running off the right edge. Fit the **line**, not the words. And
`reveal()` must be told the scene background in `bg=`, or it wipes a black
band across a light slide.
