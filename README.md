# Clearline TOEIC Practice Studio

A dependency-free, responsive static web app with five modular TOEIC Listening & Reading practice sets. Each dataset contains exactly 200 original questions in seven parts (1,000 questions total). The five JSON files load separately when selected, and all illustrations are local SVG assets.

## Run locally

Because browsers restrict `fetch()` from `file://` URLs, open the project through a small local web server. From this directory, run:

```bash
node serve.js
```

Then open <http://localhost:8000>. The server uses only Node's built-in modules; no package installation, API key, backend, account, or external asset request is needed. The same directory can be copied to a GitHub repository and served with GitHub Pages.

## Features

- Five separately loaded files at `data/test1.json` through `data/test5.json`.
- Full counts per test: Part 1: 6; Part 2: 25; Part 3: 39; Part 4: 30; Part 5: 30; Part 6: 16; Part 7: 54.
- Practice mode with immediate checking, transcripts, explanations, part navigation, and answer review.
- Timed mode with a 45-minute Listening phase and 75-minute Reading phase, section locking, one-play-per-passage listening playback, a master countdown, and automatic submission at timeout. The user may move from Listening to Reading early; the Reading allowance remains 75 minutes and the overall attempt stays within the 120-minute maximum.
- Browser-native speech synthesis for listening prompts and transcripts. Speech availability and voices depend on the browser/device. This package intentionally does not hotlink third-party recordings or include externally hosted MP3 files.
- LocalStorage attempt history, section raw scores, estimated section scales, and part-by-part results.
- Keyboard-friendly controls and small-screen layout.

## Score estimate limitation

ETS describes TOEIC Listening and Reading scores on separate 5–495 scales and a 10–990 total. A universal raw-to-scaled conversion table is not supplied with this project; official forms are equated and exact conversions vary by test form. Clearline therefore displays a **linear practice estimate**, not an official ETS score or score prediction. Use an official score report for consequential decisions.

## Content and rights

All questions, dialogue, reading passages, explanations, and vector illustrations in the five datasets were authored for this practice app. They are not scraped or reproduced from Parroto, eStudyMe, TOEIC Training, or public GitHub repositories. The referenced sites were consulted only to confirm publicly described test structure and practice workflows. TOEIC is a registered trademark of ETS; this independent practice project is not affiliated with or endorsed by ETS.

## Files

```text
index.html
styles.css
app.js
serve.js
data/
  test1.json ... test5.json
assets/
  test1/ ... test5/   # six original SVG scenes per test
```

## Format references

- [ETS Global — Understanding TOEIC tests scores](https://www.etsglobal.org/fr/en/content/understanding-toeic-tests-scores): section and total score ranges.
- [Parroto — TOEIC Practice Tests](https://parroto.app/exams/toeic): publicly stated seven-part count and full-test workflow.
- [eStudyMe — TOEIC TestPro](https://estudyme.com/en/toeic-testpro/): publicly stated format, section timing, and question-count overview.
- [TOEIC Training — Part-by-part format guide](https://www.toeic-training.com/toeic-guides/toeic-test-format-part-by-part/): practice navigation and timing descriptions.
- [GitHub — TOEIC topic](https://github.com/topics/toeic): public repository topic page consulted for project landscape only.
