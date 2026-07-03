import type { ViewId } from "@/lib/views";

const VIEW_IDS: ViewId[] = ["FOU", "BL", "IRL"];

// The FOU / BL / IRL schema switcher, centered at the top on wider screens.
export function ViewSwitcher({ view, setView }: { view: ViewId; setView: (v: ViewId) => void }) {
  return (
    <div className="absolute top-2 left-2 z-30 sm:left-1/2 sm:-translate-x-1/2">
      <div className="inline-flex rounded-md border border-border bg-background/90 backdrop-blur-sm overflow-hidden">
        {VIEW_IDS.map((id) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`px-3 py-1 text-xs font-semibold transition-colors ${
              view === id ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            }`}
          >
            {id}
          </button>
        ))}
      </div>
    </div>
  );
}
