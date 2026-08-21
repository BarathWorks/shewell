import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // The database-backed suites serialise against one schema; running them in
    // parallel would have them truncating each other's tables mid-assertion.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
    reporters: ["verbose"],
  },
});
