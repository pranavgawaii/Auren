# Launch video kit

Everything to cut Auren's launch film in After Effects.

## ▶ Watch it first

```bash
open launch-video/preview/index.html
```

**`preview/index.html` is the whole film as a playable animatic** — all 13 shots, real
timing, 1:27. Press **Play** or **Space**, click anywhere on the track to scrub, **↺** to
restart. Each shot's name and length shows bottom-right.

This is the blueprint. Watch it, tell me what to change, *then* build it in AE — it's far
cheaper to fix pacing here than after you've keyframed it.

```
launch-video/
├── preview/index.html     ← ▶ THE ANIMATIC. Play the whole film.
├── SCRIPT.md              11 shots, 80s, timecodes, all on-screen copy, cut-downs
├── REFERENCE-NOTES.md     breakdown of the Learnist reference — what to take, what to skip
├── RECORDING-GUIDE.md     capture settings, shot table, AE import, motion rules, export
├── DESIGN-TOKENS.md       exact colours, type, springs — pulled from shipping code
├── style-frames/
│   └── index.html         8 look-dev frames: background system, tilted panel, palette
├── title-cards/
│   └── index.html         10 animated statement cards. Record these.
└── assets/
    ├── mascot-png/        7 poses, alpha, tight-cropped, AE-ready  ← use these
    ├── mascot/            blink-state SVGs + badge (the flat mark)
    ├── screens/           dashboard.svg, landing.svg — layered, named
    └── svg/cursor.svg     designed cursor. Never film the OS arrow.
```

## Do this first

**Install the fonts.** `fontshare.com` → **Cabinet Grotesk** (Extrabold) + **Satoshi**
(Medium). Free for commercial use. Everything falls back to system fonts until you do,
so what you see now is a downgrade from what you'll get. Install system-wide and they
resolve in both the browser and After Effects.

## Then

1. Read **SCRIPT.md**.
2. Work the checklist at the top of **RECORDING-GUIDE.md**. Both code blockers are
   fixed; the demo account is on you.
3. Open `title-cards/index.html` full-screen in Chrome, press **C** to hide the HUD,
   screen-record each card. Arrows step, **R** replays.
4. Capture the product shots per the table in RECORDING-GUIDE.
5. Import SVGs to AE via Illustrator → *Composition – Retain Layer Sizes*.

## Notes on the assets

**`mascot-png/` is what you want.** The source WebPs already carry clean alpha — nothing
was keyed, only converted and tight-cropped, because **After Effects cannot import WebP
at all.** Cropping to the character gives AE a predictable anchor point for squash-stretch.

**`screens/*.svg` are layout-accurate reconstructions, not pixel captures.** Every group
is `id`-tagged so it lands in AE as a named layer (`stat-inbox`, `command-bar`,
`hero-panel`…). Use them where you need elements to fly apart or parallax in Z. For the
hero shots, **record the real app** — its realness is the sell.

**The reference `.mp4` is gitignored.** 8.9 MB shouldn't be committed; the file stays on
disk for you.

## The animatic vs. the real thing

The preview is intentionally *simple* — it shows structure, pacing, copy, and colour, and
deliberately leaves the expensive craft to you in After Effects:

| Already in the animatic | You add in AE |
|---|---|
| Shot order and exact durations | Motion blur on every move |
| Word-by-word blur-slide entrances | Camera moves in real 3D space |
| Dark ⇄ cream alternation | Depth-of-field on the tilted panels |
| Tilted panel with rim light | Light sweeps across the rim |
| Mascot poses, pops and bobs | Squash-stretch, arc paths, shadow follow |
| Glow + grid background system | Animated grid drift, particle life |
| Stat counts, timeline rail | Number roll-ups, stroke-trim reveals |
| Layout of every product shot | Real screen recordings composited in |

Product shots in the animatic use `assets/screens/*.svg`. In the final film, **replace
shots 4, 5, 6, 8 and 9 with real screen recordings** — their realness is the whole sell.
Keep the SVGs for anything that needs to fly apart or parallax in Z.
