import type { ReactNode } from "react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The edge it comes from: the edge the swipe that opens it starts from. */
  side: "top" | "bottom";
  /** For screen readers, when the content carries no title of its own. */
  title?: string;
  children: ReactNode;
  className?: string;
};

/**
 * A sheet that slides in from the top or the bottom edge — the touch form of
 * the calendar and of the info panel.
 *
 * Pulled in by a swipe, it goes back the way it came: drag it back towards its
 * edge, tap the dimmed chart behind it, or press the phone's Back. The handle
 * on its inner edge is what says it can be dragged, and tapping it closes it
 * too.
 *
 * vaul directly rather than ui/drawer: that one is bottom-only, with its
 * handle hard-wired at the top, and ui/* is not edited by hand. vaul's own
 * body styling is off, because the page already locks its own scroll.
 */
export function Sheet({ open, onOpenChange, side, title, children, className }: Props) {
  const handle = (
    <Drawer.Handle
      className={cn(
        "!h-1.5 !w-12 shrink-0 !rounded-full !bg-muted-foreground/40",
        side === "top" ? "!mt-1 !mb-2" : "!mt-2 !mb-1",
      )}
    />
  );
  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      direction={side}
      shouldScaleBackground={false}
      noBodyStyles
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content
          aria-describedby={undefined}
          className={cn(
            "fixed inset-x-0 z-50 flex flex-col bg-background text-foreground shadow-2xl outline-none",
            side === "top"
              ? "top-0 rounded-b-2xl border-b border-border pt-[env(safe-area-inset-top)]"
              : "bottom-0 max-h-[88dvh] rounded-t-2xl border-t border-border pb-[env(safe-area-inset-bottom)]",
            className,
          )}
        >
          {side === "bottom" && handle}
          {title && <Drawer.Title className="sr-only">{title}</Drawer.Title>}
          {children}
          {side === "top" && handle}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
