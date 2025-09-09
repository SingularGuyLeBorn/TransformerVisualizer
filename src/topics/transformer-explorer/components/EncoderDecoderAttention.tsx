// FILE: src/topics/transformer-explorer/components/EncoderDecoderAttention.tsx
import React from 'react';
import { MultiHeadAttentionData, HighlightState, ElementIdentifier, Matrix as MatrixType } from '../types';
import { Matrix } from './Matrix';
import { InlineMath } from 'react-katex';
import { MATRIX_NAMES } from '../config/matrixNames';

interface EncDecAttentionProps {
    baseName: string;
    data: MultiHeadAttentionData;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
    onComponentClick: (componentId: string) => void;
    decoderAddNorm1Output: MatrixType;
    finalEncoderOutput: MatrixType;
}

export const EncoderDecoderAttention: React.FC<EncDecAttentionProps> = ({ baseName, data, highlight, onElementClick, onComponentClick, decoderAddNorm1Output, finalEncoderOutput }) => {
    const layerIndex = parseInt(baseName.split('.')[1], 10);
    const headIndex = 0;
    const headData = data.heads[headIndex];
    const isActive = highlight.activeComponent === 'enc_dec_mha';
    const numHeads = data.heads.length;
    const LNd = MATRIX_NAMES.decoderLayer(layerIndex);
    const HNd_encdec = MATRIX_NAMES.encDecMhaHead(layerIndex, headIndex);

    const renderConcatHeads = () => {
        const headsToShow = [];
        headsToShow.push(<Matrix key={0} name={MATRIX_NAMES.encDecMhaHead(layerIndex, 0).HeadOutput} data={data.heads[0].HeadOutput} highlight={highlight} onElementClick={onElementClick} />);
        if (numHeads > 2) {
            headsToShow.push(<div key="ellipsis-start" className="op-symbol">...</div>);
            headsToShow.push(<Matrix key={numHeads-1} name={MATRIX_NAMES.encDecMhaHead(layerIndex, numHeads-1).HeadOutput} data={data.heads[numHeads-1].HeadOutput} highlight={highlight} onElementClick={onElementClick} />);
        } else if (numHeads === 2) {
            headsToShow.push(<Matrix key={1} name={MATRIX_NAMES.encDecMhaHead(layerIndex, 1).HeadOutput} data={data.heads[1].HeadOutput} highlight={highlight} onElementClick={onElementClick} />);
        }
        return headsToShow;
    };

    return (
        <div className={`diagram-component ${isActive ? 'active' : ''}`}>
            <div className="component-header" onClick={() => onComponentClick('enc_dec_mha')}>Encoder-Decoder Attention</div>
            <div className="component-body">
                <div className="viz-formula-group">
                    <div className="viz-step-title">1. Prepare Inputs</div>
                    <div className="viz-formula-row">
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'}}>
                            <span style={{fontWeight: 'bold'}}>Q Input (from Decoder)</span>
                            <Matrix name={MATRIX_NAMES.decoderLayer(layerIndex).add_norm_1_output} data={decoderAddNorm1Output} highlight={highlight} onElementClick={onElementClick} />
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'}}>
                            <span style={{fontWeight: 'bold'}}>K & V Input (from Encoder)</span>
                            <Matrix name={MATRIX_NAMES.finalEncoderOutput} data={finalEncoderOutput} highlight={highlight} onElementClick={onElementClick} />
                        </div>
                    </div>
                </div>

                <div className="arrow-down">↓</div>

                <div className="viz-formula-group">
                    <div className="viz-step-title">2. Generate Q, K, V (Head 0)</div>
                    <div className="viz-formula-row">
                        <span>(Q Input) ×</span>
                        <Matrix name={HNd_encdec.Wq} data={headData.Wq} highlight={highlight} onElementClick={onElementClick} />
                        <span>=</span>
                        <Matrix name={HNd_encdec.Q} data={headData.Q} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                    <div className="viz-formula-row">
                        <span>(K Input) ×</span>
                        <Matrix name={HNd_encdec.Wk} data={headData.Wk} highlight={highlight} onElementClick={onElementClick} />
                        <span>=</span>
                        <Matrix name={HNd_encdec.K} data={headData.K} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                    <div className="viz-formula-row">
                        <span>(V Input) ×</span>
                        <Matrix name={HNd_encdec.Wv} data={headData.Wv} highlight={highlight} onElementClick={onElementClick} />
                        <span>=</span>
                        <Matrix name={HNd_encdec.V} data={headData.V} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                </div>

                <div className="arrow-down">↓</div>

                <div className="viz-formula-group">
                    <div className="viz-step-title">3. Scaled Dot-Product Attention (Head 0)</div>
                    <div className="viz-formula-row">
                        <Matrix name={HNd_encdec.Q} data={headData.Q} highlight={highlight} onElementClick={onElementClick} />
                        <InlineMath math="\times" />
                        <Matrix name={HNd_encdec.K} data={headData.K} highlight={highlight} onElementClick={onElementClick} isTransposed={true}/>
                    </div>
                    <div className="arrow-down">=</div>
                    <div className="viz-formula-row">
                        <Matrix name={HNd_encdec.Scores} data={headData.Scores} highlight={highlight} onElementClick={onElementClick}/>
                    </div>
                    <div className="arrow-down"><InlineMath math="\xrightarrow{\text{Scale by } / \sqrt{d_k}}" /></div>
                    <div className="viz-formula-row">
                        <Matrix name={HNd_encdec.ScaledScores} data={headData.ScaledScores} highlight={highlight} onElementClick={onElementClick}/>
                    </div>
                    <div className="arrow-down"><InlineMath math="\xrightarrow{\text{Softmax}}" /></div>

                    <div className="viz-formula-row">
                        <Matrix name={HNd_encdec.AttentionWeights} data={headData.AttentionWeights} highlight={highlight} onElementClick={onElementClick}/>
                        <InlineMath math="\times" />
                        <Matrix name={HNd_encdec.V} data={headData.V} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                    <div className="arrow-down">=</div>
                    <div className="viz-formula-row">
                        <Matrix name={HNd_encdec.HeadOutput} data={headData.HeadOutput} highlight={highlight} onElementClick={onElementClick}/>
                    </div>
                </div>

                <div className="arrow-down">↓</div>

                <div className="viz-formula-group">
                    <div className="viz-step-title">4. Concat Heads</div>
                    <div className="viz-formula-row">
                        <InlineMath math="\text{Concat}(" />
                        {renderConcatHeads()}
                        <InlineMath math=")" />
                    </div>
                    <div className="arrow-down">=</div>
                    <div className="viz-formula-row">
                        <Matrix name={LNd.ConcatOutput_enc_dec} data={data.ConcatOutput} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                </div>

                <div className="arrow-down">↓</div>

                <div className="viz-formula-group">
                    <div className="viz-step-title">5. Final Projection</div>
                    <div className="viz-formula-row">
                        <Matrix name={LNd.ConcatOutput_enc_dec} data={data.ConcatOutput} highlight={highlight} onElementClick={onElementClick} />
                        <span className="op-symbol">×</span>
                        <Matrix name={LNd.Wo_enc_dec} data={data.Wo} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                    <div className="arrow-down">=</div>
                    <div className="viz-formula-row">
                        <Matrix name={LNd.enc_dec_mha_output} data={data.output} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                </div>
            </div>
        </div>
    );
};
// END OF FILE: src/topics/transformer-explorer/components/EncoderDecoderAttention.tsx