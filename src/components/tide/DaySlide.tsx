import type { ReactNode } from "react";

export type PageRole = "prev" | "cur" | "next";

/** One day's page in the touch carousel: where it sits, and what it draws. */
export type DayPage<M> = { key: string; dx: number; role: PageRole; m: M };

type Props<M> = {
  /**
   * The pages side by side — on a phone. Null on a mouse, and then the layer is
   * drawn for `cur` exactly as it always was, with no wrapper at all: the
   * desktop markup is the same as before the carousel existed.
   */
  pages: DayPage<M>[] | null;
  cur: M;
  children: (m: M, role: PageRole) => ReactNode;
};

/**
 * One layer of the chart that belongs to the day rather than to the structure
 * — the night bands, the curve, the crossing times, the hour labels — drawn
 * for each page of the touch carousel.
 *
 * The chart is drawn in layers, and the day's layers are interleaved with the
 * structure's: the night bands sit on the steel but under the water veil, the
 * curve over the axis grid, the crossing chips inside the red line's group. So
 * there is no single group to slide. Each day layer gets its own slide group
 * instead, marked data-day-slide, and useSwipe moves all of them together
 * while the structure, the sky and the red line itself stay where they are.
 *
 * Each page is keyed by its date, so when a swipe lands on the next day the
 * page already on screen becomes the current one rather than being redrawn.
 * Clip paths are resolved in the page's own coordinates, so every page is
 * clipped to its own window and moves with it.
 */
export function DaySlide<M>({ pages, cur, children }: Props<M>) {
  if (!pages) return <>{children(cur, "cur")}</>;
  return (
    <g data-day-slide="">
      {pages.map((p) => (
        <g key={p.key} transform={p.dx ? `translate(${p.dx} 0)` : undefined}>
          {children(p.m, p.role)}
        </g>
      ))}
    </g>
  );
}

/** The same, for the HTML drawn over the chart (the sunrise and sunset chips). */
export function DaySlideHtml<M>({ pages, cur, children }: Props<M>) {
  if (!pages) return <>{children(cur, "cur")}</>;
  return (
    <div data-day-slide="" className="pointer-events-none absolute inset-0">
      {pages.map((p) => (
        <div
          key={p.key}
          className="absolute inset-0"
          style={p.dx ? { transform: `translateX(${p.dx}px)` } : undefined}
        >
          {children(p.m, p.role)}
        </div>
      ))}
    </div>
  );
}
