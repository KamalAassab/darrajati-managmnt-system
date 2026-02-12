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
        <div className="space-y-10 font-outfit">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl md:text-3xl text-white uppercase flex items-center gap-3 font-anton">
                        <Bike className="w-6 h-6 md:w-8 md:h-8 text-[#ea6819]" />
                        Scooters Management
                    </h1>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#ea6819] text-white w-full sm:w-auto px-6 py-4 sm:py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#ea6819]/90 transition-all duration-300 primary-glow font-bold uppercase tracking-tight active:scale-95 cursor-pointer shadow-lg shadow-[#ea6819]/20"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New Scooter</span>
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
