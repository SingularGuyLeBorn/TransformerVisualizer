// FILE: src/topics/transformer-explorer/components/CalculationTooltip.tsx
import React, { useState, useEffect, useRef } from 'react';
import { TooltipState } from '../types';
import { useDraggableAndResizable } from '../../../hooks/useDraggableAndResizable';
import { getVisibleIndices, ELLIPSIS } from '../utils/matrixView';
import { MatMulVisualizer } from '../../../components/visualizers/MatMulVisualizer';
import { InteractiveMatMulVisualizer } from '../../../components/visualizers/InteractiveMatMulVisualizer';
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

    const renderVector = (vec: number[], symbolInfo: TooltipState['steps'][0]['aSymbolInfo'], direction: 'row' | 'column' = 'row', focusIndex: number = -1) => {
        const visibleIndices = getVisibleIndices(vec.length, focusIndex, 1, 4);

        let mathSymbol = symbolInfo.base;
        if (symbolInfo.subscript) mathSymbol += `_{${symbolInfo.subscript}}`;
        if (symbolInfo.superscript) mathSymbol += `^{${symbolInfo.superscript}}`;

        return (
            <div className="tooltip-vector-group">
                <span className="tooltip-symbol"><InlineMath>{mathSymbol}</InlineMath> =</span>
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

    const renderBody = () => {
        if (!tooltip.steps || tooltip.steps.length === 0) return null;

        return tooltip.steps.map((step, stepIndex) => {
            let content = <></>;
            const focusIndex = tooltip.target.col;

            switch(tooltip.opType) {
                case 'matmul':
                    if (step.components) {
                        return (
                             <div className="tooltip-step-container" key={stepIndex}>
                                {step.title && <h4 className="tooltip-step-title">{step.title}</h4>}
                                {viewMode === 'compact' ? (
                                    <InteractiveMatMulVisualizer
                                        vectorA={step.a}
                                        vectorB={step.b}
                                        symbolAInfo={step.aSymbolInfo}
                                        symbolBInfo={step.bSymbolInfo}
                                        result={step.result}
                                        components={step.components}
                                        hoveredComponentIndex={hoveredComponentIndex}
                                        setHoveredComponentIndex={setHoveredComponentIndex}
                                    />
                                ) : (
                                    <MatMulVisualizer vectorA={step.a} vectorB={step.b} />
                                )}
                            </div>
                        )
                    }
                    content = <div>Matmul visualization requires components data.</div>
                    break;
                case 'add':
                    content = (
                        <div className="tooltip-calculation-detail" style={{borderTop: stepIndex > 0 ? '1px solid #eee' : 'none', paddingTop: stepIndex > 0 ? '12px' : '0'}}>
                            <div className="tooltip-calc-title">逐元素加法 (Element-wise Addition):</div>
                            <div className="tooltip-calc-equation">
                                <span>{formatNumber(step.a[0], 2)} (<InlineMath>{`${step.aSymbolInfo.base}_{...}`}</InlineMath>)</span>
                                <span className="op"> + </span>
                                <span>{formatNumber(step.b[0], 2)} (<InlineMath>{`${step.bSymbolInfo.base}_{...}`}</InlineMath>)</span>
                                <span> = <span className="result">{formatNumber(step.result, 2)}</span></span>
                            </div>
                        </div>
                    );
                    break;
                case 'softmax':
                    const maxVal = Math.max(...step.a.filter(isFinite));
                    const exps = step.a.map(v => isFinite(v) ? Math.exp(v - maxVal) : 0);
                    const sumExps = exps.reduce((a, b) => a + b, 0);
                    content = (
                        <>
                            {renderVector(step.a, step.aSymbolInfo, 'row', focusIndex)}
                            <div className="tooltip-calculation-detail">
                                <div className="tooltip-calc-title">Softmax 计算分解 (for {tooltip.target.symbol}[{tooltip.target.row}, {tooltip.target.col}]):</div>
                                <div className="tooltip-calc-equation-multi">
                                    <div>1. 减去最大值 (Subtract Max for stability): <span>max(...) = {formatNumber(maxVal, 2)}</span></div>
                                    <div>2. 计算指数 (Exponentiate): <span>e^({formatNumber(step.a[tooltip.target.col], 2)} - {formatNumber(maxVal, 2)}) = {formatNumber(exps[tooltip.target.col], 4)}</span></div>
                                    <div>3. 计算所有指数之和 (Sum Exponentials): <span>Σ e^(...) = {formatNumber(sumExps, 4)}</span></div>
                                    <div>4. 归一化 (Normalize): <span>{formatNumber(exps[tooltip.target.col], 4)} / {formatNumber(sumExps, 4)} = <span className="result">{formatNumber(step.result, 4)}</span></span></div>
                                </div>
                            </div>
                        </>
                    );
                    break;
                case 'relu':
                    content = (
                        <>
                            {renderVector(step.a, step.aSymbolInfo, 'row', focusIndex)}
                            <div className="tooltip-calculation-detail">
                                <div className="tooltip-calc-title">ReLU 计算:</div>
                                <div className="tooltip-calc-equation">
                                    <span>max(0, {formatNumber(step.a[tooltip.target.col], 2)}) = <span className="result">{formatNumber(step.result, 2)}</span></span>
                                </div>
                            </div>
                        </>
                    );
                    break;
                default:
                    content = <div>未知操作类型</div>
            }
            return (
                <div className="tooltip-step-container" key={stepIndex}>
                    {step.title && <h4 className="tooltip-step-title">{step.title}</h4>}
                    {content}
                </div>
            )
        });
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
// END OF FILE: src/topics/transformer-explorer/components/CalculationTooltip.tsx