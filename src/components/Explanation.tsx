// FILE: src/components/Explanation.tsx
import React from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import { InteractiveSymbolicMatrix } from './InteractiveSymbolicMatrix';
import { InteractiveSymbolicVector } from './InteractiveSymbolicVector';
import { HighlightState, ElementIdentifier } from '../types';
import { MATRIX_NAMES } from '../config/matrixNames';

interface ExplanationProps {
    dims: { d_model: number; h: number, seq_len: number, n_layers: number, d_ff: number };
    highlight: HighlightState;
    onSymbolClick: (element: ElementIdentifier) => void;
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

export const Explanation: React.FC<ExplanationProps> = ({ dims, highlight, onSymbolClick }) => {
    const LN = MATRIX_NAMES.layer(0);
    const HN = MATRIX_NAMES.head(0, 0);
    const d_k = dims.d_model / dims.h;

    const shouldBreakAddNorm = dims.d_model > 15 || dims.d_model * 2 > 15;

    return (
        <div>
            <div className="math-block">
                <h3>Transformer 架构概览</h3>
                <p>Transformer 模型由两个核心部分组成：<b>编码器 (Encoder)</b> 和 <b>解码器 (Decoder)</b>。编码器的任务是“理解”输入的整个句子（例如，"I am a student"），并将其转化为一组富含上下文信息的数字表示。解码器的任务是利用这些数字表示，并结合已经生成的内容，一次一个词地生成目标句子（例如，“我 是 一个 学生”）。</p>
                <p>在2017年的原始论文《Attention Is All You Need》中，编码器和解码器都由 N=6 个相同的层堆叠而成。<b>此可视化工具将聚焦于编码器部分</b>，带您深入探索其内部的数据流动和数学原理。</p>
            </div>

             <MathBlock id="input_embed" title="第1步：输入预处理" highlight={highlight}>
                <h5>做什么？</h5>
                <p>此步骤将输入的文本序列（一串文字）转换为模型可以处理的、包含“词义”和“位置”信息的数值向量矩阵。我们以一个长度为 {dims.seq_len} 的序列为例，当前模型维度 <InlineMath math={`d_{model}=${dims.d_model}`}/>。</p>

                <h5>计算流程</h5>
                <ol>
                    <li><b>词嵌入 (Token Embedding):</b> 首先，通过一个大型的、可学习的嵌入表（相当于一个巨大的“词典”），将每个词元（Token）的ID转换为一个稠密的向量。结果是一个矩阵，每一行代表一个词的初始含义。</li>
                    <li><b>位置编码 (Positional Encoding):</b> Transformer没有循环结构，无法感知词的顺序。因此，我们创建另一个同样大小的位置编码矩阵。该矩阵根据固定的 <InlineMath math="\sin"/> 和 <InlineMath math="\cos"/> 函数生成，为模型注入关于序列顺序的绝对位置信息。</li>
                    <li><b>逐元素相加:</b> 最后，将上述两个矩阵逐元素相加，得到编码器最终的输入表示 <InlineMath math="Z"/>。这个矩阵的每一行，都既包含了词的语义，也包含了它在句子中的位置信息。</li>
                </ol>

                <p>位置编码计算公式: 矩阵中每一项 <InlineMath math="PE_{(pos, i)}"/> 的值都由其位置 <code>pos</code> 和维度索引 <code>i</code> 决定：</p>
                <BlockMath math={`
                PE_{(pos, i)} =
                \\begin{cases}
                    \\sin(pos / 10000^{i/d_{\\text{model}}}), & \\text{if } i \\text{ is even} \\\\
                    \\cos(pos / 10000^{(i-1)/d_{\\text{model}}}), & \\text{if } i \\text{ is odd}
                \\end{cases}
                `} />
                <div className={`formula-display ${shouldBreakAddNorm ? 'vertical' : ''}`}>
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={MATRIX_NAMES.inputEmbeddings} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="+" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={MATRIX_NAMES.posEncodings} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    {shouldBreakAddNorm && <BlockMath math="=" />}
                    {!shouldBreakAddNorm && <BlockMath math="=" />}
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={MATRIX_NAMES.encoderInput} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>
             </MathBlock>

             <MathBlock id="mha" title="编码器子层1：多头自注意力" highlight={highlight}>
                <h5>做什么？</h5>
                <p>此机制的核心目的是计算句子中每个词与其他所有词的“关注度”或“相关性”，并根据这个关注度重新计算每个词的向量表示，从而让每个词的向量都融入其上下文信息。</p>
                <h5>设计思路</h5>
                <p>传统的单头注意力虽然能捕捉输入元素间的关系，但只能在单一的表示空间中进行。这限制了模型在处理复杂信息时（如同时关注语法结构和语义关系）的能力。多头注意力（MHA）通过将注意力计算分解到多个并行的“头”来解决这个问题。每个头在输入的不同表示子空间中学习注意力权重，使得模型能同时从不同位置、不同方面关注信息，就像让 {dims.h} 个“专家”从不同角度去审视和理解句子。</p>

                <h5>1. 生成 Q, K, V 向量</h5>
                <p>输入矩阵 <InlineMath math="Z"/> 被并行地送入 {dims.h} 个独立的注意力头。每个头都拥有三块自己专属、可学习的权重矩阵。通过矩阵乘法，将输入 <InlineMath math="Z"/> 投影到三个新的矩阵：查询 (Query, <InlineMath math="Q"/>), 键 (Key, <InlineMath math="K"/>), 和 值 (Value, <InlineMath math="V"/>)。</p>
                <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LN.encoder_input} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="\times" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={HN.Wq} rows={dims.d_model} cols={d_k} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="=" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={HN.Q} rows={dims.seq_len} cols={d_k} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>
                 <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LN.encoder_input} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="\times" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={HN.Wk} rows={dims.d_model} cols={d_k} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="=" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={HN.K} rows={dims.seq_len} cols={d_k} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>
                 <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LN.encoder_input} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="\times" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={HN.Wv} rows={dims.d_model} cols={d_k} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="=" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={HN.V} rows={dims.seq_len} cols={d_k} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>

                <h5>2. 计算注意力分数</h5>
                <p>通过将 Query 矩阵与转置后的 Key 矩阵相乘，我们得到一个注意力分数矩阵 <InlineMath math="S"/>。该矩阵中的每个元素 <InlineMath math="S_{r,c}"/> 代表输入序列中第 <code>r</code> 个词（查询方）对第 <code>c</code> 个词（被查询方）的关注度原始分数。</p>
                 <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={HN.Q} rows={dims.seq_len} cols={d_k} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="\times" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={HN.K} rows={dims.seq_len} cols={d_k} highlight={highlight} transpose={true} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="=" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={HN.Scores} rows={dims.seq_len} cols={dims.seq_len} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>

                <h5>3. 缩放与Softmax</h5>
                <p>为防止梯度在反向传播时过小，将分数矩阵 <InlineMath math="S"/> 中的所有元素都除以一个缩放因子 <InlineMath math={`\\sqrt{d_k}`}/>。然后，对缩放后的分数矩阵<b>逐行</b>应用 Softmax 函数，将其转换为总和为1的概率分布。这就是最终的注意力权重矩阵 <InlineMath math="A"/>。</p>
                <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={HN.Scores} rows={dims.seq_len} cols={dims.seq_len} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math={`\\xrightarrow{/\\sqrt{d_k}}`} />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={HN.ScaledScores} rows={dims.seq_len} cols={dims.seq_len} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math={`\\xrightarrow{\\text{softmax}}`} />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={HN.AttentionWeights} rows={dims.seq_len} cols={dims.seq_len} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>

                <h5>4. 加权求和</h5>
                <p>最后，将权重矩阵 <InlineMath math="A"/> 与 Value 矩阵 <InlineMath math="V"/> 相乘，得到该注意力头的最终输出 <InlineMath math="H"/>。这个过程本质上是对 <InlineMath math="V"/> 中的所有词向量进行加权求和，权重就是刚算出来的注意力分数。关注度越高的词，其V向量在最终结果中的占比就越大。</p>
                <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={HN.AttentionWeights} rows={dims.seq_len} cols={dims.seq_len} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="\times" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={HN.V} rows={dims.seq_len} cols={d_k} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="=" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={HN.HeadOutput} rows={dims.seq_len} cols={d_k} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>

                <h5>5. 拼接与最终投影</h5>
                <p>所有 {dims.h} 个头的输出矩阵 (<InlineMath math={`H_0, H_1, \\dots, H_{${dims.h-1}}`}/>) 在特征维度上被拼接（Concatenate）在一起，形成一个大的矩阵 <InlineMath math="H_{cat}"/>。然后，这个拼接后的矩阵通过一个最终的线性层（权重 <InlineMath math="W^O"/>）进行融合与降维，得到该多头注意力块的最终输出 <InlineMath math="M"/>。</p>
                 <BlockMath math={`H_{cat} = \\text{Concat}(H_0, H_1, \\dots, H_{${dims.h-1}})`} />
                 <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={MATRIX_NAMES.concatOutput(0)} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="\times" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LN.Wo} rows={dims.d_model} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="=" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LN.mha_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>
             </MathBlock>

             <MathBlock id="add_norm_1" title="组件：残差连接与层归一化 (1)" highlight={highlight}>
                <p>在每个子层（如多头注意力、前馈网络）之后，都会跟随一个“Add & Norm”模块。它包含两个关键步骤，旨在改善深度网络的训练过程并增强信息流动。</p>
                <h5>步骤 1: 残差连接 (Add)</h5>
                <p>此步骤的目的是将子层的<b>输入</b>信息与<b>输出</b>信息直接相加。这创建了一条“捷径”（Shortcut/Residual Connection），使得梯度在反向传播时可以更容易地流过深层网络，有效缓解梯度消失问题，也保证了模型不会因为增加了一层而效果变差。</p>
                <BlockMath math={`Z_{add} = Z_{in} + \\text{Sublayer}(Z_{in})`} />

                <h5>步骤 2: 层归一化 (Layer Normalization)</h5>
                <p>此步骤旨在稳定训练过程，降低模型对权重初始化的敏感度。它独立地对每个样本（即矩阵的每一行）的特征向量进行归一化处理。对于 <InlineMath math="Z_{add}"/> 的每一行向量 <InlineMath math="\mathbf{z}"/>：</p>
                <ol>
                    <li><b>计算均值 (<InlineMath math="\mu"/>) 和方差 (<InlineMath math="\sigma^2"/>):</b> 计算该行向量内所有元素的均值与方差。</li>
                    <li><b>归一化:</b> 将向量变为均值为0，方差为1的标准分布。</li>
                    <BlockMath math={`\\mathbf{\\hat{z}} = \\frac{\\mathbf{z} - \\mu}{\\sqrt{\\sigma^2 + \\epsilon}}`} />
                    <li><b>缩放与平移:</b> 引入两个可学习的参数向量 <InlineMath math="\gamma"/> (gamma) 和 <InlineMath math="\beta"/> (beta)，来恢复模型的表达能力，因为强制归一化可能会限制模型的性能。其中 <InlineMath math="\odot"/> 代表逐元素乘法。</li>
                    <BlockMath math={`\\mathbf{z}_{out} = \\gamma \odot \\mathbf{\\hat{z}} + \\beta`} />
                </ol>
                <div className={`formula-display ${shouldBreakAddNorm ? 'vertical' : ''}`}>
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LN.encoder_input} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="+" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LN.mha_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="\xrightarrow{\text{LayerNorm}}" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LN.add_norm_1_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>
             </MathBlock>

              <MathBlock id="ffn" title="编码器子层2：位置前馈网络" highlight={highlight}>
                <h5>做什么？</h5>
                <p>在注意力层捕捉了上下文关系之后，前馈网络 (FFN) 对每个位置的向量独立地进行一次复杂的非线性变换。这极大地增加了模型的表达能力，使其能够学习更复杂的特征组合。</p>
                <h5>设计思路</h5>
                <p>注意力层本身的计算（加权求和）是线性的，为了让模型能够学习更复杂的函数，需要在每个注意力层之后引入非线性变换。FFN 就是这个非线性组件。它独立地、相同地应用于序列中的每一个位置（即每一个词元向量），为其增加了模型的“深度”和表达能力，可以看作是在特征维度上进行深度加工。</p>

                <h5>1. 第一次线性变换 (维度扩展)</h5>
                <p>输入矩阵 <InlineMath math="Z'"/> 首先会经过一个线性层，将其维度从 <InlineMath math={`d_{model}=${dims.d_model}`}/> 扩展到一个更大的中间维度 <InlineMath math={`d_{ff}=${dims.d_ff}`}/>。这个“升维”操作为模型提供了更大的空间来学习和组合特征。然后加上偏置项，并通过ReLU激活函数引入非线性。</p>
                <BlockMath math={`H_{act} = \\text{ReLU}(Z' W_1 + b_1)`} />
                <div className="formula-display vertical">
                    <div className="viz-formula-row">
                        <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LN.add_norm_1_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    </div>
                    <BlockMath math="\times"/>
                    <div className="viz-formula-row">
                        <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LN.W1} rows={dims.d_model} cols={dims.d_ff} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    </div>
                    <BlockMath math="+"/>
                    <div className="viz-formula-row">
                        <div className="matrix-scroll-wrapper"><InteractiveSymbolicVector name={LN.b1} data={Array(dims.d_ff).fill(0)} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    </div>
                    <BlockMath math="\xrightarrow{ReLU}"/>
                    <div className="viz-formula-row">
                        <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LN.Activated} rows={dims.seq_len} cols={dims.d_ff} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    </div>
                </div>

                <h5>2. 第二次线性变换 (维度投影)</h5>
                <p>最后，将经过激活函数处理的矩阵再通过第二个线性层，将其从中间维度 <InlineMath math={`d_{ff}`}/> 投影回原始的模型维度 <InlineMath math={`d_{model}`}/>，并加上第二个偏置项，得到FFN层的最终输出。这个“降维”操作将学习到的复杂特征整合回模型的主干维度中。</p>
                <BlockMath math={`F = H_{act} W_2 + b_2`} />
                <div className="formula-display vertical">
                     <div className="viz-formula-row">
                        <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LN.Activated} rows={dims.seq_len} cols={dims.d_ff} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    </div>
                    <BlockMath math="\times"/>
                    <div className="viz-formula-row">
                        <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LN.W2} rows={dims.d_ff} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    </div>
                    <BlockMath math="+"/>
                    <div className="viz-formula-row">
                        <div className="matrix-scroll-wrapper"><InteractiveSymbolicVector name={LN.b2} data={Array(dims.d_model).fill(0)} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    </div>
                    <BlockMath math="="/>
                    <div className="viz-formula-row">
                        <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LN.ffn_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    </div>
                </div>
             </MathBlock>

             <MathBlock id="add_norm_2" title="组件：残差连接与层归一化 (2)" highlight={highlight}>
                <p>与第一个 "Add & Norm" 层完全相同，此步骤将 FFN 子层的输出信息与该子层的输入信息直接结合，然后进行层归一化，产生该编码器层的最终输出。</p>
                <p>这个输出可以被送入下一个编码器层进行更深层次的特征提取，或者（如果这是最后一层）被送入解码器的每一个“编码器-解码器注意力”子层中，作为指导翻译生成的上下文信息。</p>
                <div className={`formula-display ${shouldBreakAddNorm ? 'vertical' : ''}`}>
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LN.add_norm_1_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="+" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LN.ffn_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="\xrightarrow{\text{LayerNorm}}" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LN.add_norm_2_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>
             </MathBlock>
        </div>
    );
};
// END OF FILE: src/components/Explanation.tsx