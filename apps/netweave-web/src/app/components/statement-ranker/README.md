# Statement Ranker

A vertical drag-to-rank-and-score canvas for 4 statements, built as a
standalone Angular component.

## Install

```bash
npm install d3 @types/d3 --save
```

Tailwind and daisyUI need to already be set up in your Angular app
(`tailwind.config.js` with the daisyUI plugin registered). The component's
CSS uses `theme('colors.base-200', ...)` / `theme('colors.base-300', ...)`,
which are daisyUI's theme tokens — if you're not using daisyUI, just
replace those two lines with plain hex values (fallbacks are already
provided as the second argument).

## Use

```ts
import { StatementRankerComponent } from './statement-ranker/statement-ranker.component';

@Component({
  standalone: true,
  imports: [StatementRankerComponent],
  template: `<app-statement-ranker />`
})
export class SomeParent {}
```

Swap the four `statements` strings in the component for your own content,
or turn `statements` into an `@Input()` if you want it reusable.

## How the interaction works

- The track is a fixed-height canvas (`canvasHeight`, default `600px`).
  Top of the track = score `100` (full approval). Bottom = score `0`.
- All 4 boxes are the same fixed height (`boxHeight`, default `64px`) and
  start bunched together in the middle, so the first drag is meaningful.
- Dragging a box moves it freely until it would overlap a neighbour —
  then it sticks flush against that neighbour's near edge.
- If you keep dragging past the neighbour's **vertical midpoint**, the
  two boxes swap outright: the neighbour takes the spot you were just
  resting in, and your box lands cleanly on the far side of the
  neighbour. That's what gives you a free re-ordering, not just a stuck
  box.
- Rank (`#1`–`#4`, top-to-bottom) and score (`0`–`100`) are both derived
  live from each box's position — one drag gesture produces both.

## Reading out the result

`items` on the component holds `{ id, text, top }` for each statement.
Call `scoreOf(item)` for the 0–100 value and `rankOf(item)` for the
1–4 rank at any time (e.g. wire up an `@Output()` on drag `end` if you
want to emit the result to a parent).
