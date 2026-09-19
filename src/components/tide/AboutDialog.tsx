import { useRef } from "react";
import { InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import incidentClip from "@/assets/splash-zone-incident.mp4";

/**
 * The "what is this for" button and its panel.
 *
 * Deliberately an icon at the end of the control stack rather than anything
 * louder: someone who already knows what the app does should never have to look
 * at it.
 */
export function AboutDialog() {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-8 bg-background/90 backdrop-blur-sm"
          aria-label="What this app is for"
          title="What this app is for"
        >
          <InfoIcon className="size-4" />
        </Button>
      </DialogTrigger>

      <DialogContent
        ref={contentRef}
        tabIndex={-1}
        // Radix focuses the first tabbable child on open, which here is the
        // video. Landing on the panel instead keeps the focus ring off the
        // player and keeps Escape unambiguous; Tab still reaches the controls.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          contentRef.current?.focus();
        }}
        className="max-h-[85dvh] max-w-2xl overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>What Boatlandingometer is for</DialogTitle>
          <DialogDescription>
            Reading a working window off the structure, not off a table of tide times.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            It draws the Dieppe tide against the jacket and its boat landing at the same scale, so
            the water level you are planning around is a line on the structure rather than a number
            on a page.
          </p>
          <p>Use it to judge:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>when the tether line clamp is clear of the water long enough to be rigged</li>
            <li>when the splash zone is workable, and for how long</li>
            <li>
              how much time a repair has before the tide comes back to the height of the damage —
              the intervention itself plus the drying the coating needs
            </li>
          </ul>
          <p className="text-muted-foreground">
            Drag the red line to any height, or use the presets. WC59 puts the CTV against the
            landing at that water level, and Time-lapse runs a full day in twelve seconds.
          </p>
        </div>

        <div className="space-y-2 border-t border-border pt-4">
          <h3 className="text-sm font-semibold">Why the window matters</h3>
          <p className="text-sm text-muted-foreground">
            A rope access technician caught by a wave in the splash zone. Anticipating the window is
            what keeps a job from ending like this.
          </p>
          {/* No aspect ratio declared: the file carries its own (368x640), and
              the height cap is the only thing stopping a portrait clip from
              filling the panel. playsInline matters — without it iOS hijacks
              the tap into its own fullscreen player. */}
          <video
            src={incidentClip}
            controls
            playsInline
            preload="metadata"
            className="mx-auto max-h-[60dvh] w-auto rounded-md border border-border bg-black"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
