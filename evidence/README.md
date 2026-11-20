# Supporting evidence

One PDF that combines the technical design, the working product, the public
site, the repository and the field work — the document an application asks for
when it says *"combine your technical designs, mockups, screenshots or other
evidence showing the solution's development into one document."*

```bash
/home/user/venv_deck/bin/python evidence/build_evidence.py
```

Reads `src/01-sign-screen.jpg` … `src/10-stage.jpg`, writes
`Unmute-Supporting-Evidence-2026.pdf`: nine A4 pages, five categories.

| # | Page | Category |
|---|------|----------|
| 1 | 3–4 | 01 The working product — three screens from app.liveunmute.com |
| 2 | 5 | 02 The public face — liveunmute.com, the navigation, the LOI form |
| 3 | 6 | 03 The build — the pipeline, the repository, `npm test` |
| 4 | 7 | 04 The field — Evami Special School, Enugu, and the laptop in transit |
| 5 | 8 | 05 Pitching — Hackaholics 7.0 |

The page-6 pipeline diagram is drawn in code, not screenshotted, because the
repository screenshot is too small to read at A4 width. It matches
`demo/README.md`; if the architecture changes, change it there too.

The document states plainly that `js/classifier.js` is a geometric prototype
with no training data and no accuracy figure. Do not remove that paragraph to
make the pack look stronger — the repository says the same thing, and a
reviewer who checks will find it.

## What is not in Git

`src/` and the built PDF are ignored. The photographs are of a real person and
this repository is public; the delivered copy lives in Google Drive.
