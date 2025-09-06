// FILE: src/components/EncoderDecoderAttention.tsx
import React from 'react';
import { MultiHeadAttentionData, HighlightState, ElementIdentifier } from '../types';
import { Matrix } from './Matrix';
import { InlineMath } from 'react-katex';
import { MATRIX_NAMES } from '../config/matrixNames';
import { ElementwiseOperation } from './ElementwiseOperation';

interface EncDecAttentionProps {
    baseName: string; // e.g., decoder.0.enc_dec_mha
    data: MultiHeadAttentionData;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier) => void;
    onComponentClick: (componentId: string) => void;
}

export const EncoderDecoderAttention: React.FC<EncDecAttentionProps> = ({ baseName, data, highlight, onElementClick, onComponentClick }) => {
    const layerIndex = parseInt(baseName.split('.')[1], 10);
    const headIndex = 0; // Assume we visualize head 0
    const headData = data.heads[headIndex];
    const isActive = highlight.activeComponent === 'enc_dec_mha';

    return (
        <div className={`diagram-component ${isActive ? 'active' : ''}`}>
            <div className="component-header" onClick={() => onComponentClick('enc_dec_mha')}>Encoder-Decoder Attention</div>
            <div className="component-body">
                <div className="viz-formula-group">
                    <div className="viz-step-title">1. Generate Q, K, V (Head 1)</div>
                     <div className="viz-formula-row">
                       <span>Q (from Decoder) ×</span>
                       <Matrix name={MATRIX_NAMES.encDecMhaHead(layerIndex, headIndex).Wq} data={headData.Wq} highlight={highlight} onElementClick={onElementClick} />
                       <span>=</span>
                       <Matrix name={MATRIX_NAMES.encDecMhaHead(layerIndex, headIndex).Q} data={headData.Q} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                     <div className="viz-formula-row">
                       <span>K (from Encoder) ×</span>
                       <Matrix name={MATRIX_NAMES.encDecMhaHead(layerIndex, headIndex).Wk} data={headData.Wk} highlight={highlight} onElementClick={onElementClick} />
                        <span>=</span>
                       <Matrix name={MATRIX_NAMES.encDecMhaHead(layerIndex, headIndex).K} data={headData.K} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                     <div className="viz-formula-row">
                       <span>V (from Encoder) ×</span>
                       <Matrix name={MATRIX_NAMES.encDecMhaHead(layerIndex, headIndex).Wv} data={headData.Wv} highlight={highlight} onElementClick={onElementClick} />
                        <span>=</span>
                       <Matrix name={MATRIX_NAMES.encDecMhaHead(layerIndex, headIndex).V} data={headData.V} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                </div>

                <div className="arrow-down">↓</div>

                <div className="viz-formula-group">
                    <div className="viz-step-title">2. Scaled Dot-Product Attention (Head 1)</div>
                     <div className="viz-formula-row">
                        <Matrix name={MATRIX_NAMES.encDecMhaHead(layerIndex, headIndex).Q} data={headData.Q} highlight={highlight} onElementClick={onElementClick} />
                        <InlineMath math="\times" />
                        <Matrix name={MATRIX_NAMES.encDecMhaHead(layerIndex, headIndex).K} data={headData.K} highlight={highlight} onElementClick={onElementClick} isTransposed={true}/>
                    </div>
                    <div className="arrow-down">=</div>
                    <div className="viz-formula-row">
                         <Matrix name={MATRIX_NAMES.encDecMhaHead(layerIndex, headIndex).Scores} data={headData.Scores} highlight={highlight} onElementClick={onElementClick}/>
                    </div>
                    <div className="arrow-down"><InlineMath math="\xrightarrow{\text{Scale by } / \sqrt{d_k}}" /></div>
                    <div className="viz-formula-row">
                         <Matrix name={MATRIX_NAMES.encDecMhaHead(layerIndex, headIndex).ScaledScores} data={headData.ScaledScores} highlight={highlight} onElementClick={onElementClick}/>
                    </div>

                    <ElementwiseOperation
                        opType="softmax"
                        inputMatrix={headData.ScaledScores}
                        outputMatrix={headData.AttentionWeights}
                        outputMatrixName={MATRIX_NAMES.encDecMhaHead(layerIndex, headIndex).AttentionWeights}
                        highlight={highlight}
                        onElementClick={onElementClick}
                        layerIndex={layerIndex}
                        headIndex={headIndex}
                    />

                    <div className="viz-formula-row">
                         <Matrix name={MATRIX_NAMES.encDecMhaHead(layerIndex, headIndex).AttentionWeights} data={headData.AttentionWeights} highlight={highlight} onElementClick={onElementClick}/>
                    </div>

                    <div className="viz-formula-row">
                        <Matrix name={MATRIX_NAMES.encDecMhaHead(layerIndex, headIndex).AttentionWeights} data={headData.AttentionWeights} highlight={highlight} onElementClick={onElementClick}/>
                        <InlineMath math="\times" />
                        <Matrix name={MATRIX_NAMES.encDecMhaHead(layerIndex, headIndex).V} data={headData.V} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                     <div className="arrow-down">=</div>
                    <div className="viz-formula-row">
                         <Matrix name={MATRIX_NAMES.encDecMhaHead(layerIndex, headIndex).HeadOutput} data={headData.HeadOutput} highlight={highlight} onElementClick={onElementClick}/>
                    </div>
                </div>

                <div className="arrow-down">↓</div>

                <div className="viz-formula-group">
                    <div className="viz-step-title">3. Concat & Final Projection</div>
                     <div className="viz-formula-row">
                       <span>(Concatenated) ×</span>
                       <Matrix name={MATRIX_NAMES.decoderLayer(layerIndex).Wo_enc_dec} data={data.Wo} highlight={highlight} onElementClick={onElementClick} />
                     </div>
                     <div className="arrow-down">=</div>
                     <div className="viz-formula-row">
                       <Matrix name={MATRIX_NAMES.decoderLayer(layerIndex).enc_dec_mha_output} data={data.output} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                </div>
            </div>
        </div>
    );
};
// END OF FILE: src/components/EncoderDecoderAttention.tsx