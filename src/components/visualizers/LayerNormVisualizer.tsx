// FILE: src/components/visualizers/LayerNormVisualizer.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { Vector, LayerNormStep } from './types';
import { formatNumber, useAnimationController } from './utils';
import { InlineMath } from 'react-katex';

interface LayerNormVisualizerProps {
  inputVector: Vector;
  epsilon?: number;
  inputLabel?: string;
  outputLabel?: string;
}

export const LayerNormVisualizer: React.FC<LayerNormVisualizerProps> = ({ inputVector, epsilon = 1e-5, inputLabel = "Input", outputLabel = "Output" }) => {
  const [calculationString, setCalculationString] = useState<string>('');
  const [meanFormula, setMeanFormula] = useState<string>('');
  const [varianceFormula, setVarianceFormula] = useState<string>('');

  const calculations = useMemo(() => {
    const mean = inputVector.reduce((a, b) => a + b, 0) / inputVector.length;
    const variance = inputVector.map(x => (x - mean) ** 2).reduce((a, b) => a + b, 0) / inputVector.length;
    const stdDev = Math.sqrt(variance + epsilon);
    const normalized = inputVector.map(x => (x - mean) / stdDev);
    return { mean, variance, stdDev, normalized };
  }, [inputVector, epsilon]);

  const steps: LayerNormStep[] = useMemo(() => {
      const generatedSteps: LayerNormStep[] = [{ type: 'start' }];
      let currentSum = 0;
      inputVector.forEach((val, i) => {
          currentSum += val;
          generatedSteps.push({ type: 'accumulate-mean', index: i, sum: currentSum });
      });
      generatedSteps.push({ type: 'calculate-mean', value: calculations.mean });

      let currentVarSum = 0;
      inputVector.forEach((val, i) => {
          const term = (val - calculations.mean) ** 2;
          currentVarSum += term;
          generatedSteps.push({ type: 'accumulate-variance', index: i, sum: currentVarSum });
      });
      generatedSteps.push({ type: 'calculate-variance', value: calculations.variance });

      inputVector.forEach((_, i) => {
          generatedSteps.push({ type: 'show-norm-formula', index: i });
          generatedSteps.push({ type: 'apply-norm', index: i });
      });
      generatedSteps.push({ type: 'finish' });
      return generatedSteps;
  }, [inputVector, calculations]);

  const { currentStep, isPlaying, play, pause, reset, setStepManually } = useAnimationController(steps.length, 300);
  const currentAnimState = steps[currentStep] || { type: 'idle' };

  useEffect(() => {
    let newCalcString = '';
    const state = currentAnimState;
    if (state.type === 'accumulate-mean' || state.type === 'calculate-mean') {
        const history = inputVector.slice(0, (state as any).index + 1);
        const sumStr = history.map(v => formatNumber(v, 2)).join(' + ');
        const currentSum = history.reduce((a,b)=>a+b, 0);
        setMeanFormula(`μ = (${sumStr}) / ${inputVector.length} = ${formatNumber(currentSum / inputVector.length, 4)}`);
        setVarianceFormula('');
    } else if (state.type === 'accumulate-variance' || state.type === 'calculate-variance') {
        const history = inputVector.slice(0, (state as any).index + 1).map(v => (v - calculations.mean) ** 2);
        const sumStr = history.map(v => formatNumber(v, 2)).join(' + ');
        const currentSum = history.reduce((a,b)=>a+b, 0);
        setVarianceFormula(`σ² = (${sumStr}) / ${inputVector.length} = ${formatNumber(currentSum / inputVector.length, 4)}`);
    }

    if (state.type === 'show-norm-formula' || state.type === 'apply-norm') {
        const x = inputVector[state.index];
        const res = calculations.normalized[state.index];
        newCalcString = `(${formatNumber(x,2)} - ${formatNumber(calculations.mean,2)}) / √(${formatNumber(calculations.variance,2)} + ε) = ${formatNumber(res, 4)}`;
    } else {
        newCalcString = '';
    }
    setCalculationString(newCalcString);
  }, [currentAnimState, calculations, inputVector]);

  useEffect(() => {
      if(currentStep === -1) {
          setMeanFormula('');
          setVarianceFormula('');
      }
  }, [currentStep]);


  const styles: { [key: string]: React.CSSProperties } = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' },
    stepContainer: { width: '100%', padding: '15px', border: '1px solid #e9ecef', borderRadius: '8px', backgroundColor: '#fff', textAlign: 'center' },
    title: { margin: '0 0 10px 0', fontSize: '1.2em', fontWeight: 'bold' },
    description: { margin: '0 0 15px 0', color: '#6c757d', minHeight: '40px' },
    calculationBox: { minHeight: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e9ecef', border: '1px solid #dee2e6', borderRadius: '8px', padding: '8px 15px', fontSize: '1em', transition: 'opacity 0.3s', fontFamily: 'monospace', margin: '5px 0', overflowX: 'auto', whiteSpace: 'nowrap' },
    vectorSection: { display: 'flex', width: '100%', gap: '15px', alignItems: 'center' },
    label: { fontWeight: 'bold', color: '#495057', fontSize: '1.2em', width: '100px', textAlign: 'right' },
    vectorGroup: { flex: 1, minWidth: 0 },
    vectorScroll: { overflowX: 'auto', padding: '5px' },
    vectorContainer: { display: 'flex', flexDirection: 'column', gap: '2px' },
    vector: { display: 'flex', gap: '5px', width: 'max-content' },
    vectorIndices: { display: 'flex', gap: '5px' },
    indexLabel: { width: '60px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#6c757d', fontSize: '0.8em', fontFamily: 'monospace', boxSizing: 'border-box' },
    element: { minWidth: '60px', padding: '5px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #ced4da', borderRadius: '4px', backgroundColor: '#fff', transition: 'all 0.3s ease' },
    highlightMean: { borderColor: '#4a90e2', backgroundColor: 'rgba(74, 144, 226, 0.1)', transform: 'scale(1.1)' },
    highlightVariance: { borderColor: '#f5a623', backgroundColor: 'rgba(245, 166, 35, 0.1)', transform: 'scale(1.1)' },
    highlightNorm: { borderColor: '#28a745', backgroundColor: 'rgba(40, 167, 69, 0.1)', transform: 'scale(1.1)' },
    connector: { fontSize: '2em', color: '#6c757d', margin: '5px 0', transition: 'opacity 0.3s ease' },
    controls: { display: 'flex', gap: '10px', marginTop: '10px' },
    button: { padding: '8px 16px', fontSize: '1em', cursor: 'pointer', border: '1px solid #6c757d', borderRadius: '4px', backgroundColor: '#fff' },
    playingButton: { backgroundColor: '#6c757d', color: '#fff' },
  };

  const descriptions: Record<string, string> = {
    start: '初始输入向量。点击 "Play" 开始计算。',
    'accumulate-mean': '1. 计算均值(μ): 将所有元素累加求和,然后除以元素数量。',
    'calculate-mean': `1. 均值(μ)计算完成，值为 ${formatNumber(calculations.mean)}。`,
    'accumulate-variance': '2. 计算方差(σ²): 将每个元素与均值的差的平方累加,然后求平均。',
    'calculate-variance': `2. 方差(σ²)计算完成，值为 ${formatNumber(calculations.variance)}。`,
    'show-norm-formula': '3. 归一化: 使用均值和标准差对每个元素进行归一化。',
    'apply-norm': '3. 归一化: 使用均值和标准差对每个元素进行归一化。',
    finish: '计算完成！输出向量的均值接近0，方差接近1。',
    idle: '准备开始LayerNorm计算。',
  };

  const getActiveDescription = () => {
    const key = currentAnimState.type as keyof typeof descriptions;
    return descriptions[key] || descriptions['start'];
  };

  const isMeanCalculated = currentStep >= steps.findIndex(s => s.type === 'calculate-mean');
  const isVarianceCalculated = currentStep >= steps.findIndex(s => s.type === 'calculate-variance');

  const renderVector = (vec: Vector, label: string, isOutput: boolean = false) => (
    <div style={styles.vectorSection}>
      <div style={styles.label}><InlineMath>{label}</InlineMath></div>
      <div style={styles.vectorGroup}>
        <div style={styles.vectorScroll}>
          <div style={styles.vectorContainer}>
            <div style={styles.vector}>
              {vec.map((val, i) => {
                let highlightStyle = {};
                if ((currentAnimState.type === 'accumulate-mean') && currentAnimState.index === i) highlightStyle = styles.highlightMean;
                if ((currentAnimState.type === 'accumulate-variance') && currentAnimState.index === i) highlightStyle = styles.highlightVariance;
                if ((currentAnimState.type === 'apply-norm' || currentAnimState.type === 'show-norm-formula') && currentAnimState.index === i && !isOutput) highlightStyle = styles.highlightMean;
                if ((currentAnimState.type === 'apply-norm' || currentAnimState.type === 'show-norm-formula') && currentAnimState.index === i && isOutput) highlightStyle = styles.highlightNorm;

                const isVisible = !isOutput || currentStep >= steps.findIndex(s => s.type === 'apply-norm' && s.index === i);

                return (
                  <div key={i} style={{ ...styles.element, ...highlightStyle, opacity: isVisible ? 1 : 0.3 }}>
                    {isVisible ? formatNumber(val) : '?'}
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
        <h3 style={styles.title}>LayerNorm(x)</h3>
        <p style={styles.description}>{getActiveDescription()}</p>

        {renderVector(inputVector, inputLabel)}

        <div style={{...styles.connector, opacity: currentStep > 0 ? 1 : 0.2 }}>↓</div>
        <div style={{...styles.calculationBox, opacity: meanFormula ? 1 : 0, borderColor: isMeanCalculated ? '#28a745' : '#dee2e6'}}>{meanFormula || 'μ = ?'}</div>
        <div style={{...styles.calculationBox, opacity: isMeanCalculated ? 1 : 0, borderColor: isVarianceCalculated ? '#28a745' : '#dee2e6'}}>{varianceFormula || 'σ² = ?'}</div>
        <div style={{...styles.calculationBox, opacity: calculationString ? 1 : 0}}>{calculationString || '...'}</div>
        <div style={{...styles.connector, opacity: isVarianceCalculated ? 1 : 0.2 }}>↓</div>
        {renderVector(calculations.normalized, outputLabel, true)}
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