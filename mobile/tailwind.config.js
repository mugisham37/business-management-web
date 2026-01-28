/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
        "./hooks/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                // Primary brand colors
                primary: {
                    DEFAULT: "#3B82F6", // Blue-500
                    50: "#EFF6FF",
                    100: "#DBEAFE",
                    200: "#BFDBFE",
                    300: "#93C5FD",
                    400: "#60A5FA",
                    500: "#3B82F6",
                    600: "#2563EB",
                    700: "#1D4ED8",
                    800: "#1E40AF",
                    900: "#1E3A8A",
                },
                // Background colors (dark theme)
                background: {
                    DEFAULT: "#0D0D0D",
                    secondary: "#1A1A1A",
                    tertiary: "#262626",
                },
                // Surface colors
                surface: {
                    DEFAULT: "#1F1F1F",
                    elevated: "#2A2A2A",
                    overlay: "#333333",
                },
                // Text colors
                text: {
                    primary: "#FFFFFF",
                    secondary: "#A3A3A3",
                    tertiary: "#737373",
                    inverse: "#0D0D0D",
                },
                // Semantic colors
                success: {
                    DEFAULT: "#22C55E",
                    50: "#F0FDF4",
                    500: "#22C55E",
                    600: "#16A34A",
                },
                warning: {
                    DEFAULT: "#F59E0B",
                    50: "#FFFBEB",
                    500: "#F59E0B",
                    600: "#D97706",
                },
                error: {
                    DEFAULT: "#EF4444",
                    50: "#FEF2F2",
                    500: "#EF4444",
                    600: "#DC2626",
                },
                info: {
                    DEFAULT: "#0EA5E9",
                    50: "#F0F9FF",
                    500: "#0EA5E9",
                    600: "#0284C7",
                },
                // Border colors
                border: {
                    DEFAULT: "#333333",
                    subtle: "#262626",
                    strong: "#525252",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            fontSize: {
                "2xs": ["10px", { lineHeight: "14px" }],
                xs: ["12px", { lineHeight: "16px" }],
                sm: ["14px", { lineHeight: "20px" }],
                base: ["16px", { lineHeight: "24px" }],
                lg: ["18px", { lineHeight: "28px" }],
                xl: ["20px", { lineHeight: "28px" }],
                "2xl": ["24px", { lineHeight: "32px" }],
                "3xl": ["30px", { lineHeight: "36px" }],
                "4xl": ["36px", { lineHeight: "40px" }],
                "5xl": ["48px", { lineHeight: "48px" }],
            },
            spacing: {
                // Standard spacing scale
                0.5: "2px",
                1: "4px",
                1.5: "6px",
                2: "8px",
                2.5: "10px",
                3: "12px",
                3.5: "14px",
                4: "16px",
                5: "20px",
                6: "24px",
                7: "28px",
                8: "32px",
                9: "36px",
                10: "40px",
                12: "48px",
                14: "56px",
                16: "64px",
                20: "80px",
                24: "96px",
            },
            borderRadius: {
                none: "0",
                sm: "4px",
                DEFAULT: "8px",
                md: "12px",
                lg: "16px",
                xl: "20px",
                "2xl": "24px",
                "3xl": "32px",
                full: "9999px",
            },
            boxShadow: {
                sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
                md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
                lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
                xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            },
            animation: {
                "fade-in": "fadeIn 0.2s ease-in-out",
                "slide-up": "slideUp 0.3s ease-out",
                "slide-down": "slideDown 0.3s ease-out",
                "scale-in": "scaleIn 0.2s ease-out",
                pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { transform: "translateY(10px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                slideDown: {
                    "0%": { transform: "translateY(-10px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                scaleIn: {
                    "0%": { transform: "scale(0.95)", opacity: "0" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
            },
        },
    },
    plugins: [],
};
