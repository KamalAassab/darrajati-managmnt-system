'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createRental } from '@/app/actions';

import { calculateRentalPrice, formatMAD } from '@/lib/utils/currency';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function NewRentalPageClient({
    scooters,
}: {
    scooters: any[];
}) {
    const { t } = useLanguage();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedScooter, setSelectedScooter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const [amountPaid, setAmountPaid] = useState(0);
    const [isAmountManuallyChanged, setIsAmountManuallyChanged] = useState(false);

    const availableScooters = scooters.filter(s => s.status === 'available');

    useEffect(() => {
        if (selectedScooter && startDate && endDate) {
            const scooter = scooters.find(s => s.id === selectedScooter);
            if (scooter) {
                const price = calculateRentalPrice(scooter.price, startDate, endDate);
                setTotalPrice(price);
                if (!isAmountManuallyChanged) {
                    setAmountPaid(price);
                }
            }
        }
    }, [selectedScooter, startDate, endDate, scooters, isAmountManuallyChanged]);

    const derivedPaymentStatus = amountPaid >= totalPrice ? 'paid' : (amountPaid > 0 ? 'partial' : 'pending');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        formData.set('totalPrice', totalPrice.toString());
        formData.set('amountPaid', amountPaid.toString());
        formData.set('paymentStatus', derivedPaymentStatus);

        try {
            // New signature requires prevState as first arg. Passing null for manual invocation.
            const result = await createRental(null, formData);
            if (result.success) {
                router.push('/dashboard/rentals');
                router.refresh();
            } else {
                alert(`${t('error')}: ${result.message}`);
                setLoading(false);
            }
        } catch (error) {
            alert(t('error'));
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl font-alexandria">
            <Link
                href="/dashboard/rentals"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
                {t('back')}
            </Link>

            <h1 className="text-3xl font-bold mb-8 text-white uppercase">{t('createRental')}</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Client Information */}
                <div className="glass-panel rounded-2xl p-8 border-white/[0.03]">
                    <h2 className="text-xl font-bold tracking-tight text-white uppercase mb-8 border-b border-white/5 pb-4">{t('clientInfo')}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-widest text-white/40 ml-1">{t('fullName')} *</label>
                            <input
                                type="text"
                                name="clientFullName"
                                required
                                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium focus:ring-2 focus:ring-orange/30 outline-none transition-all"
                                placeholder="e.g., John Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-widest text-white/40 ml-1">{t('documentId')} *</label>
                            <input
                                type="text"
                                name="clientDocumentId"
                                required
                                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium focus:ring-2 focus:ring-orange/30 outline-none transition-all"
                                placeholder="G123456"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-widest text-white/40 ml-1">{t('phone')} *</label>
                            <input
                                type="tel"
                                name="clientPhone"
                                required
                                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium focus:ring-2 focus:ring-orange/30 outline-none transition-all"
                                placeholder="0612345678"
                            />
                        </div>
                    </div>
                </div>

                {/* Logistics */}
                <div className="glass-panel rounded-2xl p-8 border-white/[0.03]">
                    <h2 className="text-xl font-bold tracking-tight text-white uppercase mb-8 border-b border-white/5 pb-4">{t('rentalDetails')}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-widest text-white/40 ml-1">{t('scooter')} *</label>
                            <select
                                name="scooterId"
                                required
                                value={selectedScooter}
                                onChange={(e) => setSelectedScooter(e.target.value)}
                                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium focus:ring-2 focus:ring-orange/30 outline-none transition-all appearance-none"
                            >
                                <option value="" className="bg-[#111]">{t('selectScooter')}</option>
                                {availableScooters.map((scooter) => (
                                    <option key={scooter.id} value={scooter.id} className="bg-[#111]">
                                        {scooter.name} - {formatMAD(scooter.price)}/day
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-widest text-white/40 ml-1">{t('startDate')} *</label>
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
                            <label className="text-xs font-medium uppercase tracking-widest text-white/40 ml-1">{t('endDate')} *</label>
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
                            <label className="text-xs font-medium uppercase tracking-widest text-white/40 ml-1">{t('deposit')} (MAD) *</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="amountPaid"
                                    min="0"
                                    step="1"
                                    required
                                    value={amountPaid}
                                    onChange={(e) => {
                                        setAmountPaid(Math.max(0, parseInt(e.target.value) || 0));
                                        setIsAmountManuallyChanged(true);
                                    }}
                                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium focus:ring-2 focus:ring-orange/30 outline-none transition-all"
                                    placeholder="0.00"
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-white/20 uppercase tracking-widest">MAD</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-widest text-white/40 ml-1">Security Guarantee (Caution)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="guaranteeAmount"
                                    min="0"
                                    step="1"
                                    placeholder="0.00"
                                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium focus:ring-2 focus:ring-orange/30 outline-none transition-all"
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-white/20 uppercase tracking-widest">MAD</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-widest text-white/40 ml-1">{t('paymentMethod')} *</label>
                            <select
                                name="paymentMethod"
                                required
                                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium focus:ring-2 focus:ring-orange/30 outline-none transition-all appearance-none"
                            >
                                <option value="cash" className="bg-[#111]">{t('cash')}</option>
                                <option value="transfer" className="bg-[#111]">{t('transfer')}</option>
                            </select>
                        </div>
                    </div>

                    {totalPrice > 0 && (
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-6 bg-orange/5 border border-orange/20 rounded-2xl">
                                <p className="text-xs font-medium uppercase tracking-widest text-orange/60 mb-1">{t('totalPrice')}</p>
                                <p className="text-3xl font-bold tracking-tight text-orange uppercase">{formatMAD(totalPrice)}</p>
                            </div>

                            <div className={`p-6 border rounded-2xl ${derivedPaymentStatus === 'paid' ? 'bg-green-500/5 border-green-500/20' : 'bg-green-500/5 border-green-500/20'}`}>
                                <p className={`text-xs font-medium uppercase tracking-widest mb-1 ${derivedPaymentStatus === 'paid' ? 'text-green-500/60' : 'text-green-500/60'}`}>{t('deposit')}</p>
                                <p className={`text-3xl font-bold tracking-tight uppercase ${derivedPaymentStatus === 'paid' ? 'text-green-500' : 'text-green-500'}`}>{formatMAD(amountPaid)}</p>
                            </div>

                            <div className={`p-6 border rounded-2xl ${derivedPaymentStatus === 'paid' ? 'bg-white/5 border-white/10' : 'bg-red-500/5 border-red-500/20'}`}>
                                <p className={`text-xs font-medium uppercase tracking-widest mb-1 ${derivedPaymentStatus === 'paid' ? 'text-white/40' : 'text-red-500/60'}`}>{t('remaining')}</p>
                                <p className={`text-3xl font-bold tracking-tight uppercase ${derivedPaymentStatus === 'paid' ? 'text-white/40' : 'text-red-500'}`}>{formatMAD(Math.max(0, totalPrice - amountPaid))}</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 space-y-2">
                        <label className="text-xs font-medium uppercase tracking-widest text-white/40 ml-1">{t('notes')}</label>
                        <textarea
                            name="notes"
                            rows={3}
                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium focus:ring-2 focus:ring-orange/30 outline-none transition-all placeholder:text-white/10"
                            placeholder={t('notes') + "..."}
                        />
                    </div>
                </div>

                <div className="flex gap-6">
                    <button
                        type="submit"
                        disabled={loading || !selectedScooter || !startDate || !endDate}
                        className="flex-1 bg-orange text-white font-semibold py-5 rounded-xl hover:bg-orange/90 transition-all duration-300 orange-glow uppercase tracking-wider text-sm disabled:opacity-50"
                    >
                        {loading ? t('saving') + '...' : t('save')}
                    </button>
                    <Link
                        href="/dashboard/rentals"
                        className="px-10 py-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white/40 hover:text-white text-[10px] font-semibold uppercase tracking-widest flex items-center justify-center"
                    >
                        {t('cancel')}
                    </Link>
                </div>
            </form >
        </div >
    );
}
