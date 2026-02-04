'use client';

import { Lightbulb, Sparkles } from 'lucide-react';

export default function SmartTips({ tips }: { tips: string[] }) {
    return (
        <div className="glass-panel-dark rounded-3xl p-6 h-full border-orange/10 relative overflow-hidden group">
            {/* Background Decor */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange/10 rounded-full blur-3xl group-hover:bg-orange/15 transition-all duration-700" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <Sparkles className="w-6 h-6 text-orange animate-pulse" />
                <h3 className="text-2xl font-outfit font-black tracking-wide text-white uppercase font-normal">AI Insights</h3>
            </div>

            <div className="space-y-4 relative z-10">
                {tips.map((tip, index) => (
                    <div key={index} className="flex gap-4 p-4 rounded-2xl bg-gradient-to-r from-white/[0.03] to-transparent border-l-4 border-orange/50 hover:border-orange transition-all">
                        <Lightbulb className="w-6 h-6 text-orange/80 shrink-0 mt-0.5" />
                        <p className="text-sm font-bold text-white/90 leading-relaxed">
                            {tip}
                        </p>
                    </div>
                ))}

                {tips.length === 0 && (
                    <div className="text-center py-10 text-white/20 uppercase tracking-widest text-xs font-bold">
                        Gathering more data...
                    </div>
                )}
            </div>
        </div>
    );
}
