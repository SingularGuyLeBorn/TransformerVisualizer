// FILE: src/topics/attention-variants/components/Viz.tsx
import React from 'react';
import { AttentionData, HighlightState, ElementIdentifier, AttentionVariantData } from '../types';
import { Matrix } from './Matrix';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { MLAViz } from './MLAViz';

interface VizProps {
    data: AttentionData;
    dims: any;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
    onComponentClick: (componentId: string) => void;
    refs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
}

const GROUP_COLORS = ['#3498db', '#2ecc71', '#e74c3c', '#9b59b6', '#f1c40f', '#1abc9c', '#d35400', '#34495e'];

const StandardAttentionViz: React.FC<{
    variantName: 'mha' | 'mqa' | 'gqa';
    title: string;
    variantData: AttentionVariantData;
    commonData: { input: any; Wo: any; Wq: any; Wk: any; Wv: any };
    dims: { n_q_heads: number, n_kv_heads: number, d_head: number, d_model: number, seq_len: number };
    highlight: HighlightState;
    onElementClick: VizProps['onElementClick'];
    onComponentClick: VizProps['onComponentClick'];
}> = ({ variantName, title, variantData, commonData, dims, highlight, onElementClick, onComponentClick }) => {

    const { d_model, d_head, seq_len, n_q_heads } = dims;
    const n_kv_heads = variantName === 'mqa' ? 1 : (variantName === 'gqa' ? dims.n_kv_heads : n_q_heads);
    const q_heads_per_kv = n_q_heads / n_kv_heads;

    const break_final = (n_q_heads * d_head + d_model + d_model) > 15;
    const numHeadsToShow = Math.min(n_q_heads, 4);

    return (
        <div className={`attention-variant-section ${highlight.activeComponent === variantName ? 'active-component' : ''}`} id={`viz-${variantName}`}>
            <div className="component-header" onClick={() => onComponentClick(variantName)}>{title}</div>
            <div className="component-body">

                <div className="attention-calculation-step">
                    <div className="step-title">1. 生成 Q, K, V 头</div>
                    <p>输入 H ({seq_len}x{d_model}) 乘以各头独立的权重矩阵，生成 Q, K, V 头。</p>
                    <div className="head-group-container" style={{borderColor: '#ccc'}}>
                        <div className="q-heads-grid">
                            {Array.from({length: numHeadsToShow}).map((_, i) => {
                                const headIndex = i < 2 ? i : n_q_heads - (numHeadsToShow - i);
                                const kv_group_index = Math.floor(headIndex / q_heads_per_kv);
                                const groupColor = GROUP_COLORS[kv_group_index % GROUP_COLORS.length];
                                return (
                                    <div key={headIndex} className="head-group-container" style={{borderColor: groupColor}}>
                                        <Matrix name={`${variantName}.heads.${headIndex}.Q`} data={variantData.heads[headIndex].Q} highlight={highlight} onElementClick={onElementClick} />
                                    </div>
                                )
                            })}
                        </div>
                        <div className="kv-head-pair">
                            {Array.from({length: Math.min(n_kv_heads, 4)}).map((_, i) => {
                                const kv_head_idx = i < 2 ? i : n_kv_heads - (Math.min(n_kv_heads, 4) - i);
                                const groupColor = GROUP_COLORS[kv_head_idx % GROUP_COLORS.length];
                                return (
                                    <div key={kv_head_idx} className="head-group-container" style={{borderColor: groupColor, borderStyle: 'solid'}}>
                                        <Matrix name={`${variantName}.heads.${kv_head_idx * q_heads_per_kv}.K`} data={variantData.heads[kv_head_idx * q_heads_per_kv].K} highlight={highlight} onElementClick={onElementClick} />
                                        <Matrix name={`${variantName}.heads.${kv_head_idx * q_heads_per_kv}.V`} data={variantData.heads[kv_head_idx * q_heads_per_kv].V} highlight={highlight} onElementClick={onElementClick} />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
                <div className="arrow-down">↓</div>
                <div className="attention-calculation-step">
                    <div className="step-title">2. 注意力计算 (以头 0 为例)</div>
                    <div className={`viz-row`}>
                        <Matrix name={`${variantName}.heads.0.Q`} data={variantData.heads[0].Q} highlight={highlight} onElementClick={onElementClick} />
                        <BlockMath math="\times" />
                        <Matrix name={`${variantName}.heads.0.K`} data={variantData.heads[0].K} highlight={highlight} onElementClick={onElementClick} isTransposed={true}/>
                        <BlockMath math="\xrightarrow{\text{Softmax}}" />
                        <Matrix name={`${variantName}.heads.0.Weights`} data={variantData.heads[0].Weights} highlight={highlight} onElementClick={onElementClick}/>
                        <BlockMath math="\times" />
                        <Matrix name={`${variantName}.heads.0.V`} data={variantData.heads[0].V} highlight={highlight} onElementClick={onElementClick} />
                        <BlockMath math="=" />
                        <Matrix name={`${variantName}.heads.0.Output`} data={variantData.heads[0].Output} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                </div>
                <div className="arrow-down">↓</div>
                <div className="attention-calculation-step">
                    <div className="step-title">3. 合并与最终投影</div>
                    <div className={`viz-row ${break_final ? 'vertical' : ''}`}>
                        <Matrix name={`${variantName}.combined`} data={variantData.CombinedOutput} highlight={highlight} onElementClick={onElementClick} />
                        <BlockMath math="\times" />
                        <Matrix name={`${variantName}.wo`} data={commonData.Wo} highlight={highlight} onElementClick={onElementClick} />
                        <BlockMath math="=" />
                        <Matrix name={`${variantName}.output`} data={variantData.FinalOutput} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                </div>
            </div>
        </div>
    );
};


export const Viz: React.FC<VizProps> = ({ data, dims, highlight, onElementClick, onComponentClick, refs }) => {
    const commonData = { input: data.input, Wo: data.Wo, Wq: data.Wq, Wk: data.Wk, Wv: data.Wv };

    return (
        <div>
            <div ref={el => refs.current['mha'] = el}>
                <StandardAttentionViz variantName="mha" title="MHA (Multi-Head Attention)" variantData={data.mha} commonData={commonData} dims={dims} highlight={highlight} onElementClick={onElementClick} onComponentClick={onComponentClick} />
            </div>
            <div ref={el => refs.current['gqa'] = el}>
                <StandardAttentionViz variantName="gqa" title="GQA (Grouped-Query Attention)" variantData={data.gqa} commonData={commonData} dims={dims} highlight={highlight} onElementClick={onElementClick} onComponentClick={onComponentClick} />
            </div>
            <div ref={el => refs.current['mqa'] = el}>
                <StandardAttentionViz variantName="mqa" title="MQA (Multi-Query Attention)" variantData={data.mqa} commonData={commonData} dims={dims} highlight={highlight} onElementClick={onElementClick} onComponentClick={onComponentClick} />
            </div>
            <div ref={el => refs.current['mla'] = el}>
                <MLAViz data={data} dims={dims} highlight={highlight} onElementClick={onElementClick} onComponentClick={onComponentClick}/>
            </div>
        </div>
    );
};
// END OF FILE: src/topics/attention-variants/components/Viz.tsx