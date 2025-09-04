// FILE: src/components/Explanation.tsx
import React from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import { SymbolicMatrix } from './SymbolicMatrix';
import { SymbolicVector } from './SymbolicVector';
import { HighlightState } from '../types';
import { MATRIX_NAMES } from '../config/matrixNames';
import { getSymbolParts } from '../config/symbolMapping';

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
    const isActive = highlight.activeComponent === id;
    return (
        <div id={`math_${id}`} className={`math-block ${isActive ? 'active' : ''}`}>
            <h3>{title}</h3>
            {children}
        </div>
    );
};

export const Explanation: React.FC<ExplanationProps> = ({ dims, highlight }) => {
    const LN = MATRIX_NAMES.layer(0);
    const HN = MATRIX_NAMES.head(0, 0);

    // Helper to build KaTeX labels manually for consistency and correctness
    const buildLabel = (name: string, rows: number, cols: number) => {
        const symbol = getSymbolParts(name);
        let label = symbol.base;
        if (symbol.superscript) label += `^{${symbol.superscript}}`;
        const finalSubscript = [symbol.subscript, `${rows}\\times${cols}`].filter(Boolean).join(',');
        if (finalSubscript) label += `_{${finalSubscript}}`;
        return label;
    }

    return (
        <div>
             <MathBlock id="input_embed" title="输入嵌入 (Input Embedding)" highlight={highlight}>
                <p>此步骤将输入的文本序列转换为模型可以处理的、包含位置信息的数值向量。我们以一个序列 (长度={dims.seq_len}) 为例，当前模型维度 <InlineMath math={`d_{model}=${dims.d_model}`} />。</p>
                <BlockMath math={`${getSymbolParts(LN.encoder_input).base} = \\text{Embedding}(X) + \\text{PE}(X)`} />
                <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={MATRIX_NAMES.inputEmbeddings} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} /></div>
                    <BlockMath math="+" />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={MATRIX_NAMES.posEncodings} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} /></div>
                    <BlockMath math="=" />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={MATRIX_NAMES.encoderInput} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} /></div>
                </div>
             </MathBlock>

             <MathBlock id="mha" title="编码器：多头注意力 (Multi-Head Attention)" highlight={highlight}>
                <p>多头注意力的核心思想是将输入（<InlineMath math="Z"/>）拆分到 <InlineMath math={`h=${dims.h}`}/> 个“子空间”中并行处理，最后再将结果融合。这允许模型从不同角度关注信息。</p>
                <h5>为单个头生成 Q, K, V</h5>
                <p>输入矩阵 <InlineMath math="Z"/> 被并行地送入 {dims.h} 个独立的注意力头。每个头都拥有三块自己专属、可学习的权重矩阵。</p>

                <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={LN.encoder_input} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} /></div>
                    <BlockMath math="\times" />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={HN.Wq} rows={dims.d_model} cols={dims.d_model/dims.h} highlight={highlight} /></div>
                    <BlockMath math="=" />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={HN.Q} rows={dims.seq_len} cols={dims.d_model/dims.h} highlight={highlight} /></div>
                </div>

                <h5>计算注意力分数</h5>
                <p>通过将 Query 矩阵与转置后的 Key 矩阵相乘，我们得到一个注意力分数矩阵 <InlineMath math="S"/>。</p>
                <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={HN.Q} rows={dims.seq_len} cols={dims.d_model/dims.h} highlight={highlight} /></div>
                    <BlockMath math="\times" />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={HN.K} rows={dims.d_model/dims.h} cols={dims.seq_len} highlight={highlight} transpose={true}/></div>
                    <BlockMath math="=" />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={HN.Scores} rows={dims.seq_len} cols={dims.seq_len} highlight={highlight} /></div>
                </div>

                <h5>缩放、Softmax 和加权求和</h5>
                <p>为防止梯度过小，将分数矩阵 <InlineMath math="S"/> 中的所有元素都除以一个缩放因子 <InlineMath math={`\\sqrt{d_k}`}/>。然后，对缩放后的分数矩阵<b>逐行</b>应用 Softmax 函数，将其转换为概率分布（权重 <InlineMath math="A"/>）。</p>
                <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={HN.Scores} rows={dims.seq_len} cols={dims.seq_len} highlight={highlight}/></div>
                    <BlockMath math={`\\xrightarrow{/\\sqrt{d_k}}`} />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={HN.ScaledScores} rows={dims.seq_len} cols={dims.seq_len} highlight={highlight}/></div>
                    <BlockMath math={`\\xrightarrow{\\text{softmax}}`} />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={HN.AttentionWeights} rows={dims.seq_len} cols={dims.seq_len} highlight={highlight}/></div>
                </div>

                <h5>拼接与最终投影</h5>
                <p>所有 {dims.h} 个头的输出矩阵被拼接在一起，然后通过一个最终的线性层进行融合，得到该多头注意力块的最终输出 <InlineMath math="M"/>。</p>
             </MathBlock>

             <MathBlock id="add_norm_1" title="残差连接与层归一化 (1)" highlight={highlight}>
                <p>此步骤包含两个关键操作：残差连接 (Add) 和层归一化 (LayerNorm)，旨在改善深度网络的训练过程并增强信息流动。</p>
                <div className="formula-display">
                    <SymbolicMatrix name={LN.encoder_input} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} />
                    <BlockMath math="+" />
                    <SymbolicMatrix name={LN.mha_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} />
                    <BlockMath math="\xrightarrow{\text{LayerNorm}}" />
                    <SymbolicMatrix name={LN.add_norm_1_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} />
                </div>
             </MathBlock>

              <MathBlock id="ffn" title="前馈神经网络 (Feed-Forward Network)" highlight={highlight}>
                <p>前馈网络是一个简单的两层全连接神经网络，它被独立地应用于序列中的每一个位置（即每一个词元向量）。</p>
                <h5>1. 第一次线性变换 (维度扩展)</h5>
                <p>输入矩阵 <InlineMath math="Z'"/> 首先会经过一个线性层，将其维度从 <InlineMath math={`d_{model}=${dims.d_model}`}/> 扩展到一个更大的中间维度 <InlineMath math={`d_{ff}=${dims.d_ff}`}/>。</p>
                <div className="formula-display">
                    <SymbolicMatrix name={LN.add_norm_1_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight}/>
                    <BlockMath math="\times"/>
                    <SymbolicMatrix name={LN.W1} rows={dims.d_model} cols={dims.d_ff} highlight={highlight}/>
                    <BlockMath math="+"/>
                    <SymbolicVector name={LN.b1} data={Array(dims.d_ff).fill(0)} highlight={highlight}/>
                    <BlockMath math="\xrightarrow{ReLU}"/>
                    <SymbolicMatrix name={LN.Activated} rows={dims.seq_len} cols={dims.d_ff} highlight={highlight}/>
                </div>

                <h5>2. 第二次线性变换 (维度投影)</h5>
                <p>最后，将经过激活函数处理的矩阵再通过第二个线性层，将其从中间维度 <InlineMath math={`d_{ff}`}/> 投影回原始的模型维度 <InlineMath math={`d_{model}`}/>。</p>
                <div className="formula-display">
                    <SymbolicMatrix name={LN.Activated} rows={dims.seq_len} cols={dims.d_ff} highlight={highlight}/>
                    <BlockMath math="\times"/>
                    <SymbolicMatrix name={LN.W2} rows={dims.d_ff} cols={dims.d_model} highlight={highlight}/>
                    <BlockMath math="+"/>
                    <SymbolicVector name={LN.b2} data={Array(dims.d_model).fill(0)} highlight={highlight}/>
                    <BlockMath math="="/>
                    <SymbolicMatrix name={LN.ffn_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight}/>
                </div>
             </MathBlock>

             <MathBlock id="add_norm_2" title="残差连接与层归一化 (2)" highlight={highlight}>
                <p>与第一个 "Add & Norm" 层类似，此步骤将 FFN 子层的输出信息与该子层的输入信息直接结合，然后进行层归一化。</p>
                <div className="formula-display">
                    <SymbolicMatrix name={LN.add_norm_1_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} />
                    <BlockMath math="+" />
                    <SymbolicMatrix name={LN.ffn_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} />
                    <BlockMath math="\xrightarrow{\text{LayerNorm}}" />
                    <SymbolicMatrix name={LN.add_norm_2_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} />
                </div>
             </MathBlock>
        </div>
    );
};
// END OF FILE: src/components/Explanation.tsx