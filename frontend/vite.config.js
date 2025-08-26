// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 3000,
    proxy: {
      // כל בקשה שמתחילה ב-/api → תועבר אוטומטית ל-http://127.0.0.1:3031
      "/api": "http://127.0.0.1:3031",
    },
  },
});
