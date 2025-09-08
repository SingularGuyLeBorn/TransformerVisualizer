// FILE: src/topics/transformer-explorer/components/MultiHeadAttention.tsx
import React from 'react';
import { MultiHeadAttentionData, HighlightState, ElementIdentifier } from '../types';
import { Matrix } from './Matrix';
import { InlineMath } from 'react-katex';
import { MATRIX_NAMES } from '../config/matrixNames';

interface MHAProps {
    baseName: string;
    data: MultiHeadAttentionData;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
    onComponentClick: (componentId: string) => void;
}

export const MultiHeadAttention: React.FC<MHAProps> = ({ baseName, data, highlight, onElementClick, onComponentClick }) => {
    const headData = data.heads[0];
    const isActive = highlight.activeComponent === 'mha';

    const layerIndex = parseInt(baseName.split('.')[1], 10);
    const headIndex = 0; // Visualizing head 0
    const LN = MATRIX_NAMES.layer(layerIndex);
    const HNe = MATRIX_NAMES.head(layerIndex, headIndex);
    const numHeads = data.heads.length;

    const renderConcatHeads = () => {
        const headsToShow = [];
        // First head
        headsToShow.push(<Matrix key={0} name={MATRIX_NAMES.head(layerIndex, 0).HeadOutput} data={data.heads[0].HeadOutput} highlight={highlight} onElementClick={onElementClick} />);

        if (numHeads > 2) {
             // Middle ellipsis
            headsToShow.push(<div key="ellipsis-start" className="op-symbol">...</div>);
            // Last head
            headsToShow.push(<Matrix key={numHeads-1} name={MATRIX_NAMES.head(layerIndex, numHeads-1).HeadOutput} data={data.heads[numHeads-1].HeadOutput} highlight={highlight} onElementClick={onElementClick} />);
        } else if (numHeads === 2) {
            // Second head
            headsToShow.push(<Matrix key={1} name={MATRIX_NAMES.head(layerIndex, 1).HeadOutput} data={data.heads[1].HeadOutput} highlight={highlight} onElementClick={onElementClick} />);
        }
        return headsToShow;
    };


    // --- Layout Breaking Logic ---
    const inputCols = data.heads[0].Wq.length;
    const wqCols = headData.Wq[0]?.length || 0;
    const breakQ = inputCols > 8 || wqCols > 8 || (inputCols + wqCols > 15);

    const wkCols = headData.Wk[0]?.length || 0;
    const breakK = inputCols > 8 || wkCols > 8 || (inputCols + wkCols > 15);

    const wvCols = headData.Wv[0]?.length || 0;
    const breakV = inputCols > 8 || wvCols > 8 || (inputCols + wvCols > 15);

    const qCols = headData.Q[0]?.length || 0;
    const kTransposedCols = headData.K.length;
    const breakScores = qCols > 8 || kTransposedCols > 8 || (qCols + kTransposedCols > 15);

    const attnWeightsCols = headData.AttentionWeights[0]?.length || 0;
    const vCols = headData.V[0]?.length || 0;
    const breakHeadOutput = attnWeightsCols > 8 || vCols > 8 || (attnWeightsCols + vCols > 15);

    const headOutputCols = headData.HeadOutput[0]?.length || 0;
    const woCols = data.Wo[0]?.length || 0;
    const breakFinalProj = (headOutputCols * numHeads) > 8 || woCols > 8 || ((headOutputCols * numHeads) + woCols > 15);


    return (
        <div className={`diagram-component ${isActive ? 'active' : ''}`}>
            <div className="component-header" onClick={() => onComponentClick('mha')}>Multi-Head Attention</div>
            <div className="component-body">

                <div className="viz-formula-group">
                    <div className="viz-step-title">1. Generate Q, K, V (Head 1)</div>
                    <div className={`viz-formula-row ${breakQ ? 'vertical' : ''}`}>
                       <span>(Input) ×</span>
                       <Matrix name={HNe.Wq} data={headData.Wq} highlight={highlight} onElementClick={onElementClick} />
                       <span>=</span>
                       <Matrix name={HNe.Q} data={headData.Q} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                     <div className={`viz-formula-row ${breakK ? 'vertical' : ''}`}>
                       <span>(Input) ×</span>
                       <Matrix name={HNe.Wk} data={headData.Wk} highlight={highlight} onElementClick={onElementClick} />
                        <span>=</span>
                       <Matrix name={HNe.K} data={headData.K} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                     <div className={`viz-formula-row ${breakV ? 'vertical' : ''}`}>
                       <span>(Input) ×</span>
                       <Matrix name={HNe.Wv} data={headData.Wv} highlight={highlight} onElementClick={onElementClick} />
                        <span>=</span>
                       <Matrix name={HNe.V} data={headData.V} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                </div>

                <div className="arrow-down">↓</div>

                <div className="viz-formula-group">
                    <div className="viz-step-title">2. Scaled Dot-Product Attention (Head 1)</div>
                    <div className={`viz-formula-row ${breakScores ? 'vertical' : ''}`}>
                        <Matrix name={HNe.Q} data={headData.Q} highlight={highlight} onElementClick={onElementClick} />
                        <InlineMath math="\times" />
                        <Matrix name={HNe.K} data={headData.K} highlight={highlight} onElementClick={onElementClick} isTransposed={true}/>
                    </div>
                    <div className="arrow-down">=</div>
                    <div className="viz-formula-row">
                        <Matrix name={HNe.Scores} data={headData.Scores} highlight={highlight} onElementClick={onElementClick}/>
                    </div>

                    <div className="arrow-down"><InlineMath math="\xrightarrow{\text{Scale by } / \sqrt{d_k}}" /></div>
                    <div className="viz-formula-row">
                        <Matrix name={HNe.ScaledScores} data={headData.ScaledScores} highlight={highlight} onElementClick={onElementClick}/>
                    </div>
                    {/* [REMOVED] ElementwiseOperation for Softmax is now handled in tooltip */}
                    <div className="arrow-down"><InlineMath math="\xrightarrow{\text{Softmax}}" /></div>
                    <div className="viz-formula-row">
                        <Matrix name={HNe.AttentionWeights} data={headData.AttentionWeights} highlight={highlight} onElementClick={onElementClick}/>
                    </div>

                    <div className={`viz-formula-row ${breakHeadOutput ? 'vertical' : ''}`}>
                        <Matrix name={HNe.AttentionWeights} data={headData.AttentionWeights} highlight={highlight} onElementClick={onElementClick}/>
                        <InlineMath math="\times" />
                        <Matrix name={HNe.V} data={headData.V} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                    <div className="arrow-down">=</div>
                    <div className="viz-formula-row">
                        <Matrix name={HNe.HeadOutput} data={headData.HeadOutput} highlight={highlight} onElementClick={onElementClick}/>
                    </div>
                </div>

                <div className="arrow-down">↓</div>

                <div className="viz-formula-group">
                    <div className="viz-step-title">3. Concat & Final Projection</div>
                    <div className="viz-formula-row">
                       <InlineMath math="\text{Concat}(" />
                        {renderConcatHeads()}
                       <InlineMath math=")" />
                     </div>

                     <div className={`viz-formula-row ${breakFinalProj ? 'vertical' : ''}`}>
                       <span>(Concatenated) ×</span>
                       <Matrix name={LN.Wo} data={data.Wo} highlight={highlight} onElementClick={onElementClick} />
                     </div>
                     <div className="arrow-down">=</div>
                     <div className="viz-formula-row">
                       <Matrix name={LN.mha_output} data={data.output} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                </div>
            </div>
        </div>
    );
};
// END OF FILE: src/topics/transformer-explorer/components/MultiHeadAttention.tsx