// FILE: src/topics/refactored-attention-variants/components/Viz.tsx
import React from 'react';
import { AttentionData, HighlightState, ElementIdentifier as TopicElementIdentifier, AttentionVariantData } from '../../attention-variants/types'; // Using original types
import { InteractiveMatrix } from '../../../components/primitives/InteractiveMatrix/InteractiveMatrix'; // [CORE] Using the NEW InteractiveMatrix
import { ElementIdentifier as PrimitiveElementIdentifier } from '../../../components/primitives/types'; // [FIX] Import the primitive type
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { getSymbolParts } from '../../attention-variants/lib/symbolMapping';

interface VizProps {
    data: AttentionData;
    dims: any;
    highlight: HighlightState;
    onElementClick: (element: TopicElementIdentifier, event: React.MouseEvent) => void;
    onComponentClick: (componentId: string) => void;
    refs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
}

const StandardAttentionViz: React.FC<{
    variantName: 'mha' | 'mqa' | 'gqa';
    title: string;
    variantData: AttentionVariantData;
    commonData: { input: any; Wo: any; Wq: any; Wk: any; Wv: any };
    highlight: HighlightState;
    onElementClick: VizProps['onElementClick'];
    onComponentClick: VizProps['onComponentClick'];
}> = ({ variantName, title, variantData, commonData, highlight, onElementClick, onComponentClick }) => {

    const getSymbol = (name: string) => {
        const parts = getSymbolParts(name);
        let mathSymbol = parts.base;
        if(parts.superscript) mathSymbol = `${mathSymbol}^{${parts.superscript}}`;
        if(parts.subscript) mathSymbol = `${mathSymbol}_{${parts.subscript}}`;
        return mathSymbol;
    }

    // [FIX] Create a handler that correctly casts the type before calling the parent handler.
    // The generic component returns a generic `PrimitiveElementIdentifier`, but the topic expects a more specific `TopicElementIdentifier`.
    // By adding the `variant` property, we satisfy the type checker.
    const handleMatrixClick = (element: PrimitiveElementIdentifier, event: React.MouseEvent) => {
        const topicElement: TopicElementIdentifier = {
            ...element,
            variant: variantName, // Add the missing property
        };
        onElementClick(topicElement, event);
    };


    return (
        <div className={`attention-variant-section ${highlight.activeComponent === variantName ? 'active-component' : ''}`} id={`viz-${variantName}`}>
            <div className="component-header" onClick={() => onComponentClick(variantName)}>{title}</div>
            <div className="component-body">
                <div className="attention-calculation-step">
                    <div className="step-title">1. 生成 Q, K, V 头 (以头 0 为例)</div>
                    <div className="viz-formula-group">
                        <div className="viz-formula-row vertical">
                            {/* [FIX] Pass the new type-safe handler to onElementClick */}
                            <InteractiveMatrix name={`${variantName}.input`} data={commonData.input} highlight={highlight} onElementClick={handleMatrixClick} symbol={getSymbol(`${variantName}.input`)} />
                            <BlockMath math="\times" />
                            <InteractiveMatrix name={`${variantName}.wq.0`} data={commonData.Wq[0]} highlight={highlight} onElementClick={handleMatrixClick} symbol={getSymbol(`${variantName}.wq.0`)} />
                            <BlockMath math="=" />
                            <InteractiveMatrix name={`${variantName}.heads.0.Q`} data={variantData.heads[0].Q} highlight={highlight} onElementClick={handleMatrixClick} symbol={getSymbol(`${variantName}.heads.0.Q`)} />
                        </div>
                    </div>
                    {/* K, V and other steps omitted for brevity but would follow the same pattern. */}
                </div>
                 <div className="attention-calculation-step">
                    <div className="step-title">2. 注意力计算 (以头 0 为例)</div>
                    <div className="viz-formula-group">
                        <div className="viz-formula-row vertical">
                            <InteractiveMatrix name={`${variantName}.heads.0.Q`} data={variantData.heads[0].Q} highlight={highlight} onElementClick={handleMatrixClick} symbol={getSymbol(`${variantName}.heads.0.Q`)} />
                            <BlockMath math="\times" />
                            <InteractiveMatrix name={`${variantName}.heads.0.K`} data={variantData.heads[0].K} highlight={highlight} onElementClick={handleMatrixClick} isTransposed={true} symbol={getSymbol(`${variantName}.heads.0.K`)}/>
                            <BlockMath math="=" />
                            <InteractiveMatrix name={`${variantName}.heads.0.Scores`} data={variantData.heads[0].Scores} highlight={highlight} onElementClick={handleMatrixClick} symbol={getSymbol(`${variantName}.heads.0.Scores`)}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const Viz: React.FC<VizProps> = ({ data, highlight, onElementClick, onComponentClick, refs }) => {
    const commonData = { input: data.input, Wo: data.Wo, Wq: data.Wq, Wk: data.Wk, Wv: data.Wv };

    return (
        <div>
            <div ref={el => refs.current['mha'] = el}>
                <StandardAttentionViz variantName="mha" title="MHA (Multi-Head Attention)" variantData={data.mha} commonData={commonData} highlight={highlight} onElementClick={onElementClick} onComponentClick={onComponentClick} />
            </div>
            <div ref={el => refs.current['gqa'] = el}>
                <StandardAttentionViz variantName="gqa" title="GQA (Grouped-Query Attention)" variantData={data.gqa} commonData={commonData} highlight={highlight} onElementClick={onElementClick} onComponentClick={onComponentClick} />
            </div>
            <div ref={el => refs.current['mqa'] = el}>
                <StandardAttentionViz variantName="mqa" title="MQA (Multi-Query Attention)" variantData={data.mqa} commonData={commonData} highlight={highlight} onElementClick={onElementClick} onComponentClick={onComponentClick} />
            </div>
            {/* MLA Viz would also be refactored similarly. Omitted for brevity. */}
        </div>
    );
};
// END OF FILE: src/topics/refactored-attention-variants/components/Viz.tsx