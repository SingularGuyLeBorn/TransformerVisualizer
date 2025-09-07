// FILE: src/topics/attention-variants/components/CalculationTooltip.tsx
import React, { useState, useEffect, useRef } from 'react';
import { TooltipState } from '../types';
import { useDraggableAndResizable } from '../../../hooks/useDraggableAndResizable';

interface CalculationTooltipProps {
  tooltip: TooltipState;
  onClose: () => void;
}

const formatNumber = (num: number, precision = 4) => {
    if (num === -Infinity) return '-∞';
    if (num === Infinity) return '+∞';
    const fixed = num.toFixed(precision);
    return parseFloat(fixed).toString();
};

export const CalculationTooltip: React.FC<CalculationTooltipProps> = ({ tooltip, onClose }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [hoveredComponentIndex, setHoveredComponentIndex] = useState<number | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const { position, size, dragHandleProps, resizeHandleProps } = useDraggableAndResizable({
        x: 20,
        y: 20,
        width: 500,
        height: 'auto',
    }, panelRef);

    useEffect(() => {
        setIsCollapsed(false);
    }, [tooltip]);

    const renderVector = (vec: number[], symbol: string, direction: 'row' | 'column' = 'row') => (
        <div className="tooltip-vector-group">
            <span className="tooltip-symbol">{symbol} =</span>
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

    const renderBody = () => {
        if (!tooltip.steps || tooltip.steps.length === 0) return null;
        const step = tooltip.steps[0];

        switch (tooltip.opType) {
            case 'matmul':
                 return (
                     <div className="tooltip-matmul-container">
                        {renderVector(step.a, step.aSymbol, 'row')}
                        <div className="tooltip-op-symbol">·</div>
                        {renderVector(step.b, step.bSymbol, 'column')}
                        <div className="tooltip-result-line">
                            <span className="tooltip-op">=</span>
                            <span className="tooltip-result">{formatNumber(step.result, 4)}</span>
                        </div>
                        {step.components && (
                            <div className="tooltip-calculation-detail">
                                <div className="tooltip-calc-title">点积计算分解:</div>
                                <div className="tooltip-calc-equation">
                                    {step.components.map((comp, i) => (
                                        <span key={i} onMouseEnter={() => setHoveredComponentIndex(i)} onMouseLeave={() => setHoveredComponentIndex(null)}>
                                            {i > 0 && <span className="op"> + </span>}
                                            <span className={`tooltip-calc-term ${hoveredComponentIndex === i ? 'highlight' : ''}`}>
                                                ({formatNumber(comp.a, 2)} <span className="op">×</span> {formatNumber(comp.b, 2)})
                                            </span>
                                        </span>
                                    ))}
                                    <span> = <span className="result">{formatNumber(step.result, 4)}</span></span>
                                </div>
                            </div>
                        )}
                    </div>
                );
             case 'add':
                 return (
                    <div className="tooltip-calculation-detail">
                        <div className="tooltip-calc-title">逐元素加法:</div>
                        <div className="tooltip-calc-equation">
                            <span>{formatNumber(step.a[0], 2)} <span className="op">+</span> {formatNumber(step.b[0], 2)}</span>
                            <span> = <span className="result">{formatNumber(step.result, 2)}</span></span>
                        </div>
                    </div>
                );
            case 'softmax':
                const finiteInputRow = step.a.filter(v => isFinite(v));
                const maxVal = finiteInputRow.length > 0 ? Math.max(...finiteInputRow) : 0;
                const exps = step.a.map(v => isFinite(v) ? Math.exp(v - maxVal) : 0);
                const sumExps = exps.reduce((a, b) => a + b, 0);
                 return (
                    <>
                        {renderVector(step.a, step.aSymbol, 'row')}
                         <div className="tooltip-calculation-detail">
                            <div className="tooltip-calc-title">Softmax 计算分解 (for {tooltip.target.symbol}[{tooltip.target.row}, {tooltip.target.col}]):</div>
                            <div className="tooltip-calc-equation-multi">
                                <div>1. 减去最大值: <span>max(...) = {formatNumber(maxVal, 2)}</span></div>
                                <div>2. 计算指数: <span>e^({formatNumber(step.a[tooltip.target.col], 2)} - {formatNumber(maxVal, 2)}) = {formatNumber(exps[tooltip.target.col], 4)}</span></div>
                                <div>3. 计算所有指数之和: <span>Σ e^(...) = {formatNumber(sumExps, 4)}</span></div>
                                <div>4. 归一化: <span>{formatNumber(exps[tooltip.target.col], 4)} / {formatNumber(sumExps, 4)} = <span className="result">{formatNumber(step.result, 4)}</span></span></div>
                            </div>
                        </div>
                    </>
                );
            default:
                return <div>计算过程未定义</div>
        }
    };

    const panelStyle: React.CSSProperties = {
        top: position.y,
        left: position.x,
        width: size.width,
        height: typeof size.height === 'number' && !isCollapsed ? size.height : 'auto',
    };

    return (
        <div ref={panelRef} style={panelStyle} className={`calculation-tooltip ${isCollapsed ? 'collapsed' : ''} resizable-panel`}>
            <div className="panel-header" {...dragHandleProps}>
                <span className="tooltip-title">{tooltip.title}</span>
                <div className="tooltip-controls">
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
// END OF FILE: src/topics/attention-variants/components/CalculationTooltip.tsx