// FILE: src/topics/attention-variants/components/MLAViz.tsx
import React from 'react';
import { HighlightState, ElementIdentifier, AttentionData } from '../types';
import { InteractiveSymbolicMatrix } from './InteractiveSymbolicMatrix';
import { BlockMath } from 'react-katex';

interface MLAVizProps {
    data: AttentionData;
    dims: any;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
    onComponentClick: (componentId: string) => void;
}

export const MLAViz: React.FC<MLAVizProps> = ({ data, dims, highlight, onElementClick, onComponentClick }) => {
    const variantName = 'mla';
    const { d_model, d_head, seq_len, n_q_heads, d_c, d_c_prime, d_rope } = dims;

    const break_compress_q = (d_model + d_c_prime) > 15;
    const break_compress_kv = (d_model + d_c) > 15;
    const break_k_rope = (d_model + d_rope) > 15;
    const break_scores = (d_head + d_rope + seq_len + seq_len) > 15;
    const break_output = (seq_len + d_head + d_head) > 15;
    const break_final = (n_q_heads * d_head + d_model + d_model) > 15;

    const q_head_name = `${variantName}.heads.0.Q`;
    const k_head_name = `${variantName}.heads.0.K`;
    const v_head_name = `${variantName}.heads.0.V`;
    const scores_name = `${variantName}.heads.0.Scores`;
    const weights_name = `${variantName}.heads.0.Weights`;
    const output_head_name = `${variantName}.heads.0.Output`;
    const combined_name = `${variantName}.combined`;
    const final_output_name = `${variantName}.output`;

    return (
        <div className={`attention-variant-section ${highlight.activeComponent === 'mla' ? 'active-component' : ''}`} id="viz-mla">
            <div className="component-header" onClick={() => onComponentClick('mla')}>MLA (Multi-head Latent Attention) - Symbolic View</div>
            <div className="component-body">
                <div className="attention-calculation-step">
                    <div className="step-title">1. 低秩压缩 (Low-Rank Compression)</div>
                    <div className={`viz-row ${break_compress_q ? 'vertical' : ''}`}>
                        <InteractiveSymbolicMatrix name={`${variantName}.input`} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onElementClick} />
                        <BlockMath math="\times" />
                        <InteractiveSymbolicMatrix name={`${variantName}.Wc_prime`} rows={d_model} cols={d_c_prime} highlight={highlight} onSymbolClick={onElementClick} />
                        <BlockMath math="=" />
                        <InteractiveSymbolicMatrix name={`${variantName}.C_q_prime`} rows={seq_len} cols={d_c_prime} highlight={highlight} onSymbolClick={onElementClick} />
                    </div>
                    <div className={`viz-row ${break_compress_kv ? 'vertical' : ''}`}>
                        <InteractiveSymbolicMatrix name={`${variantName}.input`} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onElementClick} />
                        <BlockMath math="\times" />
                        <InteractiveSymbolicMatrix name={`${variantName}.Wc`} rows={d_model} cols={d_c} highlight={highlight} onSymbolClick={onElementClick} />
                        <BlockMath math="=" />
                        <InteractiveSymbolicMatrix name={`${variantName}.C_kv`} rows={seq_len} cols={d_c} highlight={highlight} onSymbolClick={onElementClick} />
                    </div>
                    <div className={`viz-row ${break_k_rope ? 'vertical' : ''}`}>
                        <InteractiveSymbolicMatrix name={`${variantName}.input`} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onElementClick} />
                        <BlockMath math="\times" />
                        <InteractiveSymbolicMatrix name={`${variantName}.W_k_rope`} rows={d_model} cols={d_rope} highlight={highlight} onSymbolClick={onElementClick} />
                        <BlockMath math="=" />
                        <InteractiveSymbolicMatrix name={`${variantName}.K_rope`} rows={seq_len} cols={d_rope} highlight={highlight} onSymbolClick={onElementClick} />
                    </div>
                </div>

                <div className="arrow-down">↓</div>

                <div className="attention-calculation-step">
                    <div className="step-title">2. 重建 Q, K, V (以头 0 为例)</div>
                    <p>Q, K, V 通过上投影矩阵从低维潜在向量重建。注意K的RoPE部分直接来自输入H。</p>
                    <div className={`viz-row`}>
                        <InteractiveSymbolicMatrix name={q_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onElementClick} sideLabel={true}/>
                        <InteractiveSymbolicMatrix name={k_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onElementClick} sideLabel={true}/>
                        <InteractiveSymbolicMatrix name={v_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onElementClick} sideLabel={true}/>
                    </div>
                </div>

                <div className="arrow-down">↓</div>

                <div className="attention-calculation-step">
                    <div className="step-title">3. 计算注意力分数 (头 0)</div>
                    <div className={`viz-row ${break_scores ? 'vertical' : ''}`}>
                        <InteractiveSymbolicMatrix name={q_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onElementClick} />
                        <BlockMath math="\times" />
                        <InteractiveSymbolicMatrix name={k_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onElementClick} transpose={true}/>
                        <BlockMath math="=" />
                        <InteractiveSymbolicMatrix name={scores_name} rows={seq_len} cols={seq_len} highlight={highlight} onSymbolClick={onElementClick} />
                    </div>
                    <div className="arrow-down"><BlockMath math="\xrightarrow{\text{Softmax}}" /></div>
                    <InteractiveSymbolicMatrix name={weights_name} rows={seq_len} cols={seq_len} highlight={highlight} onSymbolClick={onElementClick} sideLabel={true}/>
                </div>

                <div className="arrow-down">↓</div>

                <div className="attention-calculation-step">
                    <div className="step-title">4. 加权求和 (头 0)</div>
                    <div className={`viz-row ${break_output ? 'vertical' : ''}`}>
                        <InteractiveSymbolicMatrix name={weights_name} rows={seq_len} cols={seq_len} highlight={highlight} onSymbolClick={onElementClick} />
                        <BlockMath math="\times" />
                        <InteractiveSymbolicMatrix name={v_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onElementClick} />
                        <BlockMath math="=" />
                        <InteractiveSymbolicMatrix name={output_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onElementClick} />
                    </div>
                </div>

                <div className="arrow-down">↓</div>

                <div className="attention-calculation-step">
                    <div className="step-title">5. 合并与最终投影</div>
                    <div className={`viz-row ${break_final ? 'vertical' : ''}`}>
                        <InteractiveSymbolicMatrix name={combined_name} rows={seq_len} cols={n_q_heads * d_head} highlight={highlight} onSymbolClick={onElementClick} />
                        <BlockMath math="\times" />
                        <InteractiveSymbolicMatrix name={`${variantName}.wo`} rows={n_q_heads * d_head} cols={d_model} highlight={highlight} onSymbolClick={onElementClick} />
                        <BlockMath math="=" />
                        <InteractiveSymbolicMatrix name={final_output_name} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onElementClick} />
                    </div>
                </div>
            </div>
        </div>
    );
};
// END OF FILE: src/topics/attention-variants/components/MLAViz.tsx