/**
 * Marks a build that is not the live site.
 *
 * Driven by VITE_BUILD_LABEL, which only the /test/ build sets — see the
 * workflow on main. With the variable unset Vite substitutes undefined here,
 * the component returns null, and the bundler drops it, so the root build
 * carries none of this.
 *
 * It has to be unmissable without covering anything, and the plot is full-bleed
 * with every control absolutely positioned against an edge: a bar at the top
 * sits on the view switcher, a corner chip sits on an axis label. The ring
 * covers nothing at all and is the signal that actually carries.
 *
 * The tabs are at 30% height rather than centred because the red height line
 * runs 0-10 m, which in the default FOU view is 54-88% down the plot, and its
 * chip rides the right-hand edge with it. Centred, the tab sat on that chip.
 */
export function BuildBadge() {
  const label = import.meta.env.VITE_BUILD_LABEL;
  if (!label) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50" aria-hidden="true">
      <div className="absolute inset-0 border-4 border-amber-500/90" />
      <div className="absolute top-[30%] -right-px -translate-y-1/2 rounded-l-md bg-amber-500 px-1.5 py-3 text-[11px] font-bold tracking-[0.2em] text-black shadow-lg [writing-mode:vertical-rl]">
        {label}
      </div>
      <div className="absolute top-[30%] -left-px -translate-y-1/2 rounded-r-md bg-amber-500 px-1.5 py-3 text-[11px] font-bold tracking-[0.2em] text-black shadow-lg [writing-mode:vertical-rl]">
        {label}
      </div>
    </div>
  );
}
