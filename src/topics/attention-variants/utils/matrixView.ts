// FILE: src/topics/attention-variants/utils/matrixView.ts
export const ELLIPSIS = '...';
const MIN_SIZE_FOR_TRUNCATION = 12;

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

  for (let i = 0; i < Math.min(alwaysShowCount, totalSize); i++) {
    visible.add(i);
  }
  for (let i = 0; i < Math.min(alwaysShowCount, totalSize); i++) {
    visible.add(totalSize - 1 - i);
  }

  // [NEW] Also include the middle index when there's no specific focus
  if (focusIndex === -1 && totalSize >= MIN_SIZE_FOR_TRUNCATION) {
    visible.add(Math.floor((totalSize - 1) / 2));
  }

  if (focusIndex !== -1) {
    const windowStart = Math.max(0, focusIndex - Math.floor(windowSize / 2));
    const windowEnd = Math.min(totalSize - 1, focusIndex + Math.floor(windowSize / 2));
    for (let i = windowStart; i <= windowEnd; i++) {
      visible.add(i);
    }
  }

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
// END OF FILE: src/topics/attention-variants/utils/matrixView.ts