'use client';

import { RentalWithDetails } from '@/types/admin';
import { formatMAD, formatDate, isOverdue } from '@/lib/utils/currency';
import { Calendar, User, Bike, DollarSign, CheckCircle, AlertCircle, Clock, Trash2, Edit2, CreditCard } from 'lucide-react';
import DeleteRentalButton from '@/app/dashboard/rentals/components/DeleteRentalButton';
import CompleteRentalButton from '@/app/dashboard/rentals/components/CompleteRentalButton';

interface RentalCardProps {
    rental: RentalWithDetails;
    onPayment: (rental: RentalWithDetails) => void;
}

export function RentalCard({ rental, onPayment }: RentalCardProps) {
    const overdue = isOverdue(rental.endDate) && rental.status === 'active';
    const remaining = rental.totalPrice - rental.amountPaid;
    const isPaid = remaining <= 0;

    return (
        <div className={`group relative bg-[#0a0a0a] border hover:border-orange/50 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-orange/10 flex flex-col ${overdue ? 'border-red-500/30' : 'border-white/10'}`}>
            {/* Header / Banner */}
            <div className={`p-6 bg-gradient-to-r relative ${overdue ? 'from-red-500/10' : 'from-white/5'} to-transparent flex justify-between items-start`}>
                <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-1 group-hover:text-orange transition-colors truncate max-w-[180px]">
                        {rental.client.fullName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-white/40">
                        <User className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">{rental.client.phone}</span>
                    </div>
                </div>

                <div className="relative z-10">
                    <span className={`px-2.5 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wide flex items-center gap-1.5 ${rental.status === 'active'
                        ? overdue ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                        : 'bg-green-500/20 border-green-500/30 text-green-400'
                        }`}>
                        <span className={`w-1 h-1 rounded-full animate-pulse ${rental.status === 'active'
                            ? overdue ? 'bg-red-400' : 'bg-blue-400'
                            : 'bg-green-400'
                            }`} />
                        {overdue ? 'Overdue' : rental.status}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 pt-2 relative flex-1 flex flex-col">

                {/* Scooter Info */}
                <div className="bg-white/5 rounded-xl p-3 border border-white/5 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-orange">
                            <Bike className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Scooter</p>
                            <p className="text-sm font-bold text-white tracking-tight">{rental.scooter.name}</p>
                        </div>
                    </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Start</p>
                        <div className="flex items-center gap-1.5 text-white/80">
                            <Calendar className="w-3 h-3" />
                            <span className="text-xs font-bold">{formatDate(rental.startDate)}</span>
                        </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">End</p>
                        <div className="flex items-center gap-1.5 text-white/80">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs font-bold">{formatDate(rental.endDate)}</span>
                        </div>
                    </div>
                </div>

                {/* Financials */}
                <div className="flex flex-col gap-3 mb-6">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Duration</p>
                        <span className="font-bold text-sm text-white">
                            {Math.ceil(Math.abs(new Date(rental.endDate).getTime() - new Date(rental.startDate).getTime()) / (1000 * 60 * 60 * 24))} Days
                        </span>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Total</p>
                        <span className="font-bold text-sm text-white">{formatMAD(rental.totalPrice)}</span>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Paid</p>
                        <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm ${isPaid ? 'text-green-500' : 'text-white'}`}>{formatMAD(rental.amountPaid)}</span>
                            {!isPaid && (
                                <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">
                                    -{formatMAD(remaining)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-auto grid grid-cols-2 gap-3 opacity-100 sm:opacity-0 sm:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    {rental.status === 'active' ? (
                        <div className="col-span-2">
                            <CompleteRentalButton rentalId={rental.id} />
                        </div>
                    ) : null}

                    <button
                        onClick={() => onPayment(rental)}
                        className="py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-white/5 hover:border-orange/30"
                    >
                        <CreditCard className="w-3.5 h-3.5" />
                        Pay
                    </button>

                    <div className="w-full">
                        <DeleteRentalButton rentalId={rental.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
