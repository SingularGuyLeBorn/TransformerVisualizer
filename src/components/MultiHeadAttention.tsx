// FILE: src/components/MultiHeadAttention.tsx
import React from 'react';
import { MultiHeadAttentionData, HighlightState, ElementIdentifier } from '../types';
import { Matrix } from './Matrix';
import { InlineMath } from 'react-katex';
import { MATRIX_NAMES } from '../config/matrixNames';
import { ElementwiseOperation } from './ElementwiseOperation';

interface MHAProps {
    baseName: string;
    data: MultiHeadAttentionData;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier) => void;
    onComponentClick: (componentId: string) => void;
}

export const MultiHeadAttention: React.FC<MHAProps> = ({ baseName, data, highlight, onElementClick, onComponentClick }) => {
    const headData = data.heads[0];
    const headBaseName = `${baseName}.h0`;
    const isActive = highlight.activeComponent === 'mha';

    const layerIndex = parseInt(baseName.split('.')[1], 10);
    const headIndex = 0; // Visualizing head 0
    const LN = MATRIX_NAMES.layer(layerIndex);
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
    const wqCols = headData.Wq[0]?.length || 0;
    const qCols = headData.Q[0]?.length || 0;
    const breakQ = wqCols > 15 || qCols > 15 || (wqCols + qCols > 15);

    const wkCols = headData.Wk[0]?.length || 0;
    const kCols = headData.K[0]?.length || 0;
    const breakK = wkCols > 15 || kCols > 15 || (wkCols + kCols > 15);

    const wvCols = headData.Wv[0]?.length || 0;
    const vCols = headData.V[0]?.length || 0;
    const breakV = wvCols > 15 || vCols > 15 || (wvCols + vCols > 15);

    const kTransposedCols = headData.K.length;
    const breakScores = qCols > 15 || kTransposedCols > 15 || (qCols + kTransposedCols > 15);

    const attnWeightsCols = headData.AttentionWeights[0]?.length || 0;
    const breakHeadOutput = attnWeightsCols > 15 || vCols > 15 || (attnWeightsCols + vCols > 15);


    return (
        <div className={`diagram-component ${isActive ? 'active' : ''}`}>
            <div className="component-header" onClick={() => onComponentClick('mha')}>Multi-Head Attention</div>
            <div className="component-body">

                <div className="viz-formula-group">
                    <div className="viz-step-title">1. Generate Q, K, V (Head 1)</div>
                    {breakQ ? (
                        <>
                            <div className="viz-formula-row">
                               <span>(Input) ×</span>
                               <Matrix name={`${headBaseName}.Wq`} data={headData.Wq} highlight={highlight} onElementClick={onElementClick} />
                            </div>
                            <div className="arrow-down">=</div>
                            <div className="viz-formula-row">
                               <Matrix name={`${headBaseName}.Q`} data={headData.Q} highlight={highlight} onElementClick={onElementClick} />
                            </div>
                        </>
                    ) : (
                        <div className="viz-formula-row">
                           <span>(Input) ×</span>
                           <Matrix name={`${headBaseName}.Wq`} data={headData.Wq} highlight={highlight} onElementClick={onElementClick} />
                           <span>=</span>
                           <Matrix name={`${headBaseName}.Q`} data={headData.Q} highlight={highlight} onElementClick={onElementClick} />
                        </div>
                    )}
                     {breakK ? (
                        <>
                             <div className="viz-formula-row">
                               <span>(Input) ×</span>
                               <Matrix name={`${headBaseName}.Wk`} data={headData.Wk} highlight={highlight} onElementClick={onElementClick} />
                            </div>
                            <div className="arrow-down">=</div>
                            <div className="viz-formula-row">
                               <Matrix name={`${headBaseName}.K`} data={headData.K} highlight={highlight} onElementClick={onElementClick} />
                            </div>
                        </>
                    ) : (
                        <div className="viz-formula-row">
                           <span>(Input) ×</span>
                           <Matrix name={`${headBaseName}.Wk`} data={headData.Wk} highlight={highlight} onElementClick={onElementClick} />
                            <span>=</span>
                           <Matrix name={`${headBaseName}.K`} data={headData.K} highlight={highlight} onElementClick={onElementClick} />
                        </div>
                    )}
                     {breakV ? (
                        <>
                            <div className="viz-formula-row">
                               <span>(Input) ×</span>
                               <Matrix name={`${headBaseName}.Wv`} data={headData.Wv} highlight={highlight} onElementClick={onElementClick} />
                            </div>
                            <div className="arrow-down">=</div>
                            <div className="viz-formula-row">
                               <Matrix name={`${headBaseName}.V`} data={headData.V} highlight={highlight} onElementClick={onElementClick} />
                            </div>
                        </>
                    ) : (
                        <div className="viz-formula-row">
                           <span>(Input) ×</span>
                           <Matrix name={`${headBaseName}.Wv`} data={headData.Wv} highlight={highlight} onElementClick={onElementClick} />
                            <span>=</span>
                           <Matrix name={`${headBaseName}.V`} data={headData.V} highlight={highlight} onElementClick={onElementClick} />
                        </div>
                    )}
                </div>

                <div className="arrow-down">↓</div>

                <div className="viz-formula-group">
                    <div className="viz-step-title">2. Scaled Dot-Product Attention (Head 1)</div>
                    {breakScores ? (
                        <>
                             <div className="viz-formula-row">
                                <Matrix name={`${headBaseName}.Q`} data={headData.Q} highlight={highlight} onElementClick={onElementClick} />
                            </div>
                            <div className="op-symbol">×</div>
                            <div className="viz-formula-row">
                                <Matrix name={`${headBaseName}.K`} data={headData.K} highlight={highlight} onElementClick={onElementClick} isTransposed={true}/>
                            </div>
                        </>
                    ) : (
                         <div className="viz-formula-row">
                            <Matrix name={`${headBaseName}.Q`} data={headData.Q} highlight={highlight} onElementClick={onElementClick} />
                            <InlineMath math="\times" />
                            <Matrix name={`${headBaseName}.K`} data={headData.K} highlight={highlight} onElementClick={onElementClick} isTransposed={true}/>
                        </div>
                    )}
                    <div className="arrow-down">=</div>
                    <div className="viz-formula-row">
                        <Matrix name={`${headBaseName}.Scores`} data={headData.Scores} highlight={highlight} onElementClick={onElementClick}/>
                    </div>

                    <div className="arrow-down"><InlineMath math="\xrightarrow{\text{Scale by } / \sqrt{d_k}}" /></div>
                    <div className="viz-formula-row">
                        <Matrix name={`${headBaseName}.ScaledScores`} data={headData.ScaledScores} highlight={highlight} onElementClick={onElementClick}/>
                    </div>

                    <ElementwiseOperation
                        opType="softmax"
                        inputMatrix={headData.ScaledScores}
                        outputMatrix={headData.AttentionWeights}
                        outputMatrixName={`${headBaseName}.AttentionWeights`}
                        highlight={highlight}
                        onElementClick={onElementClick}
                        layerIndex={layerIndex}
                        headIndex={headIndex}
                    />

                    <div className="viz-formula-row">
                        <Matrix name={`${headBaseName}.AttentionWeights`} data={headData.AttentionWeights} highlight={highlight} onElementClick={onElementClick}/>
                    </div>

                    {breakHeadOutput ? (
                        <>
                            <div className="viz-formula-row">
                                <Matrix name={`${headBaseName}.AttentionWeights`} data={headData.AttentionWeights} highlight={highlight} onElementClick={onElementClick}/>
                            </div>
                            <div className="op-symbol">×</div>
                            <div className="viz-formula-row">
                                <Matrix name={`${headBaseName}.V`} data={headData.V} highlight={highlight} onElementClick={onElementClick} />
                            </div>
                        </>
                    ) : (
                        <div className="viz-formula-row">
                            <Matrix name={`${headBaseName}.AttentionWeights`} data={headData.AttentionWeights} highlight={highlight} onElementClick={onElementClick}/>
                            <InlineMath math="\times" />
                            <Matrix name={`${headBaseName}.V`} data={headData.V} highlight={highlight} onElementClick={onElementClick} />
                        </div>
                    )}
                    <div className="arrow-down">=</div>
                    <div className="viz-formula-row">
                        <Matrix name={`${headBaseName}.HeadOutput`} data={headData.HeadOutput} highlight={highlight} onElementClick={onElementClick}/>
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

                     <div className="viz-formula-row">
                       <span>(Concatenated) ×</span>
                       <Matrix name={`${baseName}.Wo`} data={data.Wo} highlight={highlight} onElementClick={onElementClick} />
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
// END OF FILE: src/components/MultiHeadAttention.tsx