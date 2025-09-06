// FILE: src/components/CalculationTooltip.tsx
import React, { useRef, useEffect } from 'react';
import { TooltipState } from '../types';

interface CalculationTooltipProps {
  tooltip: TooltipState;
  onClose: () => void;
}

const renderVector = (vec: number[], type: 'source' | 'target' | 'none') => {
    return (
        <div className="tooltip-vector">
            {vec.map((val, i) => (
                <span key={i} className={`tooltip-element ${type}`}>{val.toFixed(2)}</span>
            ))}
        </div>
    );
};

export const CalculationTooltip: React.FC<CalculationTooltipProps> = ({ tooltip, onClose }) => {
    const tooltipRef = useRef<HTMLDivElement>(null);

    // This effect handles closing the tooltip when clicking outside of it.
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    // Position the tooltip based on the clicked element.
    // This part is simplified; a real implementation might need more robust positioning logic.
    const positionStyle = {
        top: `50%`,
        left: `50%`,
        transform: `translate(-50%, -50%)`,
    };

    return (
        <div className="calculation-tooltip" style={positionStyle} ref={tooltipRef}>
            <div className="tooltip-header">
                <span className="tooltip-title">{tooltip.title}</span>
                <button onClick={onClose} className="tooltip-close-btn">&times;</button>
            </div>
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
    );
};
// END OF FILE: src/components/CalculationTooltip.tsx