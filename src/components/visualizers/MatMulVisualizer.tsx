// FILE: src/components/visualizers/MatMulVisualizer.tsx
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { Vector, MatMulStep } from './types';
import { useAnimationController, formatNumber, getCurvePath } from './utils';

interface MatMulVisualizerProps {
  vectorA: Vector;
  vectorB: Vector;
}

export const MatMulVisualizer: React.FC<MatMulVisualizerProps> = ({ vectorA, vectorB }) => {
  const [svgPaths, setSvgPaths] = useState<any[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperARef = useRef<HTMLDivElement>(null);
  const scrollWrapperBRef = useRef<HTMLDivElement>(null);
  const scrollWrapperProdRef = useRef<HTMLDivElement>(null);

  const elementsARef = useRef<(HTMLDivElement | null)[]>([]);
  const elementsBRef = useRef<(HTMLDivElement | null)[]>([]);
  const productRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sumRef = useRef<HTMLDivElement>(null);

  const steps: MatMulStep[] = useMemo(() => {
    const generatedSteps: MatMulStep[] = [];
    let cumulativeSum = 0;
    for (let i = 0; i < vectorA.length; i++) {
      generatedSteps.push({ type: 'highlight-pair', index: i });
      const product = vectorA[i] * vectorB[i];
      generatedSteps.push({ type: 'multiply', index: i, product });
      cumulativeSum += product;
      generatedSteps.push({ type: 'accumulate', index: i, product, cumulativeSum });
    }
    generatedSteps.push({ type: 'finish', index: -1, cumulativeSum });
    return generatedSteps;
  }, [vectorA, vectorB]);

  const { currentStep, isPlaying, play, pause, reset, setStepManually } = useAnimationController(steps.length, 800);

  const result = useMemo(() => vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0), [vectorA, vectorB]);
  const currentAnimState: MatMulStep = steps[currentStep] || { type: 'idle', index: -1 };

  const recalculatePaths = useCallback(() => {
    if (!containerRef.current) return;
    const newPaths = vectorA.map((_, i) => ({
      id: `paths-${i}`,
      path1: getCurvePath(elementsARef.current[i], productRefs.current[i], containerRef.current),
      path2: getCurvePath(elementsBRef.current[i], productRefs.current[i], containerRef.current),
      // [REMOVED] Path 3 is no longer needed as we are not connecting each term to the sum.
    }));
    setSvgPaths(newPaths);
  }, [vectorA]);

  useEffect(() => {
    const observer = new ResizeObserver(recalculatePaths);
    const elementsToObserve = [
        containerRef.current,
        scrollWrapperARef.current,
        scrollWrapperBRef.current,
        scrollWrapperProdRef.current,
    ].filter(Boolean);

    elementsToObserve.forEach(el => observer.observe(el!));

    const scrollableElements = [scrollWrapperARef.current, scrollWrapperBRef.current, scrollWrapperProdRef.current].filter(Boolean);
    scrollableElements.forEach(el => el!.addEventListener('scroll', recalculatePaths, { passive: true }));

    const tooltipContent = containerRef.current?.closest('.tooltip-content-wrapper');
    if (tooltipContent) {
        tooltipContent.addEventListener('scroll', recalculatePaths, { passive: true });
    }

    const timeoutId = setTimeout(recalculatePaths, 50);

    return () => {
        clearTimeout(timeoutId);
        observer.disconnect();
        scrollableElements.forEach(el => el!.removeEventListener('scroll', recalculatePaths));
        if (tooltipContent) {
            tooltipContent.removeEventListener('scroll', recalculatePaths);
        }
    };
  }, [recalculatePaths, currentStep]);

  const handlePrevStep = () => {
    if (currentStep > -1) {
        setStepManually(currentStep - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
        setStepManually(currentStep + 1);
    }
  };

  // Inline Styles
  const styles: { [key: string]: React.CSSProperties } = {
    container: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '15px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6', overflow: 'hidden' },
    vectorContainer: { display: 'flex', gap: '8px', alignItems: 'center', width: 'auto', maxWidth: '100%' },
    vectorLabel: { fontSize: '1.2em', fontWeight: 'bold', fontFamily: 'monospace' },
    vectorScrollWrapper: { flexGrow: 1, minWidth: 0, overflowX: 'auto', paddingBottom: '10px' },
    vector: { display: 'flex', gap: '5px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: 'white', width: 'max-content' },
    element: { display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #ced4da', borderRadius: '4px', backgroundColor: '#fff', transition: 'all 0.3s ease', flex: '1 1 0', minWidth: '60px', height: '30px', padding: '0 5px', cursor: 'pointer' },
    highlight: { transform: 'scale(1.15)', borderColor: '#e63946', backgroundColor: 'rgba(230, 57, 70, 0.1)', fontWeight: 'bold' },
    productContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', minHeight: '60px', width: '100%' },
    productsRow: { display: 'flex', gap: '10px', alignItems: 'center', width: 'max-content' },
    productTerm: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5px 8px', border: '1px dashed #adb5bd', borderRadius: '4px', opacity: 0, transition: 'opacity 0.3s ease', whiteSpace: 'nowrap', flex: '1 1 0', minWidth: '120px' },
    plusSymbol: { opacity: 0, transition: 'opacity 0.3s ease', fontWeight: 'bold', fontSize: '1.2em' },
    visible: { opacity: 1 },
    sumContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
    sumLabel: { fontWeight: 'bold' },
    sumValue: { padding: '8px 15px', fontSize: '1.2em', fontWeight: 'bold', border: '2px solid #28a745', borderRadius: '8px', backgroundColor: 'rgba(40, 167, 69, 0.1)', color: '#155724' },
    svg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 },
    path: { fill: 'none', strokeWidth: '2px', stroke: '#adb5bd', strokeDasharray: '4 4', transition: 'stroke 0.3s ease, d 0.1s linear' },
    pathHighlight: { stroke: '#e63946', strokeWidth: '2.5px', strokeDasharray: 'none' },
    controls: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' },
    button: { padding: '8px 16px', fontSize: '1em', cursor: 'pointer', border: '1px solid #6c757d', borderRadius: '4px', backgroundColor: '#fff' },
    playingButton: { backgroundColor: '#6c757d', color: '#fff' },
    opSymbol: { fontSize: '1.8em', fontWeight: 'bold', margin: '5px 0' },
    braceStyle: { fontSize: '2.5em', color: '#6c757d', fontWeight: 'normal', alignSelf: 'center' },
  };

  return (
    <div style={styles.container} ref={containerRef}>
      <svg style={styles.svg}>
        {/* [MODIFIED] New SVG rendering logic for correct animation flow */}
        {svgPaths.map((pathData, i) => {
          // Find the first step related to this index
          const firstStepForIndex = steps.findIndex(s => s.index === i);
          // Don't render anything for future steps
          if (currentStep < firstStepForIndex || !pathData.id) {
            return null;
          }
          // Determine if the current animation step is actively processing this index
          const isCurrent = currentAnimState.index === i && (currentAnimState.type === 'highlight-pair' || currentAnimState.type === 'multiply');
          // Apply highlight style if current, otherwise default path style
          const pathStyle = isCurrent ? { ...styles.path, ...styles.pathHighlight } : styles.path;

          return (
            <React.Fragment key={pathData.id}>
              <path d={pathData.path1} style={pathStyle} />
              <path d={pathData.path2} style={pathStyle} />
            </React.Fragment>
          );
        })}
      </svg>

      <div style={styles.vectorContainer}>
        <div style={styles.vectorLabel}>A =</div>
        <div style={styles.vectorScrollWrapper} ref={scrollWrapperARef}>
          <div style={styles.vector}>
            {vectorA.map((val, i) => (
              <div key={i} ref={el => elementsARef.current[i] = el} style={{...styles.element, ...(currentAnimState.type !== 'idle' && currentAnimState.index === i ? styles.highlight : {})}}>
                {formatNumber(val, 2)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.opSymbol}>&times;</div>

      <div style={styles.vectorContainer}>
        <div style={styles.vectorLabel}>B =</div>
        <div style={styles.vectorScrollWrapper} ref={scrollWrapperBRef}>
          <div style={styles.vector}>
            {vectorB.map((val, i) => (
              <div key={i} ref={el => elementsBRef.current[i] = el} style={{...styles.element, ...(currentAnimState.type !== 'idle' && currentAnimState.index === i ? styles.highlight : {})}}>
                {formatNumber(val, 2)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.productContainer}>
        <div style={{fontWeight: 'bold'}}>Intermediate Products</div>
        {/* [FIXED] Added scroll wrapper to fix overflow */}
        <div style={styles.vectorScrollWrapper} ref={scrollWrapperProdRef}>
            <div style={styles.productsRow}>
            <span style={styles.braceStyle}>{'{'}</span>
            {vectorA.map((_, i) => (
                <React.Fragment key={`prod-frag-${i}`}>
                <div ref={el => productRefs.current[i] = el} style={{ ...styles.productTerm, ...(currentStep >= steps.findIndex(s => s.type === 'multiply' && s.index === i) ? styles.visible : {}) }}>
                    ({formatNumber(vectorA[i], 2)} &times; {formatNumber(vectorB[i], 2)})
                </div>
                {i < vectorA.length - 1 && <span style={{...styles.plusSymbol, ...(currentStep > steps.findIndex(s => s.type === 'multiply' && s.index === i) ? styles.visible : {})}}>+</span>}
                </React.Fragment>
            ))}
            <span style={styles.braceStyle}>{'}'}</span>
            </div>
        </div>
      </div>

      {/* [NEW] Added logical separator */}
      <div style={styles.opSymbol}>=</div>

      <div style={styles.sumContainer}>
        <div style={styles.sumLabel}>Final Result</div>
        <div ref={sumRef} style={styles.sumValue}>
          {currentAnimState.type === 'accumulate' ? formatNumber(currentAnimState.cumulativeSum ?? 0, 3) : currentAnimState.type === 'finish' ? formatNumber(result, 3) : '?'}
        </div>
      </div>

      <div style={styles.controls}>
        <button onClick={handlePrevStep} disabled={currentStep <= -1} style={styles.button}>上一步</button>
        <button onClick={play} style={{ ...styles.button, ...(isPlaying ? styles.playingButton : {}) }}>Play</button>
        <button onClick={pause} style={styles.button}>Pause</button>
        <button onClick={handleNextStep} disabled={currentStep >= steps.length - 1} style={styles.button}>下一步</button>
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
// END OF FILE: src/components/visualizers/MatMulVisualizer.tsx