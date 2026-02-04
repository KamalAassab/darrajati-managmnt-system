'use client';

import { useState } from 'react';
import { createExpense, updateExpense, deleteExpense } from '@/app/actions';
import { formatMAD } from '@/lib/utils/currency';
import { Plus, TrendingDown, DollarSign, PieChart, Calendar, X, History, Trash2, Edit } from 'lucide-react';
import { Expense, DashboardStats } from '@/types/admin';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

interface FinancesPageClientProps {
    expenses: Expense[];
    dashboardStats: DashboardStats;
}

export default function FinancesPageClient({ expenses, dashboardStats }: FinancesPageClientProps) {
    const { t } = useLanguage();
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<Expense | null>(null);


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

    const handleOpenCreate = () => {
        setEditingId(null);
        setEditFormData(null);
        setShowForm(true);
    };

    const handleOpenEdit = (expense: Expense) => {
        setEditingId(expense.id);
        setEditFormData(expense);
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

    return (
        <div className="space-y-10 font-inter pb-10">

            <div className="flex justify-between items-end">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange text-glow-orange mb-2">{t('finances')}</p>
                    <h1 className="text-4xl font-outfit font-black tracking-tighter text-white uppercase flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-orange" />
                        {t('finances')}
                    </h1>
                </div>
                <button
                    onClick={() => showForm ? setShowForm(false) : handleOpenCreate()}
                    className="bg-orange text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-orange/90 transition-all duration-300 orange-glow font-bold uppercase tracking-tight active:scale-95 cursor-pointer"
                >
                    <Plus className={`w-5 h-5 transition-transform duration-300 ${showForm ? 'rotate-45' : ''}`} />
                    {showForm ? t('cancel') : t('addExpense')}
                </button>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass-panel rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 blur-3xl rounded-full" />
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">{t('totalRevenue')}</p>
                    <p className="text-4xl font-outfit font-black text-green-500 tracking-tight group-hover:scale-110 origin-left transition-transform duration-500">
                        {formatMAD(dashboardStats.totalRevenue)}
                    </p>
                </div>

                <div className="glass-panel rounded-3xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-3xl rounded-full" />
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">{t('totalExpenses')}</p>
                    <p className="text-4xl font-outfit font-black text-red-500 tracking-tight group-hover:scale-110 origin-left transition-transform duration-500">
                        {formatMAD(dashboardStats.totalExpenses)}
                    </p>
                </div>

                <div className="glass-panel rounded-3xl p-8 relative overflow-hidden group orange-glow-border">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange/5 blur-3xl rounded-full" />
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">{t('netProfit')}</p>
                    <p className={`text-4xl font-outfit font-black tracking-tight group-hover:scale-110 origin-left transition-transform duration-500 ${dashboardStats.netProfit >= 0 ? 'text-orange text-glow-orange' : 'text-red-500'
                        }`}>
                        {formatMAD(dashboardStats.netProfit)}
                    </p>
                </div>
            </div>

            {/* Add/Edit Expense Form */}
            {showForm && (
                <div className="glass-panel rounded-3xl p-8 orange-glow-border animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-outfit font-black tracking-tighter text-white uppercase">
                            {editingId ? 'Edit Expense' : 'Add New Expense'}
                        </h2>
                        <button onClick={() => setShowForm(false)} className="text-white/20 hover:text-white transition-colors cursor-pointer">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form action={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Category</label>
                                <div className="relative">
                                    <select
                                        name="category"
                                        required
                                        defaultValue={editFormData?.category || ""}
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-orange/50 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-black">Select Category...</option>
                                        <option value="maintenance" className="bg-black">Maintenance</option>
                                        <option value="fuel" className="bg-black">Fuel</option>
                                        <option value="advertising" className="bg-black">Advertising</option>
                                        <option value="salary" className="bg-black">Salaries</option>
                                        <option value="rent" className="bg-black">Rent</option>
                                        <option value="insurance" className="bg-black">Insurance</option>
                                        <option value="other" className="bg-black">Other</option>
                                    </select>
                                </div>
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
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-orange/50 outline-none transition-all font-mono"
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
                                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-orange/50 outline-none transition-all cursor-pointer"
                                />
                            </div>

                            <div className="lg:col-span-3 space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Description</label>
                                <textarea
                                    name="description"
                                    required
                                    rows={2}
                                    defaultValue={editFormData?.description}
                                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-orange/50 outline-none transition-all resize-none placeholder:text-white/20"
                                    placeholder="Enter details..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-orange text-white font-bold py-4 rounded-2xl hover:bg-orange/90 transition-all duration-300 orange-glow uppercase tracking-wide disabled:opacity-50 disabled:cursor-wait"
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
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-center gap-3">
                        <PieChart className="w-5 h-5 text-red-500" />
                        <h2 className="text-2xl font-outfit font-black tracking-tighter text-white uppercase">Expenses by Category</h2>
                    </div>

                    <div className="glass-panel rounded-3xl p-6 space-y-4">
                        {Object.entries(expensesByCategory).length > 0 ? (
                            Object.entries(expensesByCategory).map(([category, amount]) => (
                                <div key={category} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500/50 group-hover:bg-red-500 transition-colors" />
                                        <p className="text-xs font-bold text-white/60 uppercase tracking-widest capitalize">{category}</p>
                                    </div>
                                    <p className="text-lg font-outfit font-black text-white tracking-tight">{formatMAD(amount)}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-white/20 text-xs uppercase tracking-widest">No data available</div>
                        )}
                    </div>
                </div>

                {/* Recent Expenses */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-3">
                        <History className="w-6 h-6 text-white/20" />
                        <h2 className="text-2xl font-outfit font-black tracking-tighter text-white uppercase">Recent Expenses</h2>
                    </div>

                    <div className="glass-panel rounded-3xl overflow-hidden relative">
                        <div className="overflow-x-auto admin-scrollbar">
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
                                                    <span className="text-xs font-mono text-white/60 font-bold">{expense.date}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-[9px] font-bold uppercase tracking-widest">
                                                    {expense.category}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6 text-sm text-white/50 italic max-w-[200px] truncate" title={expense.description}>
                                                {expense.description}
                                            </td>
                                            <td className="py-5 px-8 text-right font-outfit font-black text-red-500 tracking-tight text-lg">{formatMAD(expense.amount)}</td>
                                            <td className="py-5 px-8 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleOpenEdit(expense)}
                                                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                                                        title="Edit Expense"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(expense.id)}
                                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors"
                                                        title="Delete Expense"
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

                        {expenses.length === 0 && (
                            <div className="text-center py-24">
                                <TrendingDown className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                <h3 className="text-xl font-outfit font-black tracking-tighter text-white uppercase">No Expenses Found</h3>
                                <p className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase">Add your first expense to see analytics</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
