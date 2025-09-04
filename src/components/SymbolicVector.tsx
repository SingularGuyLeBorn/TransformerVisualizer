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
      const subscriptContent = [symbol.subscript, c_idx].filter(s => s !== undefined).join(',');

      let elementString = `${elementBase}_{${subscriptContent}}`;

      const isTarget = highlight.target?.name === name && highlight.target.col === c_idx;

      if (isTarget) return `{\\color{#e63946}${elementString}}`;
      return elementString;
  }

  let vectorElements: string[] = [];
  for (let c = 0; c < displayCols; c++) {
      vectorElements.push(getElement(c));
  }

  const vectorString = vectorElements.join(' & ');
  const pmatrix = `\\begin{pmatrix} ${vectorString} \\end{pmatrix}`;

  let baseNameForFormula = symbol.base;
  if (symbol.subscript) baseNameForFormula += `_{${symbol.subscript}}`;

  const finalFormula = `${baseNameForFormula} = ${pmatrix}`;

  const isSourceComponent = highlight.sources.some(s => s.name === name);
  const isTargetComponent = highlight.target?.name === name;
  const wrapperClass = `symbolic-matrix-wrapper ${isTargetComponent ? 'target' : ''} ${isSourceComponent ? 'source' : ''}`;

  return (
    <div className={wrapperClass}>
        <BlockMath math={finalFormula} />
    </div>
    );
};
// END OF FILE: src/components/SymbolicVector.tsx