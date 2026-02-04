'use client';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { LanguageSwitcher } from '@/components/admin/LanguageSwitcher';
import { LanguageProvider } from '@/lib/contexts/LanguageContext';
import { SessionTimeout } from '@/components/auth/session-timeout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <SessionTimeout />
            <DashboardContent>
                {children}
            </DashboardContent>
        </LanguageProvider>
    );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-black relative font-inter overflow-hidden">
            {/* Ambient Background Lights */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange/[0.03] blur-[150px] rounded-full pointer-events-none z-0" />
            <div className="absolute inset-0 bg-cyber-grid opacity-10 pointer-events-none z-0" />

            <div className="fixed left-0 top-0 h-screen z-30">
                <AdminSidebar />
            </div>

            <div className="flex-1 flex flex-col relative z-10 ml-72">
                <header className="glass-panel-dark h-16 border-b border-white/[0.03] px-8 flex items-center justify-end sticky top-0 z-20 bg-black/50 backdrop-blur-xl">
                    <LanguageSwitcher />
                </header>

                <main className="flex-1 p-8 overflow-y-auto admin-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}
