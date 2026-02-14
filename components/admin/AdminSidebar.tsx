'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Bike,
    Users,
    Calendar,
    DollarSign,
    LogOut,
    AlertTriangle,
    ChevronsRight,
    ChevronsLeft,
    Settings,
    Wrench,
    UserCog
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
        { href: '/dashboard/vidange', icon: Wrench, label: 'Vidange' },
        { href: '/dashboard/users', icon: UserCog, label: 'Users' },
        { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
    ];

    const sidebarClasses = `
        glass-panel-dark border-r border-white/5 h-screen flex flex-col transition-all duration-300 ease-in-out
        fixed md:sticky top-0 z-50
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        w-64
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

            <aside suppressHydrationWarning className={sidebarClasses}>
                <div className={`relative transition-all duration-300 ${isCollapsed ? 'p-4 py-6 flex flex-col items-center justify-center' : 'p-8 pb-4'}`}>
                    <Link href="/dashboard" prefetch={true} className="block" onClick={onMobileClose}>
                        {isCollapsed ? (
                            <div className="relative w-12 h-12 md:w-14 md:h-14 transition-all duration-300">
                                <img
                                    src="/logo.webp"
                                    alt="Darrajati Admin"
                                    className="absolute inset-0 w-full h-full object-contain"
                                />
                            </div>
                        ) : (
                            <div className="relative w-full h-24 transition-all duration-300">
                                <img
                                    src="/logo.webp"
                                    alt="Darrajati Admin"
                                    className="absolute inset-0 w-full h-full object-contain object-left"
                                />
                            </div>
                        )}
                    </Link>

                    {/* Collapse Button */}
                    <div className={`hidden md:block z-50 ${isCollapsed ? 'mt-4' : 'absolute -right-3 top-8'}`}>
                        <button
                            onClick={onToggle}
                            className={`bg-[#ea6819] text-white rounded-full shadow-[0_0_15px_rgba(234,104,25,0.4)] hover:shadow-[0_0_25px_rgba(234,104,25,0.6)] hover:scale-110 transition-all duration-300 border border-white/20 flex items-center justify-center group ${isCollapsed ? 'p-1.5' : 'p-2'}`}
                        >
                            {isCollapsed ? (
                                <ChevronsRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                            ) : (
                                <ChevronsLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                            )}
                        </button>
                    </div>

                    <div className={`h-[1px] bg-primary mt-4 opacity-50 ${isCollapsed ? 'w-8' : 'w-12'}`}></div>
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
                                    className={`flex items-center gap-4 px-4 py-3.5 mx-2 rounded-xl transition-all duration-300 group relative ${isActive
                                        ? 'bg-[#ea6819] text-white font-bold shadow-[0_0_20px_rgba(234,104,25,0.3)]'
                                        : 'text-white/50 hover:text-white hover:bg-white/5'
                                        } ${isCollapsed ? 'md:justify-center md:px-0 md:mx-0' : ''}`}
                                    title={isCollapsed ? item.label : ''}
                                >
                                    <ItemIcon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-white/30'}`} />
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
                            <div suppressHydrationWarning className="w-5 h-5 flex items-center justify-center group-hover:scale-110 transition-transform">
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
