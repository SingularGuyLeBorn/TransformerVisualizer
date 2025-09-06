// FILE: lib/transformer.ts
import { Matrix, TransformerData, EncoderLayerData, FFNData, MultiHeadAttentionData, AttentionHeadData, Vector, DecoderLayerData } from '../types';
import { fixedWeights } from './fixedWeights';
import { whitespaceTokenizer } from './tokenizer';

// --- Utility Functions ---

const createMatrixFrom2DArray = (data: number[][]): Matrix => {
    return data.map(row => row.slice());
};

const createVectorFrom1DArray = (data: number[]): Vector => {
    return data.slice();
};

const addMatrices = (A: Matrix, B: Matrix): Matrix => {
  return A.map((row, i) =>
    row.map((val, j) => val + B[i][j])
  );
};

const multiplyMatrices = (A: Matrix, B: Matrix): Matrix => {
  const rowsA = A.length;
  if (rowsA === 0) return [];
  const colsA = A[0].length;
  if (colsA === 0) return A.map(() => []);
  const colsB = B[0]?.length ?? 0;
  if (colsB === 0) return A.map(() => []);

  const result: Matrix = Array(rowsA).fill(0).map(() => Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += A[i][k] * B[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
};

const scaleMatrix = (A: Matrix, scalar: number): Matrix => {
    return A.map(row => row.map(val => val / scalar));
}

const softmaxByRow = (A: Matrix): Matrix => {
    return A.map(row => {
        const maxVal = Math.max(...row.filter(v => isFinite(v)));
        const exps = row.map(val => isFinite(val) ? Math.exp(val - maxVal) : 0);
        const sumExps = exps.reduce((a, b) => a + b, 0);
        if (sumExps === 0) return row.map(() => 1 / row.length); // Avoid division by zero
        return exps.map(exp => exp / sumExps);
    });
}

const layerNorm = (A: Matrix): Matrix => {
    if (A.length === 0 || A[0].length === 0) return [];
    return A.map(row => {
        const mean = row.reduce((a,b) => a+b, 0) / row.length;
        const variance = row.map(x => (x - mean) ** 2).reduce((a,b) => a+b,0) / row.length;
        const std = Math.sqrt(variance + 1e-5);
        return row.map(x => (x - mean) / std);
    });
}

const applyReLU = (A: Matrix): Matrix => {
    return A.map(row => row.map(val => Math.max(0, val)));
}

const addBias = (A: Matrix, b: Vector): Matrix => {
    return A.map(row => row.map((val, j) => val + b[j]));
}

const applyMask = (A: Matrix, maskValue = -Infinity): Matrix => {
    return A.map((row, i) =>
        row.map((val, j) => (j > i ? maskValue : val))
    );
};

// --- Main Calculation Function ---

interface Dims {
    d_model: number;
    h: number;
    seq_len: number; // Decoder sequence length
    n_layers: number;
    d_ff: number;
}

export const calculateTransformer = (inputText: string, dims: Dims): TransformerData | null => {
    const { d_model, h, seq_len: decoder_seq_len, n_layers, d_ff } = dims;
    if (d_model % h !== 0) return null;
    const d_k = d_model / h;

    const weights = fixedWeights(dims);
    const vocab = weights.vocab;
    const UNK_TOKEN_ID = 15;

    // --- INPUT STAGE (DYNAMIC) ---
    const tokenizedText = whitespaceTokenizer(inputText);
    const tokenizedInput = tokenizedText.map(t => {
        const entry = Object.entries(vocab).find(([id, word]) => word === t);
        return entry ? parseInt(entry[0], 10) : UNK_TOKEN_ID;
    });
    const encoder_seq_len = tokenizedInput.length;
    if (encoder_seq_len === 0) return null; // Handle empty input after tokenization

    // --- ENCODER ---
    const embeddingMatrix = createMatrixFrom2DArray(weights.embeddingMatrix);
    const inputEmbeddings = tokenizedInput.map(token_id => embeddingMatrix[token_id]);

    const posEncodings: Matrix = createMatrixFrom2DArray(weights.posEncodings).slice(0, encoder_seq_len);
    const encoderInput = addMatrices(inputEmbeddings, posEncodings);

    let currentEncoderInput = encoderInput;
    const encoderLayers: EncoderLayerData[] = [];

    for (let i = 0; i < n_layers; i++) {
        const encoder_input = currentEncoderInput;
        const heads: AttentionHeadData[] = [];
        const headOutputs: Matrix[] = [];
        for(let j=0; j < h; j++) {
            const Wq = createMatrixFrom2DArray(weights.encoderLayers[i].mha.heads[j].Wq);
            const Wk = createMatrixFrom2DArray(weights.encoderLayers[i].mha.heads[j].Wk);
            const Wv = createMatrixFrom2DArray(weights.encoderLayers[i].mha.heads[j].Wv);
            const Q = multiplyMatrices(encoder_input, Wq);
            const K = multiplyMatrices(encoder_input, Wk);
            const V = multiplyMatrices(encoder_input, Wv);
            const K_T = Array.from({ length: d_k }, (_, r) => Array.from({ length: encoder_seq_len }, (_, c) => K[c][r]));
            const Scores = multiplyMatrices(Q, K_T);
            const ScaledScores = scaleMatrix(Scores, Math.sqrt(d_k));
            const AttentionWeights = softmaxByRow(ScaledScores);
            const HeadOutput = multiplyMatrices(AttentionWeights, V);
            heads.push({ Wq, Wk, Wv, Q, K, V, Scores, ScaledScores, AttentionWeights, HeadOutput });
            headOutputs.push(HeadOutput);
        }
        const ConcatOutput = headOutputs.reduce((acc, current) => acc.map((row, rIdx) => [...row, ...current[rIdx]]), Array(encoder_seq_len).fill(0).map(() => []));
        const Wo = createMatrixFrom2DArray(weights.encoderLayers[i].mha.Wo);
        const mha_output = multiplyMatrices(ConcatOutput, Wo);
        const mha: MultiHeadAttentionData = { heads, Wo, output: mha_output };
        const add_norm_1_output = layerNorm(addMatrices(encoder_input, mha_output));
        const W1 = createMatrixFrom2DArray(weights.encoderLayers[i].ffn.W1);
        const b1 = createVectorFrom1DArray(weights.encoderLayers[i].ffn.b1);
        const Intermediate = addBias(multiplyMatrices(add_norm_1_output, W1), b1);
        const Activated = applyReLU(Intermediate);
        const W2 = createMatrixFrom2DArray(weights.encoderLayers[i].ffn.W2);
        const b2 = createVectorFrom1DArray(weights.encoderLayers[i].ffn.b2);
        const ffn_output = addBias(multiplyMatrices(Activated, W2), b2);
        const ffn: FFNData = { W1, b1, Intermediate, Activated, W2, b2, Output: ffn_output };
        const add_norm_2_output = layerNorm(addMatrices(add_norm_1_output, ffn_output));
        encoderLayers.push({ encoder_input, mha, mha_output, add_norm_1_output, ffn, ffn_output, add_norm_2_output });
        currentEncoderInput = add_norm_2_output;
    }
    const finalEncoderOutput = currentEncoderInput;

    // --- DECODER ---
    const tokenizedDecoderInput = ["<SOS>", "我", "是", "学生"].slice(0, decoder_seq_len).map(t => Object.keys(vocab).find(k => vocab[parseInt(k)] === t)!).map(Number);
    const outputEmbeddings = tokenizedDecoderInput.map(token_id => embeddingMatrix[token_id]);
    const decoderPosEncodings = createMatrixFrom2DArray(weights.posEncodings).slice(0, decoder_seq_len);
    const decoderInput = addMatrices(outputEmbeddings, decoderPosEncodings);

    let currentDecoderInput = decoderInput;
    const decoderLayers: DecoderLayerData[] = [];

    for (let i = 0; i < n_layers; i++) {
        const decoder_input = currentDecoderInput;
        const decWeights = weights.decoderLayers[i];

        const masked_mha_heads: AttentionHeadData[] = [];
        const masked_mha_headOutputs: Matrix[] = [];
        for (let j = 0; j < h; j++) {
            const Wq = createMatrixFrom2DArray(decWeights.masked_mha.heads[j].Wq);
            const Wk = createMatrixFrom2DArray(decWeights.masked_mha.heads[j].Wk);
            const Wv = createMatrixFrom2DArray(decWeights.masked_mha.heads[j].Wv);
            const Q = multiplyMatrices(decoder_input, Wq);
            const K = multiplyMatrices(decoder_input, Wk);
            const V = multiplyMatrices(decoder_input, Wv);
            const K_T = Array.from({ length: d_k }, (_, r) => Array.from({ length: decoder_seq_len }, (_, c) => K[c][r]));
            const Scores = applyMask(multiplyMatrices(Q, K_T));
            const ScaledScores = scaleMatrix(Scores, Math.sqrt(d_k));
            const AttentionWeights = softmaxByRow(ScaledScores);
            const HeadOutput = multiplyMatrices(AttentionWeights, V);
            masked_mha_heads.push({ Wq, Wk, Wv, Q, K, V, Scores, ScaledScores, AttentionWeights, HeadOutput });
            masked_mha_headOutputs.push(HeadOutput);
        }
        const masked_ConcatOutput = masked_mha_headOutputs.reduce((acc, current) => acc.map((row, rIdx) => [...row, ...current[rIdx]]), Array(decoder_seq_len).fill(0).map(() => []));
        const masked_Wo = createMatrixFrom2DArray(decWeights.masked_mha.Wo);
        const masked_mha_output = multiplyMatrices(masked_ConcatOutput, masked_Wo);
        const masked_mha: MultiHeadAttentionData = { heads: masked_mha_heads, Wo: masked_Wo, output: masked_mha_output };
        const dec_add_norm_1_output = layerNorm(addMatrices(decoder_input, masked_mha_output));

        const enc_dec_mha_heads: AttentionHeadData[] = [];
        const enc_dec_mha_headOutputs: Matrix[] = [];
         for (let j = 0; j < h; j++) {
            const Wq = createMatrixFrom2DArray(decWeights.enc_dec_mha.heads[j].Wq);
            const Wk = createMatrixFrom2DArray(decWeights.enc_dec_mha.heads[j].Wk);
            const Wv = createMatrixFrom2DArray(decWeights.enc_dec_mha.heads[j].Wv);
            const Q = multiplyMatrices(dec_add_norm_1_output, Wq);
            const K = multiplyMatrices(finalEncoderOutput, Wk);
            const V = multiplyMatrices(finalEncoderOutput, Wv);
            const K_T = Array.from({ length: d_k }, (_, r) => Array.from({ length: encoder_seq_len }, (_, c) => K[c][r]));
            const Scores = multiplyMatrices(Q, K_T);
            const ScaledScores = scaleMatrix(Scores, Math.sqrt(d_k));
            const AttentionWeights = softmaxByRow(ScaledScores);
            const HeadOutput = multiplyMatrices(AttentionWeights, V);
            enc_dec_mha_heads.push({ Wq, Wk, Wv, Q, K, V, Scores, ScaledScores, AttentionWeights, HeadOutput });
            enc_dec_mha_headOutputs.push(HeadOutput);
        }
        const enc_dec_ConcatOutput = enc_dec_mha_headOutputs.reduce((acc, current) => acc.map((row, rIdx) => [...row, ...current[rIdx]]), Array(decoder_seq_len).fill(0).map(() => []));
        const enc_dec_Wo = createMatrixFrom2DArray(decWeights.enc_dec_mha.Wo);
        const enc_dec_mha_output = multiplyMatrices(enc_dec_ConcatOutput, enc_dec_Wo);
        const enc_dec_mha: MultiHeadAttentionData = { heads: enc_dec_mha_heads, Wo: enc_dec_Wo, output: enc_dec_mha_output };
        const dec_add_norm_2_output = layerNorm(addMatrices(dec_add_norm_1_output, enc_dec_mha_output));

        const W1 = createMatrixFrom2DArray(decWeights.ffn.W1);
        const b1 = createVectorFrom1DArray(decWeights.ffn.b1);
        const Intermediate = addBias(multiplyMatrices(dec_add_norm_2_output, W1), b1);
        const Activated = applyReLU(Intermediate);
        const W2 = createMatrixFrom2DArray(decWeights.ffn.W2);
        const b2 = createVectorFrom1DArray(decWeights.ffn.b2);
        const ffn_output = addBias(multiplyMatrices(Activated, W2), b2);
        const ffn: FFNData = { W1, b1, Intermediate, Activated, W2, b2, Output: ffn_output };
        const dec_add_norm_3_output = layerNorm(addMatrices(dec_add_norm_2_output, ffn_output));

        decoderLayers.push({ decoder_input, masked_mha, masked_mha_output, add_norm_1_output: dec_add_norm_1_output, enc_dec_mha, enc_dec_mha_output, add_norm_2_output: dec_add_norm_2_output, ffn, ffn_output, add_norm_3_output: dec_add_norm_3_output });
        currentDecoderInput = dec_add_norm_3_output;
    }
    const finalDecoderOutput = currentDecoderInput;

    const finalLinear = createMatrixFrom2DArray(weights.finalLinear);
    const logits = multiplyMatrices(finalDecoderOutput, finalLinear);
    const outputProbabilities = softmaxByRow(logits);

    // --- DECODING STAGE ---
    const decodedTokens = outputProbabilities.map(row => row.indexOf(Math.max(...row)));
    const outputText = decodedTokens.map(id => vocab[id] || "[UNK]"); // Handle unknown tokens

    return {
        inputText: tokenizedText,
        tokenizedInput,
        embeddingMatrix,
        vocab,
        inputEmbeddings,
        posEncodings,
        encoderInput,
        encoderLayers,
        finalEncoderOutput,
        outputEmbeddings,
        decoderPosEncodings,
        decoderInput,
        decoderLayers,
        finalDecoderOutput,
        finalLinear,
        logits,
        outputProbabilities,
        decodedTokens,
        outputText,
    };
};
// END OF FILE: lib/transformer.ts