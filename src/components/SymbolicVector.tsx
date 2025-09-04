// FILE: src/components/SymbolicVector.tsx
import React from 'react';
import { HighlightState } from '../types';
import { BlockMath } from 'react-katex';
import { Vector } from '../types';
import { getSymbolParts } from '../config/symbolMapping';

interface SymbolicVectorProps {
  name: string;
  data: Vector;
  highlight: HighlightState;
}

export const SymbolicVector: React.FC<SymbolicVectorProps> = ({ name, data, highlight }) => {
  const displayCols = data.length;
  const symbol = getSymbolParts(name);

  const getElement = (c_idx: number): string => {
      const elementBase = symbol.base.toLowerCase();
      const subscriptContent = [symbol.subscript, c_idx].filter(s => s !== undefined && s !== null).join(',');

      let elementString = `${elementBase}_{${subscriptContent}}`;

      const isTarget = highlight.target?.name === name && highlight.target.col === c_idx;
      const isSource = highlight.sources.some(s => s.name === name);

      if (isTarget) return `{\\color{#e63946}${elementString}}`;
      if (isSource) return `{\\color{#1d3557}${elementString}}`;
      return elementString;
  }

  let vectorElements: string[] = [];
  // Abbreviate long vectors similar to matrices
  const MAX_DIM = 10;
  const EDGE_COUNT = 4;
  if(displayCols > MAX_DIM) {
      for (let c = 0; c < EDGE_COUNT; c++) {
          vectorElements.push(getElement(c));
      }
      vectorElements.push('\\dots');
      for (let c = displayCols - EDGE_COUNT; c < displayCols; c++) {
          vectorElements.push(getElement(c));
      }
  } else {
      for (let c = 0; c < displayCols; c++) {
          vectorElements.push(getElement(c));
      }
  }


  const vectorString = vectorElements.join(' & ');
  const pmatrix = `\\begin{pmatrix} ${vectorString} \\end{pmatrix}`;

  // Logic to correctly combine subscripts for the main vector label
  let baseNameForFormula = symbol.base;
  if (symbol.superscript) baseNameForFormula += `^{${symbol.superscript}}`;
  
  const existingSubscriptMatch = baseNameForFormula.match(/_{([^}]*)}/);
  let finalSubscriptContent = [symbol.subscript, `1 \\times ${displayCols}`].filter(Boolean).join(',');

  if (existingSubscriptMatch) {
      const baseWithoutSub = baseNameForFormula.replace(existingSubscriptMatch[0], '');
      const combinedSub = [existingSubscriptMatch[1], `1 \\times ${displayCols}`].filter(Boolean).join(',');
      baseNameForFormula = `${baseWithoutSub}_{${combinedSub}}`;
  } else {
      baseNameForFormula += `_{${finalSubscriptContent}}`;
  }
  
  const isSourceComponent = highlight.sources.some(s => s.name === name);
  const isTargetComponent = highlight.target?.name === name;

  let labelPart = baseNameForFormula;
  if(isTargetComponent) {
      // Use KaTeX-supported \colorbox{color}{content}
      labelPart = `{\\colorbox{#fde8e9}{\\color{black}$\\displaystyle ${baseNameForFormula}$}}`;
  } else if (isSourceComponent) {
      labelPart = `{\\colorbox{#e8f0f8}{\\color{black}$\\displaystyle ${baseNameForFormula}$}}`;
  }

  const finalFormula = `${labelPart} = ${pmatrix}`;
  const wrapperClass = `symbolic-matrix-wrapper ${isTargetComponent ? 'target' : ''} ${isSourceComponent ? 'source' : ''}`;

  return (
    <div className={wrapperClass}>
        <BlockMath math={finalFormula} />
    </div>
    );
};
// END OF FILE: src/components/SymbolicVector.tsx