// FILE: src/components/visualizers/RMSNormVisualizer.tsx
import React, { useState, useMemo } from 'react';
import { Vector, ProcessingStep } from './types';
import { formatNumber } from './utils';

interface RMSNormVisualizerProps {
  inputVector: Vector;
  epsilon?: number;
}

export const RMSNormVisualizer: React.FC<RMSNormVisualizerProps> = ({ inputVector, epsilon = 1e-5 }) => {
  const [step, setStep] = useState<ProcessingStep>('start');

  const calculations = useMemo(() => {
    const n = inputVector.length;
    const squaredSum = inputVector.map(x => x * x).reduce((a, b) => a + b, 0);
    const meanSquare = squaredSum / n;
    const rms = Math.sqrt(meanSquare + epsilon);
    const normalized = inputVector.map(x => x / rms);
    return { squaredSum, rms, normalized };
  }, [inputVector, epsilon]);

  const stepsOrder: ProcessingStep[] = ['start', 'calculate-squared-sum', 'calculate-rms', 'apply-rms-norm', 'done'];
  const currentStepIndex = stepsOrder.indexOf(step);

  const handleNext = () => setStep(stepsOrder[Math.min(stepsOrder.length - 1, currentStepIndex + 1)]);
  const handlePrev = () => setStep(stepsOrder[Math.max(0, currentStepIndex - 1)]);
  const handleReset = () => setStep('start');

  // Inline Styles
  const styles: { [key: string]: React.CSSProperties } = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' },
    stepContainer: { width: '100%', padding: '15px', border: '1px solid #e9ecef', borderRadius: '8px', backgroundColor: '#fff', textAlign: 'center' },
    title: { margin: '0 0 10px 0', fontSize: '1.2em', fontWeight: 'bold' },
    description: { margin: '0 0 15px 0', color: '#6c757d', minHeight: '40px' },
    vector: { display: 'flex', justifyContent: 'center', gap: '5px', flexWrap: 'wrap' },
    element: { minWidth: '60px', padding: '5px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #ced4da', borderRadius: '4px', backgroundColor: '#fff', transition: 'all 0.3s ease' },
    highlight: { borderColor: '#fd7e14', backgroundColor: 'rgba(253, 126, 20, 0.1)' },
    connector: { fontSize: '2em', color: '#6c757d', margin: '5px 0' },
    scalar: { padding: '8px 15px', fontSize: '1.1em', fontWeight: 'bold', border: '1px solid #ced4da', borderRadius: '8px', backgroundColor: '#e9ecef' },
    controls: { display: 'flex', gap: '10px', marginTop: '10px' },
    button: { padding: '8px 16px', fontSize: '1em', cursor: 'pointer', border: '1px solid #6c757d', borderRadius: '4px', backgroundColor: '#fff' },
  };

  const descriptions: Record<ProcessingStep, string> = {
    start: '初始输入向量。RMSNorm 是一种简化的 LayerNorm。',
    'calculate-squared-sum': `首先，计算向量所有元素的平方和。`,
    'calculate-rms': `然后，计算均方根 (Root Mean Square)。公式: √ (Σ(x²) / n + ε)`,
    'apply-rms-norm': `最后，将每个原始元素除以 RMS 值进行归一化。公式: x / RMS(x)`,
    done: '计算完成！(注意：这里省略了可学习的 gamma 缩放步骤)',
    'subtract-max': '', 'exponentiate': '', 'sum-exps': '', 'normalize': '', 'calculate-mean': '', 'calculate-variance': '', 'apply-norm': ''
  };

  const renderVector = (vec: Vector, isHighlighted: boolean = false) => (
    <div style={styles.vector}>
      {vec.map((val, i) => (
        <div key={i} style={{ ...styles.element, ...(isHighlighted ? styles.highlight : {}) }}>
          {formatNumber(val)}
        </div>
      ))}
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.stepContainer}>
        <h3 style={styles.title}>RMSNorm(x)</h3>
        <p style={styles.description}>{descriptions[step]}</p>

        {renderVector(inputVector, currentStepIndex >= 0)}

        {currentStepIndex >= 1 && <div style={styles.connector}>↓</div>}

        {currentStepIndex >= 1 && (
            <div style={{ ...styles.scalar, ...(currentStepIndex === 1 ? styles.highlight : {}) }}>
              Σ(x²) = {formatNumber(calculations.squaredSum)}
            </div>
        )}

        {currentStepIndex >= 2 && <div style={styles.connector}>↓</div>}

        {currentStepIndex >= 2 && (
            <div style={{ ...styles.scalar, ...(currentStepIndex === 2 ? styles.highlight : {}) }}>
              RMS = {formatNumber(calculations.rms)}
            </div>
        )}

        {currentStepIndex >= 3 && <div style={styles.connector}>↓</div>}
        {currentStepIndex >= 3 && renderVector(calculations.normalized, currentStepIndex >= 3)}
      </div>
      <div style={styles.controls}>
        <button onClick={handlePrev} disabled={currentStepIndex <= 0} style={styles.button}>上一步</button>
        <button onClick={handleNext} disabled={currentStepIndex >= stepsOrder.length - 1} style={styles.button}>下一步</button>
        <button onClick={handleReset} style={styles.button}>重置</button>
      </div>
    </div>
  );
};

// END OF FILE: src/components/visualizers/RMSNormVisualizer.tsx