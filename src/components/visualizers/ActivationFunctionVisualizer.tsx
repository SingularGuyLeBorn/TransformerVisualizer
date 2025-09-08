// FILE: src/components/visualizers/ActivationFunctionVisualizer.tsx
import React, { useMemo } from 'react';
import { Vector, ActivationFunctionType, ActivationStep } from './types';
import { formatNumber, useAnimationController } from './utils';
import { InlineMath } from 'react-katex';

interface ActivationFunctionVisualizerProps {
  inputVector: Vector;
  functionType: ActivationFunctionType;
  inputLabel?: string;
  outputLabel?: string;
}

export const ActivationFunctionVisualizer: React.FC<ActivationFunctionVisualizerProps> = ({ inputVector, functionType, inputLabel = "Input", outputLabel = "Output" }) => {

  const functions = {
    relu: (x: number) => Math.max(0, x),
    gelu: (x: number) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3)))),
    silu: (x: number) => x / (1 + Math.exp(-x)),
  };

  const outputVector = useMemo(() => inputVector.map(functions[functionType]), [inputVector, functionType]);

  const steps: ActivationStep[] = useMemo(() => {
    const generatedSteps: ActivationStep[] = [{ type: 'start' }];
    inputVector.forEach((_, i) => {
        generatedSteps.push({ type: 'process', index: i });
    });
    generatedSteps.push({ type: 'finish' });
    return generatedSteps;
  }, [inputVector]);

  const { currentStep, isPlaying, play, pause, reset, setStepManually } = useAnimationController(steps.length, 600);
  const currentAnimState = steps[currentStep] || { type: 'idle' };
  const activeIndex = (currentAnimState.type === 'process') ? (currentAnimState as any).index : (currentAnimState.type === 'finish' ? inputVector.length - 1 : -1);
  const lastCalculatedIndex = (currentAnimState.type === 'finish') ? inputVector.length - 1 : activeIndex;


  const styles: { [key: string]: React.CSSProperties } = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' },
    title: { margin: '0 0 10px 0', fontSize: '1.2em', fontWeight: 'bold', textTransform: 'uppercase' },
    mainArea: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' },
    vectorSection: { display: 'flex', width: '100%', gap: '15px', alignItems: 'center' },
    label: { fontWeight: 'bold', color: '#495057', fontSize: '1.5em', width: '80px', textAlign: 'right' },
    vectorGroup: { flex: 1, minWidth: 0 },
    vectorScroll: { overflowX: 'auto', padding: '5px' },
    vectorContainer: { display: 'flex', flexDirection: 'column', gap: '2px' },
    vector: { display: 'flex', gap: '5px', width: 'max-content' },
    vectorIndices: { display: 'flex', gap: '5px', paddingLeft: '2px' },
    indexLabel: { width: '60px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#6c757d', fontSize: '0.8em', fontFamily: 'monospace' },
    element: { width: '60px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #ced4da', borderRadius: '4px', backgroundColor: '#fff', transition: 'all 0.3s ease' },
    highlight: { transform: 'scale(1.15)', borderColor: '#e63946', backgroundColor: 'rgba(230, 57, 70, 0.1)' },
    calculationBox: { height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', border: '1px solid #dee2e6', borderRadius: '8px', padding: '10px 20px', fontSize: '1.2em', transition: 'opacity 0.3s', fontFamily: 'monospace' },
    controls: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' },
    button: { padding: '8px 16px', fontSize: '1em', cursor: 'pointer', border: '1px solid #6c757d', borderRadius: '4px', backgroundColor: '#fff' },
    playingButton: { backgroundColor: '#6c757d', color: '#fff' },
  };

  const activeInput = activeIndex > -1 ? inputVector[activeIndex] : null;
  const activeOutput = activeIndex > -1 ? outputVector[activeIndex] : null;
  const calculationString = activeInput !== null && activeOutput !== null
    ? `max(0, ${formatNumber(activeInput, 2)}) = ${formatNumber(activeOutput, 2)}`
    : '...';

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>{functionType} Activation</h3>
      <div style={styles.mainArea}>
        {/* Input Vector */}
        <div style={styles.vectorSection}>
          <div style={styles.label}><InlineMath>{inputLabel}</InlineMath></div>
          <div style={styles.vectorGroup}>
            <div style={styles.vectorScroll}>
              <div style={styles.vectorContainer}>
                <div style={styles.vector}>
                  {inputVector.map((val, i) => (
                    <div key={`in-${i}`} style={{ ...styles.element, ...(activeIndex === i ? styles.highlight : {}) }}>
                      {formatNumber(val, 2)}
                    </div>
                  ))}
                </div>
                <div style={styles.vectorIndices}>
                   {inputVector.map((_, i) => <div key={i} style={styles.indexLabel}>{i}</div>)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Box */}
        <div style={{ ...styles.calculationBox, opacity: activeIndex > -1 ? 1 : 0.2 }}>
            {calculationString}
        </div>

        {/* Output Vector */}
        <div style={styles.vectorSection}>
          <div style={styles.label}><InlineMath>{outputLabel}</InlineMath></div>
          <div style={styles.vectorGroup}>
            <div style={styles.vectorScroll}>
              <div style={styles.vectorContainer}>
                <div style={styles.vector}>
                  {outputVector.map((val, i) => (
                    <div key={`out-${i}`} style={{ ...styles.element, ...(activeIndex === i ? styles.highlight : {}), opacity: i > lastCalculatedIndex ? 0.3 : 1 }}>
                      {i > lastCalculatedIndex ? '?' : formatNumber(val, 2)}
                    </div>
                  ))}
                </div>
                <div style={styles.vectorIndices}>
                  {outputVector.map((_, i) => <div key={i} style={styles.indexLabel}>{i}</div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
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
// END OF FILE: src/components/visualizers/ActivationFunctionVisualizer.tsx