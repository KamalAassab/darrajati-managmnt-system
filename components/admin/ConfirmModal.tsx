'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger'
}: ConfirmModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger': return <AlertTriangle className="w-6 h-6 text-red-500" />;
            case 'warning': return <AlertTriangle className="w-6 h-6 text-orange" />;
            case 'success': return <CheckCircle2 className="w-6 h-6 text-green-500" />;
            case 'info':
            default: return <Info className="w-6 h-6 text-blue-500" />;
        }
    };

    const getConfirmButtonStyle = () => {
        switch (type) {
            case 'danger': return 'bg-red-500 text-white hover:bg-red-600';
            case 'warning': return 'bg-orange text-white hover:bg-orange/90';
            case 'success': return 'bg-green-500 text-white hover:bg-green-600';
            case 'info':
            default: return 'bg-blue-500 text-white hover:bg-blue-600';
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden scale-in-95 animate-in duration-200 orange-glow-border">
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full bg-white/5 border border-white/5`}>
                                {getIcon()}
                            </div>
                            <h2 className="text-xl font-outfit font-black uppercase tracking-tight text-white">
                                {title}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/40 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <p className="text-white/70 text-sm leading-relaxed">
                        {message}
                    </p>

                    <div className="flex justify-end gap-3 pt-4">
                        {cancelText && (
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-xl active:scale-95 ${getConfirmButtonStyle()}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
