'use client';

import { useState, useMemo } from 'react';
import { Scooter } from '@/types/admin';
import { deleteScooter, updateMaintenanceCountAction } from '@/app/actions';
import { formatMAD } from '@/lib/utils/currency';
import { Trash2, Search, Filter, Hash, MoreHorizontal, Settings2, ChevronDown, Plus, Minus, Wrench, CheckCircle2, Bike } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ScooterEditModal } from './ScooterEditModal';
import { ConfirmModal } from './ConfirmModal';

interface AdminScootersTableProps {
    scooters: Scooter[];
    onEdit?: (scooter: Scooter) => void;
}

const statusLabels: Record<string, string> = {
    all: 'All Assets',
    available: 'Available',
    rented: 'Rented',
    maintenance: 'Maintenance',
};

export function AdminScootersTable({ scooters, onEdit }: AdminScootersTableProps) {
    const router = useRouter();
    const [updating, setUpdating] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [editingScooter, setEditingScooter] = useState<typeof scooters[0] | null>(null);
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

    const filteredScooters = useMemo(() => {
        return scooters.filter((scooter) => {
            const matchesSearch = scooter.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

            const matchesStatus =
                statusFilter === 'all'
                    ? true
                    : statusFilter === 'maintenance'
                        ? (scooter.maintenanceCount ?? 0) > 0
                        : scooter.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [scooters, searchTerm, statusFilter]);

    const handleMaintenanceChange = async (id: string, currentCount: number, change: number, max: number) => {
        const newCount = currentCount + change;
        if (newCount < 0 || newCount > max) return;

        setUpdating(id);

        const result = await updateMaintenanceCountAction(id, newCount);

        if (result.success) {
            router.refresh();
        } else {
            console.error('Failed to update maintenance count', result.message);
        }
        setUpdating(null);
    };

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete',
            message: 'Are you sure? This action cannot be undone.',
            type: 'danger',
            confirmText: 'Delete',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                const result = await deleteScooter(id);
                if (result.success) {
                    router.refresh();
                } else {
                    // Check if error is due to rental records
                    if (result.message?.includes('rental record')) {
                        setConfirmModal({
                            isOpen: true,
                            title: 'Cannot Delete',
                            message: result.message,
                            type: 'warning',
                            confirmText: 'OK',
                            cancelText: '',
                            onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false })),
                        });
                    } else {
                        setConfirmModal({
                            isOpen: true,
                            title: 'Error',
                            message: result.message || 'An error occurred',
                            type: 'danger',
                            onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false })),
                            confirmText: 'OK',
                            cancelText: ''
                        });
                    }
                }
            }
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
                {/* Filter Tabs */}
                <div className="flex flex-wrap md:flex-nowrap p-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl w-full md:w-auto shadow-xl shadow-black/5 gap-1">
                    {['all', 'available', 'rented', 'maintenance'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`
                                flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2 px-3 md:px-4 py-2.5 rounded-xl text-[10px] md:text-xs font-bold transition-all uppercase tracking-tight
                                ${statusFilter === status
                                    ? status === 'available' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                        : status === 'rented' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                            : status === 'maintenance' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                                                : 'bg-white text-black shadow-lg'
                                    : 'text-white/50 hover:text-white hover:bg-white/5'}
                            `}
                        >
                            {status === 'all' && <Filter className="w-3.5 h-3.5" />}
                            {status === 'available' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {status === 'rented' && <Bike className="w-3.5 h-3.5" />}
                            {status === 'maintenance' && <Wrench className="w-3.5 h-3.5" />}
                            <span className="whitespace-nowrap">{statusLabels[status] || status}</span>
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-72 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search scooters..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all font-medium placeholder:text-white/20 shadow-xl shadow-black/5"
                    />
                </div>
            </div>

            {/* Grid View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredScooters.map((scooter, index) => {
                    const availableCount = scooter.availableCount ?? 0;
                    const rentedCount = scooter.activeRentals || 0;
                    const maintenanceCount = scooter.maintenanceCount || 0;
                    // Max maintenance is quantity - rented (can't put rented scooters in maintenance)
                    const maxMaintenance = (scooter.quantity || 1) - rentedCount;

                    return (
                        <div
                            key={scooter.id}
                            className="group relative bg-[#050505] border border-white/5 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_80px_-30px_rgba(255,107,0,0.4)] aspect-auto md:aspect-[4/5] flex flex-col"
                        >
                            {/* Status Strip */}
                            {/* Status Strip Removed */
                                null
                            }

                            {/* Header: ID & Actions */}
                            <div className="absolute top-6 left-6 right-6 z-30 flex justify-between items-start">
                                <div className="flex items-center justify-center w-10 h-10 md:w-14 md:h-14 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl md:rounded-2xl group-hover:border-primary/50 transition-colors shadow-xl">
                                    <span className="font-anton text-lg md:text-2xl text-white tracking-wider">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                </div>

                                <div className="relative group/actions">
                                    <button className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl md:rounded-2xl hover:bg-white/10 text-white/50 hover:text-white transition-all shadow-xl">
                                        <MoreHorizontal className="w-5 h-5 md:w-6 md:h-6" />
                                    </button>
                                    <div className="absolute right-0 top-full pt-2 opacity-0 group-hover/actions:opacity-100 pointer-events-none group-hover/actions:pointer-events-auto transition-all duration-300 z-30 translate-y-2 group-hover/actions:translate-y-0">
                                        <div className="bg-[#121212] border border-white/10 p-2 rounded-2xl shadow-2xl min-w-[160px]">
                                            <button
                                                onClick={() => onEdit ? onEdit(scooter) : setEditingScooter(scooter)}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/5 rounded-xl transition-colors text-left"
                                            >
                                                <Settings2 className="w-4 h-4 text-primary" /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(scooter.id)}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10 rounded-xl transition-colors text-left"
                                            >
                                                <Trash2 className="w-4 h-4" /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Image Section */}
                            <div className="relative h-48 md:flex-1 bg-gradient-to-b from-white/5 to-transparent p-6 flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <img
                                    src={scooter.image}
                                    alt={scooter.name}
                                    className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl z-10 img-premium scale-110 md:scale-100"
                                />
                            </div>

                            {/* Info Section - Bottom aligned */}
                            <div className="p-6 space-y-4 bg-gradient-to-t from-black via-black/90 to-transparent pt-0 mt-[-20px] relative z-20">
                                {/* Name */}
                                <h3 className="text-xl md:text-3xl font-black font-outfit text-white uppercase tracking-tighter leading-none truncate text-center drop-shadow-2xl mix-blend-screen" title={scooter.name}>
                                    {scooter.name}
                                </h3>

                                {/* Status Breakdown Row */}
                                <div className="flex items-center justify-between gap-2 px-2 py-3 border-y border-white/5 bg-white/5 rounded-xl">
                                    <div className="flex flex-col items-center flex-1">
                                        <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest mb-1">Avail</span>
                                        <span className="font-anton text-xl text-green-500">{availableCount}</span>
                                    </div>
                                    <div className="w-px h-6 bg-white/10" />
                                    <div className="flex flex-col items-center flex-1">
                                        <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mb-1">Rented</span>
                                        <span className="font-anton text-xl text-blue-500">{rentedCount}</span>
                                    </div>
                                    <div className="w-px h-6 bg-white/10" />
                                    <div className="flex flex-col items-center flex-1 relative group/maint">
                                        <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                                            Maint <Wrench className="w-3 h-3" />
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMaintenanceChange(scooter.id, maintenanceCount, -1, maxMaintenance);
                                                }}
                                                disabled={maintenanceCount <= 0 || updating === scooter.id}
                                                className="w-5 h-5 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition-colors"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="font-anton text-xl text-red-500 min-w-[20px] text-center">{maintenanceCount}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMaintenanceChange(scooter.id, maintenanceCount, 1, maxMaintenance);
                                                }}
                                                disabled={availableCount <= 0 || updating === scooter.id}
                                                className="w-5 h-5 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition-colors"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer: Price & Total */}
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Price / Day</span>
                                        <span className="font-price text-2xl text-[#ea6819] text-glow-primary tracking-tight">
                                            {formatMAD(scooter.price).replace('MAD', '').trim()} <span className="text-xs text-[#ea6819]">MAD</span>
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Total Scooters</span>
                                        <span className="font-anton text-2xl text-white tracking-wide">
                                            {scooter.quantity || 1}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}


                {filteredScooters.length === 0 && (
                    <div className="col-span-full glass-panel rounded-3xl text-center py-10 sm:py-16 md:py-20 px-6">
                        <Search className="w-12 h-12 text-white/10 mx-auto mb-4" />
                        <p className="text-white/30 text-sm font-bold uppercase tracking-widest">No scooters found</p>
                    </div>
                )}
            </div>

            {
                editingScooter && (
                    <ScooterEditModal
                        scooter={editingScooter}
                        isOpen={!!editingScooter}
                        onClose={() => setEditingScooter(null)}
                    />
                )
            }

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
        </div >
    );
}
