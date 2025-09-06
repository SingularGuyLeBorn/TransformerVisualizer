// FILE: src/components/Element.tsx
import React from 'react';
import { HighlightState, ElementIdentifier } from '../types';
import { useHighlighting } from '../hooks/useHighlighting';

interface ElementProps {
  name: string;
  row: number;
  col: number;
  value: number;
  highlight: HighlightState;
  onElementClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
}

export const Element: React.FC<ElementProps> = React.memo(({ name, row, col, value, highlight, onElementClick }) => {
  // [MODIFIED] Centralized highlighting logic by using the new hook.
  const { isTarget, isSource, isDestination } = useHighlighting(name, row, col, highlight);

  const className = `matrix-element ${isTarget ? 'target' : ''} ${isSource ? 'source' : ''} ${isDestination ? 'destination' : ''}`;

  const handleClick = (event: React.MouseEvent) => {
    onElementClick({ name, row, col }, event);
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