import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy /api/* to the Express backend — preserves the /api prefix
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      // Proxy Socket.IO traffic (HTTP + WebSocket upgrade)
      "/socket.io": {
        target: "http://localhost:3001",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        // Granular chunk splitting gives browsers better long-term cache hits:
        // each vendor chunk only busts when that specific dependency changes.
        manualChunks: {
          // Core React runtime — almost never changes
          react: ["react", "react-dom"],
          // Router — changes occasionally
          router: ["react-router-dom"],
          // Data-fetching — may update with the app
          query: ["@tanstack/react-query"],
          // Animation — large, changes rarely
          motion: ["framer-motion"],
          // Drag-and-drop — large, changes rarely
          dnd: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
          // Charts — large, only used in AnalyticsPage
          charts: ["recharts"],
          // Rich-text editor — large, only used in card detail
          // (@tiptap/pm omitted: its package.json lacks a root "." export)
          editor: ["@tiptap/react", "@tiptap/starter-kit"],
          // Spreadsheet export — large, only used in members export
          xlsx: ["xlsx"],
          // Calendar — large, only used in BoardCalendarView
          calendar: ["react-big-calendar"],
        },
        // Use content hash for cache busting
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
})
