// FILE: src/topics/transformer-explorer/components/Matrix.tsx
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
  onElementClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
  isTransposed?: boolean;
  sideLabel?: boolean; // For explicit override
}

export const Matrix: React.FC<MatrixProps> = ({ name, data, highlight, onElementClick, isTransposed = false, sideLabel = false }) => {

  const maxProbCols = React.useMemo(() => {
    const maxCols: { [key: number]: number } = {};
    if (!data) return maxCols;

    const probSources = highlight.sources.filter(s => s.name === name && s.highlightProbCol);
    for (const source of probSources) {
        if (source.row !== -1 && data[source.row]) {
            const rowData = data[source.row];
            const maxVal = Math.max(...rowData);
            maxCols[source.row] = rowData.indexOf(maxVal);
        }
    }
    return maxCols;
  }, [highlight.sources, name, data]);

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

  const symbolParts = getSymbolParts(name);
  let mathSymbol = symbolParts.base;
  if(symbolParts.superscript) mathSymbol = `${mathSymbol}^{${symbolParts.superscript}}`;
  if(symbolParts.subscript) mathSymbol = `${mathSymbol}_{${symbolParts.subscript}}`;
  if(isTransposed) mathSymbol = `${mathSymbol}^T`;

  const isTargetMatrix = highlight.target?.name === name && !highlight.target.isInternal;

   const gridContainerStyle: React.CSSProperties = {
      gridTemplateColumns: isTargetMatrix
          ? `auto repeat(${visibleColIndices.length}, auto)`
          : `repeat(${visibleColIndices.length}, auto)`,
  };

  const matrixGrid = (
      <div className="matrix-container">
        <div className="matrix-grid" data-name={name} style={gridContainerStyle}>
            {isTargetMatrix && <div key="corner" />}
            {isTargetMatrix && visibleColIndices.map((c, cIdx) => (
                <div key={`ch-${cIdx}`} className="matrix-header-item">{c}</div>
            ))}
            {visibleRowIndices.map((r, rIdx) => (
                <React.Fragment key={`row-frag-${rIdx}`}>
                    {isTargetMatrix && <div className="matrix-header-item">{r}</div>}
                    {visibleColIndices.map((c, cIdx) => {
                        if (r === ELLIPSIS) return <div key={`ellipsis-r-${rIdx}-c-${cIdx}`} className="matrix-ellipsis">{c === ELLIPSIS ? '⋱' : '…'}</div>;
                        if (c === ELLIPSIS) return <div key={`ellipsis-r-${rIdx}-c-${cIdx}`} className="matrix-ellipsis">…</div>;
                        const originalRow = isTransposed ? c : r;
                        const originalCol = isTransposed ? r : c;
                        return (
                            <Element
                                key={`${name}-${originalRow}-${originalCol}`}
                                name={name}
                                row={originalRow}
                                col={originalCol}
                                value={data[originalRow][originalCol]}
                                highlight={highlight}
                                onElementClick={onElementClick}
                                isProbMax={maxProbCols[originalRow] === originalCol}
                            />
                        );
                    })}
                </React.Fragment>
            ))}
        </div>
      </div>
  );

  return (
    <div className={`matrix-wrapper ${sideLabel ? 'side-label' : ''}`} data-name={name}>
        <div className="matrix-label-side">
            <div className="matrix-symbol-tag"><InlineMath>{mathSymbol}</InlineMath></div>
        </div>
        {matrixGrid}
        <div className="matrix-label-container">
            <div className="matrix-symbol-tag"><InlineMath>{mathSymbol}</InlineMath></div>
        </div>
    </div>
  );
};
// END OF FILE: src/topics/transformer-explorer/components/Matrix.tsx