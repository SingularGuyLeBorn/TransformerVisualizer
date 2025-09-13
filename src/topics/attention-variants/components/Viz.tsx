// FILE: src/topics/attention-variants/components/Viz.tsx
import React from 'react';
import { AttentionData, HighlightState, ElementIdentifier, AttentionVariantData } from '../types';
import { Matrix } from './Matrix';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { MLANumericViz } from './MLANumericViz';

interface VizProps {
    data: AttentionData;
    dims: any;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
    onComponentClick: (componentId: string) => void;
    refs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
}

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
    const break_qkv_proj = (d_model + d_head) > 15;
    const break_scores = (d_head + seq_len) > 15;
    const break_output = (seq_len + d_head) > 15;
    const break_final = (n_q_heads * d_head + d_model) > 15;

    return (
        <div className={`attention-variant-section ${highlight.activeComponent === variantName ? 'active-component' : ''}`} id={`viz-${variantName}`}>
            <div className="component-header" onClick={() => onComponentClick(variantName)}>{title}</div>
            <div className="component-body">
                <div className="attention-calculation-step">
                    <div className="step-title">1. 生成 Q, K, V 头 (以头 0 为例)</div>
                    <div className="viz-formula-group">
                        <div className={`viz-formula-row ${break_qkv_proj ? 'vertical' : ''}`}>
                            <Matrix name={`${variantName}.input`} data={commonData.input} highlight={highlight} onElementClick={onElementClick} />
                            <BlockMath math="\times" />
                            <Matrix name={`${variantName}.wq.0`} data={commonData.Wq[0]} highlight={highlight} onElementClick={onElementClick} />
                            <BlockMath math="=" />
                            <Matrix name={`${variantName}.heads.0.Q`} data={variantData.heads[0].Q} highlight={highlight} onElementClick={onElementClick} />
                        </div>
                    </div>
                    <div className="viz-formula-group">
                        <div className={`viz-formula-row ${break_qkv_proj ? 'vertical' : ''}`}>
                            <Matrix name={`${variantName}.input`} data={commonData.input} highlight={highlight} onElementClick={onElementClick} />
                            <BlockMath math="\times" />
                            <Matrix name={`${variantName}.wk.0`} data={commonData.Wk[0]} highlight={highlight} onElementClick={onElementClick} />
                            <BlockMath math="=" />
                            <Matrix name={`${variantName}.heads.0.K`} data={variantData.heads[0].K} highlight={highlight} onElementClick={onElementClick} />
                        </div>
                    </div>
                    <div className="viz-formula-group">
                        <div className={`viz-formula-row ${break_qkv_proj ? 'vertical' : ''}`}>
                            <Matrix name={`${variantName}.input`} data={commonData.input} highlight={highlight} onElementClick={onElementClick} />
                            <BlockMath math="\times" />
                            <Matrix name={`${variantName}.wv.0`} data={commonData.Wv[0]} highlight={highlight} onElementClick={onElementClick} />
                            <BlockMath math="=" />
                            <Matrix name={`${variantName}.heads.0.V`} data={variantData.heads[0].V} highlight={highlight} onElementClick={onElementClick} />
                        </div>
                    </div>
                </div>
                <div className="attention-calculation-step">
                    <div className="step-title">2. 注意力计算 (以头 0 为例)</div>
                    <div className="viz-formula-group">
                        <div className={`viz-formula-row ${break_scores ? 'vertical' : ''}`}>
                            <Matrix name={`${variantName}.heads.0.Q`} data={variantData.heads[0].Q} highlight={highlight} onElementClick={onElementClick} />
                            <BlockMath math="\times" />
                            <Matrix name={`${variantName}.heads.0.K`} data={variantData.heads[0].K} highlight={highlight} onElementClick={onElementClick} isTransposed={true}/>
                            <BlockMath math="=" />
                            <Matrix name={`${variantName}.heads.0.Scores`} data={variantData.heads[0].Scores} highlight={highlight} onElementClick={onElementClick}/>
                        </div>
                    </div>
                    <div className="arrow-down"><BlockMath math="\xrightarrow{\text{Softmax}}" /></div>
                    <div className="viz-formula-group">
                        <div className="viz-formula-row">
                            <Matrix name={`${variantName}.heads.0.Weights`} data={variantData.heads[0].Weights} highlight={highlight} onElementClick={onElementClick}/>
                        </div>
                    </div>
                    <div className="viz-formula-group">
                        <div className={`viz-formula-row ${break_output ? 'vertical' : ''}`}>
                            <Matrix name={`${variantName}.heads.0.Weights`} data={variantData.heads[0].Weights} highlight={highlight} onElementClick={onElementClick}/>
                            <BlockMath math="\times" />
                            <Matrix name={`${variantName}.heads.0.V`} data={variantData.heads[0].V} highlight={highlight} onElementClick={onElementClick} />
                            <BlockMath math="=" />
                            <Matrix name={`${variantName}.heads.0.Output`} data={variantData.heads[0].Output} highlight={highlight} onElementClick={onElementClick} />
                        </div>
                    </div>
                </div>
                <div className="attention-calculation-step">
                    <div className="step-title">3. 合并与最终投影</div>
                    <div className="viz-formula-group">
                        <div className={`viz-formula-row ${break_final ? 'vertical' : ''}`}>
                            <Matrix name={`${variantName}.combined`} data={variantData.CombinedOutput} highlight={highlight} onElementClick={onElementClick} />
                            <BlockMath math="\times" />
                            <Matrix name={`${variantName}.wo`} data={commonData.Wo} highlight={highlight} onElementClick={onElementClick} />
                            <BlockMath math="=" />
                            <Matrix name={`${variantName}.output`} data={variantData.FinalOutput} highlight={highlight} onElementClick={onElementClick} />
                        </div>
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
                <MLANumericViz data={data} dims={dims} highlight={highlight} onElementClick={onElementClick} onComponentClick={onComponentClick}/>
            </div>
        </div>
    );
};
// END OF FILE: src/topics/attention-variants/components/Viz.tsx