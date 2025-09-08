// FILE: src/topics/attention-variants/lib/tracing.ts
import { TooltipState } from '../../../components/CalculationTooltip/types';
import { HighlightState, ElementIdentifier, AttentionData, HighlightSource, AttentionVariantData } from '../types';
import { getSymbolParts } from './symbolMapping';

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
        return headData[conceptualName as keyof typeof headData] as number[][] | undefined;
    }

    if (conceptualName === 'input') return data.input;
    if (conceptualName === 'wo') return data.Wo;
    if (conceptualName === 'combined') return variantData.CombinedOutput;
    if (conceptualName === 'output') return variantData.FinalOutput;

    if(parts[1]?.startsWith('w')) {
        const type = parts[1].charAt(1);
        const index = parseInt(parts[2] || '0', 10);
        if (type === 'q') return data.Wq[index];
        if (type === 'k') return data.Wk[index];
        if (type === 'v') return data.Wv[index];
    }

    return undefined;
};


export const generateTooltipData = (element: ElementIdentifier, data: AttentionData, sources: HighlightSource[]): TooltipState | null => {
    const { name, row, col } = element;
    let opType: TooltipState['opType'] = 'info';
    let steps: TooltipState['steps'] = [];

    const targetMatrix = getMatrixByName(name, data);
    if (!targetMatrix || targetMatrix[row]?.[col] === undefined) return null;
    const targetValue = targetMatrix[row][col];

    const conceptualName = name.split('.').pop() || '';

    if (conceptualName === 'output' || conceptualName === 'combined') {
        opType = 'matmul';
        const headOutputSources = sources.filter(s => s.name.includes('.Output'));
        const woSource = sources.find(s => s.name.endsWith('.wo'));

        if (headOutputSources.length > 0 && woSource) {
            const aSources = headOutputSources
                .sort((a, b) => parseInt(a.name.match(/heads\.(\d+)/)![1]) - parseInt(b.name.match(/heads\.(\d+)/)![1]))
                .map(source => {
                    const headIndex = parseInt(source.name.match(/heads\.(\d+)/)![1]);
                    const symbol = getSymbolParts(source.name);
                    symbol.subscript = headIndex.toString(); // Ensure subscript is correct
                    return {
                        data: getMatrixByName(source.name, data)![source.row],
                        symbolInfo: symbol
                    };
                });
            const bSources = [{
                data: getMatrixByName(woSource.name, data)!.map(r => r[woSource.col]),
                symbolInfo: getSymbolParts(woSource.name)
            }];
            const vecA = aSources.flatMap(s => s.data);
            const vecB = bSources[0].data;

            steps.push({
                a: vecA, b: vecB, op: '·', result: targetValue,
                aSources, bSources,
                aSymbolInfo: getSymbolParts(name),
                bSymbolInfo: getSymbolParts(woSource.name),
            });
        }
    } else if (['Q', 'K', 'V', 'Scores', 'Output'].includes(conceptualName)) {
        opType = 'matmul';
        const source1 = sources.find(s => s.highlightRow);
        const source2 = sources.find(s => s.highlightCol);
        if (source1 && source2) {
             const matrixA = getMatrixByName(source1.name, data);
             const matrixB = getMatrixByName(source2.name, data);
             if (matrixA && matrixB) {
                 const vecA = matrixA[source1.row];
                 const vecB = matrixB.map(r => r[source2.col]);
                 const aSources = [{ data: vecA, symbolInfo: getSymbolParts(source1.name) }];
                 const bSources = [{ data: vecB, symbolInfo: getSymbolParts(source2.name) }];
                 steps.push({
                     a: vecA, b: vecB, op: '·', result: targetValue,
                     aSources, bSources,
                     aSymbolInfo: getSymbolParts(source1.name),
                     bSymbolInfo: getSymbolParts(source2.name)
                 });
             }
        }
    } else if (conceptualName === 'Weights') {
        opType = 'softmax';
        const scoresName = sources.find(s => s.name.endsWith('.Scores'))?.name;
        if(scoresName){
            const matrixA = getMatrixByName(scoresName, data);
            if(matrixA) {
                const vecA = matrixA[row];
                steps.push({
                    a: vecA, b: [], op: 'softmax', result: targetValue,
                    aSymbolInfo: getSymbolParts(scoresName), bSymbolInfo: { base: '' },
                    aLabel: 'Scores', resultLabel: 'Weights'
                });
            }
        }
    }

    if (steps.length === 0) return null;

    const symbol = getSymbolParts(name);
    element.symbol = `${symbol.base}${symbol.subscript ? `_{${symbol.subscript}}` : ''}${symbol.superscript ? `^{${symbol.superscript}}` : ''}`;

    return { target: element, opType, steps, title: `Calculation for ${element.symbol}[${row},${col}]` };
};

export const createBackwardHighlight = (element: ElementIdentifier, data: AttentionData, dims: any): HighlightState => {
    const { variant, name, row, col, isInternal } = element;
    const sources: HighlightSource[] = [];

    if (variant === 'mla') {
        return { target: element, sources: [] };
    }

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
        sources.push({ ...element, variant, name: `${variant}.combined`, row: row, col: -1, highlightRow: true });
        sources.push({ ...element, variant, name: `${variant}.wo`, row: -1, col: col, highlightCol: true });
    }
    else if (conceptualName === 'combined') {
        const d_head = data.mha.heads[0].Output[0].length;
        const headIndexForCol = Math.floor(col / d_head);
        sources.push({ ...element, name: `${variant}.heads.${headIndexForCol}.Output`, row: row, col: col % d_head });
    }
    else if (conceptualName === 'Output') {
        sources.push({ ...element, name: `${variant}.heads.${headIndex}.Weights`, row: row, col: -1, highlightRow: true });
        sources.push({ ...element, name: `${variant}.heads.${headIndex}.V`, row: -1, col: col, highlightCol: true });
    }
    else if (conceptualName === 'Weights') {
        sources.push({ ...element, name: `${variant}.heads.${headIndex}.Scores`, row: row, col: -1, highlightRow: true });
    }
    else if (conceptualName === 'Scores') {
        sources.push({ ...element, name: `${variant}.heads.${headIndex}.Q`, row: row, col: -1, highlightRow: true });
        sources.push({ ...element, name: `${variant}.heads.${headIndex}.K`, row: col, col: -1, highlightRow: true });
    }
    else if (['Q', 'K', 'V'].includes(conceptualName)) {
        const type = conceptualName.toLowerCase() as 'q' | 'k' | 'v';
        let weightIndex = 0;
        const q_heads_per_kv = dims.n_q_heads / dims.n_kv_heads;

        if (type === 'q') {
            weightIndex = headIndex;
        } else { // K or V
            if (variant === 'mha') weightIndex = headIndex;
            else if (variant === 'gqa') weightIndex = Math.floor(headIndex / q_heads_per_kv);
            // MQA always uses index 0
        }

        sources.push({ ...element, name: `${variant}.input`, row: row, col: -1, highlightRow: true });
        sources.push({ ...element, name: `${variant}.w${type}.${weightIndex}`, row: -1, col: col, highlightCol: true });
    }

    return { target: element, sources };
};
// END OF FILE: src/topics/attention-variants/lib/tracing.ts