import type { Metadata } from 'next';
import { Inter, Outfit, Poppins } from 'next/font/google';
import 'flag-icons/css/flag-icons.min.css';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
    display: 'swap',
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

const poppins = Poppins({
    subsets: ['latin'],
    variable: '--font-poppins',
    display: 'swap',
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
    metadataBase: new URL('https://darrajati-management.vercel.app'),
    title: {
        default: 'Darrajati Management System',
        template: '%s | Darrajati Management'
    },
    description: 'Management system for Darrajati scooter rental business.',
    manifest: '/manifest.json',
    openGraph: {
        title: 'Darrajati Management System',
        description: 'Management system for Darrajati scooter rental business.',
        url: 'https://darrajati-management.vercel.app',
        siteName: 'Darrajati Management',
        locale: 'en_US',
        type: 'website',
    },
    robots: {
        index: false,
        follow: false,
    },
    icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
        apple: '/logo.webp', // Use webp logo for Apple icon as well
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" dir="ltr" className={`scroll-smooth ${inter.variable} ${outfit.variable} ${poppins.variable}`}>
            <head>
                {/* Fonts are now loaded via next/font/google */}
            </head>
            <body suppressHydrationWarning className="font-inter bg-black text-white min-h-screen overflow-x-hidden antialiased">
                {children}
            </body>
        </html>
    );
}
