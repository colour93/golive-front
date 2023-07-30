import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";

export default defineConfig({
  build: {
    outDir: "../golive/static",
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:9889/api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/live": {
        target: "http://localhost:9889/live",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/live/, ""),
      },
      ws: {
        target: "http://localhost:9889/ws",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ws/, ""),
        ws: true,
      },
    },
    host: "0.0.0.0",
  },
  plugins: [
    vue(),
    AutoImport({
      imports: [
        "vue",
        {
          "naive-ui": [
            "useDialog",
            "useMessage",
            "useNotification",
            "useLoadingBar",
          ],
        },
      ],
    }),
    Components({
      resolvers: [NaiveUiResolver()],
    }),
  ],
});
