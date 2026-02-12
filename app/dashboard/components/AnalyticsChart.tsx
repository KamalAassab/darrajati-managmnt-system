'use client';


import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatMAD } from '@/lib/utils/currency';

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const revenue = payload.find((p: any) => p.dataKey === 'revenue')?.value || 0;
        const expenses = payload.find((p: any) => p.dataKey === 'expenses')?.value || 0;
        const profit = payload.find((p: any) => p.dataKey === 'profit')?.value || 0;

        return (
            <div className="bg-black/95 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-sm">
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">{label}</div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Revenue</span>
                        </div>
                        <span className="text-sm font-black text-blue-400 font-outfit">{formatMAD(revenue)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Expenses</span>
                        </div>
                        <span className="text-sm font-black text-red-400 font-outfit">{formatMAD(expenses)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-6 pt-2 border-t border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Net Profit</span>
                        </div>
                        <span className={`text-sm font-black font-outfit ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatMAD(profit)}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export default function AnalyticsChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) return (
        <div className="h-[300px] flex items-center justify-center text-white/20 uppercase tracking-widest text-xs">
            No Data
        </div>
    );

    // Add profit calculation to data if not present
    const chartData = data.map(item => ({
        ...item,
        profit: (item.revenue || 0) - (item.expenses || 0)
    }));

    // Calculate max value for Y-axis domain
    const maxValue = Math.max(
        ...chartData.map(d => Math.max(d.revenue || 0, d.expenses || 0, Math.abs(d.profit || 0)))
    );
    const yAxisMax = Math.ceil(maxValue / 1000) * 1000 + 1000; // Round up to nearest 1000 + buffer

    return (
        <div className="glass-panel rounded-3xl p-4 md:p-6 border-white/[0.03] hover:border-white/[0.08] transition-all duration-500">
            <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6 mb-8">
                <div>
                    <h3 className="text-2xl text-white uppercase font-bold mb-1">Financial Analysis</h3>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">Revenue</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">Expenses</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">Profit</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="month"
                            stroke="rgba(255,255,255,0.1)"
                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'var(--font-outfit)', fontWeight: 700 }}
                            tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            dy={10}
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.1)"
                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'var(--font-outfit)', fontWeight: 700 }}
                            tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            width={85}
                            domain={[0, yAxisMax]}
                            tickFormatter={(value) => value === 0 ? '0' : `${value.toLocaleString()} MAD`}
                            tickCount={6}
                        />
                        <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3B82F6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            animationDuration={1500}
                            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4, stroke: '#0a0a0a' }}
                            activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#0a0a0a' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="expenses"
                            stroke="#EF4444"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorExpenses)"
                            animationDuration={1500}
                            dot={{ fill: '#EF4444', strokeWidth: 2, r: 4, stroke: '#0a0a0a' }}
                            activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2, fill: '#0a0a0a' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="profit"
                            stroke="#10B981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorProfit)"
                            animationDuration={1500}
                            dot={{ fill: '#10B981', strokeWidth: 2, r: 4, stroke: '#0a0a0a' }}
                            activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#0a0a0a' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
