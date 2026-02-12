'use client';

import { useState, useEffect } from 'react';
import { createExpense, updateExpense, deleteExpense } from '@/app/actions';
import { formatMAD } from '@/lib/utils/currency';
import { formatDateDisplay } from '@/lib/utils';
import { Plus, TrendingDown, DollarSign, PieChart, Calendar, X, History, Trash2, Edit, Wrench, Fuel, Megaphone, Users, Home, ShieldCheck, Bike, Wifi, Droplets, MoreHorizontal } from 'lucide-react';
import { Expense, DashboardStats } from '@/types/admin';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { CustomSelect } from '@/components/admin/CustomSelect';

interface FinancesPageClientProps {
    expenses: Expense[];
    dashboardStats: DashboardStats;
}

// Category labels for display
const categoryLabels: Record<string, string> = {
    maintenance: 'Maintenance',
    fuel: 'Fuel',
    advertising: 'Advertising',
    salaries: 'Salaries',
    rent: 'Rent',
    assurance: 'Assurance',
    new_scooter: 'New Scooter',
    wifi: 'Wifi',
    electricity_water: 'Electricity & Water',
    other: 'Other',
};

// Category icons mapping
const categoryIcons: Record<string, any> = {
    maintenance: Wrench,
    fuel: Fuel,
    advertising: Megaphone,
    salaries: Users,
    rent: Home,
    assurance: ShieldCheck,
    new_scooter: Bike,
    wifi: Wifi,
    electricity_water: Droplets,
    other: MoreHorizontal,
};

