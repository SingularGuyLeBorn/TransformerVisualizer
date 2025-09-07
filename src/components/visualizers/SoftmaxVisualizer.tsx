// FILE: src/components/visualizers/SoftmaxVisualizer.tsx
import React, { useState, useMemo } from 'react';
import { Vector, ProcessingStep } from './types';
import { formatNumber } from './utils';

interface SoftmaxVisualizerProps {
  inputVector: Vector;
}

export const SoftmaxVisualizer: React.FC<SoftmaxVisualizerProps> = ({ inputVector }) => {
  const [step, setStep] = useState<ProcessingStep>('start');

  const calculations = useMemo(() => {
    const maxVal = Math.max(...inputVector);
    const shifted = inputVector.map(v => v - maxVal);
    const exps = shifted.map(v => Math.exp(v));
    const sumExps = exps.reduce((a, b) => a + b, 0);
    const result = exps.map(v => v / sumExps);
    return { maxVal, shifted, exps, sumExps, result };
  }, [inputVector]);

  const stepsOrder: ProcessingStep[] = ['start', 'subtract-max', 'exponentiate', 'sum-exps', 'normalize', 'done'];
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
    highlight: { borderColor: '#e63946', backgroundColor: 'rgba(230, 57, 70, 0.1)' },
    connector: { fontSize: '2em', color: '#6c757d', margin: '5px 0' },
    scalar: { padding: '8px 15px', fontSize: '1.1em', fontWeight: 'bold', border: '1px solid #ced4da', borderRadius: '8px', backgroundColor: '#e9ecef' },
    controls: { display: 'flex', gap: '10px', marginTop: '10px' },
    button: { padding: '8px 16px', fontSize: '1em', cursor: 'pointer', border: '1px solid #6c757d', borderRadius: '4px', backgroundColor: '#fff' },
  };

  const descriptions: Record<ProcessingStep, string> = {
    start: '初始输入向量 (Logits)。点击 "下一步" 开始计算。',
    'subtract-max': `为了数值稳定性，首先从每个元素中减去最大值 (${formatNumber(calculations.maxVal, 2)})。`,
    exponentiate: '对每个新元素应用指数函数 e^x。',
    'sum-exps': `将所有指数结果相加，得到归一化因子。`,
    normalize: `将每个指数结果除以总和，得到最终的概率分布。`,
    done: '计算完成！这是一个有效的概率分布，所有元素之和为1。',
    // [FIXED] Add unused keys to satisfy the Record type
    'calculate-mean': '', 'calculate-variance': '', 'apply-norm': '',
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
        <h3 style={styles.title}>Softmax(x)</h3>
        <p style={styles.description}>{descriptions[step]}</p>

        {/* Step 1: Input */}
        {renderVector(inputVector, currentStepIndex >= 0)}

        {/* Step 2: Subtract Max */}
        {currentStepIndex >= 1 && <div style={styles.connector}>↓</div>}
        {currentStepIndex >= 1 && renderVector(calculations.shifted, currentStepIndex === 1)}

        {/* Step 3: Exponentiate */}
        {currentStepIndex >= 2 && <div style={styles.connector}>↓</div>}
        {currentStepIndex >= 2 && renderVector(calculations.exps, currentStepIndex === 2)}

        {/* Step 4: Sum */}
        {currentStepIndex >= 3 && <div style={styles.connector}>↓</div>}
        {currentStepIndex >= 3 && <div style={{...styles.scalar, ...(currentStepIndex === 3 ? styles.highlight : {})}}>{formatNumber(calculations.sumExps)}</div>}

        {/* Step 5: Normalize */}
        {currentStepIndex >= 4 && <div style={styles.connector}>↓</div>}
        {currentStepIndex >= 4 && renderVector(calculations.result, currentStepIndex >= 4)}

      </div>
      <div style={styles.controls}>
        <button onClick={handlePrev} disabled={currentStepIndex <= 0} style={styles.button}>上一步</button>
        <button onClick={handleNext} disabled={currentStepIndex >= stepsOrder.length - 1} style={styles.button}>下一步</button>
        <button onClick={handleReset} style={styles.button}>重置</button>
      </div>
    </div>
  );
};
// END OF FILE: src/components/visualizers/SoftmaxVisualizer.tsx