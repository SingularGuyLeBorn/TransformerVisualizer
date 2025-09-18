// FILE: src/components/visualization/RoPEVisualizer/RoPEVisualizer.tsx
import React, { useMemo, useState } from 'react';
import { Vector, RoPEStep } from '../types';
import { formatNumber } from '../../utils';
import { useAnimationController } from '../../hooks/useAnimationController';
import { InlineMath } from 'react-katex';
import { Controls } from '../MatMulVisualizer/Controls';
import './RoPEVisualizer.css';

interface RoPEVisualizerProps {
    inputVector: Vector;
    position: number;
}

export const RoPEVisualizer: React.FC<RoPEVisualizerProps> = ({ inputVector, position }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const calculations = useMemo(() => {
        const d = inputVector.length;
        const theta = 10000;
        const outputVector = [...inputVector];
        const details = [];

        for (let i = 0; i < d; i += 2) {
            const x_i = inputVector[i];
            const x_j = (i + 1 < d) ? inputVector[i + 1] : 0;

            const freq = 1 / (theta ** (i / d));
            const m_theta = position * freq;
            const cos_m_theta = Math.cos(m_theta);
            const sin_m_theta = Math.sin(m_theta);

            const y_i = x_i * cos_m_theta - x_j * sin_m_theta;
            const y_j = x_i * sin_m_theta + x_j * cos_m_theta;

            outputVector[i] = y_i;
            if (i + 1 < d) outputVector[i + 1] = y_j;

            details.push({ freq, m_theta, cos_m_theta, sin_m_theta });
        }
        return { outputVector, details };
    }, [inputVector, position]);

    const steps: RoPEStep[] = useMemo(() => {
        const generatedSteps: RoPEStep[] = [{ type: 'start' }];
        for (let i = 0; i < inputVector.length; i += 2) {
            generatedSteps.push({ type: 'process-pair', index: i });
        }
        generatedSteps.push({ type: 'finish' });
        return generatedSteps;
    }, [inputVector]);

    const { currentStep, isPlaying, play, pause, reset, setStepManually } = useAnimationController(steps.length, 800);
    const currentAnimState = steps[currentStep] || { type: 'idle' };

    const animActiveIndex = currentAnimState.type === 'process-pair' ? currentAnimState.index : -1;
    const lastCalculatedIndex = (currentAnimState.type === 'finish')
        ? inputVector.length - 1
        : (animActiveIndex !== -1 ? animActiveIndex + 1 : -1);

    const displayIndex = hoveredIndex !== null ? hoveredIndex : animActiveIndex;
    const detail = displayIndex !== -1 && calculations.details[displayIndex / 2] ? calculations.details[displayIndex / 2] : null;

    const renderPlot = () => {
        if (displayIndex === -1 || !detail) return <div className="plot-box"><p style={{textAlign: 'center', color: '#aaa', fontSize: '0.8em', padding: '10px'}}>Hover over or play animation to see rotation</p></div>;

        const SIZE = 200;
        const CENTER = SIZE / 2;
        const SCALE = Math.min(CENTER * 0.9 / (Math.max(...inputVector.map(Math.abs)) || 1), 50);
        const [x1, x2] = [inputVector[displayIndex], inputVector[displayIndex + 1] || 0];
        const [y1, y2] = [calculations.outputVector[displayIndex], calculations.outputVector[displayIndex + 1] || 0];

        const angle = detail.m_theta;
        const radius = Math.sqrt(x1**2 + x2**2) * SCALE;
        const startAngle = Math.atan2(x2, x1);
        const endAngle = startAngle - angle; // SVG angles are clockwise
        const largeArcFlag = angle > Math.PI ? 1 : 0;

        const arcPath = `M ${CENTER + radius * Math.cos(startAngle)} ${CENTER + radius * Math.sin(startAngle)} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${CENTER + radius * Math.cos(endAngle)} ${CENTER + radius * Math.sin(endAngle)}`;

        return (
            <div className="plot-box">
                <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                    <line x1={0} y1={CENTER} x2={SIZE} y2={CENTER} stroke="#ddd" />
                    <line x1={CENTER} y1={0} x2={CENTER} y2={SIZE} stroke="#ddd" />
                    <path d={arcPath} fill="none" stroke="rgba(245, 166, 35, 0.5)" strokeWidth="2" strokeDasharray="3 3"/>
                    <line x1={CENTER} y1={CENTER} x2={CENTER + x1 * SCALE} y2={CENTER + x2 * SCALE} stroke="#6c757d" strokeWidth="2" markerEnd="url(#arrow-gray)" />
                    <line x1={CENTER} y1={CENTER} x2={CENTER + y1 * SCALE} y2={CENTER + y2 * SCALE} stroke="#e63946" strokeWidth="2.5" markerEnd="url(#arrow-red)" />
                    <defs>
                        <marker id="arrow-gray" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#6c757d" /></marker>
                        <marker id="arrow-red" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#e63946" /></marker>
                    </defs>
                </svg>
            </div>
        );
    };


    return (
        <div className="rope-visualizer">
            <h3>Rotary Positional Embedding (RoPE)</h3>
            <div className="main-area">
                <div className="vector-column">
                    <h4>Input Vector (pos={position})</h4>
                    <div className="vector">
                        {inputVector.map((val, i) => (i % 2 === 0 &&
                            <div
                                key={i} className={`element-pair ${displayIndex === i ? 'highlight-hover' : ''}`}
                                onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <div className="element">{formatNumber(val)}</div>
                                <div className="element">{formatNumber(inputVector[i+1] || 0)}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="plot-column">
                    <h4>Rotation in 2D Plane</h4>
                    {renderPlot()}
                    <div className="formula-box">
                        {detail ? <>
                            <div><InlineMath math={`\\theta_i = 1 / ${10000}^{(${displayIndex}/${inputVector.length})}`} /></div>
                            <div>Rot Angle: {formatNumber(detail.m_theta, 2)} rad</div>
                            <div><InlineMath math={`(y_i, y_{i+1}) = (x_i, x_{i+1}) \\begin{pmatrix} \\cos(m\\theta) & \\sin(m\\theta) \\\\ -\\sin(m\\theta) & \\cos(m\\theta) \\end{pmatrix}`}/></div>
                        </> : "Hover a pair..."}
                    </div>
                </div>
                <div className="vector-column">
                    <h4>Output Vector</h4>
                    <div className="vector">
                        {calculations.outputVector.map((val, i) => (i % 2 === 0 &&
                            <div
                                key={i}
                                className={`element-pair ${animActiveIndex === i ? 'highlight-anim' : ''} ${hoveredIndex === i ? 'highlight-hover' : ''}`}
                                onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <div className="element" style={{ opacity: (lastCalculatedIndex < i && hoveredIndex === null) ? 0.3 : 1 }}>
                                    {(lastCalculatedIndex < i && hoveredIndex === null) ? '?' : formatNumber(val)}
                                </div>
                                <div className="element" style={{ opacity: (lastCalculatedIndex < i+1 && hoveredIndex === null) ? 0.3 : 1 }}>
                                    {(lastCalculatedIndex < i+1 && hoveredIndex === null) ? '?' : formatNumber(calculations.outputVector[i+1] || 0)}
                                </div>
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
// END OF FILE: src/components/visualization/RoPEVisualizer/RoPEVisualizer.tsx