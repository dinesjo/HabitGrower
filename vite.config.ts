import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ command, mode }) => {
  const localDemo = mode === "local-demo";
  if (localDemo && command === "build") {
    throw new Error("Local demo mode is development-only. Use npm run dev:local; deploy with npm run build.");
  }

  return {
    server: {
      host: localDemo ? "127.0.0.1" : true,
      ...(localDemo ? {
        port: 5174,
        strictPort: true,
        headers: {
          "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ws://127.0.0.1:5174 ws://localhost:5174; frame-src 'none'; worker-src 'none'; form-action 'self'; base-uri 'self'",
        },
      } : { hmr: {
        host: "localhost",
      } }),
    },
    plugins: [
      react(),
      ...(localDemo ? [{
        name: "local-demo-html",
        transformIndexHtml(html: string) {
          // Use the existing system-font fallbacks without Google Fonts requests.
          return html.replace(/<link\b[^>]*https:\/\/fonts\.(?:googleapis|gstatic)\.com[^>]*>/g, "");
        },
      }] : [mkcert(), VitePWA({
        registerType: 'autoUpdate',
        injectRegister: false,  // Completely disable auto-registration
        selfDestroying: true,   // Unregister any existing service worker
        manifest: {
          name: "HabitGrower",
          short_name: "HabitGrower",
          description: "Grow your habits!",
          theme_color: "#478523",
          background_color: "#101e26",
          icons: [
            {
              src: "pwa-maskable-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "pwa-maskable-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "pwa-maskable-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "pwa-maskable-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
      })]),
    ],
  };
});
