// FILE: src/topics/attention-variants/components/Explanation.tsx
import React from 'react';
import { HighlightState, ElementIdentifier } from '../types';
import { InteractiveSymbolicMatrix } from './InteractiveSymbolicMatrix';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

interface ExplanationProps {
  dims: { n_q_heads: number, n_kv_heads: number, d_head: number, d_model: number, seq_len: number };
  highlight: HighlightState;
  onSymbolClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
}

const renderVariantExplanation = (
    variant: 'mha' | 'mqa' | 'gqa',
    dims: ExplanationProps['dims'],
    highlight: HighlightState,
    onSymbolClick: ExplanationProps['onSymbolClick']
) => {
    const { d_head, d_model, seq_len, n_q_heads } = dims;

    const q_head_name = `${variant}.heads.0.Q`;
    const k_head_name = `${variant}.heads.0.K`;
    const v_head_name = `${variant}.heads.0.V`;
    const scores_name = `${variant}.heads.0.Scores`;
    const weights_name = `${variant}.heads.0.Weights`;
    const output_head_name = `${variant}.heads.0.Output`;
    const combined_name = `${variant}.combined`;
    const final_output_name = `${variant}.output`;

    // [MODIFIED] Stricter layout breaking rules for explanation column (threshold = 8)
    const break_qkv_proj = (d_model + d_head) > 8;
    const break_scores = (d_head + seq_len) > 8;
    const break_output = (seq_len + d_head) > 8;
    const break_final = (n_q_heads * d_head + d_model) > 8;

    return (
      <>
        <div className="attention-calculation-step">
          <div className="step-title">1. 线性投影与多头拆分</div>
           <p>输入 <strong>H</strong> 乘以权重矩阵 <strong>W</strong> 生成Q, K, V。在MHA中，每个头都有独立的 <InlineMath math="W_{Q,h}, W_{K,h}, W_{V,h}"/>。而在GQA/MQA中，K, V的权重矩阵是分组共享或完全共享的。Q的权重矩阵在所有变体中始终是每个头独立的。</p>
           <div className={`explanation-row ${break_qkv_proj ? 'vertical' : ''}`}>
               <InteractiveSymbolicMatrix name={`${variant}.input`} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onSymbolClick} />
               <BlockMath math="\times" />
               <InteractiveSymbolicMatrix name={`${variant}.wq.0`} rows={d_model} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
               <BlockMath math="=" />
               <InteractiveSymbolicMatrix name={q_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
            </div>
             <div className={`explanation-row ${break_qkv_proj ? 'vertical' : ''}`}>
               <InteractiveSymbolicMatrix name={`${variant}.input`} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onSymbolClick} />
               <BlockMath math="\times" />
               <InteractiveSymbolicMatrix name={`${variant}.wk.0`} rows={d_model} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
               <BlockMath math="=" />
               <InteractiveSymbolicMatrix name={k_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
            </div>
             <div className={`explanation-row ${break_qkv_proj ? 'vertical' : ''}`}>
               <InteractiveSymbolicMatrix name={`${variant}.input`} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onSymbolClick} />
               <BlockMath math="\times" />
               <InteractiveSymbolicMatrix name={`${variant}.wv.0`} rows={d_model} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
               <BlockMath math="=" />
               <InteractiveSymbolicMatrix name={v_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
            </div>
        </div>

        <div className="attention-calculation-step">
          <div className="step-title">2. 计算注意力分数 (Scaled Dot-Product)</div>
          <p>此步骤计算每个查询向量与所有键向量的相似度。点积结果越大，表示关联性越强。除以 <InlineMath math="\sqrt{d_{head}}"/> 是为了防止梯度在训练中过小或过大，保持数值稳定性。</p>
          <BlockMath math={`\\text{Scores}_h = \\frac{Q_h K_{\\text{group}(h)}^T}{\\sqrt{d_{\\text{head}}}}`} />
           <div className={`explanation-row ${break_scores ? 'vertical' : ''}`}>
                <InteractiveSymbolicMatrix name={q_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
                <BlockMath math="\times" />
                <InteractiveSymbolicMatrix name={k_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} transpose={true} />
                <BlockMath math="=" />
                <InteractiveSymbolicMatrix name={scores_name} rows={seq_len} cols={seq_len} highlight={highlight} onSymbolClick={onSymbolClick} />
           </div>
           <p>然后，应用Softmax函数将原始分数转换为一个和为1的概率分布，即“注意力权重” <InlineMath math="A_h"/>。</p>
           <BlockMath math={`A_h = \\text{Softmax}(\\text{Scores}_h)`} />
            <InteractiveSymbolicMatrix name={weights_name} rows={seq_len} cols={seq_len} highlight={highlight} onSymbolClick={onSymbolClick} sideLabel={true} />
        </div>

        <div className="attention-calculation-step">
            <div className="step-title">3. 加权求和得到单头输出</div>
            <p>使用上一步计算出的注意力权重 <InlineMath math="A_h"/> 对值向量 <InlineMath math="V_h"/> 进行加权求和，得到融合了上下文信息的单头输出 <InlineMath math="H_h"/>。</p>
             <div className={`explanation-row ${break_output ? 'vertical' : ''}`}>
                  <InteractiveSymbolicMatrix name={weights_name} rows={seq_len} cols={seq_len} highlight={highlight} onSymbolClick={onSymbolClick} />
                  <BlockMath math="\times" />
                  <InteractiveSymbolicMatrix name={v_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
                  <BlockMath math="=" />
                  <InteractiveSymbolicMatrix name={output_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
             </div>
        </div>

        <div className="attention-calculation-step">
            <div className="step-title">4. 合并与最终投影</div>
            <p>将所有 <InlineMath math="N_q"/> 个头的输出 <InlineMath math="H_h"/> 拼接（Concatenate）起来，然后通过一个最终的线性投影矩阵 <InlineMath math="W^O"/> 将其维度变回 <InlineMath math="d_{model}"/>，得到该子层的最终输出 <InlineMath math="Z"/>。</p>
            <BlockMath math={`Z = \\text{Concat}(\\text{head}_0, ..., \\text{head}_{N_q-1}) W_O`} />
            <div className={`explanation-row ${break_final ? 'vertical' : ''}`}>
                <InteractiveSymbolicMatrix name={combined_name} rows={seq_len} cols={n_q_heads * d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
                <BlockMath math="\times" />
                <InteractiveSymbolicMatrix name={`${variant}.wo`} rows={n_q_heads * d_head} cols={d_model} highlight={highlight} onSymbolClick={onSymbolClick} />
                <BlockMath math="=" />
                <InteractiveSymbolicMatrix name={final_output_name} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onSymbolClick} />
            </div>
        </div>
      </>
    )
}

export const Explanation: React.FC<ExplanationProps> = ({ dims, highlight, onSymbolClick }) => {
  const { n_q_heads, n_kv_heads } = dims;

  return (
    <div>
        <div className="math-block">
          <h3>引言：为何需要注意力变体？</h3>
            <p>随着模型规模和上下文长度的增长，Transformer核心的<strong>多头注意力 (MHA)</strong> 在自回归生成任务中面临巨大的计算和内存挑战。瓶颈在于<strong>Key-Value (KV) Cache</strong>的体积会随着序列长度线性增长，极大地限制了大型语言模型 (LLM) 的吞吐量和长文本处理能力。</p>
            <p>为了解决这些问题，研究者们提出了各种注意力变体，旨在优化性能、降低成本。本专题将带您探索从<strong>MHA</strong>到<strong>MQA</strong>、<strong>GQA</strong>的演进之路，理解它们在KV Cache效率和模型性能之间的权衡。</p>
        </div>

        <div className="attention-variant-section">
            <div className="component-header">MHA (多头注意力)</div>
            <div className="component-body">
                <h5>设计思想：并行子空间的探索</h5>
                <p>MHA是Transformer的基石。它将单一注意力计算分解为多个并行的“头”，每个头在输入的不同表示子空间中学习。这使得模型能同时关注来自不同位置、不同方面的多种信息，极大地增强了模型的表达能力。</p>
                <p><strong>KV Cache分析</strong>: 在MHA中，每个查询头都有独立的K/V头 (<InlineMath math={`N_q=${n_q_heads}, N_{kv}=${n_q_heads}`}/>)。因此，KV Cache的大小与查询头的数量成正比，公式为：</p>
                <BlockMath math={`\\text{Cache}_{MHA} \\propto S \\times N_{q\\_heads} \\times d_{head} = S \\times d_{model}`} />
                {renderVariantExplanation('mha', dims, highlight, onSymbolClick)}
            </div>
        </div>
        <div className="attention-variant-section">
            <div className="component-header">GQA (分组查询注意力)</div>
             <div className="component-body">
                <h5>设计思想：平衡之道</h5>
                <p>GQA是MHA和MQA之间的折中方案。它将查询头分组，每组共享一对K/V头，从而在保持接近MHA性能的同时，有效减少KV Cache。</p>
                <p><strong>KV Cache分析</strong>: 在GQA中，查询头被分成 {n_kv_heads}$ 组，每组共享一个K/V头 (<InlineMath math={`N_q=${n_q_heads}, N_{kv}=${n_kv_heads}`}/>)。KV Cache的大小减少为MHA的 <InlineMath math={`${n_kv_heads}/${n_q_heads}`}/> 倍。</p>
                 <BlockMath math={`\\text{Cache}_{GQA} \\propto S \\times N_{kv\\_heads} \\times d_{head}`} />
                {renderVariantExplanation('gqa', dims, highlight, onSymbolClick)}
            </div>
        </div>
        <div className="attention-variant-section">
            <div className="component-header">MQA (多查询注意力)</div>
            <div className="component-body">
                <h5>设计思想：极致的KV共享</h5>
                <p>面对MHA高昂的KV Cache成本，MQA提出了一种极致的解决方案：让所有查询头共享<strong>同一份</strong>Key和Value。</p>
                <p><strong>KV Cache分析</strong>: 在MQA中，所有查询头共享唯一的K/V头 (<InlineMath math={`N_q=${n_q_heads}, N_{kv}=1`}/>)。这使得KV Cache的大小减少为MHA的 <InlineMath math={`1/${n_q_heads}`}/> 倍，极大地节省了内存。</p>
                 <BlockMath math={`\\text{Cache}_{MQA} \\propto S \\times 1 \\times d_{head}`} />
                {renderVariantExplanation('mqa', dims, highlight, onSymbolClick)}
            </div>
        </div>
    </div>
  );
};
// END OF FILE: src/topics/attention-variants/components/Explanation.tsx