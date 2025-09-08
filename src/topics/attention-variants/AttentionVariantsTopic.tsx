// FILE: src/topics/attention-variants/AttentionVariantsTopic.tsx
import React, { useState, useCallback } from 'react';
import './AttentionVariantsTopic.css';
import { Controls } from './components/Controls';
import { Viz } from './components/Viz';
import { Explanation } from './components/Explanation';
import { CalculationTooltip } from '../../components/CalculationTooltip/CalculationTooltip';
import { TooltipState } from '../../components/CalculationTooltip/types';
import { useAttention } from './hooks/useAttention';
import { useSplitPane } from '../../hooks/useSplitPane';
import { HighlightState, ElementIdentifier, AttentionData } from './types';
import { generateTooltipData, createBackwardHighlight } from './lib/tracing';

export const AttentionVariantsTopic: React.FC = () => {
    const [dims, setDims] = useState({
        seq_len: 4,
        d_model: 16,
        n_q_heads: 4,
        n_kv_heads: 2,
        d_head: 4,
    });

    const [highlight, setHighlight] = useState<HighlightState>({ target: null, sources: [] });
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);

    const { primarySize, separatorProps, containerProps } = useSplitPane(window.innerWidth * 0.55);

    const attentionData: AttentionData | null = useAttention(dims);

    const handleInteraction = useCallback((element: ElementIdentifier, event: React.MouseEvent) => {
        if (!attentionData) return;
        const newHighlight = createBackwardHighlight(element, attentionData, dims);
        setHighlight(newHighlight);

        const newTooltip = generateTooltipData(element, attentionData, newHighlight.sources);
        setTooltip(newTooltip);

    }, [attentionData, dims]);

    const closeTooltip = useCallback(() => setTooltip(null), []);

    if (!attentionData) {
        return <div style={{ padding: "20px", textAlign: "center" }}>正在加载或维度设置无效... (确保 d_model = n_q_heads * d_head 且 n_q_heads 能被 n_kv_heads 整除)</div>;
    }

    return (
        <div className="main-layout" {...containerProps}>
            {tooltip && <CalculationTooltip tooltip={tooltip} onClose={closeTooltip} />}
            <Controls dims={dims} setDims={setDims} />
            <div className="column left-column" style={{width: primarySize, flex: 'none'}}>
                <div className="column-content">
                    <h2>数值模拟</h2>
                    <Viz data={attentionData} dims={dims} highlight={highlight} onElementClick={handleInteraction} />
                </div>
            </div>
             <div className="split-pane-separator" {...separatorProps} />
            <div className="column right-column" style={{flex: 1}}>
                <div className="column-content">
                    <h2>理论推导</h2>
                    <Explanation dims={dims} highlight={highlight} onSymbolClick={handleInteraction} />
                </div>
            </div>
        </div>
    );
};
// END OF FILE: src/topics/attention-variants/AttentionVariantsTopic.tsx