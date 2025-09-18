// FILE: src/topics/refactored-attention-variants/components/Explanation.tsx
import React from 'react';
import { HighlightState, ElementIdentifier } from '../../attention-variants/types';
import { InteractiveSymbolicMatrix } from '../../attention-variants/components/InteractiveSymbolicMatrix';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import { MLASymbolicViz } from '../../attention-variants/components/MLASymbolicViz';

// [CORE] This file has been completely rewritten to provide a high-quality, in-depth explanation.

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
    // This part remains for symbolic interaction, the detailed explanation is moved to the main component.
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
            <div className="viz-formula-group">
                <div className="viz-formula-row vertical">
                    <InteractiveSymbolicMatrix name={`${variant}.input`} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onSymbolClick} />
                    <BlockMath math="\times" />
                    <InteractiveSymbolicMatrix name={`${variant}.wq.0`} rows={d_model} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
                    <BlockMath math="=" />
                    <InteractiveSymbolicMatrix name={q_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
                </div>
            </div>
            <div className="step-title">2. 计算注意力分数</div>
            <div className="viz-formula-group">
                <div className="viz-formula-row vertical">
                    <InteractiveSymbolicMatrix name={q_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
                    <BlockMath math="\times" />
                    <InteractiveSymbolicMatrix name={k_head_name} rows={seq_len} cols={d_head} highlight={highlight} onSymbolClick={onSymbolClick} transpose={true} />
                    <BlockMath math="=" />
                    <InteractiveSymbolicMatrix name={scores_name} rows={seq_len} cols={seq_len} highlight={highlight} onSymbolClick={onSymbolClick} />
                </div>
            </div>
            <div className="step-title">3. 合并与最终投影</div>
            <div className="viz-formula-group">
                <div className="viz-formula-row vertical">
                    <InteractiveSymbolicMatrix name={combined_name} rows={seq_len} cols={n_q_heads * d_head} highlight={highlight} onSymbolClick={onSymbolClick} />
                    <BlockMath math="\times" />
                    <InteractiveSymbolicMatrix name={`${variant}.wo`} rows={n_q_heads * d_head} cols={d_model} highlight={highlight} onSymbolClick={onSymbolClick} />
                    <BlockMath math="=" />
                    <InteractiveSymbolicMatrix name={final_output_name} rows={seq_len} cols={d_model} highlight={highlight} onSymbolClick={onSymbolClick} />
                </div>
            </div>
        </div>
    )
}

