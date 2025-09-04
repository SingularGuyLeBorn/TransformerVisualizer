// FILE: src/hooks/useTransformer.ts
import { useMemo } from 'react';
import { Matrix, TransformerData, EncoderLayerData, FFNData, MultiHeadAttentionData, AttentionHeadData, Vector } from '../types';

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
        const maxVal = Math.max(...row);
        const exps = row.map(val => Math.exp(val - maxVal));
        const sumExps = exps.reduce((a, b) => a + b, 0);
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

        const inputEmbeddings = createRandomMatrix(seq_len, d_model);
        const posEncodings: Matrix = Array.from({ length: seq_len }, (_, pos) =>
          Array.from({ length: d_model }, (_, i) =>
            parseFloat((i % 2 === 0
              ? Math.sin(pos / (10000 ** (i / d_model)))
              : Math.cos(pos / (10000 ** ((i - 1) / d_model)))).toFixed(2))
          )
        );
        const encoderInput = addMatrices(inputEmbeddings, posEncodings);

        let currentInput = encoderInput;
        const encoderLayers: EncoderLayerData[] = [];

        for (let i = 0; i < n_layers; i++) {
            const encoder_input = currentInput;

            // MHA
            const heads: AttentionHeadData[] = [];
            const headOutputs: Matrix[] = [];
            for(let j=0; j < h; j++) {
                const Wq = createRandomMatrix(d_model, d_k);
                const Wk = createRandomMatrix(d_model, d_k);
                const Wv = createRandomMatrix(d_model, d_k);

                const Q = multiplyMatrices(encoder_input, Wq);
                const K = multiplyMatrices(encoder_input, Wk);
                const V = multiplyMatrices(encoder_input, Wv);

                const K_T: Matrix = Array.from({ length: d_k }, (_, r) => Array.from({ length: seq_len }, (_, c) => K[c][r]));
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
            const mha: MultiHeadAttentionData = { heads, Wo, Output: mha_output };

            const add_norm_1_sum = addMatrices(encoder_input, mha_output);
            const add_norm_1_output = layerNorm(add_norm_1_sum);

            const W1 = createRandomMatrix(d_model, d_ff);
            const b1 = createRandomVector(d_ff);
            const Intermediate = addBias(multiplyMatrices(add_norm_1_output, W1), b1);
            const Activated = applyReLU(Intermediate);
            const W2 = createRandomMatrix(d_ff, d_model);
            const b2 = createRandomVector(d_model);
            const ffn_output = addBias(multiplyMatrices(Activated, W2), b2);
            const ffn: FFNData = { W1, b1, Intermediate, Activated, W2, b2, Output: ffn_output };

            const add_norm_2_sum = addMatrices(add_norm_1_output, ffn_output);
            const add_norm_2_output = layerNorm(add_norm_2_sum);

            encoderLayers.push({
                encoder_input,
                mha,
                mha_output,
                add_norm_1_output,
                ffn,
                ffn_output,
                add_norm_2_output
            });

            currentInput = add_norm_2_output;
        }

        return {
            inputEmbeddings,
            posEncodings,
            encoderInput,
            encoderLayers
        };
    } catch (e) {
        console.error("Error during transformer calculation:", e);
        return null;
    }
  }, [dims]);
};
// END OF FILE: src/hooks/useTransformer.ts