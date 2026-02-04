'use client';

import { useState } from 'react';
import { Client } from '@/types/admin';
import { deleteClient } from '@/app/actions';
import { Plus, Search, Users } from 'lucide-react';
import { ClientStats } from '@/components/admin/ClientStats';
import { ClientCard } from '@/components/admin/ClientCard';
import { ClientFormModal } from '@/components/admin/ClientFormModal';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

interface ClientsPageClientProps {
    initialClients: Client[];
}

export default function ClientsPageClient({ initialClients }: ClientsPageClientProps) {
    // State
    const [clients, setClients] = useState<Client[]>(initialClients);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    // Confirm Modal
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type?: 'danger' | 'warning' | 'info' | 'success';
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    // Filtering
    const filteredClients = initialClients.filter(client =>
        client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.documentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm)
    );

    // Handlers
    const handleCreate = () => {
        setEditingClient(null);
        setIsFormOpen(true);
    };

    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setIsFormOpen(true);
    };

    const handleDelete = (id: string, name: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Client',
            message: `Are you sure you want to delete ${name}? This action cannot be undone.`,
            type: 'danger',
            onConfirm: async () => {
                try {
                    const result = await deleteClient(id);
                    if (!result.success) {
                        alert(result.message); // Fallback for error
                    } else {
                        setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    }
                } catch (error) {
                    console.error('Delete failed', error);
                }
            }
        });
    };

    return (
        <div className="space-y-10 font-inter pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange mb-2 text-glow-orange">Rolodex</p>
                    <h1 className="text-3xl font-outfit font-black tracking-tighter text-white uppercase flex items-center gap-3">
                        <Users className="w-8 h-8 text-orange" />
                        Client Database
                    </h1>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search clients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-orange/50 transition-all font-medium placeholder:text-white/20"
                        />
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={handleCreate}
                        className="bg-orange text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-orange/90 transition-all duration-300 orange-glow font-bold uppercase tracking-tight active:scale-95 shadow-lg shadow-orange/20"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Add Client</span>
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <ClientStats clients={initialClients} />

            {/* Content Area */}
            {filteredClients.length === 0 ? (
                <div className="glass-panel p-16 rounded-3xl text-center border-dashed border-white/10">
                    <Users className="w-16 h-16 text-white/10 mx-auto mb-6" />
                    <h3 className="text-2xl font-outfit font-black text-white uppercase tracking-wide mb-2">No Clients Found</h3>
                    <p className="text-white/40 text-sm font-mono uppercase tracking-widest">Try adjusting your search or add a new client.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-700 delay-100">
                    {filteredClients.map((client) => (
                        <ClientCard
                            key={client.id}
                            client={client}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            <ClientFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                client={editingClient}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
            />
        </div >
    );
}
