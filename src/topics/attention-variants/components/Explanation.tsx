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
    const { d_head, d_model, seq_len } = dims;

    const q_head_name = `${variant}.heads.0.Q`;
    const k_head_name = `${variant}.heads.0.K`;
    const v_head_name = `${variant}.heads.0.V`;
    const scores_name = `${variant}.heads.0.Scores`;
    const weights_name = `${variant}.heads.0.Weights`;
    const output_head_name = `${variant}.heads.0.Output`;

    // Layout breaking rules for explanation column (threshold = 8)
    const break_qkv_proj = (d_model + d_head + d_head) > 8;
    const break_scores = (d_head + seq_len + seq_len) > 8;
    const break_output = (seq_len + d_head + d_head) > 8;
    const break_final = (d_model + d_model + d_model) > 8;

    return (
      <>
        <div className="attention-calculation-step">
          <div className="step-title">1. 线性投影与多头拆分</div>
          <p>
              输入 <InlineMath math="H"/> 乘以权重矩阵 <InlineMath math="W"/> 生成Q, K, V。在MHA中，每个头都有独立的 <InlineMath math="W_{Q,h}, W_{K,h}, W_{V,h}"/>。而在GQA/MQA中，<InlineMath math="W_K, W_V"/> 是分组共享或完全共享的。
          </p>
           <div className={`explanation-row ${break_qkv_proj ? 'vertical' : ''}`}>
               <InteractiveSymbolicMatrix name={`${variant}.input`} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onSymbolClick} />
               <BlockMath math="\\times" />
               <InteractiveSymbolicMatrix name={`${variant}.wq.0`} rows={d_model} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
               <BlockMath math="=" />
               <InteractiveSymbolicMatrix name={q_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
            </div>
             <div className={`explanation-row ${break_qkv_proj ? 'vertical' : ''}`}>
               <InteractiveSymbolicMatrix name={`${variant}.input`} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onSymbolClick} />
               <BlockMath math="\\times" />
               <InteractiveSymbolicMatrix name={`${variant}.wk.0`} rows={d_model} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
               <BlockMath math="=" />
               <InteractiveSymbolicMatrix name={k_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
            </div>
        </div>

        <div className="attention-calculation-step">
          <div className="step-title">2. 计算注意力分数 (Scaled Dot-Product)</div>
          <BlockMath math={`\\text{Scores}_h = Q_h K_{\\text{group}(h)}^T`} />
           <div className={`explanation-row ${break_scores ? 'vertical' : ''}`}>
                <InteractiveSymbolicMatrix name={q_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
                <BlockMath math="\\times" />
                <InteractiveSymbolicMatrix name={k_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} transpose={true} />
                <BlockMath math="=" />
                <InteractiveSymbolicMatrix name={scores_name} rows={seq_len} cols={seq_len} highlight={highlight} onSymbolClick={onSymbolClick} />
           </div>
           <BlockMath math={`A_h = \\text{Softmax}\\left(\\frac{\\text{Scores}_h}{\\sqrt{d_{\\text{head}}}}\\right)`} />
        </div>

        <div className="attention-calculation-step">
            <div className="step-title">3. 加权求和得到单头输出</div>
             <div className={`explanation-row ${break_output ? 'vertical' : ''}`}>
                  <InteractiveSymbolicMatrix name={weights_name} rows={seq_len} cols={seq_len} highlight={highlight} onSymbolClick={onSymbolClick} />
                  <BlockMath math="\\times" />
                  <InteractiveSymbolicMatrix name={v_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
                  <BlockMath math="=" />
                  <InteractiveSymbolicMatrix name={output_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
             </div>
        </div>

        <div className="attention-calculation-step">
            <div className="step-title">4. 合并与最终投影</div>
            <BlockMath math={`\\text{Output} = \\text{Concat}(\\text{head}_0, ..., \\text{head}_{N_q-1}) W_O`} />
            <div className={`explanation-row ${break_final ? 'vertical' : ''}`}>
                <InteractiveSymbolicMatrix name={`${variant}.combined`} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onSymbolClick} />
                <BlockMath math="\\times" />
                <InteractiveSymbolicMatrix name={`${variant}.wo`} rows={d_model} cols={d_model} highlight={highlight} onSymbolClick={onSymbolClick} />
                <BlockMath math="=" />
                <InteractiveSymbolicMatrix name={`${variant}.output`} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onSymbolClick} />
            </div>
        </div>
      </>
    )
}

export const Explanation: React.FC<ExplanationProps> = ({ dims, highlight, onSymbolClick }) => {
  const { n_q_heads, n_kv_heads } = dims;

  return (
    <div>
        <div className="attention-variant-section">
            <div className="component-header">MHA (Multi-Head Attention)</div>
            <div className="component-body">
                <p>{`每个查询头都有独立的K/V头 ($N_q=${n_q_heads}, N_{kv}=${n_q_heads}$)。`}</p>
                {renderVariantExplanation('mha', dims, highlight, onSymbolClick)}
            </div>
        </div>
        <div className="attention-variant-section">
            <div className="component-header">GQA (Grouped-Query Attention)</div>
            <div className="component-body">
                <p>{`查询头被分成 ${n_kv_heads} 组，每组共享一个K/V头 ($N_q=${n_q_heads}, N_{kv}=${n_kv_heads}$)。`}</p>
                {renderVariantExplanation('gqa', dims, highlight, onSymbolClick)}
            </div>
        </div>
        <div className="attention-variant-section">
            <div className="component-header">MQA (Multi-Query Attention)</div>
            <div className="component-body">
                <p>{`所有查询头共享唯一的K/V头 ($N_q=${n_q_heads}, N_{kv}=1$ )。`}</p>
                {renderVariantExplanation('mqa', dims, highlight, onSymbolClick)}
            </div>
        </div>
    </div>
  );
};
// END OF FILE: src/topics/attention-variants/components/Explanation.tsx