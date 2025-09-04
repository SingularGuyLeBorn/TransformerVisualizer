// FILE: src/components/SymbolicMatrix.tsx
import React from 'react';
import { HighlightState } from '../types';
import { BlockMath } from 'react-katex';
import { getSymbolParts } from '../config/symbolMapping';

interface SymbolicMatrixProps {
  name: string;
  rows: number;
  cols: number;
  highlight: HighlightState;
  transpose?: boolean;
}

export const SymbolicMatrix: React.FC<SymbolicMatrixProps> = ({ name, rows, cols, highlight, transpose = false }) => {
  const displayRows = transpose ? cols : rows;
  const displayCols = transpose ? rows : cols;

  const symbol = getSymbolParts(name);

  const MAX_DIM = 7;
  const EDGE_COUNT = 2;
  const WINDOW_RADIUS = 2;

  const getVisibleIndices = (total: number, highlightIndices: number[]): number[] => {
    if (total <= MAX_DIM) {
      return Array.from({ length: total }, (_, i) => i);
    }
    const visible = new Set<number>();
    for(let i=0; i < EDGE_COUNT; i++) visible.add(i);
    for(let i=total - EDGE_COUNT; i < total; i++) visible.add(i);
    highlightIndices.forEach(hIdx => {
        if (hIdx === -1) return;
        const start = Math.max(0, hIdx - WINDOW_RADIUS);
        const end = Math.min(total - 1, hIdx + WINDOW_RADIUS);
        for(let i = start; i <= end; i++) visible.add(i);
    });
    return Array.from(visible).sort((a,b) => a - b);
  }

  const thisSymbolicConceptualName = name.split('.').pop();

  const highlightedTarget = (highlight.target?.name.split('.').pop() === thisSymbolicConceptualName) ? highlight.target : null;
  const highlightedSources = highlight.sources.filter(s => s.name.split('.').pop() === thisSymbolicConceptualName);

  const highlightRows = new Set<number>();
  const highlightCols = new Set<number>();
  if(highlightedTarget) {
      highlightRows.add(transpose ? highlightedTarget.col : highlightedTarget.row);
      highlightCols.add(transpose ? highlightedTarget.row : highlightedTarget.col);
  }
  highlightedSources.forEach(s => {
      highlightRows.add(transpose ? s.col : s.row);
      highlightCols.add(transpose ? s.row : s.col);
  });

  const visibleRows = getVisibleIndices(displayRows, Array.from(highlightRows));
  const visibleCols = getVisibleIndices(displayCols, Array.from(highlightCols));

  const getElement = (r_idx: number, c_idx: number): string => {
      const originalRow = transpose ? c_idx : r_idx;
      const originalCol = transpose ? r_idx : c_idx;

      const elementBase = symbol.base.toLowerCase().replace(/'/g, '').replace(/_{.*}/, '');
      const subscriptContent = [symbol.subscript, originalRow, originalCol].filter(s => s !== undefined && s !== null).join(',');

      let elementString = `${elementBase}_{${subscriptContent}}`;

      let isTarget = false;
      if (highlightedTarget && highlightedTarget.row === originalRow && highlightedTarget.col === originalCol) isTarget = true;

      let isSource = false;
      if (highlightedSources.some(s => {
          if (s.highlightRow && !s.highlightCol) return s.row === originalRow;
          if (s.highlightCol && !s.highlightRow) return s.col === originalCol;
          return s.row === originalRow && s.col === originalCol;
      })) isSource = true;

      if (isTarget) return `{\\color{#e63946}${elementString}}`;
      if (isSource) return `{\\color{#1d3557}${elementString}}`;
      return elementString;
  }

  let matrixRowsStr: string[] = [];
  let lastRow = -1;
  visibleRows.forEach(r => {
      if (r > lastRow + 1) {
         const dots = visibleCols.map((c, i) => (i > 0 && visibleCols[i-1] !== c-1) ? '\\ddots' : '\\vdots').join(' & ');
         matrixRowsStr.push(dots);
      }
      let matrixColsStr: string[] = [];
      let lastCol = -1;
      visibleCols.forEach(c => {
          if(c > lastCol + 1) matrixColsStr.push('\\dots');
          matrixColsStr.push(getElement(r,c));
          lastCol = c;
      });
      matrixRowsStr.push(matrixColsStr.join(' & '));
      lastRow = r;
  });

  const matrixString = matrixRowsStr.join(' \\\\ ');
  const bmatrix = `\\begin{pmatrix} ${matrixString} \\end{pmatrix}`;
  
  // Logic to correctly combine subscripts for the main matrix label
  let mathSymbol = symbol.base;
  if (symbol.superscript) mathSymbol += `^{${symbol.superscript}}`;
  if (transpose) mathSymbol += '^T';
  
  const existingSubscriptMatch = mathSymbol.match(/_{([^}]*)}/);
  let finalSubscriptContent = [symbol.subscript, `${displayRows} \\times ${displayCols}`].filter(Boolean).join(',');

  if (existingSubscriptMatch) {
      const baseWithoutSub = mathSymbol.replace(existingSubscriptMatch[0], '');
      const combinedSub = [existingSubscriptMatch[1], `${displayRows} \\times ${displayCols}`].filter(Boolean).join(',');
      mathSymbol = `${baseWithoutSub}_{${combinedSub}}`;
  } else {
      mathSymbol += `_{${finalSubscriptContent}}`;
  }
  
  const isSourceComponent = highlight.sources.some(s => s.name === name);
  const isTargetComponent = highlight.target?.name === name;

  let labelPart = mathSymbol;
  if(isTargetComponent) {
      // Use KaTeX-supported \colorbox{color}{content}
      labelPart = `{\\colorbox{#fde8e9}{\\color{black}$\\displaystyle ${mathSymbol}$}}`;
  } else if (isSourceComponent) {
      labelPart = `{\\colorbox{#e8f0f8}{\\color{black}$\\displaystyle ${mathSymbol}$}}`;
  }

  const finalFormula = `${labelPart} = ${bmatrix}`;
  const wrapperClass = `symbolic-matrix-wrapper ${isTargetComponent ? 'target' : ''} ${isSourceComponent ? 'source' : ''}`;

  return (
    <div className={wrapperClass}>
        <BlockMath math={finalFormula} />
    </div>
  );
};
// END OF FILE: src/components/SymbolicMatrix.tsx