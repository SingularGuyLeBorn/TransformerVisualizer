// FILE: src/topics/transformer-explorer/components/InteractiveSymbolicMatrix.tsx
import React from 'react';
import { HighlightState, ElementIdentifier } from '../types';
import { InlineMath } from 'react-katex';
import { getSymbolParts } from '../lib/symbolMapping';
import { InteractiveSymbolicElement } from './InteractiveSymbolicElement';
import { getVisibleIndices, ELLIPSIS } from '../utils/matrixView';

interface InteractiveSymbolicMatrixProps {
  name: string;
  rows: number;
  cols: number;
  highlight: HighlightState;
  transpose?: boolean;
  truncate?: boolean;
  onSymbolClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
  sideLabel?: boolean; // For explicit override
}

export const InteractiveSymbolicMatrix: React.FC<InteractiveSymbolicMatrixProps> = React.memo(({ name, rows, cols, highlight, transpose = false, truncate = true, onSymbolClick, sideLabel = false }) => {
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

  const visibleRowIndices = truncate ? getVisibleIndices(displayRows, transpose ? focusCol : focusRow) : Array.from({ length: displayRows }, (_, i) => i);
  const visibleColIndices = truncate ? getVisibleIndices(displayCols, transpose ? focusRow : focusCol) : Array.from({ length: displayCols }, (_, i) => i);

  const isTargetMatrix = !!highlightedTarget;

  const gridStyle: React.CSSProperties = {
      gridTemplateColumns: isTargetMatrix
          ? `auto repeat(${visibleColIndices.length}, auto)`
          : `repeat(${visibleColIndices.length}, auto)`,
  };


  let mathSymbol = symbol.base;
  if (symbol.superscript) mathSymbol += `^{${symbol.superscript}}`;
  if (transpose) mathSymbol += '^T';

  const subscriptParts = [];
  if (symbol.subscript) {
    subscriptParts.push(symbol.subscript);
  }
  subscriptParts.push(`${rows} \\times ${cols}`);
  mathSymbol += `_{${subscriptParts.join(',')}}`;

  const matrixGrid = (
      <div className="symbolic-matrix-grid" style={gridStyle}>
        {isTargetMatrix && <div key="corner" />}
        {isTargetMatrix && visibleColIndices.map((c, cIdx) => (
            <div key={`ch-${cIdx}`} className="symbolic-header-item">{c}</div>
        ))}
        {visibleRowIndices.map((r, rIdx) => (
            <React.Fragment key={`row-frag-${rIdx}`}>
                {isTargetMatrix && <div className="symbolic-header-item">{r}</div>}
                {visibleColIndices.map((c, cIdx) => {
                     if (r === ELLIPSIS) return <div key={`ellipsis-r-${rIdx}-c-${cIdx}`} className="symbolic-ellipsis">{c === ELLIPSIS ? '⋱' : '…'}</div>;
                     if (c === ELLIPSIS) return <div key={`ellipsis-r-${rIdx}-c-${cIdx}`} className="symbolic-ellipsis">…</div>;
                    const originalRow = transpose ? c : r;
                    const originalCol = transpose ? r : c;
                    return (
                        <InteractiveSymbolicElement
                            key={`elem-r${r}-c${c}`}
                            name={name}
                            base={symbol.base}
                            subscript={symbol.subscript}
                            row={originalRow}
                            col={originalCol}
                            highlight={highlight}
                            onClick={(event) => onSymbolClick({ name, row: originalRow, col: originalCol }, event)}
                        />
                    );
                })}
            </React.Fragment>
        ))}
      </div>
  );

  return (
    <div className={`matrix-wrapper ${sideLabel ? 'side-label' : ''}`}>
        <div className="matrix-label-side"><InlineMath>{`${mathSymbol}`}</InlineMath></div>
        <div className="symbolic-matrix-container">
            {matrixGrid}
        </div>
        <div className="matrix-label"><InlineMath>{`${mathSymbol}`}</InlineMath></div>
    </div>
  );
});
// END OF FILE: src/topics/transformer-explorer/components/InteractiveSymbolicMatrix.tsx