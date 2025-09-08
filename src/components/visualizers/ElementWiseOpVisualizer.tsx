// FILE: src/components/visualizers/ElementWiseOpVisualizer.tsx
import React, { useMemo } from 'react';
import { Matrix, ElementWiseOpStep } from './types';
import { formatNumber, useAnimationController } from './utils';
import { InlineMath } from 'react-katex';

interface ElementWiseOpVisualizerProps {
  matrixA: Matrix;
  matrixB: Matrix;
  operation: '+' | '-' | '×' | '÷';
  labelA?: string;
  labelB?: string;
  labelC?: string;
}

export const ElementWiseOpVisualizer: React.FC<ElementWiseOpVisualizerProps> = ({ matrixA, matrixB, operation, labelA = 'A', labelB = 'B', labelC = 'C' }) => {

  const vectorA = matrixA[0];
  const vectorB = matrixB[0];

  const resultVector = useMemo(() => vectorA.map((val, c) => {
      switch (operation) {
        case '+': return val + vectorB[c];
        case '-': return val - vectorB[c];
        case '×': return val * vectorB[c];
        case '÷': return val / vectorB[c];
        default: return NaN;
      }
    }), [vectorA, vectorB, operation]);

  const numCols = vectorA.length;

  const steps: ElementWiseOpStep[] = useMemo(() => {
    const generatedSteps: ElementWiseOpStep[] = [{ type: 'start' }];
    for (let c = 0; c < numCols; c++) {
      generatedSteps.push({ type: 'highlight', row: 0, col: c });
      generatedSteps.push({ type: 'show-op', row: 0, col: c });
      generatedSteps.push({ type: 'calculate', row: 0, col: c });
    }
    generatedSteps.push({ type: 'finish' });
    return generatedSteps;
  }, [numCols]);

  const { currentStep, isPlaying, play, pause, reset, setStepManually } = useAnimationController(steps.length, 600);
  const currentAnimState = steps[currentStep] || { type: 'idle' };
  const activeCol = (currentAnimState.type === 'highlight' || currentAnimState.type === 'calculate' || currentAnimState.type === 'show-op')
      ? (currentAnimState as any).col
      : -1;
  const lastCalculatedIndex = (currentAnimState.type === 'finish')
      ? numCols -1
      : (currentAnimState.type === 'calculate' ? (currentAnimState as any).col : activeCol -1);


  const styles: { [key: string]: React.CSSProperties } = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '15px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6', width: '100%', boxSizing: 'border-box' },
    row: { display: 'flex', alignItems: 'center', gap: '15px', width: '100%' },
    label: { fontWeight: 'bold', color: '#495057', fontSize: '1.5em', width: '60px', textAlign: 'right' },
    vectorGroup: { flex: 1, minWidth: 0 },
    vectorScroll: { overflowX: 'auto', padding: '10px 5px' },
    vector: { display: 'flex', flexDirection: 'column', gap: '5px', width: 'max-content' },
    vectorElements: { display: 'flex', gap: '5px' },
    vectorIndices: { display: 'flex', gap: '5px', paddingLeft: '2px' },
    indexLabel: { width: '60px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#6c757d', fontSize: '0.8em', fontFamily: 'monospace' },
    element: { width: '60px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #ced4da', borderRadius: '4px', backgroundColor: '#fff', transition: 'all 0.3s ease' },
    highlight: { transform: 'scale(1.15)', borderColor: '#e63946', backgroundColor: 'rgba(230, 57, 70, 0.1)', fontWeight: 'bold' },
    opRow: { display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: '80px', height: '40px' },
    opSymbol: { fontSize: '2em', fontWeight: 'bold', color: '#e63946', opacity: 0, transition: 'opacity 0.3s ease', transform: 'scale(0.8)' },
    opVisible: { opacity: 1, transform: 'scale(1)' },
    controls: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' },
    button: { padding: '8px 16px', fontSize: '1em', cursor: 'pointer', border: '1px solid #6c757d', borderRadius: '4px', backgroundColor: '#fff' },
    playingButton: { backgroundColor: '#6c757d', color: '#fff' },
  };

  const renderVector = (vec: number[], label: string, isResult: boolean = false) => (
      <div style={styles.row}>
          <div style={styles.label}><InlineMath>{label}</InlineMath></div>
          <div style={styles.vectorGroup}>
              <div style={styles.vectorScroll}>
                  <div style={styles.vector}>
                      <div style={styles.vectorElements}>
                          {vec.map((val, i) => (
                              <div key={i} style={{ ...styles.element, ...(activeCol === i ? styles.highlight : {}), opacity: (isResult && i > lastCalculatedIndex && currentStep > 0) ? 0.3 : 1 }}>
                                  {(isResult && i > lastCalculatedIndex && currentStep > 0) ? '?' : formatNumber(val, 2)}
                              </div>
                          ))}
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
      {renderVector(vectorA, labelA)}
      <div style={styles.opRow}>
         <div style={{...styles.opSymbol, ...(currentAnimState.type === 'show-op' ? styles.opVisible : {})}}>{operation}</div>
      </div>
      {renderVector(vectorB, labelB)}
      <div style={styles.opRow}>
          <div style={{...styles.opSymbol, ...styles.opVisible}}>=</div>
      </div>
      {renderVector(resultVector, labelC, true)}

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
        style={{width: '80%', cursor: 'pointer', marginTop: '15px'}}
      />
    </div>
  );
};
// END OF FILE: src/components/visualizers/ElementWiseOpVisualizer.tsx