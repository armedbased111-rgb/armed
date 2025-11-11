// apps/web/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Gestionnaire d'erreur global pour ignorer les erreurs non critiques des extensions de navigateur
// Ces erreurs proviennent généralement de gestionnaires de mots de passe ou d'autocomplétion
window.addEventListener("error", (event) => {
  const message = event.message || "";
  const filename = event.filename || "";
  
  // Ignorer uniquement les erreurs spécifiques des extensions de navigateur
  if (
    (message.includes("content_script") || filename.includes("content_script.js")) &&
    (message.includes("Cannot read properties of undefined") || 
     message.includes("reading 'control'") ||
     message.includes("reading 'form'"))
  ) {
    event.preventDefault();
    // Ne pas logger en production pour éviter le bruit
    if (import.meta.env.DEV) {
      console.debug("Erreur d'extension de navigateur ignorée (non critique)");
    }
    return false;
  }
});

// Gestionnaire pour les promesses rejetées non gérées provenant d'extensions
window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  const message = reason?.message || "";
  const stack = reason?.stack || "";
  
  if (
    (message.includes("content_script") || stack.includes("content_script.js")) &&
    (message.includes("Cannot read properties of undefined") ||
     message.includes("reading 'control'"))
  ) {
    event.preventDefault();
    if (import.meta.env.DEV) {
      console.debug("Promesse rejetée d'extension ignorée (non critique)");
    }
    return false;
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
        <App />
    </BrowserRouter>
  </React.StrictMode>
);
