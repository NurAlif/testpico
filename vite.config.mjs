import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
export default defineConfig({
  plugins: [vue()],
  define: { "process.env.NODE_ENV": '"production"', __VUE_OPTIONS_API__: false, __VUE_PROD_DEVTOOLS__: false, __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false },
  build: {
    outDir: "app/static", emptyOutDir: false,
    lib: { entry: "frontend/main.js", formats: ["es"], fileName: () => "ui.js" },
    rollupOptions: { output: { chunkFileNames: "ui-[name]-[hash].js" } },
  },
});
