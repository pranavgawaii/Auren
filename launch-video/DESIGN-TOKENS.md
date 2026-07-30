# Design tokens

Pulled from `src/app/globals.css` and `src/app/layout.tsx`. Nothing invented — use
these exact values in After Effects so the motion graphics and the screen recordings
cannot drift apart.

## Colour — the real palette

| Token | Hex | Source |
|---|---|---|
| **Canvas** | `#FBF3EC` | `--bg` — the signature warm cream. Not #FAF8F5. |
| **Ink** | `#241B14` | `--text` |
| **Accent** | `#E8593C` | `--accent` |
| Accent dark | `#C44730` | `--accent-dark` (hover) |
| Card | `#FFFFFF` | `--card-bg` |
| Mascot orange | `#F5845E` | the badge disc only |
| Hover / selected | `#F5EFE8` | `--bg-hover`, `--bg-selected` |
| Urgent | `#DC2626` | `--urgent` |
| Success | `#16A34A` | confirmations |

**Alphas**
```
muted      rgba(36,27,20,0.50)     --muted
border     rgba(36,27,20,0.08)     --border
border-md  rgba(36,27,20,0.15)     --border-md
faint      rgba(36,27,20,0.40)
```

## Type — the real stack

| Role | Family | Weight | Variable |
|---|---|---|---|
| **Display** | **Civane** (local OTF, ships in repo) | 400 only | `--font-civane` |
| Body / UI | **Inter** | 400/500/600 | `--font-sans` |
| Alt display | **Plus Jakarta Sans** | 500/600/700 | `--font-display` |
| Code / tool names | **JetBrains Mono** | 400/500 | `--font-mono` |

Landing `h1` measured live: **56px, weight 400, letter-spacing −1.4px**.
Scaled for film: 76–132px at the same −0.028em tracking.

Civane has **one weight**. Never fake bold by stroking it — scale up instead.
The font file is copied to `assets/fonts/Civane-Norm-Regular.otf` for AE.

## Texture — the plus-grid

The product's own background pattern, from `src/app/page.tsx`:

```svg
<pattern id="pg" width="26" height="26" patternUnits="userSpaceOnUse">
  <line x1="13" y1="7"  x2="13" y2="19" stroke="rgba(36,27,20,0.10)" stroke-width="1.4" stroke-linecap="round"/>
  <line x1="7"  y1="13" x2="19" y2="13" stroke="rgba(36,27,20,0.10)" stroke-width="1.4" stroke-linecap="round"/>
</pattern>
```

Applied to roughly the right 40–48% of the frame, plus concentric arcs from the
bottom-right corner at r = 200 / 280 / 360, strokes `rgba(36,27,20,0.07 / 0.05 / 0.035)`.

**Use this, not a square grid.** It is the brand's texture and it reads far more
refined at scale.

## Geometry

| Element | Radius |
|---|---|
| Base | `10px` (`--radius`) |
| Small | `6px` (`--radius-sm`) |
| Cards | 12–16px |
| Modals | 16–18px |

**Shadows**
```
card    0 1px 2px   rgba(36,27,20,.04)
raised  0 26px 56px rgba(36,27,20,.11)
modal   0 42px 92px rgba(36,27,20,.16)
```

## Motion — match in AE

| Use | Spring | AE equivalent |
|---|---|---|
| Modals, cards | `stiffness 380, damping 32` | ~450ms, 3% overshoot |
| Popovers | `stiffness 420, damping 30` | ~380ms, 4% overshoot |
| Row cascade | `delay 0.06 + i × 0.035` | **35ms stagger** |
| Entrance | `y +12→0`, `scale .985→1` | rise, never fly |

**House curve:** `cubic-bezier(0.22, 1, 0.36, 1)` — put it on everything typographic.

**Blink:** `scaleY 1 → 0.08 → 1`, 175ms, every 2.2s, origin at the eye's vertical centre.
