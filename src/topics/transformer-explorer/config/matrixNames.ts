// FILE: src/topics/transformer-explorer/config/matrixNames.ts
// This file is the single source of truth for all matrix and vector names.

const generateHeadNames = (base: string) => ({
    Wq: `${base}.Wq`, Wk: `${base}.Wk`, Wv: `${base}.Wv`,
    Q: `${base}.Q`, K: `${base}.K`, V: `${base}.V`,
    Scores: `${base}.Scores`, ScaledScores: `${base}.ScaledScores`,
    AttentionWeights: `${base}.AttentionWeights`, HeadOutput: `${base}.HeadOutput`,
});

export const MATRIX_NAMES = {
    // Input
    inputEmbeddings: 'inputEmbeddings',
    posEncodings: 'posEncodings',
    encoderInput: 'encoderInput', // Deprecated, use layer(0).encoder_input
    finalEncoderOutput: 'finalEncoderOutput',

    // Encoder Layer
    layer: (layerIndex: number) => ({
        encoder_input: `encoder.${layerIndex}.encoder_input`,
        mha_output: `encoder.${layerIndex}.mha.output`,
        Wo: `encoder.${layerIndex}.mha.Wo`,
        add_norm_1_output: `encoder.${layerIndex}.add_norm_1_output`,
        W1: `encoder.${layerIndex}.ffn.W1`, b1: `encoder.${layerIndex}.ffn.b1`,
        Intermediate: `encoder.${layerIndex}.ffn.Intermediate`, Activated: `encoder.${layerIndex}.ffn.Activated`,
        W2: `encoder.${layerIndex}.ffn.W2`, b2: `encoder.${layerIndex}.ffn.b2`,
        ffn_output: `encoder.${layerIndex}.ffn.output`,
        add_norm_2_output: `encoder.${layerIndex}.add_norm_2_output`,
    }),

    // Encoder Head
    head: (layerIndex: number, headIndex: number) => generateHeadNames(`encoder.${layerIndex}.mha.h${headIndex}`),
    concatOutput: (layerIndex: number) => `encoder.${layerIndex}.mha.ConcatOutput`,

    // Decoder Input
    outputEmbeddings: 'outputEmbeddings',
    decoderPosEncodings: 'decoderPosEncodings',
    decoderInput: 'decoderInput', // Deprecated, use decoderLayer(0).decoder_input

    // Decoder Layer
    decoderLayer: (layerIndex: number) => ({
        decoder_input: `decoder.${layerIndex}.decoder_input`,

        masked_mha_output: `decoder.${layerIndex}.masked_mha.output`,
        Wo_masked: `decoder.${layerIndex}.masked_mha.Wo`,
        add_norm_1_output: `decoder.${layerIndex}.add_norm_1_output`,

        enc_dec_mha_output: `decoder.${layerIndex}.enc_dec_mha.output`,
        Wo_enc_dec: `decoder.${layerIndex}.enc_dec_mha.Wo`,
        add_norm_2_output: `decoder.${layerIndex}.add_norm_2_output`,

        W1: `decoder.${layerIndex}.ffn.W1`, b1: `decoder.${layerIndex}.ffn.b1`,
        Intermediate: `decoder.${layerIndex}.ffn.Intermediate`, Activated: `decoder.${layerIndex}.ffn.Activated`,
        W2: `decoder.${layerIndex}.ffn.W2`, b2: `decoder.${layerIndex}.ffn.b2`,
        ffn_output: `decoder.${layerIndex}.ffn.output`,
        add_norm_3_output: `decoder.${layerIndex}.add_norm_3_output`,
    }),

    // Decoder Heads
    maskedMhaHead: (layerIndex: number, headIndex: number) => generateHeadNames(`decoder.${layerIndex}.masked_mha.h${headIndex}`),
    encDecMhaHead: (layerIndex: number, headIndex: number) => generateHeadNames(`decoder.${layerIndex}.enc_dec_mha.h${headIndex}`),

    // Final Output
    finalLinear: 'finalLinear',
    logits: 'logits',
    outputProbabilities: 'outputProbabilities',
};
// END OF FILE: src/topics/transformer-explorer/config/matrixNames.ts