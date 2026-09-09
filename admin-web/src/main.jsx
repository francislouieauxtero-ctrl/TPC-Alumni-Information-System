// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import { GoogleOAuthProvider } from '@react-oauth/google'
// import './index.css'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <GoogleOAuthProvider clientId="318634063900-h9gtvpjopu0529ooth9uv5sf57dohgjm.apps.googleusercontent.com">
//       <App />
//     </GoogleOAuthProvider>
//   </StrictMode>,
// )

import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { registerSW } from "virtual:pwa-register";
import "./index.css";
import App from "./App.jsx";

async function clearDevelopmentServiceWorker() {
  if (!import.meta.env.DEV || !("serviceWorker" in navigator)) {
    return true;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations.map((registration) => registration.unregister()),
  );

  if ("caches" in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter(
          (cacheName) =>
            cacheName.startsWith("tpc-") || cacheName.startsWith("workbox-"),
        )
        .map((cacheName) => caches.delete(cacheName)),
    );
  }

  if (navigator.serviceWorker.controller) {
    window.location.reload();
    return false;
  }

  return true;
}

// ── PWA Update Toast (no extra library needed) ───────────────────────────────
function UpdateToast({ onUpdate, onDismiss }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#1a3a5c", // tpc-navy
        color: "#f5f0e8", // tpc-cream
        padding: "0.85rem 1.25rem",
        borderRadius: "0.5rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        zIndex: 9999,
        fontSize: "0.9rem",
        whiteSpace: "nowrap",
      }}
    >
      <span>🔄 A new version of TPC AMS is available.</span>
      <button
        onClick={onUpdate}
        style={{
          background: "#c9a84c", // tpc-gold
          color: "#1a3a5c",
          border: "none",
          borderRadius: "0.35rem",
          padding: "0.35rem 0.85rem",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "0.85rem",
        }}
      >
        Update
      </button>
      <button
        onClick={onDismiss}
        style={{
          background: "transparent",
          color: "#f5f0e8",
          border: "1px solid #f5f0e8",
          borderRadius: "0.35rem",
          padding: "0.35rem 0.85rem",
          cursor: "pointer",
          fontSize: "0.85rem",
        }}
      >
        Later
      </button>
    </div>
  );
}

// ── Root wrapper that holds the toast state ───────────────────────────────────
function Root() {
  const [showUpdateToast, setShowUpdateToast] = useState(false);

  const updateSW = import.meta.env.PROD
    ? registerSW({
        onNeedRefresh() {
          setShowUpdateToast(true);
        },
        onOfflineReady() {
          console.log("TPC AMS is ready to work offline.");
        },
        onRegisterError(error) {
          console.error("Service Worker registration failed:", error);
        },
      })
    : () => {};

  return (
    <>
      <GoogleOAuthProvider clientId="318634063900-h9gtvpjopu0529ooth9uv5sf57dohgjm.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>

      {showUpdateToast && (
        <UpdateToast
          onUpdate={() => {
            updateSW(true); // reload with new service worker
            setShowUpdateToast(false);
          }}
          onDismiss={() => setShowUpdateToast(false)}
        />
      )}
    </>
  );
}

// ── Mount ─────────────────────────────────────────────────────────────────────
void clearDevelopmentServiceWorker().then((shouldMount) => {
  if (!shouldMount) {
    return;
  }

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <Root />
    </StrictMode>,
  );
});
