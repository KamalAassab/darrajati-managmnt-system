'use client';

import { Client } from '@/types/admin';
import { Phone, CreditCard, Bike, Edit2, Trash2, ShieldCheck, User, IdCard, Activity } from 'lucide-react';
import { formatMAD } from '@/lib/utils/currency';

interface ClientCardProps {
    client: Client;
    onEdit: (client: Client) => void;
    onDelete: (id: string, name: string) => void;
}

export function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
    return (
        <div className="group relative bg-[#0a0a0a] border border-white/10 hover:border-primary/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 flex flex-col">
            {/* Header with Name & Status */}
            <div className="p-5 pb-0">
                <div className="flex justify-between items-start gap-3">
                    <div className='flex-1 min-w-0'>
                        <h3 className="text-lg font-black font-outfit text-white uppercase tracking-tight truncate group-hover:text-primary transition-colors">
                            {client.fullName}
                        </h3>
                        {/* Status Inline - Subtitle */}
                        <div className="flex items-center gap-2 mt-1">
                            {client.currentScooter ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                    Renting
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-bold text-white/30 uppercase tracking-wider">
                                    Inactive
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onEdit(client)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => onDelete(client.id, client.fullName)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/60 hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Compact Details Grid */}
            <div className="p-5 grid grid-cols-2 gap-2">
                <div className="bg-white/[0.03] rounded-xl p-2.5 border border-white/[0.03] hover:border-white/10 transition-colors">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-1">Document ID</p>
                    <div className="flex items-center gap-2">
                        <IdCard className="w-3.5 h-3.5 text-white/40" />
                        <span className="text-sm font-bold text-white/80">{client.documentId}</span>
                    </div>
                </div>

                <div className="bg-white/[0.03] rounded-xl p-2.5 border border-white/[0.03] hover:border-white/10 transition-colors">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-1">Phone</p>
                    <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-white/40" />
                        <span className="text-sm font-bold text-white/80 truncate" title={client.phone}>{client.phone}</span>
                    </div>
                </div>



                {client.currentScooter && (
                    <div className="col-span-2 bg-blue-500/[0.03] rounded-xl p-2.5 border border-blue-500/10 flex items-center justify-between group/scooter">
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-blue-400/50 mb-0.5">Active Rental</p>
                            <p className="text-xs font-bold text-blue-100">{client.currentScooter}</p>
                            {client.currentScooterMatricule && (
                                <div className="mt-1">
                                    <span className="inline-block bg-blue-950/30 border border-blue-500/20 px-1.5 py-0.5 rounded text-[10px] font-poppins text-blue-200/70 tracking-wider">
                                        {client.currentScooterMatricule}
                                    </span>
                                </div>
                            )}
                        </div>
                        <Bike className="w-4 h-4 text-blue-400 group-hover/scooter:translate-x-1 transition-transform" />
                    </div>
                )}
            </div>
        </div>
    );
}
