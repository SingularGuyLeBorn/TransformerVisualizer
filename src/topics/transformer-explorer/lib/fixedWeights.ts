// FILE: lib/fixedWeights.ts
// This file provides a deterministic set of weights for the Transformer model.
// All values are hardcoded to ensure the visualization is reproducible.
// This replaces the previous random number generation.

interface Dims {
    d_model: number;
    h: number;
    seq_len: number;
    n_layers: number;
    d_ff: number;
}

// A simple seeding function for pseudo-random but deterministic numbers.
const createSeededRandom = (seed: number) => {
    let state = seed;
    return () => {
        state = (state * 9301 + 49297) % 233280;
        return (state / 233280.0) * 2 - 1; // Return value between -1 and 1
    };
};

const createFixedMatrix = (rows: number, cols: number, seed: number): number[][] => {
    const random = createSeededRandom(seed);
    return Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => random())
    );
};

const createFixedVector = (size: number, seed: number): number[] => {
    const random = createSeededRandom(seed);
    return Array.from({ length: size }, () => random());
};

export const fixedWeights = (dims: Dims) => {
    const { d_model, h, n_layers, d_ff, seq_len } = dims;
    const d_k = d_model / h;

    const VOCAB_SIZE = 16;
    const vocab: { [key: number]: string } = {
        0: '<PAD>', 1: '<SOS>', 2: '<EOS>', 3: 'I', 4: 'am', 5: 'a', 6: 'student',
        7: '我', 8: '是', 9: '一个', 10: '学生', 11: 'he', 12: 'she', 13: 'is',
        14: 'good', 15: '[UNK]'
    };

    const embeddingMatrix = createFixedMatrix(VOCAB_SIZE, d_model, 1);
    const posEncodings = Array.from({ length: 10 }, (_, pos) => // Max seq_len of 10
      Array.from({ length: d_model }, (_, i) =>
        i % 2 === 0
          ? Math.sin(pos / (10000 ** (i / d_model)))
          : Math.cos(pos / (10000 ** ((i - 1) / d_model)))
      )
    );

    const encoderLayers = Array.from({ length: n_layers }, (_, l) => ({
        mha: {
            heads: Array.from({ length: h }, (_, head) => ({
                Wq: createFixedMatrix(d_model, d_k, 100 + l * 10 + head * 3 + 0),
                Wk: createFixedMatrix(d_model, d_k, 100 + l * 10 + head * 3 + 1),
                Wv: createFixedMatrix(d_model, d_k, 100 + l * 10 + head * 3 + 2),
            })),
            Wo: createFixedMatrix(d_model, d_model, 150 + l),
        },
        ffn: {
            W1: createFixedMatrix(d_model, d_ff, 200 + l * 2 + 0),
            b1: createFixedVector(d_ff, 201 + l * 2 + 0),
            W2: createFixedMatrix(d_ff, d_model, 200 + l * 2 + 1),
            b2: createFixedVector(d_model, 201 + l * 2 + 1),
        },
    }));

    const decoderLayers = Array.from({ length: n_layers }, (_, l) => ({
        masked_mha: {
            heads: Array.from({ length: h }, (_, head) => ({
                Wq: createFixedMatrix(d_model, d_k, 300 + l * 20 + head * 3 + 0),
                Wk: createFixedMatrix(d_model, d_k, 300 + l * 20 + head * 3 + 1),
                Wv: createFixedMatrix(d_model, d_k, 300 + l * 20 + head * 3 + 2),
            })),
            Wo: createFixedMatrix(d_model, d_model, 350 + l),
        },
        enc_dec_mha: {
            heads: Array.from({ length: h }, (_, head) => ({
                Wq: createFixedMatrix(d_model, d_k, 400 + l * 20 + head * 3 + 0),
                Wk: createFixedMatrix(d_model, d_k, 400 + l * 20 + head * 3 + 1),
                Wv: createFixedMatrix(d_model, d_k, 400 + l * 20 + head * 3 + 2),
            })),
            Wo: createFixedMatrix(d_model, d_model, 450 + l),
        },
        ffn: {
            W1: createFixedMatrix(d_model, d_ff, 500 + l * 2 + 0),
            b1: createFixedVector(d_ff, 501 + l * 2 + 0),
            W2: createFixedMatrix(d_ff, d_model, 500 + l * 2 + 1),
            b2: createFixedVector(d_model, 501 + l * 2 + 1),
        },
    }));

    const finalLinear = createFixedMatrix(d_model, VOCAB_SIZE, 999);

    return {
        vocab,
        embeddingMatrix,
        posEncodings,
        encoderLayers,
        decoderLayers,
        finalLinear,
    };
};
// END OF FILE: lib/fixedWeights.ts