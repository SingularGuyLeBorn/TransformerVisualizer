// FILE: src/hooks/useTransformer.ts
import { useMemo } from 'react';
import { Matrix, TransformerData, EncoderLayerData, FFNData, MultiHeadAttentionData, AttentionHeadData, Vector, DecoderLayerData } from '../types';

// --- Utility Functions ---

const createRandomMatrix = (rows: number, cols: number): Matrix => {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => parseFloat((Math.random() * 2 - 1).toFixed(2)))
  );
};

const createRandomVector = (size: number): Vector => {
  return Array.from({ length: size }, () => parseFloat((Math.random() * 2 - 1).toFixed(2)));
}

const addMatrices = (A: Matrix, B: Matrix): Matrix => {
  return A.map((row, i) =>
    row.map((val, j) => parseFloat((val + B[i][j]).toFixed(2)))
  );
};

const multiplyMatrices = (A: Matrix, B: Matrix): Matrix => {
  const rowsA = A.length;
  const colsA = A[0].length;
  const colsB = B[0].length;
  const result: Matrix = Array(rowsA).fill(0).map(() => Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += A[i][k] * B[k][j];
      }
      result[i][j] = parseFloat(sum.toFixed(2));
    }
  }
  return result;
};

const scaleMatrix = (A: Matrix, scalar: number): Matrix => {
    return A.map(row => row.map(val => parseFloat((val / scalar).toFixed(2))));
}

const softmaxByRow = (A: Matrix): Matrix => {
    return A.map(row => {
        const maxVal = Math.max(...row.filter(v => isFinite(v)));
        const exps = row.map(val => isFinite(val) ? Math.exp(val - maxVal) : 0);
        const sumExps = exps.reduce((a, b) => a + b, 0);
        if (sumExps === 0) return row.map(() => 1 / row.length); // Avoid division by zero
        return exps.map(exp => parseFloat((exp / sumExps).toFixed(2)));
    });
}

const layerNorm = (A: Matrix): Matrix => {
    return A.map(row => {
        const mean = row.reduce((a,b) => a+b, 0) / row.length;
        const variance = row.map(x => (x - mean) ** 2).reduce((a,b) => a+b,0) / row.length;
        const std = Math.sqrt(variance + 1e-5);
        return row.map(x => parseFloat(((x - mean) / std).toFixed(2)));
    });
}

const applyReLU = (A: Matrix): Matrix => {
    return A.map(row => row.map(val => Math.max(0, val)));
}

const addBias = (A: Matrix, b: Vector): Matrix => {
    return A.map(row => row.map((val, j) => parseFloat((val + b[j]).toFixed(2))));
}

const applyMask = (A: Matrix, maskValue = -Infinity): Matrix => {
    return A.map((row, i) =>
        row.map((val, j) => (j > i ? maskValue : val))
    );
};


// --- Main Hook ---

interface Dims {
    d_model: number;
    h: number;
    seq_len: number;
    n_layers: number;
    d_ff: number;
}

