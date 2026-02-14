'use client';

import { RentalWithDetails } from '@/types/admin';
import { formatMAD, formatDate, formatDateShort, isOverdue } from '@/lib/utils/currency';
import { Bike, CreditCard, ArrowUpRight, ShieldCheck } from 'lucide-react';
import DeleteRentalButton from '@/app/dashboard/rentals/components/DeleteRentalButton';
import CompleteRentalButton from '@/app/dashboard/rentals/components/CompleteRentalButton';
import RevertRentalButton from '@/app/dashboard/rentals/components/RevertRentalButton';

interface RentalCardProps {
    rental: RentalWithDetails;
    onPayment: (rental: RentalWithDetails) => void;
}

export function RentalCard({ rental, onPayment }: RentalCardProps) {
    const overdue = isOverdue(rental.endDate) && rental.status === 'active';
    const totalPaid = rental.amountPaid || 0;
    const totalPrice = rental.totalPrice || 0;
    const remaining = Math.max(0, totalPrice - totalPaid);

    // Payment Status logic
    const isFullyPaid = totalPaid >= totalPrice;
    const isPartial = totalPaid > 0 && totalPaid < totalPrice;
    const isUnpaid = totalPaid === 0;

    const paymentPercentage = totalPrice > 0 ? Math.min(100, (totalPaid / totalPrice) * 100) : 0;

    return (
        <div className={`group/rental relative bg-[#0a0a0a] border rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-2xl flex flex-col ${overdue
            ? 'border-red-500/50 shadow-[0_0_40px_-10px_rgba(239,68,68,0.3)] hover:border-red-500'
            : 'border-white/10 hover:border-primary/50 hover:shadow-[0_0_40px_-20px_rgba(234,104,25,0.3)]'
            }`}>
            {/* Top Status Indicators */}
            <div className="px-5 pt-5 flex items-center justify-between gap-2 z-10">
                <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${rental.status === 'active'
                        ? overdue
                            ? 'bg-red-500/10 border-red-500/20 text-red-500'
                            : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        : 'bg-green-500/10 border-green-500/20 text-green-400'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${rental.status === 'active'
                            ? overdue ? 'bg-red-500 animate-pulse' : 'bg-blue-400'
                            : 'bg-green-400'
                            }`} />
                        {overdue ? 'Overdue' : rental.status === 'active' ? 'Active' : 'Completed'}
                    </span>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${isFullyPaid
                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-500'
                        }`}>
                        {isFullyPaid ? 'Paid' : isPartial ? 'Partial' : 'Unpaid'}
                    </span>

                    {rental.hasGuarantee && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border bg-purple-500/10 border-purple-500/20 text-purple-400">
                            <ShieldCheck className="w-3 h-3" />
                            Deposit
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onPayment(rental)}
                        className={`p-3 rounded-xl transition-all border flex items-center justify-center hover:scale-105 active:scale-95 ${isFullyPaid
                            ? 'bg-white/5 text-white/10 border-white/5 cursor-not-allowed'
                            : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                            }`}
                        disabled={isFullyPaid}
                        title="Add Payment"
                    >
                        <CreditCard className="w-4 h-4" />
                    </button>
                    <DeleteRentalButton rentalId={rental.id} />
                </div>
            </div>

            {/* Client & Info */}
            <div className="p-4 md:p-5 space-y-4 flex-1">
                <div>
                    <h3 className="text-lg md:text-2xl font-black font-outfit text-white uppercase tracking-tighter leading-tight truncate group-hover/rental:text-primary transition-colors">
                        {rental.client.fullName}
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
                    {/* Scooter Info Card */}
                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3 flex items-center justify-between group/scooter transition-colors hover:bg-white/[0.05]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                <Bike className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-white tracking-wide truncate">{rental.scooter.name}</p>
                                {rental.scooterMatricule && (
                                    <div className="mt-1">
                                        <span className="inline-block bg-black/40 border border-white/10 px-1.5 py-0.5 rounded text-[10px] font-poppins text-white/70 tracking-wider">
                                            {rental.scooterMatricule}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Dates Card */}
                    <div className="flex items-center justify-center gap-3 p-3 bg-white/[0.03] border border-white/5 rounded-2xl group/dates hover:bg-white/[0.05] transition-colors">
                        <div className="text-center">
                            <p className="text-sm font-black text-white tracking-tight">{formatDateShort(rental.startDate)}</p>
                        </div>
                        <div className="h-px w-4 bg-white/10" />
                        <div className="text-center">
                            <p className={`text-sm font-black tracking-tight ${overdue ? 'text-red-500' : 'text-white'}`}>
                                {formatDateShort(rental.endDate)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end gap-2">
                        <span className="text-[9px] md:text-[10px] font-bold text-white/30 uppercase tracking-widest truncate">Payment Progress</span>
                        <div className="text-right shrink-0">
                            <span className="text-[9px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest">Rem: </span>
                            <span className="text-[10px] md:text-xs font-price text-[#ea6819] font-bold">{formatMAD(remaining)}</span>
                        </div>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/10">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${isFullyPaid
                                ? 'bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                                : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                                }`}
                            style={{ width: `${paymentPercentage}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black tracking-tighter">
                        <span className="text-white/60">{formatMAD(totalPaid)}</span>
                        <span className="text-white/20">OF</span>
                        <span className="text-white/60">{formatMAD(totalPrice)}</span>
                    </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-2">
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            {rental.status === 'active' ? (
                                <CompleteRentalButton rentalId={rental.id} />
                            ) : (
                                <RevertRentalButton rentalId={rental.id} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


