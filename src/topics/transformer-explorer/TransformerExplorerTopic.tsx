// FILE: src/topics/transformer-explorer/TransformerExplorerTopic.tsx
import React, { useState, useCallback, useEffect } from 'react';
import './TransformerExplorerTopic.css';
import { Controls } from './components/Controls';
import { Viz } from './components/Viz';
import { Explanation } from './components/Explanation';
import { CalculationTooltip } from '../../components/CalculationTooltip/CalculationTooltip';
import { AnimationPanel } from './components/AnimationPanel'; // [NEW]
import { TooltipState } from '../../components/CalculationTooltip/types';
import { useTransformer } from './hooks/useTransformer';
import { useSplitPane } from '../../hooks/useSplitPane';
import { ElementIdentifier, HighlightState, TransformerData } from './types';
import { generateTooltipData, createBackwardHighlight } from './lib/tracing';

export const TransformerExplorerTopic: React.FC = () => {
    const [dims, setDims] = useState({ d_model: 8, h: 2, seq_len: 2, n_layers: 1, d_ff: 32 });
    const [inputText, setInputText] = useState("I am a student");
    const [highlight, setHighlight] = useState<HighlightState>({ target: null, sources: [], destinations: [], activeComponent: null, activeResidual: null });
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);

    // [NEW] State for the new animation panel
    const [preparedAnimationData, setPreparedAnimationData] = useState<TooltipState | null>(null);
    const [animationData, setAnimationData] = useState<TooltipState | null>(null);


    const { primarySize, separatorProps, containerProps } = useSplitPane(window.innerWidth * 0.55);

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

    const handleInteraction = useCallback((element: ElementIdentifier, event: React.MouseEvent) => {
        if (!transformerData) return;
        const { highlight: newHighlight } = createBackwardHighlight(element, transformerData, dims);
        setHighlight(newHighlight);

        const newTooltipData = generateTooltipData(element, transformerData, newHighlight.sources);
        setTooltip(newTooltipData);

        // [NEW] Prepare animation data, but don't show it yet.
        if (newTooltipData && newTooltipData.opType !== 'info') {
            setPreparedAnimationData(newTooltipData);
        } else {
            setPreparedAnimationData(null);
        }
        // Close any existing animation panel when a new element is clicked
        setAnimationData(null);

    }, [transformerData, dims]);

    const handleComponentClick = useCallback((componentId: string) => {
      setHighlight(prev => ({
          target: null, sources: [], destinations: [], activeComponent: componentId, activeResidual: null
      }));
      setTooltip(null);
      // [NEW] Clear any prepared animation when just exploring components
      setPreparedAnimationData(null);
      setAnimationData(null);
    }, []);

    const closeTooltip = useCallback(() => setTooltip(null), []);
    const closeAnimationPanel = useCallback(() => setAnimationData(null), []);

    const playAnimation = () => {
        if (preparedAnimationData) {
            setAnimationData(preparedAnimationData);
            setTooltip(null); // Close the compact tooltip when animation starts
        }
    };


    if (!transformerData) {
        return <div style={{padding: "20px", textAlign: "center"}}>正在加载或维度设置无效... (d_model 必须能被 h 整除)</div>
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
            <AnimationPanel animationData={animationData} onClose={closeAnimationPanel} />
            <Controls dims={dims} setDims={setDims} inputText={inputText} setInputText={setInputText}/>

            <div className="animation-button-container">
                <button
                    className="play-animation-button"
                    onClick={playAnimation}
                    disabled={!preparedAnimationData}
                    title={preparedAnimationData ? "播放详细计算动画" : "点击一个单元格以准备动画"}
                >
                    ▶️ 播放动画
                </button>
            </div>


            <div className="column left-column" style={{width: primarySize, flex: 'none', borderRadius: '0', boxShadow: 'none'}}>
                <div className="column-content">
                    <h2>模型结构与数据流</h2>
                    <p style={{textAlign: 'center', margin: '-10px 0 15px 0', fontSize: '0.9em', color: '#555'}}>
                        提示: 点击任何计算结果 (红色高亮) 的单元格,即可查看其详细计算过程.
                    </p>
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
                    <h2>数学原理详解</h2>
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
// END OF FILE: src/topics/transformer-explorer/TransformerExplorerTopic.tsx