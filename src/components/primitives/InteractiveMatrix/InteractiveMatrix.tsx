// FILE: src/components/primitives/InteractiveMatrix/InteractiveMatrix.tsx
import React from 'react';
import { InteractiveElement } from '../InteractiveElement/InteractiveElement';
import { Matrix as MatrixType, HighlightState, ElementIdentifier } from '../types';
import { getVisibleIndices, ELLIPSIS } from '../utils';
import { InlineMath } from 'react-katex';
import './InteractiveMatrix.css';

interface InteractiveMatrixProps {
  name: string;
  data: MatrixType;
  highlight: HighlightState;
  onElementClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
  isTransposed?: boolean;
  symbol?: string; // e.g., "Q", "W_0", etc.
}

export const InteractiveMatrix: React.FC<InteractiveMatrixProps> = ({
  name,
  data,
  highlight,
  onElementClick,
  isTransposed = false,
  symbol,
}) => {
  if (!data || data.length === 0 || data[0].length === 0) {
    return <div>Invalid matrix data for {name}</div>;
  }

  const numRows = data.length;
  const numCols = data[0].length;
  const displayRows = isTransposed ? numCols : numRows;
  const displayCols = isTransposed ? numRows : numCols;

  let focusRow = -1, focusCol = -1;
  const isTargetMatrix = highlight.target?.name === name;
  const isSourceMatrix = highlight.sources.some(s => s.name === name);

  if (isTargetMatrix) {
    focusRow = highlight.target!.row;
    focusCol = highlight.target!.col;
  } else if (isSourceMatrix) {
    const source = highlight.sources.find(s => s.name === name)!;
    focusRow = source.row;
    focusCol = source.col;
  }

  const visibleRowIndices = getVisibleIndices(displayRows, isTransposed ? focusCol : focusRow);
  const visibleColIndices = getVisibleIndices(displayCols, isTransposed ? focusRow : focusCol);

  const showHeaders = isTargetMatrix || isSourceMatrix;

  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: showHeaders
      ? `auto repeat(${visibleColIndices.length}, 1fr)`
      : `repeat(${visibleColIndices.length}, 1fr)`,
  };

  const mathSymbol = symbol ? `${symbol}${isTransposed ? '^T' : ''}` : name;
  const mathDims = `_{${numRows} \\times ${numCols}}`;

  return (
    <div className="interactive-matrix-wrapper" data-name={name}>
      <div className="interactive-matrix-container">
        <div className="interactive-matrix-grid" style={gridStyle}>
          {showHeaders && <div className="matrix-header-item corner" />}
          {showHeaders && visibleColIndices.map((c, idx) => (
            <div key={`col-header-${idx}`} className="matrix-header-item">{c}</div>
          ))}

          {visibleRowIndices.map((r, rIdx) => (
            <React.Fragment key={`row-frag-${rIdx}`}>
              {showHeaders && <div className="matrix-header-item">{r}</div>}
              {visibleColIndices.map((c, cIdx) => {
                if (r === ELLIPSIS || c === ELLIPSIS) {
                  return <div key={`ellipsis-${rIdx}-${cIdx}`} className="matrix-ellipsis">{r === ELLIPSIS && c === ELLIPSIS ? '⋱' : '…'}</div>;
                }
                const originalRow = isTransposed ? c : r;
                const originalCol = isTransposed ? r : c;
                return (
                  <InteractiveElement
                    key={`elem-${originalRow}-${originalCol}`}
                    identifier={{ name, row: originalRow, col: originalCol }}
                    value={data[originalRow][originalCol]}
                    highlight={highlight}
                    onElementClick={onElementClick}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="matrix-label-container">
        <span className="matrix-symbol"><InlineMath>{mathSymbol}</InlineMath></span>
        <span className="matrix-dims"><InlineMath>{mathDims}</InlineMath></span>
      </div>
    </div>
  );
};
// END OF FILE: src/components/primitives/InteractiveMatrix/InteractiveMatrix.tsx