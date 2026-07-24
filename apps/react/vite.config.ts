import { execSync } from "node:child_process";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";

const appVersion = JSON.stringify(
  (process.env.npm_package_version ?? "0.0.0") +
    "-" +
    execSync("git rev-parse --short HEAD").toString().trim(),
);

// Sökväg till en undermapp i det delade domänpaketet (@gredor/domain).
function domainSrc(subPath: string): string {
  return fileURLToPath(
    new URL(`../../packages/domain/src/${subPath}`, import.meta.url),
  );
}

// https://vite.dev/config/
export default defineConfig({
  // Fast port: både .claude/launch.json och Playwright (baseURL + webServer)
  // pekar på 5176. Utan strictPort valde Vite närmsta lediga port (5173 när
  // Vue-appen inte körde) och e2e-körningen väntade förgäves på 5176.
  server: { port: 5176, strictPort: true },
  define: {
    __APP_VERSION__: appVersion,
  },
  plugins: [
    // Måste ligga före react() för fil-baserad routing (routeTree.gen.ts).
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    // Samma reserverade domän-prefix som Vue-appen: de matchas före "@" → ./src.
    alias: [
      { find: "@/framework", replacement: domainSrc("framework") },
      { find: "@/util", replacement: domainSrc("util") },
      { find: "@/model", replacement: domainSrc("model") },
      { find: "@/data", replacement: domainSrc("data") },
      { find: "@/templates", replacement: domainSrc("templates") },
      { find: "@/api/schema", replacement: domainSrc("api/schema") },
      // Samma typsnitt som Vue-appen (repo-rotens public/fonts). Importeras som
      // modul (ej statisk public-fil) så Vite processar @font-face + url() och
      // taggar stilmallen med data-vite-dev-id → CSS-insamlaren hittar dem.
      {
        find: "$fonts",
        replacement: fileURLToPath(
          new URL("../../public/fonts", import.meta.url),
        ),
      },
      { find: "@", replacement: fileURLToPath(new URL("./src", import.meta.url)) },
    ],
  },
});
