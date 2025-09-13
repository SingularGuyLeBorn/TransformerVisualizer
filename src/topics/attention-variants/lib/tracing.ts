// FILE: src/topics/attention-variants/lib/tracing.ts
import { TooltipState } from '../../../components/CalculationTooltip/types';
import { HighlightState, ElementIdentifier, AttentionData, HighlightSource, AttentionVariantData } from '../types';
import { getSymbolParts } from './symbolMapping';

const getMatrixByName = (name: string, data: AttentionData): number[][] | undefined => {
    const parts = name.split('.');
    if (parts.length === 0) return undefined;

    const variant = parts[0] as 'mha' | 'mqa' | 'gqa' | 'mla';
    const component = parts[1];
    const conceptualName = parts[parts.length - 1];

    const headIndexMatch = name.match(/heads\.(\d+)/);
    const headIndex = headIndexMatch ? parseInt(headIndexMatch[1], 10) : 0;

    if (name === `${variant}.input`) return data.input;

    // Handle MLA-specific matrices first
    if(variant === 'mla') {
        const mlaData = data.mla;
        if(name === 'mla.C_q_prime') return mlaData.C_q_prime;
        if(name === 'mla.C_kv') return mlaData.C_kv;
        if(name === 'mla.K_rope') return mlaData.K_rope;
        if(name === 'mla.Wc') return data.Wc;
        if(name === 'mla.Wc_prime') return data.Wc_prime;
        if(name === 'mla.W_k_rope') return data.W_k_rope;
        if(component === 'W_q_rope') return data.W_q_rope[headIndex];
        if(component === 'W_v_mla') return data.W_v_mla[headIndex];
        if(name === 'mla.output') return mlaData.FinalOutput;
        if(name === 'mla.combined') return mlaData.CombinedOutput;
        if(name === 'mla.wo') return data.Wo; // Assume shared Wo for simplicity for now
        if (component === 'heads') {
            const headData = mlaData.heads[headIndex];
            if (!headData) return undefined;
            return headData[conceptualName as keyof typeof headData] as number[][] | undefined;
        }
    }

    if (variant !== 'mha' && variant !== 'gqa' && variant !== 'mqa') return undefined;
    const variantData = data[variant] as AttentionVariantData;
    if (!variantData) return undefined;

    if (component === 'heads') {
        const headData = variantData.heads[headIndex];
        if (!headData) return undefined;
        return headData[conceptualName as keyof typeof headData] as number[][] | undefined;
    }

    if (conceptualName === 'wo') return data.Wo;
    if (conceptualName === 'combined') return variantData.CombinedOutput;
    if (conceptualName === 'output') return variantData.FinalOutput;

    if(component?.startsWith('w')) {
        const type = component.charAt(1);
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

    if (['output', 'combined', 'Q', 'K', 'V', 'Scores', 'Output', 'C_q_prime', 'C_kv', 'K_rope'].includes(conceptualName)) {
        opType = 'matmul';
        const sourceRow = sources.find(s => s.highlightRow);
        const sourceCol = sources.find(s => s.highlightCol);

        if (sourceRow && sourceCol) {
            const matrixA = getMatrixByName(sourceRow.name, data);
            const matrixB = getMatrixByName(sourceCol.name, data);

            if (matrixA && matrixB) {
                const vecA = matrixA[sourceRow.row];
                const vecB = matrixB.map(r => r[sourceCol.col]);

                let aSources, bSources;

                // Handle 'combined' output by splitting the source row vector
                if (sourceRow.name.endsWith('.combined')) {
                    const numHeads = data[element.variant].heads.length;
                    const d_head = matrixA[0].length / numHeads;
                    aSources = [];
                    for (let i = 0; i < numHeads; i++) {
                        const headOutputName = `${element.variant}.heads.${i}.Output`;
                        aSources.push({
                            data: vecA.slice(i * d_head, (i + 1) * d_head),
                            symbolInfo: getSymbolParts(headOutputName)
                        });
                    }
                } else {
                    aSources = [{ data: vecA, symbolInfo: getSymbolParts(sourceRow.name) }];
                }

                bSources = [{ data: vecB, symbolInfo: getSymbolParts(sourceCol.name) }];

                steps.push({
                    a: vecA, b: vecB, op: '·', result: targetValue,
                    aSources, bSources,
                    aSymbolInfo: getSymbolParts(sourceRow.name),
                    bSymbolInfo: getSymbolParts(sourceCol.name)
                });
            }
        }
    } else if (conceptualName === 'Weights') {
        opType = 'softmax';
        const scoresSource = sources.find(s => s.name.endsWith('.Scores'));
        if(scoresSource){
            const matrixA = getMatrixByName(scoresSource.name, data);
            if(matrixA) {
                const vecA = matrixA[row];
                steps.push({
                    a: vecA, b: [], op: 'softmax', result: targetValue,
                    aSymbolInfo: getSymbolParts(scoresSource.name), bSymbolInfo: { base: '' },
                    aLabel: 'Scores', resultLabel: 'Weights'
                });
            }
        }
    }

    if (steps.length === 0) {
        opType = 'info';
        steps.push({
            a: [], b: [], op: '', result: targetValue,
            aSymbolInfo: {base: 'Info'}, bSymbolInfo: {base: ''},
            title: 'This value is a direct weight or was generated by a complex operation not yet visualizable (e.g., MLA Q/K/V reconstruction).'
        });
    }

    const symbol = getSymbolParts(name);
    element.symbol = `${symbol.base}${symbol.subscript ? `_{${symbol.subscript}}` : ''}${symbol.superscript ? `^{${symbol.superscript}}` : ''}`;

    return { target: element, opType, steps, title: `Calculation for ${element.symbol}[${row},${col}]` };
};

export const createBackwardHighlight = (element: ElementIdentifier, data: AttentionData, dims: any): HighlightState => {
    const { variant, name, row, col, isInternal } = element;
    const sources: HighlightSource[] = [];

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
        return { target: element, sources: sources, activeComponent: null };
    }

    if(variant === 'mla') {
        if(conceptualName === 'output') { sources.push({ variant, name: 'mla.combined', row, col: -1, highlightRow: true}); sources.push({ variant, name: 'mla.wo', row: -1, col, highlightCol: true}); }
        else if (conceptualName === 'combined') { const headIdx = Math.floor(col / dims.d_head); sources.push({variant, name: `mla.heads.${headIdx}.Output`, row, col: col % dims.d_head});}
        else if (conceptualName === 'Output') { sources.push({variant, name: `mla.heads.${headIndex}.Weights`, row, col: -1, highlightRow: true}); sources.push({variant, name: `mla.heads.${headIndex}.V`, row: -1, col, highlightCol: true});}
        else if (conceptualName === 'Weights') { sources.push({variant, name: `mla.heads.${headIndex}.Scores`, row, col: -1, highlightRow: true});}
        else if (conceptualName === 'Scores') { sources.push({variant, name: `mla.heads.${headIndex}.Q`, row, col: -1, highlightRow: true}); sources.push({variant, name: `mla.heads.${headIndex}.K`, row: col, col: -1, highlightRow: true});}
        else if (conceptualName === 'Q') { sources.push({variant, name: 'mla.C_q_prime', row, col: -1, highlightRow: true}); /* TODO: Trace to Wq_c and Wq_r */}
        else if (conceptualName === 'K') { sources.push({variant, name: 'mla.C_kv', row, col: -1, highlightRow: true}); sources.push({variant, name: 'mla.K_rope', row, col: -1, highlightRow: true}); /* TODO: Trace to Wk_c and Wk_r */}
        else if (conceptualName === 'V') { sources.push({variant, name: 'mla.C_kv', row, col: -1, highlightRow: true}); sources.push({variant, name: `mla.W_v_mla.${headIndex}`, row: -1, col, highlightCol: true});}
        else if (conceptualName === 'C_q_prime') { sources.push({variant, name: 'mla.input', row, col: -1, highlightRow: true}); sources.push({variant, name: 'mla.Wc_prime', row: -1, col, highlightCol: true});}
        else if (conceptualName === 'C_kv') { sources.push({variant, name: 'mla.input', row, col: -1, highlightRow: true}); sources.push({variant, name: 'mla.Wc', row: -1, col, highlightCol: true});}
        else if (conceptualName === 'K_rope') { sources.push({variant, name: 'mla.input', row, col: -1, highlightRow: true}); sources.push({variant, name: 'mla.W_k_rope', row: -1, col, highlightCol: true});}
    } else {
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
            sources.push({ ...element, name: `${variant}.heads.${headIndex}.K`, row: col, col: -1, highlightRow: true }); // [FIXED] K's row is the target's col
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
            }

            sources.push({ ...element, name: `${variant}.input`, row: row, col: -1, highlightRow: true });
            sources.push({ ...element, name: `${variant}.w${type}.${weightIndex}`, row: -1, col: col, highlightCol: true });
        }
    }

    return { target: element, sources };
};
// END OF FILE: src/topics/attention-variants/lib/tracing.ts