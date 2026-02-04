'use client';

import { deleteRental } from '@/app/actions';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

export default function DeleteRentalButton({ rentalId }: { rentalId: string }) {
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

    const handleDelete = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Rental',
            message: 'Are you sure you want to delete this rental? This will reset the scooter status.',
            type: 'danger',
            confirmText: 'Delete',
            onConfirm: async () => {
                setLoading(true);
                const result = await deleteRental(rentalId);
                if (!result.success) {
                    setConfirmModal({
                        isOpen: true,
                        title: 'Error',
                        message: result.message || 'Failed to delete rental',
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
                onClick={handleDelete}
                disabled={loading}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 p-3 rounded-xl transition-all flex items-center justify-center border border-red-500/20 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete Rental"
            >
                <Trash2 className="w-4 h-4" />
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
