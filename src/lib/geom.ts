import type { PointerEvent } from "react";

// Everything the SVG sub-components need to place things on screen: the plot
// dimensions/padding, the visible height window, and the coordinate transforms
// between tide space (hours, metres) and pixels.
export type PlotGeom = {
  width: number;
  totalHeight: number;
  plotWidth: number;
  plotHeight: number;
  PAD_L: number;
  PAD_R: number;
  PAD_T: number;
  PAD_B: number;
  Y_MIN: number;
  Y_MAX: number;
  xOfT: (t: number) => number;
  yOfH: (h: number) => number;
  tOfX: (x: number) => number;
  // Convert a pointer event into plot-space (x, y) pixel coordinates.
  pointerToPlot: (e: PointerEvent<SVGElement>) => { x: number; y: number };
};
