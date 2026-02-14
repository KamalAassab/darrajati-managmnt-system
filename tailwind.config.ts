import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './lib/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            maxWidth: {
                container: "1280px",
            },
            colors: {

                card: {
                    DEFAULT: '#121212',
                },
                background: '#000000',
                foreground: '#EDEDED',
                muted: {
                    DEFAULT: 'rgba(255, 255, 255, 0.05)',
                    foreground: 'rgba(255, 255, 255, 0.6)',
                },
                accent: 'rgba(234, 104, 25, 0.1)', // Amber accent
                ring: '#ea6819',
                input: 'rgba(255, 255, 255, 0.08)',
                border: 'rgba(255, 255, 255, 0.08)',
                destructive: '#ef4444',
                'destructive-foreground': '#ffffff',
                'popover-foreground': '#ffffff',
                primary: {
                    DEFAULT: '#ea6819',
                    foreground: '#ffffff',
                },
            },
            fontFamily: {
                outfit: ['var(--font-outfit)', 'sans-serif'],
                inter: ['var(--font-inter)', 'sans-serif'],
                anton: ['var(--font-outfit)', 'sans-serif'], // Map legacy anton to outfit
                alexandria: ['var(--font-outfit)', 'sans-serif'], // Map alexandria to outfit to prevent broken fonts
                poppins: ['var(--font-poppins)', 'sans-serif'],
            },
            animation: {
                marquee: 'marquee var(--duration) linear infinite',
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(calc(-50% - var(--gap) / 2))' }
                }
            }
        },
    },
    plugins: [],
}
export default config
