// FILE: src/components/utils/formatters.ts
/**
 * Formats a number for display, handling infinities and fixing precision.
 * @param num The number to format.
 * @param precision The number of decimal places.
 * @returns The formatted string.
 */
export const formatNumber = (num: number, precision: number = 2): string => {
    if (num === null || num === undefined || isNaN(num)) return '?';
    if (num === -Infinity) return '-∞';
    if (num === Infinity) return '+∞';
    const fixed = num.toFixed(precision);
    // Remove trailing zeros and the decimal point if it's not needed
    return parseFloat(fixed).toString();
};
// END OF FILE: src/components/utils/formatters.ts