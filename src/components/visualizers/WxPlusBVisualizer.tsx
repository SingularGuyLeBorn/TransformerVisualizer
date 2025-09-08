// FILE: src/components/visualizers/WxPlusBVisualizer.tsx
import React, { useMemo } from 'react';
import { Vector, SymbolInfo, WxPlusBStep, MatMulStep } from './types';
import { useAnimationController, formatNumber } from './utils';
import { InlineMath } from 'react-katex';
import { InteractiveMatMulVisualizer } from './InteractiveMatMulVisualizer';

interface WxPlusBVisualizerProps {
  sourceVectorsA: { data: Vector, symbolInfo: SymbolInfo }[];
  sourceVectorB: { data: Vector, symbolInfo: SymbolInfo };
  biasVector: { data: Vector, symbolInfo: SymbolInfo };
  resultSymbolInfo: SymbolInfo;
}

export const WxPlusBVisualizer: React.FC<WxPlusBVisualizerProps> = ({
  sourceVectorsA,
  sourceVectorB,
  biasVector,
  resultSymbolInfo,
}) => {
  const vectorA = useMemo(() => sourceVectorsA.map(v => v.data).flat(), [sourceVectorsA]);
  const vectorB = sourceVectorB.data;
  const bias = biasVector.data[0];

  const matmulResult = useMemo(() => vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0), [vectorA, vectorB]);
  const finalResult = matmulResult + bias;

  const matmulStepsCount = 1 + (vectorA.length * 4) + 1;

  const combinedSteps: WxPlusBStep[] = useMemo(() => {
    const generatedSteps: any[] = [];
    // Matmul phase
    for (let i = 1; i < matmulStepsCount; i++) {
        generatedSteps.push({ type: 'matmul-step', step: i });
    }
    // Bias phase
    generatedSteps.push({ type: 'finish-matmul', matmulResult });
    generatedSteps.push({ type: 'highlight-bias' });
    generatedSteps.push({ type: 'add-bias', finalResult });
    generatedSteps.push({ type: 'finish-add' });
    return generatedSteps;
  }, [matmulStepsCount, matmulResult, finalResult]);

  const { currentStep, isPlaying, play, pause, reset, setStepManually } = useAnimationController(combinedSteps.length, 300);
  const currentAnimState = combinedSteps[currentStep] || { type: 'idle' };

  const isMatmulFinished = currentStep >= combinedSteps.findIndex(s => s.type === 'finish-matmul');

  // --- Inline Styles ---
  const styles: { [key: string]: React.CSSProperties } = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '15px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6', width: '100%', boxSizing: 'border-box' },
    phaseTitle: { fontSize: '1.2em', fontWeight: 'bold', color: '#343a40', marginTop: '10px', marginBottom: '5px', paddingBottom: '5px', borderBottom: '2px solid #e9ecef', width: '100%', textAlign: 'center' },
    matmulSection: { width: '100%', border: '1px dashed #ced4da', borderRadius: '8px', padding: '10px', backgroundColor: '#fff' },
    biasAddSection: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '15px', transition: 'opacity 0.3s ease' },
    biasRow: { display: 'flex', alignItems: 'center', gap: '20px', fontSize: '1.5em', fontWeight: 'bold' },
    biasElement: { padding: '10px 20px', borderRadius: '8px', border: '1px solid #ced4da', backgroundColor: '#fff', fontFamily: 'monospace', transition: 'all 0.3s ease' },
    highlightSource: { borderColor: '#4a90e2', backgroundColor: 'rgba(74, 144, 226, 0.1)', transform: 'scale(1.1)' },
    highlightResult: { borderColor: '#28a745', backgroundColor: 'rgba(40, 167, 69, 0.1)', transform: 'scale(1.1)' },
    controls: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '15px', width: '100%' },
    button: { padding: '8px 16px', fontSize: '1em', cursor: 'pointer', border: '1px solid #6c757d', borderRadius: '4px', backgroundColor: '#fff' },
    playingButton: { backgroundColor: '#6c757d', color: '#fff' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.phaseTitle}>Phase 1: Dot Product (W·x)</div>
      <div style={styles.matmulSection}>
          <InteractiveMatMulVisualizer
              sourceVectorsA={sourceVectorsA}
              sourceVectorB={sourceVectorB}
              resultSymbolInfo={{ base: 'W·x' }}
          />
      </div>

      <div style={{...styles.phaseTitle, opacity: isMatmulFinished ? 1 : 0.3, marginTop: '20px' }}>
        Phase 2: Add Bias (+b)
      </div>
      <div style={{...styles.biasAddSection, opacity: isMatmulFinished ? 1 : 0.3 }}>
        <div style={styles.biasRow}>
            <div style={{...styles.biasElement, ...(currentAnimState.type === 'highlight-bias' ? styles.highlightSource : {})}}>
                {formatNumber(matmulResult, 4)}
            </div>
            <span>+</span>
            <div style={{...styles.biasElement, ...(currentAnimState.type === 'highlight-bias' ? styles.highlightSource : {})}}>
                {formatNumber(bias, 4)}
            </div>
            <span>=</span>
            <div style={{...styles.biasElement, ...(currentAnimState.type === 'add-bias' || currentAnimState.type === 'finish-add' ? styles.highlightResult : {})}}>
                {currentAnimState.type === 'add-bias' || currentAnimState.type === 'finish-add' ? formatNumber(finalResult, 4) : '?'}
            </div>
        </div>
      </div>

      <div style={styles.controls}>
        <button onClick={() => setStepManually(currentStep - 1)} disabled={currentStep <= 0} style={styles.button}>上一步</button>
        <button onClick={play} style={{...styles.button, ...(isPlaying ? styles.playingButton : {})}}>Play</button>
        <button onClick={pause} style={styles.button}>Pause</button>
        <button onClick={() => setStepManually(currentStep + 1)} disabled={currentStep >= combinedSteps.length - 1} style={styles.button}>下一步</button>
        <button onClick={reset} style={styles.button}>Reset</button>
      </div>
      <input
        type="range"
        min={0}
        max={combinedSteps.length - 1}
        value={currentStep}
        onChange={e => setStepManually(parseInt(e.target.value))}
        style={{width: '90%', cursor: 'pointer', marginTop: '10px'}}
      />
    </div>
  );
};
// END OF FILE: src/components/visualizers/WxPlusBVisualizer.tsx