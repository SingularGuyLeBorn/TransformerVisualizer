// FILE: src/topics/attention-variants/components/Element.tsx
import React from 'react';
import { HighlightState, ElementIdentifier } from '../types';

interface ElementProps {
  name: string;
  row: number;
  col: number;
  value: number;
  highlight: HighlightState;
  onElementClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
  isProbMax?: boolean;
}

export const Element: React.FC<ElementProps> = React.memo(({ name, row, col, value, highlight, onElementClick, isProbMax = false }) => {

  const isTarget = highlight.target?.name === name && highlight.target?.row === row && highlight.target?.col === col;

  const isSource = highlight.sources.some(s => {
    if (s.name !== name) return false;
    if (s.highlightRow) return s.row === row;
    if (s.highlightCol) return s.col === col;
    return s.row === row && s.col === col;
  });

  const classNames = ['matrix-element'];
  if (isTarget) classNames.push('target');
  if (isSource) classNames.push('source');
  if (isProbMax) classNames.push('prob-max');

  const handleClick = (event: React.MouseEvent) => {
    // Assuming ElementIdentifier needs variant, which should be passed down or derived
    const variant = name.split('.')[0] as 'mha' | 'mqa' | 'gqa' | 'mla';
    onElementClick({ variant, name, row, col }, event);
  };

  const displayValue = () => {
      if (value === -Infinity) return '-∞';
      if (value === Infinity) return '+∞';
      return value.toFixed(2);
  }

  return (
    <div className={classNames.join(' ')} onClick={handleClick}>
      {displayValue()}
    </div>
  );
});

// END OF FILE: src/topics/attention-variants/components/Element.tsx