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
    spaFallback(),
  ],
  build: {
    // The tide constituents and the schema PNGs are large but static; don't
    // warn about them on every build.
    chunkSizeWarningLimit: 1500,
  },
});
