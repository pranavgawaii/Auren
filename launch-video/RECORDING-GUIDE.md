# Recording guide

Everything you capture yourself, and how. Read `SCRIPT.md` first for what each shot is.

## Before you press record — non-negotiable

- [x] **Groq 413 fixed** — email body and chat history are now capped in `src/agents/executor.ts`.
      Watch for `[analyzeCommand] prompt ≈ N tokens` in the dev console; it should read ~2–4k.
- [x] **3s boot overlay fixed** — the connection check is now optimistic and cached.
      First load after clearing storage still blocks once; load `/dashboard` twice before recording.
- [ ] **Demo account.** Do not film your real inbox. Every sender name and subject line
      is legible frame by frame — it's a privacy problem and a credibility problem.
      Seed 8–12 plausible threads and 4–5 calendar events.
- [ ] **Clean the console.** No devtools in any frame (Clerk dev-keys warning shows there).
- [ ] **Hide OS chrome.** Menu bar auto-hide, dock hidden, notifications off (Focus mode).
      A Slack toast mid-take costs you the shot.
- [ ] **Browser chrome.** Full-screen the app, or hide bookmarks and use a blank new-tab theme.

## Capture settings

| Setting | Value | Why |
|---|---|---|
| Resolution | **2560×1440 minimum**, 4K preferred | You'll scale and push in; 1080p capture goes soft |
| Frame rate | **60fps** | Lets you retime to 30 or slow-mo without judder |
| Codec | ProRes 422 or lossless | H.264 blocks up on the cream gradients |
| Browser zoom | **125%** for full screens, **200%** for mascot/orb detail | UI reads at small sizes |
| Colour | sRGB, no HDR | HDR capture will shift `#FAF8F5` in AE |

Tool: **Screen Studio** (best — designed cursor and auto-zoom built in) or QuickTime →
*New Screen Recording*. Avoid OBS unless you already have it dialled in.

## Shot-by-shot capture list

| Shot | What to record | Duration to capture | Notes |
|---|---|---|---|
| 4 | `/dashboard`, loaded and idle | 15s | Move the cursor idly. Don't click. |
| 5 | Command bar: click, type, enter | 20s | Type at human speed. Let the `@Sarah` chip land. |
| 6 | Confirmation panel, full flow | 30s | ★ Do 5+ takes. Include a time-picker scrub. |
| 7 | `/calendar` + `/mail` after execution | 15s each | Record separately, split in AE. |
| 8 | Briefing card open | 12s | Capture the card entering from closed. |
| 9 | `Cmd+\`, `Ctrl+\`, panel resize | 20s | One continuous take, cut it up later. |
| — | Mascot blink loop (boot overlay) | 10s | 200% zoom, tight square crop. Also your Twitter clip. |
| — | ColorOrb spinning during agent reply | 10s | 200% zoom. |

**Record every shot 3–5 times.** Recapturing after you've torn down the demo account is misery.

## Getting SVGs into After Effects

1. Open the `.svg` in **Illustrator**
2. `File → Save As` → **Illustrator (.ai)**, keep layers
3. In AE: `File → Import → File`, choose the `.ai`
4. Import As: **Composition – Retain Layer Sizes** ← this is the important one
5. Right-click each layer → **Create → Create Shapes from Vector Layer** (makes them
   scalable and animatable without rasterising)

Every element in the supplied SVGs is `id`-tagged, so they arrive in AE as named layers
(`head`, `eye-left`, `eye-right`, `disc`, `dot`, …) rather than "Layer 1…12".

## Animating the blink in AE

Three states are provided: `mascot-open`, `mascot-half`, `mascot-closed`.

The real app does it as `scaleY`, and that's what you should do too:
- Animate `eye-left` and `eye-right` **scaleY only**, anchor point at the eye's vertical centre
- `100% → 8% → 100%` over **5 frames** at 30fps (≈175ms — matches the app exactly)
- Cycle every **66 frames** (2.2s)
- **Add a random double-blink** every 3rd or 4th cycle. Perfectly periodic blinking is the
  one thing that reads as fake.

Use `mascot-half` as reference for the midpoint silhouette if you'd rather key three states
than scale — but scaleY is smoother.

## Motion rules

- **Never linear.** Easy Ease everything, then pull the speed graph to ~85% influence.
- **Overshoot slightly** on entrances — 2–4%, settling back. That's the app's spring.
- **Cursor is an asset** (`assets/svg/cursor.svg`), never the OS arrow. Scale to 88% on
  click, halo opacity 0.14 → 0.3, 120ms.
- **Push-ins are Z, not scale**, once you have layered comps. Flat scale looks like a slideshow.
- **Text enters, never flies.** Opacity + 12px rise. No rotation, no blur-in.

## Export

| Target | Size | Notes |
|---|---|---|
| Master | 1920×1080 ProRes 422 | Archive this |
| X / Twitter | 1920×1080 H.264, <512MB | Burn in captions |
| LinkedIn | 1080×1350 | Recrop, don't letterbox |
| Stories / Shorts | 1080×1920 | Reframe shot 6 to fill |
| Teaser | 1080×1080, 6s, loop | Shot 6 only |

## Sound

- Keystroke ticks on typing (shots 1, 5) — soft, low
- One low bass hit at the logo collapse (00:09) — the only real hit
- Card entry: a very short, high, quiet tick
- Ambient bed underneath, no build-drop structure
- **Test everything muted first.** If the film doesn't read silent, the typography is wrong.
