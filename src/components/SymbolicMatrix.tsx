// FILE: src/components/SymbolicMatrix.tsx
import React from 'react';
import { HighlightState } from '../types';
import { BlockMath } from 'react-katex';

interface SymbolicMatrixProps {
  name: string; // The full unique name or a conceptual name if from Explanation
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

      // Extract the conceptual part of the name for symbolic display
      const rawMatrixName = name.split('.').pop() || '';
      const nameParts = rawMatrixName.match(/^([a-zA-Z_]+)(\d*)$/);
      const nameSubscript = (nameParts && nameParts[2]) ? `,${nameParts[2]}` : '';

      let elementString = `${prefix}_{${originalRow},${originalCol}${nameSubscript}}`;

      // --- Highlighting Logic for Explanation components ---
      let isTarget = false;
      let isSource = false;

      const thisSymbolicConceptualName = name.split('.').pop();

      // 判断是否是目标元素 (Target)
      if (highlight.target) {
          const targetConceptualName = highlight.target.name.split('.').pop();
          if (targetConceptualName === thisSymbolicConceptualName &&
              highlight.target.row === originalRow && highlight.target.col === originalCol) {
              isTarget = true;
          }
      }

      // 判断是否是源元素 (Source) - [核心修复]
      if (highlight.sources.some(s => {
          const sourceConceptualName = s.name.split('.').pop();
          if (sourceConceptualName !== thisSymbolicConceptualName) {
              return false; // 如果概念名称不匹配，则肯定不是这个源
          }

          // 根据高亮类型进行判断
          if (s.highlightRow && !s.highlightCol) { // 只高亮行
              return s.row === originalRow;
          } else if (s.highlightCol && !s.highlightRow) { // 只高亮列
              return s.col === originalCol;
          } else { // 默认情况：高亮单个元素
              return s.row === originalRow && s.col === originalCol;
          }
      })) {
          isSource = true;
      }
      // --- End Highlighting Logic ---

      if (isTarget) {
        elementString = `\\textcolor{#e63946}{${elementString}}`;
      } else if (isSource) {
        elementString = `\\textcolor{#1d3557}{${elementString}}`;
      }
      return elementString;
  }

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

  // The displayed name for the formula itself (e.g., Q_{...})
  const rawNameForFormula = name.split('.').pop() || name; // Use the last part for display name
  const namePartsForFormula = rawNameForFormula.match(/^([a-zA-Z_]+)(\d*)$/);
  let baseNameForFormula;
  let nameSubscriptForFormula;

  if (namePartsForFormula && namePartsForFormula[2]) {
      baseNameForFormula = namePartsForFormula[1];
      nameSubscriptForFormula = namePartsForFormula[2];
  } else {
      baseNameForFormula = rawNameForFormula.replace(/_/g, '\\_');
      nameSubscriptForFormula = null;
  }

  const dimsSubscript = `${displayRows}\\times${displayCols}`;
  const finalSubscript = nameSubscriptForFormula ? `${nameSubscriptForFormula},${dimsSubscript}` : dimsSubscript;

  const finalFormula = `${baseNameForFormula}_{${finalSubscript}}${transpose ? '^T' : ''} = ${bmatrix}`;

  return <BlockMath math={finalFormula} />;
};
// END OF FILE: src/components/SymbolicMatrix.tsx