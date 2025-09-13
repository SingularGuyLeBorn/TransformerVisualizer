// FILE: src/topics/attention-variants/components/MLASymbolicViz.tsx
import React from 'react';
import { HighlightState, ElementIdentifier } from '../types';
import { InteractiveSymbolicMatrix } from './InteractiveSymbolicMatrix';
import { BlockMath, InlineMath } from 'react-katex';

interface MLASymbolicVizProps {
    dims: any;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
    onComponentClick: (componentId: string) => void;
}

export const MLASymbolicViz: React.FC<MLASymbolicVizProps> = ({ dims, highlight, onElementClick }) => {
    const variantName = 'mla';
    const { d_model, d_head, seq_len, n_q_heads, d_c, d_c_prime, d_rope } = dims;

    const break_compress_q = (d_model + d_c_prime + d_c_prime) > 8;
    const break_compress_kv = (d_model + d_c + d_c) > 8;
    const break_k_rope = (d_model + d_rope + d_rope) > 8;
    const break_scores = (d_head + d_rope + seq_len + seq_len) > 8;
    const break_output = (seq_len + d_head + d_head) > 8;
    const break_final = (n_q_heads * d_head + d_model + d_model) > 8;

    const q_head_name = `${variantName}.heads.0.Q`;
    const k_head_name = `${variantName}.heads.0.K`;
    const v_head_name = `${variantName}.heads.0.V`;
    const scores_name = `${variantName}.heads.0.Scores`;
    const weights_name = `${variantName}.heads.0.Weights`;
    const output_head_name = `${variantName}.heads.0.Output`;
    const combined_name = `${variantName}.combined`;
    const final_output_name = `${variantName}.output`;

    return (
        <>
            <div className="explanation-subsection">
                <h5>出现原因与设计思路</h5>
                <p><strong>GQA的局限:</strong> 尽管MQA和GQA在KV Cache优化方面取得了显著进展，但它们仍受限于将原始高维KV信息直接绑定到注意力头的数量。当追求更长的上下文时，即使是GQA的KV Cache仍然可能过大。</p>
                <p><strong>低秩压缩与矩阵吸收:</strong> MLA (来自DeepSeek-V2) 是一种更激进的优化。其核心思想是：</p>
                <ul>
                    <li><strong>低秩压缩KV:</strong> MLA假设Key和Value的原始高维表示中存在大量冗余，其有效信息可以被压缩到一个低维的“潜在空间”。它通过一个下投影矩阵将每个token的 <InlineMath math="d_{model}"/> 维隐藏状态投影成一个极小的共享潜在向量 <InlineMath math="\boldsymbol{c}^{KV}"/>。KV Cache只存储这些低维向量。</li>
                    <li><strong>“矩阵吸收”实现计算效率:</strong> MLA利用矩阵乘法结合律的巧妙特性，将重建K、V所需的上投影矩阵“吸收”到Query侧的计算中，从而在推理时避免K、V的显式高维重建，直接在低维潜在空间进行部分计算。</li>
                    <li><strong>解耦RoPE兼容性:</strong> 为兼容“矩阵吸收”技巧，MLA将Q、K向量解耦为<strong>内容(Content)部分</strong>和<strong>RoPE部分</strong>。内容部分采用低秩压缩；RoPE部分则独立处理，通常采用类似MQA的共享K方式。</li>
                </ul>
            </div>
            <div className="explanation-subsection">
                <h5>交互式公式推导</h5>
                <div className="attention-calculation-step">
                    <div className="step-title">1. 低秩压缩 (Low-Rank Compression)</div>
                    <div className="viz-formula-group">
                        <div className={`viz-formula-row ${break_compress_q ? 'vertical' : ''}`}>
                            <InteractiveSymbolicMatrix name={`${variantName}.input`} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onElementClick} />
                            <BlockMath math="\times" />
                            <InteractiveSymbolicMatrix name={`${variantName}.Wc_prime`} rows={d_model} cols={d_c_prime} highlight={highlight} onSymbolClick={onElementClick} />
                            <BlockMath math="=" />
                            <InteractiveSymbolicMatrix name={`${variantName}.C_q_prime`} rows={seq_len} cols={d_c_prime} highlight={highlight} onSymbolClick={onElementClick} />
                        </div>
                    </div>
                    <div className="viz-formula-group">
                        <div className={`viz-formula-row ${break_compress_kv ? 'vertical' : ''}`}>
                            <InteractiveSymbolicMatrix name={`${variantName}.input`} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onElementClick} />
                            <BlockMath math="\times" />
                            <InteractiveSymbolicMatrix name={`${variantName}.Wc`} rows={d_model} cols={d_c} highlight={highlight} onSymbolClick={onElementClick} />
                            <BlockMath math="=" />
                            <InteractiveSymbolicMatrix name={`${variantName}.C_kv`} rows={seq_len} cols={d_c} highlight={highlight} onSymbolClick={onElementClick} />
                        </div>
                    </div>
                    <div className="viz-formula-group">
                        <div className={`viz-formula-row ${break_k_rope ? 'vertical' : ''}`}>
                            <InteractiveSymbolicMatrix name={`${variantName}.input`} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onElementClick} />
                            <BlockMath math="\times" />
                            <InteractiveSymbolicMatrix name={`${variantName}.W_k_rope`} rows={d_model} cols={d_rope} highlight={highlight} onSymbolClick={onElementClick} />
                            <BlockMath math="=" />
                            <InteractiveSymbolicMatrix name={`${variantName}.K_rope`} rows={seq_len} cols={d_rope} highlight={highlight} onSymbolClick={onElementClick} />
                        </div>
                    </div>

                    <div className="step-title">2. 重建 Q, K, V (以头 0 为例)</div>
                    <p>Q, K, V 通过上投影矩阵从低维潜在向量重建。注意K的RoPE部分直接来自输入H。</p>
                    <div className="viz-formula-group">
                        <div className={`viz-formula-row`}>
                            <InteractiveSymbolicMatrix name={q_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onElementClick} sideLabel={true}/>
                            <InteractiveSymbolicMatrix name={k_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onElementClick} sideLabel={true}/>
                            <InteractiveSymbolicMatrix name={v_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onElementClick} sideLabel={true}/>
                        </div>
                    </div>

                    <div className="step-title">3. 计算注意力分数 (头 0)</div>
                    <div className="viz-formula-group">
                        <div className={`viz-formula-row ${break_scores ? 'vertical' : ''}`}>
                            <InteractiveSymbolicMatrix name={q_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onElementClick} />
                            <BlockMath math="\times" />
                            <InteractiveSymbolicMatrix name={k_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onElementClick} transpose={true}/>
                            <BlockMath math="=" />
                            <InteractiveSymbolicMatrix name={scores_name} rows={seq_len} cols={seq_len} highlight={highlight} onSymbolClick={onElementClick} />
                        </div>
                    </div>
                    <div className="viz-formula-group">
                        <div className="arrow-down"><BlockMath math="\xrightarrow{\text{Softmax}}" /></div>
                        <div className="viz-formula-row">
                            <InteractiveSymbolicMatrix name={weights_name} rows={seq_len} cols={seq_len} highlight={highlight} onSymbolClick={onElementClick} sideLabel={true}/>
                        </div>
                    </div>

                    <div className="step-title">4. 加权求和 (头 0)</div>
                    <div className="viz-formula-group">
                        <div className={`viz-formula-row ${break_output ? 'vertical' : ''}`}>
                            <InteractiveSymbolicMatrix name={weights_name} rows={seq_len} cols={seq_len} highlight={highlight} onSymbolClick={onElementClick} />
                            <BlockMath math="\times" />
                            <InteractiveSymbolicMatrix name={v_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onElementClick} />
                            <BlockMath math="=" />
                            <InteractiveSymbolicMatrix name={output_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onElementClick} />
                        </div>
                    </div>

                    <div className="step-title">5. 合并与最终投影</div>
                    <div className="viz-formula-group">
                        <div className={`viz-formula-row ${break_final ? 'vertical' : ''}`}>
                            <InteractiveSymbolicMatrix name={combined_name} rows={seq_len} cols={n_q_heads * d_head} highlight={highlight} onSymbolClick={onElementClick} />
                            <BlockMath math="\times" />
                            <InteractiveSymbolicMatrix name={`${variantName}.wo`} rows={n_q_heads * d_head} cols={d_model} highlight={highlight} onSymbolClick={onElementClick} />
                            <BlockMath math="=" />
                            <InteractiveSymbolicMatrix name={final_output_name} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onElementClick} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
// END OF FILE: src/topics/attention-variants/components/MLASymbolicViz.tsx