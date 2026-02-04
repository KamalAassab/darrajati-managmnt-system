'use client';

import { Client } from '@/types/admin';
import { Phone, CreditCard, Bike, Edit2, Trash2, ShieldCheck, User, IdCard } from 'lucide-react';
import { formatMAD } from '@/lib/utils/currency';

interface ClientCardProps {
    client: Client;
    onEdit: (client: Client) => void;
    onDelete: (id: string, name: string) => void;
}

export function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
    return (
        <div className="group relative bg-[#0a0a0a] border border-white/10 hover:border-orange/50 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-orange/10 flex flex-col">
            {/* Header / Banner */}
            <div className="h-16 bg-gradient-to-r from-white/5 to-transparent relative">
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                    {client.currentScooter && (
                        <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-wide flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                            Renting
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 pt-2 relative flex-1 flex flex-col">

                {/* Identity */}
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-1 group-hover:text-orange transition-colors">
                        {client.fullName}
                    </h3>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-white/40">
                            <IdCard className="w-3.5 h-3.5" />
                            <span className="text-sm font-bold">{client.documentId}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-white/40">
                            <Phone className="w-3.5 h-3.5" />
                            <span className="text-sm font-bold">{client.phone}</span>
                        </div>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="flex flex-col gap-3 mb-6">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Deposit</p>
                        {client.hasDeposit ? (
                            <div className="flex items-center gap-2 text-green-500">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="font-bold text-sm">{formatMAD(client.depositAmount)}</span>
                            </div>
                        ) : (
                            <span className="text-xs font-bold text-white/20">None</span>
                        )}
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Status</p>
                        {client.currentScooter ? (
                            <div className="flex items-center gap-2 text-blue-500">
                                <Bike className="w-4 h-4" />
                                <span className="font-bold text-sm tracking-tight truncate max-w-[120px]" title={client.currentScooter}>
                                    {client.currentScooter}
                                </span>
                            </div>
                        ) : (
                            <span className="text-xs font-bold text-white/20">Inactive</span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-auto grid grid-cols-2 gap-3 opacity-100 sm:opacity-0 sm:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <button
                        onClick={() => onEdit(client)}
                        className="py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(client.id, client.fullName)}
                        className="py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500/60 hover:text-red-500 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
