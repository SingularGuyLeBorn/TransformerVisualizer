// FILE: src/components/visualization/ElementwiseOpVisualizer/ElementwiseOpVisualizer.tsx
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Vector, ElementWiseOpStep } from '../types';
import { formatNumber } from '../../primitives/utils';
import { useAnimationController } from '../../hooks/useAnimationController';
import { InlineMath } from 'react-katex';
import { Controls } from '../MatMulVisualizer/Controls'; // Reusing controls component
import './ElementwiseOpVisualizer.css';

interface ElementWiseOpVisualizerProps {
    vectorA: Vector;
    vectorB: Vector;
    operation: '+' | '-' | '×' | '÷';
    labelA?: string;
    labelB?: string;
    labelC?: string;
}

export const ElementWiseOpVisualizer: React.FC<ElementWiseOpVisualizerProps> = ({ vectorA, vectorB, operation, labelA = 'A', labelB = 'B', labelC = 'C' }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const elementsARef = useRef<(HTMLDivElement | null)[]>([]);
    const elementsBRef = useRef<(HTMLDivElement | null)[]>([]);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const resultVector = useMemo(() => vectorA.map((val, c) => {
        switch (operation) {
            case '+': return val + vectorB[c];
            case '-': return val - vectorB[c];
            case '×': return val * vectorB[c];
            case '÷': return val / vectorB[c];
            default: return NaN;
        }
    }), [vectorA, vectorB, operation]);

    const numCols = vectorA.length;

    const steps: ElementWiseOpStep[] = useMemo(() => {
        const generatedSteps: ElementWiseOpStep[] = [{ type: 'start' }];
        for (let c = 0; c < numCols; c++) {
            generatedSteps.push({ type: 'highlight', col: c });
            generatedSteps.push({ type: 'calculate', col: c });
        }
        generatedSteps.push({ type: 'finish' });
        return generatedSteps;
    }, [numCols]);

    const { currentStep, isPlaying, play, pause, reset, setStepManually } = useAnimationController(steps.length, 600);
    const currentAnimState = steps[currentStep] || { type: 'idle' };
    const animActiveCol = (currentAnimState.type === 'highlight' || currentAnimState.type === 'calculate') ? currentAnimState.col : -1;
    const lastCalculatedIndex = (currentAnimState.type === 'finish')
        ? numCols - 1
        : (currentAnimState.type === 'calculate' ? currentAnimState.col : animActiveCol - 1);

    const [opPosition, setOpPosition] = useState<{ top: number, left: number } | null>(null);
    const displayIndex = hoveredIndex ?? animActiveCol;

    useEffect(() => {
        if (displayIndex !== -1 && containerRef.current && elementsARef.current[displayIndex] && elementsBRef.current[displayIndex]) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const elARect = elementsARef.current[displayIndex]!.getBoundingClientRect();
            const elBRect = elementsBRef.current[displayIndex]!.getBoundingClientRect();

            const top = (elARect.bottom - containerRect.top + (elBRect.top - elARect.bottom) / 2);
            const left = (elARect.left - containerRect.left + elARect.width / 2);

            setOpPosition({ top, left });
        }
    }, [displayIndex]);

    const renderVector = (vec: Vector, label: string, isResult: boolean = false, refs?: React.MutableRefObject<(HTMLDivElement | null)[]>) => (
        <div className="row">
            <div className="label"><InlineMath>{label}</InlineMath></div>
            <div className="vector-group">
                <div className="vector-scroll">
                    <div className="vector">
                        {vec.map((val, i) => {
                            const isAnimActive = animActiveCol === i;
                            const isHoverActive = hoveredIndex === i;
                            let highlightClass = '';
                            if (isAnimActive) highlightClass = isResult ? 'result-highlight' : 'source-highlight';
                            if (isHoverActive) highlightClass += ' hover-highlight';

                            return (
                                <div key={i} className="element-column">
                                    <div className="index-label">{i}</div>
                                    <div
                                        ref={refs ? el => { if (refs.current) refs.current[i] = el; } : undefined}
                                        className={`element ${highlightClass}`}
                                        style={{ opacity: (isResult && i > lastCalculatedIndex && hoveredIndex === null) ? 0.3 : 1 }}
                                        onMouseEnter={() => setHoveredIndex(i)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                    >
                                        {(isResult && i > lastCalculatedIndex && hoveredIndex === null) ? '?' : formatNumber(val, 2)}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="elementwise-op-visualizer" ref={containerRef}>
            {renderVector(vectorA, labelA, false, elementsARef)}
            {renderVector(vectorB, labelB, false, elementsBRef)}
            {opPosition && (
                <div
                  className={`op-symbol ${(hoveredIndex !== null || currentAnimState.type === 'calculate') && displayIndex !== -1 ? 'op-visible' : ''}`}
                  style={{ top: opPosition.top, left: opPosition.left }}
                >
                    {operation}
                </div>
            )}
            <div className="equal-sign-row">
                <div className="equal-sign">=</div>
            </div>
            {renderVector(resultVector, labelC, true)}

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
// END OF FILE: src/components/visualization/ElementwiseOpVisualizer/ElementwiseOpVisualizer.tsx