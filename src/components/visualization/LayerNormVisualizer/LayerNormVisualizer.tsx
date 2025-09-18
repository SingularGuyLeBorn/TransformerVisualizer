// FILE: src/components/visualization/LayerNormVisualizer/LayerNormVisualizer.tsx
import React, { useMemo, useState } from 'react';
import { Vector, LayerNormStep } from '../types';
import { formatNumber } from '../../utils';
import { useAnimationController } from '../../hooks/useAnimationController';
import { InlineMath } from 'react-katex';
import { Controls } from '../MatMulVisualizer/Controls';
import './LayerNormVisualizer.css';

interface LayerNormVisualizerProps {
    inputVector: Vector;
    epsilon?: number;
    inputLabel?: string;
    outputLabel?: string;
}

export const LayerNormVisualizer: React.FC<LayerNormVisualizerProps> = ({ inputVector, epsilon = 1e-5, inputLabel = "Input", outputLabel = "Output" }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const calculations = useMemo(() => {
        const mean = inputVector.reduce((a, b) => a + b, 0) / inputVector.length;
        const variance = inputVector.map(x => (x - mean) ** 2).reduce((a, b) => a + b, 0) / inputVector.length;
        const stdDev = Math.sqrt(variance + epsilon);
        const normalized = inputVector.map(x => (x - mean) / stdDev);
        return { mean, variance, stdDev, normalized };
    }, [inputVector, epsilon]);

    const steps: LayerNormStep[] = useMemo(() => {
        const generatedSteps: LayerNormStep[] = [{ type: 'start' }];
        let currentSum = 0;
        inputVector.forEach((val, i) => {
            currentSum += val;
            generatedSteps.push({ type: 'accumulate-mean', index: i, sum: currentSum });
        });
        generatedSteps.push({ type: 'calculate-mean', value: calculations.mean });

        let currentVarSum = 0;
        inputVector.forEach((val, i) => {
            const term = (val - calculations.mean) ** 2;
            currentVarSum += term;
            generatedSteps.push({ type: 'accumulate-variance', index: i, sum: currentVarSum });
        });
        generatedSteps.push({ type: 'calculate-variance', value: calculations.variance });

        inputVector.forEach((_, i) => {
            generatedSteps.push({ type: 'apply-norm', index: i });
        });
        generatedSteps.push({ type: 'finish' });
        return generatedSteps;
    }, [inputVector, calculations]);

    const { currentStep, isPlaying, play, pause, reset, setStepManually } = useAnimationController(steps.length, 300);
    const currentAnimState = steps[currentStep] || { type: 'idle' };

    // [FIX] Added explicit return type annotation to the useMemo hook to resolve TS7022 and TS7024.
    const { meanFormula, varianceFormula, calculationString } = useMemo((): {
        meanFormula: string;
        varianceFormula: string;
        calculationString: string;
    } => {
        let newMeanFormula = '', newVarianceFormula = '', newCalcString = '';
        const meanEndIndex = steps.findIndex(s => s.type === 'calculate-mean');
        const varianceEndIndex = steps.findIndex(s => s.type === 'calculate-variance');

        if (currentAnimState.type === 'accumulate-mean' || currentStep > meanEndIndex) {
            const sum = (currentAnimState.type === 'accumulate-mean') ? currentAnimState.sum : calculations.mean * inputVector.length;
            newMeanFormula = `μ = ${formatNumber(sum, 2)} / ${inputVector.length} = ${formatNumber(sum / inputVector.length, 4)}`;
        }
        if (currentAnimState.type === 'accumulate-variance' || currentStep > varianceEndIndex) {
            const sum = (currentAnimState.type === 'accumulate-variance') ? currentAnimState.sum : calculations.variance * inputVector.length;
            newVarianceFormula = `σ² = ${formatNumber(sum, 2)} / ${inputVector.length} = ${formatNumber(sum / inputVector.length, 4)}`;
        }

        let displayIndex = hoveredIndex ?? (currentAnimState.type === 'apply-norm' ? currentAnimState.index : -1);
        if (currentAnimState.type === 'finish' && hoveredIndex === null) {
            displayIndex = inputVector.length - 1;
        }

        if (displayIndex !== -1) {
            const x = inputVector[displayIndex];
            const res = calculations.normalized[displayIndex];
            newCalcString = `(${formatNumber(x,2)} - ${formatNumber(calculations.mean,2)}) / √(${formatNumber(calculations.variance,2)} + ε) = ${formatNumber(res, 4)}`;
        }

        return { meanFormula: newMeanFormula, varianceFormula: newVarianceFormula, calculationString: newCalcString };
    }, [currentStep, currentAnimState, steps, calculations, inputVector, hoveredIndex]);

    const descriptions: Record<string, string> = {
        start: '初始输入向量。点击 "Play" 开始计算。',
        'accumulate-mean': '1. 计算均值(μ): 将所有元素累加求和。',
        'calculate-mean': `1. 均值(μ)计算完成，值为 ${formatNumber(calculations.mean, 4)}。`,
        'accumulate-variance': '2. 计算方差(σ²): 将每个元素与均值的差的平方累加。',
        'calculate-variance': `2. 方差(σ²)计算完成，值为 ${formatNumber(calculations.variance, 4)}。`,
        'apply-norm': '3. 归一化: 使用均值和方差对每个元素进行归一化。',
        finish: '计算完成！输出向量的均值接近0，方差接近1。',
        idle: '准备开始LayerNorm计算。',
    };

    const getActiveDescription = () => descriptions[currentAnimState.type as keyof typeof descriptions] || descriptions.start;

    const isMeanCalculated = currentStep >= steps.findIndex(s => s.type === 'calculate-mean');
    const isVarianceCalculated = currentStep >= steps.findIndex(s => s.type === 'calculate-variance');

    const renderVector = (vec: Vector, label: string, isOutput: boolean = false) => (
        <div className="vector-section">
            <div className="label"><InlineMath>{label}</InlineMath></div>
            <div className="vector-group">
                <div className="vector-scroll">
                    <div className="vector">
                        {vec.map((val, i) => {
                            let highlightClass = '';
                            if (hoveredIndex === i) highlightClass = 'highlight-hover';
                            else if (currentAnimState.type === 'accumulate-mean' && currentAnimState.index >= i) highlightClass = 'highlight-mean';
                            else if (currentAnimState.type === 'accumulate-variance' && currentAnimState.index >= i) highlightClass = 'highlight-variance';
                            else if (currentAnimState.type === 'apply-norm' && currentAnimState.index === i) highlightClass = isOutput ? 'highlight-norm' : 'highlight-mean';

                            const isVisible = !isOutput || currentStep >= steps.findIndex(s => s.type === 'apply-norm' && s.index === i);

                            return (
                                <div key={i} className="element-column">
                                    <div className="index-label">{i}</div>
                                    <div
                                        className={`element ${highlightClass}`}
                                        style={{ opacity: (isVisible || hoveredIndex !== null) ? 1 : 0.3 }}
                                        onMouseEnter={() => setHoveredIndex(i)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                    >
                                        {(isVisible || hoveredIndex !== null) ? formatNumber(val, 4) : '?'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="layernorm-visualizer">
            <div className="step-container">
                <h3 className="title">LayerNorm(x)</h3>
                <p className="description">{getActiveDescription()}</p>

                {renderVector(inputVector, inputLabel)}

                <div className="connector" style={{ opacity: currentStep > 0 ? 1 : 0.2 }}>↓</div>
                <div className="calculation-box" style={{ opacity: meanFormula ? 1 : 0.3, borderColor: isMeanCalculated ? '#28a745' : '#dee2e6' }}>{meanFormula || 'μ = ?'}</div>
                <div className="calculation-box" style={{ opacity: isMeanCalculated ? 1 : 0.3, borderColor: isVarianceCalculated ? '#28a745' : '#dee2e6' }}>{varianceFormula || 'σ² = ?'}</div>
                <div className="calculation-box" style={{ opacity: calculationString ? 1 : 0.3, backgroundColor: (hoveredIndex !== null) ? 'rgba(253, 126, 20, 0.1)' : '#e9ecef' }}>{calculationString || '...'}</div>
                <div className="connector" style={{ opacity: isVarianceCalculated ? 1 : 0.2 }}>↓</div>
                {renderVector(calculations.normalized, outputLabel, true)}
            </div>
            <Controls currentStep={currentStep} totalSteps={steps.length} isPlaying={isPlaying} play={play} pause={pause} reset={reset} setStepManually={setStepManually}/>
        </div>
    );
};
// END OF FILE: src/components/visualization/LayerNormVisualizer/LayerNormVisualizer.tsx