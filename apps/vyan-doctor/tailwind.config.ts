import baseConfig from "@repo/config/tailwind.config";

/** @type {import('tailwindcss').Config} */
const config = {
  ...baseConfig,
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme?.extend,
      colors: {
        ...baseConfig.theme?.extend?.colors,
        "surface-variant": "#d3e4fe",
        "on-secondary-container": "#006979",
        "background": "#f8f9ff",
        "primary": "#00898F",
        "on-tertiary-fixed": "#191c1d",
        "tertiary-container": "#56595a",
        "surface-container-high": "#dce9ff",
        "on-secondary-fixed": "#001f26",
        "surface-container-lowest": "#ffffff",
        "surface-container": "#e5eeff",
        "tertiary-fixed-dim": "#c4c7c8",
        "surface-container-low": "#eff4ff",
        "secondary": "#006879",
        "on-surface": "#0b1c30",
        "on-secondary-fixed-variant": "#004e5b",
        "outline": "#71787c",
        "inverse-primary": "#9ccee3",
        "primary-fixed": "#b9eaff",
        "on-primary": "#ffffff",
        "on-tertiary-fixed-variant": "#444748",
        "on-error": "#ffffff",
        "tertiary": "#3e4243",
        "primary-fixed-dim": "#9ccee3",
        "surface-container-highest": "#d3e4fe",
        "on-error-container": "#93000a",
        "error-container": "#ffdad6",
        "surface-dim": "#cbdbf5",
        "surface-bright": "#f8f9ff",
        "inverse-surface": "#213145",
        "on-primary-fixed": "#001f29",
        "on-primary-container": "#a5d7ec",
        "tertiary-fixed": "#e1e3e4",
        "on-surface-variant": "#40484b",
        "primary-container": "#2c5f71",
        "error": "#ba1a1a",
        "inverse-on-surface": "#eaf1ff",
        "secondary-container": "#8be7fe",
        "on-tertiary-container": "#cdd0d1",
        "secondary-fixed-dim": "#77d4ea",
        "on-primary-fixed-variant": "#154d5e",
        "surface-tint": "#326577",
        "surface": "#f8f9ff",
        "on-background": "#0b1c30",
        "outline-variant": "#c0c8cc",
        "secondary-fixed": "#a8edff",
        "brand-teal": "#2c5f71",
        "brand-bg": "#e2f1f1"
      },
      borderRadius: {
        ...baseConfig.theme?.extend?.borderRadius,
        "DEFAULT": "0.25rem",
        "lg": "14px",
        "xl": "14px",
        "full": "9999px"
      },
      spacing: {
        ...baseConfig.theme?.extend?.spacing,
        "sm": "16px",
        "container-max": "1440px",
        "base": "4px",
        "md": "24px",
        "xl": "48px",
        "gutter": "24px",
        "xs": "8px",
        "lg": "32px"
      },
      fontFamily: {
        ...baseConfig.theme?.extend?.fontFamily,
        "headline-md": ["var(--font-hanken)"],
        "headline-sm": ["var(--font-hanken)"],
        "display-lg": ["var(--font-hanken)"],
        "data-mono": ["var(--font-jetbrains)"],
        "label-caps": ["var(--font-sans)"],
        "body-sm": ["var(--font-sans)"],
        "body-md": ["var(--font-sans)"],
        "body-lg": ["var(--font-sans)"]
      },
      fontSize: {
        ...baseConfig.theme?.extend?.fontSize,
        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
        "headline-sm": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
        "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "data-mono": ["13px", { "lineHeight": "18px", "fontWeight": "500" }],
        "label-caps": ["11px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "700" }],
        "body-sm": ["12px", { "lineHeight": "16px", "fontWeight": "400" }],
        "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
        "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }]
      }
    }
  }
};

export default config;