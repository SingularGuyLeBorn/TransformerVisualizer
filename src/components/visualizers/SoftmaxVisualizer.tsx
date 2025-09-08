// FILE: src/components/visualizers/SoftmaxVisualizer.tsx
import React, { useMemo } from 'react';
import { Vector, SoftmaxStep } from './types';
import { formatNumber, useAnimationController } from './utils';
import { InlineMath } from 'react-katex';

interface SoftmaxVisualizerProps {
  inputVector: Vector;
  inputLabel?: string;
  outputLabel?: string;
}

export const SoftmaxVisualizer: React.FC<SoftmaxVisualizerProps> = ({ inputVector, inputLabel = "L", outputLabel = "P" }) => {

  const calculations = useMemo(() => {
    const finiteInputs = inputVector.filter(isFinite);
    const maxVal = finiteInputs.length > 0 ? Math.max(...finiteInputs) : 0;
    const shifted = inputVector.map(v => v - maxVal);
    const exps = shifted.map(v => isFinite(v) ? Math.exp(v) : 0);
    const sumExps = exps.reduce((a, b) => a + b, 0);
    const result = sumExps > 0 ? exps.map(v => v / sumExps) : exps.map(()=> 1 / exps.length);
    return { maxVal, shifted, exps, sumExps, result };
  }, [inputVector]);

  const steps: SoftmaxStep[] = useMemo(() => {
    const generatedSteps: SoftmaxStep[] = [{ type: 'start' }];
    generatedSteps.push({ type: 'highlight-max', value: calculations.maxVal });
    inputVector.forEach((_, i) => generatedSteps.push({ type: 'subtract-max', index: i }));
    inputVector.forEach((_, i) => generatedSteps.push({ type: 'exponentiate', index: i }));
    generatedSteps.push({ type: 'sum-exps', value: calculations.sumExps });
    inputVector.forEach((_, i) => generatedSteps.push({ type: 'normalize', index: i }));
    generatedSteps.push({ type: 'finish' });
    return generatedSteps;
  }, [inputVector, calculations]);

  const { currentStep, isPlaying, play, pause, reset, setStepManually } = useAnimationController(steps.length, 300);
  const currentAnimState = steps[currentStep] || { type: 'idle' };

  const styles: { [key: string]: React.CSSProperties } = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' },
    stepContainer: { width: '100%', padding: '15px', border: '1px solid #e9ecef', borderRadius: '8px', backgroundColor: '#fff', textAlign: 'center' },
    title: { margin: '0 0 10px 0', fontSize: '1.2em', fontWeight: 'bold' },
    description: { margin: '0 0 15px 0', color: '#6c757d', minHeight: '40px', fontSize: '0.9em' },
    vectorSection: { display: 'flex', width: '100%', gap: '15px', alignItems: 'center' },
    label: { fontWeight: 'bold', color: '#495057', fontSize: '1.2em', width: '100px', textAlign: 'right' },
    vectorGroup: { flex: 1, minWidth: 0 },
    vectorScroll: { overflowX: 'auto', padding: '5px' },
    vectorContainer: { display: 'flex', flexDirection: 'column', gap: '2px' },
    vector: { display: 'flex', gap: '5px', width: 'max-content' },
    vectorIndices: { display: 'flex', gap: '5px' },
    indexLabel: { width: '60px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#6c757d', fontSize: '0.8em', fontFamily: 'monospace', boxSizing: 'border-box' },
    element: { minWidth: '60px', padding: '5px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #ced4da', borderRadius: '4px', backgroundColor: '#fff', transition: 'all 0.3s ease' },
    highlight: { borderColor: '#4a90e2', backgroundColor: 'rgba(74, 144, 226, 0.1)', transform: 'scale(1.1)' },
    connector: { fontSize: '1.5em', color: '#6c757d', margin: '5px 0', transition: 'opacity 0.3s ease' },
    scalar: { padding: '8px 15px', fontSize: '1.1em', fontWeight: 'bold', border: '1px solid #ced4da', borderRadius: '8px', backgroundColor: '#e9ecef', transition: 'all 0.3s ease' },
    controls: { display: 'flex', gap: '10px', marginTop: '10px' },
    button: { padding: '8px 16px', fontSize: '1em', cursor: 'pointer', border: '1px solid #6c757d', borderRadius: '4px', backgroundColor: '#fff' },
    playingButton: { backgroundColor: '#6c757d', color: '#fff' },
  };

  const descriptions: Record<string, string> = {
    start: `初始输入向量 (Logits / ${inputLabel})。点击 "Play" 开始计算。`,
    'highlight-max': `1. 为保证数值稳定性, 计算最大值: max(${inputLabel}) = ${formatNumber(calculations.maxVal, 2)}。`,
    'subtract-max': `2. 从每个元素中减去最大值, 得到 L'。这可以防止计算指数时溢出。`,
    exponentiate: `3. 对 L' 中每个元素应用指数函数 e^x, 得到 E。`,
    'sum-exps': `4. 将 E 中所有元素相加, 得到归一化因子 ΣE = ${formatNumber(calculations.sumExps, 4)}。`,
    normalize: `5. 将 E 中每个元素除以总和 ΣE, 得到最终的概率分布 ${outputLabel}。`,
    finish: '计算完成！这是一个有效的概率分布, 所有元素之和为1。',
    idle: '准备开始Softmax计算。',
  };

  const getActiveDescription = () => {
    const key = currentAnimState.type as keyof typeof descriptions;
    return descriptions[key] || descriptions['start'];
  }

  const isShiftedVisible = (index: number) => currentStep >= steps.findIndex(s => s.type === 'subtract-max' && s.index === index);
  const isExpVisible = (index: number) => currentStep >= steps.findIndex(s => s.type === 'exponentiate' && s.index === index);
  const isSumVisible = currentStep >= steps.findIndex(s => s.type === 'sum-exps');
  const isResultVisible = (index: number) => currentStep >= steps.findIndex(s => s.type === 'normalize' && s.index === index);

  const renderVector = (vec: Vector, label: string | React.ReactNode, type: 'input' | 'shifted' | 'exp' | 'result') => (
    <div style={styles.vectorSection}>
        <div style={styles.label}>{typeof label === 'string' ? <InlineMath>{label}</InlineMath> : label}</div>
        <div style={styles.vectorGroup}>
            <div style={styles.vectorScroll}>
                <div style={styles.vectorContainer}>
                    <div style={styles.vector}>
                        {vec.map((val, i) => {
                            let isHighlighted = false;
                            let isVisible = true;
                            if (currentAnimState.type === 'subtract-max' && currentAnimState.index === i && (type === 'input' || type === 'shifted')) isHighlighted = true;
                            if (currentAnimState.type === 'exponentiate' && currentAnimState.index === i && (type === 'shifted' || type === 'exp')) isHighlighted = true;
                            if (currentAnimState.type === 'normalize' && currentAnimState.index === i && (type === 'exp' || type === 'result')) isHighlighted = true;

                            if (type === 'shifted') isVisible = isShiftedVisible(i);
                            if (type === 'exp') isVisible = isExpVisible(i);
                            if (type === 'result') isVisible = isResultVisible(i);

                            return (
                                <div key={`${type}-${i}`} style={{ ...styles.element, ...(isHighlighted ? styles.highlight : {}), opacity: isVisible ? 1 : 0.3 }}>
                                    {isVisible ? formatNumber(val, 2) : '?'}
                                </div>
                            );
                        })}
                    </div>
                    <div style={styles.vectorIndices}>
                        {vec.map((_, i) => <div key={i} style={styles.indexLabel}>{i}</div>)}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.stepContainer}>
        <h3 style={styles.title}>Softmax(x)</h3>
        <p style={styles.description}>{getActiveDescription()}</p>

        {renderVector(inputVector, inputLabel, 'input')}
        <div style={{...styles.connector, opacity: currentStep >= 1 ? 1 : 0.2 }}>↓ <InlineMath>{"- max(" + inputLabel + ") = -" + formatNumber(calculations.maxVal, 2)}</InlineMath></div>
        {renderVector(calculations.shifted, "L' = " + inputLabel + " - max(" + inputLabel + ")", 'shifted')}
        <div style={{...styles.connector, opacity: isShiftedVisible(inputVector.length - 1) ? 1 : 0.2 }}>↓ <InlineMath>e^x</InlineMath></div>
        {renderVector(calculations.exps, "E = e^{L'}", 'exp')}
        <div style={{...styles.connector, opacity: isExpVisible(inputVector.length - 1) ? 1 : 0.2 }}>↓ <InlineMath>\\sum</InlineMath></div>
        <div style={{...styles.scalar, ...(currentAnimState.type === 'sum-exps' ? styles.highlight : {}), opacity: isSumVisible ? 1 : 0.2 }}>
           <InlineMath>{"\\sum E ="}</InlineMath> {isSumVisible ? formatNumber(calculations.sumExps, 4) : '?'}
        </div>
        <div style={{...styles.connector, opacity: isSumVisible ? 1 : 0.2 }}>↓ Normalize</div>
        {renderVector(calculations.result, "P = E / \\sum E", 'result')}
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
// END OF FILE: src/components/visualizers/SoftmaxVisualizer.tsx