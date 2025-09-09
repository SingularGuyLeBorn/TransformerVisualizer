// FILE: src/components/visualizers/RMSNormVisualizer.tsx
import React, { useMemo } from 'react';
import { Vector, RMSNormStep } from './types';
import { formatNumber, useAnimationController } from './utils';

interface RMSNormVisualizerProps {
  inputVector: Vector;
  epsilon?: number;
}

export const RMSNormVisualizer: React.FC<RMSNormVisualizerProps> = ({ inputVector, epsilon = 1e-5 }) => {

  const calculations = useMemo(() => {
    const n = inputVector.length;
    const squared = inputVector.map(x => x*x);
    const squaredSum = squared.reduce((a, b) => a + b, 0);
    const meanSquare = squaredSum / n;
    const rms = Math.sqrt(meanSquare + epsilon);
    const normalized = inputVector.map(x => x / rms);
    return { squared, squaredSum, rms, normalized };
  }, [inputVector, epsilon]);

  const steps: RMSNormStep[] = useMemo(() => {
    const generatedSteps: RMSNormStep[] = [{ type: 'start' }];
    inputVector.forEach((_, i) => generatedSteps.push({ type: 'square', index: i }));
    generatedSteps.push({ type: 'sum-squares', value: calculations.squaredSum });
    generatedSteps.push({ type: 'calculate-rms', value: calculations.rms });
    inputVector.forEach((_, i) => generatedSteps.push({ type: 'normalize', index: i }));
    generatedSteps.push({ type: 'finish' });
    return generatedSteps;
  }, [inputVector, calculations]);

  const { currentStep, isPlaying, play, pause, reset, setStepManually } = useAnimationController(steps.length, 300);
  const currentAnimState = steps[currentStep] || { type: 'idle' };

  // Inline Styles
  const styles: { [key: string]: React.CSSProperties } = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' },
    stepContainer: { width: '100%', padding: '15px', border: '1px solid #e9ecef', borderRadius: '8px', backgroundColor: '#fff', textAlign: 'center' },
    title: { margin: '0 0 10px 0', fontSize: '1.2em', fontWeight: 'bold' },
    description: { margin: '0 0 15px 0', color: '#6c757d', minHeight: '40px' },
    vector: { display: 'flex', justifyContent: 'center', gap: '5px', flexWrap: 'wrap' },
    element: { minWidth: '60px', padding: '5px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #ced4da', borderRadius: '4px', backgroundColor: '#fff', transition: 'all 0.3s ease' },
    highlight: { borderColor: '#fd7e14', backgroundColor: 'rgba(253, 126, 20, 0.1)', transform: 'scale(1.1)' },
    connector: { fontSize: '2em', color: '#6c757d', margin: '5px 0', transition: 'opacity 0.3s ease' },
    scalar: { padding: '8px 15px', fontSize: '1.1em', fontWeight: 'bold', border: '1px solid #ced4da', borderRadius: '8px', backgroundColor: '#e9ecef', transition: 'all 0.3s ease' },
    controls: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' },
    button: { padding: '8px 16px', fontSize: '1em', cursor: 'pointer', border: '1px solid #6c757d', borderRadius: '4px', backgroundColor: '#fff' },
    playingButton: { backgroundColor: '#6c757d', color: '#fff' },
  };

  const descriptions: Record<string, string> = {
    start: '初始输入向量。RMSNorm 是一种简化的 LayerNorm。',
    square: `首先，计算向量所有元素的平方和。`,
    'sum-squares': `平方和为 ${formatNumber(calculations.squaredSum)}`,
    'calculate-rms': `然后，计算均方根 (Root Mean Square)。公式: √ (Σ(x²) / n + ε)`,
    normalize: `最后，将每个原始元素除以 RMS 值进行归一化。公式: x / RMS(x)`,
    finish: '计算完成！(注意：这里省略了可学习的 gamma 缩放步骤)',
    idle: '准备开始RMSNorm计算。',
  };

  const getActiveDescription = () => {
    const key = currentAnimState.type as keyof typeof descriptions;
    return descriptions[key] || descriptions['start'];
  }

  const isSumCalculated = currentStep >= steps.findIndex(s => s.type === 'sum-squares');
  const isRmsCalculated = currentStep >= steps.findIndex(s => s.type === 'calculate-rms');

  const renderVector = (vec: Vector, type: 'input' | 'squared' | 'normalized') => (
    <div style={styles.vector}>
      {vec.map((val, i) => {
        let isHighlighted = false;
        let isVisible = true;

        if(type === 'input' && currentAnimState.type === 'square' && currentAnimState.index === i) isHighlighted = true;
        if(type === 'squared' && currentAnimState.type === 'square' && currentAnimState.index === i) isHighlighted = true;
        if(type === 'normalized' && currentAnimState.type === 'normalize' && currentAnimState.index === i) isHighlighted = true;

        if(type === 'squared') isVisible = currentStep >= steps.findIndex(s => s.type === 'square' && s.index === i);
        if(type === 'normalized') isVisible = currentStep >= steps.findIndex(s => s.type === 'normalize' && s.index === i);

        return (
          <div key={i} style={{ ...styles.element, ...(isHighlighted ? styles.highlight : {}), opacity: isVisible ? 1 : 0.3 }}>
            {isVisible ? formatNumber(val) : '?'}
          </div>
        )
      })}
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.stepContainer}>
        <h3 style={styles.title}>RMSNorm(x)</h3>
        <p style={styles.description}>{getActiveDescription()}</p>

        {renderVector(inputVector, 'input')}
        <div style={{...styles.connector, opacity: currentStep >= steps.findIndex(s => s.type === 'square') ? 1 : 0.2 }}>↓ x²</div>
        {renderVector(calculations.squared, 'squared')}

        <div style={{...styles.connector, opacity: isSumCalculated ? 1 : 0.2 }}>↓ Σ</div>
        <div style={{ ...styles.scalar, ...(currentAnimState.type === 'sum-squares' ? styles.highlight : {}), opacity: isSumCalculated ? 1 : 0.2 }}>
          Σ(x²) = {isSumCalculated ? formatNumber(calculations.squaredSum) : '?'}
        </div>

        <div style={{...styles.connector, opacity: isRmsCalculated ? 1 : 0.2 }}>↓ RMS</div>
        <div style={{ ...styles.scalar, ...(currentAnimState.type === 'calculate-rms' ? styles.highlight : {}), opacity: isRmsCalculated ? 1 : 0.2 }}>
          RMS = {isRmsCalculated ? formatNumber(calculations.rms) : '?'}
        </div>

        <div style={{...styles.connector, opacity: isRmsCalculated ? 1 : 0.2 }}>↓ Normalize</div>
        {renderVector(calculations.normalized, 'normalized')}
      </div>
      <div style={styles.controls}>
        <button onClick={() => setStepManually(currentStep - 1)} disabled={currentStep <= 0} style={styles.button}>上一步</button>
        <button onClick={isPlaying ? pause : play} style={{ ...styles.button, ...(isPlaying ? styles.playingButton : {}) }}>{isPlaying ? 'Pause' : 'Play'}</button>
        <button onClick={() => setStepManually(currentStep + 1)} disabled={currentStep >= steps.length - 1} style={styles.button}>下一步</button>
        <button onClick={reset} style={styles.button}>Reset</button>
      </div>
       <input
        type="range"
        min={-1}
        max={steps.length - 1}
        value={currentStep}
        onChange={e => setStepManually(parseInt(e.target.value))}
        style={{width: '80%', cursor: 'pointer', marginTop: '10px'}}
      />
    </div>
  );
};
// END OF FILE: src/components/visualizers/RMSNormVisualizer.tsx