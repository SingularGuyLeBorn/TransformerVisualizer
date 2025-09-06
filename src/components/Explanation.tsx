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
    const LNe = MATRIX_NAMES.layer(0);
    const HNe = MATRIX_NAMES.head(0, 0);
    const LNd = MATRIX_NAMES.decoderLayer(0);
    const HNd_masked = MATRIX_NAMES.maskedMhaHead(0, 0);
    const HNd_encdec = MATRIX_NAMES.encDecMhaHead(0, 0);
    const d_k = dims.d_model / dims.h;

    const shouldBreakAddNorm = dims.d_model > 15 || dims.d_model * 2 > 15;

    return (
        <div>
            <div className="math-block">
                <h3>Transformer 架构概览</h3>
                <p>Transformer 模型由两个核心部分组成：<b>编码器 (Encoder)</b> 和 <b>解码器 (Decoder)</b>。编码器的任务是“理解”输入的整个句子（例如，"I am a student"），并将其转化为一组富含上下文信息的数字表示。解码器的任务是利用这些数字表示，并结合已经生成的内容，一次一个词地生成目标句子（例如，“我 是 一个 学生”）。</p>
                <p>在2017年的原始论文《Attention Is All You Need》中，编码器和解码器都由 N 个相同的层堆叠而成。此可视化工具将带您深入探索其内部的数据流动和数学原理。</p>
            </div>

            {/* --- ENCODER EXPLANATIONS --- */}
            <h2 style={{textAlign: 'center', margin: '30px 0'}}>编码器 (Encoder)</h2>
             <MathBlock id="token_embed" title="编码器第0步：分词与词嵌入" highlight={highlight}>
                <h5>做什么？</h5>
                <p>此步骤将原始的自然语言文本（一个句子）转换为模型可以处理的数值矩阵。这是所有后续计算的起点。</p>
                <h5>计算流程</h5>
                <ol>
                    <li><b>分词 (Tokenization):</b> 将输入句子分解为一个个独立的词元（Token）。例如，"I am a student" 被分解为 "I", "am", "a", "student"。</li>
                    <li><b>ID映射 (ID Mapping):</b> 使用一个预先构建好的词汇表（Vocabulary），将每个词元映射到一个唯一的整数ID。例如 "I" → 10, "am" → 25。</li>
                    <li><b>词嵌入 (Embedding Lookup):</b> 使用一个巨大的、可学习的“查询表”（Embedding Matrix），根据每个词元的ID，从中“提取”出对应的向量。这个向量就是该词元的初始数值表示。</li>
                </ol>
                 <p>最终，我们得到一个形状为 <code>(序列长度, 模型维度)</code> 的矩阵，其中每一行都代表了输入句子中一个词的初始“含义”。</p>
            </MathBlock>
            <MathBlock id="input_embed" title="编码器第1步：输入预处理" highlight={highlight}>
                <h5>做什么？</h5>
                <p>此步骤将输入的文本序列（一串文字）转换为模型可以处理的、包含“词义”和“位置”信息的数值向量矩阵。我们以一个长度为 {dims.seq_len} 的序列为例，当前模型维度 <InlineMath math={`d_{model}=${dims.d_model}`}/>。</p>
                <h5>计算流程</h5>
                <ol>
                    <li><b>词嵌入 (Token Embedding):</b> 从上一步获得的矩阵，代表了每个词的“词义”。</li>
                    <li><b>位置编码 (Positional Encoding):</b> 为模型注入关于序列顺序的绝对位置信息。这是一个固定的、根据三角函数生成的矩阵。</li>
                    <li><b>逐元素相加:</b> 得到编码器最终的输入表示 <InlineMath math="Z_0"/>。</li>
                </ol>
                <div className={`formula-display ${shouldBreakAddNorm ? 'vertical' : ''}`}>
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={MATRIX_NAMES.inputEmbeddings} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="+" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={MATRIX_NAMES.posEncodings} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="=" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={MATRIX_NAMES.encoderInput} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>
            </MathBlock>
            <MathBlock id="mha" title="编码器子层1：多头自注意力" highlight={highlight}>
                <h5>做什么？</h5>
                <p>此机制的核心目的是计算句子中每个词与其他所有词的“关注度”或“相关性”，并根据这个关注度重新计算每个词的向量表示，从而让每个词的向量都融入其上下文信息。</p>
                 <h5>计算流程</h5>
                <p>输入矩阵 <InlineMath math="Z"/> 被并行地送入 {dims.h} 个独立的注意力头。每个头都拥有三块自己专属、可学习的权重矩阵。通过矩阵乘法，将输入 <InlineMath math="Z"/> 投影到三个新的矩阵：查询 (Query, <InlineMath math="Q"/>), 键 (Key, <InlineMath math="K"/>), 和 值 (Value, <InlineMath math="V"/>)。</p>
                <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNe.encoder_input} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="\times" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={HNe.Wq} rows={dims.d_model} cols={d_k} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="=" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={HNe.Q} rows={dims.seq_len} cols={d_k} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>
                <p>然后计算注意力分数 <InlineMath math="S = QK^T"/>，进行缩放和Softmax得到权重 <InlineMath math="A"/>，最后加权求和 <InlineMath math="H = A \cdot V"/>。</p>
            </MathBlock>
            <MathBlock id="add_norm_1" title="组件：残差连接与层归一化 (1)" highlight={highlight}>
                <p>在每个子层之后，都会跟随一个“Add & Norm”模块。它包含两个关键步骤：<b>残差连接</b>将子层的输入与输出直接相加，缓解梯度消失；<b>层归一化</b>则稳定训练过程。</p>
                <BlockMath math={`Z' = \\text{LayerNorm}(Z_{in} + \\text{Sublayer}(Z_{in}))`} />
                 <div className={`formula-display ${shouldBreakAddNorm ? 'vertical' : ''}`}>
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNe.encoder_input} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="+" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNe.mha_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="\xrightarrow{\text{LayerNorm}}" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNe.add_norm_1_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>
            </MathBlock>
            <MathBlock id="ffn" title="编码器子层2：位置前馈网络" highlight={highlight}>
                <p>前馈网络 (FFN) 对每个位置的向量独立地进行一次复杂的非线性变换，极大地增加了模型的表达能力。</p>
                <BlockMath math={`F = \\text{ReLU}(Z' W_1 + b_1) W_2 + b_2`} />
                <div className="formula-display vertical">
                    <div className="viz-formula-row">
                        <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNe.add_norm_1_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                    </div>
                    <BlockMath math="\times"/>
                    <div className="viz-formula-row">
                        <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNe.W1} rows={dims.d_model} cols={dims.d_ff} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                    </div>
                    <BlockMath math="+"/>
                    <div className="viz-formula-row">
                        <div className="matrix-scroll-wrapper"><InteractiveSymbolicVector name={LNe.b1} data={Array(dims.d_ff).fill(0)} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                    </div>
                    <BlockMath math="\xrightarrow{ReLU}"/>
                    <div className="viz-formula-row">
                        <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNe.Activated} rows={dims.seq_len} cols={dims.d_ff} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                    </div>
                </div>
            </MathBlock>
            <MathBlock id="add_norm_2" title="组件：残差连接与层归一化 (2)" highlight={highlight}>
                <p>与第一个 "Add & Norm" 层完全相同，此步骤将 FFN 子层的输出与输入结合，产生该编码器层的最终输出。</p>
                 <div className={`formula-display ${shouldBreakAddNorm ? 'vertical' : ''}`}>
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNe.add_norm_1_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="+" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNe.ffn_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="\xrightarrow{\text{LayerNorm}}" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNe.add_norm_2_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>
            </MathBlock>

            {/* --- DECODER EXPLANATIONS --- */}
            <h2 style={{textAlign: 'center', margin: '30px 0'}}>解码器 (Decoder)</h2>
            <MathBlock id="output_embed" title="解码器第1步：输出预处理" highlight={highlight}>
                 <h5>做什么？</h5>
                <p>此步骤与编码器输入预处理类似，但作用于目标语言序列（即解码器要生成的内容）。它将目标序列（通常是已经生成的词加上一个起始符）转换为模型可以处理的数值向量矩阵。</p>
                 <div className={`formula-display ${shouldBreakAddNorm ? 'vertical' : ''}`}>
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={MATRIX_NAMES.outputEmbeddings} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="+" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={MATRIX_NAMES.decoderPosEncodings} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="=" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={MATRIX_NAMES.decoderInput} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>
            </MathBlock>
            <MathBlock id="masked_mha" title="解码器子层1：带掩码的多头自注意力" highlight={highlight}>
                <h5>做什么？</h5>
                <p>这是解码器的第一个关键子层。它与编码器的自注意力机制几乎完全相同，但有一个至关重要的区别：<b>前瞻遮罩 (Look-Ahead Mask)</b>。</p>
                <h5>设计思路</h5>
                <p>在生成任务中，模型在预测第 <code>i</code> 个词时，只能看到第 <code>i</code> 个词之前（包括第 <code>i</code> 个词）的内容，绝不能“偷看”未来的词。为了在并行的矩阵运算中实现这一点，我们在计算注意力分数后，会应用一个遮罩。这个遮罩将分数矩阵 <InlineMath math="S"/> 的上三角部分（代表未来位置）设置为一个非常大的负数（-∞）。这样，在经过 Softmax 运算后，这些位置的注意力权重将变为0，从而确保了模型无法关注未来的信息。</p>
                 <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={HNd_masked.Scores} rows={dims.seq_len} cols={dims.seq_len} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                    <BlockMath math={`\\xrightarrow{\\text{Mask}}`} />
                    <p>上三角区域被设为-∞</p>
                </div>
            </MathBlock>
            <MathBlock id="add_norm_1_dec" title="解码器组件：残差连接与层归一化 (1)" highlight={highlight}>
                <p>此模块接收解码器输入 <InlineMath math="Y_{in}"/> 和带掩码自注意力子层的输出 <InlineMath math="M_{mmha}"/>，将它们相加后进行层归一化。这确保了模型既能利用新的上下文信息，又不会忘记原始的输入信息。</p>
                <BlockMath math={`Y' = \\text{LayerNorm}(Y_{in} + \\text{Masked-MHA}(Y_{in}))`} />
                 <div className={`formula-display ${shouldBreakAddNorm ? 'vertical' : ''}`}>
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNd.decoder_input} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="+" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNd.masked_mha_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="\xrightarrow{\text{LayerNorm}}" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNd.add_norm_1_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>
            </MathBlock>
             <MathBlock id="enc_dec_mha" title="解码器子层2：编码器-解码器注意力" highlight={highlight}>
                <h5>做什么？</h5>
                <p>这是连接编码器和解码器的桥梁，也是 Transformer 架构的精髓所在。在这一层，解码器会“审视”编码器的全部输出，并判断输入序列中的哪些部分对于生成当前目标词最重要。</p>
                 <h5>计算流程</h5>
                <ol>
                    <li><b>Query (<InlineMath math="Q"/>)</b>: 来自解码器前一层的输出 (<InlineMath math="Y'"/>)。它代表了“我当前需要什么信息来生成下一个词？”</li>
                    <li><b>Key (<InlineMath math="K"/>) 和 Value (<InlineMath math="V"/>)</b>: <b>均来自编码器的最终输出 (<InlineMath math="Z_{enc}"/>)</b>。它们代表了整个输入序列的上下文信息。</li>
                </ol>
                <p>通过计算 <InlineMath math="Q_{dec} \cdot K_{enc}^T"/>，解码器能够评估其当前的生成需求与输入序列中每个词的相关性，然后利用这个相关性（注意力权重）从 <InlineMath math="V_{enc}"/> 中加权提取最需要的信息来辅助生成。</p>
            </MathBlock>
            <MathBlock id="add_norm_2_dec" title="解码器组件：残差连接与层归一化 (2)" highlight={highlight}>
                <p>此步骤结合了编码器-解码器注意力子层的输入 (<InlineMath math="Y'"/>) 与其输出 (<InlineMath math="M_{ed}"/>)，并进行层归一化，以稳定训练过程并融合来自编码器的信息。</p>
                 <BlockMath math={`Y'' = \\text{LayerNorm}(Y' + \\text{Enc-Dec-MHA}(Y', Z_{enc}))`} />
                  <div className={`formula-display ${shouldBreakAddNorm ? 'vertical' : ''}`}>
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNd.add_norm_1_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="+" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNd.enc_dec_mha_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="\xrightarrow{\text{LayerNorm}}" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNd.add_norm_2_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>
            </MathBlock>
            <MathBlock id="ffn_dec" title="解码器子层3：前馈网络" highlight={highlight}>
                <p>与编码器中的 FFN 类似，解码器中的前馈网络 (FFN) 也对每个位置的向量 (<InlineMath math="Y''"/>) 独立地进行一次复杂的非线性变换，进一步增强模型的表达能力，为最终的输出预测做准备。</p>
                <BlockMath math={`F = \\text{ReLU}(Y'' W_1 + b_1) W_2 + b_2`} />
                 <div className="formula-display vertical">
                     <div className="viz-formula-row">
                        <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNd.add_norm_2_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                    </div>
                    <BlockMath math="\times"/>
                    <div className="viz-formula-row">
                        <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNd.W1} rows={dims.d_model} cols={dims.d_ff} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                    </div>
                    <BlockMath math="+"/>
                    <div className="viz-formula-row">
                        <div className="matrix-scroll-wrapper"><InteractiveSymbolicVector name={LNd.b1} data={Array(dims.d_ff).fill(0)} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                    </div>
                    <BlockMath math="\xrightarrow{ReLU}"/>
                    <div className="viz-formula-row">
                        <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNd.Activated} rows={dims.seq_len} cols={dims.d_ff} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                    </div>
                </div>
            </MathBlock>
            <MathBlock id="add_norm_3_dec" title="解码器组件：残差连接与层归一化 (3)" highlight={highlight}>
                 <p>这是解码器层中的最后一个 Add & Norm 步骤，它将 FFN 的输入 (<InlineMath math="Y''"/>) 与其输出 (<InlineMath math="F"/>) 相结合，产生该解码器层的最终输出 <InlineMath math="Y_{final}"/>。</p>
                 <BlockMath math={`Y_{final} = \\text{LayerNorm}(Y'' + \\text{FFN}(Y''))`} />
                 <div className={`formula-display ${shouldBreakAddNorm ? 'vertical' : ''}`}>
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNd.add_norm_2_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="+" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNd.ffn_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="\xrightarrow{\text{LayerNorm}}" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNd.add_norm_3_output} rows={dims.seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>
            </MathBlock>
             <MathBlock id="final_output" title="最终输出层：线性层与Softmax" highlight={highlight}>
                <h5>做什么？</h5>
                <p>在经过所有解码器层的处理后，我们得到一个最终的输出矩阵。此步骤将其转换为每个位置上词汇表中所有单词的概率分布。</p>
                 <h5>计算流程</h5>
                <ol>
                    <li><b>线性层 (Linear Layer):</b> 将解码器输出矩阵通过一个大的线性投影层，将其维度从 <InlineMath math="d_{model}"/> 扩展到词汇表大小 (<InlineMath math="V_{size}"/>)。这会为每个位置生成一个分数向量，称为 Logits。</li>
                    <li><b>Softmax:</b> 对 Logits 矩阵的每一行应用 Softmax 函数，将其转换为概率分布。</li>
                </ol>
                 <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={MATRIX_NAMES.finalLinear} rows={dims.d_model} cols={50} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                    <BlockMath math="\xrightarrow{\text{Softmax}}" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={MATRIX_NAMES.outputProbabilities} rows={dims.seq_len} cols={50} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                </div>
                 <p>现在，矩阵 <InlineMath math="P"/> 中的每一行都是一个概率分布，代表了在那个位置上生成词汇表中任何一个单词的可能性。</p>
            </MathBlock>
            <MathBlock id="decoding" title="最终解码：Argmax 与文本生成" highlight={highlight}>
                <h5>做什么？</h5>
                <p>这是生成过程的最后一步，将代表概率的数字变回人类可读的文本。</p>
                <h5>计算流程</h5>
                <ol>
                    <li><b>Argmax:</b> 对概率矩阵 <InlineMath math="P"/> 的每一行，找到其中概率值最大的那个元素的**索引 (index)**。这个索引就对应了词汇表中该位置最有可能的词元ID。这个过程通常被称为“贪心解码 (Greedy Decoding)”。</li>
                    <li><b>ID到文本映射:</b> 将得到的词元ID序列，通过反向查询词汇表，映射回原始的文本词元。</li>
                </ol>
                <p>这样，模型就完成了一次从输入文本到输出文本的完整预测。</p>
            </MathBlock>
        </div>
    );
};
// END OF FILE: src/components/Explanation.tsx