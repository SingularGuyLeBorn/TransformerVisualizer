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
    const { d_head, d_model, seq_len, n_q_heads } = dims;

    const q_head_name = `${variant}.heads.0.Q`;
    const k_head_name = `${variant}.heads.0.K`;
    const v_head_name = `${variant}.heads.0.V`;
    const scores_name = `${variant}.heads.0.Scores`;
    const weights_name = `${variant}.heads.0.Weights`;
    const output_head_name = `${variant}.heads.0.Output`;
    const combined_name = `${variant}.combined`;
    const final_output_name = `${variant}.output`;

    const threshold = 8;
    const break_qkv_proj = (d_model + d_head + d_head) > threshold;
    const break_scores = (d_head + seq_len + seq_len) > threshold;
    const break_output = (seq_len + d_head + d_head) > threshold;
    const break_final = (n_q_heads * d_head + d_model + d_model) > threshold;

    return (
      <>
        <div className="attention-calculation-step">
          <div className="step-title">1. 线性投影与多头拆分</div>
           <p>输入 <strong>H</strong> 乘以权重矩阵 <strong>W</strong> 生成Q, K, V。在MHA中，每个头都有独立的 <InlineMath math="W_{Q,h}, W_{K,h}, W_{V,h}"/>。而在GQA/MQA中，K, V的权重矩阵是分组共享或完全共享的。Q的权重矩阵在所有变体中始终是每个头独立的。</p>
           <div className={`explanation-row ${break_qkv_proj ? 'vertical' : ''}`}>
               <InteractiveSymbolicMatrix name={`${variant}.input`} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onSymbolClick} />
               <BlockMath math="\times" />
               <InteractiveSymbolicMatrix name={`${variant}.wq.0`} rows={d_model} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
               <BlockMath math="=" />
               <InteractiveSymbolicMatrix name={q_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
            </div>
             <div className={`explanation-row ${break_qkv_proj ? 'vertical' : ''}`}>
               <InteractiveSymbolicMatrix name={`${variant}.input`} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onSymbolClick} />
               <BlockMath math="\times" />
               <InteractiveSymbolicMatrix name={`${variant}.wk.0`} rows={d_model} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
               <BlockMath math="=" />
               <InteractiveSymbolicMatrix name={k_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
            </div>
             <div className={`explanation-row ${break_qkv_proj ? 'vertical' : ''}`}>
               <InteractiveSymbolicMatrix name={`${variant}.input`} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onSymbolClick} />
               <BlockMath math="\times" />
               <InteractiveSymbolicMatrix name={`${variant}.wv.0`} rows={d_model} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
               <BlockMath math="=" />
               <InteractiveSymbolicMatrix name={v_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
            </div>
        </div>

        <div className="attention-calculation-step">
          <div className="step-title">2. 计算注意力分数 (Scaled Dot-Product)</div>
          <p>此步骤计算每个查询向量与所有键向量的相似度。点积结果越大，表示关联性越强。除以 <InlineMath math="\sqrt{d_{\text{head}}}" /> 是为了防止梯度在训练中过小或过大，保持数值稳定性。</p>
          <BlockMath math={"\\text{Scores}_h = \\frac{Q_h K_{\\text{group}(h)}^T}{\\sqrt{d_{\\text{head}}}}"} />
           <div className={`explanation-row ${break_scores ? 'vertical' : ''}`}>
                <InteractiveSymbolicMatrix name={q_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
                <BlockMath math="\times" />
                <InteractiveSymbolicMatrix name={k_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} transpose={true} />
                <BlockMath math="=" />
                <InteractiveSymbolicMatrix name={scores_name} rows={seq_len} cols={seq_len} highlight={highlight} onSymbolClick={onSymbolClick} />
           </div>
           <p>然后，应用Softmax函数将原始分数转换为一个和为1的概率分布，即“注意力权重” <InlineMath math="A_h"/>。</p>
           <BlockMath math={"A_h = \\text{Softmax}(\\text{Scores}_h)"} />
            <InteractiveSymbolicMatrix name={weights_name} rows={seq_len} cols={seq_len} highlight={highlight} onSymbolClick={onSymbolClick} sideLabel={true} />
        </div>

        <div className="attention-calculation-step">
            <div className="step-title">3. 加权求和得到单头输出</div>
            <p>使用上一步计算出的注意力权重 <InlineMath math="A_h"/> 对值向量 <InlineMath math="V_h"/> 进行加权求和，得到融合了上下文信息的单头输出 <InlineMath math="H_h"/>。</p>
             <div className={`explanation-row ${break_output ? 'vertical' : ''}`}>
                  <InteractiveSymbolicMatrix name={weights_name} rows={seq_len} cols={seq_len} highlight={highlight} onSymbolClick={onSymbolClick} />
                  <BlockMath math="\times" />
                  <InteractiveSymbolicMatrix name={v_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
                  <BlockMath math="=" />
                  <InteractiveSymbolicMatrix name={output_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
             </div>
        </div>

        <div className="attention-calculation-step">
            <div className="step-title">4. 合并与最终投影</div>
            <p>将所有 <InlineMath math="N_q"/> 个头的输出 <InlineMath math="H_h"/> 拼接（Concatenate）起来，然后通过一个最终的线性投影矩阵 <InlineMath math="W^O"/> 将其维度变回 <InlineMath math="d_{\text{model}}"/>，得到该子层的最终输出 <InlineMath math="Z"/>。</p>
            <BlockMath math={"Z = \\text{Concat}(\\text{head}_0, ..., \\text{head}_{N_q-1}) W_O"} />
            <div className={`explanation-row ${break_final ? 'vertical' : ''}`}>
                <InteractiveSymbolicMatrix name={combined_name} rows={seq_len} cols={n_q_heads * d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
                <BlockMath math="\times" />
                <InteractiveSymbolicMatrix name={`${variant}.wo`} rows={n_q_heads * d_head} cols={d_model} highlight={highlight} onSymbolClick={onSymbolClick} />
                <BlockMath math="=" />
                <InteractiveSymbolicMatrix name={final_output_name} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onSymbolClick} />
            </div>
        </div>
      </>
    )
}

export const Explanation: React.FC<ExplanationProps> = ({ dims, highlight, onSymbolClick }) => {
  const { n_q_heads, n_kv_heads, d_head, d_model } = dims;

  return (
    <div>
        <div className="math-block">
            <h3>引言</h3>
            <p>在深度学习，特别是自然语言处理(NLP)领域，注意力机制(Attention Mechanism)是一个非常重要的概念。注意力机制的起源可以追溯到对生物视觉注意力的模拟以及神经机器翻译的实际需求。Bahdanau等人的工作首次将注意力机制引入自然语言处理领域；而Transformer架构则将注意力机制推向了一个新的高度，使其成为现代自然语言处理的核心技术之一。</p>
            <p>Transformer架构的出现可以说是全球人工智能快速发展的转折点，该架构由Encoder和Decoder两部分组成，其中Encoder部分发展成了Bert、Roberta等模型，Decoder部分发展成了GPT等生成式大模型。此类模型效果强悍，并得到了广泛的应用，这进一步推动了注意力机制的发展。</p>
            <p>然而，随着模型规模的不断扩大和上下文长度的日益增长，传统的注意力机制在推理阶段面临着巨大的计算和内存挑战。特别是，自回归生成任务中<strong>Key-Value (KV) Cache</strong>的指数级增长成为了瓶颈，极大地限制了大型语言模型(LLM)的吞吐量和可服务性。为了解决这些挑战，研究者们不断探索和提出了各种注意力变体，旨在优化性能、降低成本，并提升LLM在实际应用中的效率。</p>
        </div>
        <div className="attention-variant-section">
            <div className="component-header">变量定义</div>
            <div className="component-body">
                <div className="explanation-subsection">
                  <p>在深入探讨各种注意力机制之前,我们首先统一定义本文中将使用的变量。明确的变量命名有助于我们精确地理解每个计算步骤的含义。</p>
                    <ul>
                        <li><strong>基础维度 (Basic Dimensions)</strong>
                            <ul>
                                <li><InlineMath math="B"/>: 批处理大小 (Batch Size)</li>
                                <li><InlineMath math="S"/>: 序列长度 (Sequence Length)</li>
                                <li><InlineMath math="d_{model}"/>: 模型的隐藏层维度 (Hidden Dimension)</li>
                                <li><InlineMath math="N_{q\_heads}"/>: 查询头的数量 (Number of Query Heads)</li>
                                <li><InlineMath math="N_{kv\_heads}"/>: 键/值头的数量 (Number of Key/Value Heads)</li>
                                <li><InlineMath math="d_{head}"/>: 每个注意力头的维度, 通常 <InlineMath math="d_{head} = d_{model} / N_{q\_heads}"/></li>
                            </ul>
                        </li>
                        <li><strong>张量与向量 (Tensors & Vectors)</strong>
                            <ul>
                                <li><InlineMath math="H \in \mathbb{R}^{B \times S \times d_{model}}"/>: 输入张量</li>
                                <li><InlineMath math="W_Q, W_K, W_V \in \mathbb{R}^{d_{model} \times d_{model}}"/>: MHA的总投影矩阵</li>
                                <li><InlineMath math="W_O \in \mathbb{R}^{d_{model} \times d_{model}}"/>: 输出投影矩阵</li>
                            </ul>
                        </li>
                         <li><strong>精细化QKV向量 (Granular QKV Vectors)</strong>
                            <ul>
                                <li><InlineMath math="q_{t,h} \in \mathbb{R}^{d_{head}}"/>: 位置t, 头h的查询(Query)向量</li>
                                <li><InlineMath math="k_{j,h} \in \mathbb{R}^{d_{head}}"/>: 位置j, 头h的键(Key)向量</li>
                                <li><InlineMath math="v_{j,h} \in \mathbb{R}^{d_{head}}"/>: 位置j, 头h的值(Value)向量</li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </div>


        <div className="attention-variant-section">
            <div className="component-header">MHA (Multi-Head Attention)</div>
            <div className="component-body">
                <div className="explanation-subsection">
                    <h5>出现原因与设计思路</h5>
                    <p><strong>单头注意力的局限性:</strong> 传统的单头注意力(Single-Head Attention)虽然能捕捉到输入元素之间的关系，但它只能在一个单一的、固定的表示空间中进行。这意味着模型在处理复杂信息时能力可能会受限，难以同时关注到输入序列中不同层面（例如语法结构、语义关系等）的细微特征。</p>
                    <p><strong>并行化与多视角学习:</strong> MHA通过引入多个“注意力头”，将输入的原始维度 <InlineMath math="d_{model}"/> 分割成 <InlineMath math="N_{q\_heads}"/> 个更小的子空间。每个头独立地在自己的子空间中执行注意力计算，学习不同的注意力模式。这种设计允许模型从多个“视角”去理解输入信息，例如，一个头可能关注长距离依赖，另一个头可能关注局部语义，从而捕获更丰富、更复杂的上下文信息。</p>
                </div>
                <div className="explanation-subsection">
                    <h5>交互式公式推导 (以头0为例)</h5>
                    {renderVariantExplanation('mha', dims, highlight, onSymbolClick)}
                </div>
                <div className="explanation-subsection">
                    <h5>KV Cache: 概念、变化与牺牲</h5>
                    <p><strong>概念与作用:</strong> 在LLM的自回归生成阶段，模型每次生成一个token，然后将新token附加到序列中。为避免重复计算前序token的Key和Value向量，KV Cache会将这些计算过的K/V向量存储起来，在后续步骤中直接复用，从而<strong>节省了大量的计算时间</strong>。这是一种典型的“<strong>以空间换时间</strong>”的优化策略。</p>
                    <p><strong>显存占用:</strong> KV Cache最大的牺牲就是显存。在MHA中，每个查询头都有独立的K/V头 (<InlineMath math={`N_q=${n_q_heads}, N_{kv}=${n_q_heads}`}/>)。因此，KV Cache的大小与查询头的数量成正比，公式为：</p>
                    <BlockMath math={"\\text{Cache}_{\\text{MHA}} \\propto S \\times N_{q\\_\\text{heads}} \\times d_{\\text{head}} = S \\times d_{\\text{model}}"} />
                    <p>对于Llama3 70B模型(L=80, <InlineMath math="N_{q\_heads}=64"/>, <InlineMath math="d_{head}=128"/>, 16位精度)，当批处理大小 <InlineMath math="B=8"/> 且序列长度 <InlineMath math="S=1000"/> 时，KV Cache大小约为 <strong>20.97 GB</strong>，随着序列长度线性增长，这很快成为瓶颈。</p>
                </div>
            </div>
        </div>

        <div className="attention-variant-section">
            <div className="component-header">GQA (Grouped-Query Attention)</div>
             <div className="component-body">
                <div className="explanation-subsection">
                    <h5>出现原因与设计思路</h5>
                    <p>GQA是MHA和MQA之间的折中方案。它认识到MHA的KV头可能存在冗余，而MQA的单一KV头又可能限制了模型性能。因此，GQA将查询头分组，每组共享一对K/V头，旨在保持接近MHA性能的同时，有效减少KV Cache。</p>
                    <p><strong>分组机制:</strong> GQA的核心思想是将 <InlineMath math="N_{q\_heads}"/> 个查询头平均分配到 <InlineMath math="N_{kv\_heads}"/> 个组中。通过调整组的数量，GQA可以灵活地在MHA(<InlineMath math="N_{kv\_heads} = N_{q\_heads}"/>)和MQA(<InlineMath math="N_{kv\_heads} = 1"/>)之间进行权衡。</p>
                </div>
                <div className="explanation-subsection">
                    <h5>交互式公式推导 (以头0为例)</h5>
                    {renderVariantExplanation('gqa', dims, highlight, onSymbolClick)}
                </div>
                <div className="explanation-subsection">
                     <h5>KV Cache: 变化与牺牲</h5>
                    <p><strong>显存占用:</strong> 在GQA中，查询头被分成 {n_kv_heads}$ 组，每组共享一个K/V头 (<InlineMath math={`N_q=${n_q_heads}, N_{kv}=${n_kv_heads}`}/>)。KV Cache只存储 <InlineMath math="N_{kv\_heads}"/> 份Key和Value，大小减少为MHA的 <InlineMath math={`${n_kv_heads}/${n_q_heads}`}/> 倍。</p>
                    <BlockMath math={"\\text{Cache}_{\\text{GQA}} \\propto S \\times N_{kv\\_\\text{heads}} \\times d_{\\text{head}}"} />
                    <p>以Llama3 70B为例，若采用GQA并设置 <InlineMath math="N_{kv\_heads}=8"/>，KV Cache将减少8倍，从20.97 GB降至约 <strong>2.62 GB</strong>，这是一个显著的优化。</p>
                    <p><strong>牺牲:</strong> GQA的牺牲主要是设计复杂性和需要对组数 <InlineMath math="N_{kv\_heads}"/> 进行超参数调优。虽然性能显著优于MQA，但理论上仍可能略低于MHA。</p>
                </div>
            </div>
        </div>

        <div className="attention-variant-section">
            <div className="component-header">MQA (Multi-Query Attention)</div>
            <div className="component-body">
                <div className="explanation-subsection">
                    <h5>出现原因与设计思路</h5>
                    <p>面对MHA高昂的KV Cache成本，MQA提出了一种极致的解决方案：让所有查询头共享<strong>同一份</strong>Key和Value。</p>
                    <p><strong>最大化共享:</strong> MQA的核心是将 <InlineMath math="N_{kv\_heads}"/> 降至1，即所有 <InlineMath math="N_{q\_heads}"/> 个查询头共享同一组Key和Value矩阵。这意味着模型只需要计算和存储一套Key和Value。</p>
                </div>
                <div className="explanation-subsection">
                    <h5>交互式公式推导 (以头0为例)</h5>
                    {renderVariantExplanation('mqa', dims, highlight, onSymbolClick)}
                </div>
                 <div className="explanation-subsection">
                    <h5>KV Cache: 变化与牺牲</h5>
                    <p><strong>显存占用:</strong> 在MQA中，所有查询头共享唯一的K/V头 (<InlineMath math={`N_q=${n_q_heads}, N_{kv}=1`}/>)。这使得KV Cache的大小减少为MHA的 <InlineMath math={`1/${n_q_heads}`}/> 倍，极大地节省了内存。</p>
                    <BlockMath math={"\\text{Cache}_{\\text{MQA}} \\propto S \\times 1 \\times d_{\\text{head}}"} />
                     <p>以Llama3 70B为例，当 <InlineMath math="N_{q\_heads}=64"/> 时，KV Cache将减少64倍，从约20.97 GB降至约 <strong>327.6 MB</strong>。这是一个非常显著的内存节省。</p>
                     <p><strong>牺牲:</strong> MQA的牺牲主要是<strong>模型性能</strong>。由于所有注意力头共享相同的K和V信息，它们无法像MHA那样从多样化的K/V子空间中学习，可能导致表达能力下降或收敛速度变慢。</p>
                </div>
            </div>
        </div>

        <div className="attention-variant-section">
            <div className="component-header">MLA (Multi-head Latent Attention)</div>
            <div className="component-body">
                 <div className="explanation-subsection">
                    <h5>出现原因与设计思路</h5>
                    <p><strong>GQA的局限:</strong> 尽管MQA和GQA在KV Cache优化方面取得了显著进展，但它们仍受限于将原始高维KV信息直接绑定到注意力头的数量。当追求更长的上下文时，即使是GQA的KV Cache仍然可能过大。</p>
                    <p><strong>低秩压缩与矩阵吸收:</strong> MLA (来自DeepSeek-V2) 是一种更激进的优化。其核心思想是：</p>
                    <ul>
                        <li><strong>低秩压缩KV:</strong> MLA假设Key和Value的原始高维表示中存在大量冗余，其有效信息可以被压缩到一个低维的“潜在空间”。它通过一个下投影矩阵将每个token的 <InlineMath math="d_{model}"/> 维隐藏状态投影成一个极小的共享潜在向量 <InlineMath math="c^{KV}"/>。KV Cache只存储这些低维向量。</li>
                        <li><strong>“矩阵吸收”实现计算效率:</strong> MLA利用矩阵乘法结合律的巧妙特性，将重建K、V所需的上投影矩阵“吸收”到Query侧的计算中，从而在推理时避免K、V的显式高维重建，直接在低维潜在空间进行部分计算。</li>
                        <li><strong>解耦RoPE兼容性:</strong> 为兼容“矩阵吸收”技巧，MLA将Q、K向量解耦为<strong>内容(Content)部分</strong>和<strong>RoPE部分</strong>。内容部分采用低秩压缩；RoPE部分则独立处理，通常采用类似MQA的共享K方式。</li>
                    </ul>
                </div>
                <div className="explanation-subsection">
                    <h5>实现方法与数学推导 (推理阶段)</h5>
                    <p>MLA在推理阶段是其效率提升的核心。通过“矩阵吸收”技巧，它可以避免显式的高维投影和重建K、V。</p>
                    <p><strong>1. 缓存内容:</strong> 在推理时，MLA只缓存两个低维的、所有头共享的向量：共享内容潜在向量 <InlineMath math="c_j^{KV} \in \mathbb{R}^{d_c}"/> 和共享RoPE键向量 <InlineMath math="k_j^R \in \mathbb{R}^{d_r}"/>。</p>
                    <p><strong>2. “矩阵吸收”技巧:</strong> 核心思想是将K侧的升维矩阵预先与Q侧的投影矩阵组合。训练时内容分数计算为 <InlineMath math="\text{score}^C \propto (c_t^Q W_{UQ,h}) \cdot (c_j^{KV} W_{UK,h})^T"/>。在推理时，利用矩阵乘法结合律重排：</p>
                    <BlockMath math={"\\text{score}_{t,j,h}^C = c_t^Q (W_{UQ,h} W_{UK,h}^T) (c_j^{KV})^T"}/>
                    <p>其中，矩阵 <InlineMath math="M_h^K = W_{UQ,h} W_{UK,h}^T"/> 可以在模型加载后<strong>预先计算并存储</strong>。因此，推理时只需用当前的 <InlineMath math="c_t^Q"/> 与预计算的 <InlineMath math="M_h^K"/> 相乘，再与缓存的 <InlineMath math="c_j^{KV}"/> 计算点积，极大地降低了计算量。</p>
                </div>
                <div className="explanation-subsection">
                    <h5>KV Cache: 变化与牺牲</h5>
                    <p><strong>显存占用:</strong> MLA实现了迄今为止最为极致的KV Cache压缩。其KV Cache只存储低维的潜在向量。</p>
                    <BlockMath math={"\\text{KV Cache Size (MLA)} = L \\times B \\times S \\times (d_c + d_r) \\times \\text{sizeof(float)}"}/>
                    <p>以DeepSeek-V2的参数为例(<InlineMath math="d_{model}=7168, d_c=512, d_r=64"/>)，MLA可以将KV Cache大小压缩到MHA的约<strong>1/25</strong>。对于Llama3 70B大小的模型，KV Cache可以从20.97 GB降至约 <strong>0.83 GB</strong>。</p>
                    <p><strong>牺牲:</strong> MLA的牺牲主要体现在<strong>模型结构和训练的复杂性</strong>。引入了多阶段投影、内容与RoPE解耦等机制，代码实现和理解难度增加，并可能导致训练不稳定，需要特殊的优化策略来稳定训练过程。</p>
                </div>
            </div>
        </div>

        <div className="attention-variant-section">
            <div className="component-header">总结: 从MHA到MLA的演进之路</div>
            <div className="component-body">
                <table className="summary-table">
                    <thead>
                        <tr>
                            <th>特性</th>
                            <th>MHA (Multi-Head Attention)</th>
                            <th>MQA (Multi-Query Attention)</th>
                            <th>GQA (Grouped-Query Attention)</th>
                            <th>MLA (Multi-head Latent Attention)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>核心思想</strong></td>
                            <td>并行多子空间学习</td>
                            <td>极致KV共享，压缩Cache</td>
                            <td>在性能和效率间折中</td>
                            <td>低秩压缩KV，推理时吸收权重</td>
                        </tr>
                        <tr>
                            <td><strong>KV头数量</strong></td>
                            <td><InlineMath math="N_{q\_heads}"/></td>
                            <td>1</td>
                            <td><InlineMath math="N_{kv\_heads}"/> (1 ≤ <InlineMath math="N_{kv\_heads}"/> ≤ <InlineMath math="N_{q\_heads}"/>)</td>
                            <td>推理时等效为1个共享<strong>潜在</strong>K/V</td>
                        </tr>
                        <tr>
                            <td><strong>KV Cache大小 (相对MHA)</strong></td>
                            <td>1x</td>
                            <td><InlineMath math="1/N_{q\_heads}"/></td>
                            <td><InlineMath math="N_{kv\_heads}/N_{q\_heads}"/></td>
                            <td>极小 (约1/25至1/60)</td>
                        </tr>
                        <tr>
                            <td><strong>优点</strong></td>
                            <td>强大的表达能力，训练效果佳</td>
                            <td>极低的KV Cache，显著加速推理</td>
                            <td>灵活的性能-效率权衡，性能接近MHA</td>
                            <td>极致的KV Cache压缩，同时保持高性能</td>
                        </tr>
                         <tr>
                            <td><strong>缺点</strong></td>
                            <td>KV Cache巨大，推理瓶颈</td>
                            <td>可能损失模型性能</td>
                            <td>实现复杂度略增，需调参</td>
                            <td>结构复杂，训练难度高</td>
                        </tr>
                        <tr>
                            <td><strong>适用场景</strong></td>
                            <td>训练，对性能要求高的场景</td>
                            <td>对推理速度和显存极度敏感的场景</td>
                            <td>大多数现代大模型的通用选择</td>
                            <td>对效率和性能都有极致要求的超长序列场景</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};
// END OF FILE: src/topics/attention-variants/components/Explanation.tsx