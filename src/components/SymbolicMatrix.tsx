/* START OF FILE: src/components/SymbolicMatrix.tsx */
// FILE: src/components/SymbolicMatrix.tsx
import React from 'react';
import { HighlightState } from '../types';
import { BlockMath } from 'react-katex';

interface SymbolicMatrixProps {
  name: string;
  rows: number;
  cols: number;
  prefix: string;
  highlight: HighlightState;
  transpose?: boolean;
}

export const SymbolicMatrix: React.FC<SymbolicMatrixProps> = ({ name, rows, cols, prefix, highlight, transpose = false }) => {

  const displayRows = transpose ? cols : rows;
  const displayCols = transpose ? rows : cols;

  const getElement = (r_idx: number, c_idx: number): string => {
      const originalRow = transpose ? c_idx : r_idx;
      const originalCol = transpose ? r_idx : c_idx;

      const rawMatrixName = name.split('.').pop() || '';
      const nameParts = rawMatrixName.match(/^([a-zA-Z_]+)(\d*)$/);
      const nameSubscript = (nameParts && nameParts[2]) ? `,${nameParts[2]}` : '';

      let elementString = `${prefix}_{${originalRow},${originalCol}${nameSubscript}}`;

      const isTarget = highlight.target?.name === name && highlight.target?.row === originalRow && highlight.target?.col === originalCol;
      const isSource = highlight.sources.some(s => s.name === name && s.row === originalRow && s.col === originalCol);

      if (isTarget) {
        elementString = `\\textcolor{#e63946}{\\underline{${elementString}}}`;
      } else if (isSource) {
        elementString = `\\textcolor{#1d3557}{\\mathbf{${elementString}}}`;
      }
      return elementString;
  }

  // FIX: Removed all truncation logic to fully expand all matrices.
  let matrixRows: string[] = [];
  for (let r = 0; r < displayRows; r++) {
      let matrixCols: string[] = [];
      for (let c = 0; c < displayCols; c++) {
          matrixCols.push(getElement(r, c));
      }
      matrixRows.push(matrixCols.join(' & '));
  }

  const matrixString = matrixRows.join(' \\\\ ');
  const bmatrix = `\\begin{pmatrix} ${matrixString} \\end{pmatrix}`;

  const rawName = name.split('.').pop() || name;
  const nameParts = rawName.match(/^([a-zA-Z_]+)(\d*)$/);
  let baseName;
  let nameSubscript;

  if (nameParts && nameParts[2]) {
      baseName = nameParts[1];
      nameSubscript = nameParts[2];
  } else {
      baseName = rawName.replace(/_/g, '\\_');
      nameSubscript = null;
  }

  const dimsSubscript = `${displayRows}\\times${displayCols}`;
  const finalSubscript = nameSubscript ? `${nameSubscript},${dimsSubscript}` : dimsSubscript;

  const finalFormula = `${baseName}_{${finalSubscript}}${transpose ? '^T' : ''} = ${bmatrix}`;

  return <BlockMath math={finalFormula} />;
};
// END OF FILE: src/components/SymbolicMatrix.tsx
/* END OF FILE: src/components/SymbolicMatrix.tsx */