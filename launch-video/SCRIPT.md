# Auren — Launch Film

**80s · no VO · typography + product + sound design · must work muted.**
Timecodes `MM:SS` · 30fps delivery, capture at 60.

Motion vocabulary adapted from the reference film (`8eLXZTtL7MMbqpLJ.mp4`), rebuilt
in Auren's palette. See `REFERENCE-NOTES.md` for the technique breakdown.

---

## Shot 1 — Cold open · 0:00–0:05
**Dark.** Title card 1.

The blinking SVG mascot fades up small, centre. It blinks once. Words slide in from
the left with motion blur, one at a time:

> **47 unread. 3 PRs.**
> **A meeting you forgot to schedule.**

*This is the film's only blink beat — it ties back to the Twitter post.*
*Sound:* room tone. One soft tick per word.

---

## Shot 2 — The problem · 0:05–0:11
**Dark.** Title card 2. Mascot: `confused_lost.png`

Mascot pops in (scale 94 → 103 → 100), hand on head. Words slide in beneath.

> **Your tools don't _talk._**

*Motion:* the three service marks drift apart behind him at different Z depths.

---

## Shot 3 — Logo reveal · 0:11–0:16
**Cream.** Title card 3. Mascot: `auren_hero.png`

Black floods to cream in a 400ms centre wipe. Mascot lands with the paper plane.

> **AUREN**
> *the execution layer for your workspace*

*Sound:* ★ the one low bass hit in the film.

---

## Shot 4 — ★ Website · 0:16–0:23
**Screen recording** — `auren.app` landing page.

Hero at rest, then a slow scroll into the `WorkspaceSyncDiff` animation. Let the
Gmail/Calendar panels actually sync on camera.

*Asset alternative:* `assets/screens/landing.svg` — layered, for a 2.5D parallax version.

---

## Shot 5 — The product · 0:23–0:31
**Screen recording** — `/dashboard`, loaded and idle.

Slow push-in, 100% → 106%. Cards settle with the app's real spring. Cursor drifts.
No text. Let it breathe.

*Asset alternative:* `assets/screens/dashboard.svg` — every card is its own AE layer.

---

## Shot 6 — The command · 0:31–0:41
**Screen recording** — AI command bar.

Type at human speed:

> `Schedule a 30-min sync with @Sarah Thursday 2pm, add a Meet link, email her the agenda`

Hold a beat when the `@Sarah` chip snaps in. Enter. The ColorOrb spins up.
Cut to `searching.png` mascot for ~1s while it thinks, then back.

---

## Shot 7 — ★★ THE HERO · 0:41–0:57
**Screen recording + title cards 5 & 6.**

**Sixteen seconds. A fifth of the film. Do not cut it short.**

Confirmation panel rises. Actions stack in 180ms apart:
1. `calendar_create` — 30-min Google Meet, Thursday 2:00 PM
2. `gmail_send` — agenda + meeting link

Cut to title card:
> **It tells you what it's _about to do._**

Back to product. **Push in on the editable time picker and scrub it.** This is the beat
nobody else has — you can correct the AI before it acts.

> **Then _you_ decide.**

Cursor to **Confirm**. Click.

---

## Shot 8 — The proof · 0:57–1:06
**Screen recording**, split screen. Title card 7. Mascot: `celebrating.png`

Left: calendar event materialises in the Thursday 2pm slot.
Right: the sent mail appears in the thread.

> **Then it _does it._**

*Must be a genuine recording. This shot is the credibility of the whole film.*

---

## Shot 9 — The briefing · 1:06–1:13
**Screen recording** — briefing card. Title card 8.

"Good morning" sets. Timeline rail draws down (stroke trim 0→100, 700ms), nodes
popping as it passes. Stat numbers count up from 0.

> **Every morning, your day — _already read._**

---

## Shot 10 — Speed · 1:13–1:18
**Screen recording.** Title card 9.

Fast cuts ~500ms: `Cmd+\` zen mode, `Ctrl+\` console, panel resize.
Keyboard overlays flash bottom-centre.

> **Built for people who _ship._**

---

## Shot 11 — End card · 1:18–1:24
**Cream.** Title card 10. Mascot: `auren_hero.png`

> **AUREN**
> auren.app
> *Now in beta*

Two-beat hold. Hard cut to black.

---

## Title card index

| Card | Copy | Stage |
|---|---|---|
| 1 | 47 unread. 3 PRs. / A meeting you forgot to schedule. | dark |
| 2 | Your tools don't **talk.** | dark |
| 3 | AUREN — the execution layer | cream |
| 4 | Mail. Calendar. **Repos.** | dark |
| 5 | It tells you what it's **about to do.** | cream |
| 6 | Then **you** decide. | cream |
| 7 | Then it **does it.** | dark |
| 8 | Every morning, your day — **already read.** | cream |
| 9 | Built for people who **ship.** | dark |
| 10 | AUREN · auren.app · Now in beta | cream |

Open `title-cards/index.html`, press **C** to hide the HUD, arrows to step, **R** to replay.

## Mascot usage

| Pose | Shot |
|---|---|
| `confused_lost` | 2 — the problem |
| `auren_hero` | 3, 11 — logo + end card |
| `searching` | 6 — while the agent thinks |
| `celebrating` | 8 — it worked |

Unused but available: `sorting_emails`, `mascot-welcome`, `mascot-create`.

## Cut-downs

- **6s teaser** — shot 7 only, panel-rise to Confirm
- **30s** — shots 3 → 6 → 7 → 8 → 11
- **15s pre-roll** — shots 6 → 7 (compressed) → 11
