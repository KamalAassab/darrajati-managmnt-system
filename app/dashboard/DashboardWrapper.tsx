'use client';
import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { Menu } from 'lucide-react';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { SessionTimeout } from '@/components/auth/session-timeout';
import { RentalWithDetails } from '@/types/admin';

interface DashboardWrapperProps {
    children: React.ReactNode;
    overdueRentals: RentalWithDetails[];
}

export default function DashboardWrapper({ children, overdueRentals }: DashboardWrapperProps) {
    const [mounted, setMounted] = useState(false);
    const [isCollapsed, setIsCollapsed] = useLocalStorage('admin-sidebar-collapsed', false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <>
            <SessionTimeout />
            <div suppressHydrationWarning className="flex h-screen bg-black relative font-inter overflow-hidden">
                {/* Ambient Background Lights */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/[0.03] blur-[150px] rounded-full pointer-events-none z-0" />
                <div className="absolute inset-0 bg-cyber-grid opacity-10 pointer-events-none z-0" />

                <div className="fixed  left-0 top-0 h-screen z-40">
                    <AdminSidebar
                        overdueRentals={overdueRentals}
                        isCollapsed={mounted ? isCollapsed : false}
                        onToggle={() => setIsCollapsed(!isCollapsed)}
                        isMobileOpen={isMobileMenuOpen}
                        onMobileClose={() => setIsMobileMenuOpen(false)}
                    />
                </div>

                <div suppressHydrationWarning className={`flex-1 flex flex-col relative z-0 transition-all duration-300 ease-in-out ${mounted && isCollapsed ? 'md:ml-20' : 'md:ml-64'} ml-0`}>
                    <header className="glass-panel-dark h-16 border-b border-white/[0.03] px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 bg-black/50 backdrop-blur-xl">
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 text-white/70 hover:text-white transition-colors"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        </div>

                    </header>

                    <main className="flex-1 p-8 overflow-y-auto admin-scrollbar">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
