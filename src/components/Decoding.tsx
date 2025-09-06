// FILE: src/components/Decoding.tsx
import React from 'react';
import { TransformerData, HighlightState, ElementIdentifier } from '../types';
import { Matrix } from './Matrix';
import { InlineMath } from 'react-katex';
import { Token } from './Token';

interface DecodingProps {
    data: TransformerData;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier) => void;
    isActive: boolean;
}

export const Decoding: React.FC<DecodingProps> = ({ data, highlight, onElementClick, isActive }) => {
    return (
        <div className={`diagram-component ${isActive ? 'active' : ''}`}>
            <div className="component-header">Output: Decoding Probabilities to Text</div>
            <div className="component-body">

                <div className="decoding-step">
                    <div className="viz-step-title">1. Final Probabilities (Softmax Output)</div>
                    <Matrix name="outputProbabilities" data={data.outputProbabilities} highlight={highlight} onElementClick={onElementClick} />
                </div>

                <div className="arrow-down"><InlineMath math="\xrightarrow{\text{Argmax}}" /></div>

                <div className="decoding-step">
                     <div className="viz-step-title">2. Find Index of Max Probability per Row (Predicted Token IDs)</div>
                    <div className="decoding-row">
                        <div className="decoding-matrix-wrapper">
                             <Matrix name="outputProbabilities" data={data.outputProbabilities} highlight={highlight} onElementClick={onElementClick} />
                        </div>
                        <div className="op-symbol">→</div>
                        <div className="decoding-token-wrapper">
                            <div className="token-row">
                                {data.outputText.map((token, i) => (
                                    <Token
                                        key={i}
                                        tokenStr={token}
                                        tokenId={data.decodedTokens[i]}
                                        position={i}
                                        name="outputToken"
                                        highlight={highlight}
                                        onElementClick={onElementClick}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
// END OF FILE: src/components/Decoding.tsx