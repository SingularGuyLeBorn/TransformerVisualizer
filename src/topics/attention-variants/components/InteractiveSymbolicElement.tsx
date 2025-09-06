// FILE: src/topics/attention-variants/components/InteractiveSymbolicElement.tsx
import React from 'react';
import { InlineMath } from 'react-katex';
import { HighlightState } from '../types';
import { useHighlighting } from '../hooks/useHighlighting';

interface InteractiveSymbolicElementProps {
  name: string;
  base: string;
  subscript?: string;
  row?: number;
  col?: number;
  highlight: HighlightState;
  onClick: (event: React.MouseEvent) => void;
}

export const InteractiveSymbolicElement: React.FC<InteractiveSymbolicElementProps> = React.memo(({ name, base, subscript, row, col, highlight, onClick }) => {
  const { isTarget, isSource } = useHighlighting(name, row ?? 0, col ?? 0, highlight);

  const elementBase = base.toLowerCase().replace(/'/g, '').replace(/_{.*}/, '');
  const subscriptContent = [subscript, row, col].filter(s => s !== undefined && s !== null).join(',');
  const mathString = `${elementBase}_{${subscriptContent}}`;

  const className = `symbolic-element ${isTarget ? 'target' : ''} ${isSource ? 'source' : ''}`;

  return (
    <div className={className} onClick={onClick} style={{cursor: 'pointer'}}>
      <InlineMath math={mathString} />
    </div>
  );
});

// END OF FILE: src/topics/attention-variants/components/InteractiveSymbolicElement.tsx