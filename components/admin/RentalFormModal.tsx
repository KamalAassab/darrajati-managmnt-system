'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createRental } from '@/app/actions';
import { calculateRentalPrice, formatMAD } from '@/lib/utils/currency';
import { X, Loader2, User, FileBadge, Phone, Bike, Calendar, Banknote, Check } from 'lucide-react';
import { CustomSelect } from '@/components/admin/CustomSelect';

export interface RentalFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    scooters: any[];
}

export function RentalFormModal({
    isOpen,
    onClose,
    scooters,
}: RentalFormModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedScooter, setSelectedScooter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    const [amountPaid, setAmountPaid] = useState(0);
    const [isAmountManuallyChanged, setIsAmountManuallyChanged] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [hasGuarantee, setHasGuarantee] = useState(false);

    const scooterOptions = scooters.map(s => ({
        value: s.id,
        label: s.status === 'available'
            ? `${s.name} - ${formatMAD(s.price)}/day`
            : `${s.name} (${s.status === 'maintenance' ? 'MAINTENANCE' : 'RENTED'})`,
        disabled: s.status !== 'available',
        color: s.status !== 'available' ? 'text-red-500/50' : undefined
    }));

    const paymentOptions = [
        { value: 'cash', label: 'Cash' },
        { value: 'transfer', label: 'Transfer' }
    ];

    useEffect(() => {
        if (isOpen) {
            // Reset form state when opened if needed, or keep it. 
            // Ideally reset:
            if (!loading) {
                // only reset if not mid-submission (though modal usually closes on success)
                // Keeping it simple for now, maybe reset on close?
            }
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedScooter && startDate && endDate) {
            const scooter = scooters.find(s => s.id === selectedScooter);
            if (scooter) {
                const price = calculateRentalPrice(scooter.price, startDate, endDate, scooter.name);
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

        // Explicitly handle checkbox state
        if (hasGuarantee) {
            formData.set('hasGuarantee', 'on');
        } else {
            formData.delete('hasGuarantee');
        }

        try {
            const result = await createRental(null, formData);
            if (result.success) {
                router.refresh();
                onClose();
                // Reset form?
                setSelectedScooter('');
                setStartDate('');
                setEndDate('');
                setTotalPrice(0);
                setAmountPaid(0);
                setTotalPrice(0);
                setAmountPaid(0);
                setIsAmountManuallyChanged(false);
                setHasGuarantee(false);
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-5 bg-[#0a0a0a] border-b border-white/10">
                    <h2 className="text-xl font-anton text-white uppercase tracking-wide">
                        Create Rental
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto custom-scrollbar">
                    {/* Client Information Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="font-anton text-primary text-lg">1</span>
                            </div>
                            <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                                Client Information
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-0 md:pl-11">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 text-primary" /> Full Name
                                </label>
                                <input
                                    type="text"
                                    name="clientFullName"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-white/30 text-sm"
                                    placeholder="e.g. John Doe"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <FileBadge className="w-3.5 h-3.5 text-blue-500" /> Document ID
                                </label>
                                <input
                                    type="text"
                                    name="clientDocumentId"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-white/30 text-sm"
                                    placeholder="G123456"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-green-500" /> Phone
                                </label>
                                <input
                                    type="tel"
                                    name="clientPhone"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-white/30 text-sm"
                                    placeholder="0612345678"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-[1px] bg-white/5 w-full"></div>

                    {/* Rental Details Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="font-anton text-primary text-lg">2</span>
                            </div>
                            <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                                Rental Details
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-0 md:pl-11">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Bike className="w-3.5 h-3.5 text-primary" /> Select Scooter
                                </label>
                                <CustomSelect
                                    name="scooterId"
                                    value={selectedScooter}
                                    onChange={setSelectedScooter}
                                    options={scooterOptions}
                                    placeholder="Select a scooter"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <FileBadge className="w-3.5 h-3.5 text-blue-500" /> Scooter Matricule
                                </label>
                                <input
                                    type="text"
                                    name="scooterMatricule"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-white/30 text-sm"
                                    placeholder="e.g. 12345-A-6"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-blue-500" /> Start Date
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    required
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all cursor-pointer placeholder:text-white/30 text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-blue-500" /> End Date
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    required
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all cursor-pointer placeholder:text-white/30 text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Banknote className="w-3.5 h-3.5 text-green-500" /> Deposit (MAD)
                                </label>
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
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-white/30 text-sm"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/30 uppercase tracking-widest">MAD</span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Banknote className="w-3.5 h-3.5 text-purple-500" /> Payment Method
                                </label>
                                <CustomSelect
                                    name="paymentMethod"
                                    value={paymentMethod}
                                    onChange={setPaymentMethod}
                                    options={paymentOptions}
                                    required
                                />
                            </div>

                            <div className="pt-1">
                                <div
                                    onClick={() => setHasGuarantee(!hasGuarantee)}
                                    className={`relative flex items-center gap-4 p-4 border rounded-xl transition-all cursor-pointer group ${hasGuarantee ? 'bg-primary/10 border-primary/50' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30'}`}
                                >
                                    <div className={`h-5 w-5 rounded border-2 transition-all flex items-center justify-center ${hasGuarantee ? 'border-primary bg-primary' : 'border-white/20 bg-transparent'}`}>
                                        <Check className={`w-3.5 h-3.5 text-white font-bold transition-opacity ${hasGuarantee ? 'opacity-100' : 'opacity-0'}`} />
                                    </div>
                                    <div className="flex flex-col select-none">
                                        <span className="text-sm font-bold text-white group-hover:text-white/90 uppercase tracking-wide">
                                            Security Deposit Check
                                        </span>
                                        <span className="text-[10px] text-white/40">
                                            Client provides a 1000 MAD check as guarantee
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {totalPrice > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 pl-0 md:pl-11">
                                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex flex-col items-center justify-center text-center">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1">Total Price</p>
                                    <p className="text-2xl font-anton text-primary">{formatMAD(totalPrice)}</p>
                                </div>

                                <div className={`p-4 border rounded-xl flex flex-col items-center justify-center text-center ${derivedPaymentStatus === 'paid' ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5 border-white/10'}`}>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${derivedPaymentStatus === 'paid' ? 'text-green-500/60' : 'text-white/40'}`}>Paid Amount</p>
                                    <p className={`text-2xl font-anton ${derivedPaymentStatus === 'paid' ? 'text-green-500' : 'text-white'}`}>{formatMAD(amountPaid)}</p>
                                </div>

                                <div className={`p-4 border rounded-xl flex flex-col items-center justify-center text-center ${derivedPaymentStatus === 'paid' ? 'bg-white/5 border-white/10' : 'bg-red-500/10 border-red-500/20'}`}>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${derivedPaymentStatus === 'paid' ? 'text-white/40' : 'text-red-500/60'}`}>Remaining</p>
                                    <p className={`text-2xl font-anton ${derivedPaymentStatus === 'paid' ? 'text-white/40' : 'text-red-500'}`}>{formatMAD(Math.max(0, totalPrice - amountPaid))}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5 pl-0 md:pl-11">
                            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                Notes
                            </label>
                            <textarea
                                name="notes"
                                rows={2}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-white/30 text-sm"
                                placeholder="Add any additional notes..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-3 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !selectedScooter || !startDate || !endDate}
                            className="flex-[2] bg-[#ea6819] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#ea6819]/90 transition-all primary-glow uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#ea6819]/20 text-sm"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : 'Create Rental'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
