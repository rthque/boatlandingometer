import { useEffect, useRef } from "react";

/**
 * The phone's Back closes an open sheet instead of leaving the site.
 *
 * Opening pushes a history entry with the same URL; Back pops it, and the pop
 * closes the sheet. Closed any other way — dragged off, the backdrop tapped, a
 * day picked — the entry is popped for it, so history is back where it was and
 * the next Back leaves the page as it always did. Without this, Back from a
 * sheet opened off a WhatsApp link went straight back to the chat.
 *
 * Only for the touch sheets: the desktop popover and dialog keep Escape.
 */
export function useBackCloses(open: boolean, close: () => void, enabled: boolean) {
  const pushed = useRef(false);
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });

  useEffect(() => {
    if (!enabled) return;
    if (open && !pushed.current) {
      // Keep whatever the router stored in the entry, so popping back to it
      // looks to the router like the page it already shows.
      window.history.pushState({ ...window.history.state, bloSheet: true }, "");
      pushed.current = true;
    }
    if (!open && pushed.current) {
      pushed.current = false;
      if (window.history.state?.bloSheet) window.history.back();
    }
    if (!open) return;
    const onPop = () => {
      if (!pushed.current) return;
      pushed.current = false;
      closeRef.current();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [open, enabled]);
}
