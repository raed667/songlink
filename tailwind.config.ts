import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    textColor: {
      default: "#020617",
    },
    extend: {
      fontSize: {
        "2xs": ".6875rem",
      },
      fontFamily: {
        sans: "var(--font-inter)",
        display: "var(--font-inter)",
      },
      opacity: {
        2.5: "0.025",
        7.5: "0.075",
        15: "0.15",
      },
    },
  },
  plugins: [],
};
export default config;
