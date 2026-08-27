import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    // Taken from Vite's `base` rather than hardcoded, so the router follows the
    // deployment instead of having to be kept in step with it. On the apex
    // domain that is "/"; a sub-path build (VITE_BASE) gets its prefix stripped
    // here. Vite applies `base` in dev too, so the dev server mirrors
    // production exactly.
    basepath: import.meta.env.BASE_URL,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
