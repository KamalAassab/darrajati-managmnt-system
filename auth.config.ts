import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnLogin = nextUrl.pathname === '/';

            // Protect dashboard routes
            if (isOnDashboard) {
                if (!isLoggedIn) {
                    return false; // Redirect to login
                }
                return true;
            }

            // Redirect logged-in users away from login page (root)
            if (isOnLogin && isLoggedIn) {
                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : nextUrl.origin);
                return Response.redirect(new URL('/dashboard', baseUrl));
            }

            return true;
        },
    },
    providers: [],
} satisfies NextAuthConfig;
