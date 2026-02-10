'use client';

import { useState, useMemo } from 'react';
import { Scooter } from '@/types/admin';
import { updateStatusAction, deleteScooter } from '@/app/actions';
import { formatMAD } from '@/lib/utils/currency';
import { Trash2, Search, Filter, Hash, MoreHorizontal, Settings2, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ScooterEditModal } from './ScooterEditModal';
import { StatusSelector } from './StatusSelector';
import { ConfirmModal } from './ConfirmModal';

interface AdminScootersTableProps {
    scooters: Scooter[];
    onEdit?: (scooter: Scooter) => void;
}

const statusLabels: Record<string, string> = {
    all: 'Filter',
    available: 'Available',
    rented: 'Rented',
    maintenance: 'Maintenance',
};

export function AdminScootersTable({ scooters, onEdit }: AdminScootersTableProps) {
    const router = useRouter();
    const [updating, setUpdating] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [editingScooter, setEditingScooter] = useState<Scooter | null>(null);
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
        return scooters.filter(scooter => {
            const matchesSearch =
                scooter.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || scooter.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [scooters, searchTerm, statusFilter]);

    const handleStatusChange = async (id: string, status: string) => {
        setUpdating(id);

        const result = await updateStatusAction(id, status as 'available' | 'rented' | 'maintenance');

        if (result.success) {
            router.refresh();
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
            console.error('Failed to update status', result.message);
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
                            message: result.message + '\n\nWould you like to set it to maintenance instead?',
                            type: 'warning',
                            confirmText: 'Set to Maintenance',
                            cancelText: 'Cancel',
                            onConfirm: async () => {
                                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                const statusResult = await updateStatusAction(id, 'maintenance');
                                if (statusResult.success) {
                                    router.refresh();
                                }
                            }
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
            <div className="flex flex-row gap-3 items-center justify-between relative z-50 mb-6">
                <div className="relative flex-1 min-w-0 md:min-w-[300px] group">
                    <div className="absolute inset-0 bg-orange/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5 group-focus-within:text-orange transition-colors duration-300 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-[#0A0A0A] border border-white/5 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-orange/30 focus:bg-black transition-all duration-300 font-bold tracking-wide shadow-inner"
                    />
                </div>

                <div className="flex items-center gap-4">
                    {/* Custom Filter Dropdown */}
                    <div className="relative group/filter h-full z-[60]">
                        <div className="relative z-20">
                            <button className="flex items-center gap-2 md:gap-4 pl-3 pr-8 md:pl-6 md:pr-12 py-4 bg-[#0A0A0A] border border-white/5 rounded-2xl text-white hover:bg-black hover:border-orange/30 transition-all duration-300 focus:outline-none group-focus-within/filter:border-orange/30 group-focus-within/filter:bg-black shadow-lg">
                                <div className="p-1 rounded bg-orange/10 text-orange shrink-0">
                                    <Filter className="w-4 h-4" />
                                </div>
                                <span className="hidden md:inline text-sm font-bold uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">
                                    {statusLabels[statusFilter] || 'Filter'}
                                </span>
                                <ChevronDown className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4 transition-transform duration-300 group-focus-within/filter:rotate-180 group-hover:text-orange" />
                            </button>

                            {/* Dropdown Menu - Styled with visibility hack for better UX without extra state */}
                            <div className="absolute right-0 top-full pt-4 w-56 opacity-0 invisible group-focus-within/filter:opacity-100 group-focus-within/filter:visible transition-all duration-300 z-[100] transform translate-y-2 group-focus-within/filter:translate-y-0">
                                <div className="bg-[#0A0A0A]/95 backdrop-blur-2xl border border-white/5 rounded-2xl overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] flex flex-col p-2 ring-1 ring-white/5">
                                    {['all', 'available', 'rented', 'maintenance'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setStatusFilter(status)}
                                            className={`
                                                flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 text-left group/item
                                                ${statusFilter === status
                                                    ? 'bg-orange text-black shadow-lg shadow-orange/20'
                                                    : 'text-white/60 hover:text-white hover:bg-white/5'}
                                            `}
                                        >
                                            <span className="flex items-center gap-3">
                                                {status !== 'all' && (
                                                    <span className={`w-2 h-2 rounded-full ring-2 ring-black/20 ${status === 'available' ? 'bg-green-500' :
                                                        status === 'rented' ? 'bg-blue-500' : 'bg-red-500'
                                                        }`} />
                                                )}
                                                {statusLabels[status] || status}
                                            </span>

                                            {statusFilter === status && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-black/40" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredScooters.map((scooter, index) => (
                    <div
                        key={scooter.id}
                        className="group relative bg-[#050505] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-orange/50 transition-all duration-500 hover:shadow-[0_0_80px_-30px_rgba(255,107,0,0.4)] aspect-[4/5] flex flex-col"
                    >
                        {/* Status Strip */}
                        <div className={`absolute top-0 left-0 w-full h-1.5 transition-colors duration-300 z-20 ${scooter.status === 'available' ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]' :
                            scooter.status === 'rented' ? 'bg-orange shadow-[0_0_20px_rgba(255,107,0,0.5)]' : 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                            }`} />

                        {/* Header: ID & Actions */}
                        <div className="absolute top-6 left-6 right-6 z-30 flex justify-between items-start">
                            <div className="flex items-center justify-center w-14 h-14 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl group-hover:border-orange/50 transition-colors shadow-xl">
                                <span className="font-anton text-2xl text-white tracking-wider">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                            </div>

                            <div className="relative group/actions">
                                <button className="w-14 h-14 flex items-center justify-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 text-white/50 hover:text-white transition-all shadow-xl">
                                    <MoreHorizontal className="w-6 h-6" />
                                </button>
                                <div className="absolute right-0 top-full pt-2 opacity-0 group-hover/actions:opacity-100 pointer-events-none group-hover/actions:pointer-events-auto transition-all duration-300 z-30 translate-y-2 group-hover/actions:translate-y-0">
                                    <div className="bg-[#121212] border border-white/10 p-2 rounded-2xl shadow-2xl min-w-[160px]">
                                        <button
                                            onClick={() => onEdit ? onEdit(scooter) : setEditingScooter(scooter)}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/5 rounded-xl transition-colors text-left"
                                        >
                                            <Settings2 className="w-4 h-4 text-orange" /> Edit
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

                        {/* Image Section (Expands to fill available space) */}
                        <div className="relative flex-1 bg-gradient-to-b from-white/5 to-transparent p-6 flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <Image
                                src={scooter.image}
                                alt={scooter.name}
                                fill
                                className="object-contain drop-shadow-2xl z-10 img-premium"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        </div>

                        {/* Info Section - Bottom aligned */}
                        <div className="p-6 space-y-4 bg-gradient-to-t from-black via-black/90 to-transparent pt-0 mt-[-20px] relative z-20">
                            {/* Name */}
                            <h3 className="text-3xl font-black font-outfit text-white uppercase tracking-tighter leading-none truncate text-center drop-shadow-2xl mix-blend-screen" title={scooter.name}>
                                {scooter.name}
                            </h3>

                            {/* Specs Row - Maximized */}
                            <div className="flex items-center justify-between gap-2 px-2 py-4 border-y border-white/5">
                                <div className="flex flex-col items-center flex-1">
                                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">Engine</span>
                                    {(() => {
                                        const isElec = scooter.name.toLowerCase().includes('electric') ||
                                            String(scooter.engine).toLowerCase().includes('electric') ||
                                            String(scooter.engine).toLowerCase().includes('w');

                                        if (isElec) return <span className="text-orange font-black text-lg tracking-wider">ELEC</span>;

                                        const val = String(scooter.engine).replace(/cc/gi, '').trim();
                                        return <span className="font-anton text-2xl text-white tracking-wide">{val} <span className="text-[10px] text-white/50 font-black ml-0.5">CC</span></span>;
                                    })()}
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="flex flex-col items-center flex-1">
                                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">Speed</span>
                                    <span className="font-anton text-2xl text-white tracking-wide">{String(scooter.speed).replace(/km\/h/gi, '').trim()} <span className="text-[10px] text-white/50 font-black ml-0.5">KM</span></span>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div className="flex flex-col items-center flex-1">
                                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">Stock</span>
                                    <span className="font-anton text-2xl text-white tracking-wide">
                                        {(scooter.quantity || 1) - (scooter.activeRentals || 0)}
                                        <span className="text-[10px] text-white/30 font-black ml-1">/ {scooter.quantity || 1}</span>
                                    </span>
                                </div>
                            </div>

                            {/* Footer: Price & Status */}
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Daily Price</span>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="font-price text-3xl text-orange text-glow-orange tracking-tight">
                                            {formatMAD(scooter.price).replace('MAD', '').trim()}
                                        </span>
                                        <span className="text-sm font-bold text-orange/50 uppercase tracking-wider">MAD</span>
                                    </div>
                                </div>

                                <StatusSelector
                                    currentStatus={scooter.status}
                                    onStatusChange={(status) => handleStatusChange(scooter.id, status)}
                                    isLoading={updating === scooter.id}
                                />
                            </div>
                        </div>
                    </div>
                ))}


                {filteredScooters.length === 0 && (
                    <div className="col-span-full py-20 text-center glass-panel rounded-3xl">
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
