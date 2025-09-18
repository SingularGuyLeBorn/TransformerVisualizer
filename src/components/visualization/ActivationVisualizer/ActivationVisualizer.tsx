// FILE: src/components/visualization/ActivationVisualizer/ActivationVisualizer.tsx
import React, { useMemo, useState } from 'react';
import { Vector, ActivationFunctionType, ActivationStep } from '../types';
import { formatNumber } from '../../utils';
import { useAnimationController } from '../../hooks/useAnimationController';
import { InlineMath } from 'react-katex';
import { Controls } from '../MatMulVisualizer/Controls';
import { ActivationFunctionPlot } from './ActivationFunctionPlot';
import './ActivationVisualizer.css';

interface ActivationVisualizerProps {
    inputVector: Vector;
    functionType: ActivationFunctionType;
    inputLabel?: string;
    outputLabel?: string;
}

export const ActivationVisualizer: React.FC<ActivationVisualizerProps> = ({ inputVector, functionType, inputLabel = "Input", outputLabel = "Output" }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const functions: Record<ActivationFunctionType, (x: number) => number> = {
        relu: (x: number) => Math.max(0, x),
        gelu: (x: number) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3)))),
        silu: (x: number) => x / (1 + Math.exp(-x)),
        swiglu: (x: number) => (x / (1 + Math.exp(-x))) * x,
    };

    const functionFormulas: Record<ActivationFunctionType, string> = {
        relu: "max(0, x)",
        gelu: "0.5x(1 + tanh(...))",
        silu: "x \\cdot \\sigma(x)",
        swiglu: "(x \\cdot \\sigma(x)) \\cdot x"
    }

    const outputVector = useMemo(() => inputVector.map(functions[functionType]), [inputVector, functionType]);

    const steps: ActivationStep[] = useMemo(() => {
        const generatedSteps: ActivationStep[] = [{ type: 'start' }];
        inputVector.forEach((_, i) => {
            generatedSteps.push({ type: 'process', index: i });
        });
        generatedSteps.push({ type: 'finish' });
        return generatedSteps;
    }, [inputVector]);

    const { currentStep, isPlaying, play, pause, reset, setStepManually } = useAnimationController(steps.length, 600);
    const currentAnimState = steps[currentStep] || { type: 'idle' };
    const activeIndex = (currentAnimState.type === 'process') ? currentAnimState.index : (currentAnimState.type === 'finish' ? inputVector.length - 1 : -1);
    const lastCalculatedIndex = (currentAnimState.type === 'finish') ? inputVector.length - 1 : activeIndex;

    const displayIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;

    const activeInput = displayIndex > -1 ? inputVector[displayIndex] : null;
    const activeOutput = displayIndex > -1 ? outputVector[displayIndex] : null;
    const calculationString = activeInput !== null && activeOutput !== null
        ? `${functionType}(${formatNumber(activeInput, 2)}) = ${formatNumber(activeOutput, 2)}`
        : '...';

    const renderVector = (vec: Vector, label: string, isOutput: boolean) => (
        <div className="vector-section">
            <div className="label"><InlineMath>{label}</InlineMath></div>
            <div className="vector-group">
                <div className="vector-scroll">
                    <div className="vector">
                        {vec.map((val, i) => (
                            <div key={i} className="element-column">
                                <div className="index-label">{i}</div>
                                <div
                                    className={`element ${displayIndex === i ? (hoveredIndex === i ? 'highlight-hover' : 'highlight-anim') : ''}`}
                                    style={{ opacity: isOutput && i > lastCalculatedIndex && hoveredIndex === null ? 0.3 : 1 }}
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    {isOutput && i > lastCalculatedIndex && hoveredIndex === null ? '?' : formatNumber(val, 2)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="activation-visualizer">
            <h3 className="title">{functionType} Activation (<InlineMath>{functionFormulas[functionType]}</InlineMath>)</h3>
            <div className="main-area">
                <div className="content-layout">
                    <div className="vector-flow">
                        {renderVector(inputVector, inputLabel, false)}
                        <div className="calculation-box" style={{ opacity: displayIndex > -1 ? 1 : 0.2, backgroundColor: hoveredIndex !== null ? 'rgba(245, 166, 35, 0.05)' : '#fff' }}>
                            {calculationString}
                        </div>
                        {renderVector(outputVector, outputLabel, true)}
                    </div>
                    <div className="plot-container">
                        <ActivationFunctionPlot
                            functionType={functionType}
                            activeInput={activeInput}
                            activeOutput={activeOutput}
                        />
                    </div>
                </div>
            </div>
            <Controls
                currentStep={currentStep}
                totalSteps={steps.length}
                isPlaying={isPlaying}
                play={play}
                pause={pause}
                reset={reset}
                setStepManually={setStepManually}
            />
        </div>
    );
};
// END OF FILE: src/components/visualization/ActivationVisualizer/ActivationVisualizer.tsx