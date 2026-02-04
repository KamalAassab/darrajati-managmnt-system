'use client';

import { Client } from '@/types/admin';
import { Users, CreditCard, Bike } from 'lucide-react';
import { formatMAD } from '@/lib/utils/currency';

interface ClientStatsProps {
    clients: Client[];
}

export function ClientStats({ clients }: ClientStatsProps) {
    const totalClients = clients.length;
    const activeRentals = clients.filter(c => c.currentScooter).length;
    const totalDeposits = clients.reduce((sum, c) => sum + (c.depositAmount || 0), 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Clients */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                <div>
                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-1">Total Clients</p>
                    <h3 className="text-4xl font-anton text-white">{totalClients}</h3>
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-orange" />
                </div>
            </div>

            {/* Active Rentals */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                <div>
                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-1">Active Rentals</p>
                    <h3 className="text-4xl font-anton text-white">{activeRentals}</h3>
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                    <Bike className="w-6 h-6 text-blue-500" />
                </div>
            </div>

            {/* Deposits */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                <div>
                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-1">Total Deposits</p>
                    <h3 className="text-4xl font-anton text-white">{formatMAD(totalDeposits)}</h3>
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-green-500" />
                </div>
            </div>
        </div>
    );
}
