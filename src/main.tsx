import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ColorSchemeScript } from "@mantine/core";
import App from "./App.tsx";
import { COLOR_SCHEME_STORAGE_KEY } from "./constants";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <>
      <ColorSchemeScript
        defaultColorScheme="light"
        localStorageKey={COLOR_SCHEME_STORAGE_KEY}
      />
      <App />
    </>
  </StrictMode>,
);
