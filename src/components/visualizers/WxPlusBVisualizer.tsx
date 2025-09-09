// FILE: src/components/visualizers/WxPlusBVisualizer.tsx
import React, { useMemo, useState, useEffect } from 'react';
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

    const bias = biasVector.data[0];
    const matmulResult = useMemo(() =>
            sourceVectorsA.map(v => v.data).flat().reduce((sum, val, i) => sum + val * sourceVectorB.data[i], 0),
        [sourceVectorsA, sourceVectorB]
    );
    const finalResult = matmulResult + bias;

    const [phase, setPhase] = useState<'matmul' | 'add-bias'>('matmul');

    const styles: { [key: string]: React.CSSProperties } = {
        container: { display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', overflow: 'hidden' },
        phaseContainer: { flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
        phaseTitle: { fontSize: '1.2em', fontWeight: 'bold', color: '#343a40', padding: '10px 15px', borderBottom: '2px solid #e9ecef', backgroundColor: '#f8f9fa', flexShrink: 0, textAlign: 'center' },
        matmulWrapper: { flexGrow: 1, overflow: 'auto' },
        biasAddSection: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px', flexGrow: 1, padding: '20px', boxSizing: 'border-box' },
        biasRow: { display: 'flex', alignItems: 'center', gap: '20px', fontSize: '1.5em', fontWeight: 'bold' },
        biasElement: { padding: '10px 20px', borderRadius: '8px', border: '2px solid #ced4da', backgroundColor: '#fff', fontFamily: 'monospace', transition: 'all 0.3s ease' },
        highlightSource: { borderColor: '#4a90e2', backgroundColor: 'rgba(74, 144, 226, 0.1)', transform: 'scale(1.1)' },
        highlightResult: { borderColor: '#28a745', backgroundColor: 'rgba(40, 167, 69, 0.1)', transform: 'scale(1.1)' },
    };

    // This is a simplified animation for the bias addition phase
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (phase === 'add-bias') {
            const el = document.getElementById('final-result-box');
            if (el) el.style.opacity = '0';
            timer = setTimeout(() => {
                if(el) el.style.opacity = '1';
            }, 300);
        }
        return () => clearTimeout(timer);
    }, [phase]);

    return (
        <div style={styles.container}>
            {phase === 'matmul' && (
                <div style={styles.phaseContainer}>
                    <div style={styles.phaseTitle}>Phase 1: Dot Product (W·x)</div>
                    <div style={styles.matmulWrapper}>
                        <InteractiveMatMulVisualizer
                            sourceVectorsA={sourceVectorsA}
                            sourceVectorB={sourceVectorB}
                            resultSymbolInfo={{base: 'W·x'}}
                        />
                    </div>
                    <button
                        onClick={() => setPhase('add-bias')}
                        style={{ padding: '10px', fontSize: '1em', cursor: 'pointer', border: 'none', backgroundColor: '#007bff', color: 'white', flexShrink: 0 }}
                    >
                        Continue to Phase 2: Add Bias
                    </button>
                </div>
            )}

            {phase === 'add-bias' && (
                <div style={styles.phaseContainer}>
                    <div style={styles.phaseTitle}>Phase 2: Add Bias (+b)</div>
                    <div style={styles.biasAddSection}>
                        <div style={styles.biasRow}>
                            <div style={{...styles.biasElement, ...styles.highlightSource}}>
                                {formatNumber(matmulResult, 4)}
                            </div>
                            <span>+</span>
                            <div style={{...styles.biasElement, ...styles.highlightSource}}>
                                {formatNumber(bias, 4)}
                            </div>
                            <span>=</span>
                            <div id="final-result-box" style={{...styles.biasElement, ...styles.highlightResult, opacity: 0, transition: 'opacity 0.5s ease'}}>
                                {formatNumber(finalResult, 4)}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setPhase('matmul')}
                        style={{ padding: '10px', fontSize: '1em', cursor: 'pointer', border: 'none', backgroundColor: '#6c757d', color: 'white', flexShrink: 0 }}
                    >
                        Back to Phase 1: Dot Product
                    </button>
                </div>
            )}
        </div>
    );
};
// END OF FILE: src/components/visualizers/WxPlusBVisualizer.tsx