'use client';

import { completeRental } from '@/app/actions';
import { CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

export default function CompleteRentalButton({ rentalId }: { rentalId: string }) {
    const [loading, setLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type?: 'danger' | 'warning' | 'info' | 'success';
        confirmText?: string;
        cancelText?: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const handleComplete = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Complete Rental',
            message: 'Mark this rental as completed? This will free the scooter.',
            type: 'warning',
            confirmText: 'Complete',
            onConfirm: async () => {
                setLoading(true);
                const result = await completeRental(rentalId);

                if (!result.success) {
                    setConfirmModal({
                        isOpen: true,
                        title: 'Error',
                        message: result.message || 'Failed to complete rental',
                        type: 'danger',
                        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false })),
                        confirmText: 'OK',
                        cancelText: ''
                    });
                }
                setLoading(false);
            }
        });
    };

    return (
        <>
            <button
                onClick={handleComplete}
                disabled={loading}
                className="w-full bg-orange hover:bg-orange/90 text-white p-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-[0_0_20px_-5px_#FF4500] flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Complete Rental"
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <CheckCircle className="w-5 h-5" />
                )}
                <span className="font-bold text-xs uppercase tracking-widest">
                    {loading ? 'Processing...' : 'Complete'}
                </span>
            </button>
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText={confirmModal.confirmText}
                cancelText={confirmModal.cancelText}
            />
        </>
    );
}
