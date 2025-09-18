// FILE: src/topics/refactored-transformer-explorer/components/Explanation.tsx
import React from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import { HighlightState, ElementIdentifier } from '../../transformer-explorer/types'; // Reuse types
import { InteractiveSymbolicMatrix } from '../../transformer-explorer/components/InteractiveSymbolicMatrix'; // Reuse symbolic components

// [CORE] This is a new, more detailed explanation file for the refactored topic.

interface ExplanationProps {
    dims: { d_model: number; h: number, n_layers: number, d_ff: number, encoder_seq_len: number, decoder_seq_len: number, vocab_size: number };
    highlight: HighlightState;
    onSymbolClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
}

const MathBlock: React.FC<{ id: string; title: string; children: React.ReactNode; highlight: HighlightState; }> = ({ id, title, children, highlight }) => {
    const isActive = highlight.activeComponent === id;
    return (
        <div id={`math_${id}`} className={`math-block ${isActive ? 'active' : ''}`}>
            <h3>{title}</h3>
            {children}
        </div>
    );
};

export const Explanation: React.FC<ExplanationProps> = ({ dims, highlight, onSymbolClick }) => {
    return (
        <div>
            <MathBlock id="token_embed" title="第1步: 分词与词嵌入 (Tokenization & Embedding)" highlight={highlight}>
                <h5>核心任务</h5>
                <p>此步骤将自然语言文本（如 "I am a student"）转换为模型能够理解的数值矩阵。这是连接人类语言与机器世界的桥梁，也是所有后续计算的起点。</p>
                <h5>计算流程</h5>
                <ol>
                    <li><b>分词 (Tokenization):</b> 将输入句子分解为一个个独立的词元 (Token)。真实世界的模型会使用更复杂的算法处理未知词和构词法。</li>
                    <li><b>ID 映射 (ID Mapping):</b> 使用一个预构建的词汇表 (Vocabulary)，将每个词元映射到一个唯一的整数 ID。</li>
                    <li><b>词嵌入 (Embedding Lookup):</b> 这是一个“查字典”的过程。我们使用一个巨大的、在训练中学习到的“词嵌入矩阵”，根据每个词元的 ID，从中“提取”出对应的向量。这个向量就是该词元的初始数值表示，它捕捉了词语丰富的语义信息。</li>
                </ol>
                <p>最终，我们得到一个形状为 <InlineMath math={`(S_{enc}, d_{model})`}/> 的矩阵，其中 <InlineMath math={`S_{enc}`}/> 是输入序列长度，<InlineMath math={`d_{model}`}/> 是模型的隐藏维度。</p>
            </MathBlock>

            <MathBlock id="input_embed" title="第2步: 位置编码 (Positional Encoding)" highlight={highlight}>
                <h5>核心任务</h5>
                <p>Transformer 的核心自注意力机制本身是“无视顺序”的。为了让模型理解单词在句子中的位置（例如，“你爱我”和“我爱你”的区别），我们必须注入位置信息。<b>位置编码</b>就是解决这个问题的关键。</p>
                <h5>计算流程</h5>
                <p>我们创建一个与词嵌入矩阵形状相同的“位置编码矩阵”。这个矩阵的值不是学习来的，而是根据固定的三角函数（sine 和 cosine）公式生成。然后，将这个位置编码矩阵与词嵌入矩阵**逐元素相加**，将位置信息融入到每个词的向量表示中。</p>
                <BlockMath math={`Z_0 = \text{Embedding}(X) + \text{PositionalEncoding}(X)`} />
            </MathBlock>

            <h2 style={{textAlign: 'center', margin: '30px 0'}}>编码器 (Encoder)</h2>
            <MathBlock id="mha" title="编码器子层1: 多头自注意力 (Multi-Head Self-Attention)" highlight={highlight}>
                <h5>核心任务</h5>
                <p>自注意力的目的是让句子中的每个词都能“看到”其他所有词，并计算出它们之间的“相关性”或“关注度”。根据这个关注度，模型会重新计算每个词的向量表示，使其融入丰富的上下文信息。</p>
                <h5>计算流程 (以单头为例)</h5>
                <p>输入矩阵 <InlineMath math="Z"/> 被送入 <InlineMath math={`h=${dims.h}`}/> 个独立的注意力头。每个头都拥有三块自己专属的可学习权重矩阵 <InlineMath math="(W_Q, W_K, W_V)"/>，用于将输入投影到三个新的矩阵：查询 (Query, <InlineMath math="Q"/>), 键 (Key, <InlineMath math="K"/>), 和 值 (Value, <InlineMath math="V"/>)。</p>
                <BlockMath math={`\text{Attention}(Q, K, V) = \text{softmax}(\frac{QK^T}{\sqrt{d_k}})V`} />
                <p>这个公式包含了几个关键步骤：</p>
                <ol>
                    <li><b>计算分数:</b> <InlineMath math="Q"/> 和 <InlineMath math="K^T"/> 相乘，计算出每个词的“查询”与所有词的“键”之间的相似度分数。</li>
                    <li><b>缩放:</b> 将分数除以 <InlineMath math="\sqrt{d_k}"/> 来稳定梯度。</li>
                    <li><b>Softmax:</b> 将分数转换为和为1的概率分布，即“注意力权重”。</li>
                    <li><b>加权求和:</b> 将权重与 <InlineMath math="V"/> 相乘，对所有词的信息进行加权求和，得到融合了上下文的新向量。</li>
                </ol>
                <p>最后，将所有 <InlineMath math={`h`}/> 个头的输出拼接起来，并通过一个最终的投影矩阵 <InlineMath math="W^O"/> 将其维度变回 <InlineMath math={`d_{model}`}/>。</p>
            </MathBlock>

            <MathBlock id="add_norm_1" title="组件: 残差连接与层归一化 (Add & Norm)" highlight={highlight}>
                <p>在每个子层（如自注意力、前馈网络）之后，都会跟随一个“Add & Norm”模块。它包含两个关键步骤：<b>残差连接</b> 和 <b>层归一化</b>，这是训练深度网络的关键技巧。</p>
                <ul>
                    <li><b>残差连接 (Add):</b> 将子层的输入与输出直接相加。这创建了一条信息的“高速公路”，极大地缓解了深度网络中的梯度消失问题。</li>
                    <li><b>层归一化 (Norm):</b> 对相加后的结果进行归一化，使其均值为0，方差为1，从而加速并稳定训练过程。</li>
                </ul>
                <BlockMath math={`Z' = \text{LayerNorm}(Z + \text{MultiHeadAttention}(Z))`} />
            </MathBlock>

            <MathBlock id="ffn" title="编码器子层2: 前馈网络 (Feed-Forward Network)" highlight={highlight}>
                <p>前馈网络 (FFN) 对每个位置的向量独立地进行一次复杂的非线性变换，极大地增加了模型的表达能力。如果说自注意力层负责“交流信息”，那么FFN层就是每个词在接收上下文信息后进行独立的“深入思考和加工”。</p>
                <BlockMath math={`\text{FFN}(Z') = \text{ReLU}(Z' W_1 + b_1) W_2 + b_2`} />
            </MathBlock>

            <h2 style={{textAlign: 'center', margin: '30px 0'}}>解码器 (Decoder)</h2>
            <MathBlock id="masked_mha" title="解码器子层1: 带掩码的多头自注意力" highlight={highlight}>
                <p>解码器的自注意力与编码器基本相同，但增加了一个关键的“前瞻遮罩”(Look-Ahead Mask)。在生成任务中，模型预测第 `i` 个词时，绝不能“偷看”未来的词。该掩码通过将注意力分数矩阵的上三角部分设为-∞来实现这一点，确保了模型的自回归特性。</p>
            </MathBlock>
            <MathBlock id="enc_dec_mha" title="解码器子层2: 编码器-解码器注意力" highlight={highlight}>
                <p>这是连接编码器和解码器的桥梁。在这里，解码器会“审视”编码器的全部输出，判断输入序列的哪些部分对生成当前目标词最重要。这也被称为“交叉注意力”(Cross-Attention)。</p>
                <p>其关键区别在于：<b>Query (<InlineMath math="Q"/>)</b> 来自解码器前一层的输出，而 <b>Key (<InlineMath math="K"/>) 和 Value (<InlineMath math="V"/>)</b> 均来自编码器的最终输出。</p>
            </MathBlock>
            <MathBlock id="final_output" title="最终输出层: 线性层与Softmax" highlight={highlight}>
                <p>在所有解码器层处理完毕后，最终的输出矩阵通过一个线性层投影到整个词汇表的维度，得到 Logits 分数。然后，通过 Softmax 函数将这些分数转换为概率分布，表示在当前位置生成词汇表中每个单词的可能性。</p>
            </MathBlock>
        </div>
    );
};
// END OF FILE: src/topics/refactored-transformer-explorer/components/Explanation.tsx