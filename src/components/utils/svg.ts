// FILE: src/components/utils/svg.ts
/**
 * Calculates the SVG path for a smooth curve between the centers of two DOM elements.
 * @param startEl The starting DOM element.
 * @param endEl The ending DOM element.
 * @param containerEl The parent container element for calculating relative coordinates.
 * @returns An SVG 'd' attribute string for the path.
 */
export const getCurvePath = (startEl: Element | null, endEl: Element | null, containerEl: Element | null): string => {
    if (!startEl || !endEl || !containerEl) return '';

    const containerRect = containerEl.getBoundingClientRect();
    const startRect = startEl.getBoundingClientRect();
    const endRect = endEl.getBoundingClientRect();

    const startX = startRect.left + startRect.width / 2 - containerRect.left;
    const startY = startRect.top + startRect.height / 2 - containerRect.top;
    const endX = endRect.left + endRect.width / 2 - containerRect.left;
    const endY = endRect.top + endRect.height / 2 - containerRect.top;

    const dx = endX - startX;
    const dy = endY - startY;

    // Control points for the Bezier curve, creating a gentle arc
    const cp1x = startX + dx * 0.25;
    const cp1y = startY + dy * 0.1;
    const cp2x = startX + dx * 0.75;
    const cp2y = startY + dy * 0.9;

    return `M ${startX} ${startY} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${endY}`;
};
// END OF FILE: src/components/utils/svg.ts