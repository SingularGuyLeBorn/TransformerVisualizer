// FILE: src/topics/attention-variants/AttentionVariantsTopic.tsx
import React, { useState, useCallback } from 'react';
import './AttentionVariantsTopic.css';
import { Controls } from './components/Controls';
import { Viz } from './components/Viz';
import { Explanation } from './components/Explanation';
import { CalculationTooltip } from './components/CalculationTooltip';
import { useAttention } from './hooks/useAttention';
import { useSplitPane } from '../../hooks/useSplitPane';
import { HighlightState, ElementIdentifier, AttentionData, HighlightSource, TooltipState, CalculationComponent, AttentionVariantData } from './types';
import { getSymbolParts } from './lib/symbolMapping';

// =======================
//   TOOLTIP LOGIC
// =======================
const getMatrixByName = (name: string, data: AttentionData): number[][] | undefined => {
    const parts = name.split('.');
    if (parts.length < 2) return undefined;

    const variant = parts[0] as keyof AttentionData;
    const conceptualName = name.split('.').pop() || '';

    if (variant !== 'mha' && variant !== 'gqa' && variant !== 'mqa') return undefined;

    const variantData = data[variant] as AttentionVariantData;
    if (!variantData) return undefined;

    const headIndexMatch = name.match(/heads\.(\d+)/);
    const headIndex = headIndexMatch ? parseInt(headIndexMatch[1], 10) : 0;

    if (name.includes('.heads.')) {
        const headData = variantData.heads[headIndex];
        if (!headData) return undefined;
        // This is a type assertion, be careful with it.
        return headData[conceptualName as keyof typeof headData] as number[][] | undefined;
    }

    if (conceptualName === 'input') return data.input;
    if (conceptualName === 'wo') return data.Wo;
    if (conceptualName === 'combined') return variantData.CombinedOutput;
    if (conceptualName === 'output') return variantData.FinalOutput;

    // For weights like mha.wq.0
    if(parts[1]?.startsWith('w')) {
        const type = parts[1].charAt(1); // q, k, v
        const index = parseInt(parts[2] || '0', 10);
        if (type === 'q') return data.Wq[index];
        if (type === 'k') return data.Wk[index];
        if (type === 'v') return data.Wv[index];
    }


    return undefined;
};


const generateTooltipData = (element: ElementIdentifier, data: AttentionData, sources: HighlightSource[]): TooltipState | null => {
    const { name, row, col } = element;
    let opType: TooltipState['opType'] = 'info';
    let steps: TooltipState['steps'] = [];

    const targetMatrix = getMatrixByName(name, data);
    if (!targetMatrix || targetMatrix[row]?.[col] === undefined) return null;
    const targetValue = targetMatrix[row][col];

    const conceptualName = name.split('.').pop() || '';

    if (['Q', 'K', 'V', 'Scores', 'Output', 'combined', 'output'].includes(conceptualName)) {
        opType = 'matmul';
        const source1 = sources.find(s => s.highlightRow);
        const source2 = sources.find(s => s.highlightCol);
        if (source1 && source2) {
             const matrixA = getMatrixByName(source1.name, data);
             const matrixB = getMatrixByName(source2.name, data);
             if (matrixA && matrixB) {
                 const vecA = matrixA[source1.row];
                 const vecB = matrixB.map(r => r[source2.col]);
                 const components: CalculationComponent[] = vecA.map((val, i) => ({ a: val, b: vecB[i] }));
                 steps.push({ a: vecA, b: vecB, op: '·', result: targetValue, aSymbol: getSymbolParts(source1.name).base, bSymbol: getSymbolParts(source2.name).base, components });
             }
        }
    } else if (conceptualName === 'Weights' && element.isInternal) {
        opType = 'softmax';
        const scoresName = sources.find(s => s.name.endsWith('.Scores'))?.name;
        if(scoresName){
            const matrixA = getMatrixByName(scoresName, data);
            if(matrixA) {
                const vecA = matrixA[row];
                steps.push({a: vecA, b: [], op: 'softmax', result: targetValue, aSymbol: getSymbolParts(scoresName).base, bSymbol: ''});
            }
        }
    }

    if (steps.length === 0) return null;

    const symbol = getSymbolParts(name);
    element.symbol = `${symbol.base}${symbol.subscript ? `_{${symbol.subscript}}` : ''}${symbol.superscript ? `^{${symbol.superscript}}` : ''}`;

    return { target: element, opType, steps, title: `Calculation for ${element.symbol}[${row},${col}]` };
};

