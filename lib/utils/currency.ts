export function formatMAD(amount: number): string {
    const formatted = new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);

    // Replace period with space for thousand separator
    return formatted.replace(/\./g, ' ');
}

export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC', // Fix hydration mismatch
    });
}

export function formatDateShort(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        timeZone: 'UTC', // Fix hydration mismatch
    });
}

export function calculateRentalPrice(dailyPrice: number, startDate: string, endDate: string, scooterName?: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate difference in milliseconds
    const diffTime = Math.abs(end.getTime() - start.getTime());
    // Convert to days (ceil to ensure partial days count as full days if logic demands)
    // Removed +1 to match user request (14th to 16th = 2 days)
    let days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Ensure minimum 1 day for same-day selection or very short duration
    days = Math.max(1, days);

    let discount = 0;

    if (days >= 15) {
        discount = 30;
    } else if (days >= 7) {
        discount = 20;
    } else if (days >= 3) {
        discount = 10;
    }

    let finalDailyPrice = Math.max(0, dailyPrice - discount);

    // Monthly overrides (30+ days)
    if (days >= 30) {
        // Promo for GO SWAP FLOW
        if (scooterName && scooterName.trim().toUpperCase() === 'GO SWAP FLOW') {
            // 1500 MAD per month -> approx 50 MAD/day
            finalDailyPrice = 50;
        } else if (dailyPrice === 120) {
            finalDailyPrice = 80;
        } else if (dailyPrice === 100) {
            finalDailyPrice = 70;
        }
    }

    return Math.round(finalDailyPrice * days);
}

export function isOverdue(endDate: string): boolean {
    // Use date strings for comparison to avoid timezone issues during hydration
    const today = new Date().toISOString().split('T')[0];
    const end = new Date(endDate).toISOString().split('T')[0];
    return end < today;
}
