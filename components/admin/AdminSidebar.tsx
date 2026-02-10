'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Bike,
    Users,
    Calendar,
    DollarSign,
    LogOut,
    AlertTriangle,
    ChevronRight,
    ChevronLeft,
    Settings
} from 'lucide-react';
import { logout } from '@/app/actions';

import { RentalWithDetails } from '@/types/admin';

interface AdminSidebarProps {
    overdueRentals?: RentalWithDetails[];
    isCollapsed: boolean;
    onToggle: () => void;
    isMobileOpen: boolean;
    onMobileClose: () => void;
}

export function AdminSidebar({ overdueRentals = [], isCollapsed, onToggle, isMobileOpen, onMobileClose }: AdminSidebarProps) {
    const pathname = usePathname();

    const navItems = [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/dashboard/scooters', icon: Bike, label: 'Scooters' },
        { href: '/dashboard/clients', icon: Users, label: 'Clients' },
        { href: '/dashboard/rentals', icon: Calendar, label: 'Rentals' },
        { href: '/dashboard/finances', icon: DollarSign, label: 'Finances' },
        { href: '/dashboard/overdues', icon: AlertTriangle, label: 'Overdues', badge: overdueRentals.length > 0 ? overdueRentals.length : undefined },
        { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
    ];

    const sidebarClasses = `
        glass-panel-dark border-r border-white/5 h-screen flex flex-col transition-all duration-300 ease-in-out
        fixed md:sticky top-0 z-50
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'md:w-24' : 'md:w-72'}
        w-72
    `;

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={onMobileClose}
                />
            )}

            <aside className={sidebarClasses}>
                <div className="absolute -right-3 top-8 z-50 hidden md:block">
                    <button
                        onClick={onToggle}
                        className="glass-panel-dark text-white/50 hover:text-white p-1.5 rounded-full shadow-lg hover:bg-white/10 transition-all border border-white/10"
                    >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                </div>

                {/* Mobile Close Button */}
                <div className="absolute right-4 top-4 md:hidden">
                    <button
                        onClick={onMobileClose}
                        className="text-white/50 hover:text-white transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                </div>

                <div className={`p-8 pb-4 ${isCollapsed ? 'md:px-4 md:flex md:flex-col md:items-center' : ''}`}>
                    <Link href="/dashboard" prefetch={true} className="block" onClick={onMobileClose}>
                        {isCollapsed ? (
                            <>
                                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10">
                                    <Image
                                        src="/avatar-placeholder.png"
                                        alt="User"
                                        fill
                                        className="object-cover"
                                        sizes="40px"
                                    />
                                </div>
                                <h1 className="text-3xl text-white uppercase leading-none md:hidden">
                                    Darrajati <span className="text-orange text-glow-orange block text-xl">Admin Panel</span>
                                </h1>
                            </>
                        ) : (
                            <h1 className="text-3xl text-white uppercase leading-none">
                                Darrajati <span className="text-orange text-glow-orange block text-xl">Admin Panel</span>
                            </h1>
                        )}
                    </Link>
                    <div className={`h-[1px] bg-orange mt-4 opacity-50 ${isCollapsed ? 'md:w-8' : 'w-12'}`}></div>
                </div>

                <nav className={`flex-1 overflow-y-auto py-4 space-y-6 admin-scrollbar ${isCollapsed ? 'md:px-3' : 'px-8'}`}>
                    <div className="space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const ItemIcon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    prefetch={true}
                                    onClick={onMobileClose}
                                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${isActive
                                        ? 'bg-orange/10 text-orange border border-orange/20'
                                        : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                                        } ${isCollapsed ? 'md:justify-center' : ''}`}
                                    title={isCollapsed ? item.label : ''}
                                >
                                    <ItemIcon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-orange' : 'text-white/30'}`} />
                                    <span className={`text-sm tracking-tight ${isCollapsed ? 'md:hidden' : ''} ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                                    {item.badge && (
                                        <span className={`absolute ${isCollapsed ? 'md:-top-1 md:-right-1 top-1/2 -translate-y-1/2 right-3' : 'right-3'} min-w-[20px] h-[20px] bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-lg`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Sticky Logout Button */}
                <div className={`sticky bottom-0 border-t border-white/5 bg-black/80 backdrop-blur-xl z-30 ${isCollapsed ? 'md:p-4' : 'p-8 pt-4'} p-4`}>
                    <form action={logout}>
                        <button
                            type="submit"
                            className={`flex items-center gap-4 py-3.5 rounded-xl w-full text-white hover:text-red-500 hover:bg-red-500/10 transition-all duration-300 group font-semibold text-sm border border-white/10 hover:border-red-500/30 ${isCollapsed ? 'md:justify-center md:px-0' : 'px-4'}`}
                            title={isCollapsed ? 'Logout' : ''}
                        >
                            <div className="w-5 h-5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <LogOut className="w-4 h-4" />
                            </div>
                            <span className={isCollapsed ? 'md:hidden' : ''}>Logout</span>
                        </button>
                    </form>
                </div>
            </aside>
        </>
    );
}
