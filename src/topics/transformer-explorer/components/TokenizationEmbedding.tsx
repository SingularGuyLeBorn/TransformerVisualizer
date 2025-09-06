// FILE: src/components/TokenizationEmbedding.tsx
import React from 'react';
import { TransformerData, HighlightState, ElementIdentifier } from '../types';
import { EmbeddingLookup } from './EmbeddingLookup';

interface TokenizationEmbeddingProps {
    data: TransformerData;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
    onComponentClick: (componentId: string) => void;
    isActive: boolean;
}

export const TokenizationEmbedding: React.FC<TokenizationEmbeddingProps> = ({ data, highlight, onElementClick, onComponentClick, isActive }) => {
    // Create a list of ElementIdentifier for the input tokens
    const inputTokensForLookup: ElementIdentifier[] = data.inputText.map((token, i) => ({
        name: "inputToken",
        row: i,
        col: -1, // Not a cell in a matrix
        tokenId: data.tokenizedInput[i],
        tokenStr: token
    }));

    const shouldBreak = (data.embeddingMatrix[0]?.length || 0) > 10;

    return (
        <div className={`diagram-component ${isActive ? 'active' : ''}`}>
            <div className="component-header" onClick={() => onComponentClick('token_embed')}>Input: Tokenization & Embedding Lookup</div>
            <div className="component-body">
                <div className="viz-step-title">1. Text is tokenized, then each Token ID looks up its vector in the Embedding Matrix</div>
                <p style={{textAlign: 'center', margin: '0 0 10px 0', fontSize: '0.9em', color: '#555'}}>Click a Token to see its corresponding row in the Embedding Matrix.</p>
                <EmbeddingLookup
                    mode="token-to-vector"
                    tokens={inputTokensForLookup}
                    embeddingMatrix={data.embeddingMatrix}
                    matrixName="embeddingMatrix"
                    outputVectors={data.inputEmbeddings}
                    outputMatrixName="inputEmbeddings"
                    highlight={highlight}
                    onElementClick={onElementClick}
                    shouldBreak={shouldBreak}
                />
            </div>
        </div>
    );
};
// END OF FILE: src/components/TokenizationEmbedding.tsx