import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import { RouterProvider } from "@/app/router/RouterProvider";
import { MusicProviderProvider } from "@/app/providers/MusicProviderProvider";
import "@/styles/globals.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root was not found in index.html");
}

createRoot(rootElement).render(
  <StrictMode>
    <MusicProviderProvider>
      <RouterProvider>
        <App />
      </RouterProvider>
    </MusicProviderProvider>
  </StrictMode>,
);
