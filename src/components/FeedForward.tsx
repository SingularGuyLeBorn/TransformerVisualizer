// FILE: src/components/FeedForward.tsx
import React from 'react';
import { FFNData, HighlightState, ElementIdentifier } from '../types';
import { Matrix } from './Matrix';
import { MATRIX_NAMES } from '../config/matrixNames';

interface FFNProps {
    baseName: string; // only used for deriving layerIndex
    data: FFNData;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier) => void;
}

export const FeedForward: React.FC<FFNProps> = ({ baseName, data, highlight, onElementClick }) => {
    const isActive = highlight.activeComponent === 'ffn';
    const layerIndex = parseInt(baseName.split('.')[1], 10);
    const LN = MATRIX_NAMES.layer(layerIndex);

    return (
        <div className={`diagram-component ${isActive ? 'active' : ''}`}>
            <div className="component-header">Feed-Forward Network</div>
            <div className="component-body">
                <p>Input (from Add & Norm)</p>
                <div className="arrow-down">↓</div>
                {/* Visualizing Z' * W1 + b1 */}
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center'}}>
                    <Matrix name={LN.W1} data={data.W1} highlight={highlight} onElementClick={onElementClick} />
                    <div className="op-symbol">+</div>
                    <Matrix name={LN.b1} data={[data.b1]} highlight={highlight} onElementClick={onElementClick} />
                    <span>→ ReLU →</span>
                    <Matrix name={LN.Activated} data={data.Activated} highlight={highlight} onElementClick={onElementClick} />
                </div>
                 {/* Visualizing H * W2 + b2 */}
                 <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px'}}>
                    <Matrix name={LN.W2} data={data.W2} highlight={highlight} onElementClick={onElementClick} />
                    <div className="op-symbol">+</div>
                    <Matrix name={LN.b2} data={[data.b2]} highlight={highlight} onElementClick={onElementClick} />
                    <div className="op-symbol">=</div>
                    <Matrix name={LN.ffn_output} data={data.Output} highlight={highlight} onElementClick={onElementClick} />
                </div>
            </div>
        </div>
    );
};
// END OF FILE: src/components/FeedForward.tsx