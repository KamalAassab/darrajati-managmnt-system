'use client';

import { useState, useEffect } from 'react';
import { createScooter, updateScooter } from '@/app/actions';
import { Scooter } from '@/types/admin';
import { X, Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface ScooterFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    scooter?: Scooter | null;
}

export function ScooterFormModal({ isOpen, onClose, scooter }: ScooterFormModalProps) {
    const router = useRouter();
    const isEdit = !!scooter;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Reset form when modal opens/closes or scooter changes
    useEffect(() => {
        if (isOpen) {
            setImagePreview(scooter?.image || null);
            setError(null);
            setFieldErrors({});
        }
    }, [isOpen, scooter]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setFieldErrors({});

        try {
            const formData = new FormData(e.currentTarget);

            let result;
            if (isEdit && scooter) {
                result = await updateScooter(scooter.id, formData);
            } else {
                result = await createScooter(null, formData);
            }

            if (result.success) {
                router.refresh();
                onClose();
            } else {
                if (result.fieldErrors) {
                    setFieldErrors(result.fieldErrors);
                    setError('Please fix the validation errors below');
                } else {
                    setError(result.message || 'An error occurred');
                }
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-[#0a0a0a] border-b border-white/10">
                    <h2 className="text-2xl font-anton text-white uppercase tracking-wide">
                        {isEdit ? 'Edit Scooter' : 'Add New Scooter'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="p-4 rounded-xl border bg-red-500/10 border-red-500/30 text-red-500">
                            {error}
                        </div>
                    )}

                    {/* Image Upload */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-white uppercase tracking-wider">
                            Scooter Image
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="image-upload"
                            />
                            <label
                                htmlFor="image-upload"
                                className="block w-full aspect-video border-2 border-dashed border-white/20 rounded-2xl overflow-hidden cursor-pointer hover:border-orange/50 transition-colors relative group"
                            >
                                {imagePreview ? (
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        fill
                                        className="object-contain"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-white/40 group-hover:text-orange/70 transition-colors">
                                        <Upload className="w-12 h-12 mb-2" />
                                        <span className="text-sm font-semibold">Click to upload image</span>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white uppercase tracking-wider">
                                Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                defaultValue={scooter?.name}
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-orange/50"
                                placeholder="e.g., Honda PCX 125"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white uppercase tracking-wider">
                                Engine (CC) *
                            </label>
                            <input
                                type="number"
                                name="engine"
                                defaultValue={scooter?.engine}
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-orange/50"
                                placeholder="125"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white uppercase tracking-wider">
                                Speed (KM/H) *
                            </label>
                            <input
                                type="number"
                                name="speed"
                                defaultValue={scooter?.speed}
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-orange/50"
                                placeholder="90"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white uppercase tracking-wider">
                                Daily Price (MAD) *
                            </label>
                            <input
                                type="number"
                                name="price"
                                defaultValue={scooter?.price}
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-orange/50"
                                placeholder="200"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white uppercase tracking-wider">
                                Status
                            </label>
                            <select
                                name="status"
                                defaultValue={scooter?.status || 'available'}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange/50"
                            >
                                <option value="available" className="bg-black">Available</option>
                                <option value="maintenance" className="bg-black">Maintenance</option>
                            </select>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-4 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-3 bg-orange hover:bg-orange/90 disabled:bg-orange/50 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                            {isEdit ? 'Update Scooter' : 'Create Scooter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
