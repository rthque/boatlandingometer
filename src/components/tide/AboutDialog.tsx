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

// The incident clip stays on Google Drive rather than being committed here: it
// is the one asset in this app that isn't ours to re-encode, and a video would
// dwarf every other file in the repo.
//
// It only plays for a visitor if the file's sharing is set to "Anyone with the
// link — Viewer". Left restricted to an account, Google serves a sign-in wall
// inside the iframe instead of the player, which is why the plain link sits
// underneath as a way out. This is also the one thing on the page that reaches
// a third party; everything else is served from our own origin.
const INCIDENT_VIDEO_ID = "11Ah42gQkb8zuc6EdlBskIq9bVLdkcVJW";
const INCIDENT_VIDEO_URL = `https://drive.google.com/file/d/${INCIDENT_VIDEO_ID}/view`;
const INCIDENT_VIDEO_EMBED = `https://drive.google.com/file/d/${INCIDENT_VIDEO_ID}/preview`;

/**
 * The "what is this for" button and its panel.
 *
 * Deliberately an icon at the end of the control stack rather than anything
 * louder: someone who already knows what the app does should never have to look
 * at it. The dialog only mounts its contents when open, so the Drive iframe is
 * not fetched for the people who never press it.
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
        // On open, Radix focuses the first tabbable child — which here is the
        // Drive iframe. Focus inside a cross-origin frame means the Escape key
        // is delivered to Google's document and never reaches the handler that
        // closes this, so a keyboard user has no way out. Put the focus on the
        // panel itself instead; Tab still walks into the player for anyone who
        // wants it.
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
          <div className="aspect-video w-full overflow-hidden rounded-md border border-border bg-muted">
            <iframe
              src={INCIDENT_VIDEO_EMBED}
              title="Rope access technician struck by a wave in the splash zone"
              className="h-full w-full"
              allowFullScreen
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Hosted on Google Drive —{" "}
            <a
              href={INCIDENT_VIDEO_URL}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              open it there
            </a>{" "}
            if the player above does not load.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
