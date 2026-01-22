import type { Config } from "tailwindcss";
import baseConfig from "@repo/config/tailwind.config";

const config: Config = {
  ...baseConfig,
  darkMode: baseConfig.darkMode as Config["darkMode"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme?.extend,
      fontFamily: {
        ...baseConfig.theme?.extend?.fontFamily,
        // Original font names
        sans: "var(--font-poppins)",
        poppins: "var(--font-poppins)",
        inter: "var(--font-inter)",
        pacifico: "var(--font-pacifico)",
        playfair: "var(--font-playfair)",
        epicgant: ["Epicgant", "sans-serif"],
      },
    },
  },
};

export default config;
