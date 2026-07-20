import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  define: {
    // configUtils.ts refererar __APP_VERSION__; ge det ett värde i tester.
    __APP_VERSION__: JSON.stringify("test"),
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // Node som standard. Tester som behöver en DOM (t.ex. documentUtils)
    // väljer happy-dom per fil med en docblock: // @vitest-environment happy-dom
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.d.ts", "src/**/*.test.ts"],
    },
  },
});
