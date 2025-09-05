// FILE: src/components/SymbolicElement.tsx
import React from 'react';
import { InlineMath } from 'react-katex';

interface SymbolicElementProps {
  base: string;
  subscript?: string;
  row?: number;
  col?: number;
  isTarget?: boolean;
  isSource?: boolean;
}

export const SymbolicElement: React.FC<SymbolicElementProps> = React.memo(({ base, subscript, row, col, isTarget, isSource }) => {
  const elementBase = base.toLowerCase().replace(/'/g, '').replace(/_{.*}/, '');
  const subscriptContent = [subscript, row, col].filter(s => s !== undefined && s !== null).join(',');
  const mathString = `${elementBase}_{${subscriptContent}}`;

  const className = `symbolic-element ${isTarget ? 'target' : ''} ${isSource ? 'source' : ''}`;

  return (
    <div className={className}>
      <InlineMath math={mathString} />
    </div>
  );
});
// END OF FILE: src/components/SymbolicElement.tsx