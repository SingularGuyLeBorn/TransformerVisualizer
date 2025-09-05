// FILE: src/components/ElementwiseCalculation.tsx
import React from 'react';
import { InlineMath } from 'react-katex';
import { ElementIdentifier, HighlightState } from '../types';
import { getVisibleIndices, ELLIPSIS } from '../utils/matrixView';

interface ElementwiseCalculationProps {
  opType: 'softmax' | 'relu';
  inputRow: number[];
  outputRow: number[];
  highlight: HighlightState;
  onElementClick: (element: ElementIdentifier) => void;
  baseName: string; // e.g., "encoder.0.mha.h0.AttentionWeights"
  rowIndex: number;
}

const formatNumber = (num: number, precision = 2) => num.toFixed(precision);

export const ElementwiseCalculation: React.FC<ElementwiseCalculationProps> = ({
  opType,
  inputRow,
  outputRow,
  highlight,
  onElementClick,
  baseName,
  rowIndex,
}) => {
  const targetCol = highlight.target?.isInternal && highlight.target.row === rowIndex ? highlight.target.col : -1;
  const visibleCols = getVisibleIndices(inputRow.length, targetCol);

  const handleClick = (colIndex: number) => {
    onElementClick({
      name: `${baseName}.internal`, // Special name for internal calculation
      row: rowIndex,
      col: colIndex,
      isInternal: true,
    });
  };

  const isSource = (colIndex: number) => {
      return highlight.sources.some(s => s.isInternal && s.row === rowIndex && s.col === colIndex);
  }
  const isTarget = (colIndex: number) => {
      return highlight.target?.isInternal && highlight.target.row === rowIndex && highlight.target.col === colIndex;
  }


  const renderVisibleElements = (data: (number | string)[], type: 'input' | 'output' | 'exp' | 'sum') => {
    return visibleCols.map((col, i) => {
      if (col === ELLIPSIS) {
        return <div key={`ellipsis-${i}`} className="elementwise-op-element symbolic-ellipsis">...</div>;
      }
      const value = data[col];
      const className = `elementwise-op-element ${isSource(col) ? 'source' : ''} ${isTarget(col) ? 'target' : ''}`;
      return (
        <div key={`${type}-${col}`} className={className} onClick={() => handleClick(col)}>
          {typeof value === 'number' ? formatNumber(value) : value}
        </div>
      );
    });
  };

  const renderSoftmax = () => {
    const maxVal = Math.max(...inputRow);
    const exps = inputRow.map(val => Math.exp(val - maxVal));
    const sumExps = exps.reduce((a, b) => a + b, 0);

    const fullSumIsSource = highlight.sources.some(s => s.isInternal && s.row === rowIndex && s.col === -1); // -1 indicates whole row/sum

    return (
      <>
        {/* Step 1: exp(x - max(x)) */}
        <div className="calc-step">
          <div className="calc-label"><InlineMath math="\text{exp}(x_i - \text{max}(\mathbf{x}))" /></div>
          <div className="elementwise-op-row">
            {renderVisibleElements(exps.map(v => Number(formatNumber(v, 4))), 'exp')}
          </div>
        </div>
        {/* Step 2: Sum */}
        <div className="calc-step">
          <div className="calc-label"><InlineMath math="\sum \text{exp}(\dots)" /></div>
          <div className={`elementwise-op-element sum ${fullSumIsSource ? 'source' : ''}`} onClick={() => handleClick(-1)}>
            {formatNumber(sumExps, 4)}
          </div>
        </div>
        {/* Step 3: Division */}
        <div className="calc-step">
          <div className="calc-label"><InlineMath math="\text{exp}(\dots) / \sum" /></div>
          <div className="elementwise-op-row">{renderVisibleElements(outputRow, 'output')}</div>
        </div>
      </>
    );
  };

  const renderReLU = () => {
    return (
      <>
        <div className="calc-step">
          <div className="calc-label"><InlineMath math="\text{max}(0, x_i)" /></div>
          <div className="elementwise-op-row">{renderVisibleElements(outputRow, 'output')}</div>
        </div>
      </>
    );
  };


  return (
    <div className="elementwise-calc-container">
        {opType === 'softmax' ? renderSoftmax() : renderReLU()}
    </div>
  );
};
// END OF FILE: src/components/ElementwiseCalculation.tsx