// FILE: src/topics/attention-variants/components/InteractiveSymbolicMatrix.tsx
import React from 'react';
import { HighlightState, ElementIdentifier } from '../types';
import { InlineMath } from 'react-katex';
import { InteractiveSymbolicElement } from './InteractiveSymbolicElement';
import { getVisibleIndices, ELLIPSIS } from '../utils/matrixView';
import { getSymbolParts } from '../lib/symbolMapping';

interface InteractiveSymbolicMatrixProps {
  name: string;
  rows: number;
  cols: number;
  highlight: HighlightState;
  onSymbolClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
  transpose?: boolean;
  isPlaceholder?: boolean;
}

export const InteractiveSymbolicMatrix: React.FC<InteractiveSymbolicMatrixProps> = React.memo(({ name, rows, cols, highlight, onSymbolClick, transpose = false, isPlaceholder = false }) => {
  const symbol = getSymbolParts(name);
  const variant = name.split('.')[0] as ElementIdentifier['variant'];

  const displayRows = transpose ? cols : rows;
  const displayCols = transpose ? rows : cols;

  let focusRow = -1;
  let focusCol = -1;

  if (highlight.target?.name === name) {
    focusRow = highlight.target.row;
    focusCol = highlight.target.col;
  }

  const isTargetMatrix = !!highlight.target && highlight.target.name === name;
  const isSourceMatrix = highlight.sources.some(s => s.name === name);
  const shouldShowHeaders = isTargetMatrix || isSourceMatrix;

  const visibleRowIndices = getVisibleIndices(displayRows, transpose ? focusCol : focusRow);
  const visibleColIndices = getVisibleIndices(displayCols, transpose ? focusRow : focusCol);

  let mathSymbol = symbol.base;
  if (symbol.superscript) mathSymbol += `^{${symbol.superscript}}`;
  if (transpose) mathSymbol += '^T';

  const subscriptParts = [];
  if (symbol.subscript) subscriptParts.push(symbol.subscript);
  subscriptParts.push(`${rows} \\times ${cols}`);
  mathSymbol += `_{${subscriptParts.join(',')}}`;

  const containerClassName = `symbolic-matrix-container ${isPlaceholder ? 'placeholder-matrix' : ''}`;

  return (
    <div className="matrix-wrapper side-label">
      <div className="matrix-label-side"><InlineMath>{`${mathSymbol}`}</InlineMath></div>
      <div className={containerClassName}>
         <div className="symbolic-matrix-grid" style={{ gridTemplateColumns: shouldShowHeaders ? `auto repeat(${visibleColIndices.length}, auto)` : `repeat(${visibleColIndices.length}, auto)` }}>
          {/* Top-left corner & Column Headers */}
          {shouldShowHeaders && <div key="corner" />}
          {shouldShowHeaders && visibleColIndices.map((c, cIdx) => (
              <div key={`ch-${cIdx}`} className="symbolic-header-item">{c}</div>
          ))}

          {/* Row Headers and Matrix Elements */}
          {visibleRowIndices.map((r, rIdx) => (
              <React.Fragment key={`row-frag-${rIdx}`}>
                   {shouldShowHeaders && <div className="symbolic-header-item">{r}</div>}
                   {visibleColIndices.map((c, cIdx) => {
                      if (r === ELLIPSIS || c === ELLIPSIS) {
                        return <div key={`ellipsis-r${rIdx}-c${cIdx}`} className="symbolic-ellipsis">{r === ELLIPSIS && c === ELLIPSIS ? '⋱' : '…'}</div>;
                      }
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
                          onClick={(event) => onSymbolClick({ variant, name, row: originalRow, col: originalCol }, event)}
                        />
                      );
                  })}
              </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
});

// END OF FILE: src/topics/attention-variants/components/InteractiveSymbolicMatrix.tsx