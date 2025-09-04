// FILE: src/components/Explanation.tsx
import React from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import { SymbolicMatrix } from './SymbolicMatrix';
import { SymbolicVector } from './SymbolicVector';
import { HighlightState } from '../types';
import { MATRIX_NAMES } from '../config/matrixNames';

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
    const d_k = dims.d_model / dims.h;

    return (
        <div>
             <MathBlock id="input_embed" title="输入嵌入 (Input Embedding)" highlight={highlight}>
                <p>此步骤将输入的文本序列转换为模型可以处理的、包含位置信息的数值向量。我们以一个序列 (长度={dims.seq_len}) 为例，当前模型维度 <InlineMath math={`d_{model}=${dims.d_model}`} />。</p>
                <ol>
                    <li><b>向量嵌入 (Embedding):</b> 首先，通过一个大型的、可学习的嵌入表，将每个词元的 ID 转换为一个稠密向量。结果是一个矩阵，每一行代表一个词。</li>
                    <li><b>位置编码 (Positional Encoding):</b> 接下来，我们创建一个同样大小的位置编码矩阵。该矩阵根据固定的 <InlineMath math="\sin"/> 和 <InlineMath math="\cos"/> 函数生成，为模型注入序列的顺序信息。</li>
                    <li><b>逐元素相加:</b> 最后，将上述两个矩阵逐元素相加，得到最终的输入表示 <InlineMath math="Z"/>。</li>
                </ol>
                <p>位置编码计算公式: 矩阵中每一项 <InlineMath math="PE_{(pos, i)}"/> 的值都由其位置 <code>pos</code> 和维度索引 <code>i</code> 决定：</p>
                <BlockMath math={`
                PE_{(pos, i)} =
                \\begin{cases}
                    \\sin(pos / 10000^{i/d_{\\text{model}}}), & \\text{if } i \\text{ is even} \\\\
                    \\cos(pos / 10000^{(i-1)/d_{\\text{model}}}), & \\text{if } i \\text{ is odd}
                \\end{cases}
                `} />
                <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={MATRIX_NAMES.inputEmbeddings} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} /></div>
                    <BlockMath math="+" />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={MATRIX_NAMES.posEncodings} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} /></div>
                    <BlockMath math="=" />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={MATRIX_NAMES.encoderInput} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} /></div>
                </div>
             </MathBlock>

             <MathBlock id="mha" title="编码器：多头注意力 (Multi-Head Attention)" highlight={highlight}>
                <h5>出现原因与设计思路</h5>
                <p>传统的单头注意力虽然能捕捉输入元素间的关系，但只能在单一的表示空间中进行。这限制了模型在处理复杂信息时（如同时关注语法结构和语义关系）的能力。多头注意力（MHA）通过将注意力计算分解到多个并行的“头”来解决这个问题。每个头在输入的不同表示子空间中学习注意力权重，使得模型能同时从不同位置、不同方面关注信息。</p>

                <h5>1. 为每个头生成 Q, K, V</h5>
                <p>输入矩阵 <InlineMath math="Z"/> 被并行地送入 {dims.h} 个独立的注意力头。每个头都拥有三块自己专属、可学习的权重矩阵。通过矩阵乘法，将输入 <InlineMath math="Z"/> 投影到三个新的矩阵：Query (<InlineMath math="Q"/>), Key (<InlineMath math="K"/>), 和 Value (<InlineMath math="V"/>)。</p>
                <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={LN.encoder_input} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} /></div>
                    <BlockMath math="\times" />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={HN.Wq} rows={dims.d_model} cols={d_k} highlight={highlight} /></div>
                    <BlockMath math="=" />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={HN.Q} rows={dims.seq_len} cols={d_k} highlight={highlight} /></div>
                </div>
                 <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={LN.encoder_input} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} /></div>
                    <BlockMath math="\times" />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={HN.Wk} rows={dims.d_model} cols={d_k} highlight={highlight} /></div>
                    <BlockMath math="=" />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={HN.K} rows={dims.seq_len} cols={d_k} highlight={highlight} /></div>
                </div>
                 <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={LN.encoder_input} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} /></div>
                    <BlockMath math="\times" />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={HN.Wv} rows={dims.d_model} cols={d_k} highlight={highlight} /></div>
                    <BlockMath math="=" />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={HN.V} rows={dims.seq_len} cols={d_k} highlight={highlight} /></div>
                </div>

                <h5>2. 计算注意力分数</h5>
                <p>通过将 Query 矩阵与转置后的 Key 矩阵相乘，我们得到一个注意力分数矩阵 <InlineMath math="S"/>。该矩阵中的每个元素 <InlineMath math="S_{r,c}"/> 代表输入序列中第 <code>r</code> 个词对第 <code>c</code> 个词的关注度原始分数。</p>
                 <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={HN.Q} rows={dims.seq_len} cols={d_k} highlight={highlight} /></div>
                    <BlockMath math="\times" />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={HN.K} rows={d_k} cols={dims.seq_len} highlight={highlight} transpose={true}/></div>
                    <BlockMath math="=" />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={HN.Scores} rows={dims.seq_len} cols={dims.seq_len} highlight={highlight} /></div>
                </div>

                <h5>3. 缩放与Softmax</h5>
                <p>为防止梯度过小，将分数矩阵 <InlineMath math="S"/> 中的所有元素都除以一个缩放因子 <InlineMath math={`\\sqrt{d_k}`}/>。然后，对缩放后的分数矩阵<b>逐行</b>应用 Softmax 函数，将其转换为概率分布（权重 <InlineMath math="A"/>）。</p>
                <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={HN.Scores} rows={dims.seq_len} cols={dims.seq_len} highlight={highlight}/></div>
                    <BlockMath math={`\\xrightarrow{/\\sqrt{d_k}}`} />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={HN.ScaledScores} rows={dims.seq_len} cols={dims.seq_len} highlight={highlight}/></div>
                    <BlockMath math={`\\xrightarrow{\\text{softmax}}`} />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={HN.AttentionWeights} rows={dims.seq_len} cols={dims.seq_len} highlight={highlight}/></div>
                </div>

                <h5>4. 生成单头输出</h5>
                <p>最后，将权重矩阵 <InlineMath math="A"/> 与 Value 矩阵 <InlineMath math="V"/> 相乘，得到该注意力头的最终输出 <InlineMath math="H"/>。这个过程本质上是对 <InlineMath math="V"/> 中的所有词向量进行加权求和。</p>
                <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={HN.AttentionWeights} rows={dims.seq_len} cols={dims.seq_len} highlight={highlight}/></div>
                    <BlockMath math="\times" />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={HN.V} rows={dims.seq_len} cols={d_k} highlight={highlight} /></div>
                    <BlockMath math="=" />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={HN.HeadOutput} rows={dims.seq_len} cols={d_k} highlight={highlight}/></div>
                </div>

                <h5>5. 拼接与最终投影</h5>
                <p>所有 {dims.h} 个头的输出矩阵 (<InlineMath math={`H_0, H_1, \\dots, H_{${dims.h-1}}`}/>) 在特征维度上被拼接在一起，形成一个大的矩阵 <InlineMath math="H_{cat}"/>。然后，这个拼接后的矩阵通过一个最终的线性层（权重 <InlineMath math="W^O"/>）进行融合，得到该多头注意力块的最终输出 <InlineMath math="M"/>。</p>
                 <BlockMath math={`H_{cat} = \\text{Concat}(H_0, H_1, \\dots, H_{${dims.h-1}})`} />
                 <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={MATRIX_NAMES.concatOutput(0)} rows={dims.seq_len} cols={dims.d_model} highlight={highlight}/></div>
                    <BlockMath math="\times" />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={LN.Wo} rows={dims.d_model} cols={dims.d_model} highlight={highlight} /></div>
                    <BlockMath math="=" />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={LN.mha_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight}/></div>
                </div>
             </MathBlock>

             <MathBlock id="add_norm_1" title="残差连接与层归一化 (1)" highlight={highlight}>
                <p>“Add & Norm” 包含两个关键步骤，旨在改善深度网络的训练过程并增强信息流动。</p>
                <h5>步骤 1: 残差连接 (Add)</h5>
                <p>此步骤的目的是将子层的输出信息与原始输入信息直接结合。这创建了一条“捷径”，使得梯度在反向传播时可以更容易地流过深层网络，有效缓解梯度消失问题。</p>
                <BlockMath math={`Z_{add} = Z_{in} + \\text{Sublayer}(Z_{in})`} />

                <h5>步骤 2: 层归一化 (Layer Normalization)</h5>
                <p>此步骤旨在稳定训练过程。它独立地对每个词元（即矩阵的每一行）的特征向量进行归一化。对于 <InlineMath math="Z_{add}"/> 的每一行向量 <InlineMath math="\mathbf{z}"/>：</p>
                <ol>
                    <li><b>a. 计算均值 (<InlineMath math="\mu"/>) 和方差 (<InlineMath math="\sigma^2"/>):</b><br/>
                    <p>计算该向量内所有元素的均值与方差。</p>
                    </li>
                    <li><b>b. 归一化:</b><br/>
                    <BlockMath math={`\\mathbf{\\hat{z}} = \\frac{\\mathbf{z} - \\mu}{\\sqrt{\\sigma^2 + \\epsilon}}`} />
                    </li>
                    <li><b>c. 缩放与平移:</b><br/>
                    <p>引入两个可学习的参数向量 <InlineMath math="\gamma"/> (gamma) 和 <InlineMath math="\beta"/> (beta)，来恢复模型的表达能力。其中 <InlineMath math="\odot"/> 代表哈达玛积（Hadamard product），即逐元素乘法。</p>
                    <BlockMath math={`\\mathbf{z}_{out} = \\gamma \\odot \\mathbf{\\hat{z}} + \\beta`} />
                    </li>
                </ol>
                <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={LN.encoder_input} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} /></div>
                    <BlockMath math="+" />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={LN.mha_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} /></div>
                    <BlockMath math="\xrightarrow{\text{LayerNorm}}" />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={LN.add_norm_1_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} /></div>
                </div>
             </MathBlock>

              <MathBlock id="ffn" title="前馈神经网络 (Feed-Forward Network)" highlight={highlight}>
                <h5>出现原因与设计思路</h5>
                <p>注意力层本身是线性的（Softmax之后是加权和），为了让模型能够学习更复杂的函数，需要在每个注意力层之后引入非线性变换。前馈网络 (FFN) 就是这个非线性组件。它独立地应用于序列中的每一个位置（即每一个词元向量），为其增加了模型的“深度”和表达能力。</p>
                <h5>1. 第一次线性变换 (维度扩展)</h5>
                <p>输入矩阵 <InlineMath math="Z'"/> 首先会经过一个线性层，将其维度从 <InlineMath math={`d_{model}=${dims.d_model}`}/> 扩展到一个更大的中间维度 <InlineMath math={`d_{ff}=${dims.d_ff}`}/>。这个“升维”操作为模型提供了更大的空间来学习和组合特征。然后加上偏置项，并通过ReLU激活函数引入非线性。</p>
                <BlockMath math={`H_{act} = \\text{ReLU}(Z' W_1 + b_1)`} />
                <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={LN.add_norm_1_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight}/></div>
                    <BlockMath math="\times"/>
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={LN.W1} rows={dims.d_model} cols={dims.d_ff} highlight={highlight}/></div>
                    <BlockMath math="+"/>
                    <div className="matrix-scroll-wrapper"><SymbolicVector name={LN.b1} data={Array(dims.d_ff).fill(0)} highlight={highlight}/></div>
                    <BlockMath math="\xrightarrow{ReLU}"/>
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={LN.Activated} rows={dims.seq_len} cols={dims.d_ff} highlight={highlight}/></div>
                </div>

                <h5>2. 第二次线性变换 (维度投影)</h5>
                <p>最后，将经过激活函数处理的矩阵再通过第二个线性层，将其从中间维度 <InlineMath math={`d_{ff}`}/> 投影回原始的模型维度 <InlineMath math={`d_{model}`}/>，并加上第二个偏置项，得到FFN层的最终输出。这个“降维”操作将学习到的复杂特征整合回模型的主干维度中。</p>
                <BlockMath math={`F = H_{act} W_2 + b_2`} />
                <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={LN.Activated} rows={dims.seq_len} cols={dims.d_ff} highlight={highlight}/></div>
                    <BlockMath math="\times"/>
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={LN.W2} rows={dims.d_ff} cols={dims.d_model} highlight={highlight}/></div>
                    <BlockMath math="+"/>
                    <div className="matrix-scroll-wrapper"><SymbolicVector name={LN.b2} data={Array(dims.d_model).fill(0)} highlight={highlight}/></div>
                    <BlockMath math="="/>
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={LN.ffn_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight}/></div>
                </div>
             </MathBlock>

             <MathBlock id="add_norm_2" title="残差连接与层归一化 (2)" highlight={highlight}>
                <p>与第一个 "Add & Norm" 层完全相同，此步骤将 FFN 子层的输出信息与该子层的输入信息直接结合，然后进行层归一化，产生该编码器层的最终输出。</p>
                <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={LN.add_norm_1_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} /></div>
                    <BlockMath math="+" />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={LN.ffn_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} /></div>
                    <BlockMath math="\xrightarrow{\text{LayerNorm}}" />
                    <div className="matrix-scroll-wrapper"><SymbolicMatrix name={LN.add_norm_2_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} /></div>
                </div>
             </MathBlock>
        </div>
    );
};
// END OF FILE: src/components/Explanation.tsx
