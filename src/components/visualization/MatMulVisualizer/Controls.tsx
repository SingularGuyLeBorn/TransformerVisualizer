// FILE: src/components/visualization/MatMulVisualizer/Controls.tsx
// This is a generic controls component, extracted for reuse.
import React from 'react';
import './Controls.css';

interface ControlsProps {
    currentStep: number;
    totalSteps: number;
    isPlaying: boolean;
    play: () => void;
    pause: () => void;
    reset: () => void;
    setStepManually: (step: number) => void;
}

export const Controls: React.FC<ControlsProps> = ({
    currentStep,
    totalSteps,
    isPlaying,
    play,
    pause,
    reset,
    setStepManually
}) => {
    return (
        <div className="animation-controls-container">
            <div className="buttons-group">
                <button onClick={() => setStepManually(currentStep - 1)} disabled={currentStep <= 0}>
                    Prev
                </button>
                <button onClick={isPlaying ? pause : play} className={isPlaying ? 'playing' : ''}>
                    {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button onClick={() => setStepManually(currentStep + 1)} disabled={currentStep >= totalSteps - 1}>
                    Next
                </button>
                <button onClick={reset}>
                    Reset
                </button>
            </div>
            <input
                type="range"
                min={0}
                max={totalSteps - 1}
                value={currentStep}
                onChange={e => setStepManually(parseInt(e.target.value))}
                className="timeline-slider"
            />
        </div>
    );
};
// END OF FILE: src/components/visualization/MatMulVisualizer/Controls.tsx