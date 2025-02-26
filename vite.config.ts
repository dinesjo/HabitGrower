import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    host: true,
    hmr: {
      host: "localhost",
    },
  },
  plugins: [
    react(),
    mkcert(),
    VitePWA({
      devOptions: {
        enabled: true,
      },
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
    }),
  ],
});
