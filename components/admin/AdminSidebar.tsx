'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Bike,
    Users,
    Calendar,
    DollarSign,
    LogOut
} from 'lucide-react';
import { logout } from '@/app/actions';
import { useLanguage } from '@/lib/contexts/LanguageContext';

export function AdminSidebar() {
    const { t, language } = useLanguage();
    const pathname = usePathname();

    const navItems = [
        { href: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
        { href: '/dashboard/scooters', icon: Bike, label: t('scooters') },
        { href: '/dashboard/clients', icon: Users, label: t('clients') },
        { href: '/dashboard/rentals', icon: Calendar, label: t('rentals') },
        { href: '/dashboard/finances', icon: DollarSign, label: t('finances') },
    ];

    return (
        <aside className="w-72 glass-panel-dark border-r border-white/5 h-screen flex flex-col relative">
            <div className="p-8 pb-4">
                <Link href="/dashboard" prefetch={true} className="block">
                    <h1 className="text-3xl font-outfit font-black tracking-tighter text-white uppercase leading-none">
                        Darrajati <span className="text-orange text-glow-orange block text-xl">Admin Panel</span>
                    </h1>
                </Link>
                <div className="h-[1px] w-12 bg-orange mt-4 opacity-50"></div>
            </div>

            <nav className="flex-1 overflow-y-auto px-8 py-4 space-y-2 admin-scrollbar">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch={true}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive
                                ? 'bg-orange/10 text-orange border border-orange/20'
                                : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <item.icon className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-orange' : 'text-white/30'}`} />
                            <span className={`text-sm tracking-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Sticky Logout Button */}
            <div className="sticky bottom-0 p-8 pt-4 border-t border-white/5 bg-black/80 backdrop-blur-xl z-30">
                <form action={logout}>
                    <button
                        type="submit"
                        className="flex items-center gap-4 px-4 py-3.5 rounded-xl w-full text-white hover:text-red-500 hover:bg-red-500/10 transition-all duration-300 group font-semibold text-sm border border-white/10 hover:border-red-500/30"
                    >
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                            <LogOut className="w-4 h-4" />
                        </div>
                        {t('logout')}
                    </button>
                </form>
            </div>
        </aside>
    );
}
