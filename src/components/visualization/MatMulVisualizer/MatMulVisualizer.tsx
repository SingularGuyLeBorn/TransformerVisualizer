// FILE: src/components/visualization/MatMulVisualizer/MatMulVisualizer.tsx
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Vector, MatMulStep } from '../types';
import { useAnimationController } from '../../hooks/useAnimationController';
import { formatNumber } from '../../utils';
import { InlineMath } from 'react-katex';
import { Controls } from './Controls';
import './MatMulVisualizer.css';

interface MatMulVisualizerProps {
    vectorA: Vector;
    vectorB: Vector;
    labelA?: string;
    labelB?: string;
    labelC?: string;
    operation?: '×' | '+';
}

export const MatMulVisualizer: React.FC<MatMulVisualizerProps> = ({
    vectorA,
    vectorB,
    labelA = 'A',
    labelB = 'B',
    labelC = 'C',
    operation = '×',
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const elementsARef = useRef<(HTMLDivElement | null)[]>([]);
    const elementsBRef = useRef<(HTMLDivElement | null)[]>([]);
    const productRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const steps: MatMulStep[] = useMemo(() => {
        const generatedSteps: MatMulStep[] = [{ type: 'start' }];
        let cumulativeSum = 0;
        for (let i = 0; i < vectorA.length; i++) {
            generatedSteps.push({ type: 'highlight-pair', index: i });
            const product = vectorA[i] * vectorB[i];
            generatedSteps.push({ type: 'multiply', index: i, product });
            cumulativeSum += product;
            generatedSteps.push({ type: 'accumulate', index: i, product, cumulativeSum });
        }
        // [FIX] Updated to match the new, more precise type definition for 'finish'
        generatedSteps.push({ type: 'finish', cumulativeSum });
        return generatedSteps;
    }, [vectorA, vectorB]);

    const { currentStep, isPlaying, play, pause, reset, setStepManually } = useAnimationController(steps.length, 700);
    const result = useMemo(() => vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0), [vectorA, vectorB]);
    const currentAnimState: MatMulStep = steps[currentStep] || { type: 'idle' };
    const [sumHistory, setSumHistory] = useState<number[]>([]);

    // [FIX] Used a safer type guard ('in' operator) to check for the 'index' property.
    // This resolves the TS2339 compilation error.
    const animActiveIndex = 'index' in currentAnimState ? currentAnimState.index : -1;
    const displayIndex = hoveredIndex ?? animActiveIndex;

    useEffect(() => {
        const newSumHistory: number[] = [];
        for (let i = 0; i <= currentStep; i++) {
            const step = steps[i];
            if (step && step.type === 'accumulate') newSumHistory.push(step.product);
        }
        setSumHistory(newSumHistory);
    }, [currentStep, steps]);

    // [FIX] This effect now correctly depends on animActiveIndex
    useEffect(() => {
        if (animActiveIndex !== -1) {
            productRefs.current[animActiveIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            elementsBRef.current[animActiveIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            elementsARef.current[animActiveIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, [animActiveIndex]);

    const cumulativeSum = sumHistory.reduce((a, b) => a + b, 0);

    const renderVector = (vec: Vector, label: string, refs: React.MutableRefObject<(HTMLDivElement | null)[]>) => (
        <div className="row">
            <div className="label"><InlineMath>{label}</InlineMath></div>
            <div className="vector-group">
                <div className="vector-scroll">
                    <div className="vector">
                        {vec.map((val, i) => (
                            <div key={i} className="element-column">
                                <div className="index-label">{i}</div>
                                <div
                                    ref={el => refs.current[i] = el}
                                    className={`element ${displayIndex === i ? 'highlight-anim hover-highlight' : ''}`}
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >{formatNumber(val, 2)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="matmul-visualizer" ref={containerRef}>
            {renderVector(vectorA, labelA, elementsARef)}
            {renderVector(vectorB, labelB, elementsBRef)}

            <div className="product-row">
                <div className="label">Products</div>
                <div className="products-container">
                    <div className="products">
                        {vectorA.map((_, i) => {
                            const multiplyStepIndex = steps.findIndex(s => s.type === 'multiply' && s.index === i);
                            const isVisible = currentStep >= multiplyStepIndex;
                            const productStep = steps[multiplyStepIndex] as Extract<MatMulStep, { type: 'multiply' }>;

                            return (
                                <React.Fragment key={`prod-frag-${i}`}>
                                    <div className="product-term-container">
                                        <div
                                            ref={el => productRefs.current[i] = el}
                                            className={`product-term ${isVisible ? 'visible' : ''} ${displayIndex === i ? 'highlight-anim hover-highlight' : ''}`}
                                            onMouseEnter={() => setHoveredIndex(i)}
                                            onMouseLeave={() => setHoveredIndex(null)}
                                        >
                                            ({formatNumber(vectorA[i], 2)} {operation} {formatNumber(vectorB[i], 2)})
                                        </div>
                                        <div className={`product-result ${isVisible ? 'visible' : ''}`}>
                                            {isVisible ? `= ${formatNumber(productStep.product, 3)}` : ''}
                                        </div>
                                    </div>
                                    {i < vectorA.length - 1 && <span className={`plus-symbol ${currentStep > multiplyStepIndex ? 'visible' : ''}`}>+</span>}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="sum-container">
                <div className="sum-row">
                    <div className="sum-label"><InlineMath math="\sum" /></div>
                    <div className="sum-equation-scroll">
                        <div className="sum-equation">
                            {sumHistory.length > 0 ? (
                                sumHistory.map((p, i) => (
                                    <React.Fragment key={`sum-term-${i}`}>
                                    <span
                                        className={`sum-term ${displayIndex === i ? 'hover-highlight' : ''}`}
                                        onMouseEnter={() => setHoveredIndex(i)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                    >
                                        ({formatNumber(p, 3)})
                                    </span>
                                        {i < sumHistory.length - 1 && <span>+</span>}
                                    </React.Fragment>
                                ))
                            ) : (currentStep >= 0 && <span>0</span>)}
                        </div>
                    </div>
                </div>
                {sumHistory.length > 0 && (
                    <div className="sum-result">
                        <span>=</span>
                        <div className="sum-value">
                            {currentAnimState.type === 'accumulate' ? formatNumber(currentAnimState.cumulativeSum ?? 0, 3) : currentAnimState.type === 'finish' ? formatNumber(result, 3) : (currentStep > 0 ? formatNumber(cumulativeSum, 3) : '?')}
                        </div>
                    </div>
                )}
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
// END OF FILE: src/components/visualization/MatMulVisualizer/MatMulVisualizer.tsx