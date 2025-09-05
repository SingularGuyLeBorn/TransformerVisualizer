// FILE: src/components/Viz.tsx
import React from 'react';
import { TransformerData, HighlightState, ElementIdentifier } from '../types';
import { EncoderLayer } from './EncoderLayer';
import { DecoderLayer } from './DecoderLayer';
import { Matrix } from './Matrix';
import { InlineMath } from 'react-katex';

interface VizProps {
    data: TransformerData;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier) => void;
}

export const Viz: React.FC<VizProps> = ({ data, highlight, onElementClick }) => {
    const isInputEmbedActive = highlight.activeComponent === 'input_embed';
    const isOutputEmbedActive = highlight.activeComponent === 'output_embed';
    const isFinalOutputActive = highlight.activeComponent === 'final_output';

    const cols = data.inputEmbeddings[0]?.length || 0;
    const shouldBreak = cols > 15;

    return (
        <div>
            {/* --- Encoder Side --- */}
            <div className={`diagram-component ${isInputEmbedActive ? 'active' : ''}`}>
                <div className="component-header">Encoder Input & Positional Encoding</div>
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

            {/* --- Decoder Side --- */}
            <div className={`diagram-component ${isOutputEmbedActive ? 'active' : ''}`} style={{marginTop: '30px'}}>
                <div className="component-header">Decoder Input & Positional Encoding</div>
                <div className="component-body">
                     <div className="viz-formula-row">
                         <Matrix name="outputEmbeddings" data={data.outputEmbeddings} highlight={highlight} onElementClick={onElementClick} />
                         <div className="op-symbol">+</div>
                         <Matrix name="decoderPosEncodings" data={data.decoderPosEncodings} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                </div>
            </div>
            <div className="arrow-down">↓</div>
            <div className={`diagram-component ${isOutputEmbedActive ? 'active' : ''}`}>
                <div className="component-header">Decoder Input (<InlineMath math="Y_0" />)</div>
                <div className="component-body">
                     <Matrix name="decoderInput" data={data.decoderInput} highlight={highlight} onElementClick={onElementClick} />
                </div>
            </div>

            {data.decoderLayers.map((layer, i) => (
                <DecoderLayer
                    key={i}
                    layerIndex={i}
                    data={layer}
                    highlight={highlight}
                    onElementClick={onElementClick}
                />
            ))}

            {/* --- Final Output --- */}
            <div className="arrow-down">↓</div>
             <div className={`diagram-component ${isFinalOutputActive ? 'active' : ''}`}>
                <div className="component-header">Final Linear & Softmax</div>
                <div className="component-body">
                    <Matrix name="finalLinear" data={data.finalLinear} highlight={highlight} onElementClick={onElementClick} />
                    <div className="arrow-down">↓</div>
                    <Matrix name="logits" data={data.logits} highlight={highlight} onElementClick={onElementClick} />
                    <div className="arrow-down"><InlineMath math="\xrightarrow{\text{Softmax}}" /></div>
                    <Matrix name="outputProbabilities" data={data.outputProbabilities} highlight={highlight} onElementClick={onElementClick} />
                </div>
            </div>
        </div>
    );
};
// END OF FILE: src/components/Viz.tsx