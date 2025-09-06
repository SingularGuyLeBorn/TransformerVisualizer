// FILE: src/topics/attention-variants/AttentionVariantsTopic.tsx
import React, { useState, useCallback } from 'react';
import './AttentionVariantsTopic.css';
import { Controls } from './components/Controls';
import { Viz } from './components/Viz';
import { Explanation } from './components/Explanation';
import { useAttention } from './hooks/useAttention';
import { HighlightState, ElementIdentifier, AttentionData, HighlightSource } from './types';

// =======================
//   HIGHLIGHTING LOGIC
// =======================
const createBackwardHighlight = (element: ElementIdentifier, data: AttentionData): HighlightState => {
    const { variant, name, row, col, isInternal } = element;
    const sources: HighlightSource[] = [];

    // Short-circuit for MLA as it has a different structure not yet fully visualized
    if (variant === 'mla') {
        return { target: element, sources: [] };
    }

    const dims = {
        d_head: data.mha.heads[0].Q[0].length,
        n_q_heads: data.gqa.heads.length,
        n_kv_heads_gqa: data.gqa.K_proj[0].length / data.mha.heads[0].Q[0].length,
    };

    const conceptualName = name.split('.').pop() || '';
    const headIndexMatch = name.match(/heads\.(\d+)/);
    const headIndex = headIndexMatch ? parseInt(headIndexMatch[1], 10) : 0;

    // Handle clicks inside the ElementwiseCalculation component
    if (isInternal) {
        const baseName = name.replace('.internal', '');
        const baseElementName = `${baseName.split('.')[0]}.heads.${headIndex}.Scores`;
        if (col === -1) { // Clicked on the sum
             sources.push({ ...element, name: baseElementName, row: row, col: -1, highlightRow: true, isInternal: true });
        } else { // Clicked on an element
             sources.push({ ...element, name: baseElementName, row: row, col: col, isInternal: true });
        }
        return { target: element, sources };
    }


    if (conceptualName === 'output') { // FinalOutput
        sources.push({ ...element, name: `${variant}.combined`, row: row, col: -1, highlightRow: true });
        sources.push({ ...element, name: `${variant}.wo`, row: -1, col: col, highlightCol: true });
    }
    else if (conceptualName === 'combined') { // CombinedOutput
        const headIndexForCol = Math.floor(col / dims.d_head);
        sources.push({ ...element, name: `${variant}.heads.${headIndexForCol}.Output`, row: row, col: col % dims.d_head });
    }
    else if (conceptualName === 'Output') {
        sources.push({ ...element, name: `${variant}.heads.${headIndex}.Weights`, row: row, col: -1, highlightRow: true });
        sources.push({ ...element, name: `${variant}.heads.${headIndex}.V`, row: -1, col: col, highlightCol: true });
    }
    else if (conceptualName === 'Weights') {
        sources.push({ ...element, name: `${variant}.heads.${headIndex}.Scores`, row: row, col: -1, highlightRow: true });
        // Add an internal highlight target for the ElementwiseOperation component
        sources.push({ ...element, name: `${name}.internal`, row: row, col: col, isInternal: true });
    }
    else if (conceptualName === 'Scores') {
        sources.push({ ...element, name: `${variant}.heads.${headIndex}.Q`, row: row, col: -1, highlightRow: true });
        sources.push({ ...element, name: `${variant}.heads.${headIndex}.K`, row: col, col: -1, highlightRow: true });
    }
    else if (['Q', 'K', 'V'].includes(conceptualName)) {
        const type = conceptualName.toLowerCase() as 'q' | 'k' | 'v';
        let weightIndex = 0;

        if (type === 'q') {
            weightIndex = headIndex;
        } else { // K or V
            if (variant === 'mha') {
                weightIndex = headIndex;
            } else if (variant === 'gqa') {
                const q_heads_per_kv_gqa = dims.n_q_heads / dims.n_kv_heads_gqa;
                weightIndex = Math.floor(headIndex / q_heads_per_kv_gqa);
            } // for MQA, weightIndex remains 0
        }

        sources.push({ ...element, name: `${variant}.input`, row: row, col: -1, highlightRow: true });
        sources.push({ ...element, name: `${variant}.w${type}.${weightIndex}`, row: -1, col: col, highlightCol: true });
    }

    return { target: element, sources };
};


export const AttentionVariantsTopic: React.FC = () => {
    const [dims, setDims] = useState({
        seq_len: 4,
        d_model: 16,
        n_q_heads: 4,
        n_kv_heads: 2,
        d_head: 4,
    });

    const [highlight, setHighlight] = useState<HighlightState>({ target: null, sources: [] });

    const attentionData: AttentionData | null = useAttention(dims);

    const handleInteraction = useCallback((element: ElementIdentifier, event: React.MouseEvent) => {
        if (!attentionData) return;
        const newHighlight = createBackwardHighlight(element, attentionData);
        setHighlight(newHighlight);
    }, [attentionData]);

    if (!attentionData) {
        return <div style={{ padding: "20px", textAlign: "center" }}>正在加载或维度设置无效... (确保 d_model = n_q_heads * d_head 且 n_q_heads 能被 n_kv_heads 整除)</div>;
    }

    return (
        <div className="main-layout" style={{ height: '100%' }}>
            <Controls dims={dims} setDims={setDims} />
            <div className="column left-column">
                <div className="column-content">
                    <h2>数值模拟</h2>
                    <Viz data={attentionData} dims={dims} highlight={highlight} onElementClick={handleInteraction} />
                </div>
            </div>
            <div className="column right-column">
                <div className="column-content">
                    <h2>理论推导</h2>
                    <Explanation dims={dims} highlight={highlight} onSymbolClick={handleInteraction} />
                </div>
            </div>
        </div>
    );
};
// END OF FILE: src/topics/attention-variants/AttentionVariantsTopic.tsx