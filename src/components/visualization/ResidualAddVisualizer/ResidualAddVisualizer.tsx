// FILE: src/components/visualization/ResidualAddVisualizer/ResidualAddVisualizer.tsx
import React, { useMemo } from 'react';
import { InteractiveMatrix } from '../../primitives/InteractiveMatrix/InteractiveMatrix';
import { BlockMath } from 'react-katex';
import { HighlightState } from '../../primitives/types';
import { Matrix } from '../types';
import { LayerNormVisualizer } from '../LayerNormVisualizer/LayerNormVisualizer';
import './ResidualAddVisualizer.css';

interface ResidualAddVisualizerProps {
    input: Matrix;
    sublayerOutput: Matrix;
}

const addMatrices = (A: Matrix, B: Matrix): Matrix => {
    return A.map((row, i) => row.map((val, j) => val + B[i][j]));
};

export const ResidualAddVisualizer: React.FC<ResidualAddVisualizerProps> = ({ input, sublayerOutput }) => {
    const added = useMemo(() => addMatrices(input, sublayerOutput), [input, sublayerOutput]);

    // Dummy state for demonstration
    const highlight: HighlightState = { target: null, sources: [] };
    const onElementClick = () => {};

    return (
        <div className="residual-visualizer">
            <h3 className="residual-title">Residual Connection (Add & Norm)</h3>

            <div className="residual-flow">
                <div className="input-branch">
                    <InteractiveMatrix name="sublayer_input" data={input} symbol="X_l" highlight={highlight} onElementClick={onElementClick} />
                </div>
                <BlockMath math="+" />
                <div className="input-branch">
                    <InteractiveMatrix name="sublayer_output" data={sublayerOutput} symbol="F(X_l)" highlight={highlight} onElementClick={onElementClick} />
                </div>
            </div>

            <div className="connector">↓ Add</div>

            <InteractiveMatrix name="added" data={added} symbol="X_l + F(X_l)" highlight={highlight} onElementClick={onElementClick} />

            <div className="connector">↓ LayerNorm</div>

            <LayerNormVisualizer inputVector={added[0]} inputLabel="X_l + F(X_l)" outputLabel="X_{l+1}"/>
        </div>
    );
};
// END OF FILE: src/components/visualization/ResidualAddVisualizer/ResidualAddVisualizer.tsx