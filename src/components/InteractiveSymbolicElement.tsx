// FILE: src/components/InteractiveSymbolicElement.tsx
import React from 'react';
import { InlineMath } from 'react-katex';
import { HighlightState } from '../types';
import { useHighlighting } from '../hooks/useHighlighting';

interface InteractiveSymbolicElementProps {
  name: string; // [ADDED] Pass the full matrix name for the hook
  base: string;
  subscript?: string;
  row?: number;
  col?: number;
  highlight: HighlightState; // [ADDED] Pass the full highlight state
  onClick: (event: React.MouseEvent) => void;
}

export const InteractiveSymbolicElement: React.FC<InteractiveSymbolicElementProps> = React.memo(({ name, base, subscript, row, col, highlight, onClick }) => {
  // [MODIFIED] Centralized highlighting logic by using the new hook.
  // We handle undefined row/col for vectors.
  // [FIXED] Removed the 5th argument 'true' which caused the compilation error.
  const { isTarget, isSource, isDestination } = useHighlighting(name, row ?? 0, col ?? 0, highlight);

  const elementBase = base.toLowerCase().replace(/'/g, '').replace(/_{.*}/, '');
  const subscriptContent = [subscript, row, col].filter(s => s !== undefined && s !== null).join(',');
  const mathString = `${elementBase}_{${subscriptContent}}`;

  const className = `symbolic-element ${isTarget ? 'target' : ''} ${isSource ? 'source' : ''} ${isDestination ? 'destination' : ''}`;

  return (
    <div className={className} onClick={onClick} style={{cursor: 'pointer'}}>
      <InlineMath math={mathString} />
    </div>
  );
});
// END OF FILE: src/components/InteractiveSymbolicElement.tsx