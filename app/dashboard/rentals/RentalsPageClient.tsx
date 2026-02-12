'use client';

import Link from 'next/link';
import { Plus, Search, Activity, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { RentalPaymentsModal } from '@/components/admin/RentalPaymentsModal';
import { useState } from 'react';
import { RentalWithDetails } from '@/types/admin';
import { RentalStats } from '@/components/admin/RentalStats';
import { RentalCard } from '@/components/admin/RentalCard';
import { cn } from '@/lib/utils';
import { isOverdue } from '@/lib/utils/currency';

interface RentalsPageClientProps {
    activeRentals: RentalWithDetails[];
    completedRentals: RentalWithDetails[];
}

export default function RentalsPageClient({ activeRentals, completedRentals }: RentalsPageClientProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'overdue' | 'completed'>('all');
    const [paymentModalRental, setPaymentModalRental] = useState<RentalWithDetails | null>(null);

    // Combine all rentals for filtering
    const allRentals = [...activeRentals, ...completedRentals];

    // Filter rentals
    const filteredRentals = allRentals.filter(rental => {
        const matchesSearch =
            rental.client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rental.scooter.name.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesStatus = true;
        const rentalIsOverdue = rental.status === 'active' && isOverdue(rental.endDate);

        switch (statusFilter) {
            case 'active':
                matchesStatus = rental.status === 'active' && !rentalIsOverdue;
                break;
            case 'overdue':
                matchesStatus = rentalIsOverdue;
                break;
            case 'completed':
                matchesStatus = rental.status === 'completed';
                break;
            default:
                matchesStatus = true;
        }

        return matchesSearch && matchesStatus;
    });

    const overdueCount = activeRentals.filter(r => isOverdue(r.endDate)).length;
    const activeCount = activeRentals.length - overdueCount;
    const completedCount = completedRentals.length;

    return (
        <div className="space-y-8 pb-20 font-outfit">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl text-white uppercase flex items-center gap-3 font-anton">
                        <Activity className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                        Rentals
                    </h1>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* Create Button */}
                    <Link
                        href="/dashboard/rentals/new"
                        className="bg-primary text-white w-full md:w-auto h-12 md:h-auto px-6 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all duration-300 primary-glow font-bold uppercase tracking-tight active:scale-95 cursor-pointer shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create Rental</span>
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <RentalStats activeRentals={activeRentals} completedRentals={completedRentals} />

            {/* Filters & Search Bar */}
            <div className="flex flex-col-reverse md:flex-row gap-4 items-center justify-between">
                {/* Filter Tabs */}
                <div className="flex p-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar shadow-xl shadow-black/5">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                            statusFilter === 'all'
                                ? "bg-white text-black shadow-lg scale-[1.02]"
                                : "text-white/50 hover:text-white hover:bg-white/5"
                        )}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setStatusFilter('active')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                            statusFilter === 'active'
                                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20 scale-[1.02]"
                                : "text-white/50 hover:text-blue-400 hover:bg-blue-500/10"
                        )}
                    >
                        <Activity className="w-4 h-4" />
                        Active
                        <span className={cn(
                            "text-[9px] w-5 h-5 flex items-center justify-center rounded-full ml-1.5 font-bold transition-colors",
                            statusFilter === 'active' ? "bg-white/20 text-white" : "bg-white/10 text-white/60"
                        )}>{activeCount}</span>
                    </button>
                    <button
                        onClick={() => setStatusFilter('overdue')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                            statusFilter === 'overdue'
                                ? "bg-red-500 text-white shadow-lg shadow-red-500/20 scale-[1.02]"
                                : "text-white/50 hover:text-red-400 hover:bg-red-500/10"
                        )}
                    >
                        <AlertCircle className="w-4 h-4" />
                        Overdue
                        {overdueCount > 0 && (
                            <span className={cn(
                                "text-[9px] w-5 h-5 flex items-center justify-center rounded-full ml-1.5 font-bold transition-colors",
                                statusFilter === 'overdue' ? "bg-white/20 text-white" : "bg-red-500/20 text-red-200"
                            )}>{overdueCount}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setStatusFilter('completed')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                            statusFilter === 'completed'
                                ? "bg-green-500 text-white shadow-lg shadow-green-500/20 scale-[1.02]"
                                : "text-white/50 hover:text-green-400 hover:bg-green-500/10"
                        )}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Completed
                        <span className={cn(
                            "text-[9px] w-5 h-5 flex items-center justify-center rounded-full ml-1.5 font-bold transition-colors",
                            statusFilter === 'completed' ? "bg-white/20 text-white" : "bg-white/10 text-white/60"
                        )}>{completedCount}</span>
                    </button>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-72 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search client, scooter..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-medium placeholder:text-white/20 shadow-xl shadow-black/5"
                    />
                </div>
            </div>

            {/* Content Area */}
            {filteredRentals.length === 0 ? (
                <div className="glass-panel rounded-3xl text-center border-dashed border-white/10 flex flex-col items-center justify-center p-8 sm:p-12 md:p-16 min-h-[260px] sm:min-h-[320px] md:min-h-[400px] w-full">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                        {statusFilter === 'overdue' ? (
                            <Clock className="w-8 h-8 text-white/20" />
                        ) : statusFilter === 'completed' ? (
                            <CheckCircle2 className="w-8 h-8 text-white/20" />
                        ) : (
                            <Activity className="w-8 h-8 text-white/20" />
                        )}
                    </div>
                    <h3 className="text-xl text-white font-medium mb-2">No Rentals Found</h3>
                    <p className="text-white/40 text-sm max-w-xs mx-auto">
                        {statusFilter === 'all'
                            ? "Try adjusting your search terms or create a new rental."
                            : `There are no ${statusFilter} rentals matching your criteria.`}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 animate-in slide-in-from-bottom-4 duration-500">
                        {filteredRentals.map((rental) => (
                            <RentalCard
                                key={rental.id}
                                rental={rental}
                                onPayment={setPaymentModalRental}
                            />
                        ))}
                    </div>
            )}

                    <RentalPaymentsModal
                        isOpen={!!paymentModalRental}
                        onClose={() => setPaymentModalRental(null)}
                        rental={paymentModalRental}
                    />
                </div>
            );
}
