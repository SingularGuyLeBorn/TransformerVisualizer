// FILE: src/components/CalculationTooltip/CalculationTooltip.tsx
import React, { useState, useEffect, useRef } from 'react';
import { TooltipState } from './types';
import { useDraggableAndResizable } from '../../hooks/useDraggableAndResizable';
import { InteractiveMatMulVisualizer } from '../visualizers/InteractiveMatMulVisualizer';
import { SoftmaxVisualizer } from '../visualizers/SoftmaxVisualizer';
import { ActivationFunctionVisualizer } from '../visualizers/ActivationFunctionVisualizer';
import { ElementWiseOpVisualizer } from '../visualizers/ElementWiseOpVisualizer';
import { InlineMath } from 'react-katex';
import { getSymbolParts } from '../../topics/transformer-explorer/config/symbolMapping';
import './CalculationTooltip.css';

interface CalculationTooltipProps {
  tooltip: TooltipState;
  onClose: () => void;
}

const formatNumber = (num: number, precision = 4) => {
    if (num === null || num === undefined || isNaN(num)) return '?';
    if (num === -Infinity) return '-∞';
    if (num === Infinity) return '+∞';
    const fixed = num.toFixed(precision);
    return parseFloat(fixed).toString();
};

const ELLIPSIS = '...';
const getVisibleIndices = (
  totalSize: number,
  focusIndex: number = -1,
  alwaysShowCount: number = 4,
  windowSize: number = 9
): (number | typeof ELLIPSIS)[] => {
  const MIN_SIZE_FOR_TRUNCATION = 12;
  if (totalSize < MIN_SIZE_FOR_TRUNCATION) {
    return Array.from({ length: totalSize }, (_, i) => i);
  }
  const visible = new Set<number>();
  for (let i = 0; i < Math.min(alwaysShowCount, totalSize); i++) visible.add(i);
  for (let i = 0; i < Math.min(alwaysShowCount, totalSize); i++) visible.add(totalSize - 1 - i);
  if (focusIndex === -1) visible.add(Math.floor((totalSize - 1) / 2));
  if (focusIndex !== -1) {
    const windowStart = Math.max(0, focusIndex - Math.floor(windowSize / 2));
    const windowEnd = Math.min(totalSize - 1, focusIndex + Math.floor(windowSize / 2));
    for (let i = windowStart; i <= windowEnd; i++) visible.add(i);
  }
  const sorted = Array.from(visible).sort((a, b) => a - b);
  const result: (number | typeof ELLIPSIS)[] = [];
  if (sorted.length > 0) {
    result.push(sorted[0]);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] > sorted[i - 1] + 1) result.push(ELLIPSIS);
      result.push(sorted[i]);
    }
  }
  return result;
};

