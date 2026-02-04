'use client';

import { useState, useMemo } from 'react';
import { Scooter } from '@/types/admin';
import { updateStatusAction, deleteScooter } from '@/app/actions';
import { formatMAD } from '@/lib/utils/currency';
import { Trash2, Search, Filter, Hash, MoreHorizontal, Settings2, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { ScooterEditModal } from './ScooterEditModal';
import { StatusSelector } from './StatusSelector';
import { ConfirmModal } from './ConfirmModal';

interface AdminScootersTableProps {
    scooters: Scooter[];
    onEdit?: (scooter: Scooter) => void;
}

export function AdminScootersTable({ scooters, onEdit }: AdminScootersTableProps) {
    const router = useRouter();
    const { t } = useLanguage();
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
                message: result.message || 'Failed to update status',
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
            title: 'Delete Scooter',
            message: 'Are you sure you want to delete this scooter? This action cannot be undone.',
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
                            message: result.message || 'Failed to delete scooter',
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
            <div className="glass-panel p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between backdrop-blur-xl">
                <div className="relative flex-1 min-w-[300px] group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5 group-focus-within:text-orange transition-colors" />
                    <input
                        type="text"
                        placeholder={t('search') + "..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-orange/50 transition-all"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none cursor-pointer hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-orange/50"
                        >
                            <option value="all" className="bg-black">{t('filter')}</option>
                            <option value="available" className="bg-black">{t('available')}</option>
                            <option value="rented" className="bg-black">{t('rented')}</option>
                            <option value="maintenance" className="bg-black">{t('maintenance')}</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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
                                            <Settings2 className="w-4 h-4 text-orange" /> {t('edit')}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(scooter.id)}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10 rounded-xl transition-colors text-left"
                                        >
                                            <Trash2 className="w-4 h-4" /> {t('delete')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Image Section (Expands to fill available space) */}
                        <div className="relative flex-1 bg-gradient-to-b from-white/5 to-transparent p-8 flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <img
                                src={scooter.image}
                                alt={scooter.name}
                                className="w-[100%] h-[100%] object-contain drop-shadow-2xl transform transition-transform duration-700 group-hover:scale-110 group-hover:-translate-y-4 z-10"
                            />


                        </div>

                        {/* Info Section - Bottom aligned */}
                        <div className="p-8 space-y-6 bg-gradient-to-t from-black via-black/80 to-transparent pt-0 mt-[-20px] relative z-20">
                            {/* Name */}
                            <h3 className="text-4xl font-anton text-white uppercase tracking-wide leading-none truncate text-center drop-shadow-lg" title={scooter.name}>
                                {scooter.name}
                            </h3>

                            {/* Specs Row - Maximized */}
                            <div className="flex items-center justify-center gap-6 py-4 border-y border-white/5">
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">Engine</span>
                                    {(() => {
                                        const isElec = scooter.name.toLowerCase().includes('electric') ||
                                            String(scooter.engine).toLowerCase().includes('electric') ||
                                            String(scooter.engine).toLowerCase().includes('w');

                                        if (isElec) return <span className="text-orange font-black text-xl tracking-wider">ELEC</span>;

                                        const val = String(scooter.engine).replace(/cc/gi, '').trim();
                                        return <span className="font-anton text-3xl text-white tracking-wide">{val} <span className="text-xs text-white/30 font-bold ml-[-2px]">CC</span></span>;
                                    })()}
                                </div>
                                <div className="w-px h-12 bg-white/10" />
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">Speed</span>
                                    <span className="font-anton text-3xl text-white tracking-wide">{String(scooter.speed).replace(/km\/h/gi, '').trim()} <span className="text-xs text-white/30 font-bold ml-[-2px]">KM/H</span></span>
                                </div>
                            </div>

                            {/* Footer: Price & Status */}
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">{t('dailyPrice')}</span>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="font-anton text-5xl text-orange text-glow-orange tracking-tight">
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
