// FILE: src/topics/attention-variants/components/ElementwiseCalculation.tsx
import React from 'react';
import { InlineMath } from 'react-katex';
import { ElementIdentifier, HighlightState } from '../types';
import { getVisibleIndices, ELLIPSIS } from '../utils/matrixView';

interface ElementwiseCalculationProps {
  opType: 'softmax' | 'relu';
  inputRow: number[];
  outputRow: number[];
  highlight: HighlightState;
  onElementClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
  baseName: string; // e.g., "mha.heads.0.Weights"
  rowIndex: number;
  variant: 'mha' | 'mqa' | 'gqa' | 'mla';
}

const formatNumber = (num: number, precision = 4) => {
    if (num === -Infinity) return '-∞';
    if (num === Infinity) return '+∞';
    return num.toFixed(precision);
}

export const ElementwiseCalculation: React.FC<ElementwiseCalculationProps> = ({
  opType,
  inputRow,
  outputRow,
  highlight,
  onElementClick,
  baseName,
  rowIndex,
  variant,
}) => {
  const targetCol = highlight.target?.isInternal && highlight.target.row === rowIndex ? highlight.target.col : -1;
  const visibleCols = getVisibleIndices(inputRow.length, targetCol);

  const handleClick = (event: React.MouseEvent, colIndex: number) => {
    onElementClick({
      variant,
      name: `${baseName}.internal`, // Special name for internal calculation
      row: rowIndex,
      col: colIndex,
      isInternal: true,
    }, event);
  };

  const isSource = (colIndex: number) => {
      // Check if the current element (or the sum) is a source in the internal calculation view
      return highlight.sources.some(s => s.isInternal && s.row === rowIndex && s.col === colIndex && s.name === `${baseName}.internal`);
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
        <div key={`${type}-${col}`} className={className} onClick={(e) => handleClick(e, col)}>
          {typeof value === 'number' ? formatNumber(value) : value}
        </div>
      );
    });
  };

  const renderSoftmax = () => {
    // [FIXED] Filter out -Infinity for max calculation, as it's a masked value
    const finiteInputRow = inputRow.filter(v => isFinite(v));
    const maxVal = finiteInputRow.length > 0 ? Math.max(...finiteInputRow) : 0;

    const exps = inputRow.map(val => isFinite(val) ? Math.exp(val - maxVal) : 0);
    const sumExps = exps.reduce((a, b) => a + b, 0);

    const fullSumIsSource = isSource(-1); // -1 indicates whole row/sum

    return (
      <>
        {/* Step 1: exp(x - max(x)) */}
        <div className="calc-step">
          <div className="calc-label"><InlineMath math="\text{exp}(x_i - \text{max}(\mathbf{x}))" /></div>
          <div className="elementwise-op-row">
            {renderVisibleElements(exps, 'exp')}
          </div>
        </div>
        {/* Step 2: Sum */}
        <div className="calc-step">
          <div className="calc-label"><InlineMath math="\sum \text{exp}(\dots)" /></div>
          <div className={`elementwise-op-element sum ${fullSumIsSource ? 'source' : ''}`} onClick={(e) => handleClick(e, -1)}>
            {formatNumber(sumExps)}
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

  // Dummy render for other opTypes
  const renderOther = () => (
      <div>Operation {opType} detail view not implemented.</div>
  );

  return (
    <div className="elementwise-calc-container">
        {opType === 'softmax' ? renderSoftmax() : renderOther()}
    </div>
  );
};
// END OF FILE: src/topics/attention-variants/components/ElementwiseCalculation.tsx