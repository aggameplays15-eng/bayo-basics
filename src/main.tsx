import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";

// Enregistrement du Service Worker pour la PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW enregistré avec succès:', registration.scope);
      })
      .catch(error => {
        console.log('Échec de l\'enregistrement du SW:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);