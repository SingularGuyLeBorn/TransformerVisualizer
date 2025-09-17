// FILE: src/components/visualization/types.ts

// These types are for the higher-level animated visualization components.

export type Vector = number[];

export type MatMulStep =
    | { type: 'idle' | 'start' }
    // Steps that correspond to a specific index in the vectors
    | { type: 'highlight-pair', index: number }
    | { type: 'multiply', index: number, product: number }
    | { type: 'accumulate', index: number, product: number, cumulativeSum: number }
    // The final step, which summarizes the result and has no specific index
    | { type: 'finish', cumulativeSum: number };

export type ElementWiseOpStep =
    | { type: 'idle' | 'start' | 'finish' }
    | { type: 'highlight', col: number }
    | { type: 'calculate', col: number };
// END OF FILE: src/components/visualization/types.ts