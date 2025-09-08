// FILE: src/components/visualizers/LayerNormVisualizer.tsx
import React, { useMemo } from 'react';
import { Vector, LayerNormStep } from './types';
import { formatNumber, useAnimationController } from './utils';

interface LayerNormVisualizerProps {
  inputVector: Vector;
  epsilon?: number;
}

export const LayerNormVisualizer: React.FC<LayerNormVisualizerProps> = ({ inputVector, epsilon = 1e-5 }) => {

  const calculations = useMemo(() => {
    const mean = inputVector.reduce((a, b) => a + b, 0) / inputVector.length;
    const variance = inputVector.map(x => (x - mean) ** 2).reduce((a, b) => a + b, 0) / inputVector.length;
    const stdDev = Math.sqrt(variance + epsilon);
    const normalized = inputVector.map(x => (x - mean) / stdDev);
    return { mean, variance, stdDev, normalized };
  }, [inputVector, epsilon]);

  const steps: LayerNormStep[] = useMemo(() => {
      const generatedSteps: LayerNormStep[] = [{ type: 'start' }];
      inputVector.forEach((_, i) => generatedSteps.push({ type: 'highlight-for-mean', index: i }));
      generatedSteps.push({ type: 'calculate-mean', value: calculations.mean });
      inputVector.forEach((_, i) => generatedSteps.push({ type: 'highlight-for-variance', index: i }));
      generatedSteps.push({ type: 'calculate-variance', value: calculations.variance });
      inputVector.forEach((_, i) => generatedSteps.push({ type: 'apply-norm', index: i }));
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
    highlight: { borderColor: '#17a2b8', backgroundColor: 'rgba(23, 162, 184, 0.1)', transform: 'scale(1.1)' },
    connector: { fontSize: '2em', color: '#6c757d', margin: '5px 0', transition: 'opacity 0.3s ease' },
    scalarContainer: { display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' },
    scalar: { padding: '8px 15px', fontSize: '1.1em', fontWeight: 'bold', border: '1px solid #ced4da', borderRadius: '8px', backgroundColor: '#e9ecef', transition: 'all 0.3s ease' },
    controls: { display: 'flex', gap: '10px', marginTop: '10px' },
    button: { padding: '8px 16px', fontSize: '1em', cursor: 'pointer', border: '1px solid #6c757d', borderRadius: '4px', backgroundColor: '#fff' },
    playingButton: { backgroundColor: '#6c757d', color: '#fff' },
  };

  const descriptions: Record<string, string> = {
    start: '初始输入向量。点击 "Play" 开始计算。',
    'highlight-for-mean': `首先，计算向量所有元素的平均值。`,
    'calculate-mean': `平均值为 ${formatNumber(calculations.mean)}。`,
    'highlight-for-variance': `然后，计算方差 (variance)，衡量数据点的离散程度。`,
    'calculate-variance': `方差为 ${formatNumber(calculations.variance)}。`,
    'apply-norm': `最后，使用均值和标准差对每个元素进行归一化。公式: (x - μ) / √(σ² + ε)`,
    finish: '计算完成！输出向量的均值接近0，方差接近1。',
  };

  const getActiveDescription = () => {
      if (currentAnimState.type in descriptions) return descriptions[currentAnimState.type];
      return descriptions['start'];
  }

  const isMeanCalculated = currentStep >= steps.findIndex(s => s.type === 'calculate-mean');
  const isVarianceCalculated = currentStep >= steps.findIndex(s => s.type === 'calculate-variance');

  const renderVector = (vec: Vector, isOutput: boolean = false) => (
    <div style={styles.vector}>
      {vec.map((val, i) => {
        let isHighlighted = false;
        // [FIXED] Type-safe access to 'index' property
        if ((currentAnimState.type === 'highlight-for-mean' || currentAnimState.type === 'highlight-for-variance') && currentAnimState.index === i) {
            isHighlighted = true;
        }
        if (currentAnimState.type === 'apply-norm' && currentAnimState.index === i && isOutput) {
            isHighlighted = true;
        }

        const isVisible = !isOutput || currentStep >= steps.findIndex(s => s.type === 'apply-norm' && s.index === i);

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
        <h3 style={styles.title}>LayerNorm(x)</h3>
        <p style={styles.description}>{getActiveDescription()}</p>

        {renderVector(inputVector)}

        <div style={{...styles.connector, opacity: isMeanCalculated ? 1 : 0.2 }}>↓</div>

        <div style={styles.scalarContainer}>
          <div style={{ ...styles.scalar, ...(currentAnimState.type === 'calculate-mean' ? styles.highlight : {}), opacity: isMeanCalculated ? 1 : 0.2 }}>
            μ = {isMeanCalculated ? formatNumber(calculations.mean) : '?'}
          </div>
          <div style={{ ...styles.scalar, ...(currentAnimState.type === 'calculate-variance' ? styles.highlight : {}), opacity: isVarianceCalculated ? 1 : 0.2 }}>
            σ² = {isVarianceCalculated ? formatNumber(calculations.variance) : '?'}
          </div>
        </div>

        <div style={{...styles.connector, opacity: isVarianceCalculated ? 1 : 0.2 }}>↓</div>
        {renderVector(calculations.normalized, true)}
      </div>
      <div style={styles.controls}>
        <button onClick={play} style={{ ...styles.button, ...(isPlaying ? styles.playingButton : {}) }}>Play</button>
        <button onClick={pause} style={styles.button}>Pause</button>
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
// END OF FILE: src/components/visualizers/LayerNormVisualizer.tsx