export const Explanation: React.FC<ExplanationProps> = ({ dims, highlight, onSymbolClick, onComponentClick, refs }) => {
    const { n_q_heads, n_kv_heads } = dims;

    return (
        <div>
            <div className="math-block" ref={el => refs.current['intro'] = el}>
                <h3>引言: KV Cache — LLM 推理的阿喀琉斯之踵</h3>
                <p>在大型语言模型（LLM）的自回归生成任务中，模型每生成一个新词（token），都需要将其添加到现有序列的末尾，然后重新计算整个序列的注意力。这个过程虽然保证了生成内容的连贯性，但也带来了巨大的计算冗余。</p>
                <p>为了解决这个问题，**KV Cache** 应运而生。其核心思想非常直观：在生成第 <code>t+1</code> 个词时，前面 <code>t</code> 个词的键（Key）和值（Value）向量其实已经被计算过了，完全没有必要重复计算。KV Cache 做的就是将这些已经计算好的 K 和 V 向量缓存起来，在下一步计算时直接复用。这是一种典型的“**以空间换时间**”策略，它极大地加速了LLM的推理速度。</p>
                <p>然而，随着上下文长度（Sequence Length）的增加，KV Cache 的体积也随之线性增长，迅速成为显存的瓶颈。对于一个拥有 <InlineMath math="L"/> 层、批处理大小为 <InlineMath math="B"/>、序列长度为 <InlineMath math="S"/>、<InlineMath math="N_h"/> 个头、头维度为 <InlineMath math="d_k"/> 的模型，KV Cache 的大小约为 <InlineMath math="2 \times B \times S \times L \times N_h \times d_k"/>。当序列长度达到数十万甚至上百万时，这部分显存开销将变得无法承受。</p>
                <p>正是为了攻克 KV Cache 这一“阿喀琉斯之踵”，学术界和工业界提出了一系列创新的注意力变体。本次专题将带您深入探索从经典的 MHA 到前沿的 MLA 的演进之路，直观理解它们的设计哲学与得失权衡。</p>
            </div>

            <div className="attention-variant-section" ref={el => refs.current['mha'] = el}>
                <div className="component-header" onClick={() => onComponentClick('mha')}>MHA (Multi-Head Attention): 性能的基石</div>
                <div className="component-body">
                    <div className="explanation-subsection">
                        <h5>核心思想</h5>
                        <p>多头注意力（MHA）是 Transformer 架构的基石。它通过将输入投影到多个独立的“表示子空间”（即“头”），让模型能够并行地从不同角度关注信息。例如，一个头可能关注语法结构，另一个头可能关注语义关联。这种并行化、多视角的学习方式极大地增强了模型的表达能力。</p>
                        <h5>KV Cache 瓶颈</h5>
                        <p>在 MHA 中，每个查询头（Query Head）都拥有一套独立的键/值头（Key/Value Head），即 <InlineMath math={`N_{kv\\_heads} = N_{q\\_heads}`}/>。这意味着 KV Cache 需要为每一个头都存储一套完整的 K 和 V 向量，导致其体积最大化。随着序列变长，巨大的 KV Cache 成为制约推理效率的核心瓶颈。</p>
                    </div>
                    <div className="explanation-subsection">
                        <h5>交互式公式推导 (以头0为例)</h5>
                        {renderVariantExplanation('mha', dims, highlight, onSymbolClick)}
                    </div>
                </div>
            </div>

            <div className="attention-variant-section" ref={el => refs.current['gqa'] = el}>
                <div className="component-header" onClick={() => onComponentClick('gqa')}>GQA (Grouped-Query Attention): 效率与性能的优雅折中</div>
                <div className="component-body">
                    <div className="explanation-subsection">
                        <h5>核心思想</h5>
                        <p>分组查询注意力（GQA）观察到 MHA 中的多个 K/V 头之间可能存在信息冗余。它提出了一种折中方案：不再为每个 Q 头配备独立的 K/V 头，而是将 <InlineMath math={`${n_q_heads}`} /> 个 Q 头分成 <InlineMath math={`${n_kv_heads}`} /> 组，每组内的 Q 头共享同一套 K/V 头。</p>
                        <h5>KV Cache 优化</h5>
                        <p>通过这种分组共享机制，GQA 显著减少了需要缓存的 K/V 向量数量。KV Cache 的大小直接从与 <InlineMath math="N_{q\_heads}"/> 成正比降低到与 <InlineMath math="N_{kv\_heads}"/> 成正比，压缩率为 <InlineMath math={`N_{kv\\_heads} / N_{q\\_heads}`}/>。例如，Llama 2 70B 模型就采用了 GQA，将 KV 头的数量从 64 减少到 8，实现了 8 倍的 KV Cache 压缩，同时几乎没有性能损失。GQA 已成为当今主流大模型的标准配置。</p>
                    </div>
                    <div className="explanation-subsection">
                        <h5>交互式公式推导 (以头0为例)</h5>
                        {renderVariantExplanation('gqa', dims, highlight, onSymbolClick)}
                    </div>
                </div>
            </div>

            <div className="attention-variant-section" ref={el => refs.current['mqa'] = el}>
                <div className="component-header" onClick={() => onComponentClick('mqa')}>MQA (Multi-Query Attention): 极致压缩的探索</div>
                <div className="component-body">
                    <div className="explanation-subsection">
                        <h5>核心思想</h5>
                        <p>多查询注意力（MQA）是 GQA 的一个极端特例，它将分组数设为 1，即 <InlineMath math={`N_{kv\\_heads} = 1`}/>。这意味着所有 <InlineMath math={`${n_q_heads}`} /> 个 Q 头都共享唯一的一套 K/V 头。这种设计将 KV Cache 的压缩做到了极致。</p>
                        <h5>性能与权衡</h5>
                        <p>MQA 能够最大程度地减少显存占用和内存带宽，从而在处理超长上下文时获得极高的推理吞吐量。然而，这种极致的共享也可能成为模型表达能力的瓶颈，导致一定程度的性能下降。因此，它更常用于对推理速度要求极高，且能容忍轻微性能损失的场景。</p>
                    </div>
                    <div className="explanation-subsection">
                        <h5>交互式公式推导 (以头0为例)</h5>
                        {renderVariantExplanation('mqa', dims, highlight, onSymbolClick)}
                    </div>
                </div>
            </div>

            <div className="attention-variant-section" ref={el => refs.current['mla'] = el}>
                <div className="component-header" onClick={() => onComponentClick('mla')}>MLA (Multi-head Latent Attention): 重新定义 KV 压缩</div>
                <div className="component-body">
                    <div className="explanation-subsection">
                        <h5>核心思想</h5>
                        <p>潜在多头注意力（MLA），源自 DeepSeek-V2 模型，是对 KV Cache 优化思路的一次范式革新。它不再满足于减少 K/V 头的数量，而是从根本上质疑：我们真的需要缓存高维的 K/V 向量吗？</p>
                        <p>MLA 的核心假设是，原始的高维 K/V 向量中存在大量冗余，其核心信息可以被压缩到一个维度极低的“潜在空间”中。它通过一个可学习的下投影矩阵，将 <InlineMath math="d_{model}"/> 维的隐藏状态压缩成一个极小的共享潜在向量 <InlineMath math="\boldsymbol{c}^{KV}"/>（例如，维度仅为 128）。KV Cache 中只存储这些低维向量，从而实现数十倍的压缩。</p>
                        <h5>“矩阵吸收”的魔法</h5>
                        <p>为了在推理时避免将低维潜在向量重建回高维 K/V 向量（这将失去压缩的意义），MLA 巧妙地利用矩阵乘法结合律 <InlineMath math="(AB)C = A(BC)"/>，将上投影矩阵“吸收”到 Query 侧的计算中。这使得大部分计算可以直接在低维空间完成，极大地提升了效率。</p>
                    </div>
                    <div className="explanation-subsection">
                        <h5>交互式公式推导</h5>
                        <MLASymbolicViz
                            dims={dims}
                            highlight={highlight}
                            onElementClick={onSymbolClick}
                            onComponentClick={onComponentClick}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
// END OF FILE: src/topics/refactored-attention-variants/components/Explanation.tsx