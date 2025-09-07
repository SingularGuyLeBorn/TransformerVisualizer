// FILE: src/components/visualizers/ElementWiseOpVisualizer.tsx
import React, { useState, useRef } from 'react';
import { Matrix } from './types';
import { formatNumber, getCurvePath } from './utils';

interface ElementWiseOpVisualizerProps {
  matrixA: Matrix;
  matrixB: Matrix;
  operation: '+' | '-' | '×' | '÷';
}

export const ElementWiseOpVisualizer: React.FC<ElementWiseOpVisualizerProps> = ({ matrixA, matrixB, operation }) => {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsARef = useRef<(HTMLDivElement | null)[][]>([]);
  const elementsBRef = useRef<(HTMLDivElement | null)[][]>([]);
  const elementsCRef = useRef<(HTMLDivElement | null)[][]>([]);

  const resultMatrix = matrixA.map((row, r) =>
    row.map((val, c) => {
      switch (operation) {
        case '+': return val + matrixB[r][c];
        case '-': return val - matrixB[r][c];
        case '×': return val * matrixB[r][c];
        case '÷': return val / matrixB[r][c];
        default: return NaN;
      }
    })
  );

  const numRows = matrixA.length;
  const numCols = matrixA[0].length;

  // Initialize refs arrays
  elementsARef.current = Array(numRows).fill(null).map(() => Array(numCols).fill(null));
  elementsBRef.current = Array(numRows).fill(null).map(() => Array(numCols).fill(null));
  elementsCRef.current = Array(numRows).fill(null).map(() => Array(numCols).fill(null));

  // Inline Styles
  const styles: { [key: string]: React.CSSProperties } = {
    container: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '25px', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6', flexWrap: 'wrap' },
    matrixContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
    matrixLabel: { fontSize: '1.2em', fontWeight: 'bold', fontFamily: 'monospace' },
    grid: { display: 'grid', gap: '5px', gridTemplateColumns: `repeat(${numCols}, 1fr)` },
    element: { width: '50px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #ced4da', borderRadius: '4px', backgroundColor: '#fff', transition: 'all 0.3s ease' },
    sourceHighlight: { transform: 'scale(1.1)', borderColor: '#007bff', backgroundColor: 'rgba(0, 123, 255, 0.1)' },
    targetHighlight: { transform: 'scale(1.1)', borderColor: '#28a745', backgroundColor: 'rgba(40, 167, 69, 0.1)' },
    opSymbol: { fontSize: '2em', fontWeight: 'bold' },
    svg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' },
    path: { fill: 'none', strokeWidth: '2px', stroke: '#e63946', transition: 'opacity 0.2s ease', opacity: 0 },
    pathVisible: { opacity: 1 },
  };

  const pathA = hoveredCell ? getCurvePath(elementsARef.current[hoveredCell.row][hoveredCell.col], elementsCRef.current[hoveredCell.row][hoveredCell.col], containerRef.current) : '';
  const pathB = hoveredCell ? getCurvePath(elementsBRef.current[hoveredCell.row][hoveredCell.col], elementsCRef.current[hoveredCell.row][hoveredCell.col], containerRef.current) : '';

  const renderMatrix = (matrix: Matrix, label: string, refArray: React.MutableRefObject<(HTMLDivElement | null)[][]>, highlightType: 'source' | 'target') => (
    <div style={styles.matrixContainer}>
      <div style={styles.matrixLabel}>{label}</div>
      <div style={styles.grid}>
        {matrix.map((row, r) => row.map((val, c) => (
          <div
            key={`${label}-${r}-${c}`}
            ref={el => refArray.current[r][c] = el}
            style={{ ...styles.element, ...(hoveredCell && hoveredCell.row === r && hoveredCell.col === c ? (highlightType === 'source' ? styles.sourceHighlight : styles.targetHighlight) : {}) }}
            onMouseEnter={() => setHoveredCell({ row: r, col: c })}
            onMouseLeave={() => setHoveredCell(null)}
          >
            {formatNumber(val, 2)}
          </div>
        )))}
      </div>
    </div>
  );

  return (
    <div style={styles.container} ref={containerRef}>
      <svg style={styles.svg}>
        <path d={pathA} style={{ ...styles.path, ...(hoveredCell ? styles.pathVisible : {}) }} />
        <path d={pathB} style={{ ...styles.path, ...(hoveredCell ? styles.pathVisible : {}) }} />
      </svg>
      {renderMatrix(matrixA, 'A', elementsARef, 'source')}
      <div style={styles.opSymbol}>{operation}</div>
      {renderMatrix(matrixB, 'B', elementsBRef, 'source')}
      <div style={styles.opSymbol}>=</div>
      {renderMatrix(resultMatrix, 'C', elementsCRef, 'target')}
    </div>
  );
};

// END OF FILE: src/components/visualizers/ElementWiseOpVisualizer.tsx