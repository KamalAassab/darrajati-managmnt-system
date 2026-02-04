'use client';

import { RentalWithDetails } from '@/types/admin';
import { formatMAD } from '@/lib/utils/currency';
import { Bike, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';
import { isOverdue } from '@/lib/utils/currency';

interface RentalStatsProps {
    activeRentals: RentalWithDetails[];
    completedRentals: RentalWithDetails[];
}

export function RentalStats({ activeRentals, completedRentals }: RentalStatsProps) {
    const totalRentals = activeRentals.length + completedRentals.length;

    // Calculate total revenue (sum of amountPaid from all rentals)
    const totalRevenue = [...activeRentals, ...completedRentals].reduce(
        (sum, rental) => sum + (rental.amountPaid || 0),
        0
    );

    const overdueCount = activeRentals.filter(r => isOverdue(r.endDate)).length;

    const stats = [
        {
            label: 'Active Rentals',
            value: activeRentals.length,
            icon: Bike,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            border: 'border-blue-400/20'
        },
        {
            label: 'Completed',
            value: completedRentals.length,
            icon: CheckCircle,
            color: 'text-green-400',
            bg: 'bg-green-400/10',
            border: 'border-green-400/20'
        },
        {
            label: 'Total Revenue',
            value: formatMAD(totalRevenue),
            icon: TrendingUp,
            color: 'text-orange',
            bg: 'bg-orange/10',
            border: 'border-orange/20'
        },
        {
            label: 'Overdue',
            value: overdueCount,
            icon: AlertCircle,
            color: 'text-red-400',
            bg: 'bg-red-400/10',
            border: 'border-red-400/20'
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <div key={index} className={`glass-panel p-5 rounded-2xl border ${stat.border} relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}>
                    <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${stat.color}`}>
                        <stat.icon className="w-16 h-16" />
                    </div>

                    <div className="relative z-10 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-6 h-6" />
                        </div>

                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-0.5">{stat.label}</p>
                            <h3 className="text-2xl font-anton text-white tracking-wide">{stat.value}</h3>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
