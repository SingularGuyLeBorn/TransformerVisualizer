// FILE: src/hooks/useHighlighting.ts
import { useMemo } from 'react';
import { HighlightState } from '../types';

/**
 * A centralized hook to determine the highlight status of an element.
 * This prevents logic duplication and ensures consistent highlighting behavior
 * across the entire application (e.g., in Viz.tsx and Explanation.tsx).
 *
 * @param name - The unique name of the component's matrix/vector.
 * @param row - The row index of the element.
 * @param col - The column index of the element.
 * @param highlight - The global highlight state object.
 * @returns An object { isTarget, isSource, isDestination } indicating the element's highlight status.
 */
export const useHighlighting = (
  name: string,
  row: number,
  col: number,
  highlight: HighlightState
) => {
  return useMemo(() => {
    const { target, sources, destinations } = highlight;

    // Check if this element is the primary target
    const isTarget =
      !!target &&
      target.name === name &&
      target.row === row &&
      target.col === col &&
      !target.isInternal;

    // Check if this element is a source
    const isSource = sources.some(s => {
      if (s.name !== name || s.isInternal) return false;

      // [FIXED] Correctly handle row, column, and single-cell highlighting.
      if (s.highlightRow && s.highlightCol) {
          // This case means the entire matrix is a source, e.g., for residual connections.
          return true;
      }
      if (s.highlightRow) {
          return s.row === row;
      }
      if (s.highlightCol) {
          return s.col === col;
      }
      // Default to single-cell check if no specific highlight type is given
      return s.row === row && s.col === col;
    });

    // Check if this element is a destination
    const isDestination = (destinations || []).some(d => {
       if (d.name !== name || d.isInternal) return false;

       if (d.highlightRow && d.highlightCol) {
          return true;
       }
       if (d.highlightRow) {
           return d.row === row;
       }
       if (d.highlightCol) {
           return d.col === col;
       }
       return d.row === row && d.col === col;
    });

    return { isTarget, isSource, isDestination };
  // The dependency array is correct as we are only using props passed to the hook.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, row, col, highlight]);
};
// END OF FILE: src/hooks/useHighlighting.ts