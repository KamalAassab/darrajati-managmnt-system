import { z } from 'zod';
import { isValidDate } from './utils/date';

// Login Schema
export const loginSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(4, 'Password must be at least 4 characters'),
});

// Scooter Schema
export const scooterSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    engine: z.coerce.number().int().positive('Engine must be a positive integer (CC)'),
    speed: z.coerce.number().int().positive('Speed must be a positive integer (KM/H)'),
    price: z.coerce.number().int().positive('Price must be a positive integer'),
    quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
    maintenanceCount: z.coerce.number().int().min(0).default(0).optional(),
    // status: z.enum(['available', 'rented', 'maintenance']), // Removed legacy status
});

// Client Schema
export const clientSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    documentId: z.string().min(5, 'Valid CIN or Passport required'),
    phone: z.string().regex(/^(\+212|0)[56789]\d{8}$/, 'Valid Moroccan phone number required'),
});

// Rental Schema
export const rentalSchema = z.object({
    scooterId: z.preprocess((val) => String(val), z.string().min(1, 'Scooter ID required')),
    clientId: z.preprocess((val) => String(val), z.string().min(1, 'Client ID required')),
    startDate: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date required (YYYY-MM-DD)')
        .refine((val) => isValidDate(val), { message: 'Date does not exist (check for February 29th)' }),
    endDate: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date required (YYYY-MM-DD)')
        .refine((val) => isValidDate(val), { message: 'Date does not exist (check for February 29th)' }),
    totalPrice: z.number().positive('Total price must be positive'),
    amountPaid: z.number().min(0, 'Amount paid cannot be negative'),
    paymentStatus: z.enum(['paid', 'pending', 'partial']),
    paymentMethod: z.enum(['cash', 'transfer']),
    hasGuarantee: z.boolean().optional(),
    scooterMatricule: z.string().optional(),
    notes: z.string().optional(),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
});

// Expense Schema
export const expenseSchema = z.object({
    category: z.enum(['maintenance', 'fuel', 'advertising', 'salaries', 'rent', 'assurance', 'new_scooter', 'wifi', 'electricity_water', 'other']),
    amount: z.number().positive('Amount must be positive'),
    date: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date required (YYYY-MM-DD)')
        .refine((val) => isValidDate(val), { message: 'Date does not exist' }),
    description: z.string().min(3, 'Description must be at least 3 characters'),
});
