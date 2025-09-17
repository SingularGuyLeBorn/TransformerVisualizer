// FILE: src/components/utils/array.ts
export const ELLIPSIS = '...';
const MIN_SIZE_FOR_TRUNCATION = 12;

/**
 * Calculates the visible indices for a row or column of a matrix based on a focus point.
 * It always shows the first and last `alwaysShowCount` items.
 * It shows a `windowSize` around the `focusIndex`.
 *
 * @param totalSize - The total number of items (rows or columns).
 * @param focusIndex - The index of the focused item, or -1 if no focus.
 * @param alwaysShowCount - The number of items to always show at the beginning and end.
 * @param windowSize - The size of the focus window around the focusIndex.
 * @returns An array of indices to display, with ELLIPSIS string for gaps.
 */
export const getVisibleIndices = (
  totalSize: number,
  focusIndex: number = -1,
  alwaysShowCount: number = 4,
  windowSize: number = 9
): (number | typeof ELLIPSIS)[] => {

  if (totalSize < MIN_SIZE_FOR_TRUNCATION) {
    return Array.from({ length: totalSize }, (_, i) => i);
  }

  const visible = new Set<number>();

  // 1. Add always-visible indices
  for (let i = 0; i < Math.min(alwaysShowCount, totalSize); i++) {
    visible.add(i);
  }
  for (let i = 0; i < Math.min(alwaysShowCount, totalSize); i++) {
    visible.add(totalSize - 1 - i);
  }

  // 2. Also include the middle index when there's no specific focus
  if (focusIndex === -1) {
    visible.add(Math.floor((totalSize - 1) / 2));
  }

  // 3. Add focus window indices
  if (focusIndex !== -1) {
    const windowStart = Math.max(0, focusIndex - Math.floor(windowSize / 2));
    const windowEnd = Math.min(totalSize - 1, focusIndex + Math.floor(windowSize / 2));
    for (let i = windowStart; i <= windowEnd; i++) {
      visible.add(i);
    }
  }

  // 4. Build the final array with ellipses for gaps
  const sorted = Array.from(visible).sort((a, b) => a - b);
  const result: (number | typeof ELLIPSIS)[] = [];

  if (sorted.length > 0) {
    result.push(sorted[0]);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] > sorted[i - 1] + 1) {
        result.push(ELLIPSIS);
      }
      result.push(sorted[i]);
    }
  }

  return result;
};
// END OF FILE: src/components/utils/array.ts