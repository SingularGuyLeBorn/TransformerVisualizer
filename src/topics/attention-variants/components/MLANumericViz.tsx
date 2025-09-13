// FILE: src/topics/attention-variants/components/MLANumericViz.tsx
import React from 'react';
import { HighlightState, ElementIdentifier, AttentionData } from '../types';
import { Matrix } from './Matrix';
import { BlockMath } from 'react-katex';

interface MLANumericVizProps {
    data: AttentionData;
    dims: any;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
    onComponentClick: (componentId: string) => void;
}

export const MLANumericViz: React.FC<MLANumericVizProps> = ({ data, dims, highlight, onElementClick, onComponentClick }) => {
    const variantName = 'mla';
    const { d_model, d_head, seq_len, n_q_heads, d_c, d_c_prime, d_rope } = dims;

    const break_compress = (d_c_prime + d_c + d_rope) > 15;
    const break_scores = (d_head + d_rope + seq_len) > 15;
    const break_output = (seq_len + d_head) > 15;
    const break_final = (n_q_heads * d_head + d_model) > 15;

    const headData = data.mla.heads[0];

    return (
        <div className={`attention-variant-section ${highlight.activeComponent === 'mla' ? 'active-component' : ''}`} id="viz-mla">
            <div className="component-header" onClick={() => onComponentClick('mla')}>MLA (Multi-head Latent Attention) - 数值模拟</div>
            <div className="component-body">
                <div className="attention-calculation-step">
                    <div className="step-title">1. 低秩压缩 (Low-Rank Compression)</div>
                    <p>将输入H({seq_len}x{d_model})分别投影到Q和KV的低维潜在空间。</p>
                    <div className="viz-formula-group">
                        <div className={`viz-formula-row ${break_compress ? 'vertical' : ''}`}>
                            <Matrix name={`${variantName}.C_q_prime`} data={data.mla.C_q_prime} highlight={highlight} onElementClick={onElementClick} sideLabel={true} />
                            <Matrix name={`${variantName}.C_kv`} data={data.mla.C_kv} highlight={highlight} onElementClick={onElementClick} sideLabel={true}/>
                            <Matrix name={`${variantName}.K_rope`} data={data.mla.K_rope} highlight={highlight} onElementClick={onElementClick} sideLabel={true}/>
                        </div>
                    </div>
                </div>

                <div className="attention-calculation-step">
                    <div className="step-title">2. 注意力计算 (以头 0 为例)</div>
                    <div className="viz-formula-group">
                        <div className={`viz-formula-row ${break_scores ? 'vertical' : ''}`}>
                            <Matrix name={`${variantName}.heads.0.Q`} data={headData.Q} highlight={highlight} onElementClick={onElementClick} />
                            <BlockMath math="\times" />
                            <Matrix name={`${variantName}.heads.0.K`} data={headData.K} highlight={highlight} onElementClick={onElementClick} isTransposed={true}/>
                            <BlockMath math="=" />
                            <Matrix name={`${variantName}.heads.0.Scores`} data={headData.Scores} highlight={highlight} onElementClick={onElementClick}/>
                        </div>
                    </div>
                    <div className="arrow-down"><BlockMath math="\xrightarrow{\text{Softmax}}" /></div>
                    <div className="viz-formula-group">
                        <div className="viz-formula-row">
                            <Matrix name={`${variantName}.heads.0.Weights`} data={headData.Weights} highlight={highlight} onElementClick={onElementClick} sideLabel={true}/>
                        </div>
                    </div>
                    <div className="viz-formula-group">
                        <div className={`viz-formula-row ${break_output ? 'vertical' : ''}`}>
                            <Matrix name={`${variantName}.heads.0.Weights`} data={headData.Weights} highlight={highlight} onElementClick={onElementClick} />
                            <BlockMath math="\times" />
                            <Matrix name={`${variantName}.heads.0.V`} data={headData.V} highlight={highlight} onElementClick={onElementClick} />
                            <BlockMath math="=" />
                            <Matrix name={`${variantName}.heads.0.Output`} data={headData.Output} highlight={highlight} onElementClick={onElementClick} />
                        </div>
                    </div>
                </div>

                <div className="attention-calculation-step">
                    <div className="step-title">3. 合并与最终投影</div>
                    <div className="viz-formula-group">
                        <div className={`viz-formula-row ${break_final ? 'vertical' : ''}`}>
                            <Matrix name={`${variantName}.combined`} data={data.mla.CombinedOutput} highlight={highlight} onElementClick={onElementClick} />
                            <BlockMath math="\times" />
                            <Matrix name={`${variantName}.wo`} data={data.Wo} highlight={highlight} onElementClick={onElementClick} />
                            <BlockMath math="=" />
                            <Matrix name={`${variantName}.output`} data={data.mla.FinalOutput} highlight={highlight} onElementClick={onElementClick} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
// END OF FILE: src/topics/attention-variants/components/MLANumericViz.tsx