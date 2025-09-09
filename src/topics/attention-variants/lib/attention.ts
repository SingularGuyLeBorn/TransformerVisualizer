// FILE: src/topics/attention-variants/lib/attention.ts
import { AttentionData, AttentionVariantData, Matrix, Vector, MLAData } from '../types';

// ----------------- 辅助数学函数 -----------------

const createMatrix = (rows: number, cols: number, seed: number): Matrix => {
    const random = createSeededRandom(seed);
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => parseFloat(random().toFixed(2))));
};

const createSeededRandom = (seed: number) => {
    let state = seed;
    return () => {
        state = (state * 9301 + 49297) % 233280;
        return (state / 233280.0) * 2 - 1;
    };
};

const multiplyMatrices = (A: Matrix, B: Matrix): Matrix => {
    const rowsA = A.length, colsA = A[0].length, colsB = B[0].length;
    const C: Matrix = Array(rowsA).fill(0).map(() => Array(colsB).fill(0));
    for (let i = 0; i < rowsA; i++) {
        for (let j = 0; j < colsB; j++) {
            let sum = 0;
            for (let k = 0; k < colsA; k++) {
                sum += A[i][k] * B[k][j];
            }
            C[i][j] = sum;
        }
    }
    return C;
};

const scaleMatrix = (A: Matrix, scalar: number): Matrix => A.map(row => row.map(val => val * scalar));

const softmaxByRow = (A: Matrix): Matrix => {
    return A.map(row => {
        const maxVal = Math.max(...row);
        const exps = row.map(val => Math.exp(val - maxVal));
        const sumExps = exps.reduce((a, b) => a + b, 0);
        return exps.map(exp => exp / sumExps);
    });
};

const concatMatricesHorizontally = (...matrices: Matrix[]): Matrix => {
    const numRows = matrices[0].length;
    const result: Matrix = Array(numRows).fill(0).map(() => []);
    for (let i = 0; i < numRows; i++) {
        for (const matrix of matrices) {
            result[i].push(...matrix[i]);
        }
    }
    return result;
};

// ----------------- 核心计算逻辑 -----------------

interface Dims {
    seq_len: number;
    d_model: number;
    d_head: number;
    n_q_heads: number;
    n_kv_heads: number;
    d_c: number;
    d_c_prime: number;
    d_rope: number;
}

function calculateAttention(input: Matrix, Wq: Matrix[], Wk: Matrix[], Wv: Matrix[], Wo: Matrix, dims: Dims, n_kv_heads_variant: number): AttentionVariantData {
    const { seq_len, d_head, n_q_heads } = dims;
    const q_heads_per_kv = n_q_heads / n_kv_heads_variant;

    const Q_proj = concatMatricesHorizontally(...Wq.map(wq => multiplyMatrices(input, wq)));
    const K_proj = concatMatricesHorizontally(...Wk.slice(0, n_kv_heads_variant).map(wk => multiplyMatrices(input, wk)));
    const V_proj = concatMatricesHorizontally(...Wv.slice(0, n_kv_heads_variant).map(wv => multiplyMatrices(input, wv)));

    const heads = [];
    for (let i = 0; i < n_q_heads; i++) {
        const q_head = Q_proj.map(row => row.slice(i * d_head, (i + 1) * d_head));

        const kv_group_index = Math.floor(i / q_heads_per_kv);
        const k_head = K_proj.map(row => row.slice(kv_group_index * d_head, (kv_group_index + 1) * d_head));
        const v_head = V_proj.map(row => row.slice(kv_group_index * d_head, (kv_group_index + 1) * d_head));

        const k_head_T = k_head[0].map((_, colIndex) => k_head.map(row => row[colIndex]));

        const scores = scaleMatrix(multiplyMatrices(q_head, k_head_T), 1 / Math.sqrt(d_head));
        const weights = softmaxByRow(scores);
        const output = multiplyMatrices(weights, v_head);

        heads.push({ Q: q_head, K: k_head, V: v_head, Scores: scores, Weights: weights, Output: output });
    }

    const CombinedOutput = concatMatricesHorizontally(...heads.map(h => h.Output));
    const FinalOutput = multiplyMatrices(CombinedOutput, Wo);

    return { Q_proj, K_proj, V_proj, heads, CombinedOutput, FinalOutput };
}

