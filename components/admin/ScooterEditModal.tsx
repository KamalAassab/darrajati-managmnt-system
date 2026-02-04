'use client';

import { useState } from 'react';
import { Scooter } from '@/types/admin';
import { updateScooter } from '@/app/actions';
import { X, Save, Bike, Settings2 } from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface ScooterEditModalProps {
    scooter: Scooter;
    isOpen: boolean;
    onClose: () => void;
}

export function ScooterEditModal({ scooter, isOpen, onClose }: ScooterEditModalProps) {
    const { t } = useLanguage();

    // Helper to extract numbers from potential string values (e.g. "150cc" -> "150")
    const extractNumber = (val: string | number | undefined) => {
        if (val === undefined || val === null) return '';
        return String(val).replace(/[^0-9.]/g, '');
    };

    // Detect if scooter is electric based on name or engine string
    const isElectric = scooter.name.toLowerCase().includes('electric') ||
        String(scooter.engine).toLowerCase().includes('electric') ||
        String(scooter.engine).toLowerCase().includes('w');

    const [isSubmitting, setIsSubmitting] = useState(false);


    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);

        const result = await updateScooter(scooter.id, formData);

        if (result.success) {
            onClose();
        } else {
            alert(result.message || 'Failed to update scooter');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur">
                    <h2 className="text-xl font-anton uppercase tracking-wide text-white flex items-center gap-3">
                        <Settings2 className="w-5 h-5 text-orange" />
                        {t('edit')} {scooter.name}
                    </h2>
                    <button onClick={onClose} className="p-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/5">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-orange mb-2">Basic Info</h3>

                            <div>
                                <label className="block text-[10px] font-bold uppercase text-white/40 mb-1.5">{t('scooterName')}</label>
                                <input name="name" defaultValue={scooter.name} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange/50 transition-colors" />
                            </div>



                            <div>
                                <label className="block text-[10px] font-bold uppercase text-white/40 mb-1.5">{t('dailyPrice')}</label>
                                <div className="relative">
                                    <input name="price" type="number" min="0" defaultValue={extractNumber(scooter.price)} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange/50 transition-colors pr-12 appearance-none hide-number-spinner" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/30 pointer-events-none">MAD</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase text-white/40 mb-1.5">Status</label>
                                <select name="status" defaultValue={scooter.status} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange/50 transition-colors appearance-none">
                                    <option value="available" className="bg-black text-white">Available</option>
                                    <option value="rented" className="bg-black text-white">Rented</option>
                                    <option value="maintenance" className="bg-black text-white">Maintenance</option>
                                </select>
                            </div>
                        </div>

                        {/* Specs */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-orange mb-2">Specifications</h3>

                            <div>
                                <label className="block text-[10px] font-bold uppercase text-white/40 mb-1.5">Engine</label>
                                <div className="relative">
                                    {isElectric ? (
                                        <>
                                            <input
                                                type="text"
                                                value="ELECTRIC"
                                                disabled
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/50 font-bold tracking-wider text-center focus:outline-none cursor-not-allowed"
                                            />
                                            <input type="hidden" name="engine" value={scooter.engine} />
                                        </>
                                    ) : (
                                        <>
                                            <input name="engine" type="number" min="0" defaultValue={extractNumber(scooter.engine)} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange/50 transition-colors pr-12 appearance-none hide-number-spinner" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/30 pointer-events-none">CC</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase text-white/40 mb-1.5">Speed</label>
                                <div className="relative">
                                    <input name="speed" type="number" min="0" defaultValue={extractNumber(scooter.speed)} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange/50 transition-colors pr-12 appearance-none hide-number-spinner" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/30 pointer-events-none">KM/H</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                        <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white hover:bg-white/5 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-8 py-3 rounded-xl bg-orange text-black text-xs font-bold uppercase tracking-wider hover:bg-orange/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                            {isSubmitting ? <span className="animate-spin text-xl">⟳</span> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
