import dynamic from 'next/dynamic';
import { KPICard } from '@/components/admin/KPICard';
import { formatMAD, isOverdue, formatDate } from '@/lib/utils/currency';
import { TrendingUp, Calendar, AlertTriangle, ChevronRight, Activity, Wallet, PieChart } from 'lucide-react';
import Link from 'next/link';

const AnalyticsChart = dynamic(() => import('./components/AnalyticsChart'), {
    loading: () => <div className="h-[300px] bg-white/5 animate-pulse rounded-2xl" />,
    ssr: false
});
const TopScooters = dynamic(() => import('./components/TopScooters'), {
    loading: () => <div className="h-[300px] bg-white/5 animate-pulse rounded-2xl" />,
});
import SmartTips from './components/SmartTips';

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
    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl text-white uppercase flex items-center gap-3">
                    <Activity className="w-6 h-6 md:w-8 md:h-8 text-orange" />
                    Dashboard
                </h1>
            </div>

            {/* Main KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Revenue"
                    value={formatMAD(stats.totalRevenue)}
                    icon={<Wallet className="w-6 h-6" />}
                    color="success"
                />
                <KPICard
                    title="Total Expenses"
                    value={formatMAD(stats.totalExpenses)}
                    icon={<PieChart className="w-6 h-6" />}
                    color="danger"
                />
                <KPICard
                    title="Net Profit"
                    value={formatMAD(stats.netProfit)}
                    icon={<TrendingUp className="w-6 h-6" />}
                    color={stats.netProfit >= 0 ? 'success' : 'danger'}
                />
                <KPICard
                    title="Active Rentals"
                    value={stats.activeRentals}
                    icon={<Calendar className="w-6 h-6" />}
                    color="primary"
                />
            </div>

            {/* Analytics Section */}
            < div className="grid grid-cols-1 lg:grid-cols-3 gap-6" >

                {/* Main Chart */}
                < div className="lg:col-span-2" >
                    <AnalyticsChart data={analyticsData.monthlyStats} />
                </div >

                {/* Smart Tips */}
                < div className="lg:col-span-1" >
                    <SmartTips tips={analyticsData.tips} />
                </div >
            </div >

            {/* Bottom Grid: Top Scooters & Activity */}
            < div className="grid grid-cols-1 lg:grid-cols-3 gap-6" >

                {/* Top Scooters */}
                < div className="lg:col-span-1" >
                    <TopScooters scooters={analyticsData.topScooters} />
                </div >

                {/* Recent Activity */}
                < div className="lg:col-span-2 bg-[#050505] border border-white/[0.03] rounded-[2rem] p-6 relative overflow-hidden" >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange/5 rounded-full blur-[100px] -mr-32 -mt-32" />

                    <div className="flex justify-between items-center mb-6 relative z-10 px-2">
                        <div>
                            <h3 className="text-xl text-white uppercase font-bold">Operation Stream</h3>
                        </div>
                        <Link href="/dashboard/rentals" className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-orange transition-all flex items-center gap-2 group border border-white/5 px-3 py-1.5 rounded-lg hover:border-orange/30">
                            View All <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto admin-scrollbar relative z-10">
                        <table className="w-full border-separate border-spacing-y-2">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                                    <th className="text-left pb-2 pl-4">Client / Unit</th>
                                    <th className="text-left pb-2 hidden md:table-cell">Rental Period</th>
                                    <th className="text-center pb-2 hidden lg:table-cell">Duration</th>
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
                                            <td className="py-4 bg-white/[0.02] border-y border-white/[0.03] group-hover:bg-white/[0.04] group-hover:border-orange/20 transition-all hidden md:table-cell">
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-white/60 tracking-tighter">{new Date(rental.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}</span>
                                                        <ChevronRight className="w-3 h-3 text-white/10" />
                                                        <span className="text-xs font-bold text-white/60 tracking-tighter">{new Date(rental.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 bg-white/[0.02] border-y border-white/[0.03] group-hover:bg-white/[0.04] group-hover:border-orange/20 transition-all text-center hidden lg:table-cell">
                                                <span className="inline-flex items-center text-sm font-black text-white/50 uppercase tracking-tight">
                                                    {days} {days === 1 ? 'day' : 'days'}
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
                </div >
            </div >
        </div >
    );
}
