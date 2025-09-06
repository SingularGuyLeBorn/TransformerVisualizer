// FILE: src/components/TokenizationEmbedding.tsx
import React from 'react';
import { TransformerData, HighlightState, ElementIdentifier } from '../types';
import { Matrix } from './Matrix';
import { InlineMath } from 'react-katex';
import { Token } from './Token';

interface TokenizationEmbeddingProps {
    data: TransformerData;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier) => void;
    onComponentClick: (componentId: string) => void;
    isActive: boolean;
}

export const TokenizationEmbedding: React.FC<TokenizationEmbeddingProps> = ({ data, highlight, onElementClick, onComponentClick, isActive }) => {
    return (
        <div className={`diagram-component ${isActive ? 'active' : ''}`}>
            <div className="component-header" onClick={() => onComponentClick('token_embed')}>Input: Tokenization & Embedding Lookup</div>
            <div className="component-body">
                <div className="viz-step-title">1. Raw Text to Token IDs</div>
                 <div className="token-row">
                    {data.inputText.map((token, i) => (
                        <Token
                            key={i}
                            tokenStr={token}
                            tokenId={data.tokenizedInput[i]}
                            position={i}
                            name="inputToken"
                            highlight={highlight}
                            onElementClick={onElementClick}
                        />
                    ))}
                </div>

                <div className="arrow-down"><InlineMath math="\xrightarrow{\text{Embedding Lookup}}" /></div>
                <div className="viz-step-title">2. Use IDs to lookup vectors in Embedding Matrix</div>

                 <div className="viz-formula-row">
                     <span>(IDs)</span>
                     <div className="op-symbol" style={{margin: '0 10px'}}> <InlineMath math="\in" /></div>
                    <Matrix name="embeddingMatrix" data={data.embeddingMatrix} highlight={highlight} onElementClick={() => {}} />
                </div>
                 <div className="arrow-down"><InlineMath math="\xrightarrow{\text{Lookup}}" /></div>
                <Matrix name="inputEmbeddings" data={data.inputEmbeddings} highlight={highlight} onElementClick={onElementClick} />
            </div>
        </div>
    );
};
// END OF FILE: src/components/TokenizationEmbedding.tsx