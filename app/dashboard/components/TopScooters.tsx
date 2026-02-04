'use client';

import { TrendingUp, Trophy } from 'lucide-react';

export default function TopScooters({ scooters }: { scooters: any[] }) {
    return (
        <div className="glass-panel rounded-3xl p-6 h-full border-white/[0.05]">
            <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <h3 className="text-2xl font-outfit font-black tracking-wide text-white uppercase font-normal">Top Performers</h3>
            </div>

            <div className="space-y-3">
                {scooters.map((scooter, index) => (
                    <div key={scooter.id} className="group flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors border border-white/[0.02] hover:border-white/10">
                        <div className="flex items-center gap-4">
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-outfit font-black
                                ${index === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                                    index === 1 ? 'bg-white/10 text-white/80 border border-white/20' :
                                        index === 2 ? 'bg-orange/10 text-orange/80 border border-orange/20' :
                                            'bg-white/5 text-white/40 border border-white/5'}
                            `}>
                                {index + 1}
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-white uppercase tracking-tight group-hover:text-orange transition-colors">
                                    {scooter.name}
                                </h4>

                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-white font-mono bg-white/5 px-2 py-1 rounded-md inline-block">
                                {scooter.revenue.toLocaleString()} <span className="text-[10px] text-white/40">MAD</span>
                            </div>
                            <div className="flex items-center justify-end gap-1 text-[10px] text-white/50 uppercase tracking-wider mt-1 font-bold">
                                <TrendingUp className="w-3 h-3" />
                                {scooter.trips} Trips
                            </div>
                        </div>
                    </div>
                ))}

                {scooters.length === 0 && (
                    <div className="text-center py-10 text-white/20 uppercase tracking-widest text-xs font-bold">
                        No active rentals yet
                    </div>
                )}
            </div>
        </div>
    );
}