export const CalculationTooltip: React.FC<CalculationTooltipProps> = ({ tooltip, onClose }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('detailed');
    const [hoveredComponentIndex, setHoveredComponentIndex] = useState<number | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const { position, size, dragHandleProps, resizeHandleProps } = useDraggableAndResizable({
        x: 20,
        y: 20,
        width: 800,
        height: 600,
    }, panelRef);

    useEffect(() => {
        setIsCollapsed(false);
        setViewMode('detailed');
        setHoveredComponentIndex(null);
    }, [tooltip]);

    const renderVector = (vec: number[], symbolInfo: TooltipState['steps'][0]['aSymbolInfo'], direction: 'row' | 'column' = 'row') => {
        let mathSymbol = symbolInfo.base;
        if (symbolInfo.subscript) mathSymbol += `_{${symbolInfo.subscript}}`;
        if (symbolInfo.superscript) mathSymbol += `^{${symbolInfo.superscript}}`;

        return (
            <div className="tooltip-vector-group">
                <span className="tooltip-symbol"><InlineMath>{mathSymbol}</InlineMath> =</span>
                <div className={`tooltip-vector ${direction}`}>
                    {vec.map((val, i) => (
                        <span key={i} className={`tooltip-element source ${hoveredComponentIndex === i ? 'highlight' : ''}`}>
                            {formatNumber(val, 2)}
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    const renderBody = () => {
        if (!tooltip.steps || tooltip.steps.length === 0) return null;

        // DETAILED (ANIMATION) VIEW
        if (viewMode === 'detailed') {
            return tooltip.steps.map((step, stepIndex) => (
                <div className="tooltip-step-container" key={stepIndex}>
                    {step.title && <h3 style={{textAlign: 'center'}}>{step.title}</h3>}
                    {(() => {
                        const op = step.op === '·' ? '×' : step.op;
                        switch(tooltip.opType) {
                            case 'matmul':
                                return <InteractiveMatMulVisualizer
                                    sourceVectorsA={step.aSources!}
                                    sourceVectorB={step.bSources![0]}
                                    resultSymbolInfo={getSymbolParts(tooltip.target.name)}
                                    operation={op as '×' | '+'}
                                />;
                            case 'softmax':
                                return <SoftmaxVisualizer inputVector={step.a} inputLabel={step.aLabel} outputLabel={step.resultLabel} />;
                            case 'relu':
                                return <ActivationFunctionVisualizer functionType="relu" inputVector={step.a} inputLabel={step.aLabel} outputLabel={step.resultLabel} />;
                            case 'add':
                                return <ElementWiseOpVisualizer matrixA={[step.a]} matrixB={[step.b]} operation="+" labelA={step.aLabel} labelB={step.bLabel} labelC={step.resultLabel} />;
                            default:
                                return <div>此操作没有详细动画视图。</div>;
                        }
                    })()}
                </div>
            ));
        }

        // COMPACT (BREAKDOWN) VIEW
        return tooltip.steps.map((step, stepIndex) => {
            let content;
            const focusIndex = tooltip.target.col;

            switch(tooltip.opType) {
                case 'matmul':
                    const components = step.a.map((val, i) => ({ a: val, b: step.b[i] }));
                    const visibleTermIndices = getVisibleIndices(components.length, hoveredComponentIndex ?? -1, 1, 5);
                    content = (
                        <div className="tooltip-matmul-container">
                            {renderVector(step.a, step.aSymbolInfo, 'row')}
                            <div className="tooltip-op-symbol">·</div>
                            {renderVector(step.b, step.bSymbolInfo, 'column')}
                            <div className="tooltip-result-line">
                                <span className="tooltip-op-symbol">=</span>
                                <span className="tooltip-result">{formatNumber(step.result, 4)}</span>
                            </div>
                            <div className="tooltip-calculation-detail">
                                <div className="tooltip-calc-title">点积计算分解:</div>
                                <div className="tooltip-calc-equation">
                                    <div className="tooltip-braced-group">
                                        <span className="tooltip-curly-brace">{'{'}</span>
                                        <div className="tooltip-calc-terms-wrapper">
                                            {visibleTermIndices.map((idx, i) => {
                                                if (idx === ELLIPSIS) return <span key={`ellipsis-${i}`} className="op">...</span>;
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
                                    <span className="result">{formatNumber(step.result, 4)}</span>
                                </div>
                            </div>
                        </div>
                    );
                    break;
                case 'add':
                    content = (
                        <div className="tooltip-add-container">
                             {renderVector(step.a, step.aSymbolInfo, 'row')}
                             <div className="tooltip-op-symbol">+</div>
                             {renderVector(step.b, step.bSymbolInfo, 'row')}
                             <div className="tooltip-result-line">
                                 <span className="tooltip-op-symbol">=</span>
                                 <span className="tooltip-result">{formatNumber(step.result, 4)}</span>
                             </div>
                        </div>
                    );
                    break;
                case 'softmax':
                    const finiteInputRow = step.a.filter(v => isFinite(v));
                    const maxVal = finiteInputRow.length > 0 ? Math.max(...finiteInputRow) : 0;
                    const exps = step.a.map(v => isFinite(v) ? Math.exp(v - maxVal) : 0);
                    const sumExps = exps.reduce((a, b) => a + b, 0);
                    content = (
                        <>
                            {renderVector(step.a, step.aSymbolInfo, 'row')}
                            <div className="tooltip-calculation-detail">
                                <div className="tooltip-calc-title">Softmax 计算分解 (for {tooltip.target.symbol}[{tooltip.target.row}, {tooltip.target.col}]):</div>
                                <div className="tooltip-calc-equation-multi">
                                    <div>1. 减去最大值: <span>max(...) = {formatNumber(maxVal, 2)}</span></div>
                                    <div>2. 计算指数: <span>e^({formatNumber(step.a[focusIndex], 2)} - {formatNumber(maxVal, 2)}) = {formatNumber(exps[focusIndex], 4)}</span></div>
                                    <div>3. 计算所有指数之和: <span>Σ e^(...) = {formatNumber(sumExps, 4)}</span></div>
                                    <div>4. 归一化: <span>{formatNumber(exps[focusIndex], 4)} / {formatNumber(sumExps, 4)} = <span className="result">{formatNumber(step.result, 4)}</span></span></div>
                                </div>
                            </div>
                        </>
                    );
                    break;
                case 'relu':
                    content = (
                        <>
                            {renderVector(step.a, step.aSymbolInfo, 'row')}
                            <div className="tooltip-calculation-detail">
                                <div className="tooltip-calc-title">ReLU 计算:</div>
                                <div className="tooltip-calc-equation">
                                    <span>max(0, {formatNumber(step.a[focusIndex], 2)}) = <span className="result">{formatNumber(step.result, 2)}</span></span>
                                </div>
                            </div>
                        </>
                    );
                    break;
                default:
                    content = <div>未知操作类型。</div>;
            }
            return (
                <div className="tooltip-step-container" key={stepIndex}>
                    {step.title && <h4 className="tooltip-step-title">{step.title}</h4>}
                    {content}
                </div>
            );
        });
    };

    const panelStyle: React.CSSProperties = {
        top: position.y,
        left: position.x,
        width: size.width,
        height: typeof size.height === 'number' && !isCollapsed ? size.height : 'auto',
    };

    const hasDetailedView = ['matmul', 'softmax', 'relu', 'add'].includes(tooltip.opType);

    return (
        <div ref={panelRef} style={panelStyle} className={`calculation-tooltip ${isCollapsed ? 'collapsed' : ''} resizable-panel`}>
            <div className="panel-header" {...dragHandleProps}>
                <span className="panel-title">{tooltip.title}</span>
                <div className="tooltip-controls">
                    {hasDetailedView && (
                        <button
                            className="view-toggle-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                setViewMode(prev => prev === 'compact' ? 'detailed' : 'compact');
                            }}>
                            {viewMode === 'compact' ? '动画视图' : '分解视图'}
                        </button>
                    )}
                    <button onClick={() => setIsCollapsed(!isCollapsed)} className="tooltip-toggle-btn">
                        {isCollapsed ? '⊕' : '⊖'}
                    </button>
                    <button onClick={onClose} className="tooltip-close-btn">&times;</button>
                </div>
            </div>
            <div className="tooltip-content-wrapper">
                <div className="tooltip-body">
                    {renderBody()}
                </div>
            </div>
            <div className="resize-handle br" {...resizeHandleProps.br}></div>
            <div className="resize-handle t" {...resizeHandleProps.t}></div>
            <div className="resize-handle r" {...resizeHandleProps.r}></div>
            <div className="resize-handle b" {...resizeHandleProps.b}></div>
            <div className="resize-handle l" {...resizeHandleProps.l}></div>
        </div>
    );
};
// END OF FILE: src/components/CalculationTooltip/CalculationTooltip.tsx