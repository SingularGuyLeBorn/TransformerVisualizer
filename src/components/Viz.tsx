// FILE: src/components/Viz.tsx
import React from 'react';
import { TransformerData, HighlightState, ElementIdentifier, TooltipState } from '../types';
import { EncoderLayer } from './EncoderLayer';
import { DecoderLayer } from './DecoderLayer';
import { Matrix } from './Matrix';
import { InlineMath } from 'react-katex';
import { TokenizationEmbedding } from './TokenizationEmbedding';
import { Decoding } from './Decoding';
import { CalculationTooltip } from './CalculationTooltip';
import { MATRIX_NAMES } from '../config/matrixNames';

interface VizProps {
    data: TransformerData;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier) => void;
    onComponentClick: (componentId: string) => void;
    tooltip: TooltipState | null;
    closeTooltip: () => void;
}

export const Viz: React.FC<VizProps> = ({ data, highlight, onElementClick, onComponentClick, tooltip, closeTooltip }) => {
    const isTokenEmbedActive = highlight.activeComponent === 'token_embed';
    const isInputEmbedActive = highlight.activeComponent === 'input_embed';
    const isOutputEmbedActive = highlight.activeComponent === 'output_embed';
    const isFinalOutputActive = highlight.activeComponent === 'final_output';
    const isDecodingActive = highlight.activeComponent === 'decoding';

    const cols = data.inputEmbeddings[0]?.length || 0;
    const shouldBreak = cols > 15;

    return (
        <div style={{ position: 'relative' }}>
            {tooltip && <CalculationTooltip tooltip={tooltip} onClose={closeTooltip} />}

            {/* --- Input Stage --- */}
            <TokenizationEmbedding
                data={data}
                highlight={highlight}
                onElementClick={onElementClick}
                onComponentClick={onComponentClick}
                isActive={isTokenEmbedActive}
            />

            <div className="arrow-down">↓</div>

            {/* --- Encoder Side --- */}
            <div className={`diagram-component ${isInputEmbedActive ? 'active' : ''}`}>
                <div className="component-header" onClick={() => onComponentClick('input_embed')}>Positional Encoding Addition</div>
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
                 <div className="component-header" onClick={() => onComponentClick('input_embed')}>Encoder Input (<InlineMath math="Z" />)</div>
                <div className="component-body">
                     <Matrix name={MATRIX_NAMES.layer(0).encoder_input} data={data.encoderInput} highlight={highlight} onElementClick={onElementClick} />
                </div>
            </div>

            {data.encoderLayers.map((layer, i) => (
                <EncoderLayer
                    key={i}
                    layerIndex={i}
                    data={layer}
                    highlight={highlight}
                    onElementClick={onElementClick}
                    onComponentClick={onComponentClick}
                />
            ))}

            {/* --- Decoder Side --- */}
            <div className={`diagram-component ${isOutputEmbedActive ? 'active' : ''}`} style={{marginTop: '30px'}}>
                <div className="component-header" onClick={() => onComponentClick('output_embed')}>Decoder Input & Positional Encoding</div>
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
                <div className="component-header" onClick={() => onComponentClick('output_embed')}>Decoder Input (<InlineMath math="Y" />)</div>
                <div className="component-body">
                     <Matrix name={MATRIX_NAMES.decoderLayer(0).decoder_input} data={data.decoderInput} highlight={highlight} onElementClick={onElementClick} />
                </div>
            </div>

            {data.decoderLayers.map((layer, i) => (
                <DecoderLayer
                    key={i}
                    layerIndex={i}
                    data={layer}
                    highlight={highlight}
                    onElementClick={onElementClick}
                    onComponentClick={onComponentClick}
                />
            ))}

            {/* --- Final Output --- */}
            <div className="arrow-down">↓</div>
             <div className={`diagram-component ${isFinalOutputActive ? 'active' : ''}`}>
                <div className="component-header" onClick={() => onComponentClick('final_output')}>Final Linear & Softmax</div>
                <div className="component-body">
                    <div className="viz-formula-row">
                         <Matrix name={MATRIX_NAMES.decoderLayer(data.decoderLayers.length - 1).add_norm_3_output} data={data.finalDecoderOutput} highlight={highlight} onElementClick={onElementClick} />
                         <div className="op-symbol">×</div>
                         <Matrix name="finalLinear" data={data.finalLinear} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                    <div className="arrow-down">= (Logits)</div>
                    <Matrix name="logits" data={data.logits} highlight={highlight} onElementClick={onElementClick} />
                    <div className="arrow-down"><InlineMath math="\xrightarrow{\text{Softmax}}" /></div>
                    <Matrix name="outputProbabilities" data={data.outputProbabilities} highlight={highlight} onElementClick={onElementClick} />
                </div>
            </div>

            {/* --- Decoding Stage --- */}
            <div className="arrow-down">↓</div>
            <Decoding
                data={data}
                highlight={highlight}
                onElementClick={onElementClick}
                onComponentClick={onComponentClick}
                isActive={isDecodingActive}
            />

        </div>
    );
};
// END OF FILE: src/components/Viz.tsx