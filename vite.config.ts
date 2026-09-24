import { copyFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// GitHub Pages has no SPA rewrite rule: any URL that isn't a real file 404s.
// Serving a copy of index.html as 404.html hands those requests to the router,
// which then resolves them client-side.
function spaFallback(): Plugin {
  return {
    name: "spa-fallback-404",
    apply: "build",
    closeBundle() {
      const dist = resolve(import.meta.dirname, "dist");
      copyFileSync(resolve(dist, "index.html"), resolve(dist, "404.html"));
    },
  };
}

/**
 * Marks a build as something other than the live site.
 *
 * Set VITE_BUILD_LABEL and the page gets a robots noindex tag and a prefixed
 * title; the app itself renders a badge off the same variable. Leave it unset —
 * which the root build always does — and this plugin does nothing at all, so
 * the site the crews use is byte-for-byte what it was.
 *
 * noindex lives in the HTML rather than in a robots.txt on purpose. A
 * robots.txt only works at the site root, so it would mean editing the root
 * build to describe a sub-site; and Disallow only stops crawling, not
 * indexing — a disallowed URL can still be listed from a link elsewhere. The
 * meta tag is the thing that actually keeps a page out of the index.
 */
function buildLabel(): Plugin {
  const label = process.env.VITE_BUILD_LABEL;
  return {
    name: "build-label",
    apply: "build",
    transformIndexHtml(html) {
      if (!label) return html;
      return html
        .replace("<head>", `<head>\n    <meta name="robots" content="noindex, nofollow" />`)
        .replace(/<title>([^<]*)<\/title>/, `<title>[${label}] $1</title>`);
    },
  };
}

// Static single-page app. It is served from the apex of its own domain
// (https://boatlandingometer.info/), so `base` is the root.
//
// This has to agree with the custom domain in the repo's Pages settings, which
// is what actually puts the site on that domain — not public/CNAME, which the
// Actions-based Pages source ignores. Drop the domain there and the site falls
// back to a /boatlandingometer/ sub-path, where a root `base` 404s every asset.
//
// Override with VITE_BASE=/sub/ to build for a host that does serve the app
// from a sub-path, the way github.io did before the domain existed.
export default defineConfig({
  base: process.env.VITE_BASE ?? "/",
  plugins: [
    // Must run before the React plugin — it generates src/routeTree.gen.ts
    // from the files in src/routes.
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    tsConfigPaths(),
    buildLabel(),
    spaFallback(),
  ],
  build: {
    // The tide constituents and the schema PNGs are large but static; don't
    // warn about them on every build.
    chunkSizeWarningLimit: 1500,
  },
});
