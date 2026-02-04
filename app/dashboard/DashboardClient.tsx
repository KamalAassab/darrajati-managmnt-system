'use client';

import { KPICard } from '@/components/admin/KPICard';
import { formatMAD, isOverdue, formatDate } from '@/lib/utils/currency';
import { TrendingUp, Calendar, AlertTriangle, ChevronRight, Activity, Wallet, PieChart } from 'lucide-react';
import Link from 'next/link';
import AnalyticsChart from './components/AnalyticsChart';
import TopScooters from './components/TopScooters';
import SmartTips from './components/SmartTips';

import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function DashboardClient({
    stats,
    analyticsData,
    activeRentals,
    latestRentals
}: {
    stats: any,
    analyticsData: any,
    activeRentals: any[],
    latestRentals: any[]
}) {
    const { t } = useLanguage();
    const overdueRentals = activeRentals.filter(r => isOverdue(r.endDate));

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-outfit tracking-wide text-white uppercase flex items-center gap-3 font-normal">
                    <Activity className="w-8 h-8 text-orange" />
                    {t('dashboard')}
                </h1>
            </div>

            {/* Overdue Alerts */}
            {overdueRentals.length > 0 && (
                <div className="bg-red-500/[0.03] border border-red-500/20 rounded-3xl p-6 relative overflow-hidden shadow-2xl shadow-red-500/[0.02]">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                                <AlertTriangle className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-outfit text-white uppercase tracking-tighter">Action Required</h3>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                                {overdueRentals.length} {overdueRentals.length === 1 ? 'Unit' : 'Units'} Overdue
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative z-10">
                        {overdueRentals.map((rental) => (
                            <div key={rental.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.05] hover:border-red-500/30 transition-all group/item duration-500">
                                <div className="flex justify-between items-start mb-3">
                                    <p className="text-base font-bold text-white group-hover/item:text-red-500 transition-colors uppercase tracking-tight">{rental.client.fullName}</p>
                                    <ChevronRight className="w-4 h-4 text-white/10 group-hover/item:text-red-500 transition-all translate-x-0 group-hover/item:translate-x-1" />
                                </div>
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-4">
                                    {rental.scooter.name}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-white/[0.03]">
                                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Expires</span>
                                    <span className="text-[11px] font-bold text-red-500/80">{formatDate(rental.endDate)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title={t('totalRevenue')}
                    value={formatMAD(stats.totalRevenue)}
                    icon={<Wallet className="w-6 h-6" />}
                    color="success"
                />
                <KPICard
                    title={t('totalExpenses')}
                    value={formatMAD(stats.totalExpenses)}
                    icon={<PieChart className="w-6 h-6" />}
                    color="danger"
                />
                <KPICard
                    title={t('netProfit')}
                    value={formatMAD(stats.netProfit)}
                    icon={<TrendingUp className="w-6 h-6" />}
                    color={stats.netProfit >= 0 ? 'success' : 'danger'}
                />
                <KPICard
                    title={t('activeRentals')}
                    value={stats.activeRentals}
                    icon={<Calendar className="w-6 h-6" />}
                    color="primary"
                />
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Chart */}
                <div className="lg:col-span-2">
                    <AnalyticsChart data={analyticsData.monthlyStats} />
                </div>

                {/* Smart Tips */}
                <div className="lg:col-span-1">
                    <SmartTips tips={analyticsData.tips} />
                </div>
            </div>

            {/* Bottom Grid: Top Scooters & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Top Scooters */}
                <div className="lg:col-span-1">
                    <TopScooters scooters={analyticsData.topScooters} />
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-[#050505] border border-white/[0.03] rounded-[2rem] p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange/5 rounded-full blur-[100px] -mr-32 -mt-32" />

                    <div className="flex justify-between items-center mb-6 relative z-10 px-2">
                        <div>
                            <h3 className="text-xl font-outfit tracking-tight text-white uppercase font-bold">Operation Stream</h3>
                        </div>
                        <Link href="/dashboard/rentals" className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-orange transition-all flex items-center gap-2 group border border-white/5 px-3 py-1.5 rounded-lg hover:border-orange/30">
                            {t('viewAll')} <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto admin-scrollbar relative z-10">
                        <table className="w-full border-separate border-spacing-y-2">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                                    <th className="text-left pb-2 pl-4">Client / Unit</th>
                                    <th className="text-left pb-2">Rental Period</th>
                                    <th className="text-center pb-2">Duration</th>
                                    <th className="text-right pb-2 pr-4">Finance / Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-0">
                                {latestRentals.map((rental) => {
                                    const days = Math.ceil((new Date(rental.endDate).getTime() - new Date(rental.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;

                                    return (
                                        <tr key={rental.id} className="group transition-all">
                                            <td className="py-4 pl-4 bg-white/[0.02] rounded-l-2xl border-y border-l border-white/[0.03] group-hover:bg-white/[0.04] group-hover:border-orange/20 transition-all">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white text-base tracking-tight group-hover:text-orange transition-colors">{rental.client.fullName}</span>
                                                    <span className="text-xs font-medium text-white/40 uppercase tracking-tighter mt-0.5">{rental.scooter.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 bg-white/[0.02] border-y border-white/[0.03] group-hover:bg-white/[0.04] group-hover:border-orange/20 transition-all">
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-white/60 tracking-tighter">{new Date(rental.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</span>
                                                        <ChevronRight className="w-3 h-3 text-white/10" />
                                                        <span className="text-xs font-bold text-white/60 tracking-tighter">{new Date(rental.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 bg-white/[0.02] border-y border-white/[0.03] group-hover:bg-white/[0.04] group-hover:border-orange/20 transition-all text-center">
                                                <span className="inline-flex items-center text-sm font-black text-white/50 uppercase tracking-tight">
                                                    {days} {days === 1 ? 'Day' : 'Days'}
                                                </span>
                                            </td>
                                            <td className="py-4 pr-4 bg-white/[0.02] rounded-r-2xl border-y border-r border-white/[0.03] group-hover:bg-white/[0.04] group-hover:border-orange/20 transition-all text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-outfit text-white text-base font-bold tracking-tight">{formatMAD(rental.totalPrice)}</span>
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${rental.status === 'active' ? 'text-green-500' :
                                                        rental.status === 'completed' ? 'text-blue-500' : 'text-white/20'
                                                        }`}>
                                                        {rental.status}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
