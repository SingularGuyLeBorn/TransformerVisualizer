// FILE: src/components/InteractiveSymbolicElement.tsx
import React from 'react';
import { InlineMath } from 'react-katex';

interface InteractiveSymbolicElementProps {
  base: string;
  subscript?: string;
  row?: number;
  col?: number;
  isTarget?: boolean;
  isSource?: boolean;
  isDestination?: boolean;
  onClick: () => void;
}

export const InteractiveSymbolicElement: React.FC<InteractiveSymbolicElementProps> = React.memo(({ base, subscript, row, col, isTarget, isSource, isDestination, onClick }) => {
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