import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import 'flag-icons/css/flag-icons.min.css';
import './globals.css';

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
    weight: ['300', '400', '500', '600', '700', '800', '900'],
    display: 'swap',
});

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    weight: ['300', '400', '500', '600', '700', '800', '900'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        default: 'Darrajati Management System',
        template: '%s | Darrajati Management'
    },
    description: 'Management system for Darrajati scooter rental business.',
    robots: {
        index: false,
        follow: false,
    },
    icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
        apple: '/favicon.svg',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" dir="ltr" className="scroll-smooth">
            <body suppressHydrationWarning className={`${inter.variable} ${outfit.variable} font-inter bg-black text-white min-h-screen overflow-x-hidden antialiased`}>
                {children}
            </body>
        </html>
    );
}
