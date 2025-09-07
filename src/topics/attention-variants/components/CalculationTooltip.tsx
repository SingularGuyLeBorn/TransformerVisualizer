// FILE: src/topics/attention-variants/components/CalculationTooltip.tsx
import React, { useState, useEffect, useRef } from 'react';
import { TooltipState } from '../types';
import { useDraggableAndResizable } from '../../../hooks/useDraggableAndResizable';
import { getVisibleIndices, ELLIPSIS } from '../utils/matrixView';
import { MatMulVisualizer } from '../../../components/visualizers/MatMulVisualizer';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';


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
    const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
    const [hoveredComponentIndex, setHoveredComponentIndex] = useState<number | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const { position, size, dragHandleProps, resizeHandleProps } = useDraggableAndResizable({
        x: 20,
        y: 20,
        width: 650,
        height: 500,
    }, panelRef);

    useEffect(() => {
        setIsCollapsed(false);
        setViewMode('compact');
        setHoveredComponentIndex(null);
    }, [tooltip]);

    // This renderVector is for the Softmax case
    const renderSimpleVector = (vec: number[], symbol: string, direction: 'row' | 'column' = 'row', focusIndex: number = -1) => {
        const visibleIndices = getVisibleIndices(vec.length, focusIndex, 1, 4);

        return (
            <div className="tooltip-vector-group">
                <span className="tooltip-symbol">{symbol} =</span>
                <div className={`tooltip-vector ${direction}`}>
                    {visibleIndices.map((idx, i) => {
                        if (idx === ELLIPSIS) {
                            return <span key={`ellipsis-${i}`} className="tooltip-element">...</span>;
                        }
                        return (
                            <span
                                key={idx}
                                className={`tooltip-element source`}
                            >
                                {formatNumber(vec[idx], 2)}
                            </span>
                        );
                    })}
                </div>
            </div>
        );
    };

    // This function specifically renders the interactive MatMul view
    const renderMatmulCompact = () => {
        const step = tooltip.steps[0];
        if (!step?.components) return null;
        const { a: vectorA, b: vectorB, result, components, aSymbolInfo, bSymbolInfo } = step;

        const visibleTermIndices = getVisibleIndices(components.length, hoveredComponentIndex ?? -1, 1, 5);

        // A specialized renderVector for the interactive part
        const renderInteractiveVector = (vec: number[], symbolInfo: TooltipState['steps'][0]['aSymbolInfo'], direction: 'row' | 'column' = 'row') => {
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

        return (
            <div className="tooltip-matmul-container">
                {renderInteractiveVector(vectorA, aSymbolInfo, 'row')}
                <div className="tooltip-op-symbol">·</div>
                {renderInteractiveVector(vectorB, bSymbolInfo, 'column')}
                <div className="tooltip-result-line">
                    <span className="tooltip-op-symbol">=</span>
                    <span className="tooltip-result">{formatNumber(result, 4)}</span>
                </div>
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
            </div>
        );
    };

    const renderBody = () => {
        if (!tooltip.steps || tooltip.steps.length === 0) return null;
        const step = tooltip.steps[0];
        const focusIndex = tooltip.target.col;

        switch (tooltip.opType) {
            case 'matmul':
                 if (step.components) {
                    return viewMode === 'compact' ? renderMatmulCompact() : <MatMulVisualizer vectorA={step.a} vectorB={step.b} />;
                 }
                 return <div>Matmul visualization requires components data.</div>;
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
                        {renderSimpleVector(step.a, step.aSymbolInfo.base, 'row', focusIndex)}
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

    const showViewToggle = tooltip.opType === 'matmul' && tooltip.steps[0]?.components;

    return (
        <div ref={panelRef} style={panelStyle} className={`calculation-tooltip ${isCollapsed ? 'collapsed' : ''} resizable-panel`}>
            <div className="panel-header" {...dragHandleProps}>
                <span className="panel-title">{tooltip.title}</span>
                <div className="tooltip-controls">
                    {showViewToggle && (
                        <button
                            className="view-toggle-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                setViewMode(prev => prev === 'compact' ? 'detailed' : 'compact');
                            }}>
                            {viewMode === 'compact' ? '动画视图' : '交互视图'}
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
                   <div className="calculation-content-container">
                        {renderBody()}
                    </div>
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