import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

function devServiceWorkerKillerPlugin() {
  const killerScript = `
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => clients.forEach((c) => c.navigate(c.url)))
  );
});
`;
  return {
    name: "dev-sw-killer",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const cleanUrl = (req.url || "").split("?")[0];
        if (cleanUrl === "/sw.js" || cleanUrl === "/registerSW.js" || cleanUrl.endsWith("/sw.js")) {
          res.setHeader("Content-Type", "application/javascript; charset=utf-8");
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
          res.end(killerScript);
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    devServiceWorkerKillerPlugin(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "TPC Alumni Management System",
        short_name: "TPC AMS",
        description: "Talibon Polytechnic College Alumni Management System",
        theme_color: "#1a3a5c",
        background_color: "#f5f0e8",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/icons/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "/screenshots/desktop.png",
            sizes: "1920x970",
            type: "image/png",
            form_factor: "wide",
            label: "TPC AMS Dashboard",
          },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//, /^\/storage\//],
        runtimeCaching: [
          {
            urlPattern: /^\/api\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "tpc-api-cache",
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:js|css|woff2|png|svg|ico)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "tpc-static-cache",
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    allowedHosts: true,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
    watch: {
      usePolling: true,
      interval: 300,
    },
    proxy: {
      "/api": {
        target: process.env.VITE_BACKEND_PROXY_URL || "http://localhost:8070",
        changeOrigin: true,
      },
      "/storage": {
        target: process.env.VITE_BACKEND_PROXY_URL || "http://localhost:8070",
        changeOrigin: true,
      },
    },
  },
});