export default function FinancesPageClient({ expenses, dashboardStats }: FinancesPageClientProps) {
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<Expense | null>(null);
    const [category, setCategory] = useState('');

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type?: 'danger' | 'warning' | 'info' | 'success';
        confirmText?: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const expensesByCategory = expenses.reduce((acc: Record<string, number>, expense) => {
        const cat = expense.category || 'other';
        acc[cat] = (acc[cat] || 0) + Number(expense.amount);
        return acc;
    }, {});

    useEffect(() => {
        if (showForm) {
            setCategory(editFormData?.category || '');
        }
    }, [showForm, editFormData]);

    const handleOpenCreate = () => {
        setEditingId(null);
        setEditFormData(null);
        setCategory('');
        setShowForm(true);
    };

    const handleOpenEdit = (expense: Expense) => {
        setEditingId(expense.id);
        setEditFormData(expense);
        setCategory(expense.category);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const executeDelete = async (id: string) => {
        const result = await deleteExpense(id);

        if (!result.success) {
            setConfirmModal({
                isOpen: true,
                title: 'Error',
                message: result.message || 'Failed to delete expense',
                type: 'danger',
                onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false })),
                confirmText: 'OK'
            });
        }
    };

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Expense',
            message: 'Are you sure you want to delete this expense record? This action cannot be undone.',
            type: 'danger',
            confirmText: 'Delete',
            onConfirm: () => executeDelete(id)
        });
    };

    const executeSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        const actionType = editingId ? 'update' : 'create';

        let result;
        if (editingId) {
            result = await updateExpense(editingId, formData);
        } else {
            // Pass null for prevState
            result = await createExpense(null, formData);
        }

        if (result.success) {
            setShowForm(false);
            setEditingId(null);
            setEditFormData(null);
            setCategory('');
        } else {
            setConfirmModal({
                isOpen: true,
                title: 'Error',
                message: result.message || `Failed to ${actionType} expense`,
                type: 'danger',
                onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false })),
                confirmText: 'OK'
            });
        }

        setIsSubmitting(false);
    };

    const handleSubmit = async (formData: FormData) => {
        const actionType = editingId ? 'Update' : 'Create';
        const confirmMsg = editingId
            ? 'Are you sure you want to save changes to this expense?'
            : 'Are you sure you want to log this expense?';

        setConfirmModal({
            isOpen: true,
            title: `${actionType} Expense`,
            message: confirmMsg,
            type: 'warning',
            confirmText: 'Confirm',
            onConfirm: () => executeSubmit(formData)
        });
    };

    const categoryOptions = Object.entries(categoryLabels).map(([key, label]) => ({
        value: key,
        label: label,
        color: 'text-white'
    }));

    return (
        <div className="space-y-10 font-inter pb-10">

            <div className="flex flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-xl md:text-3xl text-white uppercase flex items-center gap-3 font-anton">
                        <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-[#ea6819]" />
                        Finances
                    </h1>
                </div>
                <button
                    onClick={() => showForm ? setShowForm(false) : handleOpenCreate()}
                    className="bg-[#ea6819] text-white px-4 py-2.5 md:px-6 md:py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#ea6819]/90 transition-all duration-300 primary-glow font-bold uppercase tracking-tight active:scale-95 cursor-pointer shadow-lg shadow-[#ea6819]/20"
                >
                    <Plus className={`w-5 h-5 transition-transform duration-300 ${showForm ? 'rotate-45' : ''}`} />
                    <span className="hidden sm:inline">{showForm ? 'Cancel' : 'Add Expense'}</span>
                    <span className="sm:hidden">{showForm ? 'Cancel' : 'Add'}</span>
                </button>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                <div className="glass-panel rounded-2xl p-4 md:p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 blur-3xl rounded-full" />
                    <p className="text-[8px] md:text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1.5">Total Revenue</p>
                    <p className="text-xl md:text-2xl font-outfit font-black text-green-500 tracking-tight group-hover:scale-105 origin-left transition-transform duration-500">
                        {formatMAD(dashboardStats.totalRevenue)}
                    </p>
                </div>

                <div className="glass-panel rounded-2xl p-4 md:p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-3xl rounded-full" />
                    <p className="text-[8px] md:text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1.5">Total Expenses</p>
                    <p className="text-xl md:text-2xl font-outfit font-black text-red-500 tracking-tight group-hover:scale-105 origin-left transition-transform duration-500">
                        {formatMAD(dashboardStats.totalExpenses)}
                    </p>
                </div>

                <div className="glass-panel rounded-2xl p-4 md:p-5 relative overflow-hidden group primary-glow-border">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full" />
                    <p className="text-[8px] md:text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1.5">Net Profit</p>
                    <p className={`text-xl md:text-2xl font-outfit font-black tracking-tight group-hover:scale-105 origin-left transition-transform duration-500 ${dashboardStats.netProfit >= 0 ? 'text-primary text-glow-primary' : 'text-red-500'
                        }`}>
                        {formatMAD(dashboardStats.netProfit)}
                    </p>
                </div>
            </div>

            {/* Add/Edit Expense Form */}
            {showForm && (
                <div className="glass-panel rounded-3xl p-6 md:p-8 primary-glow-border animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex justify-between items-center mb-6 md:mb-8">
                        <h2 className="text-xl md:text-2xl text-white uppercase">
                            {editingId ? 'Edit Expense' : 'Add Expense'}
                        </h2>
                        <button onClick={() => setShowForm(false)} className="text-white/20 hover:text-white transition-colors cursor-pointer">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form action={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Category</label>
                                <CustomSelect
                                    name="category"
                                    value={category}
                                    onChange={setCategory}
                                    options={categoryOptions}
                                    placeholder="Select Category"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Amount (MAD)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="amount"
                                        required
                                        step="0.01"
                                        min="0"
                                        defaultValue={editFormData?.amount}
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all font-mono"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/20 uppercase tracking-widest">MAD</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    required
                                    defaultValue={editFormData?.date}
                                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all cursor-pointer"
                                />
                            </div>

                            <div className="lg:col-span-3 space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Description</label>
                                <textarea
                                    name="description"
                                    required
                                    rows={2}
                                    defaultValue={editFormData?.description}
                                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none placeholder:text-white/20"
                                    placeholder="Enter details about this expense..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-[#ea6819] text-white font-bold py-4 rounded-xl hover:bg-[#ea6819]/90 transition-all duration-300 primary-glow uppercase tracking-wide disabled:opacity-50 disabled:cursor-wait"
                            >
                                {isSubmitting ? 'Saving...' : (editingId ? 'Update Expense' : 'Save Expense')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                confirmText={confirmModal.confirmText}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Expenses by Category */}
                <div className="lg:col-span-1 space-y-4 md:space-y-6">
                    <div className="flex items-center gap-3">
                        <PieChart className="w-5 h-5 text-red-500" />
                        <h2 className="text-xl md:text-2xl text-white uppercase">By Category</h2>
                    </div>

                    <div className="glass-panel rounded-3xl p-6 space-y-4">
                        {Object.entries(expensesByCategory).length > 0 ? (
                            Object.entries(expensesByCategory).map(([category, amount]) => (
                                <div key={category} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                            {(() => {
                                                const Icon = categoryIcons[category] || MoreHorizontal;
                                                return <Icon className="w-4 h-4 text-red-500" />;
                                            })()}
                                        </div>
                                        <p className="text-xs font-bold text-white/60 uppercase tracking-widest capitalize">{categoryLabels[category] || category}</p>
                                    </div>
                                    <p className="text-lg font-outfit font-black text-white tracking-tight">{formatMAD(amount)}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-white/20 text-xs uppercase tracking-widest">No Data</div>
                        )}
                    </div>
                </div>

                {/* Recent Expenses */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-3">
                        <History className="w-6 h-6 text-white/20" />
                        <h2 className="text-2xl text-white uppercase">Recent Expenses</h2>
                    </div>

                    <div className="glass-panel rounded-3xl overflow-hidden relative">
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto admin-scrollbar">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 border-b border-white/5">
                                        <th className="text-left py-6 px-8 min-w-[120px]">Date</th>
                                        <th className="text-left py-6 px-6">Category</th>
                                        <th className="text-left py-6 px-6 min-w-[200px]">Description</th>
                                        <th className="text-right py-6 px-8">Amount</th>
                                        <th className="text-right py-6 px-8">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.02]">
                                    {expenses.slice(0, 10).map((expense) => (
                                        <tr key={expense.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="py-5 px-8">
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="w-3.5 h-3.5 text-white/20" />
                                                    <span className="text-xs font-outfit text-white/60 font-bold">{formatDateDisplay(expense.date)}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-[9px] font-bold uppercase tracking-widest">
                                                    {categoryLabels[expense.category] || expense.category}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6 text-sm text-white/50 font-outfit max-w-[200px] truncate" title={expense.description}>
                                                {expense.description}
                                            </td>
                                            <td className="py-5 px-8 text-right font-outfit font-black text-red-500 tracking-tight text-lg">{formatMAD(expense.amount)}</td>
                                            <td className="py-5 px-8 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleOpenEdit(expense)}
                                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(expense.id)}
                                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4 p-4">
                            {expenses.slice(0, 10).map((expense) => (
                                <div key={expense.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 space-y-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-[9px] font-bold uppercase tracking-widest shrink-0">
                                            {categoryLabels[expense.category] || expense.category}
                                        </span>
                                        <span className="font-outfit font-black text-red-500 tracking-tight text-lg">
                                            {formatMAD(expense.amount)}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-1.5 text-white/30">
                                            <Calendar className="w-3 h-3" />
                                            <span className="text-[10px] font-outfit font-bold">{formatDateDisplay(expense.date)}</span>
                                        </div>
                                        <p className="text-sm text-white/60 font-outfit leading-snug">
                                            {expense.description}
                                        </p>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                                        <button
                                            onClick={() => handleOpenEdit(expense)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                                        >
                                            <Edit className="w-3 h-3" /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(expense.id)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/20 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {expenses.length === 0 && (
                            <div className="text-center py-24">
                                <TrendingDown className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                <h3 className="text-xl text-white uppercase">No Expenses</h3>
                                <p className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase">Add your first expense to get started</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
