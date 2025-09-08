// FILE: src/topics/transformer-explorer/components/ElementwiseCalculation.tsx
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
  baseName: string; // e.g., "encoder.0.mha.h0.AttentionWeights"
  rowIndex: number;
}

const formatNumber = (num: number, precision = 2) => {
    const fixed = num.toFixed(precision);
    return parseFloat(fixed).toString(); // Removes trailing zeros
};

type AnimStep = 'start' | 'exp' | 'sum' | 'divide' | 'relu';

export const ElementwiseCalculation: React.FC<ElementwiseCalculationProps> = ({
  opType,
  inputRow,
  outputRow,
  highlight,
  onElementClick,
  baseName,
  rowIndex,
}) => {
  const [step, setStep] = useState<AnimStep>('start');
  const stepsOrder: AnimStep[] = opType === 'softmax' ? ['start', 'exp', 'sum', 'divide'] : ['start', 'relu'];
  const currentStepIndex = stepsOrder.indexOf(step);

  // Reset animation when the target row changes
  useEffect(() => {
    setStep('start');
  }, [rowIndex, baseName]);

  const calculations = useMemo(() => {
    if (opType === 'softmax') {
      const maxVal = Math.max(...inputRow.filter(isFinite));
      const exps = inputRow.map(val => isFinite(val) ? Math.exp(val - maxVal) : 0);
      const sumExps = exps.reduce((a, b) => a + b, 0);
      return { exps, sumExps };
    }
    return { exps: [], sumExps: 0 };
  }, [inputRow, opType]);

  const handleNext = () => setStep(stepsOrder[Math.min(stepsOrder.length - 1, currentStepIndex + 1)]);
  const handlePrev = () => setStep(stepsOrder[Math.max(0, currentStepIndex - 1)]);
  const handleReset = () => setStep('start');

  const targetCol = highlight.target?.isInternal && highlight.target.row === rowIndex ? highlight.target.col : -1;
  const visibleCols = getVisibleIndices(inputRow.length, targetCol, 2, 5);

  const handleClick = (event: React.MouseEvent, colIndex: number) => {
    onElementClick({
      name: `${baseName}.internal`,
      row: rowIndex,
      col: colIndex,
      isInternal: true,
    }, event);
  };

  const isSource = (colIndex: number) => {
      return highlight.sources.some(s => s.isInternal && s.row === rowIndex && s.col === colIndex);
  }
  const isTarget = (colIndex: number) => {
      return highlight.target?.isInternal && highlight.target.row === rowIndex && highlight.target.col === colIndex;
  }

  const renderVisibleElements = (data: number[], isHighlighted: boolean) => {
    return visibleCols.map((col, i) => {
      if (col === ELLIPSIS) {
        return <div key={`ellipsis-${i}`} className="elementwise-op-element symbolic-ellipsis">...</div>;
      }
      const value = data[col];
      const className = `elementwise-op-element ${isSource(col) ? 'source' : ''} ${isTarget(col) ? 'target' : ''} ${isHighlighted ? 'highlight-step' : ''}`;
      return (
        <div key={`${i}-${col}`} className={className} onClick={(e) => handleClick(e, col)}>
          {formatNumber(value, 2)}
        </div>
      );
    });
  };

  const renderSoftmax = () => {
    const fullSumIsSource = highlight.sources.some(s => s.isInternal && s.row === rowIndex && s.col === -1);
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
            {formatNumber(calculations.sumExps, 4)}
          </div>
        </div>
        <div className={`calc-step ${currentStepIndex < 3 ? 'hidden' : ''}`}>
          <div className="calc-label"><InlineMath math="\text{exp}(\dots) / \sum" /></div>
          <div className="elementwise-op-row">{renderVisibleElements(outputRow, step === 'divide')}</div>
        </div>
      </>
    );
  };

  const renderReLU = () => (
    <div className={`calc-step ${currentStepIndex < 1 ? 'hidden' : ''}`}>
        <div className="calc-label"><InlineMath math="\text{Output}" /></div>
        <div className="elementwise-op-row">{renderVisibleElements(outputRow, step === 'relu')}</div>
    </div>
  );

  return (
    <div className="elementwise-calc-container">
      <div className="calc-step">
        <div className="calc-label"><InlineMath math="\text{Input}" /></div>
        <div className="elementwise-op-row">{renderVisibleElements(inputRow, step === 'start')}</div>
      </div>

      {opType === 'softmax' ? renderSoftmax() : renderReLU()}

      <div className="elementwise-controls">
          <button onClick={handlePrev} disabled={currentStepIndex <= 0}>上一步</button>
          <button onClick={handleNext} disabled={currentStepIndex >= stepsOrder.length - 1}>下一步</button>
          <button onClick={handleReset}>重置</button>
      </div>
    </div>
  );
};
// END OF FILE: src/topics/transformer-explorer/components/ElementwiseCalculation.tsx