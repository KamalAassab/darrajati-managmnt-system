import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';
import { authConfig } from './auth.config';

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    session: {
        strategy: 'jwt',
        maxAge: 12 * 60 * 60, // 12 hours
    },
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.name = token.name as string;
            }
            return session;
        },
    },
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    console.error('Missing credentials');
                    return null;
                }

                const username = credentials.username as string;
                const password = credentials.password as string;

                // Validate input length
                if (username.length < 3 || password.length < 4) {
                    console.error('Invalid credential length');
                    return null;
                }

                try {
                    const sql = neon(process.env.DATABASE_URL!);

                    const users = await sql`
                        SELECT id, username, password_hash 
                        FROM admin_users 
                        WHERE username = ${username}
                    `;

                    if (users.length === 0) {
                        console.error('User not found');
                        return null;
                    }

                    const user = users[0];
                    const passwordValid = await bcrypt.compare(
                        password,
                        user.password_hash as string
                    );

                    if (!passwordValid) {
                        console.error('Invalid password');
                        return null;
                    }

                    return {
                        id: String(user.id),
                        name: user.username as string,
                        email: `${user.username}@admin.local`,
                    };
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            },
        }),
    ],
});
