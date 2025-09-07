// FILE: src/components/visualizers/ActivationFunctionVisualizer.tsx
import React, { useState, useMemo } from 'react';
import { Vector, ActivationFunctionType } from './types';
import { formatNumber } from './utils';

interface ActivationFunctionVisualizerProps {
  inputVector: Vector;
  functionType: ActivationFunctionType;
}

export const ActivationFunctionVisualizer: React.FC<ActivationFunctionVisualizerProps> = ({ inputVector, functionType }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const functions = {
    relu: (x: number) => Math.max(0, x),
    gelu: (x: number) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3)))),
    silu: (x: number) => x / (1 + Math.exp(-x)), // Swish/SiLU
  };

  const outputVector = useMemo(() => inputVector.map(functions[functionType]), [inputVector, functionType]);

  const viewBox = { minX: -5, maxX: 5, minY: -2, maxY: 5 };
  const width = 300;
  const height = 200;

  const toSvgX = (x: number) => (x - viewBox.minX) / (viewBox.maxX - viewBox.minX) * width;
  const toSvgY = (y: number) => height - (y - viewBox.minY) / (viewBox.maxY - viewBox.minY) * height;

  const pathData = useMemo(() => {
    let d = '';
    for (let i = 0; i <= width; i++) {
      const x = viewBox.minX + (i / width) * (viewBox.maxX - viewBox.minX);
      const y = functions[functionType](x);
      const svgX = toSvgX(x);
      const svgY = toSvgY(y);
      if (i === 0) {
        d += `M ${svgX} ${svgY}`;
      } else {
        d += ` L ${svgX} ${svgY}`;
      }
    }
    return d;
  }, [functionType, viewBox, width, height]);

  // Inline Styles
  const styles: { [key: string]: React.CSSProperties } = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' },
    title: { margin: '0 0 10px 0', fontSize: '1.2em', fontWeight: 'bold', textTransform: 'uppercase' },
    mainArea: { display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' },
    vectorGroup: { display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' },
    vectorLabel: { fontWeight: 'bold', color: '#6c757d' },
    vector: { display: 'flex', flexDirection: 'column', gap: '5px' },
    element: { width: '60px', padding: '5px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #ced4da', borderRadius: '4px', backgroundColor: '#fff', transition: 'all 0.3s ease', cursor: 'pointer' },
    highlight: { transform: 'scale(1.1)', borderColor: '#e63946', backgroundColor: 'rgba(230, 57, 70, 0.1)' },
    chartContainer: { position: 'relative', width: width, height: height, border: '1px solid #ccc', backgroundColor: 'white' },
    svg: { width: '100%', height: '100%' },
    axis: { stroke: '#adb5bd', strokeWidth: 1 },
    gridLine: { stroke: '#e9ecef', strokeWidth: 0.5 },
    path: { fill: 'none', stroke: '#007bff', strokeWidth: 2 },
    point: { transition: 'all 0.2s ease' },
  };

  const hoveredPoint = hoveredIndex !== null ? { x: inputVector[hoveredIndex], y: outputVector[hoveredIndex] } : null;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>{functionType} Activation</h3>
      <div style={styles.mainArea}>
        <div style={styles.vectorGroup}>
          <div style={styles.vectorLabel}>Input</div>
          <div style={styles.vector}>
            {inputVector.map((val, i) => (
              <div key={`in-${i}`} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} style={{ ...styles.element, ...(hoveredIndex === i ? styles.highlight : {}) }}>
                {formatNumber(val, 2)}
              </div>
            ))}
          </div>
        </div>
        <div style={styles.chartContainer}>
          <svg viewBox={`0 0 ${width} ${height}`} style={styles.svg}>
            <path d={`M 0 ${toSvgY(0)} L ${width} ${toSvgY(0)}`} style={styles.axis} />
            <path d={`M ${toSvgX(0)} 0 L ${toSvgX(0)} ${height}`} style={styles.axis} />
            <path d={pathData} style={styles.path} />
            {hoveredPoint && (
              <g>
                <line x1={toSvgX(hoveredPoint.x)} y1={toSvgY(0)} x2={toSvgX(hoveredPoint.x)} y2={toSvgY(hoveredPoint.y)} strokeDasharray="3 3" stroke="#e63946" />
                <line x1={toSvgX(0)} y1={toSvgY(hoveredPoint.y)} x2={toSvgX(hoveredPoint.x)} y2={toSvgY(hoveredPoint.y)} strokeDasharray="3 3" stroke="#e63946" />
                <circle cx={toSvgX(hoveredPoint.x)} cy={toSvgY(hoveredPoint.y)} r="4" fill="#e63946" style={styles.point} />
              </g>
            )}
          </svg>
        </div>
        <div style={styles.vectorGroup}>
          <div style={styles.vectorLabel}>Output</div>
          <div style={styles.vector}>
            {outputVector.map((val, i) => (
              <div key={`out-${i}`} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} style={{ ...styles.element, ...(hoveredIndex === i ? styles.highlight : {}) }}>
                {formatNumber(val, 2)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// END OF FILE: src/components/visualizers/ActivationFunctionVisualizer.tsx