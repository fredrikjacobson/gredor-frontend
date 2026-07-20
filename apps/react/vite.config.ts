import { execSync } from "node:child_process";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
  define: {
    __APP_VERSION__: appVersion,
  },
  plugins: [react()],
  resolve: {
    // Samma reserverade domän-prefix som Vue-appen: de matchas före "@" → ./src.
    alias: [
      { find: "@/framework", replacement: domainSrc("framework") },
      { find: "@/util", replacement: domainSrc("util") },
      { find: "@/model", replacement: domainSrc("model") },
      { find: "@/data", replacement: domainSrc("data") },
      { find: "@/templates", replacement: domainSrc("templates") },
      { find: "@/api/schema", replacement: domainSrc("api/schema") },
      { find: "@", replacement: fileURLToPath(new URL("./src", import.meta.url)) },
    ],
  },
});
