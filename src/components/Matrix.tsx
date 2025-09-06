// FILE: src/components/Matrix.tsx
import React from 'react';
import { Element } from './Element';
import { Matrix as MatrixType, HighlightState, ElementIdentifier } from '../types';
import { InlineMath } from 'react-katex';
import { getSymbolParts } from '../config/symbolMapping';
import { getVisibleIndices, ELLIPSIS } from '../utils/matrixView';

interface MatrixProps {
  name: string;
  data: MatrixType;
  highlight: HighlightState;
  onElementClick: (element: ElementIdentifier) => void;
  isTransposed?: boolean;
}

export const Matrix: React.FC<MatrixProps> = ({ name, data, highlight, onElementClick, isTransposed = false }) => {
  if (!data || data.length === 0 || data[0].length === 0) {
    return <div>Invalid matrix data for {name}</div>;
  }

  const numRows = data.length;
  const numCols = data[0].length;

  const displayRows = isTransposed ? numCols : numRows;
  const displayCols = isTransposed ? numRows : numCols;

  let focusRow = -1;
  let focusCol = -1;

  if(highlight.target?.name === name && !highlight.target.isInternal) {
    focusRow = highlight.target.row;
    focusCol = highlight.target.col;
  }

  const relevantSource = highlight.sources.find(s => s.name === name && !s.isInternal);
  if (relevantSource) {
      focusRow = relevantSource.row === -1 ? focusRow : relevantSource.row;
      focusCol = relevantSource.col === -1 ? focusCol : relevantSource.col;
  }

  const relevantDestination = highlight.destinations?.find(d => d.name === name && !d.isInternal);
    if (relevantDestination) {
        focusRow = relevantDestination.row === -1 ? focusRow : relevantDestination.row;
        focusCol = relevantDestination.col === -1 ? focusCol : relevantDestination.col;
    }


  const visibleRowIndices = getVisibleIndices(displayRows, isTransposed ? focusCol : focusRow);
  const visibleColIndices = getVisibleIndices(displayCols, isTransposed ? focusRow : focusCol);

  const gridTemplateColumns = `repeat(${visibleColIndices.length}, auto)`;

  const symbolParts = getSymbolParts(name);
  let mathSymbol = symbolParts.base;
  if(symbolParts.superscript) mathSymbol = `${mathSymbol}^{${symbolParts.superscript}}`;
  if(symbolParts.subscript) mathSymbol = `${mathSymbol}_{${symbolParts.subscript}}`;
  if(isTransposed) mathSymbol = `${mathSymbol}^T`;

  const gridElements = visibleRowIndices.map((r, rIdx) => {
    if (r === ELLIPSIS) {
        return visibleColIndices.map((c, cIdx) => (
             <div key={`ellipsis-r-${rIdx}-c-${cIdx}`} className="matrix-ellipsis">{c === ELLIPSIS ? '⋱' : '…'}</div>
        ));
    }
    return visibleColIndices.map((c, cIdx) => {
        if (c === ELLIPSIS) {
            return <div key={`ellipsis-r-${rIdx}-c-${cIdx}`} className="matrix-ellipsis">…</div>;
        }
        const displayRow = r;
        const displayCol = c;
        const originalRow = isTransposed ? displayCol : displayRow;
        const originalCol = isTransposed ? displayRow : displayCol;
        const value = data[originalRow][originalCol];
        return (
             <Element
              key={`${name}-${originalRow}-${originalCol}`}
              name={name}
              row={originalRow}
              col={originalCol}
              value={value}
              highlight={highlight}
              onElementClick={onElementClick}
            />
        )
    });
  });

  const isTargetMatrix = highlight.target?.name === name && !highlight.target.isInternal;

  return (
    <div className="matrix-wrapper">
       {isTargetMatrix && (
        <>
          <div className="matrix-col-headers" style={{'--cols': visibleColIndices.length} as React.CSSProperties}>
              {visibleColIndices.map((c, idx) => (
                  <div key={`ch-${idx}`} className="matrix-header-item">
                      {c}
                  </div>
              ))}
          </div>
          <div className="matrix-row-headers">
              {visibleRowIndices.map((r, idx) => (
                   <div key={`rh-${idx}`} className="matrix-header-item">
                      {r}
                  </div>
              ))}
          </div>
        </>
      )}
      <div className="matrix-container">
        <div className="matrix-grid" style={{ gridTemplateColumns }}>
          {gridElements}
        </div>
      </div>
      <div className="matrix-label-container">
        <div className="matrix-symbol-tag"><InlineMath>{mathSymbol}</InlineMath></div>
      </div>
    </div>
  );
};
// END OF FILE: src/components/Matrix.tsx