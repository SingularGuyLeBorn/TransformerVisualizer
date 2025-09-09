// FILE: src/topics/transformer-explorer/lib/tracing.ts

import { ElementIdentifier, HighlightSource, HighlightState, TransformerData, Matrix } from '../types';
import { TooltipState } from '../../../components/CalculationTooltip/types';
import { MATRIX_NAMES } from '../config/matrixNames';
import { getSymbolParts } from './symbolMapping';

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
        if (name === LNe.mha_output) return encLayer.mha.output;
        if (name === LNe.Wo) return encLayer.mha.Wo;
        if (name === LNe.ConcatOutput) return encLayer.mha.ConcatOutput;
        if (name === LNe.add_norm_1_output) return encLayer.add_norm_1_output;
        if (name === LNe.ffn_output) return encLayer.ffn.Output;
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
        if (name === LNd.ConcatOutput_masked) return decLayer.masked_mha.ConcatOutput;
        if (name === LNd.add_norm_1_output) return decLayer.add_norm_1_output;
        if (name === LNd.enc_dec_mha_output) return decLayer.enc_dec_mha.output;
        if (name === LNd.Wo_enc_dec) return decLayer.enc_dec_mha.Wo;
        if (name === LNd.ConcatOutput_enc_dec) return decLayer.enc_dec_mha.ConcatOutput;
        if (name === LNd.add_norm_2_output) return decLayer.add_norm_2_output;
        if (name === LNd.ffn_output) return decLayer.ffn.Output;
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

    if (['mha_output', 'masked_mha_output', 'enc_dec_mha_output'].includes(conceptualName)) {
        opType = 'matmul';
        const concatSource = sources.find(s => s.name.includes('ConcatOutput'));
        const woSource = sources.find(s => s.highlightCol);

        if (concatSource && woSource) {
            const aSources = [{
                data: getMatrixByName(concatSource.name, transformerData, concatSource.layerIndex!, concatSource.headIndex!)![concatSource.row],
                symbolInfo: getSymbolParts(concatSource.name)
            }];
            const bSources = [{
                data: getMatrixByName(woSource.name, transformerData, woSource.layerIndex!, woSource.headIndex!)!.map(r => r[woSource.col]),
                symbolInfo: getSymbolParts(woSource.name)
            }];
            const vecA = aSources[0].data;
            const vecB = bSources[0].data;

            steps.push({ a: vecA, b: vecB, op: '·', result: targetValue, aSources, bSources, aSymbolInfo: getSymbolParts(""), bSymbolInfo: getSymbolParts("") });
        }
    } else if (name.includes('.ffn.Intermediate') || name.includes('.ffn.output')) {
        opType = 'wx-plus-b';
        // [FIXED] Add check for addSources existence before finding biasSource.
        const biasSource = addSources && addSources.find(s => s.name.includes('.b'));
        if (matmulSourceRow && matmulSourceCol && biasSource) {
            const matmulMatrixA = getMatrixByName(matmulSourceRow!.name, transformerData, layerIdx, headIdx)!;
            const matmulMatrixB = getMatrixByName(matmulSourceCol!.name, transformerData, layerIdx, headIdx)!;
            const biasMatrix = getMatrixByName(biasSource.name, transformerData, layerIdx, headIdx)!;

            const aSources = [{ data: matmulMatrixA[row], symbolInfo: getSymbolParts(matmulSourceRow!.name) }];
            const bSources = [{ data: matmulMatrixB.map(r => r[col]), symbolInfo: getSymbolParts(matmulSourceCol!.name) }];
            const biasVectorSource = { data: [biasMatrix[0][col]], symbolInfo: getSymbolParts(biasSource.name) };
            const matmulResult = aSources[0].data.reduce((sum, val, i) => sum + val * bSources[0].data[i], 0);

            steps.push({ title: "Step 1: Matmul (Wx)", op: '·', result: matmulResult, a: aSources[0].data, b: bSources[0].data, aSources, bSources, aSymbolInfo: getSymbolParts(""), bSymbolInfo: getSymbolParts("") });
            steps.push({ title: "Step 2: Add Bias (+b)", op: '+', result: targetValue, a: [matmulResult], b: [biasVectorSource.data[0]], aSources: [{data: [matmulResult], symbolInfo: {base: "Wx", subscript: `[${row},${col}]`}}], bSources: [biasVectorSource], aSymbolInfo: getSymbolParts(""), bSymbolInfo: getSymbolParts(""), aLabel: "Wx", bLabel: "b", resultLabel: "Wx+b" });
        }
    } else if (matmulSourceRow && matmulSourceCol) {
        opType = 'matmul';
        const aSources = [{ data: getMatrixByName(matmulSourceRow.name, transformerData, layerIdx, headIdx)![row], symbolInfo: getSymbolParts(matmulSourceRow.name) }];
        const bSources = [{ data: getMatrixByName(matmulSourceCol.name, transformerData, layerIdx, headIdx)!.map(r => r[col]), symbolInfo: getSymbolParts(matmulSourceCol.name) }];
        steps.push({ a: aSources[0].data, b: bSources[0].data, op: '·', result: targetValue, aSources, bSources, aSymbolInfo: getSymbolParts(""), bSymbolInfo: getSymbolParts("") });
    } else if (addSources.length >= 2) {
        const matrixA = getMatrixByName(addSources[0].name, transformerData, layerIdx, headIdx)!;
        const matrixB = getMatrixByName(addSources[1].name, transformerData, layerIdx, headIdx)!;
        if (conceptualName.includes('add_norm')) {
            opType = 'layernorm';
            const vecA = matrixA[row];
            const vecB = matrixB[row];
            const addedVector = vecA.map((val, i) => val + vecB[i]);
            const aLabel = `${getSymbolParts(addSources[0].name).base}${getSymbolParts(addSources[0].name).subscript ? `_{${getSymbolParts(addSources[0].name).subscript}}` : ''} + ${getSymbolParts(addSources[1].name).base}${getSymbolParts(addSources[1].name).subscript ? `_{${getSymbolParts(addSources[1].name).subscript}}` : ''}`;
            steps.push({ a: addedVector, b: [], op: 'layernorm', result: targetValue, aSymbolInfo: getSymbolParts(name), bSymbolInfo: { base: '' }, aLabel: aLabel, resultLabel: getSymbolParts(name).base });
        } else {
            opType = 'add';
            const addResult = matrixA[row][col] + matrixB[row][col];
            steps.push({ a: matrixA[row], b: matrixB[row], op: '+', result: addResult, aSymbolInfo: getSymbolParts(addSources[0].name), bSymbolInfo: getSymbolParts(addSources[1].name), aLabel: getSymbolParts(addSources[0].name).base, bLabel: getSymbolParts(addSources[1].name).base, resultLabel: "Sum" });
        }
    } else if (conceptualName === 'Activated') {
        opType = 'relu';
        const sourceMatrix = getMatrixByName(sources[0].name, transformerData, layerIdx, headIdx)!;
        steps.push({ a: sourceMatrix[row], b: [], op: 'relu', result: targetValue, aSymbolInfo: getSymbolParts(sources[0].name), bSymbolInfo: { base: '' }, aLabel: getSymbolParts(sources[0].name).base, resultLabel: getSymbolParts(name).base });
    } else if (conceptualName === 'AttentionWeights' || conceptualName === 'outputProbabilities') {
        opType = 'softmax';
        const sourceMatrix = getMatrixByName(sources[0].name, transformerData, layerIdx, headIdx)!;
        steps.push({ a: sourceMatrix[row], b: [], op: 'softmax', result: targetValue, aSymbolInfo: getSymbolParts(sources[0].name), bSymbolInfo: { base: '' }, aLabel: getSymbolParts(sources[0].name).base, resultLabel: getSymbolParts(name).base });
    } else if (conceptualName.includes('ConcatOutput')) {
        return null; // No tooltip for concat, highlighting is sufficient
    }

    if (steps.length === 0) return null;

    const finalSymbol = getSymbolParts(name);
    let subscript = finalSymbol.subscript;
    // Special handling for title, merging multiple subscripts
    const titleSymbolParts = [finalSymbol.base];
    if (finalSymbol.subscript) titleSymbolParts.push(`_{${finalSymbol.subscript}}`);
    if (finalSymbol.superscript) titleSymbolParts.push(`^{${finalSymbol.superscript}}`);
    element.symbol = titleSymbolParts.join('');

    return { target: element, opType, steps, title: `Calculation for ${element.symbol}[${row},${col}]` };
};

