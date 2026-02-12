'use client';

import { formatMAD } from '@/lib/utils/currency';
import { TrendingUp, Award, Bike } from 'lucide-react';

interface TopScootersProps {
    scooters: {
        id: string;
        name: string;
        image: string;
        revenue: number;
        trips: number;
    }[];
}

export default function TopScooters({ scooters }: TopScootersProps) {
    if (!scooters || scooters.length === 0) {
        return (
            <div className="glass-panel rounded-3xl p-6 border-white/[0.03] h-full flex items-center justify-center">
                <div className="text-center">
                    <Award className="w-10 h-10 text-white/10 mx-auto mb-3" />
                    <p className="text-xs text-white/30 uppercase tracking-widest">No Performance Data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel rounded-3xl p-4 md:p-5 border-white/[0.03] hover:border-white/[0.08] transition-all duration-500 h-full">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="text-lg md:text-xl text-white uppercase font-bold">Top Performance</h3>
            </div>

            {/* Compact List */}
            <div className="space-y-2">
                {scooters.map((scooter, index) => (
                    <div
                        key={scooter.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-primary/20 hover:bg-white/[0.04] transition-all group"
                    >
                        {/* Left: Rank + Name */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px] font-black text-primary">{index + 1}</span>
                            </div>
                            <span className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
                                {scooter.name}
                            </span>
                        </div>

                        {/* Right: Trips + Revenue */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="text-right">
                                <span className="block text-xs font-black text-white/80">{scooter.trips}</span>
                                <span className="block text-[9px] uppercase tracking-widest text-white/30">Trips</span>
                            </div>
                            <div className="text-right min-w-[80px]">
                                <span className="block text-sm font-black text-primary font-outfit">{formatMAD(scooter.revenue)}</span>
                                <span className="block text-[9px] uppercase tracking-widest text-white/30">Revenue</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
