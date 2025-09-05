// FILE: src/components/InteractiveSymbolicMatrix.tsx
import React from 'react';
import { HighlightState, ElementIdentifier } from '../types';
import { InlineMath } from 'react-katex';
import { getSymbolParts } from '../config/symbolMapping';
import { InteractiveSymbolicElement } from './InteractiveSymbolicElement';
import { getVisibleIndices, ELLIPSIS } from '../utils/matrixView';

interface InteractiveSymbolicMatrixProps {
  name: string;
  rows: number;
  cols: number;
  highlight: HighlightState;
  transpose?: boolean;
  onSymbolClick: (element: ElementIdentifier) => void;
}

export const InteractiveSymbolicMatrix: React.FC<InteractiveSymbolicMatrixProps> = React.memo(({ name, rows, cols, highlight, transpose = false, onSymbolClick }) => {
  const displayRows = transpose ? cols : rows;
  const displayCols = transpose ? rows : cols;
  const symbol = getSymbolParts(name);

  let focusRow = -1;
  let focusCol = -1;

  if (highlight.target?.name === name) {
    focusRow = highlight.target.row;
    focusCol = highlight.target.col;
  }

  const highlightedTarget = (highlight.target?.name === name) ? highlight.target : null;
  const highlightedSources = highlight.sources.filter(s => s.name === name);
  const highlightedDestinations = highlight.destinations?.filter(d => d.name === name) || [];

  const visibleRowIndices = getVisibleIndices(displayRows, transpose ? focusCol : focusRow);
  const visibleColIndices = getVisibleIndices(displayCols, transpose ? focusRow : focusCol);


  const gridElements = visibleRowIndices.map((r, rIdx) => {
    if (r === ELLIPSIS) {
        return visibleColIndices.map((c, cIdx) => (
             <div key={`ellipsis-r-${rIdx}-c-${cIdx}`} className="symbolic-ellipsis">{c === ELLIPSIS ? '⋱' : '…'}</div>
        ));
    }
    return visibleColIndices.map((c, cIdx) => {
        if (c === ELLIPSIS) {
            return <div key={`ellipsis-r-${rIdx}-c-${cIdx}`} className="symbolic-ellipsis">…</div>;
        }

        const originalRow = transpose ? c : r;
        const originalCol = transpose ? r : c;

        const isTarget = !!highlightedTarget && highlightedTarget.row === originalRow && highlightedTarget.col === originalCol;

        const isSource = highlightedSources.some(s => {
          if (s.highlightRow) return s.row === originalRow;
          if (s.highlightCol) return s.col === originalCol;
          return s.row === originalRow && s.col === originalCol;
        });

        const isDestination = highlightedDestinations.some(d => {
            if (d.highlightRow) return d.row === originalRow;
            if (d.highlightCol) return d.col === originalCol;
            return d.row === originalRow && d.col === originalCol;
        });

        return (
            <InteractiveSymbolicElement
                key={`elem-r${r}-c${c}`}
                base={symbol.base}
                subscript={symbol.subscript}
                row={originalRow}
                col={originalCol}
                isTarget={isTarget}
                isSource={isSource}
                isDestination={isDestination}
                onClick={() => onSymbolClick({ name, row: originalRow, col: originalCol })}
            />
        );
    });
  });

  let mathSymbol = symbol.base;
  if (symbol.superscript) mathSymbol += `^{${symbol.superscript}}`;
  if (transpose) mathSymbol += '^T';

  const subscriptParts = [];
  if (symbol.subscript) {
    subscriptParts.push(symbol.subscript);
  }
  subscriptParts.push(`${rows} \\times ${cols}`);
  mathSymbol += `_{${subscriptParts.join(',')}}`;

  return (
    <div className="symbolic-matrix-container">
      <div className="matrix-label"><InlineMath>{`${mathSymbol}`}</InlineMath></div>
      <div className="symbolic-matrix-grid" style={{ gridTemplateColumns: `repeat(${visibleColIndices.length}, auto)` }}>
        {gridElements}
      </div>
    </div>
  );
});
// END OF FILE: src/components/InteractiveSymbolicMatrix.tsx