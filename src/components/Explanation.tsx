// FILE: src/components/Explanation.tsx
import React from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import { InteractiveSymbolicMatrix } from './InteractiveSymbolicMatrix';
import { InteractiveSymbolicVector } from './InteractiveSymbolicVector';
import { HighlightState, ElementIdentifier } from '../types';
import { MATRIX_NAMES } from '../config/matrixNames';

interface ExplanationProps {
    dims: { d_model: number; h: number, n_layers: number, d_ff: number, encoder_seq_len: number, decoder_seq_len: number, vocab_size: number };
    highlight: HighlightState;
    onSymbolClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
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
    const FinalLNe = MATRIX_NAMES.layer(dims.n_layers - 1);
    const HNe = MATRIX_NAMES.head(0, 0);
    const LNd = MATRIX_NAMES.decoderLayer(0);
    const FinalLNd = MATRIX_NAMES.decoderLayer(dims.n_layers - 1);
    const HNd_masked = MATRIX_NAMES.maskedMhaHead(0, 0);
    const HNd_encdec = MATRIX_NAMES.encDecMhaHead(0, 0);
    const d_k = dims.d_model / dims.h;

    const shouldBreakAddNorm = dims.d_model > 8;
    const shouldBreakMhaProj = dims.d_model > 8;
    const shouldBreakFFN1 = dims.d_model + dims.d_ff > 8;
    const shouldBreakFFN2 = dims.d_ff + dims.d_model > 8;
    const shouldBreakFinalOutput = dims.d_model + dims.vocab_size > 8;


