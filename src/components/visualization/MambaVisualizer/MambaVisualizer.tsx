// FILE: src/components/visualization/MambaVisualizer/MambaVisualizer.tsx
import React, { useMemo, useEffect, useState } from 'react';
import { Vector, MambaStep } from '../types';
import { formatNumber } from '../../utils';
import { useAnimationController } from '../../hooks/useAnimationController';
import { InlineMath } from 'react-katex';
import { Controls } from '../MatMulVisualizer/Controls';
import './MambaVisualizer.css';

interface MambaVisualizerProps {
    inputVector: Vector;
    dt: number;
    a: number;
    b: number;
    c: number;
}

export const MambaVisualizer: React.FC<MambaVisualizerProps> = ({ inputVector, dt, a, b, c }) => {

    const { outputs, hiddenStates, a_bar_vals, b_bar_vals } = useMemo(() => {
        const h: Vector = [0];
        const y: Vector = [];
        const a_bars: Vector = [];
        const b_bars: Vector = [];

        for (let i = 0; i < inputVector.length; i++) {
            const delta_t = Math.log(1 + Math.exp(dt * inputVector[i]));
            const a_bar = Math.exp(delta_t * a);
            const b_bar = delta_t * b;

            const h_next = a_bar * h[i] + b_bar * inputVector[i];
            const y_next = c * h_next;

            h.push(h_next);
            y.push(y_next);
            a_bars.push(a_bar);
            b_bars.push(b_bar);
        }
        return { outputs: y, hiddenStates: h, a_bar_vals: a_bars, b_bar_vals: b_bars };
    }, [inputVector, dt, a, b, c]);

    const steps: MambaStep[] = useMemo(() => {
        const generatedSteps: MambaStep[] = [{ type: 'start' }];
        inputVector.forEach((_, i) => {
            generatedSteps.push({ type: 'update_h', index: i });
            generatedSteps.push({ type: 'calculate_y', index: i });
        });
        generatedSteps.push({ type: 'finish' });
        return generatedSteps;
    }, [inputVector]);

    const { currentStep, isPlaying, play, pause, reset, setStepManually } = useAnimationController(steps.length, 1200);
    const currentAnimState = steps[currentStep] || { type: 'idle' };

    const activeIndex = 'index' in currentAnimState ? currentAnimState.index : -1;
    const isUpdatingH = currentAnimState.type === 'update_h';
    const isCalculatingY = currentAnimState.type === 'calculate_y';

    const [prevHiddenState, setPrevHiddenState] = useState(0);
    useEffect(() => {
        if(isUpdatingH && activeIndex > 0){
            setTimeout(() => setPrevHiddenState(hiddenStates[activeIndex]), 600)
        } else if (currentAnimState.type === 'start' || currentAnimState.type === 'idle'){
            setPrevHiddenState(0);
        }
    }, [isUpdatingH, activeIndex, hiddenStates, currentAnimState.type])

    return (
        <div className="mamba-visualizer">
            <h3 className="mamba-title">Mamba (SSM) Selective Scan</h3>
            <div className="mamba-io-row">
                <div className="mamba-vector-container">
                    <div className="mamba-vector-label"><InlineMath>x(t)</InlineMath> (Input)</div>
                    <div className="mamba-vector">
                        {inputVector.map((val, i) => (
                            <div key={i} className={`mamba-element ${activeIndex === i ? 'active' : ''}`}>{formatNumber(val, 2)}</div>
                        ))}
                    </div>
                </div>
                <div className="mamba-vector-container">
                    <div className="mamba-vector-label"><InlineMath>y(t)</InlineMath> (Output)</div>
                    <div className="mamba-vector">
                        {outputs.map((val, i) => (
                            <div key={i} className={`mamba-element ${activeIndex === i && isCalculatingY ? 'highlight-output active' : ''}`}>
                                {currentStep > (i * 2 + 2) ? formatNumber(val, 2) : '?'}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="ssm-scan-container">
                <h4 className="ssm-scan-title">Recurrent State Update (Time Step t={activeIndex > -1 ? activeIndex : '...'})</h4>
                <div className="ssm-equation">
                    <InlineMath>{`h(t) = \\bar{A}h(t-1) + \\bar{B}x(t)`}</InlineMath>
                </div>

                <div className="ssm-dynamic-params-info">
                    <InlineMath>{"\\bar{A} = e^{\\Delta \\cdot A}"}</InlineMath>, <InlineMath>{"\\bar{B} = \\Delta \\cdot B"}</InlineMath>, where <InlineMath>{"\\Delta = f(x(t))"}</InlineMath> is data-dependent.
                </div>

                <div className="ssm-params">
                    <div className="ssm-param-item">
                        <span className="label">h({activeIndex > 0 ? activeIndex - 1 : 't-1'}): </span>
                        <span className="value" style={{ transition: 'all 0.5s ease' }}>{formatNumber(hiddenStates[activeIndex] || 0, 3)}</span>
                    </div>
                    <div className="ssm-param-item">
                        <span className="label"><InlineMath>\bar A</InlineMath>: </span>
                        <span className="value">{formatNumber(a_bar_vals[activeIndex] || 0, 3)}</span>
                    </div>
                    <div className="ssm-param-item">
                        <span className="label"><InlineMath>\bar B</InlineMath>: </span>
                        <span className="value">{formatNumber(b_bar_vals[activeIndex] || 0, 3)}</span>
                    </div>
                    <div className="ssm-param-item">
                        <span className="label">x({activeIndex > -1 ? activeIndex : 't'}): </span>
                        <span className="value">{formatNumber(inputVector[activeIndex] || 0, 3)}</span>
                    </div>
                </div>

                <div className="mamba-vector-container">
                    <div className="mamba-vector-label"><InlineMath>h(t)</InlineMath> (Hidden State)</div>
                    <div className="mamba-vector">
                        <div className={`mamba-element highlight-state`} style={{transform: `translateX(${(activeIndex) * 54}px)`}}>
                            {formatNumber(prevHiddenState, 2)}
                        </div>
                        {hiddenStates.slice(1).map((val, i) => (
                            <div key={i} className={`mamba-element ${activeIndex === i && isUpdatingH ? 'active' : ''}`}>
                                {currentStep > (i * 2 + 1) ? formatNumber(val, 2) : '?'}
                            </div>
                        ))}
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
// END OF FILE: src/components/visualization/MambaVisualizer/MambaVisualizer.tsx