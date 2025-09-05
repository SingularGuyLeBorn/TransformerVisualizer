// FILE: src/config/symbolMapping.ts

// This file is the single source of truth for mapping a matrix's unique name
// to its mathematical symbol parts for consistent rendering.

interface SymbolParts {
    base: string;
    superscript?: string;
    subscript?: string;
}

const SYMBOL_CONFIG: { [key: string]: SymbolParts } = {
    // Input
    inputEmbeddings: { base: 'E' },
    posEncodings: { base: 'PE' },
    encoderInput: { base: 'Z' }, // Z_0
    encoder_input: { base: 'Z' },

    // MHA Weights
    Wq: { base: 'W', superscript: 'Q' },
    Wk: { base: 'W', superscript: 'K' },
    Wv: { base: 'W', superscript: 'V' },
    Wo: { base: 'W', superscript: 'O' },

    // MHA Tensors
    Q: { base: 'Q' },
    K: { base: 'K' },
    V: { base: 'V' },
    Scores: { base: 'S' },
    ScaledScores: { base: "S'" },
    AttentionWeights: { base: 'A' },
    HeadOutput: { base: 'H' },
    ConcatOutput: { base: 'H', subscript: 'cat'},
    output: { base: 'M' },
    mha_output: { base: 'M' },

    // Add & Norm
    add_norm_1_output: { base: "Z'" },
    add_norm_2_output: { base: "Z''" },
    add_norm_3_output: { base: "Z'''" },

    // FFN
    W1: { base: 'W', subscript: '1' },
    b1: { base: 'b', subscript: '1' },
    Intermediate: { base: 'H', subscript: 'ffn' },
    Activated: { base: 'H', subscript: 'act' },
    W2: { base: 'W', subscript: '2' },
    b2: { base: 'b', subscript: '2' },
    ffn_output: { base: 'F' },

    // --- Decoder Specific ---
    outputEmbeddings: { base: 'E', subscript: 'out' },
    decoderPosEncodings: { base: 'PE', subscript: 'dec' },
    decoderInput: { base: 'Y' }, // Y_0
    decoder_input: { base: 'Y' },

    masked_mha_output: { base: 'M', subscript: 'mmha' },
    Wo_masked: { base: 'W', superscript: 'O' },

    enc_dec_mha_output: { base: 'M', subscript: 'ed' },
    Wo_enc_dec: { base: 'W', superscript: 'O' },

    // Final Output
    finalLinear: { base: 'W', subscript: 'proj' },
    logits: { base: 'L' },
    outputProbabilities: { base: 'P' },
};

/**
 * Gets the consistent mathematical symbol parts for a given matrix name.
 * @param name The full, unique name of the matrix (e.g., "encoder.0.add_norm_1_output").
 * @returns An object with base, superscript, and subscript parts.
 */
export const getSymbolParts = (name: string): SymbolParts => {
    const conceptualName = name.split('.').pop() || '';
    if (conceptualName.startsWith('Wq') || conceptualName.startsWith('Wk') || conceptualName.startsWith('Wv') || conceptualName.startsWith('Wo')) {
        return SYMBOL_CONFIG[conceptualName.substring(0,2)];
    }
    return SYMBOL_CONFIG[conceptualName] || { base: 'X' }; // Default to 'X' if not found
};
// END OF FILE: src/config/symbolMapping.ts