import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/global.css";
import "./styles/sections.css";
import "./styles/work.css";
import "./styles/backdrop.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
