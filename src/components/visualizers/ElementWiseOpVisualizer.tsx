// FILE: src/components/visualizers/ElementWiseOpVisualizer.tsx
import React, { useMemo, useRef, useEffect, useState } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsARef = useRef<(HTMLDivElement | null)[]>([]);
  const elementsBRef = useRef<(HTMLDivElement | null)[]>([]);

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
      ? numCols - 1
      : (currentAnimState.type === 'calculate' ? (currentAnimState as any).col : activeCol - 1);

  const [opPosition, setOpPosition] = useState<{ top: number, left: number } | null>(null);

  useEffect(() => {
    if (activeCol !== -1 && containerRef.current && elementsARef.current[activeCol] && elementsBRef.current[activeCol]) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const elARect = elementsARef.current[activeCol]!.getBoundingClientRect();
      const elBRect = elementsBRef.current[activeCol]!.getBoundingClientRect();

      const top = (elARect.bottom - containerRect.top + (elBRect.top - elARect.bottom) / 2);
      const left = (elARect.left - containerRect.left + elARect.width / 2);

      setOpPosition({ top, left });
    }
  }, [activeCol]);

  const styles: { [key: string]: React.CSSProperties } = {
    container: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '15px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6', width: '100%', boxSizing: 'border-box' },
    row: { display: 'flex', alignItems: 'center', gap: '15px', width: '100%' },
    label: { fontWeight: 'bold', color: '#495057', fontSize: '1.5em', width: '60px', textAlign: 'right' },
    vectorGroup: { flex: 1, minWidth: 0 },
    vectorScroll: { overflowX: 'auto', padding: '10px 5px' },
    vector: { display: 'flex', flexDirection: 'column', gap: '5px', width: 'max-content' },
    vectorElements: { display: 'flex', gap: '5px' },
    vectorIndices: { display: 'flex', gap: '5px' },
    indexLabel: { width: '60px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#6c757d', fontSize: '0.8em', fontFamily: 'monospace', boxSizing: 'border-box' },
    element: { width: '60px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #ced4da', borderRadius: '4px', backgroundColor: '#fff', transition: 'all 0.3s ease', boxSizing: 'border-box' },
    sourceHighlight: { transform: 'scale(1.15)', borderColor: '#4a90e2', backgroundColor: 'rgba(74, 144, 226, 0.1)', fontWeight: 'bold' },
    resultHighlight: { transform: 'scale(1.15)', borderColor: '#28a745', backgroundColor: 'rgba(40, 167, 69, 0.1)', fontWeight: 'bold' },
    opSymbol: { position: 'absolute', fontSize: '2em', fontWeight: 'bold', color: '#e63946', opacity: 0, transition: 'opacity 0.3s ease, transform 0.3s ease', transform: 'translate(-50%, -50%) scale(0.8)', pointerEvents: 'none' },
    opVisible: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
    controls: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' },
    button: { padding: '8px 16px', fontSize: '1em', cursor: 'pointer', border: '1px solid #6c757d', borderRadius: '4px', backgroundColor: '#fff' },
    playingButton: { backgroundColor: '#6c757d', color: '#fff' },
    equalSignRow: { display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: '80px', height: '30px' },
    equalSign: { fontSize: '2em', fontWeight: 'bold', color: '#6c757d' },
  };

  const renderVector = (vec: number[], label: string, isResult: boolean = false, refs?: React.MutableRefObject<(HTMLDivElement | null)[]>) => (
      <div style={styles.row}>
          <div style={styles.label}><InlineMath>{label}</InlineMath></div>
          <div style={styles.vectorGroup}>
              <div style={styles.vectorScroll}>
                  <div style={styles.vector}>
                      <div style={styles.vectorElements}>
                          {vec.map((val, i) => (
                              <div
                                key={i}
                                ref={refs ? el => refs.current[i] = el : undefined}
                                style={{
                                    ...styles.element,
                                    ...(activeCol === i ? (isResult ? styles.resultHighlight : styles.sourceHighlight) : {}),
                                    opacity: (isResult && i > lastCalculatedIndex && currentStep > 0) ? 0.3 : 1
                                }}
                              >
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
    <div style={styles.container} ref={containerRef}>
      {renderVector(vectorA, labelA, false, elementsARef)}
      {renderVector(vectorB, labelB, false, elementsBRef)}
      {opPosition && (
          <div style={{
              ...styles.opSymbol,
              top: opPosition.top,
              left: opPosition.left,
              ...(currentAnimState.type === 'show-op' ? styles.opVisible : {})
          }}>
              {operation}
          </div>
      )}
      <div style={styles.equalSignRow}>
          <div style={styles.equalSign}>=</div>
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