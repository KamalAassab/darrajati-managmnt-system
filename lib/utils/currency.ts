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

export function calculateRentalPrice(dailyPrice: number, startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate difference in milliseconds
    const diffTime = Math.abs(end.getTime() - start.getTime());
    // Convert to days (ceil to ensure partial days count as full days if logic demands, usually +1 for inclusive dates)
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

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
        if (dailyPrice === 120) {
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
