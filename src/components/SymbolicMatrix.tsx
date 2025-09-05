// FILE: src/components/SymbolicMatrix.tsx
import React from 'react';
import { HighlightState } from '../types';
import { InlineMath } from 'react-katex';
import { getSymbolParts } from '../config/symbolMapping';
import { SymbolicElement } from './SymbolicElement';

interface SymbolicMatrixProps {
  name: string;
  rows: number;
  cols: number;
  highlight: HighlightState;
  transpose?: boolean;
}

export const SymbolicMatrix: React.FC<SymbolicMatrixProps> = React.memo(({ name, rows, cols, highlight, transpose = false }) => {
  const displayRows = transpose ? cols : rows;
  const displayCols = transpose ? rows : cols;
  const symbol = getSymbolParts(name);
  
  const highlightedTarget = (highlight.target?.name === name) ? highlight.target : null;
  const highlightedSources = highlight.sources.filter(s => s.name === name);

  const gridElements: React.ReactNode[] = [];
  
  for (let r = 0; r < displayRows; r++) {
    for (let c = 0; c < displayCols; c++) {
      const originalRow = transpose ? c : r;
      const originalCol = transpose ? r : c;

      let isTarget = !!highlightedTarget && highlightedTarget.row === originalRow && highlightedTarget.col === originalCol;
      
      let isSource = highlightedSources.some(s => {
        if (s.highlightRow) return s.row === originalRow;
        if (s.highlightCol) return s.col === originalCol;
        return s.row === originalRow && s.col === originalCol;
      });

      gridElements.push(
        <SymbolicElement
          key={`elem-r${r}-c${c}`}
          base={symbol.base}
          subscript={symbol.subscript}
          row={originalRow}
          col={originalCol}
          isTarget={isTarget}
          isSource={isSource}
        />
      );
    }
  }

  let mathSymbol = symbol.base;
  if (symbol.superscript) mathSymbol += `^{${symbol.superscript}}`;
  if (transpose) mathSymbol += '^T';
  
  // [FIX] Combine symbol's own subscript with dimension subscript to prevent KaTeX errors.
  const subscriptParts = [];
  if (symbol.subscript) {
    subscriptParts.push(symbol.subscript);
  }
  subscriptParts.push(`${displayRows} \\times ${displayCols}`);
  mathSymbol += `_{${subscriptParts.join(',')}}`;

  return (
    <div className="symbolic-matrix-container">
      <div className="matrix-label"><InlineMath>{`${mathSymbol}`}</InlineMath></div>
      <div className="symbolic-matrix-grid" style={{ gridTemplateColumns: `repeat(${displayCols}, auto)` }}>
        {gridElements}
      </div>
    </div>
  );
});
// END OF FILE: src/components/SymbolicMatrix.tsx