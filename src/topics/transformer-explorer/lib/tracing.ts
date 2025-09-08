// FILE: src/topics/transformer-explorer/lib/tracing.ts

import { ElementIdentifier, HighlightSource, HighlightState, TransformerData, Matrix, CalculationComponent, Vector } from '../types';
import { TooltipState } from '../../../components/CalculationTooltip/types';
import { MATRIX_NAMES } from '../config/matrixNames';
import { getSymbolParts } from '../config/symbolMapping';


// ============================================================================
// Helper functions for tracing logic
// ============================================================================

const getLayerAndHeadIndices = (name: string): [number, number] => {
    const layerIdxMatch = name.match(/\.(encoder|decoder)\.(\d+)/);
    const layerIdx = layerIdxMatch ? parseInt(layerIdxMatch[2], 10) : 0;
    const headIdxMatch = name.match(/\.h(\d+)\./);
    const headIdx = headIdxMatch ? parseInt(headIdxMatch[1], 10) : 0;
    return [layerIdx, headIdx];
};

const getMatrixByName = (name: string, data: TransformerData, l: number, h: number): Matrix | undefined => {
    const LNe = MATRIX_NAMES.layer(l);
    const HNe = MATRIX_NAMES.head(l, h);
    const LNd = MATRIX_NAMES.decoderLayer(l);
    const HNd_masked = MATRIX_NAMES.maskedMhaHead(l, h);
    const HNd_encdec = MATRIX_NAMES.encDecMhaHead(l, h);

    if (name === MATRIX_NAMES.inputEmbeddings) return data.inputEmbeddings;
    if (name === MATRIX_NAMES.posEncodings) return data.posEncodings;
    if (name === MATRIX_NAMES.outputEmbeddings) return data.outputEmbeddings;
    if (name === MATRIX_NAMES.decoderPosEncodings) return data.decoderPosEncodings;
    if (name === MATRIX_NAMES.finalEncoderOutput) return data.finalEncoderOutput;
    if (name === MATRIX_NAMES.logits) return data.logits;
    if (name === MATRIX_NAMES.outputProbabilities) return data.outputProbabilities;
    if (name === MATRIX_NAMES.finalLinear) return data.finalLinear;
    if (name === "embeddingMatrix") return data.embeddingMatrix;


    const encLayer = data.encoderLayers[l];
    if (encLayer) {
        if (name === LNe.encoder_input) return encLayer.encoder_input;
        if (name === LNe.mha_output) return encLayer.mha_output;
        if (name === LNe.Wo) return encLayer.mha.Wo;
        if (name === LNe.add_norm_1_output) return encLayer.add_norm_1_output;
        if (name === LNe.ffn_output) return encLayer.ffn_output;
        if (name === LNe.add_norm_2_output) return encLayer.add_norm_2_output;
        if (name === LNe.Intermediate) return encLayer.ffn.Intermediate;
        if (name === LNe.Activated) return encLayer.ffn.Activated;
        if (name === LNe.W1) return encLayer.ffn.W1;
        if (name === LNe.b1) return [encLayer.ffn.b1];
        if (name === LNe.W2) return encLayer.ffn.W2;
        if (name === LNe.b2) return [encLayer.ffn.b2];
        const encHead = encLayer.mha.heads[h];
        if (encHead) {
            if (name === HNe.Wq) return encHead.Wq;
            if (name === HNe.Wk) return encHead.Wk;
            if (name === HNe.Wv) return encHead.Wv;
            if (name === HNe.Q) return encHead.Q;
            if (name === HNe.K) return encHead.K;
            if (name === HNe.V) return encHead.V;
            if (name === HNe.Scores) return encHead.Scores;
            if (name === HNe.ScaledScores) return encHead.ScaledScores;
            if (name === HNe.AttentionWeights) return encHead.AttentionWeights;
            if (name === HNe.HeadOutput) return encHead.HeadOutput;
        }
    }

    const decLayer = data.decoderLayers[l];
    if (decLayer) {
        if (name === LNd.decoder_input) return decLayer.decoder_input;
        if (name === LNd.masked_mha_output) return decLayer.masked_mha.output;
        if (name === LNd.Wo_masked) return decLayer.masked_mha.Wo;
        if (name === LNd.add_norm_1_output) return decLayer.add_norm_1_output;
        if (name === LNd.enc_dec_mha_output) return decLayer.enc_dec_mha.output;
        if (name === LNd.Wo_enc_dec) return decLayer.enc_dec_mha.Wo;
        if (name === LNd.add_norm_2_output) return decLayer.add_norm_2_output;
        if (name === LNd.ffn_output) return decLayer.ffn_output;
        if (name === LNd.add_norm_3_output) return decLayer.add_norm_3_output;
        if (name === LNd.Intermediate) return decLayer.ffn.Intermediate;
        if (name === LNd.Activated) return decLayer.ffn.Activated;
        if (name === LNd.W1) return decLayer.ffn.W1;
        if (name === LNd.b1) return [decLayer.ffn.b1];
        if (name === LNd.W2) return decLayer.ffn.W2;
        if (name === LNd.b2) return [decLayer.ffn.b2];
        const maskedMhaHead = decLayer.masked_mha.heads[h];
        if (maskedMhaHead) {
            if (name === HNd_masked.Wq) return maskedMhaHead.Wq;
            if (name === HNd_masked.Wk) return maskedMhaHead.Wk;
            if (name === HNd_masked.Wv) return maskedMhaHead.Wv;
            if (name === HNd_masked.Q) return maskedMhaHead.Q;
            if (name === HNd_masked.K) return maskedMhaHead.K;
            if (name === HNd_masked.V) return maskedMhaHead.V;
            if (name === HNd_masked.Scores) return maskedMhaHead.Scores;
            if (name === HNd_masked.ScaledScores) return maskedMhaHead.ScaledScores;
            if (name === HNd_masked.AttentionWeights) return maskedMhaHead.AttentionWeights;
            if (name === HNd_masked.HeadOutput) return maskedMhaHead.HeadOutput;
        }
        const encDecMhaHead = decLayer.enc_dec_mha.heads[h];
        if (encDecMhaHead) {
            if (name === HNd_encdec.Wq) return encDecMhaHead.Wq;
            if (name === HNd_encdec.Wk) return encDecMhaHead.Wk;
            if (name === HNd_encdec.Wv) return encDecMhaHead.Wv;
            if (name === HNd_encdec.Q) return encDecMhaHead.Q;
            if (name === HNd_encdec.K) return encDecMhaHead.K;
            if (name === HNd_encdec.V) return encDecMhaHead.V;
            if (name === HNd_encdec.Scores) return encDecMhaHead.Scores;
            if (name === HNd_encdec.ScaledScores) return encDecMhaHead.ScaledScores;
            if (name === HNd_encdec.AttentionWeights) return encDecMhaHead.AttentionWeights;
            if (name === HNd_encdec.HeadOutput) return encDecMhaHead.HeadOutput;
        }
    }
    return undefined;
};

