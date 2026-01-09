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
      },
    },
  },
};

export default config;
