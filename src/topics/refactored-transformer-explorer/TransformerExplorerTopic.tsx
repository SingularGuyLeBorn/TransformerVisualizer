// FILE: src/topics/refactored-transformer-explorer/TransformerExplorerTopic.tsx
import React, { useState, useCallback, useEffect } from 'react';
import './TransformerExplorerTopic.css';
import { Controls } from '../transformer-explorer/components/Controls'; // Reuse old controls
import { Viz } from './components/Viz'; // Use new Viz
import { Explanation } from './components/Explanation'; // Use new Explanation
import { CalculationTooltip } from '../../components/CalculationTooltip/CalculationTooltip';
import { AnimationPanel } from '../transformer-explorer/components/AnimationPanel';
import { TooltipState } from '../../components/CalculationTooltip/types';
import { useTransformer } from '../transformer-explorer/hooks/useTransformer';
import { useSplitPane } from '../../hooks/useSplitPane';
import { ElementIdentifier, HighlightState, TransformerData } from '../transformer-explorer/types';
import { generateTooltipData, createBackwardHighlight } from '../transformer-explorer/lib/tracing';
import { ViewToggle, ViewMode } from '../../components/ViewToggle/ViewToggle';

export const RefactoredTransformerExplorerTopic: React.FC = () => {
    // State management is identical to the original component
    const [dims, setDims] = useState({ d_model: 8, h: 2, seq_len: 2, n_layers: 1, d_ff: 32 });
    const [inputText, setInputText] = useState("I am a student");
    const [highlight, setHighlight] = useState<HighlightState>({ target: null, sources: [], destinations: [], activeComponent: null, activeResidual: null });
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);
    const [animationData, setAnimationData] = useState<TooltipState | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('none');
    const [activeElement, setActiveElement] = useState<ElementIdentifier | null>(null);

    const { primarySize, separatorProps, containerProps } = useSplitPane(window.innerWidth * 0.45);
    const transformerData: TransformerData | null = useTransformer(inputText, dims);

    useEffect(() => {
        if (highlight.activeComponent) {
            const explanationEl = document.getElementById(`math_${highlight.activeComponent}`);
            if (explanationEl) {
                setTimeout(() => {
                    explanationEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        }
    }, [highlight.activeComponent]);

    useEffect(() => {
        if (viewMode !== 'none' && activeElement && transformerData) {
            const { highlight: newHighlight } = createBackwardHighlight(activeElement, transformerData, dims);
            const newCalculationData = generateTooltipData(activeElement, transformerData, newHighlight.sources);

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
        } else {
            setTooltip(null);
            setAnimationData(null);
        }
    }, [viewMode, activeElement, transformerData, dims]);


    const handleInteraction = useCallback((element: ElementIdentifier, event: React.MouseEvent) => {
        if (!transformerData) return;
        const { highlight: newHighlight } = createBackwardHighlight(element, transformerData, dims);
        setHighlight(newHighlight);
        setActiveElement(element);
    }, [transformerData, dims]);

    const handleComponentClick = useCallback((componentId: string) => {
        setHighlight(prev => ({
            target: null, sources: [], destinations: [], activeComponent: componentId, activeResidual: null
        }));
        setTooltip(null);
        setAnimationData(null);
        setActiveElement(null);
        setViewMode('none');
    }, []);

    const closeTooltip = useCallback(() => { setTooltip(null); setViewMode('none'); setActiveElement(null); }, []);
    const closeAnimationPanel = useCallback(() => { setAnimationData(null); setViewMode('none'); setActiveElement(null); }, []);

    if (!transformerData) {
        return <div style={{padding: "20px", textAlign: "center"}}>正在加载或维度设置无效...</div>
    }

    const explanationDims = {
        ...dims,
        encoder_seq_len: transformerData.encoderInput.length,
        decoder_seq_len: transformerData.decoderInput.length,
        vocab_size: Object.keys(transformerData.vocab).length
    };

    return (
        <div className="main-layout" {...containerProps} style={{padding: '0', gap: '0', height: '100%'}}>
            {tooltip && <CalculationTooltip tooltip={tooltip} onClose={closeTooltip} />}
            {animationData && <AnimationPanel animationData={animationData} onClose={closeAnimationPanel} />}
            <Controls dims={dims} setDims={setDims} inputText={inputText} setInputText={setInputText}/>
            <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

            <div className="column left-column" style={{width: primarySize, flex: 'none', borderRadius: '0', boxShadow: 'none'}}>
                <div className="column-content">
                    <h2>模型结构与数据流 (重构版)</h2>
                    <Viz
                        data={transformerData}
                        highlight={highlight}
                        onElementClick={handleInteraction}
                        onComponentClick={handleComponentClick}
                    />
                </div>
            </div>
            <div className="split-pane-separator" {...separatorProps} />
            <div className="column right-column" style={{flex: 1, borderRadius: '0', boxShadow: 'none'}}>
                <div className="column-content">
                    <h2>数学原理详解 (重构版)</h2>
                    <Explanation
                        dims={explanationDims}
                        highlight={highlight}
                        onSymbolClick={handleInteraction}
                    />
                </div>
            </div>
        </div>
    );
}
// END OF FILE: src/topics/refactored-transformer-explorer/TransformerExplorerTopic.tsx