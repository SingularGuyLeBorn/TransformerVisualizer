// FILE: src/components/ResidualBlock.tsx
import React from 'react';
import { ElementIdentifier, HighlightState } from '../types';
import { InlineMath } from 'react-katex';

interface ResidualBlockProps {
  id: string; // e.g., "res1"
  type: 'start' | 'end';
  matrixSymbol: string;
  matrixDims: string;
  highlight: HighlightState;
  onElementClick: (element: ElementIdentifier) => void;
}

export const ResidualBlock: React.FC<ResidualBlockProps> = ({ id, type, matrixSymbol, matrixDims, highlight, onElementClick }) => {
  const isActive = highlight.activeResidual === id;
  const isStart = type === 'start';
  const icon = isStart ? '↓' : '←'; // [MODIFIED] Changed end icon to left arrow

  const handleClick = () => {
    onElementClick({
      name: `residual.${id}.${type}`,
      row: -1,
      col: -1,
      matrixSymbol,
      matrixDims,
    });
  };

  return (
    <div
      className={`residual-block ${isActive ? 'active' : ''}`}
      onClick={handleClick}
      title={`Residual Connection (${matrixSymbol})`}
    >
      <div className="residual-icon">{icon}</div>
      <div className="residual-info">
          <div className="residual-matrix-symbol"><InlineMath math={matrixSymbol} /></div>
          <div className="residual-matrix-dims">{matrixDims}</div>
      </div>
    </div>
  );
};
// END OF FILE: src/components/ResidualBlock.tsx