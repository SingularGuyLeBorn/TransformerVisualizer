// FILE: src/topics/attention-variants/components/ElementwiseCalculation.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { InlineMath } from 'react-katex';
import { ElementIdentifier, HighlightState } from '../types';
import { getVisibleIndices, ELLIPSIS } from '../utils/matrixView';

interface ElementwiseCalculationProps {
  opType: 'softmax' | 'relu';
  inputRow: number[];
  outputRow: number[];
  highlight: HighlightState;
  onElementClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
  baseName: string;
  rowIndex: number;
  variant: 'mha' | 'mqa' | 'gqa' | 'mla';
}

const formatNumber = (num: number, precision = 4) => {
    if (num === -Infinity) return '-∞';
    if (num === Infinity) return '+∞';
    const parsed = parseFloat(num.toFixed(precision));
    return parsed.toString();
}

type SoftmaxStep = 'start' | 'exp' | 'sum' | 'divide';

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
  const [step, setStep] = useState<SoftmaxStep>('start');
  const stepsOrder: SoftmaxStep[] = ['start', 'exp', 'sum', 'divide'];
  const currentStepIndex = stepsOrder.indexOf(step);

  // [FIXED] Reset animation when the target row changes
  useEffect(() => {
    setStep('start');
  }, [rowIndex, baseName]);

  const calculations = useMemo(() => {
    const finiteInputRow = inputRow.filter(v => isFinite(v));
    const maxVal = finiteInputRow.length > 0 ? Math.max(...finiteInputRow) : 0;
    const exps = inputRow.map(val => isFinite(val) ? Math.exp(val - maxVal) : 0);
    const sumExps = exps.reduce((a, b) => a + b, 0);
    return { exps, sumExps };
  }, [inputRow]);

  const handleNext = () => setStep(stepsOrder[Math.min(stepsOrder.length - 1, currentStepIndex + 1)]);
  const handlePrev = () => setStep(stepsOrder[Math.max(0, currentStepIndex - 1)]);
  const handleReset = () => setStep('start');

  const targetCol = highlight.target?.isInternal && highlight.target.row === rowIndex ? highlight.target.col : -1;
  const visibleCols = getVisibleIndices(inputRow.length, targetCol, 2, 5);

  const handleClick = (event: React.MouseEvent, colIndex: number) => {
    onElementClick({
      variant,
      name: `${baseName}.internal`,
      row: rowIndex,
      col: colIndex,
      isInternal: true,
    }, event);
  };

  const isSource = (colIndex: number) => {
      return highlight.sources.some(s => s.isInternal && s.row === rowIndex && s.col === colIndex && s.name === `${baseName}.internal`);
  }
  const isTarget = (colIndex: number) => {
      return highlight.target?.isInternal && highlight.target.row === rowIndex && highlight.target.col === colIndex;
  }

  const renderVisibleElements = (data: (number | string)[], isHighlighted: boolean) => {
    return visibleCols.map((col, i) => {
      if (col === ELLIPSIS) {
        return <div key={`ellipsis-${i}`} className="elementwise-op-element symbolic-ellipsis">...</div>;
      }
      const value = data[col];
      const className = `elementwise-op-element ${isSource(col) ? 'source' : ''} ${isTarget(col) ? 'target' : ''} ${isHighlighted ? 'highlight-step' : ''}`;
      return (
        <div key={`${i}-${col}`} className={className} onClick={(e) => handleClick(e, col)}>
          {typeof value === 'number' ? formatNumber(value) : value}
        </div>
      );
    });
  };

  const renderSoftmax = () => {
    const fullSumIsSource = isSource(-1);
    return (
      <>
        <div className={`calc-step ${currentStepIndex < 1 ? 'hidden' : ''}`}>
          <div className="calc-label"><InlineMath math="\text{exp}(x_i - \text{max}(\mathbf{x}))" /></div>
          <div className="elementwise-op-row">
            {renderVisibleElements(calculations.exps, step === 'exp')}
          </div>
        </div>
        <div className={`calc-step ${currentStepIndex < 2 ? 'hidden' : ''}`}>
          <div className="calc-label"><InlineMath math="\sum \text{exp}(\dots)" /></div>
          <div className={`elementwise-op-element sum ${fullSumIsSource ? 'source' : ''} ${step === 'sum' ? 'highlight-step' : ''}`} onClick={(e) => handleClick(e, -1)}>
            {formatNumber(calculations.sumExps)}
          </div>
        </div>
        <div className={`calc-step ${currentStepIndex < 3 ? 'hidden' : ''}`}>
          <div className="calc-label"><InlineMath math="\text{exp}(\dots) / \sum" /></div>
          <div className="elementwise-op-row">{renderVisibleElements(outputRow, step === 'divide')}</div>
        </div>
        <div className="elementwise-controls">
            <button onClick={handlePrev} disabled={currentStepIndex <= 0}>上一步</button>
            <button onClick={handleNext} disabled={currentStepIndex >= stepsOrder.length - 1}>下一步</button>
            <button onClick={handleReset}>重置</button>
        </div>
      </>
    );
  };

  const renderOther = () => (
      <div>Operation {opType} detail view not implemented.</div>
  );

  return (
    <div className="elementwise-calc-container">
      <div className="calc-step">
        <div className="calc-label"><InlineMath math="\text{Input (Scores)}" /></div>
        <div className="elementwise-op-row">{renderVisibleElements(inputRow, step === 'start')}</div>
      </div>
      {opType === 'softmax' ? renderSoftmax() : renderOther()}
    </div>
  );
};
// END OF FILE: src/topics/attention-variants/components/ElementwiseCalculation.tsx