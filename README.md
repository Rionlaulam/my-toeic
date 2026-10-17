# Clearline TOEIC Practice Studio

A dependency-free, responsive static web app with five modular TOEIC Listening & Reading practice sets. Each JSON file contains exactly 200 original questions across the seven specified parts. Only the selected test is loaded at a time.

## Run locally

Browsers restrict `fetch()` from `file://` URLs, so serve this folder over HTTP. From the package directory, run:

```bash
node serve.js
```

Then open <http://localhost:8000>. The server uses only Node's built-in modules. To publish, commit the package directory to a GitHub repository and enable GitHub Pages from the repository's Pages settings.

## Features

- Five separately loaded datasets: `data/test1.json` through `data/test5.json`.
- Exact per-test counts: Part 1: 6; Part 2: 25; Part 3: 39; Part 4: 30; Part 5: 30; Part 6: 16; Part 7: 54.
- Practice and timed modes silently save selections. Neither mode shows correctness badges, transcripts, or explanations while the test is in progress.
- Submitting or timing out opens a comprehensive results page with Listening and Reading raw scores, a clearly identified 10–990 practice estimate, part breakdowns, and all 200 questions. Correct answers are marked green, an incorrect selected option is marked red, and each question includes rationale and optional passage/transcript context.
- Timed mode uses 45-minute Listening and 75-minute Reading phases, one-play-per-passage listening audio controls, a 120-minute master timer, section locking, and automatic submission.
- Listening uses browser speech synthesis with Play/Pause/Resume and replay controls in practice mode. No third-party MP3 recordings are embedded; available voices depend on the browser and device.
- LocalStorage attempt history and responsive, keyboard-friendly controls.

## Score estimate limitation

ETS reports TOEIC Listening and Reading scores on separate 5–495 scales and a 10–990 total. Exact raw-to-scaled conversions depend on the test form and equating; this app uses a clearly labelled linear practice estimate, not an official ETS score or score prediction. Use an official score report for consequential decisions.

## Photographs and attribution

Part 1 uses public Unsplash download URLs for real workplace, warehouse, technician, transit, and market photographs. Each JSON record includes image alt text, photographer credit, and a link to its Unsplash source page. The photos are served from Unsplash rather than copied into this ZIP, so an internet connection is required to display them. The selected source pages are free to use under the Unsplash License, not Unsplash+:

| Scene | Photographer | Unsplash source |
|---|---|---|
| Office meeting | Cherrydeck | [Photo](https://unsplash.com/photos/people-in-office-meeting-05gac-Qn0k4) |
| Whiteboard collaboration | Vitaly Gariev | [Photo](https://unsplash.com/photos/team-collaborating-around-a-whiteboard-in-an-office-CdTQI-Nh7J4) |
| Warehouse boxes and pallets | Ashley | [Photo](https://unsplash.com/photos/a-warehouse-filled-with-lots-of-boxes-and-pallets-28b8xlTT5t4) |
| Warehouse forklift | Bernd Dittrich | [Photo](https://unsplash.com/photos/a-forklift-driving-through-a-warehouse-filled-with-pallets-F2C_mSrb6iM) |
| Server repair | Yuriy Vertikov | [Photo](https://unsplash.com/photos/man-repairing-a-computer-server-under-a-lamp-bFjTqonnpK4) |
| Electronics work | Samsung Memory | [Photo](https://unsplash.com/photos/a-person-is-working-on-a-piece-of-electronics-fxKvHGDICcQ) |
| Subway passengers | Zoshua Colah | [Photo](https://unsplash.com/photos/people-ride-the-new-york-city-subway-CHqZzVLq_yQ) |
| Produce market stall | Moniek van Rosse | [Photo](https://unsplash.com/photos/market-stall-with-fresh-produce-CUgD2t1ANqE) |
| Outdoor market shoppers | Benjamin Chambon | [Photo](https://unsplash.com/photos/people-shopping-at-an-outdoor-produce-market-0-9DqNoPSZs) |
| Open office | Arlington Research | [Photo](https://unsplash.com/photos/people-working-at-desks-in-open-office-kN_kViDchA0) |
| Woman using a laptop | Icons8 Team | [Photo](https://unsplash.com/photos/woman-sitting-while-using-laptop-CrW-TbykPBQ) |
| Coffee cups and plant | Nina Cuk | [Photo](https://unsplash.com/photos/two-coffee-cups-sitting-on-a-table-next-to-a-potted-plant-ZgFE2XeE-4k) |
| Warehouse containers | UZ Creative Services | [Photo](https://unsplash.com/photos/stacks-of-sacks-and-containers-in-a-warehouse-d_BHc47AzLQ) |

## Content and rights

Questions, answer choices, dialogue, reading passages, and explanations were authored for this independent practice app; they are not scraped or reproduced from the referenced practice sites or public GitHub repositories. The Unsplash photographs remain subject to the Unsplash License and are credited above and in-app. TOEIC is a registered trademark of ETS; this project is not affiliated with or endorsed by ETS.

## Package files

```text
index.html
styles.css
app.js
serve.js
data/test1.json ... data/test5.json
```

The JSON modules include question text, answer choices, keys, explanations, review rationales, transcripts/material references, and Part 1 image links and credits.

## Format references

- [ETS Global — Understanding TOEIC test scores](https://www.etsglobal.org/fr/en/content/understanding-toeic-tests-scores)
- [Parroto — TOEIC Practice Tests](https://parroto.app/exams/toeic)
- [eStudyMe — TOEIC TestPro](https://estudyme.com/en/toeic-testpro/)
- [TOEIC Training — Part-by-part format guide](https://www.toeic-training.com/toeic-guides/toeic-test-format-part-by-part/)
- [GitHub — TOEIC topic](https://github.com/topics/toeic)
- [Unsplash License](https://unsplash.com/license)
