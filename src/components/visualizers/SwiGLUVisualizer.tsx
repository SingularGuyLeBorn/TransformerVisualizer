// FILE: src/components/visualizers/SwiGLUVisualizer.tsx
import React, { useRef } from 'react';
import { Vector } from './types';
import { formatNumber, getCurvePath } from './utils';

interface SwiGLUVisualizerProps {
  inputVector: Vector; // This would be x
  gateActivation: Vector; // This would be SiLU(xW)
  dataVector: Vector; // This would be xV
}

export const SwiGLUVisualizer: React.FC<SwiGLUVisualizerProps> = ({ inputVector, gateActivation, dataVector }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gateRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dataRefs = useRef<(HTMLDivElement | null)[]>([]);
  const outputRefs = useRef<(HTMLDivElement | null)[]>([]);

  const outputVector = gateActivation.map((val, i) => val * dataVector[i]);

  // Inline Styles
  const styles: { [key: string]: React.CSSProperties } = {
    container: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' },
    title: { margin: '0 0 10px 0', fontSize: '1.2em', fontWeight: 'bold' },
    mainArea: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' },
    pathContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' },
    label: { fontWeight: 'bold', color: '#6c757d', padding: '4px 8px', backgroundColor: '#e9ecef', borderRadius: '4px' },
    vector: { display: 'flex', flexDirection: 'column', gap: '5px' },
    element: { width: '60px', padding: '5px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #ced4da', borderRadius: '4px', backgroundColor: '#fff', transition: 'all 0.3s ease' },
    opSymbol: { fontSize: '2em', fontWeight: 'bold', alignSelf: 'center' },
    svg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' },
    path: { fill: 'none', strokeWidth: '2px', stroke: '#adb5bd', strokeDasharray: '4 4' },
  };

  const renderVector = (vec: Vector, refs: React.MutableRefObject<(HTMLDivElement | null)[]>) => (
    <div style={styles.vector}>
      {vec.map((val, i) => (
        <div key={i} ref={el => refs.current[i] = el} style={styles.element}>
          {formatNumber(val, 2)}
        </div>
      ))}
    </div>
  );

  return (
    <div style={styles.container} ref={containerRef}>
      <svg style={styles.svg}>
        {inputVector.map((_, i) => (
          <React.Fragment key={`path-${i}`}>
            <path d={getCurvePath(inputRefs.current[i], gateRefs.current[i], containerRef.current)} style={styles.path} />
            <path d={getCurvePath(inputRefs.current[i], dataRefs.current[i], containerRef.current)} style={styles.path} />
            <path d={getCurvePath(gateRefs.current[i], outputRefs.current[i], containerRef.current)} style={styles.path} />
            <path d={getCurvePath(dataRefs.current[i], outputRefs.current[i], containerRef.current)} style={styles.path} />
          </React.Fragment>
        ))}
      </svg>
      <h3 style={styles.title}>SwiGLU(x) = SiLU(xW) ⊙ xV</h3>
      <div style={styles.mainArea}>
        <div style={styles.pathContainer}>
          <div style={styles.label}>Input (x)</div>
          {renderVector(inputVector, inputRefs)}
        </div>

        <div style={styles.opSymbol}>→</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={styles.pathContainer}>
            <div style={styles.label}>Gate Path: SiLU(xW)</div>
            {renderVector(gateActivation, gateRefs)}
          </div>
          <div style={styles.pathContainer}>
            <div style={styles.label}>Data Path: xV</div>
            {renderVector(dataVector, dataRefs)}
          </div>
        </div>

        <div style={styles.opSymbol}>⊙</div>

        <div style={styles.pathContainer}>
          <div style={styles.label}>Output</div>
          {renderVector(outputVector, outputRefs)}
        </div>
      </div>
    </div>
  );
};

// END OF FILE: src/components/visualizers/SwiGLUVisualizer.tsx