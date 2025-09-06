// FILE: src/components/Decoding.tsx
import React from 'react';
import { TransformerData, HighlightState, ElementIdentifier } from '../types';
import { Matrix } from './Matrix';
import { InlineMath } from 'react-katex';
import { EmbeddingLookup } from './EmbeddingLookup';

interface DecodingProps {
    data: TransformerData;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier) => void;
    onComponentClick: (componentId: string) => void;
    isActive: boolean;
}

export const Decoding: React.FC<DecodingProps> = ({ data, highlight, onElementClick, onComponentClick, isActive }) => {
    // Create a list of ElementIdentifier for the output tokens
    const outputTokensForLookup: ElementIdentifier[] = data.outputText.map((token, i) => {
        const correspondingProbRow = data.outputProbabilities[i];
        const maxProb = Math.max(...correspondingProbRow);
        return {
            name: "outputToken",
            row: i,
            col: -1, // Not a cell in a matrix
            tokenId: data.decodedTokens[i],
            tokenStr: token,
            probValue: maxProb
        };
    });

    return (
        <div className={`diagram-component ${isActive ? 'active' : ''}`}>
            <div className="component-header" onClick={() => onComponentClick('decoding')}>Output: Decoding Probabilities to Text</div>
            <div className="component-body">

                <div className="decoding-step">
                    <div className="viz-step-title">1. Find Index of Max Probability per Row (Argmax)</div>
                    <p style={{textAlign: 'center', margin: '0 0 10px 0', fontSize: '0.9em', color: '#555'}}>Click a row in the probability matrix to see which token it generates.</p>
                     <Matrix name="outputProbabilities" data={data.outputProbabilities} highlight={highlight} onElementClick={onElementClick} />
                </div>

                <div className="arrow-down">↓</div>

                <div className="decoding-step">
                     <div className="viz-step-title">2. Use Token IDs to Lookup Text from Vocabulary</div>
                     <EmbeddingLookup
                        mode="id-to-token"
                        tokens={outputTokensForLookup}
                        embeddingMatrix={data.embeddingMatrix}
                        vocab={data.vocab}
                        matrixName="embeddingMatrix"
                        highlight={highlight}
                        onElementClick={onElementClick}
                     />
                </div>

            </div>
        </div>
    );
};
// END OF FILE: src/components/Decoding.tsx