/**
 * Marks a build that is not the live site.
 *
 * Driven by VITE_BUILD_LABEL, which only the /test/ build sets — see the
 * workflow on main. With the variable unset Vite substitutes undefined here,
 * both components return null, and the bundler drops them, so the root build
 * carries none of this.
 */
const LABEL = import.meta.env.VITE_BUILD_LABEL;

/**
 * The frame. A ring around the viewport is the whole visual signal, and it is
 * the only shape that can be laid over this UI safely: the plot is full-bleed
 * and every control is absolutely positioned against an edge, so a bar, a
 * corner chip or a side tab all land on something.
 *
 * An earlier version added vertical TEST tabs pinned at 30% height. They
 * covered the forecast panel at 1440x756, the fourth tide row at 375x667, and
 * the right-hand end of the time-lapse speed slider — its readout included.
 * There is no fixed offset that is free at every viewport in both the idle and
 * the playing layouts, which is why the label now lives in the flow instead
 * (see BuildTag) and nothing here overlays content at all.
 */
export function BuildBadge() {
  if (!LABEL) return null;
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 border-4 border-amber-500/90"
      aria-hidden="true"
    />
  );
}

/**
 * The word itself, in the flow of the control stack rather than over it.
 *
 * Sits next to "Jump to today", so it takes its own space in a row that had
 * room to spare and can never cover anything. It is the accessible half of the
 * signal too — the ring is decorative and hidden from assistive tech.
 */
export function BuildTag() {
  if (!LABEL) return null;
  return (
    <span className="rounded-md bg-amber-500 px-2 py-1 text-xs font-bold tracking-wider text-black shadow-sm">
      {LABEL}
    </span>
  );
}
