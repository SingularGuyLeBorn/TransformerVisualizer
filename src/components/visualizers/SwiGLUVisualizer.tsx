// FILE: src/components/visualizers/SwiGLUVisualizer.tsx
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Vector, SwiGLUAnimationStep } from './types';
import { formatNumber, getCurvePath, useAnimationController } from './utils';
import { InlineMath } from 'react-katex';

interface SwiGLUVisualizerProps {
  inputVector: Vector;
  gateActivation: Vector;
  dataVector: Vector;
}

export const SwiGLUVisualizer: React.FC<SwiGLUVisualizerProps> = ({ inputVector, gateActivation, dataVector }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gateRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dataRefs = useRef<(HTMLDivElement | null)[]>([]);
  const outputRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const outputVector = useMemo(() => gateActivation.map((val, i) => val * dataVector[i]), [gateActivation, dataVector]);

  const steps: SwiGLUAnimationStep[] = useMemo(() => {
    const generatedSteps: SwiGLUAnimationStep[] = [{ type: 'start' }];
    inputVector.forEach((_, i) => {
        generatedSteps.push({ type: 'highlight-pair', index: i });
        generatedSteps.push({ type: 'calculate', index: i });
    });
    generatedSteps.push({ type: 'finish' });
    return generatedSteps;
  }, [inputVector]);

  const { currentStep, isPlaying, play, pause, reset, setStepManually } = useAnimationController(steps.length, 600);
  const currentAnimState = steps[currentStep] || { type: 'idle' };

  const animActiveIndex = (currentAnimState.type === 'highlight-pair' || currentAnimState.type === 'calculate') ? currentAnimState.index : -1;
  const lastCalculatedIndex = (currentAnimState.type === 'finish') ? inputVector.length - 1 : (currentAnimState.type === 'calculate' ? currentAnimState.index : animActiveIndex - 1);

  const styles: { [key: string]: React.CSSProperties } = {
    container: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' },
    title: { margin: '0 0 10px 0', fontSize: '1.2em', fontWeight: 'bold' },
    mainArea: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', width: '100%' },
    pathContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' },
    label: { fontWeight: 'bold', color: '#6c757d', padding: '4px 8px', backgroundColor: '#e9ecef', borderRadius: '4px' },
    vector: { display: 'flex', flexDirection: 'column', gap: '5px' },
    element: { width: '60px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #ced4da', borderRadius: '4px', backgroundColor: '#fff', transition: 'all 0.3s ease', boxSizing: 'border-box', cursor: 'pointer' },
    opSymbol: { fontSize: '2em', fontWeight: 'bold', alignSelf: 'center' },
    svg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' },
    path: { fill: 'none', strokeWidth: '2px', stroke: '#adb5bd', strokeDasharray: '4 4', transition: 'stroke 0.3s, stroke-width 0.3s' },
    highlightPath: { stroke: '#fd7e14', strokeWidth: '3px', strokeDasharray: 'none' },
    highlightAnim: { borderColor: '#4a90e2', backgroundColor: 'rgba(74, 144, 226, 0.1)', transform: 'scale(1.1)' },
    highlightHover: { borderColor: '#f5a623', backgroundColor: 'rgba(245, 166, 35, 0.1)', transform: 'scale(1.1)' },
    controls: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '15px', width: '100%' },
    button: { padding: '8px 16px', fontSize: '1em', cursor: 'pointer', border: '1px solid #6c757d', borderRadius: '4px', backgroundColor: '#fff' },
    playingButton: { backgroundColor: '#6c757d', color: '#fff' },
  };

  const renderVector = (vec: Vector, refs: React.MutableRefObject<(HTMLDivElement | null)[]>, type: 'input' | 'gate' | 'data' | 'output') => (
    <div style={styles.vector}>
      {vec.map((val, i) => {
        const isAnimActive = animActiveIndex === i;
        const isHoverActive = hoveredIndex === i;
        const isSource = type === 'input' || type === 'gate' || type === 'data';
        const isOutput = type === 'output';

        let highlightStyle = {};
        if (isAnimActive && isSource) {
            highlightStyle = {...highlightStyle, ...styles.highlightAnim};
        }
        if (isAnimActive && isOutput && currentAnimState.type === 'calculate') {
             highlightStyle = {...highlightStyle, ...styles.highlightAnim};
        }
        if (isHoverActive) {
            highlightStyle = {...highlightStyle, ...styles.highlightHover};
        }

        const isVisible = isOutput ? (i <= lastCalculatedIndex && hoveredIndex === null) || hoveredIndex !== null : true;

        return (
            <div
                key={i}
                ref={el => refs.current[i] = el}
                style={{ ...styles.element, ...highlightStyle, opacity: isVisible ? 1 : 0.3 }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
            >
              {isVisible ? formatNumber(val, 2) : '?'}
            </div>
        );
      })}
    </div>
  );

  return (
    <div style={styles.container} ref={containerRef}>
      <svg style={styles.svg}>
        {inputVector.map((_, i) => {
           const isPathHighlighted = hoveredIndex === i || animActiveIndex === i;
           const pathStyle = isPathHighlighted ? {...styles.path, ...styles.highlightPath} : styles.path;
           return (
              <React.Fragment key={`path-${i}`}>
                <path d={getCurvePath(inputRefs.current[i], gateRefs.current[i], containerRef.current)} style={pathStyle} />
                <path d={getCurvePath(inputRefs.current[i], dataRefs.current[i], containerRef.current)} style={pathStyle} />
                <path d={getCurvePath(gateRefs.current[i], outputRefs.current[i], containerRef.current)} style={pathStyle} />
                <path d={getCurvePath(dataRefs.current[i], outputRefs.current[i], containerRef.current)} style={pathStyle} />
              </React.Fragment>
           );
        })}
      </svg>
      <h3 style={styles.title}><InlineMath math={"\\text{SwiGLU}(x) = \\text{SiLU}(xW) \\odot xV"} /></h3>
      <div style={styles.mainArea}>
        <div style={styles.pathContainer}>
          <div style={styles.label}>Input (x)</div>
          {renderVector(inputVector, inputRefs, 'input')}
        </div>

        <div style={styles.opSymbol}>→</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={styles.pathContainer}>
            <div style={styles.label}><InlineMath math={"\\text{Gate Path: SiLU}(xW)"}/></div>
            {renderVector(gateActivation, gateRefs, 'gate')}
          </div>
          <div style={styles.pathContainer}>
            <div style={styles.label}><InlineMath math={"\\text{Data Path: } xV"}/></div>
            {renderVector(dataVector, dataRefs, 'data')}
          </div>
        </div>

        <div style={styles.opSymbol}>⊙</div>

        <div style={styles.pathContainer}>
          <div style={styles.label}>Output</div>
          {renderVector(outputVector, outputRefs, 'output')}
        </div>
      </div>
       <div style={styles.controls}>
        <button onClick={() => setStepManually(currentStep - 1)} disabled={currentStep <= 0} style={styles.button}>上一步</button>
        <button onClick={isPlaying ? pause : play} style={{ ...styles.button, ...(isPlaying ? styles.playingButton : {}) }}>{isPlaying ? 'Pause' : 'Play'}</button>
        <button onClick={() => setStepManually(currentStep + 1)} disabled={currentStep >= steps.length - 1} style={styles.button}>下一步</button>
        <button onClick={reset} style={styles.button}>Reset</button>
      </div>
      <input
        type="range"
        min={-1}
        max={steps.length - 1}
        value={currentStep}
        onChange={e => setStepManually(parseInt(e.target.value))}
        style={{width: '90%', cursor: 'pointer', marginTop: '10px'}}
      />
    </div>
  );
};
// END OF FILE: src/components/visualizers/SwiGLUVisualizer.tsx