'use client';

import { useState } from 'react';
import { Scooter } from '@/types/admin';
import { AdminScootersTable } from '@/components/admin/AdminScootersTable';
import { ScooterFormModal } from '@/components/admin/ScooterFormModal';
import { Bike, Plus } from 'lucide-react';

export default function ScootersPageClient({ initialScooters }: { initialScooters: Scooter[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingScooter, setEditingScooter] = useState<Scooter | null>(null);

    const handleEdit = (scooter: Scooter) => {
        setEditingScooter(scooter);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingScooter(null);
    };

    return (
        <div className="space-y-10 font-alexandria">
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange text-glow-orange mb-2">
                        Fleet Logistics
                    </p>
                    <h1 className="text-4xl font-outfit font-black tracking-tighter text-white uppercase flex items-center gap-3">
                        <Bike className="w-8 h-8 text-orange" />
                        Scooters Management
                    </h1>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-orange hover:bg-orange/90 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add New Scooter
                </button>
            </div>

            <AdminScootersTable scooters={initialScooters} onEdit={handleEdit} />

            <ScooterFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                scooter={editingScooter}
            />
        </div>
    );
}
