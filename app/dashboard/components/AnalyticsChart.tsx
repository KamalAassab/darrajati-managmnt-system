import { useState, useTransition, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatMAD } from '@/lib/utils/currency';
import { getAnalyticsData } from '@/app/actions';
import { AnalyticsData } from '@/types/admin';
import { Filter, Calendar, ChevronDown } from 'lucide-react';

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const revenue = payload.find((p: any) => p.dataKey === 'revenue')?.value || 0;
        const expenses = payload.find((p: any) => p.dataKey === 'expenses')?.value || 0;
        const profit = payload.find((p: any) => p.dataKey === 'profit')?.value || 0;

        return (
            <div className="bg-black/95 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-sm z-50">
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

const MonthYearDropdown = ({ prop, value, options, onChange }: { prop: string, value: number, options: { value: number, label: string }[], onChange: (val: number) => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 appearance-none bg-black/60 border border-[#ea6819]/30 text-white text-[10px] uppercase font-bold tracking-wider rounded-lg pl-3 pr-2 py-2 focus:outline-none focus:border-[#ea6819] transition-all hover:bg-black/80 hover:border-[#ea6819]/60 shadow-[0_0_10px_rgba(234,104,25,0.1)] ${isOpen ? 'ring-1 ring-[#ea6819] border-[#ea6819]' : ''}`}
            >
                <span className="min-w-[60px] text-left">{options.find(o => o.value === value)?.label}</span>
                <ChevronDown className={`w-3 h-3 text-[#ea6819] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full min-w-[120px] bg-[#0a0a0a] border border-[#ea6819]/30 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] z-50 overflow-hidden backdrop-blur-xl">
                    <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-[#ea6819]/50 scrollbar-track-transparent p-1">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-[10px] uppercase font-bold tracking-wider rounded-md transition-colors ${value === option.value
                                    ? 'bg-[#ea6819] text-white shadow-lg'
                                    : 'text-white/70 hover:bg-[#ea6819]/10 hover:text-[#ea6819]'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function AnalyticsChart({ data: initialData }: { data: any[] }) {
    const [chartData, setChartData] = useState<any[]>([]);
    const [isPending, startTransition] = useTransition();
    const [filterMode, setFilterMode] = useState<'all' | 'month'>('all');
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initialize with props data
    useEffect(() => {
        if (initialData) {
            processData(initialData);
        }
    }, [initialData]);

    const processData = (rawData: any[]) => {
        const processed = rawData.map(item => ({
            ...item,
            profit: (item.revenue || 0) - (item.expenses || 0)
        }));
        setChartData(processed);
    };

    const handleFilterChange = (mode: 'all' | 'month', month?: number, year?: number) => {
        startTransition(async () => {
            try {
                let result: AnalyticsData;
                if (mode === 'all') {
                    result = await getAnalyticsData();
                } else {
                    result = await getAnalyticsData({
                        month: month || selectedMonth,
                        year: year || selectedYear
                    });
                }
                processData(result.monthlyStats);
            } catch (error) {
                console.error("Failed to fetch analytics data:", error);
            }
        });
    };

    // Calculate max value for Y-axis domain
    const maxValue = Math.max(
        ...chartData.map(d => Math.max(d.revenue || 0, d.expenses || 0, Math.abs(d.profit || 0))),
        1000 // Prevent 0 domain if empty
    );
    const yAxisMax = Math.ceil(maxValue / 1000) * 1000 + 1000;

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const years = [2026, 2027, 2028, 2029, 2030];

    return (
        <div className="glass-panel rounded-3xl p-4 md:p-6 border-white/[0.03] relative group">
            {/* Background Glow Effect - Scoped with its own overflow container */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            </div>

            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-8 relative z-10">
                <div className="flex flex-col gap-4">
                    <h3 className="text-xl md:text-2xl text-white uppercase font-bold flex items-center gap-3">
                        Financial Analysis
                        {isPending && <span className="text-xs text-white/30 animate-pulse font-normal">Updating...</span>}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        {/* Filter Mode Toggle */}
                        <div className="flex bg-black/40 p-1 rounded-lg border border-white/5 w-fit">
                            <button
                                onClick={() => {
                                    setFilterMode('all');
                                    handleFilterChange('all');
                                }}
                                className={`px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-widest transition-all ${filterMode === 'all'
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                All History
                            </button>
                            <button
                                onClick={() => {
                                    setFilterMode('month');
                                    const currentMonth = new Date().getMonth() + 1;
                                    const currentYear = new Date().getFullYear();
                                    handleFilterChange('month', currentMonth, currentYear);
                                    setSelectedMonth(currentMonth);
                                    setSelectedYear(currentYear);
                                }}
                                className={`px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-widest transition-all ${filterMode === 'month'
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                Monthly
                            </button>
                        </div>

                        {/* Custom Month/Year Selectors */}
                        {filterMode === 'month' && (
                            <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300 py-1">
                                <MonthYearDropdown prop="month" value={selectedMonth} options={months.map((m, i) => ({ value: i + 1, label: m }))} onChange={(m) => {
                                    setSelectedMonth(m);
                                    handleFilterChange('month', m, selectedYear);
                                }} />
                                <div className="min-w-[80px]">
                                    <MonthYearDropdown prop="year" value={selectedYear} options={years.map(y => ({ value: y, label: y.toString() }))} onChange={(y) => {
                                        setSelectedYear(y);
                                        handleFilterChange('month', selectedMonth, y);
                                    }} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">Expenses</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">Profit</span>
                    </div>
                </div>
            </div>

            <div className={`${isMobile ? 'h-[280px]' : 'h-[350px]'} w-full`}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 20, right: isMobile ? 5 : 20, left: isMobile ? -20 : 10, bottom: 20 }}>
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
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="month"
                            stroke="rgba(255,255,255,0.1)"
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'var(--font-outfit)', fontWeight: 500 }}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            interval="preserveStartEnd"
                            minTickGap={30}
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.1)"
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: isMobile ? 8 : 10, fontFamily: 'var(--font-outfit)', fontWeight: 500 }}
                            tickLine={false}
                            axisLine={false}
                            width={isMobile ? 50 : 80}
                            domain={[0, yAxisMax]}
                            tickFormatter={(value) => {
                                if (value === 0) return '0';
                                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                                return value.toString();
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3B82F6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            animationDuration={1000}
                        />
                        <Area
                            type="monotone"
                            dataKey="expenses"
                            stroke="#EF4444"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorExpenses)"
                            animationDuration={1000}
                        />
                        <Area
                            type="monotone"
                            dataKey="profit"
                            stroke="#10B981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorProfit)"
                            animationDuration={1000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
