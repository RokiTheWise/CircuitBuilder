# QMC Simplification Walkthrough — Design

## Goal

Add a "How it was computed" affordance to LogiSketch that explains, step by step,
how the current truth table was reduced to its simplified Sum-of-Products (SOP)
equation via the Quine-McCluskey (QMC) algorithm.

## User-facing behavior

- A small **"How it was computed"** button sits beside the existing **"Use this"**
  button in the Simplified Result row of the sidebar.
- Clicking it opens a **modal overlay** showing the QMC reduction as a sequence of
  numbered steps for the *current* equation / truth table.
- The modal closes on backdrop click, Escape, or an explicit close button.

## Scope

Explains **QMC simplification only** (minterms → grouping/combining → prime
implicants → essential PIs → final SOP). The NAND/NOR DeMorgan gate conversion is
explicitly out of scope.

## Architecture

### 1. Tracing function — `BooleanSimplifier.ts`

Add a new, parallel function `getSimplificationSteps(numInputs, outputs)` rather
than refactoring the existing `getPrimeImplicants`. The existing solver has
bug-fix history and is left untouched; the tracer re-runs the same algorithm while
recording each stage. Minor logic duplication is accepted in exchange for not
risking the proven solver.

Returned structure (`SimplificationSteps`):
- `minterms`: rows where output = 1 — `{ decimal, binary, term }`
- `rounds`: each combining pass — list of merges `{ left, right, combined }`
- `primeImplicants`: final patterns that couldn't combine further (binary + term)
- `essential`: which PIs are essential and which minterm forced each
- `finalEquation`: resulting SOP string
- `trivial`: optional flag/message for constant `0` / constant `1` cases

### 2. Modal component — `SimplificationModal.tsx`

Renders the steps as numbered cards matching the existing aesthetic
(slate/blue/purple palette, `font-black` headings, rounded cards as seen in
`how-it-works/page.tsx`). Binary patterns are monospace chips; merges shown with
arrows; a final "Result" card shows the equation. Backdrop + close-on-Escape /
click-outside.

### 3. Wire-up — `page.tsx`

- `showSteps` boolean state.
- "How it was computed" button beside "Use this".
- Steps computed via `useMemo` over `numInputs` / `tableOutputs`.
- Modal rendered conditionally.

## Edge cases

- Constant `0` and constant `1` — no combining; show a short explanation.
- Single minterm — no merges; goes straight to a single-term PI.
- Already-minimal single-term results — render gracefully (one round, no merges).

## Commit plan

- **Commit 1 (2026-06-06):** `getSimplificationSteps` tracing function in
  `BooleanSimplifier.ts`.
- **Commit 2 (2026-06-09):** `SimplificationModal.tsx` component.
- **Commit 3 (2026-06-10):** Wire button + modal into `page.tsx`.
