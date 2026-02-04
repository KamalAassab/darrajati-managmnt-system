'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, User, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { authenticate } from '@/app/actions';

function LoginButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-orange text-white font-bold py-4 rounded-2xl hover:bg-orange/90 transition-all duration-300 orange-glow active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-lg tracking-tight"
        >
            {pending ? (
                <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                </>
            ) : 'Access Control'}
        </button>
    );
}

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formState, dispatch] = useFormState(authenticate, undefined);
    const [showPassword, setShowPassword] = useState(false);
    const [uiError, setUiError] = useState<string | null>(null);

    // Initial check for query params
    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam === 'SessionExpired') {
            setUiError('Session expired due to inactivity. Please log in again.');
        }
    }, [searchParams]);

    // Sync form state errors
    useEffect(() => {
        if (formState === 'success') {
            router.push('/dashboard');
            router.refresh();
        } else if (formState) {
            setUiError(formState);
        }
    }, [formState, router]);

    return (
        <div className="w-full max-w-md relative z-10 px-4">
            <div className="glass-panel-dark rounded-3xl p-8 md:p-10 orange-glow-border">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-orange rounded-2xl flex items-center justify-center orange-glow">
                        <ShieldCheck className="w-10 h-10 text-white" />
                    </div>
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-outfit tracking-tighter text-white mb-2 uppercase italic text-glow-orange font-bold">
                        Darrajati <span className="text-orange">Admin</span>
                    </h1>
                    <p className="text-muted-foreground text-sm tracking-widest uppercase font-inter font-medium opacity-60">
                        Security Gateway
                    </p>
                </div>

                <form action={dispatch} className="space-y-6">
                    {uiError && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-xl text-sm text-center animate-pulse">
                            {uiError}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">
                            Username
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="w-5 h-5 text-muted-foreground group-focus-within:text-orange transition-colors" />
                            </div>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                required
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:ring-2 focus:ring-orange/50 focus:border-orange/50 outline-none transition-all duration-300"
                                placeholder="Enter username"
                                onChange={() => setUiError(null)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">
                            Password
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="w-5 h-5 text-muted-foreground group-focus-within:text-orange transition-colors" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                required
                                className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:ring-2 focus:ring-orange/50 focus:border-orange/50 outline-none transition-all duration-300"
                                placeholder="••••••••"
                                onChange={() => setUiError(null)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-white transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <LoginButton />
                </form>

                <p className="text-center text-xs text-white/30 mt-8 tracking-tighter uppercase font-medium">
                    System encrypted &amp; secured
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center relative bg-black overflow-hidden font-inter">
            {/* Background elements */}
            <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-orange/20 to-transparent pointer-events-none" />
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none" />

            <Suspense fallback={<div className="text-white">Loading security gateway...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
