// FILE: src/components/visualizers/InteractiveMatMulVisualizer.tsx
import React from 'react';
import { Vector, CalculationComponent, SymbolInfo } from './types';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

interface InteractiveMatMulVisualizerProps {
    vectorA: Vector;
    vectorB: Vector;
    symbolAInfo: SymbolInfo;
    symbolBInfo: SymbolInfo;
    result: number;
    components: CalculationComponent[];
    hoveredComponentIndex: number | null;
    setHoveredComponentIndex: (index: number | null) => void;
}

const formatNumber = (num: number, precision = 4) => {
    if (num === -Infinity) return '-∞';
    if (num === Infinity) return '+∞';
    const fixed = num.toFixed(precision);
    return parseFloat(fixed).toString();
};

// [COPIED & MODIFIED] from matrixView.ts to avoid complex relative imports in a generic component
const ELLIPSIS = '...';
const MIN_SIZE_FOR_TRUNCATION = 12;
const getVisibleIndices = (
  totalSize: number,
  focusIndex: number = -1,
  alwaysShowCount: number = 1,
  windowSize: number = 5
): (number | typeof ELLIPSIS)[] => {
  if (totalSize < MIN_SIZE_FOR_TRUNCATION) {
    return Array.from({ length: totalSize }, (_, i) => i);
  }
  const visible = new Set<number>();
  for (let i = 0; i < Math.min(alwaysShowCount, totalSize); i++) {
    visible.add(i);
  }
  for (let i = 0; i < Math.min(alwaysShowCount, totalSize); i++) {
    visible.add(totalSize - 1 - i);
  }
  if (focusIndex === -1 && totalSize >= MIN_SIZE_FOR_TRUNCATION) {
    visible.add(Math.floor((totalSize - 1) / 2));
  }
  if (focusIndex !== -1) {
    const windowStart = Math.max(0, focusIndex - Math.floor(windowSize / 2));
    const windowEnd = Math.min(totalSize - 1, focusIndex + Math.floor(windowSize / 2));
    for (let i = windowStart; i <= windowEnd; i++) {
      visible.add(i);
    }
  }
  const sorted = Array.from(visible).sort((a, b) => a - b);
  const result: (number | typeof ELLIPSIS)[] = [];
  if (sorted.length > 0) {
    result.push(sorted[0]);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] > sorted[i - 1] + 1) {
        result.push(ELLIPSIS);
      }
      result.push(sorted[i]);
    }
  }
  return result;
};


export const InteractiveMatMulVisualizer: React.FC<InteractiveMatMulVisualizerProps> = ({
    vectorA,
    vectorB,
    symbolAInfo,
    symbolBInfo,
    result,
    components,
    hoveredComponentIndex,
    setHoveredComponentIndex,
}) => {

    const renderVector = (vec: number[], symbolInfo: SymbolInfo, direction: 'row' | 'column' = 'row') => {
        let mathSymbol = symbolInfo.base;
        if (symbolInfo.subscript) mathSymbol += `_{${symbolInfo.subscript}}`;
        if (symbolInfo.superscript) mathSymbol += `^{${symbolInfo.superscript}}`;
        const dims = direction === 'row' ? `1 \\times ${vec.length}` : `${vec.length} \\times 1`;
        mathSymbol += `_{${dims}}`;

        return (
            <div className="tooltip-vector-group">
                <div className="matrix-wrapper side-label">
                    <div className="matrix-label-side"><InlineMath math={mathSymbol} /></div>
                </div>
                <span className="tooltip-symbol">=</span>
                <div className={`tooltip-vector ${direction}`}>
                    {vec.map((val, i) => (
                        <span
                            key={i}
                            className={`tooltip-element source ${hoveredComponentIndex === i ? 'highlight' : ''}`}
                        >
                            {formatNumber(val, 2)}
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    const visibleTermIndices = getVisibleIndices(components.length, hoveredComponentIndex ?? -1, 1, 5);

    return (
        <div className="tooltip-matmul-container">
            {renderVector(vectorA, symbolAInfo, 'row')}
            <div className="tooltip-op-symbol">·</div>
            {renderVector(vectorB, symbolBInfo, 'column')}
            <div className="tooltip-result-line">
                <span className="tooltip-op-symbol">=</span>
                <span className="tooltip-result">{formatNumber(result, 4)}</span>
            </div>
            {components && (
                <div className="tooltip-calculation-detail">
                    <div className="tooltip-calc-title">点积计算分解 (Dot Product Breakdown):</div>
                    <div className="tooltip-calc-equation">
                        <div className="tooltip-braced-group">
                            <span className="tooltip-curly-brace">{'{'}</span>
                            <div className="tooltip-calc-terms-wrapper">
                                {visibleTermIndices.map((idx, i) => {
                                    if (idx === ELLIPSIS) {
                                        return <span key={`ellipsis-${i}`} className="op">...</span>;
                                    }
                                    const comp = components[idx];
                                    return (
                                        <React.Fragment key={idx}>
                                            {i > 0 && visibleTermIndices[i-1] !== ELLIPSIS && <span className="op">+</span>}
                                            <span onMouseEnter={() => setHoveredComponentIndex(idx)} onMouseLeave={() => setHoveredComponentIndex(null)}>
                                                <span className={`tooltip-calc-term ${hoveredComponentIndex === idx ? 'highlight' : ''}`}>
                                                    ({formatNumber(comp.a, 2)} <span className="op">×</span> {formatNumber(comp.b, 2)})
                                                </span>
                                            </span>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                            <span className="tooltip-curly-brace">{'}'}</span>
                        </div>
                        <span>=</span>
                        <span className="result">{formatNumber(result, 4)}</span>
                    </div>
                </div>
            )}
        </div>
    );
};
// END OF FILE: src/components/visualizers/InteractiveMatMulVisualizer.tsx