export const useTransformer = (dims: Dims): TransformerData | null => {

  return useMemo(() => {
    try {
        const { d_model, h, seq_len, n_layers, d_ff } = dims;
        if (d_model % h !== 0) return null;
        const d_k = d_model / h;

        // --- ENCODER ---
        const inputEmbeddings = createRandomMatrix(seq_len, d_model);
        const posEncodings: Matrix = Array.from({ length: seq_len }, (_, pos) =>
          Array.from({ length: d_model }, (_, i) =>
            parseFloat((i % 2 === 0
              ? Math.sin(pos / (10000 ** (i / d_model)))
              : Math.cos(pos / (10000 ** ((i - 1) / d_model)))).toFixed(2))
          )
        );
        const encoderInput = addMatrices(inputEmbeddings, posEncodings);

        let currentEncoderInput = encoderInput;
        const encoderLayers: EncoderLayerData[] = [];

        for (let i = 0; i < n_layers; i++) {
            const encoder_input = currentEncoderInput;
            const heads: AttentionHeadData[] = [];
            const headOutputs: Matrix[] = [];
            for(let j=0; j < h; j++) {
                const Wq = createRandomMatrix(d_model, d_k);
                const Wk = createRandomMatrix(d_model, d_k);
                const Wv = createRandomMatrix(d_model, d_k);
                const Q = multiplyMatrices(encoder_input, Wq);
                const K = multiplyMatrices(encoder_input, Wk);
                const V = multiplyMatrices(encoder_input, Wv);
                const K_T = Array.from({ length: d_k }, (_, r) => Array.from({ length: seq_len }, (_, c) => K[c][r]));
                const Scores = multiplyMatrices(Q, K_T);
                const ScaledScores = scaleMatrix(Scores, Math.sqrt(d_k));
                const AttentionWeights = softmaxByRow(ScaledScores);
                const HeadOutput = multiplyMatrices(AttentionWeights, V);
                heads.push({ Wq, Wk, Wv, Q, K, V, Scores, ScaledScores, AttentionWeights, HeadOutput });
                headOutputs.push(HeadOutput);
            }
            const ConcatOutput = headOutputs.reduce((acc, current) => acc.map((row, rIdx) => [...row, ...current[rIdx]]), Array(seq_len).fill(0).map(() => []));
            const Wo = createRandomMatrix(d_model, d_model);
            const mha_output = multiplyMatrices(ConcatOutput, Wo);
            const mha: MultiHeadAttentionData = { heads, Wo, output: mha_output };
            const add_norm_1_output = layerNorm(addMatrices(encoder_input, mha_output));
            const W1 = createRandomMatrix(d_model, d_ff);
            const b1 = createRandomVector(d_ff);
            const Intermediate = addBias(multiplyMatrices(add_norm_1_output, W1), b1);
            const Activated = applyReLU(Intermediate);
            const W2 = createRandomMatrix(d_ff, d_model);
            const b2 = createRandomVector(d_model);
            const ffn_output = addBias(multiplyMatrices(Activated, W2), b2);
            const ffn: FFNData = { W1, b1, Intermediate, Activated, W2, b2, Output: ffn_output };
            const add_norm_2_output = layerNorm(addMatrices(add_norm_1_output, ffn_output));
            encoderLayers.push({ encoder_input, mha, mha_output, add_norm_1_output, ffn, ffn_output, add_norm_2_output });
            currentEncoderInput = add_norm_2_output;
        }
        const finalEncoderOutput = currentEncoderInput;

        // --- DECODER ---
        const outputEmbeddings = createRandomMatrix(seq_len, d_model);
        const decoderPosEncodings = posEncodings;
        const decoderInput = addMatrices(outputEmbeddings, decoderPosEncodings);

        let currentDecoderInput = decoderInput;
        const decoderLayers: DecoderLayerData[] = [];

        for (let i = 0; i < n_layers; i++) {
            const decoder_input = currentDecoderInput;

            const masked_mha_heads: AttentionHeadData[] = [];
            const masked_mha_headOutputs: Matrix[] = [];
            for (let j = 0; j < h; j++) {
                const Wq = createRandomMatrix(d_model, d_k);
                const Wk = createRandomMatrix(d_model, d_k);
                const Wv = createRandomMatrix(d_model, d_k);
                const Q = multiplyMatrices(decoder_input, Wq);
                const K = multiplyMatrices(decoder_input, Wk);
                const V = multiplyMatrices(decoder_input, Wv);
                const K_T = Array.from({ length: d_k }, (_, r) => Array.from({ length: seq_len }, (_, c) => K[c][r]));
                const Scores = applyMask(multiplyMatrices(Q, K_T));
                const ScaledScores = scaleMatrix(Scores, Math.sqrt(d_k));
                const AttentionWeights = softmaxByRow(ScaledScores);
                const HeadOutput = multiplyMatrices(AttentionWeights, V);
                masked_mha_heads.push({ Wq, Wk, Wv, Q, K, V, Scores, ScaledScores, AttentionWeights, HeadOutput });
                masked_mha_headOutputs.push(HeadOutput);
            }
            const masked_ConcatOutput = masked_mha_headOutputs.reduce((acc, current) => acc.map((row, rIdx) => [...row, ...current[rIdx]]), Array(seq_len).fill(0).map(() => []));
            const masked_Wo = createRandomMatrix(d_model, d_model);
            const masked_mha_output = multiplyMatrices(masked_ConcatOutput, masked_Wo);
            const masked_mha: MultiHeadAttentionData = { heads: masked_mha_heads, Wo: masked_Wo, output: masked_mha_output };
            const dec_add_norm_1_output = layerNorm(addMatrices(decoder_input, masked_mha_output));

            const enc_dec_mha_heads: AttentionHeadData[] = [];
            const enc_dec_mha_headOutputs: Matrix[] = [];
             for (let j = 0; j < h; j++) {
                const Wq = createRandomMatrix(d_model, d_k);
                const Wk = createRandomMatrix(d_model, d_k);
                const Wv = createRandomMatrix(d_model, d_k);
                const Q = multiplyMatrices(dec_add_norm_1_output, Wq);
                const K = multiplyMatrices(finalEncoderOutput, Wk);
                const V = multiplyMatrices(finalEncoderOutput, Wv);
                const K_T = Array.from({ length: d_k }, (_, r) => Array.from({ length: seq_len }, (_, c) => K[c][r]));
                const Scores = multiplyMatrices(Q, K_T);
                const ScaledScores = scaleMatrix(Scores, Math.sqrt(d_k));
                const AttentionWeights = softmaxByRow(ScaledScores);
                const HeadOutput = multiplyMatrices(AttentionWeights, V);
                enc_dec_mha_heads.push({ Wq, Wk, Wv, Q, K, V, Scores, ScaledScores, AttentionWeights, HeadOutput });
                enc_dec_mha_headOutputs.push(HeadOutput);
            }
            const enc_dec_ConcatOutput = enc_dec_mha_headOutputs.reduce((acc, current) => acc.map((row, rIdx) => [...row, ...current[rIdx]]), Array(seq_len).fill(0).map(() => []));
            const enc_dec_Wo = createRandomMatrix(d_model, d_model);
            const enc_dec_mha_output = multiplyMatrices(enc_dec_ConcatOutput, enc_dec_Wo);
            const enc_dec_mha: MultiHeadAttentionData = { heads: enc_dec_mha_heads, Wo: enc_dec_Wo, output: enc_dec_mha_output };
            const dec_add_norm_2_output = layerNorm(addMatrices(dec_add_norm_1_output, enc_dec_mha_output));

            const W1 = createRandomMatrix(d_model, d_ff);
            const b1 = createRandomVector(d_ff);
            const Intermediate = addBias(multiplyMatrices(dec_add_norm_2_output, W1), b1);
            const Activated = applyReLU(Intermediate);
            const W2 = createRandomMatrix(d_ff, d_model);
            const b2 = createRandomVector(d_model);
            const ffn_output = addBias(multiplyMatrices(Activated, W2), b2);
            const ffn: FFNData = { W1, b1, Intermediate, Activated, W2, b2, Output: ffn_output };
            const dec_add_norm_3_output = layerNorm(addMatrices(dec_add_norm_2_output, ffn_output));

            decoderLayers.push({ decoder_input, masked_mha, masked_mha_output, add_norm_1_output: dec_add_norm_1_output, enc_dec_mha, enc_dec_mha_output, add_norm_2_output: dec_add_norm_2_output, ffn, ffn_output, add_norm_3_output: dec_add_norm_3_output });
            currentDecoderInput = dec_add_norm_3_output;
        }
        const finalDecoderOutput = currentDecoderInput;

        const vocab_size = 50;
        const finalLinear = createRandomMatrix(d_model, vocab_size);
        const logits = multiplyMatrices(finalDecoderOutput, finalLinear);
        const outputProbabilities = softmaxByRow(logits);

        return {
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
            outputProbabilities
        };
    } catch (e) {
        console.error("Error during transformer calculation:", e);
        return null;
    }
  }, [dims]);
};
// END OF FILE: src/hooks/useTransformer.ts