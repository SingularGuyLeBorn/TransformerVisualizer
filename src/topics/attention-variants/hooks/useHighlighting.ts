// FILE: src/topics/attention-variants/hooks/useHighlighting.ts
import { useMemo } from 'react';
import { HighlightState } from '../types';

export const useHighlighting = (
  name: string,
  row: number,
  col: number,
  highlight: HighlightState
) => {
  return useMemo(() => {
    const { target, sources } = highlight;

    const isTarget =
      !!target &&
      target.name === name &&
      target.row === row &&
      target.col === col;

    const isSource = sources.some(s => {
      if (s.name !== name) return false;
      if (s.highlightRow) return s.row === row;
      if (s.highlightCol) return s.col === col;
      return s.row === row && s.col === col;
    });

    return { isTarget, isSource };
  }, [name, row, col, highlight]);
};

// END OF FILE: src/topics/attention-variants/hooks/useHighlighting.ts