// FILE: src/topics/transformer-explorer/components/AnimationPanel.tsx
import React, { useRef } from 'react';
import { TooltipState } from '../../../components/CalculationTooltip/types';
import { useDraggableAndResizable } from '../../../hooks/useDraggableAndResizable';
import { InteractiveMatMulVisualizer } from '../../../components/visualizers/InteractiveMatMulVisualizer';
import { SoftmaxVisualizer } from '../../../components/visualizers/SoftmaxVisualizer';
import { ActivationFunctionVisualizer } from '../../../components/visualizers/ActivationFunctionVisualizer';
import { ElementWiseOpVisualizer } from '../../../components/visualizers/ElementWiseOpVisualizer';
import { LayerNormVisualizer } from '../../../components/visualizers/LayerNormVisualizer';
import { WxPlusBVisualizer } from '../../../components/visualizers/WxPlusBVisualizer'; // [NEW]
import { getSymbolParts } from '../lib/symbolMapping';
import '../../../components/CalculationTooltip/CalculationTooltip.css';
import {InlineMath} from "react-katex";

interface AnimationPanelProps {
  animationData: TooltipState | null;
  onClose: () => void;
}

export const AnimationPanel: React.FC<AnimationPanelProps> = ({ animationData, onClose }) => {
    const panelRef = useRef<HTMLDivElement>(null);

    const { position, size, dragHandleProps, resizeHandleProps } = useDraggableAndResizable({
        x: 100,
        y: 100,
        width: 900,
        height: 650,
    }, panelRef);

    if (!animationData) {
        return null;
    }

    const styles: { [key: string]: React.CSSProperties } = {
        panel: {
            top: position.y,
            left: position.x,
            width: size.width,
            height: size.height,
            zIndex: 1010,
        },
        panelHeader: {
            backgroundColor: '#f0f8ff',
            borderBottom: '1px solid #cce5ff',
        },
        panelTitle: {
            color: '#004085',
        },
        panelContentWrapper: {
            flexGrow: 1,
            overflowY: 'auto',
            padding: '10px',
            backgroundColor: '#ffffff',
        },
        visualizerContainer: {
            height: '100%',
        },
        visualizerRoot: {
            border: 'none',
            boxShadow: 'none',
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
        },
    };

    const renderVisualizer = () => {
        const step = animationData.steps[0];
        const op = step.op === '·' ? '×' : step.op;

        // [NEW] Specific handling for 'wx-plus-b'
        if (animationData.opType === 'wx-plus-b' && animationData.steps.length === 2) {
             const matmulStep = animationData.steps[0];
             const addStep = animationData.steps[1];
             return <WxPlusBVisualizer
                sourceVectorsA={matmulStep.aSources!}
                sourceVectorB={matmulStep.bSources![0]}
                biasVector={addStep.bSources![0]}
                resultSymbolInfo={getSymbolParts(animationData.target.name)}
             />;
        }


        switch (animationData.opType) {
            case 'matmul':
                const matmulStep = animationData.steps.find(s => s.op === '·' || s.op === '×') || step;
                return <InteractiveMatMulVisualizer
                    sourceVectorsA={matmulStep.aSources!}
                    sourceVectorB={matmulStep.bSources![0]}
                    resultSymbolInfo={getSymbolParts(animationData.target.name)}
                    operation={op as '×' | '+'}
                />;
            case 'add':
                const addStep = animationData.steps.find(s => s.op === '+') || step;
                return <ElementWiseOpVisualizer
                    matrixA={[addStep.a]}
                    matrixB={[addStep.b]}
                    operation="+"
                    labelA={addStep.aLabel || addStep.aSymbolInfo.base}
                    labelB={addStep.bLabel || addStep.bSymbolInfo.base}
                    labelC={addStep.resultLabel || 'Sum'}
                />;
            case 'layernorm':
                return <LayerNormVisualizer
                    inputVector={step.a}
                    inputLabel={step.aLabel}
                    outputLabel={step.resultLabel}
                />;
            case 'softmax':
                return <SoftmaxVisualizer
                    inputVector={step.a}
                    inputLabel={step.aLabel}
                    outputLabel={step.resultLabel}
                />;
            case 'relu':
                return <ActivationFunctionVisualizer
                    functionType="relu"
                    inputVector={step.a}
                    inputLabel={step.aLabel}
                    outputLabel={step.resultLabel}
                />;
            default:
                return <div style={{ padding: '20px' }}>此操作类型没有可用的动画。</div>;
        }
    };

    return (
        <div ref={panelRef} style={styles.panel} className="animation-panel resizable-panel">
            <div className="panel-header" {...dragHandleProps} style={styles.panelHeader}>
                <span className="panel-title" style={styles.panelTitle}>
                     <InlineMath>{`Calculation for ${animationData.target.symbol || ''}[${animationData.target.row},${animationData.target.col}]`}</InlineMath>
                </span>
                <button onClick={onClose} className="tooltip-close-btn">&times;</button>
            </div>
            <div className="panel-content-wrapper" style={styles.panelContentWrapper}>
                <div style={styles.visualizerContainer}>
                    <div style={styles.visualizerRoot}>
                        {renderVisualizer()}
                    </div>
                </div>
            </div>
            <div className="resize-handle br" {...resizeHandleProps.br}></div>
            <div className="resize-handle t" {...resizeHandleProps.t}></div>
            <div className="resize-handle r" {...resizeHandleProps.r}></div>
            <div className="resize-handle b" {...resizeHandleProps.b}></div>
            <div className="resize-handle l" {...resizeHandleProps.l}></div>
        </div>
    );
};
// END OF FILE: src/topics/transformer-explorer/components/AnimationPanel.tsx