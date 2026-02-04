'use client';

import { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createClient, updateClient } from '@/app/actions';
import { Client } from '@/types/admin';
import { X, Loader2 } from 'lucide-react';

interface ClientFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    client?: Client | null; // If present, we are editing
}

export function ClientFormModal({ isOpen, onClose, client }: ClientFormModalProps) {
    const isEdit = !!client;
    // We use different actions based on mode. 
    // However, useFormState hooks need to be at top level.
    // So we might need to handle submission manually or have separate forms.
    // For simplicity and "Premium" interaction, let's use client-side submission wrapper around actions 
    // OR just use separate components if needed. 
    // Actually, we can use client-side fetch pattern or manual form submission to keep it in one component 
    // without complex hook conditionals.

    // Changing approach: Manual submission to generic handler that calls server action.

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        // Handle "hasDeposit" checkbox manually if needed, but FormData usually captures it if checked.
        // Checkboxes return "on" or value if checked, null if not. Server action expects Checkbox logic.
        // My server actions: createClient checks `formData.get('hasDeposit') === 'true'`?
        // Let's check ClientsPageClient logic: line 191 value="true".

        let result;
        if (isEdit && client) {
            result = await updateClient(client.id, formData);
        } else {
            result = await createClient(null, formData);
        }

        if (result.success) {
            onClose();
        } else {
            setError(result.message || 'Operation failed');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-8 border-b border-white/10 bg-[#0a0a0a] flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-anton uppercase tracking-wide text-white">
                            {isEdit ? 'Edit Client' : 'New Client'}
                        </h2>
                        <p className="text-xs text-white/50 font-mono mt-1 uppercase tracking-widest">
                            {isEdit ? `Updating: ${client.fullName}` : 'Add a new customer to the database'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-bold text-center">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                defaultValue={client?.fullName}
                                required
                                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-medium focus:ring-2 focus:ring-orange/30 outline-none transition-all placeholder:text-white/10"
                                placeholder="e.g. Kamal Aassab"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">ID Document (CIN/Passport)</label>
                            <input
                                type="text"
                                name="documentId"
                                defaultValue={client?.documentId}
                                required
                                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-medium focus:ring-2 focus:ring-orange/30 outline-none transition-all placeholder:text-white/10"
                                placeholder="e.g. AB123456"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                defaultValue={client?.phone}
                                required
                                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-medium focus:ring-2 focus:ring-orange/30 outline-none transition-all placeholder:text-white/10"
                                placeholder="+212 6..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Deposit Amount (MAD)</label>
                            <input
                                type="number"
                                name="depositAmount"
                                defaultValue={client?.depositAmount || 0}
                                step="0.01"
                                min="0"
                                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-medium focus:ring-2 focus:ring-orange/30 outline-none transition-all placeholder:text-white/10"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 py-4 px-5 rounded-xl bg-white/5 border border-white/10 h-[60px] group hover:bg-white/10 transition-colors">
                        <input
                            type="checkbox"
                            name="hasDeposit"
                            id="hasDeposit"
                            value="true"
                            defaultChecked={client?.hasDeposit}
                            className="w-5 h-5 rounded border-white/10 bg-white/5 text-orange focus:ring-orange accent-orange outline-none cursor-pointer"
                        />
                        <label htmlFor="hasDeposit" className="font-bold text-xs uppercase tracking-widest text-white cursor-pointer select-none flex-1">
                            Deposit Secured?
                        </label>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl font-bold uppercase tracking-wide transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-[2] py-4 bg-orange hover:bg-orange/90 text-white rounded-xl font-bold uppercase tracking-wide transition-all orange-glow flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                isEdit ? 'Update Client' : 'Create Client'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
