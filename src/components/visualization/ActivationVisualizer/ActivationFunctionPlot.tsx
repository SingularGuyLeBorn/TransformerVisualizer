// FILE: src/components/visualization/ActivationVisualizer/ActivationFunctionPlot.tsx
import React from 'react';
import { ActivationFunctionType } from '../types';

interface ActivationFunctionPlotProps {
    functionType: ActivationFunctionType;
    activeInput: number | null;
    activeOutput: number | null;
    width?: number;
    height?: number;
}

const functions: Record<ActivationFunctionType, (x: number) => number> = {
    relu: (x: number) => Math.max(0, x),
    gelu: (x: number) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3)))),
    silu: (x: number) => x / (1 + Math.exp(-x)),
    swiglu: (x: number) => (x / (1 + Math.exp(-x))) * x, // Simplified for visualization
};

export const ActivationFunctionPlot: React.FC<ActivationFunctionPlotProps> = ({
                                                                                  functionType,
                                                                                  activeInput,
                                                                                  activeOutput,
                                                                                  width = 250,
                                                                                  height = 150,
                                                                              }) => {
    const xRange = [-4, 4];
    const yRange = [-1, 4];

    const toSvgX = (x: number) => ((x - xRange[0]) / (xRange[1] - xRange[0])) * width;
    const toSvgY = (y: number) => height - ((y - yRange[0]) / (yRange[1] - yRange[0])) * height;

    const func = functions[functionType];
    const points = [];
    for (let i = 0; i <= width; i++) {
        const x = xRange[0] + (i / width) * (xRange[1] - xRange[0]);
        const y = func(x);
        if (y >= yRange[0] && y <= yRange[1]) {
            points.push(`${toSvgX(x)},${toSvgY(y)}`);
        }
    }
    const pathData = "M " + points.join(" L ");
    const zeroY = toSvgY(0);
    const zeroX = toSvgX(0);

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ border: '1px solid #ccc', backgroundColor: 'white' }}>
            {/* Axes */}
            <line x1="0" y1={zeroY} x2={width} y2={zeroY} stroke="#ddd" strokeWidth="1" />
            <line x1={zeroX} y1="0" x2={zeroX} y2={height} stroke="#ddd" strokeWidth="1" />

            {/* Function path */}
            <path d={pathData} fill="none" stroke="#4a90e2" strokeWidth="2" />

            {/* Active point */}
            {activeInput !== null && activeOutput !== null && (
                <g>
                    <line
                        x1={toSvgX(activeInput)} y1={zeroY}
                        x2={toSvgX(activeInput)} y2={toSvgY(activeOutput)}
                        stroke="#f5a623" strokeWidth="1.5" strokeDasharray="3 3"
                    />
                    <line
                        x1={zeroX} y1={toSvgY(activeOutput)}
                        x2={toSvgX(activeInput)} y2={toSvgY(activeOutput)}
                        stroke="#f5a623" strokeWidth="1.5" strokeDasharray="3 3"
                    />
                    <circle cx={toSvgX(activeInput)} cy={toSvgY(activeOutput)} r="4" fill="#e63946" />
                </g>
            )}
        </svg>
    );
};
// END OF FILE: src/components/visualization/ActivationVisualizer/ActivationFunctionPlot.tsx