import { defineConfig } from "@playwright/test";

export default defineConfig({
  testMatch: "**/*.spec.ts",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5173",
    headless: true,
  },
  webServer: {
    command: "npx vite",
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
