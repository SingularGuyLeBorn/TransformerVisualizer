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

export const Element: React.FC<ElementProps> = React.memo(({ name, row, col, value, highlight, onElementClick }) => {

  const isTarget = highlight.target?.name === name && highlight.target?.row === row && highlight.target?.col === col && !highlight.target.isInternal;

  const isSource = highlight.sources.some(s => {
    if (s.name !== name || s.isInternal) return false;
    if (s.highlightRow) return s.row === row;
    if (s.highlightCol) return s.col === col;
    return s.row === row && s.col === col;
  });

  const isDestination = highlight.destinations?.some(d => {
    if (d.name !== name || d.isInternal) return false;
    if (d.highlightRow) return d.row === row;
    if (d.highlightCol) return d.col === col;
    return d.row === row && d.col === col;
  });

  const className = `matrix-element ${isTarget ? 'target' : ''} ${isSource ? 'source' : ''} ${isDestination ? 'destination' : ''}`;

  const handleClick = () => {
    onElementClick({ name, row, col });
  };

  const displayValue = () => {
      if (value === -Infinity) return '-∞';
      if (value === Infinity) return '+∞';
      return value.toFixed(2);
  }

  return (
    <div className={className} onClick={handleClick}>
      {displayValue()}
    </div>
  );
});
// END OF FILE: src/components/Element.tsx