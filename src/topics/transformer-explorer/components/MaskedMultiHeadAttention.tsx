// FILE: src/topics/transformer-explorer/components/MaskedMultiHeadAttention.tsx
import React from 'react';
import { MultiHeadAttentionData, HighlightState, ElementIdentifier } from '../types';
import { Matrix } from './Matrix';
import { InlineMath } from 'react-katex';
import { MATRIX_NAMES } from '../config/matrixNames';

interface MHAProps {
    baseName: string; // e.g., decoder.0.masked_mha
    data: MultiHeadAttentionData;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
    onComponentClick: (componentId: string) => void;
}

export const MaskedMultiHeadAttention: React.FC<MHAProps> = ({ baseName, data, highlight, onElementClick, onComponentClick }) => {
    const layerIndex = parseInt(baseName.split('.')[1], 10);
    const headIndex = 0; // Assume we visualize head 0
    const headData = data.heads[headIndex];
    const isActive = highlight.activeComponent === 'masked_mha';
    const LNd = MATRIX_NAMES.decoderLayer(layerIndex);
    const HNd_masked = MATRIX_NAMES.maskedMhaHead(layerIndex, headIndex);
    const numHeads = data.heads.length;

    const renderConcatHeads = () => {
        const headsToShow = [];
        headsToShow.push(<Matrix key={0} name={MATRIX_NAMES.maskedMhaHead(layerIndex, 0).HeadOutput} data={data.heads[0].HeadOutput} highlight={highlight} onElementClick={onElementClick} />);
        if (numHeads > 2) {
            headsToShow.push(<div key="ellipsis-start" className="op-symbol">...</div>);
            headsToShow.push(<Matrix key={numHeads-1} name={MATRIX_NAMES.maskedMhaHead(layerIndex, numHeads-1).HeadOutput} data={data.heads[numHeads-1].HeadOutput} highlight={highlight} onElementClick={onElementClick} />);
        } else if (numHeads === 2) {
            headsToShow.push(<Matrix key={1} name={MATRIX_NAMES.maskedMhaHead(layerIndex, 1).HeadOutput} data={data.heads[1].HeadOutput} highlight={highlight} onElementClick={onElementClick} />);
        }
        return headsToShow;
    };

    return (
        <div className={`diagram-component ${isActive ? 'active' : ''}`}>
            <div className="component-header" onClick={() => onComponentClick('masked_mha')}>Masked Multi-Head Attention</div>
            <div className="component-body">
                {/* Visualizations for Q, K, V generation */}
                <div className="viz-formula-group">
                    <div className="viz-step-title">1. Generate Q, K, V (Head 1)</div>
                    <div className="viz-formula-row">
                        <span>(Input) ×</span>
                        <Matrix name={HNd_masked.Wq} data={headData.Wq} highlight={highlight} onElementClick={onElementClick} />
                        <span>=</span>
                        <Matrix name={HNd_masked.Q} data={headData.Q} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                    <div className="viz-formula-row">
                        <span>(Input) ×</span>
                        <Matrix name={HNd_masked.Wk} data={headData.Wk} highlight={highlight} onElementClick={onElementClick} />
                        <span>=</span>
                        <Matrix name={HNd_masked.K} data={headData.K} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                    <div className="viz-formula-row">
                        <span>(Input) ×</span>
                        <Matrix name={HNd_masked.Wv} data={headData.Wv} highlight={highlight} onElementClick={onElementClick} />
                        <span>=</span>
                        <Matrix name={HNd_masked.V} data={headData.V} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                </div>

                <div className="arrow-down">↓</div>

                {/* Scaled Dot-Product Attention */}
                <div className="viz-formula-group">
                    <div className="viz-step-title">2. Scaled Dot-Product Attention (Head 1)</div>
                    <div className="viz-formula-row">
                        <Matrix name={HNd_masked.Q} data={headData.Q} highlight={highlight} onElementClick={onElementClick} />
                        <InlineMath math="\times" />
                        <Matrix name={HNd_masked.K} data={headData.K} highlight={highlight} onElementClick={onElementClick} isTransposed={true}/>
                    </div>
                    <div className="arrow-down">= (Scores)</div>
                    <div className="arrow-down" style={{fontSize: '1em', color: '#e63946', fontWeight: 'bold'}}>Apply Look-Ahead Mask</div>
                    <div className="viz-formula-row">
                        <Matrix name={HNd_masked.Scores} data={headData.Scores} highlight={highlight} onElementClick={onElementClick}/>
                    </div>

                    <div className="arrow-down"><InlineMath math="\xrightarrow{\text{Scale by } / \sqrt{d_k}}" /></div>
                    <div className="viz-formula-row">
                        <Matrix name={HNd_masked.ScaledScores} data={headData.ScaledScores} highlight={highlight} onElementClick={onElementClick}/>
                    </div>

                    {/* [REMOVED] ElementwiseOperation for Softmax is now handled in tooltip */}
                    <div className="arrow-down"><InlineMath math="\xrightarrow{\text{Softmax}}" /></div>

                    <div className="viz-formula-row">
                        <Matrix name={HNd_masked.AttentionWeights} data={headData.AttentionWeights} highlight={highlight} onElementClick={onElementClick}/>
                    </div>

                    <div className="viz-formula-row">
                        <Matrix name={HNd_masked.AttentionWeights} data={headData.AttentionWeights} highlight={highlight} onElementClick={onElementClick}/>
                        <InlineMath math="\times" />
                        <Matrix name={HNd_masked.V} data={headData.V} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                    <div className="arrow-down">=</div>
                    <div className="viz-formula-row">
                        <Matrix name={HNd_masked.HeadOutput} data={headData.HeadOutput} highlight={highlight} onElementClick={onElementClick}/>
                    </div>
                </div>

                <div className="arrow-down">↓</div>

                <div className="viz-formula-group">
                    <div className="viz-step-title">3. Concat Heads</div>
                    <div className="viz-formula-row">
                        <InlineMath math="\text{Concat}(" />
                        {renderConcatHeads()}
                        <InlineMath math=")" />
                    </div>
                    <div className="arrow-down">=</div>
                    <div className="viz-formula-row">
                        <Matrix name={LNd.ConcatOutput_masked} data={data.ConcatOutput} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                </div>

                <div className="arrow-down">↓</div>

                <div className="viz-formula-group">
                    <div className="viz-step-title">4. Final Projection</div>
                    <div className="viz-formula-row">
                        <Matrix name={LNd.ConcatOutput_masked} data={data.ConcatOutput} highlight={highlight} onElementClick={onElementClick} />
                        <span className="op-symbol">×</span>
                        <Matrix name={LNd.Wo_masked} data={data.Wo} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                    <div className="arrow-down">=</div>
                    <div className="viz-formula-row">
                        <Matrix name={LNd.masked_mha_output} data={data.output} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                </div>

            </div>
        </div>
    );
};
// END OF FILE: src/topics/transformer-explorer/components/MaskedMultiHeadAttention.tsx