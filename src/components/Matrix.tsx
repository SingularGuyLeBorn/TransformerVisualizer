// FILE: src/components/Matrix.tsx
import React from 'react';
import { Element } from './Element';
import { Matrix as MatrixType, HighlightState, ElementIdentifier } from '../types';
import { InlineMath } from 'react-katex';
import { getSymbolParts } from '../config/symbolMapping';

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

  const rows = isTransposed ? data[0].length : data.length;
  const cols = isTransposed ? data.length : data[0].length;

  const gridTemplateColumns = `repeat(${cols}, auto)`;

  const vectorHighlights = highlight.sources
    .filter(s => s.name === name && (s.highlightRow || s.highlightCol))
    .map((s, i) => {
       const elementWidth = 45;
       const elementHeight = 25;
       const gap = 3;
       let style: React.CSSProperties = {};

       const highlightDataRow = s.highlightRow ?? false;
       const highlightDataCol = s.highlightCol ?? false;

       if (isTransposed) {
           if (highlightDataRow) {
               style.width = `${elementWidth}px`;
               style.height = `calc(${rows} * (${elementHeight}px + ${gap}px) - ${gap}px)`;
               style.top = `5px`;
               style.left = `${s.row * (elementWidth + gap) + 5}px`;
           } else if (highlightDataCol) {
               style.width = `calc(${cols} * (${elementWidth}px + ${gap}px) - ${gap}px)`;
               style.height = `${elementHeight}px`;
               style.top = `${s.col * (elementHeight + gap) + 5}px`;
               style.left = `5px`;
           }
       } else {
           if (highlightDataRow) {
               style.width = `calc(${cols} * (${elementWidth}px + ${gap}px) - ${gap}px)`;
               style.height = `${elementHeight}px`;
               style.top = `${s.row * (elementHeight + gap) + 5}px`;
               style.left = `5px`;
           } else if (highlightDataCol) {
               style.width = `${elementWidth}px`;
               style.height = `calc(${rows} * (${elementHeight}px + ${gap}px) - ${gap}px)`;
               style.top = `5px`;
               style.left = `${s.col * (elementWidth + gap) + 5}px`;
           }
       }
       return <div key={`${s.name}-${s.row}-${s.col}-${i}`} className="vector-highlight-overlay" style={style} />;
    });

  const getLabelText = (fullName: string): string => {
      const parts = fullName.split('.');
      const lastPart = parts[parts.length - 1];
      const simpleNames = ['Q', 'K', 'V', 'Scores', 'ScaledScores', 'AttentionWeights', 'HeadOutput', 'Wq', 'Wk', 'Wv', 'Wo', 'W1', 'W2', 'b1', 'b2'];
      if (simpleNames.includes(lastPart)) {
          return lastPart;
      }
      return `\\text{${lastPart.replace(/_/g, '\\_')}}`;
  }

  const labelText = getLabelText(name);

  const symbolParts = getSymbolParts(name);
  let mathSymbol = symbolParts.base;
  if(symbolParts.superscript) mathSymbol = `${mathSymbol}^{${symbolParts.superscript}}`;
  if(symbolParts.subscript) mathSymbol = `${mathSymbol}_{${symbolParts.subscript}}`;

  let symbolTag = null;
  if (mathSymbol && name !== 'inputEmbeddings' && name !== 'posEncodings') {
      symbolTag = (
        <div className="matrix-symbol-tag">
            <InlineMath math={mathSymbol} />
        </div>
      );
  }

  return (
    <div className="matrix-wrapper">
      <div className="matrix-container">
        {vectorHighlights}
        <div className="matrix-grid" style={{ gridTemplateColumns }}>
          {Array.from({ length: rows }).map((_, r) => (
            <React.Fragment key={`row-${r}`}>
            {Array.from({ length: cols }).map((_, c) => {
              const originalRow = isTransposed ? c : r;
              const originalCol = isTransposed ? r : c;
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
              );
            })}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="matrix-label-container">
        <div className="matrix-label"><InlineMath>{`${labelText}${isTransposed ? '^T' : ''}`}</InlineMath></div>
        {symbolTag}
      </div>
    </div>
  );
};
// END OF FILE: src/components/Matrix.tsx