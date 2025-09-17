// FILE: src/components/primitives/InteractiveElement/InteractiveElement.tsx
import React from 'react';
import { HighlightState, ElementIdentifier } from '../types';
import './InteractiveElement.css';

interface InteractiveElementProps {
  identifier: ElementIdentifier;
  value: number;
  highlight: HighlightState;
  onElementClick: (identifier: ElementIdentifier, event: React.MouseEvent) => void;
}

const formatValue = (value: number) => {
  if (value === -Infinity) return '-∞';
  if (value === Infinity) return '+∞';
  const fixed = value.toFixed(2);
  return parseFloat(fixed).toString();
};

export const InteractiveElement: React.FC<InteractiveElementProps> = React.memo(({
  identifier,
  value,
  highlight,
  onElementClick
}) => {
  const { name, row, col } = identifier;

  const isTarget = highlight.target?.name === name && highlight.target.row === row && highlight.target.col === col;

  const isSource = highlight.sources.some(s => {
    if (s.name !== name) return false;
    if (s.highlightRow) return s.row === row;
    if (s.highlightCol) return s.col === col;
    return s.row === row && s.col === col;
  });

  const classNames = ['interactive-element'];
  if (isTarget) classNames.push('target');
  if (isSource) classNames.push('source');

  const handleClick = (event: React.MouseEvent) => {
    onElementClick(identifier, event);
  };

  return (
    <div className={classNames.join(' ')} onClick={handleClick} title={`${name}[${row},${col}] = ${value}`}>
      {formatValue(value)}
    </div>
  );
});
// END OF FILE: src/components/primitives/InteractiveElement/InteractiveElement.tsx