    return (
        <div>
            <div className="math-block">
                <h3>Transformer 架构概览</h3>
                <p>Transformer 模型由两个核心部分组成:<b>编码器 (Encoder)</b> 和 <b>解码器 (Decoder)</b>. 编码器的任务是“理解”输入的整个句子(例如,"I am a student"),并将其转化为一组富含上下文信息的数字表示. 解码器的任务是利用这些数字表示,并结合已经生成的内容,一次一个词地生成目标句子(例如,“我 是 一个 学生”). </p>
                <p>在2017年的原始论文《Attention Is All You Need》中,编码器和解码器都由 N 个相同的层堆叠而成. 此可视化工具将带您深入探索其内部的数据流动和数学原理. </p>
            </div>

            {/* --- ENCODER EXPLANATIONS --- */}
            <h2 style={{textAlign: 'center', margin: '30px 0'}}>编码器 (Encoder)</h2>
             <MathBlock id="token_embed" title="编码器第0步:分词与词嵌入" highlight={highlight}>
                <h5>做什么？</h5>
                <p>此步骤将您在上方控件中输入的自然语言文本,转换为模型可以处理的数值矩阵. 这是所有后续计算的起点. </p>
                <h5>计算流程</h5>
                <ol>
                    <li><b>分词 (Tokenization):</b> 使用简单的空格分词器,将输入句子分解为一个个独立的词元(Token). </li>
                    <li><b>ID映射 (ID Mapping):</b> 使用一个预先构建好的词汇表(Vocabulary),将每个词元映射到一个唯一的整数ID. 任何未知的词汇都会被映射为 <code>[UNK]</code> (Unknown). </li>
                    <li><b>词嵌入 (Embedding Lookup):</b> 使用一个巨大的、可学习的“查询表”(Embedding Matrix),根据每个词元的ID,从中“提取”出对应的向量. 这个向量就是该词元的初始数值表示. </li>
                </ol>
                <h5>深入理解:从文本到向量的“魔法”</h5>
                <p>您可能会问:“一个词(比如'student')是如何变成一长串数字(向量)的？” 关键在于那块巨大的 <b>词嵌入矩阵 (Embedding Matrix)</b>. </p>
                <p>您可以把这个矩阵想象成一本**模型在训练中自己学会编写的“超级词典”**:</p>
                <ul>
                    <li><b>词条编号 (Token ID):</b> 词汇表中的每个词都有一个独一无二的ID,比如 `student` 的ID是 `6`. 这就像是词典里的页码或词条号. </li>
                    <li><b>词条释义 (Embedding Vector):</b> 矩阵中**第 `6` 行**的那一整行向量,就是 `student` 这个词的“释义”. 这个释义不是用人类语言写的,而是用一串数字(例如一个长度为 {dims.d_model} 的向量)来定义的. 这个向量捕捉了 `student` 这个词的丰富语义信息——它和 `school`、`learn` 在语义空间中比较接近,但和 `apple`、`sky` 比较疏远. </li>
                </ul>
                <p>所以,整个过程并不是“计算”出一个向量,而是一个高效的**“查词典”**的过程. 模型通过海量数据的训练,学会了如何为每个词编写最精准的、富含信息的“数字释义”,我们在这里只是根据ID去查询而已. </p>
            </MathBlock>
            <MathBlock id="input_embed" title="编码器第1步:输入预处理" highlight={highlight}>
                <h5>做什么？</h5>
                <p>此步骤将输入的文本序列(一串文字)转换为模型可以处理的、包含“词义”和“位置”信息的数值向量矩阵. 当前输入序列长度为 {dims.encoder_seq_len},模型维度 <InlineMath math={`d_{model}=${dims.d_model}`}/>. </p>
                <h5>计算流程</h5>
                <ol>
                    <li><b>词嵌入 (Token Embedding):</b> 从上一步获得的矩阵,代表了每个词的“词义”. </li>
                    <li><b>位置编码 (Positional Encoding):</b> 为模型注入关于序列顺序的绝对位置信息. 这是一个固定的、根据三角函数生成的矩阵. </li>
                    <li><b>逐元素相加:</b> 得到编码器最终的输入表示 <InlineMath math="Z"/>. </li>
                </ol>
                <div className={`formula-display ${shouldBreakAddNorm ? 'vertical' : ''}`}>
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={MATRIX_NAMES.inputEmbeddings} rows={dims.encoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="+" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={MATRIX_NAMES.posEncodings} rows={dims.encoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="=" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNe.encoder_input} rows={dims.encoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>
            </MathBlock>
            <MathBlock id="mha" title="编码器子层1:多头自注意力" highlight={highlight}>
                <h5>做什么？</h5>
                <p>此机制的核心目的是计算句子中每个词与其他所有词的“关注度”或“相关性”,并根据这个关注度重新计算每个词的向量表示,从而让每个词的向量都融入其上下文信息. </p>
                <h5>输入矩阵 (Input Matrix)</h5>
                <div className="formula-display">
                    <InlineMath math="\text{Input} = " />
                    <InteractiveSymbolicMatrix name={LNe.encoder_input} rows={dims.encoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} truncate={false} />
                </div>
                <h5>计算流程 (以单个注意力头为例)</h5>
                 <p>输入矩阵 <InlineMath math="Z"/> 被并行地送入 {dims.h} 个独立的注意力头. 每个头都拥有三块自己专属、可学习的权重矩阵. 通过矩阵乘法,将输入 <InlineMath math="Z"/> 投影到三个新的矩阵:查询 (Query, <InlineMath math="Q"/>), 键 (Key, <InlineMath math="K"/>), 和 值 (Value, <InlineMath math="V"/>). </p>
                <div className="formula-display vertical">
                    <div className="viz-formula-row"><InlineMath math="Z" /><BlockMath math="\times" /><InteractiveSymbolicMatrix name={HNe.Wq} rows={dims.d_model} cols={d_k} highlight={highlight} onSymbolClick={onSymbolClick} /><BlockMath math="=" /><InteractiveSymbolicMatrix name={HNe.Q} rows={dims.encoder_seq_len} cols={d_k} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <div className="viz-formula-row"><InlineMath math="Z" /><BlockMath math="\times" /><InteractiveSymbolicMatrix name={HNe.Wk} rows={dims.d_model} cols={d_k} highlight={highlight} onSymbolClick={onSymbolClick} /><BlockMath math="=" /><InteractiveSymbolicMatrix name={HNe.K} rows={dims.encoder_seq_len} cols={d_k} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <div className="viz-formula-row"><InlineMath math="Z" /><BlockMath math="\times" /><InteractiveSymbolicMatrix name={HNe.Wv} rows={dims.d_model} cols={d_k} highlight={highlight} onSymbolClick={onSymbolClick} /><BlockMath math="=" /><InteractiveSymbolicMatrix name={HNe.V} rows={dims.encoder_seq_len} cols={d_k} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>
                <p>然后计算注意力分数, 进行缩放和Softmax得到权重, 最后加权求和. </p>
                <BlockMath math={`A = \\text{Softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)`} />
                <BlockMath math={`H = A V`} />
                 <div className="formula-display vertical">
                    <div className="viz-formula-row"><InteractiveSymbolicMatrix name={HNe.AttentionWeights} rows={dims.encoder_seq_len} cols={dims.encoder_seq_len} highlight={highlight} onSymbolClick={onSymbolClick} /><BlockMath math="\times" /><InteractiveSymbolicMatrix name={HNe.V} rows={dims.encoder_seq_len} cols={d_k} highlight={highlight} onSymbolClick={onSymbolClick} /><BlockMath math="=" /><InteractiveSymbolicMatrix name={HNe.HeadOutput} rows={dims.encoder_seq_len} cols={d_k} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>
                <h5>拼接与最终投影</h5>
                <p>将所有 {dims.h} 个头的输出矩阵 <InlineMath math="H_i"/> 拼接 (Concatenate) 起来, 然后通过一个最终的投影权重矩阵 <InlineMath math="W^O"/> 得到该子层的最终输出 <InlineMath math="M"/>. </p>
                 <div className={`formula-display ${shouldBreakMhaProj ? 'vertical' : ''}`}>
                    <InlineMath math="\text{Concat}(H_0, ..., H_{h-1})" />
                    <BlockMath math="\times" />
                    <InteractiveSymbolicMatrix name={LNe.Wo} rows={dims.d_model} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} />
                    <BlockMath math="=" />
                    <InteractiveSymbolicMatrix name={LNe.mha_output} rows={dims.encoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} />
                </div>
            </MathBlock>
            <MathBlock id="add_norm_1" title="组件:残差连接与层归一化 (1)" highlight={highlight}>
                <p>在每个子层之后,都会跟随一个“Add & Norm”模块. 它包含两个关键步骤:<b>残差连接</b>将子层的输入与输出直接相加,缓解梯度消失;<b>层归一化</b>则稳定训练过程. </p>
                <BlockMath math={`Z' = \\text{LayerNorm}(Z + \\text{MultiHeadAttention}(Z))`} />
                 <div className={`formula-display ${shouldBreakAddNorm ? 'vertical' : ''}`}>
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNe.encoder_input} rows={dims.encoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="+" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNe.mha_output} rows={dims.encoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="\xrightarrow{\text{LayerNorm}}" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNe.add_norm_1_output} rows={dims.encoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>
            </MathBlock>
            <MathBlock id="ffn" title="编码器子层2:位置前馈网络" highlight={highlight}>
                <p>前馈网络 (FFN) 对每个位置的向量独立地进行一次复杂的非线性变换,极大地增加了模型的表达能力. </p>
                <BlockMath math={`F = \\text{ReLU}(Z' W_1 + b_1) W_2 + b_2`} />
                <h5>第一次线性变换 & ReLU</h5>
                <div className={`formula-display ${shouldBreakFFN1 ? 'vertical' : ''}`}>
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNe.add_norm_1_output} rows={dims.encoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                    <BlockMath math="\times"/>
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNe.W1} rows={dims.d_model} cols={dims.d_ff} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                    <BlockMath math="+"/>
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicVector name={LNe.b1} data={Array(dims.d_ff).fill(0)} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                </div>
                 <div className="formula-display vertical">
                    <BlockMath math="=" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNe.Intermediate} rows={dims.encoder_seq_len} cols={dims.d_ff} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                    <BlockMath math="\xrightarrow{ReLU}"/>
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNe.Activated} rows={dims.encoder_seq_len} cols={dims.d_ff} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                </div>
                <h5>第二次线性变换</h5>
                <div className={`formula-display ${shouldBreakFFN2 ? 'vertical' : ''}`}>
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNe.Activated} rows={dims.encoder_seq_len} cols={dims.d_ff} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                    <BlockMath math="\times"/>
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNe.W2} rows={dims.d_ff} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                    <BlockMath math="+"/>
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicVector name={LNe.b2} data={Array(dims.d_model).fill(0)} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                    <BlockMath math="="/>
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNe.ffn_output} rows={dims.encoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                </div>
            </MathBlock>
            <MathBlock id="add_norm_2" title="组件:残差连接与层归一化 (2)" highlight={highlight}>
                <p>与第一个 "Add & Norm" 层完全相同,此步骤将 FFN 子层的输出与输入结合,产生该编码器层的最终输出. </p>
                 <div className={`formula-display ${shouldBreakAddNorm ? 'vertical' : ''}`}>
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNe.add_norm_1_output} rows={dims.encoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="+" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNe.ffn_output} rows={dims.encoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="\xrightarrow{\text{LayerNorm}}" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNe.add_norm_2_output} rows={dims.encoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>
            </MathBlock>

            {/* --- DECODER EXPLANATIONS --- */}
            <h2 style={{textAlign: 'center', margin: '30px 0'}}>解码器 (Decoder)</h2>
            <MathBlock id="output_embed" title="解码器第1步:输出预处理" highlight={highlight}>
                 <h5>做什么？</h5>
                <p>此步骤与编码器输入预处理类似,但作用于目标语言序列(即解码器要生成的内容). 它将目标序列(通常是已经生成的词加上一个起始符)转换为模型可以处理的数值向量矩阵. </p>
                 <div className={`formula-display ${shouldBreakAddNorm ? 'vertical' : ''}`}>
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={MATRIX_NAMES.outputEmbeddings} rows={dims.decoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="+" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={MATRIX_NAMES.decoderPosEncodings} rows={dims.decoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="=" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNd.decoder_input} rows={dims.decoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>
            </MathBlock>
            <MathBlock id="masked_mha" title="解码器子层1:带掩码的多头自注意力" highlight={highlight}>
                <h5>做什么？</h5>
                <p>这是解码器的第一个关键子层. 它与编码器的自注意力机制几乎完全相同,但有一个至关重要的区别:<b>前瞻遮罩 (Look-Ahead Mask)</b>. </p>
                <h5>设计思路</h5>
                <p>在生成任务中,模型在预测第 <code>i</code> 个词时,只能看到第 <code>i</code> 个词之前(包括第 <code>i</code> 个词)的内容,绝不能“偷看”未来的词. 为了在并行的矩阵运算中实现这一点,我们在计算注意力分数后,会应用一个遮罩. 这个遮罩将分数矩阵 <InlineMath math="S"/> 的上三角部分(代表未来位置)设置为一个非常大的负数(-∞). 这样,在经过 Softmax 运算后,这些位置的注意力权重将变为0,从而确保了模型无法关注未来的信息. </p>
                 <div className="formula-display">
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={HNd_masked.Scores} rows={dims.decoder_seq_len} cols={dims.decoder_seq_len} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                    <BlockMath math={`\\xrightarrow{\\text{Mask}}`} />
                    <p>上三角区域被设为-∞</p>
                </div>
                 <h5>计算流程</h5>
                <p>除了应用掩码外,后续计算与编码器自注意力完全相同.</p>
                <BlockMath math={`H = \\text{Softmax}\\left(\\text{Mask}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)\\right) V`} />
                 <div className={`formula-display ${shouldBreakMhaProj ? 'vertical' : ''}`}>
                    <InlineMath math="\text{Concat}(H_0, ..., H_{h-1})" />
                    <BlockMath math="\times" />
                    <InteractiveSymbolicMatrix name={LNd.Wo_masked} rows={dims.d_model} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} />
                    <BlockMath math="=" />
                    <InteractiveSymbolicMatrix name={LNd.masked_mha_output} rows={dims.decoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} />
                </div>
            </MathBlock>
            <MathBlock id="add_norm_1_dec" title="解码器组件:残差连接与层归一化 (1)" highlight={highlight}>
                <p>此模块接收解码器输入 <InlineMath math="Y"/> 和带掩码自注意力子层的输出 <InlineMath math="M_{mmha}"/>,将它们相加后进行层归一化. </p>
                <BlockMath math={`Y' = \\text{LayerNorm}(Y + \\text{Masked-MHA}(Y))`} />
                 <div className={`formula-display ${shouldBreakAddNorm ? 'vertical' : ''}`}>
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNd.decoder_input} rows={dims.decoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="+" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNd.masked_mha_output} rows={dims.decoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="\xrightarrow{\text{LayerNorm}}" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNd.add_norm_1_output} rows={dims.decoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>
            </MathBlock>
             <MathBlock id="enc_dec_mha" title="解码器子层2:编码器-解码器注意力" highlight={highlight}>
                <h5>做什么？</h5>
                <p>这是连接编码器和解码器的桥梁,也是 Transformer 架构的精髓所在. 在这一层,解码器会“审视”编码器的全部输出,并判断输入序列中的哪些部分对于生成当前目标词最重要. </p>
                 <h5>输入矩阵</h5>
                 <div className="formula-display vertical">
                    <div>
                        <p style={{textAlign: 'center', marginBottom: '5px'}}>Query Input (from Decoder):</p>
                        <InteractiveSymbolicMatrix name={LNd.add_norm_1_output} rows={dims.decoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} truncate={false}/>
                    </div>
                     <div style={{marginTop: '15px'}}>
                        <p style={{textAlign: 'center', marginBottom: '5px'}}>Key/Value Input (from Encoder):</p>
                        <InteractiveSymbolicMatrix name={FinalLNe.add_norm_2_output} rows={dims.encoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} truncate={false}/>
                    </div>
                 </div>
                 <h5>计算流程</h5>
                <ol>
                    <li><b>Query (<InlineMath math="Q"/>)</b>: 来自解码器前一层的输出 (<InlineMath math="Y'"/>). 它代表了“我当前需要什么信息来生成下一个词？”</li>
                    <li><b>Key (<InlineMath math="K"/>) 和 Value (<InlineMath math="V"/>)</b>: <b>均来自编码器的最终输出 (<InlineMath math="Z_{final}"/>)</b>. 它们代表了整个输入序列的上下文信息. </li>
                </ol>
                 <div className="formula-display vertical">
                    <div className="viz-formula-row"><InlineMath math="Y'" /><BlockMath math="\times" /><InteractiveSymbolicMatrix name={HNd_encdec.Wq} rows={dims.d_model} cols={d_k} highlight={highlight} onSymbolClick={onSymbolClick} /><BlockMath math="=" /><InteractiveSymbolicMatrix name={HNd_encdec.Q} rows={dims.decoder_seq_len} cols={d_k} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <div className="viz-formula-row"><InlineMath math="Z_{final}" /><BlockMath math="\times" /><InteractiveSymbolicMatrix name={HNd_encdec.Wk} rows={dims.d_model} cols={d_k} highlight={highlight} onSymbolClick={onSymbolClick} /><BlockMath math="=" /><InteractiveSymbolicMatrix name={HNd_encdec.K} rows={dims.encoder_seq_len} cols={d_k} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <div className="viz-formula-row"><InlineMath math="Z_{final}" /><BlockMath math="\times" /><InteractiveSymbolicMatrix name={HNd_encdec.Wv} rows={dims.d_model} cols={d_k} highlight={highlight} onSymbolClick={onSymbolClick} /><BlockMath math="=" /><InteractiveSymbolicMatrix name={HNd_encdec.V} rows={dims.encoder_seq_len} cols={d_k} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>
                <p>通过计算 <InlineMath math="Q_{dec} \cdot K_{enc}^T"/>,解码器能够评估其当前的生成需求与输入序列中每个词的相关性,然后利用这个相关性(注意力权重)从 <InlineMath math="V_{enc}"/> 中加权提取最需要的信息来辅助生成. </p>
            </MathBlock>
            <MathBlock id="add_norm_2_dec" title="解码器组件:残差连接与层归一化 (2)" highlight={highlight}>
                <p>此步骤结合了编码器-解码器注意力子层的输入 (<InlineMath math="Y'"/>) 与其输出 (<InlineMath math="M_{ed}"/>),并进行层归一化,以稳定训练过程并融合来自编码器的信息. </p>
                 <BlockMath math={`Y'' = \\text{LayerNorm}(Y' + \\text{Enc-Dec-MHA}(Y', Z_{final}))`} />
                  <div className={`formula-display ${shouldBreakAddNorm ? 'vertical' : ''}`}>
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNd.add_norm_1_output} rows={dims.decoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="+" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNd.enc_dec_mha_output} rows={dims.decoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="\xrightarrow{\text{LayerNorm}}" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNd.add_norm_2_output} rows={dims.decoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>
            </MathBlock>
            <MathBlock id="ffn_dec" title="解码器子层3:前馈网络" highlight={highlight}>
                <p>与编码器中的 FFN 类似,解码器中的前馈网络 (FFN) 也对每个位置的向量 (<InlineMath math="Y''"/>) 独立地进行一次复杂的非线性变换,进一步增强模型的表达能力,为最终的输出预测做准备. </p>
                <BlockMath math={`F = \\text{ReLU}(Y'' W_1 + b_1) W_2 + b_2`} />
                 <div className="formula-display vertical">
                     <div className="viz-formula-row"><InteractiveSymbolicMatrix name={LNd.add_norm_2_output} rows={dims.decoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                    <BlockMath math="\times"/>
                    <div className="viz-formula-row"><InteractiveSymbolicMatrix name={LNd.W1} rows={dims.d_model} cols={dims.d_ff} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                    <BlockMath math="+"/>
                    <div className="viz-formula-row"><InteractiveSymbolicVector name={LNd.b1} data={Array(dims.d_ff).fill(0)} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                    <BlockMath math="\xrightarrow{ReLU}"/>
                    <div className="viz-formula-row"><InteractiveSymbolicMatrix name={LNd.Activated} rows={dims.decoder_seq_len} cols={dims.d_ff} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                </div>
            </MathBlock>
            <MathBlock id="add_norm_3_dec" title="解码器组件:残差连接与层归一化 (3)" highlight={highlight}>
                 <p>这是解码器层中的最后一个 Add & Norm 步骤,它将 FFN 的输入 (<InlineMath math="Y''"/>) 与其输出 (<InlineMath math="F"/>) 相结合,产生该解码器层的最终输出 <InlineMath math="Y_{final}"/>. </p>
                 <BlockMath math={`Y_{final} = \\text{LayerNorm}(Y'' + \\text{FFN}(Y''))`} />
                 <div className={`formula-display ${shouldBreakAddNorm ? 'vertical' : ''}`}>
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNd.add_norm_2_output} rows={dims.decoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="+" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNd.ffn_output} rows={dims.decoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                    <BlockMath math="\xrightarrow{\text{LayerNorm}}" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={LNd.add_norm_3_output} rows={dims.decoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick} /></div>
                </div>
            </MathBlock>
             <MathBlock id="final_output" title="最终输出层:线性层与Softmax" highlight={highlight}>
                <h5>做什么？</h5>
                <p>在经过所有解码器层的处理后,我们得到一个最终的输出矩阵. 此步骤将其转换为每个位置上词汇表中所有单词的概率分布. </p>
                 <h5>计算流程</h5>
                <ol>
                    <li><b>线性层 (Linear Layer):</b> 将解码器输出矩阵通过一个大的线性投影层,将其维度从 <InlineMath math="d_{model}"/> 扩展到词汇表大小 (<InlineMath math="V_{size}"/>). 这会为每个位置生成一个分数向量,称为 Logits. </li>
                    <li><b>Softmax:</b> 对 Logits 矩阵的每一行应用 Softmax 函数,将其转换为概率分布. </li>
                </ol>
                 <div className={`formula-display ${shouldBreakFinalOutput ? 'vertical' : ''}`}>
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={FinalLNd.add_norm_3_output} rows={dims.decoder_seq_len} cols={dims.d_model} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                    <BlockMath math="\times" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={MATRIX_NAMES.finalLinear} rows={dims.d_model} cols={dims.vocab_size} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                 </div>
                 <div className="formula-display">
                    <BlockMath math="=" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={MATRIX_NAMES.logits} rows={dims.decoder_seq_len} cols={dims.vocab_size} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                    <BlockMath math="\xrightarrow{\text{Softmax}}" />
                    <div className="matrix-scroll-wrapper"><InteractiveSymbolicMatrix name={MATRIX_NAMES.outputProbabilities} rows={dims.decoder_seq_len} cols={dims.vocab_size} highlight={highlight} onSymbolClick={onSymbolClick}/></div>
                </div>
                 <p>现在,矩阵 <InlineMath math="P"/> 中的每一行都是一个概率分布,代表了在那个位置上生成词汇表中任何一个单词的可能性. </p>
            </MathBlock>
            <MathBlock id="decoding" title="最终解码:Argmax 与文本生成" highlight={highlight}>
                <h5>做什么？</h5>
                <p>这是生成过程的最后一步,将代表概率的数字变回人类可读的文本. </p>
                <h5>计算流程</h5>
                <ol>
                    <li><b>Argmax:</b> 对概率矩阵 <InlineMath math="P"/> 的每一行,找到其中概率值最大的那个元素的<b>索引 (index)</b>. 这个索引就对应了词汇表中该位置最有可能的词元ID. 这个过程通常被称为“贪心解码 (Greedy Decoding)”. </li>
                    <li><b>ID到文本映射:</b> 将得到的词元ID序列,通过反向查询词汇表,映射回原始的文本词元. </li>
                </ol>
                <h5>深入理解:从向量到文本的“翻译”</h5>
                <p>这里是“魔法”发生逆转的地方. 我们手上有一个 <b>概率矩阵</b> <code>P</code>,它告诉我们在每个输出位置上,词汇表里每个单词的可能性. </p>
                <p>以第一个输出位置为例,我们关注矩阵 <code>P</code> 的<b>第一行</b> (下标为0的那一行). 这一行是一个概率向量,其长度等于整个词汇表的大小. 向量中第 <code>j</code> 个位置的数值,就代表词汇表中 ID 为 <code>j</code> 的单词是正确答案的概率. </p>
                <p><b>Argmax</b> 函数的作用非常简单:它会扫描这一整行,找到那个最大的概率值,然后返回它的<b>位置索引</b>. 这个索引就是模型预测出的 <b>Token ID！</b></p>
                <p>最后一步,我们拿着这个ID,去反查我们的“超级词典”(词汇表),就能找到ID对应的单词. 于是,模型就成功地将一串概率数字“翻译”回了人类能懂的单词. 对每一行都重复这个过程,就能生成整个句子. </p>
            </MathBlock>
        </div>
    );
};
// END OF FILE: src/components/Explanation.tsx