export const createBackwardHighlight = (element: ElementIdentifier, transformerData: TransformerData, dims: any): { highlight: HighlightState } => {
    const { name, row, col, isInternal } = element;
    let newSources: HighlightSource[] = [];
    let activeComponent: string | null = null;
    let activeResidual: string | null = null;

    const [layerIdx, headIdx] = getLayerAndHeadIndices(name);
    element.layerIndex = layerIdx;
    element.headIndex = headIdx;

    const addSource = (src: Partial<HighlightSource>) => {
        const [srcLayer, srcHead] = getLayerAndHeadIndices(src.name!);
        const newSource = Object.assign(
            {},
            element,
            { row: -1, col: -1 },
            src,
            { layerIndex: srcLayer, headIndex: srcHead }
        );
        newSources.push(newSource);
    };


    if (name.startsWith('residual.')) {
        const [, resId] = name.split('.');
        activeResidual = resId;
        const resLayerIdx = parseInt(resId.match(/l(\d+)/)?.[1] || '0', 10);
        const part = parseInt(resId.match(/(\d+)$/)?.[1] || '1', 10);
        if (resId.includes('-d')) {
            const LN = MATRIX_NAMES.decoderLayer(resLayerIdx);
            if (part === 1) { activeComponent = 'add_norm_1_dec'; addSource({ name: LN.decoder_input, highlightRow: true, highlightCol: true }); addSource({ name: LN.masked_mha_output, highlightRow: true, highlightCol: true }); }
            else if (part === 2) { activeComponent = 'add_norm_2_dec'; addSource({ name: LN.add_norm_1_output, highlightRow: true, highlightCol: true }); addSource({ name: LN.enc_dec_mha_output, highlightRow: true, highlightCol: true }); }
            else if (part === 3) { activeComponent = 'add_norm_3_dec'; addSource({ name: LN.add_norm_2_output, highlightRow: true, highlightCol: true }); addSource({ name: LN.ffn_output, highlightRow: true, highlightCol: true }); }
        } else {
            const LN = MATRIX_NAMES.layer(resLayerIdx);
            if (part === 1) { activeComponent = 'add_norm_1'; addSource({ name: LN.encoder_input, highlightRow: true, highlightCol: true }); addSource({ name: LN.mha_output, highlightRow: true, highlightCol: true }); }
            else if (part === 2) { activeComponent = 'add_norm_2'; addSource({ name: LN.add_norm_1_output, highlightRow: true, highlightCol: true }); addSource({ name: LN.ffn_output, highlightRow: true, highlightCol: true }); }
        }
        return { highlight: { target: null, sources: newSources, activeComponent, activeResidual, destinations: [] } };
    }

    const LNe = MATRIX_NAMES.layer(layerIdx);
    const HNe = MATRIX_NAMES.head(layerIdx, headIdx);
    const LNd = MATRIX_NAMES.decoderLayer(layerIdx);
    const HNd_masked = MATRIX_NAMES.maskedMhaHead(layerIdx, headIdx);
    const HNd_encdec = MATRIX_NAMES.encDecMhaHead(layerIdx, headIdx);
    const baseName = isInternal ? name.replace('.internal', '') : name;

    if (name.startsWith('encoder')) {
        if (Object.values(HNe).includes(baseName) || [LNe.mha_output, LNe.Wo, LNe.encoder_input, LNe.ConcatOutput].includes(baseName)) activeComponent = 'mha';
        else if ([LNe.add_norm_1_output].includes(baseName)) activeComponent = 'add_norm_1';
        else if ([LNe.add_norm_2_output].includes(baseName)) activeComponent = 'add_norm_2';
        else if (baseName.includes('.ffn.')) activeComponent = 'ffn';
    } else if (name.startsWith('decoder')) {
        if (Object.values(HNd_masked).includes(baseName) || [LNd.masked_mha_output, LNd.Wo_masked, LNd.decoder_input, LNd.ConcatOutput_masked].includes(baseName)) activeComponent = 'masked_mha';
        else if (Object.values(HNd_encdec).includes(baseName) || [LNd.enc_dec_mha_output, LNd.Wo_enc_dec, LNd.add_norm_1_output, MATRIX_NAMES.finalEncoderOutput, LNd.ConcatOutput_enc_dec].includes(baseName)) activeComponent = 'enc_dec_mha';
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

    if (name === 'inputToken') { addSource({ name: MATRIX_NAMES.inputEmbeddings, row, col: -1, highlightRow: true }) }
    else if (name === MATRIX_NAMES.inputEmbeddings) { addSource({ name: 'inputToken', row }); addSource({ name: 'embeddingMatrix', row: transformerData.tokenizedInput[row], col: -1, highlightRow: true }) }
    else if (name === LNe.encoder_input) {
        if (layerIdx === 0) { addSource({ name: MATRIX_NAMES.inputEmbeddings, row, col }); addSource({ name: MATRIX_NAMES.posEncodings, row, col }); }
        else { addSource({ name: MATRIX_NAMES.layer(layerIdx - 1).add_norm_2_output, row, col }); }
    }
    else if (name === HNe.Q || name === HNe.K || name === HNe.V) { const type = name.split('.').pop()!; addSource({ name: LNe.encoder_input, row, col: -1, highlightRow: true }); addSource({ name: HNe[`W${type.toLowerCase()}` as 'Wq' | 'Wk' | 'Wv'], row: -1, col, highlightCol: true }); }
    else if (name === HNe.Scores) { addSource({ name: HNe.Q, row, col: -1, highlightRow: true }); addSource({ name: HNe.K, row: col, col: -1, highlightRow: true }); }
    else if (name === HNe.ScaledScores) { addSource({ name: HNe.Scores, row, col }); }
    else if (name === HNe.AttentionWeights) { addSource({ name: HNe.ScaledScores, row, col: -1, highlightRow: true });}
    else if (name === HNe.HeadOutput) { addSource({ name: HNe.AttentionWeights, row, col: -1, highlightRow: true }); addSource({ name: HNe.V, row: -1, col, highlightCol: true }); }
    else if (name === LNe.ConcatOutput) { for (let h = 0; h < dims.h; h++) { addSource({ name: MATRIX_NAMES.head(layerIdx, h).HeadOutput, row, col: -1, highlightRow: true, headIndex: h }); } }
    else if (name === LNe.mha_output) { addSource({ name: LNe.ConcatOutput, row, col: -1, highlightRow: true }); addSource({ name: LNe.Wo, row: -1, col, highlightCol: true }); }
    else if (name === LNe.add_norm_1_output) { addSource({ name: LNe.encoder_input, row, col }); addSource({ name: LNe.mha_output, row, col }); }
    else if (name === LNe.Intermediate) { addSource({ name: LNe.add_norm_1_output, row, col: -1, highlightRow: true }); addSource({ name: LNe.W1, row: -1, col, highlightCol: true }); addSource({ name: LNe.b1, row: 0, col }); }
    else if (name === LNe.Activated) { addSource({ name: LNe.Intermediate, row, col }); }
    else if (name === LNe.ffn_output) { addSource({ name: LNe.Activated, row, col: -1, highlightRow: true }); addSource({ name: LNe.W2, row: -1, col, highlightCol: true }); addSource({ name: LNe.b2, row: 0, col }); }
    else if (name === LNe.add_norm_2_output) { addSource({ name: LNe.add_norm_1_output, row, col }); addSource({ name: LNe.ffn_output, row, col }); }
    else if (name === LNd.decoder_input) {
        if (layerIdx === 0) { addSource({ name: MATRIX_NAMES.outputEmbeddings, row, col }); addSource({ name: MATRIX_NAMES.decoderPosEncodings, row, col }); }
        else { addSource({ name: MATRIX_NAMES.decoderLayer(layerIdx - 1).add_norm_3_output, row, col }); }
    }
    else if (name === HNd_masked.Q || name === HNd_masked.K || name === HNd_masked.V) { const type = name.split('.').pop()!; addSource({ name: LNd.decoder_input, row, col: -1, highlightRow: true }); addSource({ name: HNd_masked[`W${type.toLowerCase()}` as 'Wq' | 'Wk' | 'Wv'], row: -1, col, highlightCol: true }); }
    else if (name === HNd_masked.Scores) { addSource({ name: HNd_masked.Q, row, col: -1, highlightRow: true }); addSource({ name: HNd_masked.K, row: col, col: -1, highlightRow: true }); }
    else if (name === HNd_masked.ScaledScores) { addSource({ name: HNd_masked.Scores, row, col }); }
    else if (name === HNd_masked.AttentionWeights) { addSource({ name: HNd_masked.ScaledScores, row, col: -1, highlightRow: true }); }
    else if (name === HNd_masked.HeadOutput) { addSource({ name: HNd_masked.AttentionWeights, row, col: -1, highlightRow: true }); addSource({ name: HNd_masked.V, row: -1, col, highlightCol: true }); }
    else if (name === LNd.ConcatOutput_masked) { for (let h = 0; h < dims.h; h++) { addSource({ name: MATRIX_NAMES.maskedMhaHead(layerIdx, h).HeadOutput, row, col: -1, highlightRow: true, headIndex: h }); } }
    else if (name === LNd.masked_mha_output) { addSource({ name: LNd.ConcatOutput_masked, row, col: -1, highlightRow: true }); addSource({ name: LNd.Wo_masked, row: -1, col, highlightCol: true }); }
    else if (name === LNd.add_norm_1_output) { addSource({ name: LNd.decoder_input, row, col }); addSource({ name: LNd.masked_mha_output, row, col }); }
    else if (name === HNd_encdec.Q) { addSource({ name: LNd.add_norm_1_output, row, col: -1, highlightRow: true }); addSource({ name: HNd_encdec.Wq, row: -1, col, highlightCol: true }); }
    else if (name === HNd_encdec.K || name === HNd_encdec.V) { const type = name.split('.').pop()!.toLowerCase(); addSource({ name: MATRIX_NAMES.finalEncoderOutput, row, col: -1, highlightRow: true }); addSource({ name: HNd_encdec[`W${type}` as 'Wk' | 'Wv'], row: -1, col, highlightCol: true }); }
    else if (name === HNd_encdec.Scores) { addSource({ name: HNd_encdec.Q, row, col: -1, highlightRow: true }); addSource({ name: HNd_encdec.K, row: col, col: -1, highlightRow: true }); }
    else if (name === HNd_encdec.ScaledScores) { addSource({ name: HNd_encdec.Scores, row, col }); }
    else if (name === HNd_encdec.AttentionWeights) { addSource({ name: HNd_encdec.ScaledScores, row, col: -1, highlightRow: true }); }
    else if (name === HNd_encdec.HeadOutput) { addSource({ name: HNd_encdec.AttentionWeights, row, col: -1, highlightRow: true }); addSource({ name: HNd_encdec.V, row: -1, col, highlightCol: true }); }
    else if (name === LNd.ConcatOutput_enc_dec) { for (let h = 0; h < dims.h; h++) { addSource({ name: MATRIX_NAMES.encDecMhaHead(layerIdx, h).HeadOutput, row, col: -1, highlightRow: true, headIndex: h }); } }
    else if (name === LNd.enc_dec_mha_output) { addSource({ name: LNd.ConcatOutput_enc_dec, row, col: -1, highlightRow: true }); addSource({ name: LNd.Wo_enc_dec, row: -1, col, highlightCol: true }); }
    else if (name === LNd.add_norm_2_output) { addSource({ name: LNd.add_norm_1_output, row, col }); addSource({ name: LNd.enc_dec_mha_output, row, col }); }
    else if (name === LNd.Intermediate) { addSource({ name: LNd.add_norm_2_output, row, col: -1, highlightRow: true }); addSource({ name: LNd.W1, row: -1, col, highlightCol: true }); addSource({ name: LNd.b1, row: 0, col }); }
    else if (name === LNd.Activated) { addSource({ name: LNd.Intermediate, row, col }); }
    else if (name === LNd.ffn_output) { addSource({ name: LNd.Activated, row, col: -1, highlightRow: true }); addSource({ name: LNd.W2, row: -1, col, highlightCol: true }); addSource({ name: LNd.b2, row: 0, col }); }
    else if (name === LNd.add_norm_3_output) { addSource({ name: LNd.add_norm_2_output, row, col }); addSource({ name: LNd.ffn_output, row, col }); }
    else if (name === MATRIX_NAMES.logits) { addSource({ name: MATRIX_NAMES.decoderLayer(dims.n_layers - 1).add_norm_3_output, row, col: -1, highlightRow: true }); addSource({ name: MATRIX_NAMES.finalLinear, row: -1, col, highlightCol: true }) }
    else if (name === MATRIX_NAMES.outputProbabilities) { addSource({ name: MATRIX_NAMES.logits, row, col: -1, highlightRow: true }) }
    else if (name === 'outputToken') { addSource({ name: MATRIX_NAMES.outputProbabilities, row, col: -1, highlightRow: true, highlightProbCol: true }) }

    const highlight = { target: element, sources: newSources, activeComponent, activeResidual, destinations: [] };
    return { highlight };
};
// END OF FILE: src/topics/transformer-explorer/lib/tracing.ts