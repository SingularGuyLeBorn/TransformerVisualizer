/* START OF FILE: src/components/FeedForward.tsx */
// FILE: src/components/FeedForward.tsx
import React from 'react';
import { FFNData, HighlightState, ElementIdentifier } from '../types';
import { Matrix } from './Matrix';
import { InlineMath } from 'react-katex';

interface FFNProps {
    baseName: string;
    data: FFNData;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier) => void;
}

export const FeedForward: React.FC<FFNProps> = ({ baseName, data, highlight, onElementClick }) => {
    return (
        <div className="diagram-component">
            <div className="component-header">Feed-Forward Network</div>
            <div className="component-body">
                <p>Input (from Add & Norm)</p>
                <div className="arrow-down">↓</div>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center'}}>
                    <span>Linear 1 & ReLU →</span>
                    <Matrix name={`${baseName}.W1`} data={data.W1} highlight={highlight} onElementClick={onElementClick} />
                    <Matrix name={`${baseName}.Activated`} data={data.Activated} highlight={highlight} onElementClick={onElementClick} />
                </div>
                 <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px'}}>
                    <span>Linear 2 →</span>
                    <Matrix name={`${baseName}.W2`} data={data.W2} highlight={highlight} onElementClick={onElementClick} />
                    <Matrix name={`${baseName}.Output`} data={data.Output} highlight={highlight} onElementClick={onElementClick} />
                </div>
            </div>
        </div>
    );
};
// END OF FILE: src/components/FeedForward.tsx
/* END OF FILE: src/components/FeedForward.tsx */