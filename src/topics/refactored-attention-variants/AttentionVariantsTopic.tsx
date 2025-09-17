// FILE: src/topics/refactored-attention-variants/AttentionVariantsTopic.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import './AttentionVariantsTopic.css';
import { Controls } from '../attention-variants/components/Controls'; // Reusing old controls
import { Viz } from './components/Viz'; // Using new Viz
import { Explanation } from './components/Explanation'; // Using new Explanation
import { CalculationTooltip } from '../../components/CalculationTooltip/CalculationTooltip'; // Using global tooltip
import { AnimationPanel } from '../attention-variants/components/AnimationPanel'; // Reusing old animation panel
import { TooltipState } from '../../components/CalculationTooltip/types';
import { useAttention } from '../attention-variants/hooks/useAttention';
import { useSplitPane } from '../../hooks/useSplitPane';
import { HighlightState, ElementIdentifier, AttentionData } from '../attention-variants/types';
import { generateTooltipData, createBackwardHighlight } from '../attention-variants/lib/tracing';
import { ViewToggle, ViewMode } from '../../components/ViewToggle/ViewToggle';

export const RefactoredAttentionVariantsTopic: React.FC = () => {
    // State management is identical to the original component
    const [dims, setDims] = useState({
        seq_len: 4,
        d_model: 16,
        n_q_heads: 4,
        n_kv_heads: 2,
        d_head: 4,
        d_c: 8,
        d_c_prime: 12,
        d_rope: 2
    });

    const [highlight, setHighlight] = useState<HighlightState>({ target: null, sources: [] });
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);
    const [animationData, setAnimationData] = useState<TooltipState | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('none');
    const [activeElement, setActiveElement] = useState<ElementIdentifier | null>(null);
    const [activeComponent, setActiveComponent] = useState<string | null>(null);

    const vizRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
    const explanationRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

    const { primarySize, separatorProps, containerProps } = useSplitPane(window.innerWidth * 0.45);

    const attentionData: AttentionData | null = useAttention(dims);

    // All logic hooks remain the same as they operate on data, not UI
    useEffect(() => {
        if (viewMode !== 'none' && activeElement && attentionData) {
            const newHighlight = createBackwardHighlight(activeElement, attentionData, dims);
            setHighlight({ ...newHighlight, activeComponent });
            const newCalculationData = generateTooltipData(activeElement, attentionData, newHighlight.sources);

            if (viewMode === 'decomposition') {
                setTooltip(newCalculationData);
                setAnimationData(null);
            } else {
                if (newCalculationData && newCalculationData.opType !== 'info') {
                    setAnimationData(newCalculationData);
                    setTooltip(null);
                } else {
                    setAnimationData(null);
                    setTooltip(newCalculationData);
                }
            }
        }
    }, [viewMode, activeElement, attentionData, dims, activeComponent]);

    const handleInteraction = useCallback((element: ElementIdentifier, event: React.MouseEvent) => {
        if (!attentionData) return;
        const variant = element.name.split('.')[0];
        setActiveComponent(variant);
        const newHighlight = createBackwardHighlight(element, attentionData, dims);
        setHighlight({ ...newHighlight, activeComponent: variant });
        setActiveElement(element);
    }, [attentionData, dims]);

    const handleComponentClick = useCallback((componentId: string) => {
        setActiveComponent(componentId);
        setHighlight({ target: null, sources: [], activeComponent: componentId });
        setTooltip(null);
        setAnimationData(null);
        setActiveElement(null);
        setViewMode('none');

        const vizEl = vizRefs.current[componentId];
        const expEl = explanationRefs.current[componentId];
        if(vizEl) vizEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if(expEl) expEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, []);

    const closeTooltip = useCallback(() => {
        setTooltip(null);
        setViewMode('none');
        setActiveElement(null);
    }, []);

    const closeAnimationPanel = useCallback(() => {
        setAnimationData(null);
        setViewMode('none');
        setActiveElement(null);
    }, []);

    if (!attentionData) {
        return <div style={{ padding: "20px", textAlign: "center" }}>正在加载或维度设置无效...</div>;
    }

    return (
        <div className="main-layout" {...containerProps}>
            {tooltip && <CalculationTooltip tooltip={tooltip} onClose={closeTooltip} />}
            {animationData && <AnimationPanel animationData={animationData} onClose={closeAnimationPanel} />}
            <Controls dims={dims} setDims={setDims} />
            <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

            <div className="column left-column" style={{width: primarySize, flex: 'none'}}>
                <div className="column-content">
                    <h2>数值模拟 (重构版)</h2>
                    {/* The only major change is here: using the new Viz component */}
                    <Viz data={attentionData} dims={dims} highlight={highlight} onElementClick={handleInteraction} onComponentClick={handleComponentClick} refs={vizRefs} />
                </div>
            </div>
            <div className="split-pane-separator" {...separatorProps} />
            <div className="column right-column" style={{flex: 1}}>
                <div className="column-content">
                    <h2>理论推导 (重构版)</h2>
                    {/* And here: using the new Explanation component */}
                    <Explanation dims={dims} highlight={highlight} onSymbolClick={handleInteraction} onComponentClick={handleComponentClick} refs={explanationRefs} />
                </div>
            </div>
        </div>
    );
};
// END OF FILE: src/topics/refactored-attention-variants/AttentionVariantsTopic.tsx