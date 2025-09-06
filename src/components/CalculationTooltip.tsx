// FILE: src/components/CalculationTooltip.tsx
import React, { useRef, useEffect, useState } from 'react';
import { TooltipState, CalculationComponent, Vector, OpType } from '../types';

interface CalculationTooltipProps {
  tooltip: TooltipState;
  onClose: () => void;
}

const renderValue = (value: number | Vector) => {
    if (typeof value === 'number') {
        return <span className="tooltip-result">{value.toFixed(2)}</span>;
    }
    // Render a truncated vector
    const MAX_ITEMS = 5;
    const items = value.map((val, i) => <span key={i} className="tooltip-element">{val.toFixed(2)}</span>);
    if (value.length > MAX_ITEMS) {
        return <div className="tooltip-vector"> {items.slice(0, MAX_ITEMS)} <span className="ellipsis">...</span> </div>;
    }
    return <div className="tooltip-vector">{items}</div>;
};


const renderCalculationDetail = (opType: OpType, components: CalculationComponent[] | undefined, result: number) => {
    if (!components || components.length === 0) return null;

    let equation: React.ReactNode;
    let title: string;

    if (opType === 'matmul' || opType === 'matmul_bias') {
        title = "点积计算分解 (Dot Product Breakdown):";
        const MAX_TERMS = 4;
        const terms = components.map((comp, i) => (
            <span key={i}>
                {i > 0 && <span className="op"> + </span>}
                <span>({comp.a.toFixed(4)} <span className="op">×</span> {comp.b.toFixed(4)})</span>
            </span>
        ));

        let displayedTerms;
        if (terms.length > (MAX_TERMS * 2)) {
            displayedTerms = [
                ...terms.slice(0, MAX_TERMS),
                <span key="ellipsis" className="ellipsis"> ... </span>,
                ...terms.slice(terms.length - MAX_TERMS)
            ];
        } else {
            displayedTerms = terms;
        }

        equation = (
            <>
                {displayedTerms}
                <span> = <span className="result">{result.toFixed(2)}</span></span>
            </>
        );

    } else if (opType === 'add') {
        title = "逐元素加法 (Element-wise Addition):";
        const comp = components[0];
        equation = (
            <>
                <span>{comp.a.toFixed(4)} <span className="op">+</span> {comp.b.toFixed(4)}</span>
                <span> = <span className="result">{result.toFixed(2)}</span></span>
            </>
        );
    } else {
        // For other opTypes like 'layernorm', 'scale', etc., we don't show this specific detail view.
        return null;
    }


    return (
        <div className="tooltip-calculation-detail">
            <div className="tooltip-calc-title">{title}</div>
            <div className="tooltip-calc-equation">{equation}</div>
        </div>
    );
};

export const CalculationTooltip: React.FC<CalculationTooltipProps> = ({ tooltip, onClose }) => {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [isCollapsed, setIsCollapsed] = useState(false); // Default to expanded

    useEffect(() => {
        // When a new tooltip is generated, always start expanded.
        setIsCollapsed(false);
    }, [tooltip.target]);


    return (
        <div className={`calculation-tooltip ${isCollapsed ? 'collapsed' : ''}`} ref={tooltipRef}>
            <div className="tooltip-header">
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
                    {tooltip.steps.map((step, index) => (
                        <div key={index} className="tooltip-step-container">
                            {step.description && <div className="tooltip-step-description">{step.description}</div>}
                            <div className="tooltip-step">
                                {step.a && renderValue(step.a)}
                                <span className="tooltip-op">{step.op}</span>
                                {step.b && renderValue(step.b)}
                                <span className="tooltip-op">=</span>
                                {renderValue(step.result)}
                            </div>
                            {step.components && renderCalculationDetail(tooltip.opType, step.components, typeof step.result === 'number' ? step.result : 0)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
// END OF FILE: src/components/CalculationTooltip.tsx