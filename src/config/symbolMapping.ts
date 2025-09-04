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
    encoderInput: { base: 'Z' },
    encoder_input: { base: 'Z' }, // Alias for layers

    // MHA Weights
    Wq: { base: 'W', superscript: 'Q', subscript: 'q' },
    Wk: { base: 'W', superscript: 'K', subscript: 'k' },
    Wv: { base: 'W', superscript: 'V', subscript: 'v' },
    Wo: { base: 'W', superscript: 'O', subscript: 'o' },

    // MHA Tensors
    Q: { base: 'Q' },
    K: { base: 'K' },
    V: { base: 'V' },
    Scores: { base: 'S' },
    ScaledScores: { base: "S'" },
    AttentionWeights: { base: 'A' },
    HeadOutput: { base: 'H' },
    ConcatOutput: { base: 'H_{cat}'},
    mha_output: { base: 'M' },

    // Add & Norm
    add_norm_1_output: { base: "Z'" },
    add_norm_2_output: { base: "Z''" },

    // FFN
    W1: { base: 'W', subscript: '1' },
    b1: { base: 'b', subscript: '1' },
    Intermediate: { base: 'H_{ffn}' },
    Activated: { base: 'H_{act}' },
    W2: { base: 'W', subscript: '2' },
    b2: { base: 'b', subscript: '2' },
    ffn_output: { base: 'F' },
};

/**
 * Gets the consistent mathematical symbol parts for a given matrix name.
 * @param name The full, unique name of the matrix (e.g., "encoder.0.add_norm_1_output").
 * @returns An object with base, superscript, and subscript parts.
 */
export const getSymbolParts = (name: string): SymbolParts => {
    const conceptualName = name.split('.').pop() || '';
    return SYMBOL_CONFIG[conceptualName] || { base: 'X' }; // Default to 'X' if not found
};
// END OF FILE: src/config/symbolMapping.ts