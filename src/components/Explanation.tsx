/* START OF FILE: src/components/Explanation.tsx */
// FILE: src/components/Explanation.tsx
import React from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import { SymbolicMatrix } from './SymbolicMatrix';
import { HighlightState } from '../types';

interface ExplanationProps {
    dims: { d_model: number; h: number, seq_len: number, n_layers: number, d_ff: number };
    highlight: HighlightState;
}

interface MathBlockProps {
    id: string;
    title: string;
    children: React.ReactNode;
    highlight: HighlightState;
}

const MathBlock: React.FC<MathBlockProps> = ({ id, title, children, highlight }) => {
    const isActive = highlight.activeComponent ? id.includes(highlight.activeComponent) : false;
    return (
        <div id={`math_${id}`} className={`math-block ${isActive ? 'active' : ''}`}>
            <h3>{title}</h3>
            {children}
        </div>
    );
};

export const Explanation: React.FC<ExplanationProps> = ({ dims, highlight }) => {
    const d_k = dims.d_model / dims.h;

    // ENHANCEMENT: The names passed to this function are now the full, unique identifiers
    // This allows the SymbolicMatrix component to correctly sync with the highlight state.
    const renderMatrixProduct = (
        A_name: string, B_name: string, C_name: string,
        A_prefix: string, B_prefix: string, C_prefix: string,
        a_rows: number, a_cols: number,
        b_rows: number, b_cols: number,
        b_transpose: boolean = false
    ) => {
      return (
         <div className="formula-display">
            <SymbolicMatrix name={A_name} prefix={A_prefix} rows={a_rows} cols={a_cols} highlight={highlight} />
            <BlockMath math="\times" />
            <SymbolicMatrix name={B_name} prefix={B_prefix} rows={b_rows} cols={b_cols} highlight={highlight} transpose={b_transpose} />
            <BlockMath math="=" />
            <SymbolicMatrix name={C_name} prefix={C_prefix} rows={a_rows} cols={b_cols} highlight={highlight} />
        </div>
      )
    }

    // Define full names for layer 0 components to ensure correct highlighting
    const baseMhaName = 'encoder.0.mha.h0';
    const baseFfnName = 'encoder.0.ffn';
    const baseAddNorm1Name = 'encoder.0.add_norm_1';

    return (
        <div>
             <MathBlock id="input_embed" title="输入嵌入 (Input Embedding)" highlight={highlight}>
                <BlockMath math={`Z_{0;${dims.seq_len}\\times${dims.d_model}} = \\text{Embedding}(X) + \\text{PE}(X)`} />
                <p>此步骤将输入的文本序列转换为模型可以处理的、包含位置信息的数值向量。我们以一个序列 (长度={dims.seq_len}) 为例，当前模型维度 <InlineMath math={`d_{model}=${dims.d_model}`} />。</p>
                <div className="formula-display">
                    <SymbolicMatrix name="inputEmbeddings" rows={dims.seq_len} cols={dims.d_model} prefix="e" highlight={highlight} />
                    <BlockMath math="+" />
                    <SymbolicMatrix name="posEncodings" rows={dims.seq_len} cols={dims.d_model} prefix="pe" highlight={highlight} />
                    <BlockMath math="=" />
                    <SymbolicMatrix name="encoderInput" rows={dims.seq_len} cols={dims.d_model} prefix="z" highlight={highlight} />
                </div>
             </MathBlock>

             <MathBlock id="encoder.0.mha" title="编码器：多头注意力 (Multi-Head Attention)" highlight={highlight}>
                <BlockMath math={`\\text{MultiHead}(Z) = \\text{Concat}(\\text{head}_0, ..., \\text{head}_{${dims.h-1}})W^O`} />
                <h5>为单个头生成 Q, K, V</h5>
                <BlockMath math={`Q = Z W^Q, \\quad K = Z W^K, \\quad V = Z W^V`} />
                {renderMatrixProduct(`${baseAddNorm1Name}_in_residual`, `${baseMhaName}.Wq`, `${baseMhaName}.Q`, 'z', 'w^q', 'q', dims.seq_len, dims.d_model, dims.d_model, d_k)}
                <h5>计算注意力分数</h5>
                <BlockMath math="\\text{Scores} = Q K^T" />
                {renderMatrixProduct(`${baseMhaName}.Q`, `${baseMhaName}.K`, `${baseMhaName}.Scores`, 'q', 'k', 's', dims.seq_len, d_k, d_k, dims.seq_len, true)}
                <h5>缩放、Softmax 和加权求和</h5>
                <BlockMath math={`\\text{head}_i = \\text{softmax}\\left(\\frac{\\text{Scores}}{\\sqrt{d_k}}\\right)V`} />
             </MathBlock>

             <MathBlock id="encoder.0.add_norm_1" title="残差连接与层归一化 (Add & Norm)" highlight={highlight}>
                <BlockMath math="X_{out} = \\text{LayerNorm}(X_{in} + \\text{Sublayer}(X_{in}))" />
                <div className="formula-display">
                    <SymbolicMatrix name={`${baseAddNorm1Name}_in_residual`} prefix="x" rows={dims.seq_len} cols={dims.d_model} highlight={highlight} />
                    <BlockMath math="+" />
                    <SymbolicMatrix name={`${baseAddNorm1Name}_in_sublayer`} prefix="m" rows={dims.seq_len} cols={dims.d_model} highlight={highlight} />
                    <BlockMath math="\xrightarrow{\text{LayerNorm}}" />
                    <SymbolicMatrix name={`${baseAddNorm1Name}_out`} prefix="y" rows={dims.seq_len} cols={dims.d_model} highlight={highlight} />
                </div>
             </MathBlock>

              <MathBlock id="encoder.0.ffn" title="前馈神经网络 (Feed-Forward Network)" highlight={highlight}>
                <BlockMath math="\text{FFN}(X) = \text{ReLU}(XW_1 + b_1)W_2 + b_2" />
                <h5>1. 第一次线性变换 (维度扩展)</h5>
                {renderMatrixProduct(`${baseAddNorm1Name}_out`, `${baseFfnName}.W1`, `${baseFfnName}.Intermediate`, 'x', 'w', 'h', dims.seq_len, dims.d_model, dims.d_model, dims.d_ff)}
                <h5>2. 第二次线性变换 (维度投影)</h5>
                {renderMatrixProduct(`${baseFfnName}.Activated`, `${baseFfnName}.W2`, `${baseFfnName}.Output`, 'h', 'w', 'y', dims.seq_len, dims.d_ff, dims.d_ff, dims.d_model)}
             </MathBlock>
        </div>
    );
};
// END OF FILE: src/components/Explanation.tsx
/* END OF FILE: src/components/Explanation.tsx */