// =======================
//   HIGHLIGHTING LOGIC
// =======================
const createBackwardHighlight = (element: ElementIdentifier, data: AttentionData, dims: any): HighlightState => {
    const { variant, name, row, col, isInternal } = element;
    const sources: HighlightSource[] = [];

    if (variant === 'mla') {
        return { target: element, sources: [] };
    }

    const internalDims = {
        d_head: data.mha.heads[0].Q[0].length,
        n_q_heads: data.gqa.heads.length,
        n_kv_heads_gqa: data.gqa.K_proj ? (data.gqa.K_proj[0].length / data.mha.heads[0].Q[0].length) : dims.n_kv_heads,
    };

    const conceptualName = name.split('.').pop() || '';
    const headIndexMatch = name.match(/heads\.(\d+)/);
    const headIndex = headIndexMatch ? parseInt(headIndexMatch[1], 10) : 0;

    if (isInternal) {
        const baseName = name.replace('.internal', '');
        const baseElementName = `${baseName.split('.')[0]}.heads.${headIndex}.Scores`;
        if (col === -1) {
             sources.push({ ...element, name: baseElementName, row: row, col: -1, highlightRow: true, isInternal: true });
        } else {
             sources.push({ ...element, name: `${baseName.split('.')[0]}.heads.${headIndex}.Scores`, row: row, col: col, isInternal: true });
        }
        return { target: element, sources };
    }


    if (conceptualName === 'output') {
        sources.push({ ...element, name: `${variant}.combined`, row: row, col: -1, highlightRow: true });
        sources.push({ ...element, name: `${variant}.wo`, row: -1, col: col, highlightCol: true });
    }
    else if (conceptualName === 'combined') {
        const headIndexForCol = Math.floor(col / internalDims.d_head);
        sources.push({ ...element, name: `${variant}.heads.${headIndexForCol}.Output`, row: row, col: col % internalDims.d_head });
    }
    else if (conceptualName === 'Output') {
        sources.push({ ...element, name: `${variant}.heads.${headIndex}.Weights`, row: row, col: -1, highlightRow: true });
        sources.push({ ...element, name: `${variant}.heads.${headIndex}.V`, row: -1, col: col, highlightCol: true });
    }
    else if (conceptualName === 'Weights') {
        sources.push({ ...element, name: `${variant}.heads.${headIndex}.Scores`, row: row, col: -1, highlightRow: true });
        sources.push({ ...element, name: `${name}.internal`, row: row, col: col, isInternal: true });
    }
    else if (conceptualName === 'Scores') {
        sources.push({ ...element, name: `${variant}.heads.${headIndex}.Q`, row: row, col: -1, highlightRow: true });
        sources.push({ ...element, name: `${variant}.heads.${headIndex}.K`, row: col, col: -1, highlightRow: true });
    }
    else if (['Q', 'K', 'V'].includes(conceptualName)) {
        const type = conceptualName.toLowerCase() as 'q' | 'k' | 'v';
        let weightIndex = 0;

        if (type === 'q') {
            weightIndex = headIndex;
        } else {
            if (variant === 'mha') {
                weightIndex = headIndex;
            } else if (variant === 'gqa') {
                const q_heads_per_kv_gqa = internalDims.n_q_heads / internalDims.n_kv_heads_gqa;
                weightIndex = Math.floor(headIndex / q_heads_per_kv_gqa);
            }
        }

        sources.push({ ...element, name: `${variant}.input`, row: row, col: -1, highlightRow: true });
        sources.push({ ...element, name: `${variant}.w${type}.${weightIndex}`, row: -1, col: col, highlightCol: true });
    }

    return { target: element, sources };
};


export const AttentionVariantsTopic: React.FC = () => {
    const [dims, setDims] = useState({
        seq_len: 4,
        d_model: 16,
        n_q_heads: 4,
        n_kv_heads: 2,
        d_head: 4,
    });

    const [highlight, setHighlight] = useState<HighlightState>({ target: null, sources: [] });
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);

    const { primarySize, separatorProps, containerProps } = useSplitPane(window.innerWidth * 0.55);

    const attentionData: AttentionData | null = useAttention(dims);

    const handleInteraction = useCallback((element: ElementIdentifier, event: React.MouseEvent) => {
        if (!attentionData) return;
        const newHighlight = createBackwardHighlight(element, attentionData, dims);
        setHighlight(newHighlight);

        const newTooltip = generateTooltipData(element, attentionData, newHighlight.sources);
        setTooltip(newTooltip);

    }, [attentionData, dims]);

    const closeTooltip = useCallback(() => setTooltip(null), []);

    if (!attentionData) {
        return <div style={{ padding: "20px", textAlign: "center" }}>正在加载或维度设置无效... (确保 d_model = n_q_heads * d_head 且 n_q_heads 能被 n_kv_heads 整除)</div>;
    }

    return (
        <div className="main-layout" {...containerProps}>
            {tooltip && <CalculationTooltip tooltip={tooltip} onClose={closeTooltip} />}
            <Controls dims={dims} setDims={setDims} />
            <div className="column left-column" style={{width: primarySize, flex: 'none'}}>
                <div className="column-content">
                    <h2>数值模拟</h2>
                    <Viz data={attentionData} dims={dims} highlight={highlight} onElementClick={handleInteraction} />
                </div>
            </div>
             <div className="split-pane-separator" {...separatorProps} />
            <div className="column right-column" style={{flex: 1}}>
                <div className="column-content">
                    <h2>理论推导</h2>
                    <Explanation dims={dims} highlight={highlight} onSymbolClick={handleInteraction} />
                </div>
            </div>
        </div>
    );
};
// END OF FILE: src/topics/attention-variants/AttentionVariantsTopic.tsx