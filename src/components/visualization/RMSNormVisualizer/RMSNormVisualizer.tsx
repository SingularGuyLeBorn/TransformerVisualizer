// FILE: src/components/visualization/RMSNormVisualizer/RMSNormVisualizer.tsx
import React, { useMemo } from 'react';
import { Vector, RMSNormStep } from '../types';
import { formatNumber } from '../../utils';
import { useAnimationController } from '../../hooks/useAnimationController';
import { Controls } from '../MatMulVisualizer/Controls';
import { InlineMath } from 'react-katex';
import './RMSNormVisualizer.css';

interface RMSNormVisualizerProps {
    inputVector: Vector;
    epsilon?: number;
}

export const RMSNormVisualizer: React.FC<RMSNormVisualizerProps> = ({ inputVector, epsilon = 1e-5 }) => {
    const calculations = useMemo(() => {
        const n = inputVector.length;
        const squared = inputVector.map(x => x * x);
        const squaredSum = squared.reduce((a, b) => a + b, 0);
        const meanSquare = squaredSum / n;
        const rms = Math.sqrt(meanSquare + epsilon);
        const normalized = inputVector.map(x => x / rms);
        return { squared, squaredSum, rms, normalized };
    }, [inputVector, epsilon]);

    const steps: RMSNormStep[] = useMemo(() => {
        const generatedSteps: RMSNormStep[] = [{ type: 'start' }];
        inputVector.forEach((_, i) => generatedSteps.push({ type: 'square', index: i }));
        generatedSteps.push({ type: 'sum-squares', value: calculations.squaredSum });
        generatedSteps.push({ type: 'calculate-rms', value: calculations.rms });
        inputVector.forEach((_, i) => generatedSteps.push({ type: 'normalize', index: i }));
        generatedSteps.push({ type: 'finish' });
        return generatedSteps;
    }, [inputVector, calculations]);

    const { currentStep, isPlaying, play, pause, reset, setStepManually } = useAnimationController(steps.length, 300);
    const currentAnimState = steps[currentStep] || { type: 'idle' };

    const descriptions: Record<string, string> = {
        start: '初始输入向量。RMSNorm 是一种简化的 LayerNorm。',
        square: `首先，计算向量所有元素的平方和。`,
        'sum-squares': `平方和为 ${formatNumber(calculations.squaredSum)}`,
        'calculate-rms': `然后，计算均方根 (Root Mean Square)。公式: √ (Σ(x²) / n + ε)`,
        normalize: `最后，将每个原始元素除以 RMS 值进行归一化。公式: x / RMS(x)`,
        finish: '计算完成！(注意：这里省略了可学习的 gamma 缩放步骤)',
        idle: '准备开始RMSNorm计算。',
    };

    const getActiveDescription = () => descriptions[currentAnimState.type as keyof typeof descriptions] || descriptions.start;

    const isSumCalculated = currentStep >= steps.findIndex(s => s.type === 'sum-squares');
    const isRmsCalculated = currentStep >= steps.findIndex(s => s.type === 'calculate-rms');

    const renderVector = (vec: Vector, type: 'input' | 'squared' | 'normalized') => (
        <div className="vector">
            {vec.map((val, i) => {
                let isHighlighted = false;
                let isVisible = true;

                if (currentAnimState.type === 'square' && currentAnimState.index === i && (type === 'input' || type === 'squared')) isHighlighted = true;
                if (currentAnimState.type === 'normalize' && currentAnimState.index === i && (type === 'input' || type === 'normalized')) isHighlighted = true;

                if (type === 'squared') isVisible = currentStep >= steps.findIndex(s => s.type === 'square' && s.index === i);
                if (type === 'normalized') isVisible = currentStep >= steps.findIndex(s => s.type === 'normalize' && s.index === i);

                return (
                    <div key={i} className={`element ${isHighlighted ? 'highlight' : ''}`} style={{ opacity: isVisible ? 1 : 0.3 }}>
                        {isVisible ? formatNumber(val) : '?'}
                    </div>
                )
            })}
        </div>
    );

    return (
        <div className="rmsnorm-visualizer">
            <div className="step-container">
                <h3 className="title">RMSNorm(x)</h3>
                <p className="description">{getActiveDescription()}</p>

                {renderVector(inputVector, 'input')}
                <div className="connector" style={{ opacity: currentStep >= steps.findIndex(s => s.type === 'square') ? 1 : 0.2 }}>↓ <InlineMath>x^2</InlineMath></div>
                {renderVector(calculations.squared, 'squared')}

                <div className="connector" style={{ opacity: isSumCalculated ? 1 : 0.2 }}>↓ <InlineMath>\Sigma</InlineMath></div>
                <div className={`scalar ${currentAnimState.type === 'sum-squares' ? 'highlight' : ''}`} style={{ opacity: isSumCalculated ? 1 : 0.2 }}>
                    <InlineMath>{"\\Sigma(x^2) ="}</InlineMath> {isSumCalculated ? formatNumber(calculations.squaredSum) : '?'}
                </div>

                <div className="connector" style={{ opacity: isRmsCalculated ? 1 : 0.2 }}>↓ RMS</div>
                <div className={`scalar ${currentAnimState.type === 'calculate-rms' ? 'highlight' : ''}`} style={{ opacity: isRmsCalculated ? 1 : 0.2 }}>
                    RMS = {isRmsCalculated ? formatNumber(calculations.rms) : '?'}
                </div>

                <div className="connector" style={{ opacity: isRmsCalculated ? 1 : 0.2 }}>↓ Normalize</div>
                {renderVector(calculations.normalized, 'normalized')}
            </div>
            <Controls currentStep={currentStep} totalSteps={steps.length} isPlaying={isPlaying} play={play} pause={pause} reset={reset} setStepManually={setStepManually}/>
        </div>
    );
};
// END OF FILE: src/components/visualization/RMSNormVisualizer/RMSNormVisualizer.tsx