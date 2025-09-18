// FILE: src/components/visualization/AttentionVisualizer/MLAVisualizer.tsx
import React from 'react';
import { InteractiveMatrix } from '../../primitives/InteractiveMatrix/InteractiveMatrix';
import { BlockMath } from 'react-katex';
import { HighlightState } from '../../primitives/types';
// This component will have its own simplified logic for demonstration
// A real implementation would share the logic from the topics section.

interface MLAVisualizerProps {
    seqLen: number;
    dModel: number;
    nQHeads: number;
    dHead: number;
}

const createDummyMatrix = (rows: number, cols: number, seed:number = 1) => Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => parseFloat((Math.sin(r * cols + c + seed) * 2).toFixed(2))));

export const MLAVisualizer: React.FC<MLAVisualizerProps> = ({ seqLen, dModel, nQHeads, dHead }) => {
    const d_c_prime = 32; // Latent dim for Q
    const d_c = 16; // Latent dim for KV
    const d_rope = 4;

    const highlight: HighlightState = { target: null, sources: [] };
    const onElementClick = () => {};

    return (
        <div className="attention-visualizer">
            <div className="av-header">
                <h3>MLA Visualizer</h3>
                <p>Multi-head Latent Attention</p>
            </div>
            <div className="av-calculation-step">
                <h4 className="av-step-title">1. Low-Rank Compression</h4>
                <div className="av-formula-row">
                    <InteractiveMatrix name="H" data={createDummyMatrix(seqLen, dModel)} symbol="H" highlight={highlight} onElementClick={onElementClick} />
                    <BlockMath math="\rightarrow" />
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        <InteractiveMatrix name="Cq" data={createDummyMatrix(seqLen, d_c_prime)} symbol="C'_{q}" highlight={highlight} onElementClick={onElementClick} />
                        <InteractiveMatrix name="Ckv" data={createDummyMatrix(seqLen, d_c)} symbol="C_{kv}" highlight={highlight} onElementClick={onElementClick} />
                        <InteractiveMatrix name="Krope" data={createDummyMatrix(seqLen, d_rope)} symbol="K_{rope}" highlight={highlight} onElementClick={onElementClick} />
                    </div>
                </div>
            </div>
            <div className="av-calculation-step">
                <h4 className="av-step-title">2. Attention Calculation (Conceptual)</h4>
                <p>Q, K, V are reconstructed from latent codes for each head and attention is computed.</p>
                <div className="av-formula-row">
                    <InteractiveMatrix name="Weights" data={createDummyMatrix(seqLen, seqLen)} symbol="A_h" highlight={highlight} onElementClick={onElementClick} />
                    <BlockMath math="\times" />
                    <InteractiveMatrix name="V" data={createDummyMatrix(seqLen, dHead)} symbol="V_h" highlight={highlight} onElementClick={onElementClick} />
                    <BlockMath math="=" />
                    <InteractiveMatrix name="Output" data={createDummyMatrix(seqLen, dHead)} symbol="H_h" highlight={highlight} onElementClick={onElementClick} />
                </div>
            </div>
        </div>
    );
};
// END OF FILE: src/components/visualization/AttentionVisualizer/MLAVisualizer.tsx