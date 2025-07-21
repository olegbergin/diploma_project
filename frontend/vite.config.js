// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // כל בקשה שמתחילה ב-/api → תועבר אוטומטית ל-http://localhost:3030
      "/api": "http://localhost:3030",
    },
  },
});
