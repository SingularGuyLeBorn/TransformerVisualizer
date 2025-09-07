// FILE: src/components/visualizers/LayerNormVisualizer.tsx
import React, { useState, useMemo } from 'react';
import { Vector, ProcessingStep } from './types';
import { formatNumber } from './utils';

interface LayerNormVisualizerProps {
  inputVector: Vector;
  epsilon?: number;
}

export const LayerNormVisualizer: React.FC<LayerNormVisualizerProps> = ({ inputVector, epsilon = 1e-5 }) => {
  const [step, setStep] = useState<ProcessingStep>('start');

  const calculations = useMemo(() => {
    const mean = inputVector.reduce((a, b) => a + b, 0) / inputVector.length;
    const variance = inputVector.map(x => (x - mean) ** 2).reduce((a, b) => a + b, 0) / inputVector.length;
    const stdDev = Math.sqrt(variance + epsilon);
    const normalized = inputVector.map(x => (x - mean) / stdDev);
    return { mean, variance, stdDev, normalized };
  }, [inputVector, epsilon]);

  const stepsOrder: ProcessingStep[] = ['start', 'calculate-mean', 'calculate-variance', 'apply-norm', 'done'];
  const currentStepIndex = stepsOrder.indexOf(step);

  const handleNext = () => setStep(stepsOrder[Math.min(stepsOrder.length - 1, currentStepIndex + 1)]);
  const handlePrev = () => setStep(stepsOrder[Math.max(0, currentStepIndex - 1)]);
  const handleReset = () => setStep('start');

  // Inline Styles (reusing some from SoftmaxVisualizer for consistency)
  const styles: { [key: string]: React.CSSProperties } = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' },
    stepContainer: { width: '100%', padding: '15px', border: '1px solid #e9ecef', borderRadius: '8px', backgroundColor: '#fff', textAlign: 'center' },
    title: { margin: '0 0 10px 0', fontSize: '1.2em', fontWeight: 'bold' },
    description: { margin: '0 0 15px 0', color: '#6c757d', minHeight: '40px' },
    vector: { display: 'flex', justifyContent: 'center', gap: '5px', flexWrap: 'wrap' },
    element: { minWidth: '60px', padding: '5px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #ced4da', borderRadius: '4px', backgroundColor: '#fff', transition: 'all 0.3s ease' },
    highlight: { borderColor: '#17a2b8', backgroundColor: 'rgba(23, 162, 184, 0.1)' },
    connector: { fontSize: '2em', color: '#6c757d', margin: '5px 0' },
    scalarContainer: { display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' },
    scalar: { padding: '8px 15px', fontSize: '1.1em', fontWeight: 'bold', border: '1px solid #ced4da', borderRadius: '8px', backgroundColor: '#e9ecef' },
    controls: { display: 'flex', gap: '10px', marginTop: '10px' },
    button: { padding: '8px 16px', fontSize: '1em', cursor: 'pointer', border: '1px solid #6c757d', borderRadius: '4px', backgroundColor: '#fff' },
  };

  const descriptions: Record<ProcessingStep, string> = {
    start: '初始输入向量。点击 "下一步" 开始计算。',
    'calculate-mean': `首先，计算向量所有元素的平均值。`,
    'calculate-variance': `然后，计算方差 (variance)，衡量数据点的离散程度。`,
    'apply-norm': `最后，使用均值和标准差对每个元素进行归一化。公式: (x - μ) / √(σ² + ε)`,
    done: '计算完成！输出向量的均值接近0，方差接近1。',
    // [FIXED] Add unused keys to satisfy the Record type
    'subtract-max': '', 'exponentiate': '', 'sum-exps': '', 'normalize': '',
    'calculate-squared-sum': '', 'calculate-rms': '', 'apply-rms-norm': ''
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
        <h3 style={styles.title}>LayerNorm(x)</h3>
        <p style={styles.description}>{descriptions[step]}</p>

        {renderVector(inputVector, currentStepIndex >= 0)}

        {currentStepIndex >= 1 && <div style={styles.connector}>↓</div>}

        {currentStepIndex >= 1 && (
          <div style={styles.scalarContainer}>
            <div style={{ ...styles.scalar, ...(currentStepIndex === 1 ? styles.highlight : {}) }}>
              μ = {formatNumber(calculations.mean)}
            </div>
            {currentStepIndex >= 2 && (
              <div style={{ ...styles.scalar, ...(currentStepIndex === 2 ? styles.highlight : {}) }}>
                σ² = {formatNumber(calculations.variance)}
              </div>
            )}
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

// END OF FILE: src/components/visualizers/LayerNormVisualizer.tsx