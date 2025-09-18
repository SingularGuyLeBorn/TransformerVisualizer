// FILE: src/components/visualization/SFTVisualizer/SFTVisualizer.tsx
import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import './SFTVisualizer.css';

interface SFTVisualizerProps {
    prompt: string;
    completion: string;
    modelPrediction: string;
}

export const SFTVisualizer: React.FC<SFTVisualizerProps> = ({ prompt, completion, modelPrediction }) => {

    // A simple character-level "loss" for demonstration
    const loss = completion.split('').reduce((acc, char, i) => {
        return acc + (char !== modelPrediction[i] ? 1 : 0);
    }, 0) / completion.length;

    return (
        <div className="sft-visualizer">
            <h3 className="sft-title">Supervised Fine-Tuning (SFT)</h3>
            <div className="sft-io-container">
                <div className="qa-pair">
                    <div className="qa-label">Input Prompt</div>
                    <div className="qa-text prompt">{prompt}</div>
                </div>

                <div className="connector">↓</div>

                <div className="model-block">
                    LLM (Trainable 🔥)
                </div>

                <div className="connector">↓</div>

                <div className="qa-pair">
                    <div className="qa-label">Model Prediction</div>
                    <div className="qa-text" style={{backgroundColor: '#fff3cd'}}>{modelPrediction}</div>
                </div>

                <div className="loss-calculation">
                    <div className="qa-pair" style={{textAlign: 'center'}}>
                        <div className="qa-label">Ground Truth Completion</div>
                        <div className="qa-text completion">{completion}</div>
                    </div>
                    <div className="connector">vs.</div>
                    <BlockMath math="\text{Loss} = \text{CrossEntropy}(\text{Prediction}, \text{Ground Truth})"/>
                    <div className="loss-value">
                        Loss = {loss.toFixed(3)}
                    </div>
                    <div className="gradient-arrow">⟲</div>
                    <span>Backpropagation (Update Weights)</span>
                </div>

            </div>
        </div>
    );
};
// END OF FILE: src/components/visualization/SFTVisualizer/SFTVisualizer.tsx