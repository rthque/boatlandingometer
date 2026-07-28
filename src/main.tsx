import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

import { getRouter } from "./router";
import "./styles.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Missing <div id="root"> in index.html');

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={getRouter()} />
  </StrictMode>,
);
