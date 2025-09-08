// FILE: src/components/visualizers/InteractiveMatMulVisualizer.tsx
import React, { useMemo, useRef, useEffect } from 'react';
import { Vector, MatMulStep, SymbolInfo } from './types';
import { useAnimationController, formatNumber } from './utils';
import { InlineMath } from 'react-katex';

interface MatMulVisualizerProps {
  sourceVectorsA: { data: Vector, symbolInfo: SymbolInfo }[];
  sourceVectorB: { data: Vector, symbolInfo: SymbolInfo };
  resultSymbolInfo: SymbolInfo;
  operation?: '+' | '×';
}

export const InteractiveMatMulVisualizer: React.FC<MatMulVisualizerProps> = ({
  sourceVectorsA,
  sourceVectorB,
  resultSymbolInfo,
  operation = '×',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsARefs = useRef<(HTMLDivElement | null)[][]>(sourceVectorsA.map(() => []));
  const elementsBRef = useRef<(HTMLDivElement | null)[]>([]);
  const productRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sumRef = useRef<HTMLDivElement>(null);

  const vectorA = useMemo(() => sourceVectorsA.map(v => v.data).flat(), [sourceVectorsA]);
  const vectorB = sourceVectorB.data;

  const steps: MatMulStep[] = useMemo(() => {
    const generatedSteps: MatMulStep[] = [{ type: 'start', index: -1 }];
    let cumulativeSum = 0;
    for (let i = 0; i < vectorA.length; i++) {
      generatedSteps.push({ type: 'highlight-pair', index: i });
      generatedSteps.push({ type: 'show-op', index: i });
      const product = vectorA[i] * vectorB[i];
      generatedSteps.push({ type: 'multiply', index: i, product });
      cumulativeSum += product;
      generatedSteps.push({ type: 'accumulate', index: i, product, cumulativeSum });
    }
    generatedSteps.push({ type: 'finish', index: -1, cumulativeSum });
    return generatedSteps;
  }, [vectorA, vectorB]);

  const { currentStep, isPlaying, play, pause, reset, setStepManually } = useAnimationController(steps.length, 400);

  const result = useMemo(() => vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0), [vectorA, vectorB]);
  const currentAnimState: MatMulStep = steps[currentStep] || { type: 'idle', index: -1 };

  const handlePrevStep = () => currentStep > 0 && setStepManually(currentStep - 1);
  const handleNextStep = () => currentStep < steps.length - 1 && setStepManually(currentStep + 1);

  useEffect(() => {
    if (currentAnimState.type !== 'idle' && currentAnimState.index !== -1) {
      const activeIndex = currentAnimState.index;
      productRefs.current[activeIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      elementsBRef.current[activeIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

      let sourceAIndex = activeIndex;
      for (let i = 0; i < elementsARefs.current.length; i++) {
        const sourceVectorLength = elementsARefs.current[i].length;
        if (sourceAIndex < sourceVectorLength) {
          elementsARefs.current[i][sourceAIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          break;
        }
        sourceAIndex -= sourceVectorLength;
      }
    }
  }, [currentStep, currentAnimState]);

  const styles: { [key: string]: React.CSSProperties } = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '15px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6', width: '100%', boxSizing: 'border-box' },
    row: { display: 'flex', alignItems: 'center', gap: '15px', width: '100%' },
    vectorGroup: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: 0 },
    label: { fontWeight: 'bold', color: '#6c757d', display: 'flex', alignItems: 'center', gap: '8px', height: '30px', width: '80px', justifyContent: 'flex-end' },
    vectorScroll: { overflowX: 'auto', padding: '5px' },
    vectorContainer: { display: 'flex', flexDirection: 'column', gap: '2px' },
    vector: { display: 'flex', gap: '5px', width: 'max-content', border: '1px solid #ccc', borderRadius: '4px', padding: '5px', backgroundColor: 'white' },
    vectorIndices: { display: 'flex', gap: '5px', paddingLeft: '2px' },
    indexLabel: { width: '60px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#6c757d', fontSize: '0.8em', fontFamily: 'monospace' },
    element: { width: '60px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #ced4da', borderRadius: '4px', backgroundColor: '#fff', transition: 'all 0.3s ease' },
    highlight: { transform: 'scale(1.15)', borderColor: '#e63946', backgroundColor: 'rgba(230, 57, 70, 0.1)', fontWeight: 'bold', zIndex: 2 },
    productRow: { display: 'flex', alignItems: 'center', position: 'relative', height: '50px', width: '100%' },
    productsContainer: { flex: 1, minWidth: 0, overflowX: 'auto', padding: '5px' },
    products: { display: 'flex', gap: '10px', alignItems: 'center', width: 'max-content' },
    productTerm: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5px 8px', border: '1px dashed #adb5bd', borderRadius: '4px', opacity: 0, transition: 'opacity 0.3s ease', whiteSpace: 'nowrap', minWidth: '120px', position: 'relative' },
    opSymbol: { position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '1.5em', fontWeight: 'bold', color: '#e63946', opacity: 0, transition: 'opacity 0.2s' },
    plus: { opacity: 0, transition: 'opacity 0.3s ease', fontWeight: 'bold', fontSize: '1.2em' },
    sumContainer: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' },
    sumValue: { padding: '8px 15px', fontSize: '1.2em', fontWeight: 'bold', border: '2px solid #28a745', borderRadius: '8px', backgroundColor: 'rgba(40, 167, 69, 0.1)', color: '#155724' },
    visible: { opacity: 1 },
    controls: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '15px' },
    button: { padding: '8px 16px', fontSize: '1em', cursor: 'pointer', border: '1px solid #6c757d', borderRadius: '4px', backgroundColor: '#fff' },
    playingButton: { backgroundColor: '#6c757d', color: '#fff' },
  };

  let currentIndex = 0;
  return (
    <div style={styles.container} ref={containerRef}>
      {sourceVectorsA.map((vec, vecIndex) => {
        const vecContent = (
            <div style={styles.row} key={`a-vec-${vecIndex}`}>
                <div style={styles.label}><InlineMath>{`${vec.symbolInfo.base}_{${vec.symbolInfo.subscript}}`}</InlineMath></div>
                <div style={styles.vectorGroup}>
                    <div style={styles.vectorScroll}>
                      <div style={styles.vectorContainer}>
                        <div style={styles.vector}>
                            {vec.data.map((val, i) => {
                                const globalIndex = currentIndex + i;
                                return <div key={globalIndex} ref={el => elementsARefs.current[vecIndex][i] = el} style={{...styles.element, ...(currentAnimState.index === globalIndex ? styles.highlight : {})}}>{formatNumber(val, 2)}</div>;
                            })}
                        </div>
                        <div style={styles.vectorIndices}>
                            {vec.data.map((_, i) => <div key={i} style={styles.indexLabel}>{currentIndex + i}</div>)}
                        </div>
                      </div>
                    </div>
                </div>
                <div style={{...styles.label, visibility: vecIndex === 0 ? 'visible' : 'hidden' }}><InlineMath math="\odot" /></div>
            </div>
        );
        currentIndex += vec.data.length;
        return vecContent;
      })}
      <div style={styles.row}>
        <div style={styles.label}><InlineMath>{`${sourceVectorB.symbolInfo.base}_{${sourceVectorB.symbolInfo.subscript}}`}</InlineMath></div>
        <div style={styles.vectorGroup}>
          <div style={styles.vectorScroll}>
             <div style={styles.vectorContainer}>
                <div style={styles.vector}>
                  {vectorB.map((val, i) => (
                    <div key={i} ref={el => elementsBRef.current[i] = el} style={{...styles.element, ...(currentAnimState.index === i ? styles.highlight : {})}}>{formatNumber(val, 2)}</div>
                  ))}
                </div>
                <div style={styles.vectorIndices}>
                    {vectorB.map((_, i) => <div key={i} style={styles.indexLabel}>{i}</div>)}
                </div>
              </div>
          </div>
        </div>
        <div style={{...styles.label, visibility: 'hidden' }}><InlineMath math="\odot" /></div>
      </div>
      <div style={styles.row}>
        <div style={styles.label}><InlineMath>{`${resultSymbolInfo.base}`}</InlineMath></div>
        <div style={styles.productRow}>
          <div style={styles.productsContainer}>
            <div style={styles.products}>
              {vectorA.map((_, i) => (
                <React.Fragment key={`prod-frag-${i}`}>
                  <div ref={el => productRefs.current[i] = el} style={{ ...styles.productTerm, ...(currentStep >= steps.findIndex(s => s.type === 'multiply' && s.index === i) ? styles.visible : {}) }}>
                    <div style={{...styles.opSymbol, ...(currentAnimState.type === 'show-op' && currentAnimState.index === i ? styles.visible : {})}}>{operation}</div>
                    ({formatNumber(vectorA[i], 2)} {operation} {formatNumber(vectorB[i], 2)})
                  </div>
                  {i < vectorA.length - 1 && <span style={{...styles.plus, ...(currentStep > steps.findIndex(s => s.type === 'multiply' && s.index === i) ? styles.visible : {})}}>+</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        <div style={{...styles.label, visibility: 'hidden' }}><InlineMath math="\odot" /></div>
      </div>

      <div style={styles.sumContainer}>
        <div style={styles.label}><InlineMath math="\sum =" /></div>
        <div ref={sumRef} style={styles.sumValue}>
          {currentAnimState.type === 'accumulate' ? formatNumber(currentAnimState.cumulativeSum ?? 0, 3) : currentAnimState.type === 'finish' ? formatNumber(result, 3) : (currentStep > 0 ? '0.0' : '?')}
        </div>
      </div>

      <div style={styles.controls}>
        <button onClick={handlePrevStep} disabled={currentStep <= 0} style={styles.button}>上一步</button>
        <button onClick={play} style={{ ...styles.button, ...(isPlaying ? styles.playingButton : {}) }}>Play</button>
        <button onClick={pause} style={styles.button}>Pause</button>
        <button onClick={handleNextStep} disabled={currentStep >= steps.length - 1} style={styles.button}>下一步</button>
        <button onClick={reset} style={styles.button}>Reset</button>
      </div>
      <input type="range" min={0} max={steps.length - 1} value={currentStep} onChange={e => setStepManually(parseInt(e.target.value))} style={{width: '90%', cursor: 'pointer', marginTop: '10px'}} />
    </div>
  );
};
// END OF FILE: src/components/visualizers/InteractiveMatMulVisualizer.tsx