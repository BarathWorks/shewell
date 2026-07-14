/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "on-secondary": "#ffffff",
        "secondary-fixed-dim": "#77d4ea",
        "tertiary": "#3e4243",
        "inverse-on-surface": "#eaf1ff",
        "surface-container": "#e5eeff",
        "on-secondary-fixed": "#001f26",
        "inverse-primary": "#9ccee3",
        "error-container": "#ffdad6",
        "tertiary-container": "#56595a",
        "surface-tint": "#00898f",
        "on-surface": "#0b1c30",
        "on-error-container": "#93000a",
        "on-primary-fixed": "#001f29",
        "surface-variant": "#d3e4fe",
        "primary": "#00898f",
        "on-primary-container": "#a5d7ec",
        "on-tertiary-fixed-variant": "#444748",
        "error": "#ba1a1a",
        "on-surface-variant": "#40484b",
        "on-background": "#0b1c30",
        "secondary-container": "#8be7fe",
        "primary-fixed-dim": "#9ccee3",
        "on-secondary-fixed-variant": "#004e5b",
        "background": "#f8f9ff",
        "tertiary-fixed-dim": "#c4c7c8",
        "surface-dim": "#cbdbf5",
        "surface-container-low": "#eff4ff",
        "surface-container-highest": "#d3e4fe",
        "surface-container-high": "#dce9ff",
        "on-primary-fixed-variant": "#154d5e",
        "primary-container": "#00898f",
        "tertiary-fixed": "#e1e3e4",
        "secondary": "#006879",
        "outline-variant": "#c0c8cc",
        "on-secondary-container": "#006979",
        "inverse-surface": "#213145",
        "surface": "#f8f9ff",
        "primary-fixed": "#b9eaff",
        "on-tertiary-fixed": "#191c1d",
        "surface-bright": "#f8f9ff",
        "outline": "#71787c",
        "on-tertiary": "#ffffff"
      },
      borderRadius: {
        "DEFAULT": "8px",
        "lg": "8px",
        "xl": "8px",
        "full": "9999px"
      },
      spacing: {
        "sm": "16px",
        "gutter": "24px",
        "base": "4px",
        "container-max": "1440px",
        "md": "24px",
        "xs": "8px",
        "xl": "48px",
        "lg": "32px"
      },
      fontFamily: {
        "body-md": ["Inter"],
        "data-mono": ["JetBrains Mono"],
        "body-sm": ["Inter"],
        "label-caps": ["Inter"],
        "display-lg": ["Hanken Grotesk"],
        "headline-sm": ["Hanken Grotesk"],
        "body-lg": ["Inter"],
        "headline-md": ["Hanken Grotesk"]
      },
      fontSize: {
        "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
        "data-mono": ["13px", {"lineHeight": "18px", "fontWeight": "500"}],
        "body-sm": ["12px", {"lineHeight": "16px", "fontWeight": "400"}],
        "label-caps": ["11px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "700"}],
        "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "headline-sm": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
        "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
        "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}]
      }
    }
  },
  plugins: [],
}
