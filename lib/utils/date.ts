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
