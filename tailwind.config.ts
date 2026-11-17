import type { Config } from "tailwindcss";

const brandBlueScale = {
    DEFAULT: "#01b0ef",
    50: "#eefaff",
    100: "#d6f3ff",
    200: "#b5e9ff",
    300: "#82daff",
    400: "#47c6ff",
    500: "#01b0ef",
    600: "#0098d4",
    700: "#007bb0",
    800: "#005c85",
    900: "#004666",
    950: "#002d42",
};

const brandYellowScale = {
    DEFAULT: "#fdb913",
    50: "#fff9e7",
    100: "#fef1c4",
    200: "#fde28a",
    300: "#fdcf4d",
    400: "#fdc228",
    500: "#fdb913",
    600: "#e09b05",
    700: "#b87904",
    800: "#915d08",
    900: "#754b0b",
    950: "#452902",
};

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: brandBlueScale,
                secondary: brandYellowScale,
                blue: brandBlueScale,
                sky: brandBlueScale,
                indigo: brandBlueScale,
                amber: brandYellowScale,
                yellow: brandYellowScale,
                gold: {
                    400: "#fdc228",
                    500: "#fdb913",
                    600: "#e09b05",
                },
            },
            fontFamily: {
                sans: ["'Plus Jakarta Sans'", "system-ui", "-apple-system", "sans-serif"],
                heading: ["'Outfit'", "'Plus Jakarta Sans'", "system-ui", "sans-serif"],
                mono: ["'JetBrains Mono'", "monospace"],
            },
            boxShadow: {
                "civic-sm": "0 1px 3px 0 rgba(1, 176, 239, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)",
                "civic": "0 6px 22px -4px rgba(1, 176, 239, 0.12), 0 2px 6px -1px rgba(15, 23, 42, 0.04)",
                "civic-lg": "0 14px 36px -6px rgba(1, 176, 239, 0.16), 0 4px 12px -2px rgba(15, 23, 42, 0.05)",
                "civic-xl": "0 22px 50px -10px rgba(1, 176, 239, 0.22), 0 8px 18px -4px rgba(15, 23, 42, 0.06)",
                "gov": "0 4px 16px -2px rgba(1, 176, 239, 0.10)",
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "civic-gradient": "linear-gradient(135deg, #01b0ef 0%, #27c0f6 50%, #0098d4 100%)",
            },
        },
    },
    plugins: [],
};

export default config;