export const generateTooltipData = (element: ElementIdentifier, transformerData: TransformerData, sources: HighlightSource[]): TooltipState | null => {
    const { name, row, col } = element;
    const [layerIdx, headIdx] = getLayerAndHeadIndices(name);
    let opType: TooltipState['opType'] = 'info';
    let steps: TooltipState['steps'] = [];

    const conceptualName = name.split('.').pop() || '';
    const targetMatrix = getMatrixByName(name, transformerData, layerIdx, headIdx);
    const targetValue = targetMatrix?.[row]?.[col] ?? 0;

    const matmulSourceRow = sources.find(s => s.highlightRow && !s.highlightCol);
    const matmulSourceCol = sources.find(s => s.highlightCol && !s.highlightRow);
    const addSources = sources.filter(s => !s.highlightRow && !s.highlightCol && !s.isInternal);

    // MHA Concat + Final Projection
    if (['mha_output', 'masked_mha_output', 'enc_dec_mha_output'].includes(conceptualName)) {
        opType = 'matmul';
        const headOutputSources = sources.filter(s => s.name.includes('.HeadOutput'));
        const woSource = sources.find(s => s.highlightCol);
        if (headOutputSources.length > 0 && woSource) {
            const aSources = headOutputSources.sort((a,b) => getLayerAndHeadIndices(a.name)[1] - getLayerAndHeadIndices(b.name)[1])
              .map(source => {
                const [l, h] = getLayerAndHeadIndices(source.name);
                return {
                    data: getMatrixByName(source.name, transformerData, l, h)![source.row],
                    symbolInfo: getSymbolParts(source.name)
                };
            });
            const [l, h] = getLayerAndHeadIndices(woSource.name);
            const bSources = [{
                data: getMatrixByName(woSource.name, transformerData, l, h)!.map(r => r[woSource.col]),
                symbolInfo: getSymbolParts(woSource.name)
            }];
            steps.push({ a: [], b: [], op: '·', result: targetValue, aSources, bSources, aSymbolInfo: getSymbolParts(""), bSymbolInfo: getSymbolParts("") });
        }
    // Wx+b (FFN)
    } else if (['Intermediate', 'ffn_output'].includes(conceptualName)) {
        opType = 'matmul'; // Treat as a multi-step matmul in the visualizer
        const matmulMatrixA = getMatrixByName(matmulSourceRow!.name, transformerData, layerIdx, headIdx)!;
        const matmulMatrixB = getMatrixByName(matmulSourceCol!.name, transformerData, layerIdx, headIdx)!;
        const biasSource = addSources[0];
        const biasMatrix = getMatrixByName(biasSource.name, transformerData, layerIdx, headIdx)!;

        const aSources = [{ data: matmulMatrixA[row], symbolInfo: getSymbolParts(matmulSourceRow!.name) }];
        const bSources = [{ data: matmulMatrixB.map(r => r[col]), symbolInfo: getSymbolParts(matmulSourceCol!.name) }];
        const biasVectorSource = { data: biasMatrix[0], symbolInfo: getSymbolParts(biasSource.name) };
        const matmulResult = aSources[0].data.reduce((sum, val, i) => sum + val * bSources[0].data[i], 0);

        steps.push({ title: "Step 1: Matmul (Wx)", op: '·', result: matmulResult, a: aSources[0].data, b: bSources[0].data, aSources, bSources, aSymbolInfo: getSymbolParts(""), bSymbolInfo: getSymbolParts("") });
        steps.push({ title: "Step 2: Add Bias (+b)", op: '+', result: targetValue, a: [matmulResult], b: biasVectorSource.data, aSources: [{data: [matmulResult], symbolInfo: {base: "Wx"}}], bSources: [biasVectorSource], aSymbolInfo: getSymbolParts(""), bSymbolInfo: getSymbolParts("") });
    // Pure Matmul
    } else if (matmulSourceRow && matmulSourceCol) {
        opType = 'matmul';
        const aSources = [{ data: getMatrixByName(matmulSourceRow.name, transformerData, layerIdx, headIdx)![row], symbolInfo: getSymbolParts(matmulSourceRow.name) }];
        const bSources = [{ data: getMatrixByName(matmulSourceCol.name, transformerData, layerIdx, headIdx)!.map(r => r[col]), symbolInfo: getSymbolParts(matmulSourceCol.name) }];
        steps.push({ a: aSources[0].data, b: bSources[0].data, op: '·', result: targetValue, aSources, bSources, aSymbolInfo: getSymbolParts(""), bSymbolInfo: getSymbolParts("") });
    // Add & Norm / Positional Encoding
    } else if (conceptualName.includes('add_norm') || conceptualName.endsWith('_input')) {
        opType = 'add';
        if (addSources.length >= 2) {
            const matrixA = getMatrixByName(addSources[0].name, transformerData, layerIdx, headIdx)!;
            const matrixB = getMatrixByName(addSources[1].name, transformerData, layerIdx, headIdx)!;
            const addResult = matrixA[row][col] + matrixB[row][col];
            steps.push({ a: matrixA[row], b: matrixB[row], op: '+', result: addResult, aSymbolInfo: getSymbolParts(addSources[0].name), bSymbolInfo: getSymbolParts(addSources[1].name), aLabel: getSymbolParts(addSources[0].name).base, bLabel: getSymbolParts(addSources[1].name).base, resultLabel: "Sum" });
        }
    // ReLU Activation
    } else if (conceptualName === 'Activated') {
        opType = 'relu';
        const sourceMatrix = getMatrixByName(sources[0].name, transformerData, layerIdx, headIdx)!;
        steps.push({ a: sourceMatrix[row], b: [], op: 'relu', result: targetValue, aSymbolInfo: getSymbolParts(sources[0].name), bSymbolInfo: { base: '' }, aLabel: getSymbolParts(sources[0].name).base, resultLabel: getSymbolParts(name).base });
    // Softmax
    } else if (conceptualName === 'AttentionWeights' || conceptualName === 'outputProbabilities') {
        opType = 'softmax';
        const sourceMatrix = getMatrixByName(sources[0].name, transformerData, layerIdx, headIdx)!;
        steps.push({ a: sourceMatrix[row], b: [], op: 'softmax', result: targetValue, aSymbolInfo: getSymbolParts(sources[0].name), bSymbolInfo: { base: '' }, aLabel: getSymbolParts(sources[0].name).base, resultLabel: getSymbolParts(name).base });
    }

    if (steps.length === 0) return null;

    const symbol = getSymbolParts(name);
    element.symbol = `${symbol.base}${symbol.subscript ? `_{${symbol.subscript}}` : ''}${symbol.superscript ? `^{${symbol.superscript}}` : ''}`;

    return { target: element, opType, steps, title: `Calculation for ${element.symbol}[${row},${col}]` };
};

