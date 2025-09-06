// FILE: src/components/CalculationTooltip.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TooltipState, CalculationComponent } from '../types';

interface CalculationTooltipProps {
  tooltip: TooltipState;
  onClose: () => void;
}

const renderVector = (vec: number[], type: 'source' | 'target' | 'none') => {
    return (
        <div className="tooltip-vector">
            {vec.map((val, i) => (
                <span key={i} className={`tooltip-element ${type}`}>{val.toFixed(4)}</span>
            ))}
        </div>
    );
};

const renderCalculationDetail = (opType: 'matmul' | 'add' | 'info', components: CalculationComponent[], result: number) => {
    if (!components || components.length === 0) return null;

    let equation: React.ReactNode;
    let title: string;

    if (opType === 'matmul') {
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
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        setIsCollapsed(false); // Expand tooltip whenever it changes
    }, [tooltip]);

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
                        <div key={index}>
                            <div className="tooltip-step">
                                {renderVector(step.a, 'source')}
                                <span className="tooltip-op">{step.op}</span>
                                {renderVector(step.b, 'source')}
                                <span className="tooltip-op">=</span>
                                <span className="tooltip-result">{step.result.toFixed(2)}</span>
                            </div>
                            {renderCalculationDetail(tooltip.opType, step.components || [], step.result)}
                        </div>
                    ))}
                    {tooltip.opType === 'matmul' &&
                        <p className="tooltip-explanation">
                            Showing dot product of row {tooltip.target.row} from the first matrix and column {tooltip.target.col} from the second.
                        </p>
                    }
                    {tooltip.opType === 'add' &&
                        <p className="tooltip-explanation">
                            Showing element-wise addition for position ({tooltip.target.row}, {tooltip.target.col}).
                        </p>
                    }
                </div>
            </div>
        </div>
    );
};
// END OF FILE: src/components/CalculationTooltip.tsx