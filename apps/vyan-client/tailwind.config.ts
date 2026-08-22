import type { Config } from "tailwindcss";
import baseConfig from "@repo/config/tailwind.config";

/**
 * Client app design system.
 *
 * Everything here is scoped to this app. Tailwind resolves colour names against the
 * *consuming* app's config, and this app compiles `packages/ui` into its own build
 * (see `content` below and `transpilePackages` in next.config.js). So redefining
 * `primary`, `slate`, `gray` and `black` here restyles the shared `@repo/ui`
 * components as they appear in the client — without editing that package and
 * without affecting vyan-doctor, which compiles the same components against its own
 * config.
 */

/**
 * Clinical blue-grey. The neutral that carries almost all of the interface.
 *
 * The shared base config redefined `gray-100` as `#64748B` and `gray-200` as
 * `#4D4D4D` — a mid-slate and a near-black, in the two slots a ramp reserves for
 * its lightest tints. `bg-gray-100` (37 uses) and `border-gray-200` (50 uses) were
 * therefore painting solid mid-grey panels and heavy dark rules where light ones
 * were intended, which is most of why the app read as muddy. The ramp below runs
 * light to dark in the conventional order.
 */
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

/** The brand teal, extended into a full ramp with accessible dark steps. */
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

        // Brand.
        primary: {
          ...teal,
          DEFAULT: "#00898F",
          foreground: "#FFFFFF",
        },
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

        // The neutral ramp, under every name the codebase already reaches for.
        // `slate` and `gray` are aliases of one scale so the two never disagree.
        slate: neutral,
        gray: neutral,
        neutral,

        // Not pure black. `bg-black` and `text-black` appear ~106 times across the
        // client and the shared components; at #000 against a white page that is a
        // harsher contrast than a clinical interface wants.
        black: "#0D161E",

        // Semantic aliases. New work should reach for these rather than a numbered
        // step, so intent survives a future palette change.
        canvas: "#F7F9FB",
        surface: "#FFFFFF",
        "surface-sunken": "#EFF3F7",
        ink: "#18242F",
        body: "#3E5162",
        muted: "#71889B",
        hairline: "#DFE7ED",
        "hairline-strong": "#C6D3DD",

        // Status. Clinical rather than saturated.
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
      },

      fontFamily: {
        ...baseConfig.theme?.extend?.fontFamily,
        // One typeface for the whole interface.
        //
        // Inter is the face this kind of product wants: a neutral grotesk with a
        // tall x-height that stays legible at 13-14px in dense clinical layouts.
        // Poppins is geometric and rounded — friendly, but it reads soft at small
        // sizes and it is what made dense screens here feel informal.
        //
        // `font-poppins` appears in 183 places, so rather than churn every one of
        // them the alias now resolves to the same stack. The utility name is
        // historical; the rendered face is Inter everywhere.
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        poppins: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        inter: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        // Kept for the one decorative heading that uses it.
        epicgant: ["Epicgant", "ui-serif", "serif"],
        "amatic-sc": "var(--font-amatic-sc)",
      },

      fontSize: {
        // Paired with line-heights and tracking so headings do not need three
        // extra utilities each to look right.
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
        "6xl": ["3.25rem", { lineHeight: "1.08", letterSpacing: "-0.024em" }],
        "7xl": ["4rem", { lineHeight: "1.04", letterSpacing: "-0.026em" }],
      },

      borderRadius: {
        ...(baseConfig.theme?.extend as Record<string, unknown>)?.borderRadius as object,
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
        // Two steps, both restrained. Depth in a clinical interface comes from
        // hairlines and spacing; shadow is for things that genuinely float.
        xs: "0 1px 2px 0 rgb(13 22 30 / 0.04)",
        sm: "0 1px 3px 0 rgb(13 22 30 / 0.06), 0 1px 2px -1px rgb(13 22 30 / 0.04)",
        DEFAULT: "0 2px 6px -1px rgb(13 22 30 / 0.07), 0 1px 3px -1px rgb(13 22 30 / 0.05)",
        md: "0 6px 16px -4px rgb(13 22 30 / 0.09), 0 2px 6px -2px rgb(13 22 30 / 0.05)",
        lg: "0 14px 32px -8px rgb(13 22 30 / 0.12), 0 4px 10px -4px rgb(13 22 30 / 0.06)",
        xl: "0 24px 56px -16px rgb(13 22 30 / 0.16), 0 8px 18px -8px rgb(13 22 30 / 0.08)",
        none: "none",
        // For inputs and controls at rest.
        control: "inset 0 1px 2px 0 rgb(13 22 30 / 0.04)",
        // Focus ring drawn as a shadow so it never shifts layout.
        focus: "0 0 0 3px rgb(0 137 143 / 0.18)",
      },

      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.2, 0, 0, 1)",
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
      },

      maxWidth: {
        prose: "68ch",
        content: "76rem",
      },

      keyframes: {
        ...(baseConfig.theme?.extend as Record<string, unknown>)?.keyframes as object,
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        ...(baseConfig.theme?.extend as Record<string, unknown>)?.animation as object,
        "fade-up": "fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
};

export default config;
