// FILE: src/config/matrixNames.ts
// This file is the single source of truth for all matrix and vector names.

export const MATRIX_NAMES = {
    // Input
    inputEmbeddings: 'inputEmbeddings',
    posEncodings: 'posEncodings',
    encoderInput: 'encoderInput',

    // Layer-specific names (functions to generate names for a specific layer)
    layer: (layerIndex: number) => ({
        // Inputs
        encoder_input: `encoder.${layerIndex}.encoder_input`,

        // MHA
        mha_output: `encoder.${layerIndex}.mha.output`,
        Wo: `encoder.${layerIndex}.mha.Wo`,

        // Add & Norm 1
        add_norm_1_output: `encoder.${layerIndex}.add_norm_1_output`,

        // FFN
        W1: `encoder.${layerIndex}.ffn.W1`,
        b1: `encoder.${layerIndex}.ffn.b1`,
        Intermediate: `encoder.${layerIndex}.ffn.Intermediate`,
        Activated: `encoder.${layerIndex}.ffn.Activated`,
        W2: `encoder.${layerIndex}.ffn.W2`,
        b2: `encoder.${layerIndex}.ffn.b2`,
        ffn_output: `encoder.${layerIndex}.ffn.output`,

        // Add & Norm 2
        add_norm_2_output: `encoder.${layerIndex}.add_norm_2_output`,
    }),

    // Head-specific names
    head: (layerIndex: number, headIndex: number) => ({
        Wq: `encoder.${layerIndex}.mha.h${headIndex}.Wq`,
        Wk: `encoder.${layerIndex}.mha.h${headIndex}.Wk`,
        Wv: `encoder.${layerIndex}.mha.h${headIndex}.Wv`,
        Q: `encoder.${layerIndex}.mha.h${headIndex}.Q`,
        K: `encoder.${layerIndex}.mha.h${headIndex}.K`,
        V: `encoder.${layerIndex}.mha.h${headIndex}.V`,
        Scores: `encoder.${layerIndex}.mha.h${headIndex}.Scores`,
        ScaledScores: `encoder.${layerIndex}.mha.h${headIndex}.ScaledScores`,
        AttentionWeights: `encoder.${layerIndex}.mha.h${headIndex}.AttentionWeights`,
        HeadOutput: `encoder.${layerIndex}.mha.h${headIndex}.HeadOutput`,
    }),

    // A conceptual name for the concatenated heads, used only in explanations
    concatOutput: (layerIndex: number) => `encoder.${layerIndex}.mha.ConcatOutput`,
};

// END OF FILE: src/config/matrixNames.ts