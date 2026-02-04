'use client';

import { useState, useEffect } from 'react';
import { Rental, RentalPayment } from '@/types/admin';
import { addRentalPayment, getRentalPayments, deleteRentalPayment } from '@/app/actions';
import { X, Plus, Trash2, DollarSign, Calendar, FileText, Loader2 } from 'lucide-react';
import { formatMAD } from '@/lib/utils/currency';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface RentalPaymentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    rental: Rental | null;
}

export function RentalPaymentsModal({ isOpen, onClose, rental }: RentalPaymentsModalProps) {
    const { t } = useLanguage();
    const [payments, setPayments] = useState<RentalPayment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // New payment form state
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        if (isOpen && rental) {
            fetchPayments();
            setShowAddForm(false);
            setAmount('');
            setNotes('');
            setDate(new Date().toISOString().split('T')[0]);
        }
    }, [isOpen, rental]);

    const fetchPayments = async () => {
        if (!rental) return;
        setIsLoading(true);
        try {
            const data = await getRentalPayments(rental.id);
            setPayments(data);
        } catch (error) {
            console.error('Failed to fetch payments', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rental) return;

        setIsSubmitting(true);
        try {
            const result = await addRentalPayment(rental.id, Number(amount), date, notes);
            if (result.success) {
                // Refresh payments
                await fetchPayments();
                setAmount('');
                setNotes('');
                setShowAddForm(false);
            } else {
                alert(result.message || 'Failed to add payment');
            }
        } catch (error) {
            console.error('Error adding payment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePayment = async (paymentId: string) => {
        if (!rental || !confirm('Are you sure you want to delete this payment?')) return;

        try {
            const result = await deleteRentalPayment(paymentId, rental.id);
            if (result.success) {
                await fetchPayments();
            } else {
                alert(result.message || 'Failed to delete payment');
            }
        } catch (error) {
            console.error('Error deleting payment:', error);
        }
    };

    if (!isOpen || !rental) return null;

    // Calculate totals based on LOCAL state (payments), not just rental prop,
    // although rental prop might be stale until parent refreshes.
    // Actually, fetchPayments updates local list.
    // Ideally we should trust the server, but for UI feedback let's sum local payments.
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = Math.max(0, rental.totalPrice - totalPaid);
    const progress = Math.min(100, (totalPaid / rental.totalPrice) * 100);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-[#0a0a0a] flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-anton uppercase tracking-wide text-white flex items-center gap-2">
                            <DollarSign className="w-6 h-6 text-green-500" />
                            Payment History
                        </h2>
                        <p className="text-xs text-white/50 font-mono mt-1">Rental ID: {rental.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Summary Card */}
                <div className="p-6 bg-white/5 border-b border-white/5">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                            <span className="text-[10px] uppercase text-white/40 font-bold block mb-1">Total Price</span>
                            <span className="text-lg font-bold text-white">{formatMAD(rental.totalPrice)}</span>
                        </div>
                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                            <span className="text-[10px] uppercase text-white/40 font-bold block mb-1">Total Paid</span>
                            <span className="text-lg font-bold text-green-400">{formatMAD(totalPaid)}</span>
                        </div>
                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                            <span className="text-[10px] uppercase text-white/40 font-bold block mb-1">Remaining</span>
                            <span className="text-lg font-bold text-orange">{formatMAD(remaining)}</span>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-black rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="mt-1 text-right text-[10px] text-white/40 font-mono">
                        {progress.toFixed(1)}% Paid
                    </div>
                </div>

                {/* Payments List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 text-orange animate-spin" />
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="text-center py-8 text-white/30">
                            <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>No payments recorded yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {payments.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 font-bold">
                                            $
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-lg">{formatMAD(payment.amount)}</div>
                                            <div className="flex items-center gap-2 text-xs text-white/40">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(payment.date).toLocaleDateString()}
                                                {payment.notes && (
                                                    <span className="flex items-center gap-1 border-l border-white/10 pl-2 ml-1">
                                                        <FileText className="w-3 h-3" />
                                                        {payment.notes}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeletePayment(payment.id)}
                                        className="p-2 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded-lg transition-all"
                                        title="Delete Payment"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer / Add Action */}
                <div className="p-6 border-t border-white/10 bg-[#0a0a0a]">
                    {!showAddForm ? (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-xl text-white/60 hover:text-white transition-all flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-sm"
                        >
                            <Plus className="w-5 h-5" />
                            Add New Payment
                        </button>
                    ) : (
                        <form onSubmit={handleAddPayment} className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10 animate-in slide-in-from-bottom-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-sm font-bold text-white">New Payment</h3>
                                <button type="button" onClick={() => setShowAddForm(false)} className="text-xs text-white/50 hover:text-white">Cancel</button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-white/40 mb-1 block">Amount</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-white/40 mb-1 block">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-bold text-white/40 mb-1 block">Notes (Optional)</label>
                                <input
                                    type="text"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                                    placeholder="Weekly payment..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 bg-green-600 hover:bg-green-500 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                                Confirm Payment
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
