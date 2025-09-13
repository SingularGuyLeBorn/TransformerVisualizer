// FILE: src/topics/attention-variants/config/matrixNames.ts

// This file is the single source of truth for all matrix and vector names in the Attention Variants topic.

const generateHeadNames = (base: string) => ({
    Wq: `${base}.Wq`, Wk: `${base}.Wk`, Wv: `${base}.Wv`,
    Q: `${base}.Q`, K: `${base}.K`, V: `${base}.V`,
    Scores: `${base}.Scores`,
    Weights: `${base}.Weights`,
    Output: `${base}.Output`,
});

export const matrixNames = {
    // Common Input
    input: (variant: string) => `${variant}.input`,

    // Standard Attention Variants (MHA, MQA, GQA)
    standard: (variant: 'mha' | 'mqa' | 'gqa') => ({
        wq: (headIndex: number) => `${variant}.wq.${headIndex}`,
        wk: (headIndex: number) => `${variant}.wk.${headIndex}`,
        wv: (headIndex: number) => `${variant}.wv.${headIndex}`,
        wo: `${variant}.wo`,
        combined: `${variant}.combined`,
        output: `${variant}.output`,
        head: (headIndex: number) => generateHeadNames(`${variant}.heads.${headIndex}`),
    }),

    // Multi-head Latent Attention (MLA)
    mla: {
        Wc_prime: 'mla.Wc_prime',
        Wc: 'mla.Wc',
        W_k_rope: 'mla.W_k_rope',
        W_q_rope: (headIndex: number) => `mla.W_q_rope.${headIndex}`,
        W_v_mla: (headIndex: number) => `mla.W_v_mla.${headIndex}`,
        C_q_prime: 'mla.C_q_prime',
        C_kv: 'mla.C_kv',
        K_rope: 'mla.K_rope',
        wo: 'mla.wo',
        combined: 'mla.combined',
        output: 'mla.output',
        head: (headIndex: number) => generateHeadNames(`mla.heads.${headIndex}`),
    }
};
// END OF FILE: src/topics/attention-variants/config/matrixNames.ts