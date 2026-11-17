import type { Config } from "tailwindcss";

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
                primary: {
                    DEFAULT: "#0088C2",
                    50: "#F0F9FF",
                    100: "#E0F2FE",
                    200: "#BAE6FD",
                    300: "#7DD3FC",
                    400: "#38BDF8",
                    500: "#01B0EF",
                    600: "#0088C2",
                    700: "#00689E",
                    800: "#0B4A78",
                    900: "#093158",
                    950: "#071E3D",
                },
                secondary: {
                    DEFAULT: "#FDB913",
                    50: "#FFFBEB",
                    100: "#FEF3C7",
                    200: "#FDE68A",
                    300: "#FCD34D",
                    400: "#FBBF24",
                    500: "#FDB913",
                    600: "#D97706",
                    700: "#B45309",
                    800: "#92400E",
                    900: "#78350F",
                },
                civic: {
                    50: "#F6F9FC",
                    100: "#EDF2F7",
                    200: "#E2E8F0",
                    300: "#CBD5E1",
                    400: "#94A3B8",
                    500: "#64748B",
                    600: "#475569",
                    700: "#334155",
                    800: "#1E293B",
                    900: "#0F172A",
                    950: "#071E3D",
                },
                gold: {
                    400: "#FBBF24",
                    500: "#FDB913",
                    600: "#D97706",
                },
            },
            fontFamily: {
                sans: ["'Plus Jakarta Sans'", "system-ui", "-apple-system", "sans-serif"],
                heading: ["'Outfit'", "'Plus Jakarta Sans'", "system-ui", "sans-serif"],
                mono: ["'JetBrains Mono'", "monospace"],
            },
            boxShadow: {
                "civic-sm": "0 1px 3px 0 rgba(7, 30, 61, 0.04), 0 1px 2px -1px rgba(7, 30, 61, 0.04)",
                "civic": "0 4px 20px -2px rgba(7, 30, 61, 0.06), 0 2px 6px -1px rgba(7, 30, 61, 0.04)",
                "civic-lg": "0 12px 32px -4px rgba(7, 30, 61, 0.08), 0 4px 12px -2px rgba(7, 30, 61, 0.04)",
                "civic-xl": "0 20px 48px -8px rgba(7, 30, 61, 0.12), 0 8px 16px -4px rgba(7, 30, 61, 0.06)",
                "gov": "0 2px 12px -2px rgba(7, 30, 61, 0.06)",
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "civic-gradient": "linear-gradient(135deg, #071E3D 0%, #093158 50%, #00689E 100%)",
            },
        },
    },
    plugins: [],
};

export default config;
