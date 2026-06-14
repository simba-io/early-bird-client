import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  server: {
    port: 8080,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
