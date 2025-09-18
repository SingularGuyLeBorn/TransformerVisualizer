// FILE: src/components/visualization/AdapterVisualizer/AdapterVisualizer.tsx
import React, { useRef, useEffect, useState } from 'react';
import { InteractiveMatrix } from '../../primitives/InteractiveMatrix/InteractiveMatrix';
import { HighlightState } from '../../primitives/types';
import { Matrix } from '../types';
import './AdapterVisualizer.css';
import { BlockMath } from 'react-katex';

interface AdapterVisualizerProps {
    input: Matrix;
    downProj: Matrix;
    upProj: Matrix;
}

export const AdapterVisualizer: React.FC<AdapterVisualizerProps> = ({ input, downProj, upProj }) => {
    const highlight: HighlightState = { target: null, sources: [] };
    const onElementClick = () => {};

    const inputRef = useRef<HTMLDivElement>(null);
    const outputRef = useRef<HTMLDivElement>(null);
    const [pathData, setPathData] = useState('');

    useEffect(() => {
        if (inputRef.current && outputRef.current) {
            const startRect = inputRef.current.getBoundingClientRect();
            const endRect = outputRef.current.getBoundingClientRect();
            const containerRect = inputRef.current.parentElement!.parentElement!.getBoundingClientRect();

            const startX = startRect.left + startRect.width / 2 - containerRect.left;
            const startY = startRect.bottom - containerRect.top;
            const endX = endRect.left + endRect.width / 2 - containerRect.left;
            const endY = endRect.top - containerRect.top;

            const controlY = startY + 80;
            setPathData(`M ${startX} ${startY} C ${startX} ${controlY}, ${endX} ${controlY}, ${endX} ${endY}`);
        }
    }, [input, upProj]); // Recalculate on data change

    return (
        <div className="adapter-visualizer">
            <h3 className="adapter-title">Adapter Tuning</h3>
            <div className="adapter-flow">
                <svg className="residual-path-svg">
                    <path d={pathData} fill="none" stroke="#a0aec0" strokeWidth="3" strokeDasharray="8 8" />
                </svg>

                <div className="main-path">
                    <div ref={inputRef}>
                        <InteractiveMatrix name="adapter_input" data={input} symbol="X_l" highlight={highlight} onElementClick={onElementClick} />
                    </div>
                    <div className="connector">→</div>
                    <div className="transformer-layer">
                        <div className="layer-label">Transformer Layer</div>
                        <div className="frozen-label">(Frozen 🧊)</div>
                        <div className="adapter-module">
                            <div className="adapter-label">Adapter (Trainable 🔥)</div>
                            <div className="adapter-layers">
                                <span className="adapter-proj-label">Down Proj</span>
                                <InteractiveMatrix name="down_proj" data={downProj} symbol="W_{down}" highlight={highlight} onElementClick={onElementClick} />
                                <div className="adapter-arrow">↓</div>
                                <span>Activation</span>
                                <div className="adapter-arrow">↓</div>
                                <span className="adapter-proj-label">Up Proj</span>
                                <InteractiveMatrix name="up_proj" data={upProj} symbol="W_{up}" highlight={highlight} onElementClick={onElementClick} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="residual-connector">
                    <div className="connector">+</div>
                </div>

                <div ref={outputRef}>
                    <InteractiveMatrix name="adapter_output" data={input} symbol="X_{l+1}" highlight={highlight} onElementClick={onElementClick} />
                </div>
            </div>
        </div>
    );
};
// END OF FILE: src/components/visualization/AdapterVisualizer/AdapterVisualizer.tsx