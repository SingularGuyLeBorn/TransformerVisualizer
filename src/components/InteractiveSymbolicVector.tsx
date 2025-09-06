// FILE: src/components/InteractiveSymbolicVector.tsx
import React from 'react';
import { HighlightState, ElementIdentifier } from '../types';
import { InlineMath } from 'react-katex';
import { Vector as VectorType } from '../types';
import { getSymbolParts } from '../config/symbolMapping';
import { InteractiveSymbolicElement } from './InteractiveSymbolicElement';
import { getVisibleIndices, ELLIPSIS } from '../utils/matrixView';

interface InteractiveSymbolicVectorProps {
  name: string;
  data: VectorType;
  highlight: HighlightState;
  onSymbolClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
}

export const InteractiveSymbolicVector: React.FC<InteractiveSymbolicVectorProps> = React.memo(({ name, data, highlight, onSymbolClick }) => {
  const displayCols = data.length;
  const symbol = getSymbolParts(name);

  let focusCol = -1;
  if (highlight.target?.name === name) {
    focusCol = highlight.target.col;
  }

  const visibleColIndices = getVisibleIndices(displayCols, focusCol);

  const gridElements = visibleColIndices.map((c, cIdx) => {
    if (c === ELLIPSIS) {
        return <div key={`ellipsis-c-${cIdx}`} className="symbolic-ellipsis">…</div>;
    }

    return (
        <InteractiveSymbolicElement
            key={`elem-${c}`}
            name={name}
            base={symbol.base}
            subscript={symbol.subscript}
            col={c}
            highlight={highlight}
            onClick={(event) => onSymbolClick({ name, row: 0, col: c }, event)}
        />
    );
  });

  let mathSymbol = symbol.base;

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
// END OF FILE: src/components/InteractiveSymbolicVector.tsx