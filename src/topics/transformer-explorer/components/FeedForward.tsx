// FILE: src/topics/transformer-explorer/components/FeedForward.tsx
import React from 'react';
import { FFNData, HighlightState, ElementIdentifier, Matrix as MatrixType } from '../types';
import { Matrix } from './Matrix';
import { MATRIX_NAMES } from '../config/matrixNames';
import { InlineMath } from 'react-katex';

interface FFNProps {
    baseName: string;
    input: MatrixType;
    inputName: string;
    data: FFNData;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
    onComponentClick: (componentId: string) => void;
}

export const FeedForward: React.FC<FFNProps> = ({ baseName, input, inputName, data, highlight, onElementClick, onComponentClick }) => {
    const isEncoder = baseName.includes('encoder');
    const componentId = isEncoder ? 'ffn' : 'ffn_dec';
    const isActive = highlight.activeComponent === componentId;
    const layerIndex = parseInt(baseName.split('.')[1], 10);
    const LN = isEncoder ? MATRIX_NAMES.layer(layerIndex) : MATRIX_NAMES.decoderLayer(layerIndex);

    // --- Layout Breaking Logic ---
    const inputCols1 = input[0]?.length || 0;
    const w1Cols = data.W1[0]?.length || 0;
    const breakStep1 = inputCols1 > 8 || w1Cols > 8 || (inputCols1 + w1Cols > 15);

    const activatedCols = data.Activated[0]?.length || 0;
    const w2Cols = data.W2[0]?.length || 0;
    const breakStep2 = activatedCols > 8 || w2Cols > 8 || (activatedCols + w2Cols > 15);

    return (
        <div className={`diagram-component ${isActive ? 'active' : ''}`}>
            <div className="component-header" onClick={() => onComponentClick(componentId)}>Feed-Forward Network</div>
            <div className="component-body">
                <div className="viz-formula-group">
                    <div className="viz-step-title">1. First Linear Layer & ReLU</div>
                     <div className={`viz-formula-row ${breakStep1 ? 'vertical' : ''}`}>
                         <Matrix name={inputName} data={input} highlight={highlight} onElementClick={onElementClick} />
                         <span className="op-symbol">×</span>
                         <Matrix name={LN.W1} data={data.W1} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                    <div className="arrow-down">+</div>
                    <div className="viz-formula-row">
                         <Matrix name={LN.b1} data={[data.b1]} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                    <div className="arrow-down">=</div>
                    <div className="viz-formula-row">
                         <Matrix name={LN.Intermediate} data={data.Intermediate} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                    {/* [REMOVED] ElementwiseOperation for ReLU is now handled in tooltip */}
                    <div className="arrow-down"><InlineMath math="\xrightarrow{\text{ReLU}}" /></div>
                    <div className="viz-formula-row">
                         <Matrix name={LN.Activated} data={data.Activated} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                </div>

                <div className="arrow-down">↓</div>

                <div className="viz-formula-group">
                    <div className="viz-step-title">2. Second Linear Layer</div>
                    <div className={`viz-formula-row ${breakStep2 ? 'vertical' : ''}`}>
                        <Matrix name={LN.Activated} data={data.Activated} highlight={highlight} onElementClick={onElementClick} />
                        <span className="op-symbol">×</span>
                        <Matrix name={LN.W2} data={data.W2} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                    <div className="arrow-down">+</div>
                    <div className="viz-formula-row">
                         <Matrix name={LN.b2} data={[data.b2]} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                    <div className="arrow-down">=</div>
                    <div className="viz-formula-row">
                        <Matrix name={LN.ffn_output} data={data.Output} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                </div>
            </div>
        </div>
    );
};
// END OF FILE: src/topics/transformer-explorer/components/FeedForward.tsx