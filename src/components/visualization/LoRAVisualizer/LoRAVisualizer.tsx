// FILE: src/components/visualization/LoRAVisualizer/LoRAVisualizer.tsx
import React, { useMemo } from 'react';
import { InteractiveMatrix } from '../../primitives/InteractiveMatrix/InteractiveMatrix';
import { BlockMath } from 'react-katex';
import { HighlightState } from '../../primitives/types';
import { Matrix } from '../types';
import './LoRAVisualizer.css';

interface LoRAVisualizerProps {
    W: Matrix;
    B: Matrix;
    A: Matrix;
    alpha?: number;
}

const multiplyMatrices = (A: Matrix, B: Matrix): Matrix => {
    const rowsA = A.length, colsA = A[0].length, colsB = B[0].length;
    const C: Matrix = Array(rowsA).fill(0).map(() => Array(colsB).fill(0));
    for (let i = 0; i < rowsA; i++) {
        for (let j = 0; j < colsB; j++) {
            let sum = 0;
            for (let k = 0; k < colsA; k++) {
                sum += A[i][k] * B[k][j];
            }
            C[i][j] = sum;
        }
    }
    return C;
};
const scaleAndAddMatrices = (W: Matrix, deltaW: Matrix, alpha: number): Matrix => {
    return W.map((row, i) => row.map((val, j) => val + alpha * deltaW[i][j]));
};


export const LoRAVisualizer: React.FC<LoRAVisualizerProps> = ({ W, B, A, alpha = 1 }) => {

    const { deltaW, finalW, scaledDeltaW } = useMemo(() => {
        const delta = multiplyMatrices(B, A);
        const scaledDelta = delta.map(row => row.map(val => val * alpha));
        const final = scaleAndAddMatrices(W, delta, alpha);
        return { deltaW: delta, finalW: final, scaledDeltaW: scaledDelta };
    }, [W, B, A, alpha]);

    const highlight: HighlightState = { target: null, sources: [] };
    const onElementClick = () => {};

    return (
        <div className="lora-visualizer">
            <h3 className="lora-title">LoRA: Low-Rank Adaptation</h3>
            <div className="lora-flow">
                <div className="lora-side-path">
                    <div className="path-label">LoRA Path (Trainable 🔥)</div>
                    <div className="lora-matrices">
                        <div className="trainable">
                            <InteractiveMatrix name="B" data={B} symbol="B" highlight={highlight} onElementClick={onElementClick} />
                        </div>
                        <BlockMath math="\times" />
                        <div className="trainable">
                            <InteractiveMatrix name="A" data={A} symbol="A" highlight={highlight} onElementClick={onElementClick} />
                        </div>
                    </div>
                    <div className="connector">↓</div>
                    <div className="delta">
                        <InteractiveMatrix name="DeltaW" data={deltaW} symbol="\Delta W" highlight={highlight} onElementClick={onElementClick} />
                    </div>
                </div>

                <div className="connector">↓ Scale by α</div>

                <div className="lora-branch">
                    <div className="lora-main-path">
                        <div className="path-label">Pretrained Weights (Frozen 🧊)</div>
                        <div className="frozen">
                            <InteractiveMatrix name="W" data={W} symbol="W" highlight={highlight} onElementClick={onElementClick} />
                        </div>
                    </div>

                    <div className="connector">+</div>

                    <div className="delta">
                        <InteractiveMatrix name="ScaledDeltaW" data={scaledDeltaW} symbol={`\\alpha \\cdot \\Delta W`} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                </div>

                <div className="connector">=</div>

                <div className="lora-final-path">
                    <InteractiveMatrix name="FinalW" data={finalW} symbol={`W'`} highlight={highlight} onElementClick={onElementClick} />
                </div>
            </div>
        </div>
    );
};
// END OF FILE: src/components/visualization/LoRAVisualizer/LoRAVisualizer.tsx