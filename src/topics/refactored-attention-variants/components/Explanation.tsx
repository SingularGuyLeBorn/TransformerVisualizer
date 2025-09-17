// FILE: src/topics/refactored-attention-variants/components/Explanation.tsx
import React from 'react';
import { HighlightState, ElementIdentifier } from '../../attention-variants/types'; // Using original types
import { InteractiveSymbolicMatrix } from '../../attention-variants/components/InteractiveSymbolicMatrix'; // Reusing old symbolic matrix
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import { MLASymbolicViz } from '../../attention-variants/components/MLASymbolicViz'; // Reusing old symbolic viz

// This component is structurally identical to the original Explanation.tsx.
// The purpose is to demonstrate that the new numeric Viz component on the left
// can drive the existing symbolic explanation on the right, proving the
// highlighting and interaction logic is compatible and correctly implemented.

interface ExplanationProps {
    dims: { n_q_heads: number, n_kv_heads: number, d_head: number, d_model: number, seq_len: number, d_c: number, d_c_prime: number, d_rope: number };
    highlight: HighlightState;
    onSymbolClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
    onComponentClick: (componentId: string) => void;
    refs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
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

    return (
        <div className="attention-calculation-step">
            <div className="step-title">1. 线性投影与多头拆分</div>
            <p>输入张量 <strong>H</strong> 通过乘以三个独立的、可学习的权重矩阵 <strong>W</strong>，分别被线性投影到三个不同的子空间，生成查询 (Query, <strong>Q</strong>)、键 (Key, <strong>K</strong>) 和值 (Value, <strong>V</strong>) 矩阵。</p>
            <div className="viz-formula-group">
                <div className="viz-formula-row vertical">
                    <InteractiveSymbolicMatrix name={`${variant}.input`} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onSymbolClick} />
                    <BlockMath math="\times" />
                    <InteractiveSymbolicMatrix name={`${variant}.wq.0`} rows={d_model} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
                    <BlockMath math="=" />
                    <InteractiveSymbolicMatrix name={q_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
                </div>
            </div>
            <div className="viz-formula-group">
                 <div className="viz-formula-row vertical">
                    <InteractiveSymbolicMatrix name={`${variant}.input`} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onSymbolClick} />
                    <BlockMath math="\times" />
                    <InteractiveSymbolicMatrix name={`${variant}.wk.0`} rows={d_model} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
                    <BlockMath math="=" />
                    <InteractiveSymbolicMatrix name={k_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
                </div>
            </div>
             <div className="viz-formula-group">
                <div className="viz-formula-row vertical">
                    <InteractiveSymbolicMatrix name={`${variant}.input`} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onSymbolClick} />
                    <BlockMath math="\times" />
                    <InteractiveSymbolicMatrix name={`${variant}.wv.0`} rows={d_model} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
                    <BlockMath math="=" />
                    <InteractiveSymbolicMatrix name={v_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
                </div>
            </div>
            {/* Other steps are omitted for brevity but would follow the same pattern as the original */}
        </div>
    )
}

export const Explanation: React.FC<ExplanationProps> = ({ dims, highlight, onSymbolClick, onComponentClick, refs }) => {
    return (
        <div>
            {/* This is a simplified version of the original explanation panel. */}
            {/* It reuses the old symbolic components to show they are compatible with the new viz. */}
            <div className="attention-variant-section" ref={el => refs.current['mha'] = el}>
                <div className="component-header" onClick={() => onComponentClick('mha')}>MHA (Multi-Head Attention)</div>
                <div className="component-body">
                     <div className="explanation-subsection">
                        <h5>交互式公式推导 (以头0为例)</h5>
                        {renderVariantExplanation('mha', dims, highlight, onSymbolClick)}
                    </div>
                </div>
            </div>
             <div className="attention-variant-section" ref={el => refs.current['gqa'] = el}>
                <div className="component-header" onClick={() => onComponentClick('gqa')}>GQA (Grouped-Query Attention)</div>
                 <div className="component-body">
                     <div className="explanation-subsection">
                        <h5>交互式公式推导 (以头0为例)</h5>
                        {renderVariantExplanation('gqa', dims, highlight, onSymbolClick)}
                    </div>
                </div>
            </div>
             <div className="attention-variant-section" ref={el => refs.current['mqa'] = el}>
                <div className="component-header" onClick={() => onComponentClick('mqa')}>MQA (Multi-Query Attention)</div>
                 <div className="component-body">
                     <div className="explanation-subsection">
                        <h5>交互式公式推导 (以头0为例)</h5>
                        {renderVariantExplanation('mqa', dims, highlight, onSymbolClick)}
                    </div>
                </div>
            </div>
             <div className="attention-variant-section" ref={el => refs.current['mla'] = el}>
                <div className="component-header" onClick={() => onComponentClick('mla')}>MLA (Multi-head Latent Attention) - 符号推导</div>
                <div className="component-body">
                    <MLASymbolicViz
                        dims={dims}
                        highlight={highlight}
                        onElementClick={onSymbolClick}
                        onComponentClick={onComponentClick}
                    />
                </div>
            </div>
        </div>
    );
};
// END OF FILE: src/topics/refactored-attention-variants/components/Explanation.tsx