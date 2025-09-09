// FILE: src/components/visualizers/RoPEVisualizer.tsx
import React, { useMemo, useState } from 'react';
import { Vector, RoPEStep } from './types';
import { formatNumber, useAnimationController } from './utils';
import { InlineMath } from 'react-katex';

interface RoPEVisualizerProps {
  inputVector: Vector;
  position: number;
}

export const RoPEVisualizer: React.FC<RoPEVisualizerProps> = ({ inputVector, position }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const calculations = useMemo(() => {
    const d = inputVector.length;
    const theta = 10000;
    const outputVector = [...inputVector];
    const details = [];

    for (let i = 0; i < d; i += 2) {
      const x_i = inputVector[i];
      const x_j = (i + 1 < d) ? inputVector[i + 1] : 0;

      const freq = 1 / (theta ** (i / d));
      const m_theta = position * freq;
      const cos_m_theta = Math.cos(m_theta);
      const sin_m_theta = Math.sin(m_theta);

      const y_i = x_i * cos_m_theta - x_j * sin_m_theta;
      const y_j = x_i * sin_m_theta + x_j * cos_m_theta;

      outputVector[i] = y_i;
      if (i + 1 < d) outputVector[i + 1] = y_j;

      details.push({ freq, m_theta, cos_m_theta, sin_m_theta });
    }
    return { outputVector, details };
  }, [inputVector, position]);

  const steps: RoPEStep[] = useMemo(() => {
    const generatedSteps: RoPEStep[] = [{ type: 'start' }];
    for (let i = 0; i < inputVector.length; i += 2) {
      generatedSteps.push({ type: 'process-pair', index: i });
    }
    generatedSteps.push({ type: 'finish' });
    return generatedSteps;
  }, [inputVector]);

  const { currentStep, isPlaying, play, pause, reset, setStepManually } = useAnimationController(steps.length, 500);
  const currentAnimState = steps[currentStep] || { type: 'idle' };

  const animActiveIndex = currentAnimState.type === 'process-pair' ? currentAnimState.index : -1;
  const lastCalculatedIndex = (currentAnimState.type === 'finish')
      ? inputVector.length - 1
      : (animActiveIndex !== -1 ? animActiveIndex + 1 : -1);

  const displayIndex = hoveredIndex !== null ? hoveredIndex : animActiveIndex;
  const detail = displayIndex !== -1 ? calculations.details[displayIndex / 2] : null;

  const styles: { [key: string]: React.CSSProperties } = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' },
    mainArea: { display: 'flex', justifyContent: 'space-around', alignItems: 'center', width: '100%', gap: '20px', flexWrap: 'wrap' },
    vectorColumn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
    vector: { display: 'flex', flexDirection: 'column', gap: '4px' },
    elementPair: { display: 'flex', gap: '4px', border: '2px solid transparent', borderRadius: '4px', transition: 'all 0.3s' },
    element: { width: '70px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #ced4da', borderRadius: '4px', backgroundColor: '#fff', boxSizing: 'border-box' },
    highlightAnim: { borderColor: '#4a90e2' },
    highlightHover: { borderColor: '#f5a623' },
    plotColumn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
    plotBox: { width: '200px', height: '200px', border: '1px solid #ccc', position: 'relative', backgroundColor: 'white' },
    formulaBox: { fontFamily: 'monospace', fontSize: '0.85em', lineHeight: 1.5, padding: '10px', backgroundColor: 'white', border: '1px solid #eee', borderRadius: '4px', width: '100%', boxSizing: 'border-box' },
    controls: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '15px' },
    button: { padding: '8px 16px', fontSize: '1em', cursor: 'pointer', border: '1px solid #6c757d', borderRadius: '4px', backgroundColor: '#fff' },
    playingButton: { backgroundColor: '#6c757d', color: '#fff' },
  };

  const renderPlot = () => {
    if (displayIndex === -1 || !detail) return <div style={styles.plotBox}><p style={{textAlign: 'center', color: '#aaa', fontSize: '0.8em', padding: '10px'}}>Hover over or play animation to see rotation</p></div>;

    const SIZE = 200;
    const CENTER = SIZE / 2;
    const SCALE = 40;
    const [x1, x2] = [inputVector[displayIndex], inputVector[displayIndex + 1] || 0];
    const [y1, y2] = [calculations.outputVector[displayIndex], calculations.outputVector[displayIndex + 1] || 0];

    const angle = detail.m_theta;
    const radius = Math.sqrt(x1**2 + x2**2) * SCALE;
    const startAngle = Math.atan2(x2, x1);
    const endAngle = startAngle + angle;
    const largeArcFlag = angle > Math.PI ? 1 : 0;

    const arcPath = `M ${CENTER + radius * Math.cos(startAngle)} ${CENTER - radius * Math.sin(startAngle)} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${CENTER + radius * Math.cos(endAngle)} ${CENTER - radius * Math.sin(endAngle)}`;

    return (
        <div style={styles.plotBox}>
            <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                <line x1={0} y1={CENTER} x2={SIZE} y2={CENTER} stroke="#ddd" />
                <line x1={CENTER} y1={0} x2={CENTER} y2={SIZE} stroke="#ddd" />
                <path d={arcPath} fill="none" stroke="rgba(245, 166, 35, 0.5)" strokeWidth="2" strokeDasharray="3 3"/>
                <line x1={CENTER} y1={CENTER} x2={CENTER + x1 * SCALE} y2={CENTER - x2 * SCALE} stroke="#6c757d" strokeWidth="2" markerEnd="url(#arrow-gray)" />
                <line x1={CENTER} y1={CENTER} x2={CENTER + y1 * SCALE} y2={CENTER - y2 * SCALE} stroke="#e63946" strokeWidth="2.5" markerEnd="url(#arrow-red)" />
                <defs>
                    <marker id="arrow-gray" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#6c757d" /></marker>
                    <marker id="arrow-red" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#e63946" /></marker>
                </defs>
            </svg>
        </div>
    );
  };


  return (
    <div style={styles.container}>
      <h3>Rotary Positional Embedding (RoPE)</h3>
      <div style={styles.mainArea}>
        <div style={styles.vectorColumn}>
            <h4>Input Vector (pos={position})</h4>
            <div style={styles.vector}>
                {inputVector.map((val, i) => (i % 2 === 0 &&
                    <div
                        key={i} style={{...styles.elementPair, ...(displayIndex === i ? styles.highlightHover : {})}}
                        onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <div style={styles.element}>{formatNumber(val)}</div>
                        <div style={styles.element}>{formatNumber(inputVector[i+1] || 0)}</div>
                    </div>
                ))}
            </div>
        </div>
        <div style={styles.plotColumn}>
            <h4>Rotation in 2D Plane</h4>
            {renderPlot()}
            <div style={styles.formulaBox}>
              {detail ? <>
                <div><InlineMath math={`\\theta_i = 1 / ${10000}^{(${displayIndex}/${inputVector.length})}`} /></div>
                <div>Rotation Angle: {formatNumber(detail.m_theta, 2)} rad</div>
                <div><InlineMath math={`(x'_i, x'_{i+1}) = (x_i, x_{i+1}) \\begin{pmatrix} \\cos(m\\theta) & \\sin(m\\theta) \\\\ -\\sin(m\\theta) & \\cos(m\\theta) \\end{pmatrix}`}/></div>
              </> : "Hover a pair..."}
            </div>
        </div>
        <div style={styles.vectorColumn}>
            <h4>Output Vector</h4>
            <div style={styles.vector}>
                {calculations.outputVector.map((val, i) => (i % 2 === 0 &&
                    <div
                        key={i}
                        style={{
                            ...styles.elementPair,
                            ...(animActiveIndex === i ? styles.highlightAnim : {}),
                            ...(hoveredIndex === i ? styles.highlightHover : {})
                        }}
                        onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <div style={{...styles.element, opacity: (lastCalculatedIndex < i && hoveredIndex === null) ? 0.3 : 1 }}>
                            {(lastCalculatedIndex < i && hoveredIndex === null) ? '?' : formatNumber(val)}
                        </div>
                        <div style={{...styles.element, opacity: (lastCalculatedIndex < i+1 && hoveredIndex === null) ? 0.3 : 1 }}>
                             {(lastCalculatedIndex < i+1 && hoveredIndex === null) ? '?' : formatNumber(calculations.outputVector[i+1] || 0)}
                        </div>
                    </div>
                ))}
            </div>
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

// END OF FILE: src/components/visualizers/RoPEVisualizer.tsx