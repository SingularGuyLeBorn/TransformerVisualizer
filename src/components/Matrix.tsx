/* START OF FILE: src/components/Matrix.tsx */
// FILE: src/components/Matrix.tsx
import React from 'react';
import { Element } from './Element';
import { Matrix as MatrixType, HighlightState, ElementIdentifier } from '../types';
import { InlineMath } from 'react-katex';

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

       // The source `s` refers to the original data matrix.
       // `isTransposed` refers to how this component is displaying the data.
       // `rows` and `cols` are the *visual* dimensions of this component.
       const highlightDataRow = s.highlightRow ?? false;
       const highlightDataCol = s.highlightCol ?? false;

       // FIX: This logic correctly renders highlights on transposed matrices
       // by swapping row/column highlighting logic as needed.
       if (isTransposed) {
           // A data row is a visual column. A data col is a visual row.
           if (highlightDataRow) { // Highlight a visual column
               style.width = `${elementWidth}px`;
               style.height = `calc(${rows} * (${elementHeight}px + ${gap}px) - ${gap}px)`;
               style.top = `5px`;
               style.left = `${s.row * (elementWidth + gap) + 5}px`; // The data row index is the visual column index.
           } else if (highlightDataCol) { // Highlight a visual row
               style.width = `calc(${cols} * (${elementWidth}px + ${gap}px) - ${gap}px)`;
               style.height = `${elementHeight}px`;
               style.top = `${s.col * (elementHeight + gap) + 5}px`; // The data col index is the visual row index.
               style.left = `5px`;
           }
       } else {
           // Standard display
           if (highlightDataRow) { // Highlight a visual row
               style.width = `calc(${cols} * (${elementWidth}px + ${gap}px) - ${gap}px)`;
               style.height = `${elementHeight}px`;
               style.top = `${s.row * (elementHeight + gap) + 5}px`;
               style.left = `5px`;
           } else if (highlightDataCol) { // Highlight a visual column
               style.width = `${elementWidth}px`;
               style.height = `calc(${rows} * (${elementHeight}px + ${gap}px) - ${gap}px)`;
               style.top = `5px`;
               style.left = `${s.col * (elementWidth + gap) + 5}px`;
           }
       }
       return <div key={`${s.name}-${s.row}-${s.col}-${i}`} className="vector-highlight-overlay" style={style} />;
    });


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
      <div className="matrix-label"><InlineMath>{`${name.split('.').pop()}${isTransposed ? '^T' : ''}`}</InlineMath></div>
    </div>
  );
};
// END OF FILE: src/components/Matrix.tsx
/* END OF FILE: src/components/Matrix.tsx */