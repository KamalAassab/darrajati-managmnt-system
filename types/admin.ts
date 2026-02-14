// Admin System Type Definitions

export interface Scooter {
    id: string;
    slug: string;
    name: string;
    image: string;
    engine: string;
    speed: string;
    price: number;
    quantity: number;
    activeRentals?: number;
    maintenanceCount?: number;
    availableCount?: number;
    status: 'available' | 'rented' | 'maintenance'; // Computed for display compatibility
    createdAt: string;
    updatedAt: string;
}

export interface Client {
    id: string;
    fullName: string;
    documentId: string; // CIN or Passport
    phone: string;
    currentScooter?: string;
    currentScooterMatricule?: string;
    createdAt: string;
    updatedAt: string;
}


export interface RentalPayment {
    id: string;
    rentalId: number; // Changed to number to match DB
    amount: number;
    date: string;
    notes?: string;
}

export interface Rental {
    id: string;
    scooterId: string;
    clientId: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    amountPaid: number;
    status: 'active' | 'completed' | 'cancelled';
    paymentStatus: 'paid' | 'pending' | 'partial';
    paymentMethod: 'cash' | 'transfer';
    hasGuarantee?: boolean;
    scooterMatricule?: string; // Optional for backward compatibility
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Expense {
    id: string;
    category: 'maintenance' | 'fuel' | 'advertising' | 'salary' | 'rent' | 'insurance' | 'other';
    amount: number;
    date: string;
    description: string;
    createdAt: string;
}

export interface DashboardStats {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    activeRentals: number;
    overdueRentals: number;
    availableScooters: number;
    totalScooters: number;
}

export interface AnalyticsData {
    monthlyStats: {
        month: string;
        revenue: number;
        expenses: number;
        profit: number;
    }[];
    topScooters: {
        id: string;
        name: string;
        image: string;
        revenue: number;
        trips: number;
    }[];
    tips: string[];
}

export interface RentalWithDetails extends Rental {
    scooter: Scooter;
    client: Client;
}

export type Language = 'en' | 'fr' | 'ar';
