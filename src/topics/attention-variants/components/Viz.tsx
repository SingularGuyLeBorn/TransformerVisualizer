// FILE: src/topics/attention-variants/components/Viz.tsx
import React from 'react';
import { AttentionData, HighlightState, ElementIdentifier, AttentionVariantData } from '../types';
import { Matrix } from './Matrix';
import { InteractiveSymbolicMatrix } from './InteractiveSymbolicMatrix';
import { InlineMath } from 'react-katex';
import { ElementwiseOperation } from './ElementwiseOperation';

interface VizProps {
  data: AttentionData;
  dims: { n_q_heads: number, n_kv_heads: number, d_head: number, d_model: number, seq_len: number };
  highlight: HighlightState;
  onElementClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
}

const AttentionVariantViz: React.FC<{
    variantName: 'mha' | 'mqa' | 'gqa';
    title: string;
    variantData: AttentionVariantData;
    commonData: { input: any; Wo: any; Wq: any; Wk: any; Wv: any };
    dims: { n_q_heads: number, n_kv_heads: number, d_head: number, d_model: number, seq_len: number };
    highlight: HighlightState;
    onElementClick: VizProps['onElementClick'];
}> = ({ variantName, title, variantData, commonData, dims, highlight, onElementClick }) => {

    const headData = variantData.heads[0];
    const { d_model, d_head, seq_len } = dims;

    // Layout breaking rules (threshold = 15)
    const break_qkv_proj = (d_model + d_head + d_head) > 15;
    const break_scores = (d_head + seq_len + seq_len) > 15;
    const break_output = (seq_len + d_head + d_head) > 15;
    const break_final = (d_model + d_model + d_model) > 15;

    const q_head_name = `${variantName}.heads.0.Q`;
    const k_head_name = `${variantName}.heads.0.K`;
    const v_head_name = `${variantName}.heads.0.V`;
    const scores_name = `${variantName}.heads.0.Scores`;
    const weights_name = `${variantName}.heads.0.Weights`;
    const output_head_name = `${variantName}.heads.0.Output`;

    // For head 0, the kv group is always 0
    const wq_name = `${variantName}.wq.0`;
    const wk_name = `${variantName}.wk.0`;

    return (
        <div className="attention-variant-section">
            <div className="component-header">{title}</div>
            <div className="component-body">

                <div className="attention-calculation-step">
                    <div className="step-title">1. 生成 Q, K, V (以头 0 为例)</div>
                     <div className={`viz-row ${break_qkv_proj ? 'vertical' : ''}`}>
                        <InteractiveSymbolicMatrix name={`${variantName}.input`} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onElementClick} isPlaceholder />
                        <Matrix name={`${variantName}.input`} data={commonData.input} highlight={highlight} onElementClick={onElementClick} />
                        <InlineMath math="\\times" />
                        <Matrix name={wq_name} data={commonData.Wq[0]} highlight={highlight} onElementClick={onElementClick} />
                        <InlineMath math="=" />
                        <Matrix name={q_head_name} data={headData.Q} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                     <div className={`viz-row ${break_qkv_proj ? 'vertical' : ''}`}>
                        <InteractiveSymbolicMatrix name={`${variantName}.input`} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onElementClick} isPlaceholder />
                        <Matrix name={`${variantName}.input`} data={commonData.input} highlight={highlight} onElementClick={onElementClick} />
                        <InlineMath math="\\times" />
                        <Matrix name={wk_name} data={commonData.Wk[0]} highlight={highlight} onElementClick={onElementClick} />
                        <InlineMath math="=" />
                        <Matrix name={k_head_name} data={headData.K} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                </div>

                <div className="arrow-down">↓</div>

                <div className="attention-calculation-step">
                    <div className="step-title">2. 计算注意力分数 (头 0)</div>
                     <div className={`viz-row ${break_scores ? 'vertical' : ''}`}>
                        <Matrix name={q_head_name} data={headData.Q} highlight={highlight} onElementClick={onElementClick} />
                        <InlineMath math="\\times" />
                        <Matrix name={k_head_name} data={headData.K} highlight={highlight} onElementClick={onElementClick} />
                        <InlineMath math="=" />
                        <Matrix name={scores_name} data={headData.Scores} highlight={highlight} onElementClick={onElementClick} />
                    </div>

                    <ElementwiseOperation
                        opType="softmax"
                        inputMatrix={headData.Scores}
                        outputMatrix={headData.Weights}
                        outputMatrixName={weights_name}
                        highlight={highlight}
                        onElementClick={onElementClick}
                        variant={variantName}
                    />
                     <Matrix name={weights_name} data={headData.Weights} highlight={highlight} onElementClick={onElementClick} />
                </div>

                <div className="arrow-down">↓</div>

                <div className="attention-calculation-step">
                    <div className="step-title">3. 加权求和 (头 0)</div>
                    <div className={`viz-row ${break_output ? 'vertical' : ''}`}>
                        <Matrix name={weights_name} data={headData.Weights} highlight={highlight} onElementClick={onElementClick} />
                        <InlineMath math="\\times" />
                        <Matrix name={v_head_name} data={headData.V} highlight={highlight} onElementClick={onElementClick} />
                        <InlineMath math="=" />
                        <Matrix name={output_head_name} data={headData.Output} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                </div>

                <div className="arrow-down">↓</div>

                <div className="attention-calculation-step">
                    <div className="step-title">4. 合并与最终投影</div>
                     <div className={`viz-row ${break_final ? 'vertical' : ''}`}>
                        <Matrix name={`${variantName}.combined`} data={variantData.CombinedOutput} highlight={highlight} onElementClick={onElementClick} />
                        <InlineMath math="\\times" />
                        <Matrix name={`${variantName}.wo`} data={commonData.Wo} highlight={highlight} onElementClick={onElementClick} />
                        <InlineMath math="=" />
                        <Matrix name={`${variantName}.output`} data={variantData.FinalOutput} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                </div>
            </div>
        </div>
    );
};


export const Viz: React.FC<VizProps> = ({ data, dims, highlight, onElementClick }) => {
  const commonData = { input: data.input, Wo: data.Wo, Wq: data.Wq, Wk: data.Wk, Wv: data.Wv };

  return (
    <div>
        <AttentionVariantViz variantName="mha" title="MHA (Multi-Head Attention)" variantData={data.mha} commonData={commonData} dims={dims} highlight={highlight} onElementClick={onElementClick} />
        <AttentionVariantViz variantName="gqa" title="GQA (Grouped-Query Attention)" variantData={data.gqa} commonData={commonData} dims={dims} highlight={highlight} onElementClick={onElementClick} />
        <AttentionVariantViz variantName="mqa" title="MQA (Multi-Query Attention)" variantData={data.mqa} commonData={commonData} dims={dims} highlight={highlight} onElementClick={onElementClick} />
    </div>
  );
};
// END OF FILE: src/topics/attention-variants/components/Viz.tsx