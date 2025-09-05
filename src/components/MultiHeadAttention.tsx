// FILE: src/components/MultiHeadAttention.tsx
import React from 'react';
import { MultiHeadAttentionData, HighlightState, ElementIdentifier } from '../types';
import { Matrix } from './Matrix';
import { InlineMath } from 'react-katex';
import { MATRIX_NAMES } from '../config/matrixNames';

interface MHAProps {
    baseName: string;
    data: MultiHeadAttentionData;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier) => void;
}

export const MultiHeadAttention: React.FC<MHAProps> = ({ baseName, data, highlight, onElementClick }) => {
    // Simplified to show only the first head's details for clarity
    const headData = data.heads[0];
    const headBaseName = `${baseName}.h0`;
    const isActive = highlight.activeComponent === 'mha'; // 检查是否为当前激活的组件
    
    const layerIndex = parseInt(baseName.split('.')[1], 10);
    const LN = MATRIX_NAMES.layer(layerIndex);

    return (
        <div className={`diagram-component ${isActive ? 'active' : ''}`}> {/* 应用active类 */}
            <div className="component-header">Multi-Head Attention</div>
            <div className="component-body">
                <p>Input (from previous layer)</p>
                <div className="arrow-down">↓</div>

                {/* Q, K, V Generation */}
                <div className="viz-formula-row">
                   <span>Q = Z × Wq →</span>
                   <Matrix name={`${headBaseName}.Wq`} data={headData.Wq} highlight={highlight} onElementClick={onElementClick} />
                   <Matrix name={`${headBaseName}.Q`} data={headData.Q} highlight={highlight} onElementClick={onElementClick} />
                </div>
                 <div className="viz-formula-row" style={{marginTop: '10px'}}>
                   <span>K = Z × Wk →</span>
                   <Matrix name={`${headBaseName}.Wk`} data={headData.Wk} highlight={highlight} onElementClick={onElementClick} />
                   <Matrix name={`${headBaseName}.K`} data={headData.K} highlight={highlight} onElementClick={onElementClick} />
                </div>
                 <div className="viz-formula-row" style={{marginTop: '10px'}}>
                   <span>V = Z × Wv →</span>
                   <Matrix name={`${headBaseName}.Wv`} data={headData.Wv} highlight={highlight} onElementClick={onElementClick} />
                   <Matrix name={`${headBaseName}.V`} data={headData.V} highlight={highlight} onElementClick={onElementClick} />
                </div>

                <div className="arrow-down">↓</div>
                <p>Scaled Dot-Product Attention (Head 1)</p>

                {/* Step 1: Q * K^T = Scores */}
                <div className="viz-formula-row">
                    <Matrix name={`${headBaseName}.Q`} data={headData.Q} highlight={highlight} onElementClick={onElementClick} />
                    <InlineMath math="\times" />
                    <Matrix name={`${headBaseName}.K`} data={headData.K} highlight={highlight} onElementClick={onElementClick} isTransposed={true}/>
                     <InlineMath math="=" />
                    <Matrix name={`${headBaseName}.Scores`} data={headData.Scores} highlight={highlight} onElementClick={onElementClick}/>
                </div>
                
                {/* Step 2: Scale -> Softmax */}
                <div className="viz-formula-row">
                    <InlineMath math="\xrightarrow{/ \sqrt{d_k}}" />
                    <Matrix name={`${headBaseName}.ScaledScores`} data={headData.ScaledScores} highlight={highlight} onElementClick={onElementClick}/>
                    <InlineMath math="\xrightarrow{\text{softmax}}" />
                    <Matrix name={`${headBaseName}.AttentionWeights`} data={headData.AttentionWeights} highlight={highlight} onElementClick={onElementClick}/>
                </div>

                {/* Step 3: A * V = HeadOutput */}
                <div className="viz-formula-row">
                    <Matrix name={`${headBaseName}.AttentionWeights`} data={headData.AttentionWeights} highlight={highlight} onElementClick={onElementClick}/>
                    <InlineMath math="\times" />
                    <Matrix name={`${headBaseName}.V`} data={headData.V} highlight={highlight} onElementClick={onElementClick} />
                    <InlineMath math="=" />
                    <Matrix name={`${headBaseName}.HeadOutput`} data={headData.HeadOutput} highlight={highlight} onElementClick={onElementClick}/>
                </div>


                <div className="arrow-down">↓</div>
                <p>Concat & Final Projection</p>

                 <div className="viz-formula-row">
                   <Matrix name={`${headBaseName}.HeadOutput`} data={headData.HeadOutput} highlight={highlight} onElementClick={onElementClick} />
                   <InlineMath math="..." />
                   <Matrix name={`${baseName}.Wo`} data={data.Wo} highlight={highlight} onElementClick={onElementClick} />
                   <InlineMath math="=" />
                   <Matrix name={LN.mha_output} data={data.output} highlight={highlight} onElementClick={onElementClick} />
                </div>
            </div>
        </div>
    );
};
// END OF FILE: src/components/MultiHeadAttention.tsx