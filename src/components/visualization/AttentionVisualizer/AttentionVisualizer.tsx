// FILE: src/components/visualization/AttentionVisualizer/AttentionVisualizer.tsx
import React, { useMemo } from 'react';
import { InteractiveMatrix } from '../../primitives/InteractiveMatrix/InteractiveMatrix';
import { BlockMath } from 'react-katex';
import { calculateAttention, AttentionResult } from './attention-logic';
import { HighlightState } from '../../primitives/types';
import { MLAVisualizer } from './MLAVisualizer';
import { AttentionVariant } from '../types'; // Import the correct type
import './AttentionVisualizer.css';

interface AttentionVisualizerProps {
    variant: AttentionVariant;
    seqLen: number;
    dModel: number;
    nQHeads: number;
    dHead: number;
}

export const AttentionVisualizer: React.FC<AttentionVisualizerProps> = ({
                                                                            variant,
                                                                            seqLen,
                                                                            dModel,
                                                                            nQHeads,
                                                                            dHead,
                                                                        }) => {
    const nKVHeads = useMemo(() => {
        if (variant === 'mha') return nQHeads;
        if (variant === 'mqa') return 1;
        // For GQA, default to a reasonable group size
        return Math.max(1, Math.floor(nQHeads / 4));
    }, [variant, nQHeads]);

    const attentionData: AttentionResult | null = useMemo(() => {
        if (dModel !== nQHeads * dHead) return null;
        if (variant !== 'mla' && nQHeads % nKVHeads !== 0) return null;
        // [FIX] The check is now correct. `variant` can be 'mla', so we exclude it from this calculation path.
        if (variant === 'mla') return null;
        return calculateAttention(seqLen, dModel, nQHeads, nKVHeads, dHead, variant);
    }, [seqLen, dModel, nQHeads, nKVHeads, dHead, variant]);

    // Dummy state for demonstration
    const highlight: HighlightState = { target: null, sources: [] };
    const onElementClick = () => {};

    // [FIX] This check is now type-safe and correct.
    if (variant === 'mla') {
        return <MLAVisualizer seqLen={seqLen} dModel={dModel} nQHeads={nQHeads} dHead={dHead} />;
    }

    if (!attentionData) {
        return (
            <div className="attention-visualizer">
                Invalid dimensions. Ensure d_model = n_q_heads * d_head and n_q_heads is divisible by n_kv_heads.
            </div>
        );
    }

    const { heads, CombinedOutput, FinalOutput } = attentionData;
    const qHeadsPerKVGroup = nQHeads / nKVHeads;

    const renderHeads = () => {
        const groupedHeads: JSX.Element[][] = Array.from({ length: nKVHeads }, () => []);
        heads.forEach((head, i) => {
            const kvGroupIndex = Math.floor(i / qHeadsPerKVGroup);
            groupedHeads[kvGroupIndex].push(
                <div key={i} className="av-head-container">
                    <div className="av-head-title">Q Head {i}</div>
                    <InteractiveMatrix name={`Q_${i}`} data={head.Q} symbol={`Q_{${i}}`} highlight={highlight} onElementClick={onElementClick} />
                </div>
            );
        });

        return groupedHeads.map((qGroup, kvIdx) => (
            <div key={kvIdx} className="av-kv-group">
                <div className="av-kv-group-title">KV Group {kvIdx} (shared by Q Heads {kvIdx * qHeadsPerKVGroup} to {(kvIdx + 1) * qHeadsPerKVGroup - 1})</div>
                <div className="av-kv-pair">
                    <InteractiveMatrix name={`K_${kvIdx}`} data={heads[kvIdx * qHeadsPerKVGroup].K} symbol={`K_{${kvIdx}}`} highlight={highlight} onElementClick={onElementClick} />
                    <InteractiveMatrix name={`V_${kvIdx}`} data={heads[kvIdx * qHeadsPerKVGroup].V} symbol={`V_{${kvIdx}}`} highlight={highlight} onElementClick={onElementClick} />
                </div>
                <div className="av-heads-grid">{qGroup}</div>
            </div>
        ));
    };


    return (
        <div className="attention-visualizer">
            <div className="av-header">
                <h3>{variant.toUpperCase()} Visualizer</h3>
                <p>
                    {nQHeads} Query Heads, {nKVHeads} Key/Value Heads
                </p>
            </div>

            <div className="av-calculation-step">
                <h4 className="av-step-title">1. Query, Key, and Value Projections</h4>
                <div>{renderHeads()}</div>
            </div>

            <div className="av-calculation-step">
                <h4 className="av-step-title">2. Attention Scores & Outputs (Showing Head 0)</h4>
                <div className="av-formula-row">
                    <InteractiveMatrix name="Q_0_scores" data={heads[0].Q} symbol="Q_0" highlight={highlight} onElementClick={onElementClick} />
                    <BlockMath math="\times" />
                    <InteractiveMatrix name="K_0_scores" data={heads[0].K} symbol={`K_{group(0)}`} isTransposed highlight={highlight} onElementClick={onElementClick} />
                    <BlockMath math="\xrightarrow{\text{Softmax}}" />
                    <InteractiveMatrix name="Weights_0" data={heads[0].Weights} symbol="A_0" highlight={highlight} onElementClick={onElementClick} />
                    <BlockMath math="\times" />
                    <InteractiveMatrix name="V_0_scores" data={heads[0].V} symbol={`V_{group(0)}`} highlight={highlight} onElementClick={onElementClick} />
                    <BlockMath math="=" />
                    <InteractiveMatrix name="Output_0" data={heads[0].Output} symbol="H_0" highlight={highlight} onElementClick={onElementClick} />
                </div>
            </div>

            <div className="av-calculation-step">
                <h4 className="av-step-title">3. Concatenate & Final Projection</h4>
                <div className="av-formula-row">
                    <InteractiveMatrix name="Combined" data={CombinedOutput} symbol="H_{cat}" highlight={highlight} onElementClick={onElementClick} />
                    <BlockMath math="\times W_O =" />
                    <InteractiveMatrix name="Final" data={FinalOutput} symbol="Z" highlight={highlight} onElementClick={onElementClick} />
                </div>
            </div>

        </div>
    );
};
// END OF FILE: src/components/visualization/AttentionVisualizer/AttentionVisualizer.tsx