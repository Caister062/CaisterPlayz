import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";

import "./index.css";
import App from "./App.jsx";

// Auto-update PWA
registerSW({
  immediate: true,
  onOfflineReady() {
    console.log("CaisterPlayz is ready to work offline.");
  },
  onNeedRefresh() {
    console.log("New version available.");
  }
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
