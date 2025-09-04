/* START OF FILE: src/components/Element.tsx */
// FILE: src/components/Element.tsx
import React from 'react';
import { HighlightState, ElementIdentifier } from '../types';

interface ElementProps {
  name: string;
  row: number;
  col: number;
  value: number;
  highlight: HighlightState;
  onElementClick: (element: ElementIdentifier) => void;
}

// The 'export' keyword here is crucial. It makes this file a module.
export const Element: React.FC<ElementProps> = React.memo(({ name, row, col, value, highlight, onElementClick }) => {

  const isTarget = highlight.target?.name === name && highlight.target?.row === row && highlight.target?.col === col;
  const isSource = highlight.sources.some(s => s.name === name && s.row === row && s.col === col);

  const className = `matrix-element ${isTarget ? 'target' : ''} ${isSource ? 'source' : ''}`;

  const handleClick = () => {
    onElementClick({ name, row, col });
  };

  return (
    <div className={className} onClick={handleClick}>
      {value.toFixed(2)}
    </div>
  );
});
// END OF FILE: src/components/Element.tsx
