'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsChart({ data }: { data: any[] }) {
    const [period, setPeriod] = useState<'3m' | '6m' | 'all'>('6m');

    if (!data || data.length === 0) return (
        <div className="h-[300px] flex items-center justify-center text-white/20 uppercase tracking-widest text-xs">
            No data available
        </div>
    );

    const getFilteredData = () => {
        if (period === '3m') return data.slice(-3);
        if (period === '6m') return data.slice(-6);
        return data;
    };

    const filteredData = getFilteredData();

    return (
        <div className="glass-panel rounded-3xl p-8 border-white/[0.03] hover:border-white/[0.08] transition-all duration-500">
            <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6 mb-8">
                <div>
                    <h3 className="text-2xl font-outfit tracking-wide text-white uppercase font-bold mb-1">Financial Analysis</h3>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
                        Revenue performance data overview
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    {/* Period Switcher */}
                    <div className="flex bg-white/[0.03] p-1 rounded-2xl border border-white/[0.05] font-inter">
                        {[
                            { id: '3m', label: '3 Months' },
                            { id: '6m', label: '6 Months' },
                            { id: 'all', label: 'All History' }
                        ].map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setPeriod(p.id as any)}
                                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${period === p.id
                                    ? 'bg-orange text-white shadow-[0_0_20px_rgba(255,113,11,0.2)]'
                                    : 'text-white/20 hover:text-white/60 hover:bg-white/[0.02]'
                                    }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">Revenue</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">Expenses</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis
                            dataKey="month"
                            stroke="rgba(255,255,255,0.1)"
                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-outfit)', fontWeight: 700 }}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.1)"
                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'var(--font-outfit)', fontWeight: 700 }}
                            tickLine={false}
                            axisLine={false}
                            width={70}
                            tickFormatter={(value) => value === 0 ? '0' : `${(value / 1000).toFixed(0)}k MAD`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0a0a0a',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '16px',
                                fontFamily: 'var(--font-outfit)',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                            }}
                            itemStyle={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '800', padding: '2px 0' }}
                            labelStyle={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3B82F6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            animationDuration={1500}
                        />
                        <Area
                            type="monotone"
                            dataKey="expenses"
                            stroke="#EF4444"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorExpenses)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
