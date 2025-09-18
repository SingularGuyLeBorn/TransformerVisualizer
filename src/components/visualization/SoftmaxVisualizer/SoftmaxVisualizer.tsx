// FILE: src/components/visualization/SoftmaxVisualizer/SoftmaxVisualizer.tsx
import React, { useMemo, useState } from 'react';
import { Vector, SoftmaxStep } from '../types';
import { formatNumber } from '../../utils';
import { useAnimationController } from '../../hooks/useAnimationController';
import { InlineMath } from 'react-katex';
import { Controls } from '../MatMulVisualizer/Controls';
import './SoftmaxVisualizer.css';

interface SoftmaxVisualizerProps {
    inputVector: Vector;
    inputLabel?: string;
    outputLabel?: string;
}

export const SoftmaxVisualizer: React.FC<SoftmaxVisualizerProps> = ({ inputVector, inputLabel = "Logits", outputLabel = "P" }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const calculations = useMemo(() => {
        const finiteInputs = inputVector.filter(isFinite);
        const maxVal = finiteInputs.length > 0 ? Math.max(...finiteInputs) : 0;
        const shifted = inputVector.map(v => v - maxVal);
        const exps = shifted.map(v => isFinite(v) ? Math.exp(v) : 0);
        const sumExps = exps.reduce((a, b) => a + b, 0);
        const result = sumExps > 0 ? exps.map(v => v / sumExps) : exps.map(()=> 1 / exps.length);
        return { maxVal, shifted, exps, sumExps, result };
    }, [inputVector]);

    const steps: SoftmaxStep[] = useMemo(() => {
        const generatedSteps: SoftmaxStep[] = [{ type: 'start' }];
        generatedSteps.push({ type: 'highlight-max', value: calculations.maxVal });
        inputVector.forEach((_, i) => generatedSteps.push({ type: 'subtract-max', index: i }));
        inputVector.forEach((_, i) => generatedSteps.push({ type: 'exponentiate', index: i }));
        generatedSteps.push({ type: 'sum-exps', value: calculations.sumExps });
        inputVector.forEach((_, i) => generatedSteps.push({ type: 'normalize', index: i }));
        generatedSteps.push({ type: 'finish' });
        return generatedSteps;
    }, [inputVector, calculations]);

    const { currentStep, isPlaying, play, pause, reset, setStepManually } = useAnimationController(steps.length, 300);
    const currentAnimState = steps[currentStep] || { type: 'idle' };

    const descriptions: Record<string, string> = {
        start: `初始输入向量 (${inputLabel})。点击 "Play" 开始计算。`,
        'highlight-max': `1. 为保证数值稳定性, 计算最大值: max(${inputLabel}) = ${formatNumber(calculations.maxVal, 2)}。`,
        'subtract-max': `2. 从每个元素中减去最大值, 得到 L'。这可以防止计算指数时溢出。`,
        exponentiate: `3. 对 L' 中每个元素应用指数函数 e^x, 得到 E。`,
        'sum-exps': `4. 将 E 中所有元素相加, 得到归一化因子 ΣE = ${formatNumber(calculations.sumExps, 4)}。`,
        normalize: `5. 将 E 中每个元素除以总和 ΣE, 得到最终的概率分布 ${outputLabel}。`,
        finish: '计算完成！这是一个有效的概率分布, 所有元素之和为1。',
        idle: '准备开始Softmax计算。',
    };

    const getActiveDescription = () => descriptions[currentAnimState.type as keyof typeof descriptions] || descriptions.start;

    const isShiftedVisible = (index: number) => currentStep >= steps.findIndex(s => s.type === 'subtract-max' && s.index === index);
    const isExpVisible = (index: number) => currentStep >= steps.findIndex(s => s.type === 'exponentiate' && s.index === index);
    const isSumVisible = currentStep >= steps.findIndex(s => s.type === 'sum-exps');
    const isResultVisible = (index: number) => currentStep >= steps.findIndex(s => s.type === 'normalize' && s.index === index);

    const renderVector = (vec: Vector, label: React.ReactNode, type: 'input' | 'shifted' | 'exp' | 'result') => (
        <div className="vector-section">
            <div className="label">{typeof label === 'string' ? <InlineMath>{label}</InlineMath> : label}</div>
            <div className="vector-group">
                <div className="vector-scroll">
                    <div className="vector">
                        {vec.map((val, i) => {
                            let isHighlighted = false;
                            if (hoveredIndex === i) isHighlighted = true;
                            else if (currentAnimState.type === 'subtract-max' && currentAnimState.index === i && (type === 'input' || type === 'shifted')) isHighlighted = true;
                            else if (currentAnimState.type === 'exponentiate' && currentAnimState.index === i && (type === 'shifted' || type === 'exp')) isHighlighted = true;
                            else if (currentAnimState.type === 'normalize' && currentAnimState.index === i && (type === 'exp' || type === 'result')) isHighlighted = true;

                            let isVisible = true;
                            if (type === 'shifted') isVisible = isShiftedVisible(i);
                            if (type === 'exp') isVisible = isExpVisible(i);
                            if (type === 'result') isVisible = isResultVisible(i);

                            return (
                                <div key={`${type}-${i}`} className="element-column">
                                    <div className="index-label">{i}</div>
                                    <div
                                        className={`element ${isHighlighted ? (hoveredIndex === i ? 'highlight-hover' : 'highlight') : ''}`}
                                        style={{ opacity: (isVisible || hoveredIndex !== null) ? 1 : 0.3 }}
                                        onMouseEnter={() => setHoveredIndex(i)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                    >
                                        {(isVisible || hoveredIndex !== null) ? formatNumber(val, 2) : '?'}
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
        <div className="softmax-visualizer">
            <div className="step-container">
                <h3 className="title">Softmax(x)</h3>
                <p className="description">{getActiveDescription()}</p>

                {renderVector(inputVector, inputLabel, 'input')}
                <div className="connector" style={{ opacity: currentStep >= 1 ? 1 : 0.2 }}>↓ <InlineMath>{"- max(" + inputLabel + ") = -" + formatNumber(calculations.maxVal, 2)}</InlineMath></div>
                {renderVector(calculations.shifted, `L' = ${inputLabel} - max(${inputLabel})`, 'shifted')}
                <div className="connector" style={{ opacity: isShiftedVisible(inputVector.length - 1) ? 1 : 0.2 }}>↓ <InlineMath>e^x</InlineMath></div>
                {renderVector(calculations.exps, "E = e^{L'}", 'exp')}
                <div className="connector" style={{ opacity: isExpVisible(inputVector.length - 1) ? 1 : 0.2 }}>↓ <InlineMath>{"\\sum"}</InlineMath></div>
                <div className={`scalar ${currentAnimState.type === 'sum-exps' ? 'highlight' : ''}`} style={{ opacity: isSumVisible ? 1 : 0.2 }}>
                    <InlineMath>{"\\sum E ="}</InlineMath> {isSumVisible ? formatNumber(calculations.sumExps, 4) : '?'}
                </div>
                <div className="connector" style={{ opacity: isSumVisible ? 1 : 0.2 }}>↓ Normalize</div>
                {renderVector(calculations.result, `P = E / \\sum E`, 'result')}
            </div>
            <Controls currentStep={currentStep} totalSteps={steps.length} isPlaying={isPlaying} play={play} pause={pause} reset={reset} setStepManually={setStepManually}/>
        </div>
    );
};
// END OF FILE: src/components/visualization/SoftmaxVisualizer/SoftmaxVisualizer.tsx