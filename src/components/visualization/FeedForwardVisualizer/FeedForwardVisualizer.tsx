// FILE: src/components/visualization/FeedForwardVisualizer/FeedForwardVisualizer.tsx
import React, { useMemo } from 'react';
import { InteractiveMatrix } from '../../primitives/InteractiveMatrix/InteractiveMatrix';
import { BlockMath, InlineMath } from 'react-katex';
import { HighlightState } from '../../primitives/types';
import { ActivationFunctionType, Vector, Matrix } from '../types';
import './FeedForwardVisualizer.css';

interface FFNVisualizerProps {
    input: Matrix;
    w1: Matrix;
    b1: Vector;
    w2: Matrix;
    b2: Vector;
    activationType: ActivationFunctionType;
}

// Simplified logic for demonstration
const applyFFN = (input: Matrix, w1: Matrix, b1: Vector, w2: Matrix, b2: Vector, activation: (x: number) => number) => {
    const linear1 = input.map(row =>
        w1[0].map((_, j) => row.reduce((sum, val, k) => sum + val * w1[k][j], 0) + b1[j])
    );
    const activated = linear1.map(row => row.map(activation));
    const output = activated.map(row =>
        w2[0].map((_, j) => row.reduce((sum, val, k) => sum + val * w2[k][j], 0) + b2[j])
    );
    return { intermediate: linear1, activated, output };
};

const functions: Record<ActivationFunctionType, (x: number) => number> = {
    relu: (x: number) => Math.max(0, x),
    gelu: (x: number) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3)))),
    silu: (x: number) => x / (1 + Math.exp(-x)),
    swiglu: (x: number) => (x / (1 + Math.exp(-x))) * x,
};

export const FeedForwardVisualizer: React.FC<FFNVisualizerProps> = ({ input, w1, b1, w2, b2, activationType }) => {

    const { intermediate, activated, output } = useMemo(() =>
            applyFFN(input, w1, b1, w2, b2, functions[activationType]),
        [input, w1, b1, w2, b2, activationType]
    );

    // Dummy state for demonstration
    const highlight: HighlightState = { target: null, sources: [] };
    const onElementClick = () => {};

    return (
        <div className="ffn-visualizer">
            <h3 className="ffn-title">Feed-Forward Network</h3>
            <div className="ffn-flow">
                <div className="ffn-step active">
                    <InteractiveMatrix name="ffn_input" data={input} symbol="Z'" highlight={highlight} onElementClick={onElementClick} />
                </div>

                <div className="connector">↓</div>

                <div className="ffn-step">
                    <div className="ffn-step-label">1. Linear Layer + Bias</div>
                    <div className="ffn-formula-row">
                        <InteractiveMatrix name="ffn_input_2" data={input} symbol="Z'" highlight={highlight} onElementClick={onElementClick} />
                        <BlockMath math="\times" />
                        <InteractiveMatrix name="w1" data={w1} symbol="W_1" highlight={highlight} onElementClick={onElementClick} />
                        <BlockMath math="+" />
                        <InteractiveMatrix name="b1" data={[b1]} symbol="b_1" highlight={highlight} onElementClick={onElementClick} />
                    </div>
                    <div className="connector">=</div>
                    <InteractiveMatrix name="intermediate" data={intermediate} symbol="H_{int}" highlight={highlight} onElementClick={onElementClick} />
                </div>

                <div className="connector">↓</div>

                <div className="ffn-step">
                    <div className="ffn-step-label">2. Activation Function (<InlineMath>{activationType.toUpperCase()}</InlineMath>)</div>
                    <InteractiveMatrix name="activated" data={activated} symbol="H_{act}" highlight={highlight} onElementClick={onElementClick} />
                </div>

                <div className="connector">↓</div>

                <div className="ffn-step">
                    <div className="ffn-step-label">3. Linear Layer + Bias</div>
                    <div className="ffn-formula-row">
                        <InteractiveMatrix name="activated_2" data={activated} symbol="H_{act}" highlight={highlight} onElementClick={onElementClick} />
                        <BlockMath math="\times" />
                        <InteractiveMatrix name="w2" data={w2} symbol="W_2" highlight={highlight} onElementClick={onElementClick} />
                        <BlockMath math="+" />
                        <InteractiveMatrix name="b2" data={[b2]} symbol="b_2" highlight={highlight} onElementClick={onElementClick} />
                    </div>
                    <div className="connector">=</div>
                    <InteractiveMatrix name="ffn_output" data={output} symbol="F" highlight={highlight} onElementClick={onElementClick} />
                </div>

            </div>
        </div>
    );
};
// END OF FILE: src/components/visualization/FeedForwardVisualizer/FeedForwardVisualizer.tsx