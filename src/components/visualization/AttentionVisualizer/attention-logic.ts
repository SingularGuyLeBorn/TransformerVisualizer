// FILE: src/components/visualization/AttentionVisualizer/attention-logic.ts
// This file contains the pure calculation logic for different attention variants.
import { AttentionVariant } from '../types'; // Import the updated type

export type Matrix = number[][];

export interface AttentionHeadData {
    Q: Matrix;
    K: Matrix;
    V: Matrix;
    Scores: Matrix;
    Weights: Matrix;
    Output: Matrix;
}

export interface AttentionResult {
    heads: AttentionHeadData[];
    CombinedOutput: Matrix;
    FinalOutput: Matrix;
}

// --- Utility Functions ---
const createSeededRandom = (seed: number) => {
    let state = seed;
    return () => {
        state = (state * 9301 + 49297) % 233280;
        return (state / 233280.0) * 2 - 1;
    };
};

const createMatrix = (rows: number, cols: number, seed: number): Matrix => {
    const random = createSeededRandom(seed);
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => parseFloat(random().toFixed(2))));
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

// --- Main Calculation Function ---
export const calculateAttention = (
    seqLen: number,
    dModel: number,
    nQHeads: number,
    nKVHeads: number,
    dHead: number,
    // [FIX] The variant can now be any of the four types, not just the original three
    variant: AttentionVariant
): AttentionResult => {
    // This function now correctly handles all non-MLA variants.
    // MLA has its own visualization component and doesn't need this calculation path.
    const input = createMatrix(seqLen, dModel, 1);
    const Wq = Array.from({ length: nQHeads }, (_, i) => createMatrix(dModel, dHead, 10 + i));
    const Wk = Array.from({ length: nKVHeads }, (_, i) => createMatrix(dModel, dHead, 100 + i));
    const Wv = Array.from({ length: nKVHeads }, (_, i) => createMatrix(dModel, dHead, 200 + i));
    const Wo = createMatrix(dModel, dModel, 999);

    const allQ = Wq.map(wq => multiplyMatrices(input, wq));
    const allK = Wk.map(wk => multiplyMatrices(input, wk));
    const allV = Wv.map(wv => multiplyMatrices(input, wv));

    const headsData: AttentionHeadData[] = [];
    const qHeadsPerKVGroup = nQHeads / nKVHeads;

    for (let i = 0; i < nQHeads; i++) {
        const Q = allQ[i];
        const kvGroupIndex = Math.floor(i / qHeadsPerKVGroup);
        const K = allK[kvGroupIndex];
        const V = allV[kvGroupIndex];

        const K_T = K[0].map((_, colIndex) => K.map(row => row[colIndex]));
        const Scores = scaleMatrix(multiplyMatrices(Q, K_T), 1 / Math.sqrt(dHead));
        const Weights = softmaxByRow(Scores);
        const Output = multiplyMatrices(Weights, V);

        headsData.push({ Q, K, V, Scores, Weights, Output });
    }

    const CombinedOutput = concatMatricesHorizontally(...headsData.map(h => h.Output));
    const FinalOutput = multiplyMatrices(CombinedOutput, Wo);

    return {
        heads: headsData,
        CombinedOutput,
        FinalOutput,
    };
};
// END OF FILE: src/components/visualization/AttentionVisualizer/attention-logic.ts