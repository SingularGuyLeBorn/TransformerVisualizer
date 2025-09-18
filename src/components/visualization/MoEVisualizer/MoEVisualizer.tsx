// FILE: src/components/visualization/MoEVisualizer/MoEVisualizer.tsx
import React, { useMemo } from 'react';
import { InteractiveVector } from '../../primitives/InteractiveVector/InteractiveVector';
import { InteractiveMatrix } from '../../primitives/InteractiveMatrix/InteractiveMatrix';
import { HighlightState } from '../../primitives/types';
import { Vector, Matrix } from '../types';
import { formatNumber } from '../../utils';
import { BlockMath } from 'react-katex';
import './MoEVisualizer.css';

interface MoEVisualizerProps {
    inputToken: Vector;
    routerLogits: Vector;
    experts: Matrix[];
    k: number;
}

const softmax = (vec: Vector): Vector => {
    const maxVal = Math.max(...vec);
    const exps = vec.map(val => Math.exp(val - maxVal));
    const sumExps = exps.reduce((a, b) => a + b, 0);
    return exps.map(exp => exp / sumExps);
};

const matrixVectorMul = (matrix: Matrix, vector: Vector): Vector => {
    if(!matrix || !vector || matrix.length === 0 || matrix[0].length !== vector.length) {
        return [];
    }
    return matrix.map(row => row.reduce((sum, val, i) => sum + val * vector[i], 0));
}

const createEmptyVector = (size: number): Vector => {
    return new Array(size).fill(0);
}


export const MoEVisualizer: React.FC<MoEVisualizerProps> = ({ inputToken, routerLogits, experts, k }) => {

    const { routerWeights, topK, expertOutputs, finalOutput } = useMemo(() => {
        const weights = softmax(routerLogits);
        const indexedWeights = weights.map((weight, index) => ({ weight, index }));
        indexedWeights.sort((a, b) => b.weight - a.weight);
        const topKExperts = indexedWeights.slice(0, k);

        const outputs = experts.map(expertMatrix => matrixVectorMul(expertMatrix, inputToken));

        const weightedSum = createEmptyVector(outputs[0]?.length || 0);
        topKExperts.forEach(({index, weight}) => {
            const expertOutput = outputs[index];
            if(expertOutput) {
                for(let i=0; i < weightedSum.length; i++) {
                    weightedSum[i] += expertOutput[i] * weight;
                }
            }
        });

        return { routerWeights: weights, topK: topKExperts, expertOutputs: outputs, finalOutput: weightedSum };
    }, [inputToken, routerLogits, experts, k]);

    const highlight: HighlightState = { target: null, sources: [] };
    const onElementClick = () => {};

    return (
        <div className="moe-visualizer">
            <h3 className="moe-title">Mixture of Experts (MoE)</h3>

            <div className="moe-flow">
                <div className="router-section">
                    <span className="path-label">Input Token</span>
                    <InteractiveVector name="input_token" data={inputToken} highlight={highlight} onElementClick={onElementClick} />
                    <div className="connector">↓ <span style={{fontSize: '0.6em'}}>Linear</span></div>
                    <span className="path-label">Router Logits</span>
                    <InteractiveVector name="router_logits" data={routerLogits} highlight={highlight} onElementClick={onElementClick} />
                    <div className="connector">↓ <span style={{fontSize: '0.6em'}}>Softmax</span></div>
                    <div className="router-label">Router Weights</div>
                    <InteractiveVector name="router_weights" data={routerWeights} highlight={highlight} onElementClick={onElementClick} />
                </div>

                <div className="experts-grid">
                    {experts.map((expertData, i) => {
                        const topKInfo = topK.find(expert => expert.index === i);
                        const isSelected = !!topKInfo;

                        return (
                            <div key={i} className={`expert-container ${isSelected ? 'selected' : ''}`}>
                                <div className="expert-label">Expert {i}</div>
                                <InteractiveMatrix name={`expert_${i}`} data={expertData} symbol={`E_{${i}}`} highlight={highlight} onElementClick={onElementClick} />
                                <div className="expert-weight">
                                    Weight: {isSelected ? formatNumber(topKInfo.weight) : formatNumber(routerWeights[i])}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="connector">↓</div>
                <div className="router-section">
                    <div className="router-label">Final Output (Weighted Sum of Top-K Experts)</div>
                    <div className="lora-matrices">
                        {topK.map(({index, weight}, i) => (
                            <React.Fragment key={index}>
                                <span>{formatNumber(weight)} <BlockMath math="\times" /></span>
                                <InteractiveVector name={`expert_out_${index}`} data={expertOutputs[index]} highlight={highlight} onElementClick={onElementClick}/>
                                {i < topK.length - 1 && <BlockMath math="+" />}
                            </React.Fragment>
                        ))}
                    </div>
                    <BlockMath math="=" />
                    <InteractiveVector name="output_token" data={finalOutput} highlight={highlight} onElementClick={onElementClick} />
                </div>
            </div>
        </div>
    );
};
// END OF FILE: src/components/visualization/MoEVisualizer/MoEVisualizer.tsx