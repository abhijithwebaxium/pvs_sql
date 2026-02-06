import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.webp'],
  build: {
    assetsInlineLimit: 0, // Don't inline assets, always emit them as files
  },
});
