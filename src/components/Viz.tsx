// FILE: src/components/Viz.tsx
import React from 'react';
import { TransformerData, HighlightState, ElementIdentifier } from '../types';
import { EncoderLayer } from './EncoderLayer';
import { Matrix } from './Matrix';
import { InlineMath } from 'react-katex';

interface VizProps {
    data: TransformerData;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier) => void;
}

export const Viz: React.FC<VizProps> = ({ data, highlight, onElementClick }) => {
    const isInputEmbedActive = highlight.activeComponent === 'input_embed';

    const cols = data.inputEmbeddings[0]?.length || 0;
    const shouldBreak = cols > 15; // Here we only need to check one since they are the same size.

    return (
        <div>
            {/* Input Embedding & Positional Encoding 组件高亮 */}
            <div className={`diagram-component ${isInputEmbedActive ? 'active' : ''}`}>
                <div className="component-header">Input Embedding & Positional Encoding</div>
                <div className="component-body">
                    {shouldBreak ? (
                         <>
                            <Matrix name="inputEmbeddings" data={data.inputEmbeddings} highlight={highlight} onElementClick={onElementClick} />
                            <div className="op-symbol">+</div>
                            <Matrix name="posEncodings" data={data.posEncodings} highlight={highlight} onElementClick={onElementClick} />
                         </>
                    ) : (
                        <div className="viz-formula-row">
                             <Matrix name="inputEmbeddings" data={data.inputEmbeddings} highlight={highlight} onElementClick={onElementClick} />
                             <div className="op-symbol">+</div>
                             <Matrix name="posEncodings" data={data.posEncodings} highlight={highlight} onElementClick={onElementClick} />
                        </div>
                    )}
                </div>
            </div>

            <div className="arrow-down">↓</div>

            {/* Encoder Input 组件高亮 */}
            <div className={`diagram-component ${isInputEmbedActive ? 'active' : ''}`}>
                <div className="component-header">Encoder Input (<InlineMath math="Z_0" />)</div>
                <div className="component-body">
                     <Matrix name="encoderInput" data={data.encoderInput} highlight={highlight} onElementClick={onElementClick} />
                </div>
            </div>

            {data.encoderLayers.map((layer, i) => (
                <EncoderLayer
                    key={i}
                    layerIndex={i}
                    data={layer}
                    highlight={highlight}
                    onElementClick={onElementClick}
                />
            ))}
        </div>
    );
};
// END OF FILE: src/components/Viz.tsx