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
                orange: {
                    DEFAULT: '#ff710b',
                    dark: '#e56000',
                },
                card: {
                    DEFAULT: '#1a1a1a',
                },
                background: '#000000',
                foreground: '#ffffff',
                muted: {
                    DEFAULT: 'rgba(255, 255, 255, 0.1)',
                    foreground: 'rgba(255, 255, 255, 0.7)',
                },
                accent: 'rgba(255, 255, 255, 0.05)',
                ring: '#ff710b',
                input: 'rgba(255, 255, 255, 0.1)',
                border: 'rgba(255, 255, 255, 0.1)',
                destructive: '#ef4444',
                'destructive-foreground': '#ffffff',
                'popover-foreground': '#ffffff',
                primary: {
                    DEFAULT: '#ff710b',
                    foreground: '#ffffff',
                },
            },
            fontFamily: {
                outfit: ['var(--font-outfit)', 'sans-serif'],
                inter: ['var(--font-inter)', 'sans-serif'],
                anton: ['var(--font-outfit)', 'sans-serif'], // Map legacy anton to outfit
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
