'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateRental } from '@/app/actions';
import { calculateRentalPrice, formatMAD } from '@/lib/utils/currency';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditRentalPageClient({
    rental,
    scooters,
}: {
    rental: any;
    scooters: any[];
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [selectedScooter, setSelectedScooter] = useState(rental.scooterId);
    const [startDate, setStartDate] = useState(rental.startDate);
    const [endDate, setEndDate] = useState(rental.endDate);
    const [totalPrice, setTotalPrice] = useState(rental.totalPrice);
    const [amountPaid, setAmountPaid] = useState(rental.amountPaid);
    const [paymentMethod, setPaymentMethod] = useState(rental.paymentMethod);
    const [notes, setNotes] = useState(rental.notes || '');

    const [isAmountManuallyChanged, setIsAmountManuallyChanged] = useState(true);

    useEffect(() => {
        if (selectedScooter && startDate && endDate) {
            const scooter = scooters.find(s => s.id === selectedScooter);
            if (scooter) {
                const price = calculateRentalPrice(scooter.price, startDate, endDate);
                setTotalPrice(price);
            }
        }
    }, [selectedScooter, startDate, endDate, scooters]);

    const derivedPaymentStatus = amountPaid >= totalPrice ? 'paid' : (amountPaid > 0 ? 'partial' : 'pending');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        formData.set('clientId', rental.clientId);
        formData.set('scooterId', selectedScooter);
        formData.set('totalPrice', totalPrice.toString());
        formData.set('amountPaid', amountPaid.toString());
        formData.set('paymentStatus', derivedPaymentStatus);

        try {
            const result = await updateRental(rental.id, formData);
            if (result.success) {
                router.push('/dashboard/rentals');
                router.refresh();
            } else {
                alert(`Error: ${result.message}`);
                setLoading(false);
            }
        } catch (error) {
            alert('A critical error occurred while updating the rental');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl">
            <Link
                href="/dashboard/rentals"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Rentals
            </Link>

            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Edit Rental #{rental.id}</h1>
                <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${rental.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-white/50'
                    }`}>
                    {rental.status}
                </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Read-Only Client Info */}
                <div className="glass-panel rounded-2xl p-8 border-white/[0.03] opacity-60 pointer-events-none">
                    <h2 className="text-xl font-bold tracking-tight text-white uppercase mb-8 border-b border-white/5 pb-4">Client Information (Locked)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-widest text-white/40 ml-1">Full Name</label>
                            <input type="text" value={rental.client.fullName} readOnly className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-widest text-white/40 ml-1">Phone</label>
                            <input type="text" value={rental.client.phone} readOnly className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium" />
                        </div>
                    </div>
                </div>

                {/* Editable Logistics */}
                <div className="glass-panel rounded-2xl p-8 border-white/[0.03]">
                    <h2 className="text-xl font-bold tracking-tight text-white uppercase mb-8 border-b border-white/5 pb-4">Rental Logistics</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-widest text-white/40 ml-1">Target Asset</label>
                            <select
                                name="scooterId"
                                required
                                value={selectedScooter}
                                onChange={(e) => setSelectedScooter(e.target.value)}
                                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium focus:ring-2 focus:ring-orange/30 outline-none transition-all appearance-none"
                            >
                                {scooters.map((scooter) => (
                                    <option key={scooter.id} value={scooter.id} className="bg-[#111]">
                                        {scooter.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-widest text-white/40 ml-1">Lease Start</label>
                            <input
                                type="date"
                                name="startDate"
                                required
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium focus:ring-2 focus:ring-orange/30 outline-none transition-all custom-calendar-picker"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-widest text-white/40 ml-1">Lease Conclusion</label>
                            <input
                                type="date"
                                name="endDate"
                                required
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate}
                                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium focus:ring-2 focus:ring-orange/30 outline-none transition-all custom-calendar-picker"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-widest text-white/40 ml-1">Deposit Amount (MAD)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="amountPaid"
                                    min="0"
                                    step="1"
                                    required
                                    value={amountPaid}
                                    onChange={(e) => setAmountPaid(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium focus:ring-2 focus:ring-orange/30 outline-none transition-all"
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-white/20 uppercase tracking-widest">MAD</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-widest text-white/40 ml-1">Transaction Method</label>
                            <select
                                name="paymentMethod"
                                required
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium focus:ring-2 focus:ring-orange/30 outline-none transition-all appearance-none"
                            >
                                <option value="cash" className="bg-[#111]">Cash</option>
                                <option value="transfer" className="bg-[#111]">Bank Transfer</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-6 bg-orange/5 border border-orange/20 rounded-2xl">
                            <p className="text-xs font-medium uppercase tracking-widest text-orange/60 mb-1">Total Valuation</p>
                            <p className="text-3xl font-bold tracking-tight text-orange uppercase">{formatMAD(totalPrice)}</p>
                        </div>

                        <div className={`p-6 border rounded-2xl ${derivedPaymentStatus === 'paid' ? 'bg-green-500/5 border-green-500/20' : 'bg-green-500/5 border-green-500/20'}`}>
                            <p className={`text-xs font-medium uppercase tracking-widest mb-1 ${derivedPaymentStatus === 'paid' ? 'text-green-500/60' : 'text-green-500/60'}`}>Deposit Amount</p>
                            <p className={`text-3xl font-bold tracking-tight uppercase ${derivedPaymentStatus === 'paid' ? 'text-green-500' : 'text-green-500'}`}>{formatMAD(amountPaid)}</p>
                        </div>

                        <div className={`p-6 border rounded-2xl ${derivedPaymentStatus === 'paid' ? 'bg-white/5 border-white/10' : 'bg-red-500/5 border-red-500/20'}`}>
                            <p className={`text-xs font-medium uppercase tracking-widest mb-1 ${derivedPaymentStatus === 'paid' ? 'text-white/40' : 'text-red-500/60'}`}>Rest to Pay</p>
                            <p className={`text-3xl font-bold tracking-tight uppercase ${derivedPaymentStatus === 'paid' ? 'text-white/40' : 'text-red-500'}`}>{formatMAD(Math.max(0, totalPrice - amountPaid))}</p>
                        </div>
                    </div>

                    <div className="mt-8 space-y-2">
                        <label className="text-xs font-medium uppercase tracking-widest text-white/40 ml-1">Internal Protocol / Notes</label>
                        <textarea
                            name="notes"
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium focus:ring-2 focus:ring-orange/30 outline-none transition-all placeholder:text-white/10"
                            placeholder="Register any specific observations..."
                        />
                    </div>
                </div>

                <div className="flex gap-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-orange text-white font-semibold py-5 rounded-xl hover:bg-orange/90 transition-all duration-300 orange-glow uppercase tracking-wider text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                    <Link
                        href="/dashboard/rentals"
                        className="px-10 py-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white/40 hover:text-white text-[10px] font-semibold uppercase tracking-widest flex items-center justify-center"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