export const createBackwardHighlight = (element: ElementIdentifier, transformerData: TransformerData, dims: any): { highlight: HighlightState } => {
    const { name, row, col, isInternal } = element;
    let newSources: HighlightSource[] = [];
    let newTarget: ElementIdentifier | null = element;
    let activeComponent: string | null = null;
    let activeResidual: string | null = null;

    if (name.startsWith('residual.')) {
        const [, resId] = name.split('.');
        activeResidual = resId;
        const layerIdx = parseInt(resId.match(/l(\d+)/)?.[1] || '0', 10);
        const part = parseInt(resId.match(/(\d+)$/)?.[1] || '1', 10);
        if (resId.includes('-d')) {
            const LN = MATRIX_NAMES.decoderLayer(layerIdx);
            if (part === 1) { activeComponent = 'add_norm_1_dec'; newSources.push({ name: LN.decoder_input, row: -1, col: -1, highlightRow: true, highlightCol: true }); newSources.push({ name: LN.masked_mha_output, row: -1, col: -1, highlightRow: true, highlightCol: true }); }
            else if (part === 2) { activeComponent = 'add_norm_2_dec'; newSources.push({ name: LN.add_norm_1_output, row: -1, col: -1, highlightRow: true, highlightCol: true }); newSources.push({ name: LN.enc_dec_mha_output, row: -1, col: -1, highlightRow: true, highlightCol: true }); }
            else if (part === 3) { activeComponent = 'add_norm_3_dec'; newSources.push({ name: LN.add_norm_2_output, row: -1, col: -1, highlightRow: true, highlightCol: true }); newSources.push({ name: LN.ffn_output, row: -1, col: -1, highlightRow: true, highlightCol: true }); }
        } else {
            const LN = MATRIX_NAMES.layer(layerIdx);
            if (part === 1) { activeComponent = 'add_norm_1'; newSources.push({ name: LN.encoder_input, row: -1, col: -1, highlightRow: true, highlightCol: true }); newSources.push({ name: LN.mha_output, row: -1, col: -1, highlightRow: true, highlightCol: true }); }
            else if (part === 2) { activeComponent = 'add_norm_2'; newSources.push({ name: LN.add_norm_1_output, row: -1, col: -1, highlightRow: true, highlightCol: true }); newSources.push({ name: LN.ffn_output, row: -1, col: -1, highlightRow: true, highlightCol: true }); }
        }
        return { highlight: { target: null, sources: newSources, activeComponent, activeResidual, destinations: [] } };
    }

    const [layerIdx, headIdx] = getLayerAndHeadIndices(name);
    const LNe = MATRIX_NAMES.layer(layerIdx);
    const HNe = MATRIX_NAMES.head(layerIdx, headIdx);
    const LNd = MATRIX_NAMES.decoderLayer(layerIdx);
    const HNd_masked = MATRIX_NAMES.maskedMhaHead(layerIdx, headIdx);
    const HNd_encdec = MATRIX_NAMES.encDecMhaHead(layerIdx, headIdx);
    const baseName = isInternal ? name.replace('.internal', '') : name;

    if (name.startsWith('encoder')) {
        if (Object.values(HNe).includes(baseName) || [LNe.mha_output, LNe.Wo, LNe.encoder_input].includes(baseName)) activeComponent = 'mha';
        else if ([LNe.add_norm_1_output].includes(baseName)) activeComponent = 'add_norm_1';
        else if ([LNe.add_norm_2_output].includes(baseName)) activeComponent = 'add_norm_2';
        else if (baseName.includes('.ffn.')) activeComponent = 'ffn';
    } else if (name.startsWith('decoder')) {
        if (Object.values(HNd_masked).includes(baseName) || [LNd.masked_mha_output, LNd.Wo_masked, LNd.decoder_input].includes(baseName)) activeComponent = 'masked_mha';
        else if (Object.values(HNd_encdec).includes(baseName) || [LNd.enc_dec_mha_output, LNd.Wo_enc_dec, LNd.add_norm_1_output, MATRIX_NAMES.finalEncoderOutput].includes(baseName)) activeComponent = 'enc_dec_mha';
        else if (baseName === LNd.add_norm_1_output) activeComponent = 'add_norm_1_dec';
        else if (baseName === LNd.add_norm_2_output) activeComponent = 'add_norm_2_dec';
        else if (baseName === LNd.add_norm_3_output) activeComponent = 'add_norm_3_dec';
        else if (baseName.includes('.ffn.')) activeComponent = 'ffn_dec';
    } else if (name === 'inputToken' || name === 'embeddingMatrix' || name === 'inputEmbeddings') {
        activeComponent = 'token_embed';
    } else if ([MATRIX_NAMES.posEncodings, MATRIX_NAMES.encoderInput].includes(baseName) || baseName === LNe.encoder_input) {
        activeComponent = 'input_embed';
    } else if ([MATRIX_NAMES.outputEmbeddings, MATRIX_NAMES.decoderPosEncodings, MATRIX_NAMES.decoderInput].includes(baseName) || baseName === LNd.decoder_input) {
        activeComponent = 'output_embed';
    } else if ([MATRIX_NAMES.finalLinear, MATRIX_NAMES.logits].includes(baseName)) {
        activeComponent = 'final_output';
    } else if (name === MATRIX_NAMES.outputProbabilities || name === 'outputToken') {
        activeComponent = 'decoding';
    }

    if (name === 'inputToken') { newSources.push({ name: MATRIX_NAMES.inputEmbeddings, row, col: -1, highlightRow: true }) }
    else if (name === MATRIX_NAMES.inputEmbeddings) { newSources.push({ name: 'inputToken', row, col: -1 }); newSources.push({ name: 'embeddingMatrix', row: transformerData.tokenizedInput[row], col: -1, highlightRow: true }) }
    else if (name === LNe.encoder_input) {
        if (layerIdx === 0) {
            newSources.push({ name: MATRIX_NAMES.inputEmbeddings, row, col });
            newSources.push({ name: MATRIX_NAMES.posEncodings, row, col });
        } else {
            newSources.push({ name: MATRIX_NAMES.layer(layerIdx - 1).add_norm_2_output, row, col });
        }
    }
    else if (name === HNe.Q || name === HNe.K || name === HNe.V) { const type = name.split('.').pop()!; newSources.push({ name: LNe.encoder_input, row, col: -1, highlightRow: true }); newSources.push({ name: HNe[`W${type.toLowerCase()}` as 'Wq' | 'Wk' | 'Wv'], row: -1, col, highlightCol: true }); }
    else if (name === HNe.Scores) { newSources.push({ name: HNe.Q, row, col: -1, highlightRow: true }); newSources.push({ name: HNe.K, row: col, col: -1, highlightRow: true }); }
    else if (name === HNe.ScaledScores) { newSources.push({ name: HNe.Scores, row, col }); }
    else if (name === HNe.AttentionWeights) { newSources.push({ name: HNe.ScaledScores, row, col: -1, highlightRow: true });}
    else if (name === HNe.HeadOutput) { newSources.push({ name: HNe.AttentionWeights, row, col: -1, highlightRow: true }); newSources.push({ name: HNe.V, row: -1, col, highlightCol: true }); }
    else if (name === LNe.mha_output) { for (let h = 0; h < dims.h; h++) { newSources.push({ name: MATRIX_NAMES.head(layerIdx, h).HeadOutput, row: row, col: -1, highlightRow: true }); } newSources.push({ name: LNe.Wo, row: -1, col, highlightCol: true }); }
    else if (name === LNe.add_norm_1_output) { newSources.push({ name: LNe.encoder_input, row, col }); newSources.push({ name: LNe.mha_output, row, col }); }
    else if (name === LNe.Intermediate) { newSources.push({ name: LNe.add_norm_1_output, row, col: -1, highlightRow: true }); newSources.push({ name: LNe.W1, row: -1, col, highlightCol: true }); newSources.push({ name: LNe.b1, row: 0, col }); }
    else if (name === LNe.Activated) { newSources.push({ name: LNe.Intermediate, row, col }); }
    else if (name === LNe.ffn_output) { newSources.push({ name: LNe.Activated, row, col: -1, highlightRow: true }); newSources.push({ name: LNe.W2, row: -1, col, highlightCol: true }); newSources.push({ name: LNe.b2, row: 0, col }); }
    else if (name === LNe.add_norm_2_output) { newSources.push({ name: LNe.add_norm_1_output, row, col }); newSources.push({ name: LNe.ffn_output, row, col }); }
    else if (name === LNd.decoder_input) {
        if (layerIdx === 0) {
            newSources.push({ name: MATRIX_NAMES.outputEmbeddings, row, col });
            newSources.push({ name: MATRIX_NAMES.decoderPosEncodings, row, col });
        } else {
            newSources.push({ name: MATRIX_NAMES.decoderLayer(layerIdx - 1).add_norm_3_output, row, col });
        }
    }
    else if (name === HNd_masked.Q || name === HNd_masked.K || name === HNd_masked.V) { const type = name.split('.').pop()!; newSources.push({ name: LNd.decoder_input, row, col: -1, highlightRow: true }); newSources.push({ name: HNd_masked[`W${type.toLowerCase()}` as 'Wq' | 'Wk' | 'Wv'], row: -1, col, highlightCol: true }); }
    else if (name === HNd_masked.Scores) { newSources.push({ name: HNd_masked.Q, row, col: -1, highlightRow: true }); newSources.push({ name: HNd_masked.K, row: col, col: -1, highlightRow: true }); }
    else if (name === HNd_masked.ScaledScores) { newSources.push({ name: HNd_masked.Scores, row, col }); }
    else if (name === HNd_masked.AttentionWeights) { newSources.push({ name: HNd_masked.ScaledScores, row, col: -1, highlightRow: true }); }
    else if (name === HNd_masked.HeadOutput) { newSources.push({ name: HNd_masked.AttentionWeights, row, col: -1, highlightRow: true }); newSources.push({ name: HNd_masked.V, row: -1, col, highlightCol: true }); }
    else if (name === LNd.masked_mha_output) { for (let h = 0; h < dims.h; h++) { newSources.push({ name: MATRIX_NAMES.maskedMhaHead(layerIdx, h).HeadOutput, row, col: -1, highlightRow: true }); } newSources.push({ name: LNd.Wo_masked, row: -1, col, highlightCol: true }); }
    else if (name === LNd.add_norm_1_output) { newSources.push({ name: LNd.decoder_input, row, col }); newSources.push({ name: LNd.masked_mha_output, row, col }); }
    else if (name === HNd_encdec.Q) { newSources.push({ name: LNd.add_norm_1_output, row, col: -1, highlightRow: true }); newSources.push({ name: HNd_encdec.Wq, row: -1, col, highlightCol: true }); }
    else if (name === HNd_encdec.K) { newSources.push({ name: MATRIX_NAMES.finalEncoderOutput, row: -1, col: -1, highlightRow: true, highlightCol: true }); newSources.push({ name: HNd_encdec.Wk, row: -1, col, highlightCol: true }); }
    else if (name === HNd_encdec.V) { newSources.push({ name: MATRIX_NAMES.finalEncoderOutput, row: -1, col: -1, highlightRow: true, highlightCol: true }); newSources.push({ name: HNd_encdec.Wv, row: -1, col, highlightCol: true }); }
    else if (name === HNd_encdec.Scores) { newSources.push({ name: HNd_encdec.Q, row, col: -1, highlightRow: true }); newSources.push({ name: HNd_encdec.K, row: col, col: -1, highlightRow: true }); }
    else if (name === HNd_encdec.ScaledScores) { newSources.push({ name: HNd_encdec.Scores, row, col }); }
    else if (name === HNd_encdec.AttentionWeights) { newSources.push({ name: HNd_encdec.ScaledScores, row, col: -1, highlightRow: true }); }
    else if (name === HNd_encdec.HeadOutput) { newSources.push({ name: HNd_encdec.AttentionWeights, row, col: -1, highlightRow: true }); newSources.push({ name: HNd_encdec.V, row: -1, col, highlightCol: true }); }
    else if (name === LNd.enc_dec_mha_output) { for (let h = 0; h < dims.h; h++) { newSources.push({ name: MATRIX_NAMES.encDecMhaHead(layerIdx, h).HeadOutput, row, col: -1, highlightRow: true }); } newSources.push({ name: LNd.Wo_enc_dec, row: -1, col, highlightCol: true }); }
    else if (name === LNd.add_norm_2_output) { newSources.push({ name: LNd.add_norm_1_output, row, col }); newSources.push({ name: LNd.enc_dec_mha_output, row, col }); }
    else if (name === LNd.Intermediate) { newSources.push({ name: LNd.add_norm_2_output, row, col: -1, highlightRow: true }); newSources.push({ name: LNd.W1, row: -1, col, highlightCol: true }); newSources.push({ name: LNd.b1, row: 0, col }); }
    else if (name === LNd.Activated) { newSources.push({ name: LNd.Intermediate, row, col }); }
    else if (name === LNd.ffn_output) { newSources.push({ name: LNd.Activated, row, col: -1, highlightRow: true }); newSources.push({ name: LNd.W2, row: -1, col, highlightCol: true }); newSources.push({ name: LNd.b2, row: 0, col }); }
    else if (name === LNd.add_norm_3_output) { newSources.push({ name: LNd.add_norm_2_output, row, col }); newSources.push({ name: LNd.ffn_output, row, col }); }
    else if (name === MATRIX_NAMES.logits) { newSources.push({ name: MATRIX_NAMES.decoderLayer(dims.n_layers - 1).add_norm_3_output, row, col: -1, highlightRow: true }); newSources.push({ name: MATRIX_NAMES.finalLinear, row: -1, col, highlightCol: true }) }
    else if (name === MATRIX_NAMES.outputProbabilities) { newSources.push({ name: MATRIX_NAMES.logits, row, col: -1, highlightRow: true }) }
    else if (name === 'outputToken') { newSources.push({ name: MATRIX_NAMES.outputProbabilities, row, col: -1, highlightRow: true, highlightProbCol: true }) }

    const highlight = { target: newTarget, sources: newSources, activeComponent, activeResidual, destinations: [] };
    return { highlight };
};
// END OF FILE: src/topics/transformer-explorer/lib/tracing.ts