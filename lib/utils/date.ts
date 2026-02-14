/**
 * Formats a date string (expected YYYY-MM-DD) into DD/MM/YYYY for display
 * @param dateString The date string to format
 * @returns Formatted date string or original string if invalid
 */
export function formatDateDisplay(dateString: string | Date | undefined): string {
    if (!dateString) return '';

    try {
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

        // Check if date is valid
        if (isNaN(date.getTime())) return String(dateString);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    } catch (e) {
        return String(dateString);
    }
}

/**
 * Checks if a year is a leap year
 * @param year The year to check
 * @returns true if leap year, false otherwise
 */
export function isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Gets the number of days in a specific month of a year
 * @param month The month (1-12)
 * @param year The year
 * @returns Number of days in the month
 */
export function getDaysInMonth(month: number, year: number): number {
    return new Date(year, month, 0).getDate();
}

/**
 * Strictly validates a date string in YYYY-MM-DD format
 * Handles leap years and correct days per month
 * @param dateString Date string in YYYY-MM-DD format
 * @returns true if valid, false otherwise
 */
export function isValidDate(dateString: string): boolean {
    // Regex check for format YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    // Parse parts
    const [yearStr, monthStr, dayStr] = dateString.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    // Basic range checks
    if (year < 1900 || year > 2100) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1) return false;

    // Specific month length check
    const daysInMonth = getDaysInMonth(month, year);
    return day <= daysInMonth;
}
