import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    // GitHub Pages serves the app from /boatlandingometer/, so the router has
    // to strip that prefix. Vite sets BASE_URL from `base` in vite.config.ts
    // and applies it in dev too, so the dev server mirrors production exactly.
    basepath: import.meta.env.BASE_URL,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