function calculateMLA(input: Matrix, Wo: Matrix, Wc: Matrix, Wc_prime: Matrix, W_k_rope: Matrix, W_q_rope: Matrix[], W_v_mla: Matrix[], Wk: Matrix[], Wq: Matrix[], dims: Dims): MLAData {
    const { seq_len, d_head, n_q_heads, d_c, d_c_prime, d_rope } = dims;

    const C_q_prime = multiplyMatrices(input, Wc_prime);
    const C_kv = multiplyMatrices(input, Wc);
    const K_rope = multiplyMatrices(input, W_k_rope); // RoPE part from original input

    const heads = [];
    for(let i=0; i < n_q_heads; i++) {
        // Reconstruct Q, K, V from latent vectors
        const Q_content = multiplyMatrices(C_q_prime, Wq[i]);
        const Q_rope = multiplyMatrices(C_q_prime, W_q_rope[i]);
        const Q = concatMatricesHorizontally(Q_content, Q_rope);

        const K_content = multiplyMatrices(C_kv, Wk[i]);
        const K = concatMatricesHorizontally(K_content, K_rope);

        const V = multiplyMatrices(C_kv, W_v_mla[i]);

        const K_T = K[0].map((_, colIndex) => K.map(row => row[colIndex]));

        const scores = scaleMatrix(multiplyMatrices(Q, K_T), 1 / Math.sqrt(d_head + d_rope));
        const weights = softmaxByRow(scores);
        const output = multiplyMatrices(weights, V);
        heads.push({ Q, K, V, Scores: scores, Weights: weights, Output: output });
    }
    const CombinedOutput = concatMatricesHorizontally(...heads.map(h => h.Output));
    const FinalOutput = multiplyMatrices(CombinedOutput, Wo);

    return { C_q_prime, C_kv, K_rope, heads, CombinedOutput, FinalOutput };
}


export const calculateAttentionVariants = (dims: Dims): AttentionData | null => {
    const { seq_len, d_model, d_head, n_q_heads, n_kv_heads, d_c, d_c_prime, d_rope } = dims;

    if (d_model !== n_q_heads * d_head) return null;

    const input = createMatrix(seq_len, d_model, 1);
    const Wq = Array.from({ length: n_q_heads }, (_, i) => createMatrix(d_model, d_head, 10 + i));
    const Wk = Array.from({ length: n_q_heads }, (_, i) => createMatrix(d_model, d_head, 100 + i));
    const Wv = Array.from({ length: n_q_heads }, (_, i) => createMatrix(d_model, d_head, 200 + i));
    const Wo = createMatrix(d_model, d_model, 999);

    const mha = calculateAttention(input, Wq, Wk, Wv, Wo, dims, n_q_heads);
    const mqa = calculateAttention(input, Wq, Wk, Wv, Wo, dims, 1);
    const gqa = calculateAttention(input, Wq, Wk, Wv, Wo, dims, n_kv_heads);

    // MLA specific weights
    const Wc = createMatrix(d_model, d_c, 300);
    const Wc_prime = createMatrix(d_model, d_c_prime, 400);
    const W_k_rope = createMatrix(d_model, d_rope, 500);
    const W_q_rope = Array.from({ length: n_q_heads }, (_, i) => createMatrix(d_c_prime, d_rope, 600 + i));
    const W_v_mla = Array.from({ length: n_q_heads }, (_, i) => createMatrix(d_c, d_head, 700 + i));
    // Re-using Wq and Wk for content projection part of MLA
    const Wq_mla = Array.from({ length: n_q_heads }, (_, i) => createMatrix(d_c_prime, d_head, 800 + i));
    const Wk_mla = Array.from({ length: n_q_heads }, (_, i) => createMatrix(d_c, d_head, 900 + i));
    // Re-using Wo for final projection
    const Wo_mla = createMatrix(n_q_heads * d_head, d_model, 1000);

    const mla = calculateMLA(input, Wo_mla, Wc, Wc_prime, W_k_rope, W_q_rope, W_v_mla, Wk_mla, Wq_mla, dims);


    return { input, Wq, Wk, Wv, Wo, Wc, Wc_prime, W_k_rope, W_q_rope, W_v_mla, mha, mqa, gqa, mla };
};
// END OF FILE: src/topics/attention-variants/lib/attention.ts