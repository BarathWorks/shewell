import type { Config } from "tailwindcss";
import baseConfig from "@repo/config/tailwind.config";

/**
 * Practitioner app design system.
 *
 * Scoped to this app. Tailwind resolves colour names against the *consuming*
 * app's config and this app compiles `packages/ui` into its own build, so
 * redefining `primary`, `slate`, `gray` and `black` here restyles the shared
 * `@repo/ui` components as they appear in the practitioner app without editing
 * that package and without affecting vyan-client, which has its own config.
 *
 * This file previously read `module.exports = require('@repo/config/tailwind.config')`
 * — the base config verbatim, no overrides at all.
 */

/** Clinical blue-grey, running light to dark in the conventional order. */
const neutral = {
  50: "#F7F9FB",
  100: "#EFF3F7",
  200: "#DFE7ED",
  300: "#C6D3DD",
  400: "#9BADBC",
  500: "#71889B",
  600: "#546A7C",
  700: "#3E5162",
  800: "#2A3846",
  900: "#18242F",
  950: "#0D161E",
};

const teal = {
  50: "#EDF7F8",
  100: "#D2ECEE",
  200: "#A6D9DE",
  300: "#71C0C7",
  400: "#38A3AC",
  500: "#00898F",
  600: "#03737A",
  700: "#0A5C61",
  800: "#0D494D",
  900: "#0E3C3F",
  950: "#062629",
};

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

      colors: {
        ...baseConfig.theme?.extend?.colors,

        primary: { ...teal, DEFAULT: "#00898F", foreground: "#FFFFFF" },
        secondary: {
          50: "#ECF8F1",
          100: "#CFEDDD",
          200: "#A2DBBE",
          300: "#6AC298",
          400: "#2FA771",
          500: "#008F4E",
          600: "#037A43",
          700: "#086237",
          800: "#0A4E2D",
          900: "#0B4027",
          DEFAULT: "#008F4E",
          foreground: "#FFFFFF",
        },

        // `slate` and `gray` alias one scale so the two can never disagree. The
        // base config had redefined `gray-100` as `#64748B` and `gray-200` as
        // `#4D4D4D` — a mid-slate and a near-black in the slots a ramp reserves
        // for its lightest tints, which is why panels and borders read heavy.
        slate: neutral,
        gray: neutral,
        neutral,

        black: "#0D161E",

        canvas: "#F7F9FB",
        surface: "#FFFFFF",
        "surface-sunken": "#EFF3F7",
        ink: "#18242F",
        body: "#3E5162",
        muted: "#71889B",
        hairline: "#DFE7ED",
        "hairline-strong": "#C6D3DD",

        danger: {
          50: "#FDF2F2",
          100: "#FBE0E0",
          500: "#D14343",
          600: "#B93636",
          700: "#992D2D",
          DEFAULT: "#D14343",
          foreground: "#FFFFFF",
        },
        warning: {
          50: "#FFF8EC",
          100: "#FDECCC",
          500: "#C77700",
          600: "#A66200",
          DEFAULT: "#C77700",
          foreground: "#FFFFFF",
        },
        success: {
          50: "#ECF8F1",
          100: "#CFEDDD",
          500: "#008F4E",
          600: "#037A43",
          DEFAULT: "#008F4E",
          foreground: "#FFFFFF",
        },
        info: {
          50: "#EEF4FC",
          100: "#D6E4F7",
          500: "#2C6BB8",
          600: "#23579A",
          DEFAULT: "#2C6BB8",
          foreground: "#FFFFFF",
        },

        /**
         * Categorical series for charts.
         *
         * A fixed, ordered set so a slice keeps its colour between renders and
         * between charts. The previous charts picked colours per dataset —
         * `#008F4E`, `#2563EB`, `#67E8F9`, `#0EA5E9` in one and a different four
         * in the next — so the same category was a different colour depending on
         * which chart you looked at.
         */
        chart: {
          1: "#00898F",
          2: "#2C6BB8",
          3: "#008F4E",
          4: "#C77700",
          5: "#7C5CBF",
          6: "#B0566F",
        },
      },

      fontFamily: {
        ...baseConfig.theme?.extend?.fontFamily,
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        inter: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        poppins: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        // Tabular figures for anything that has to line up in a column.
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },

      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.02em" }],
        xs: ["0.75rem", { lineHeight: "1.125rem" }],
        sm: ["0.8125rem", { lineHeight: "1.25rem" }],
        base: ["0.9375rem", { lineHeight: "1.6" }],
        lg: ["1.0625rem", { lineHeight: "1.6" }],
        xl: ["1.25rem", { lineHeight: "1.45", letterSpacing: "-0.01em" }],
        "2xl": ["1.5rem", { lineHeight: "1.35", letterSpacing: "-0.015em" }],
        "3xl": ["1.875rem", { lineHeight: "1.25", letterSpacing: "-0.018em" }],
        "4xl": ["2.25rem", { lineHeight: "1.18", letterSpacing: "-0.02em" }],
        "5xl": ["2.75rem", { lineHeight: "1.12", letterSpacing: "-0.022em" }],
      },

      borderRadius: {
        none: "0",
        sm: "0.25rem",
        DEFAULT: "0.375rem",
        md: "0.5rem",
        lg: "0.625rem",
        xl: "0.875rem",
        "2xl": "1.125rem",
        "3xl": "1.5rem",
        full: "9999px",
      },

      boxShadow: {
        xs: "0 1px 2px 0 rgb(13 22 30 / 0.04)",
        sm: "0 1px 3px 0 rgb(13 22 30 / 0.06), 0 1px 2px -1px rgb(13 22 30 / 0.04)",
        DEFAULT:
          "0 2px 6px -1px rgb(13 22 30 / 0.07), 0 1px 3px -1px rgb(13 22 30 / 0.05)",
        md: "0 6px 16px -4px rgb(13 22 30 / 0.09), 0 2px 6px -2px rgb(13 22 30 / 0.05)",
        lg: "0 14px 32px -8px rgb(13 22 30 / 0.12), 0 4px 10px -4px rgb(13 22 30 / 0.06)",
        xl: "0 24px 56px -16px rgb(13 22 30 / 0.16), 0 8px 18px -8px rgb(13 22 30 / 0.08)",
        none: "none",
        control: "inset 0 1px 2px 0 rgb(13 22 30 / 0.04)",
        focus: "0 0 0 3px rgb(0 137 143 / 0.18)",
      },

      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.2, 0, 0, 1)",
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
      },

      keyframes: {
        ...(baseConfig.theme?.extend as Record<string, unknown>)?.keyframes as object,
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: {
        ...(baseConfig.theme?.extend as Record<string, unknown>)?.animation as object,
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
};

export default config;
