// FILE: src/components/SymbolicVector.tsx
import React from 'react';
import { HighlightState } from '../types';
import { InlineMath } from 'react-katex';
import { Vector as VectorType } from '../types';
import { getSymbolParts } from '../config/symbolMapping';
import { SymbolicElement } from './SymbolicElement';

interface SymbolicVectorProps {
  name: string;
  data: VectorType;
  highlight: HighlightState;
}

export const SymbolicVector: React.FC<SymbolicVectorProps> = React.memo(({ name, data, highlight }) => {
  const displayCols = data.length;
  const symbol = getSymbolParts(name);

  const gridElements: React.ReactNode[] = [];
  const highlightedIndices = new Set<number>();
  if (highlight.target?.name === name) highlightedIndices.add(highlight.target.col);
  highlight.sources.forEach(s => {
      if(s.name === name) {
          if(s.highlightRow) { 
              for(let i=0; i<displayCols; i++) highlightedIndices.add(i);
          } else {
             highlightedIndices.add(s.col);
          }
      }
  });

  for (let c = 0; c < displayCols; c++) {
    const isTarget = highlight.target?.name === name && highlight.target.col === c;
    const isSource = highlightedIndices.has(c);
    gridElements.push(
        <SymbolicElement 
            key={`elem-${c}`} 
            base={symbol.base} 
            subscript={symbol.subscript} 
            col={c} 
            isTarget={isTarget} 
            isSource={isSource} 
        />
    );
  }

  let mathSymbol = symbol.base;

  // [FIX] Combine symbol's own subscript with dimension subscript to prevent KaTeX errors.
  const subscriptParts = [];
  if (symbol.subscript) {
    subscriptParts.push(symbol.subscript);
  }
  subscriptParts.push(`1 \\times ${displayCols}`);
  mathSymbol += `_{${subscriptParts.join(',')}}`;


  return (
    <div className="symbolic-matrix-container">
      <div className="matrix-label"><InlineMath>{`${mathSymbol}`}</InlineMath></div>
      <div className="symbolic-matrix-grid" style={{ gridTemplateColumns: `repeat(${gridElements.length}, auto)` }}>
        {gridElements}
      </div>
    </div>
  );
});
// END OF FILE: src/components/SymbolicVector.tsx