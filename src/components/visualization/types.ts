// FILE: src/components/visualization/types.ts
export type Vector = number[];
export type Matrix = number[][];

export type MatMulStep =
    | { type: 'idle' | 'start' }
    | { type: 'highlight-pair', index: number }
    | { type: 'multiply', index: number, product: number }
    | { type: 'accumulate', index: number, product: number, cumulativeSum: number }
    | { type: 'finish', cumulativeSum: number };

export type ElementWiseOpStep =
    | { type: 'idle' | 'start' | 'finish' }
    | { type: 'highlight', col: number }
    | { type: 'calculate', col: number };

export type SoftmaxStep =
    | { type: 'idle' | 'start' | 'finish' }
    | { type: 'highlight-max', value: number }
    | { type: 'subtract-max', index: number }
    | { type: 'exponentiate', index: number }
    | { type: 'sum-exps', value: number }
    | { type: 'normalize', index: number };

export type LayerNormStep =
    | { type: 'idle' | 'start' | 'finish' }
    | { type: 'accumulate-mean', index: number, sum: number }
    | { type: 'calculate-mean', value: number }
    | { type: 'accumulate-variance', index: number, sum: number }
    | { type: 'calculate-variance', value: number }
    | { type: 'apply-norm', index: number };

export type ActivationFunctionType = 'relu' | 'gelu' | 'silu' | 'swiglu';

export type ActivationStep =
    | { type: 'idle' | 'start' | 'finish' }
    | { type: 'process', index: number };

export type RoPEStep =
    | { type: 'idle' | 'start' | 'finish' }
    | { type: 'process-pair', index: number };

export interface SymbolInfo {
    base: string;
    superscript?: string;
    subscript?: string;
}

// [FIX] Added 'mla' to the AttentionVariant type
export type AttentionVariant = 'mha' | 'mqa' | 'gqa' | 'mla';

export type FFNStep =
    | { type: 'start' }
    | { type: 'linear1' }
    | { type: 'activation' }
    | { type: 'linear2' }
    | { type: 'finish' };

export type ResidualAddStep =
    | { type: 'start' }
    | { type: 'add' }
    | { type: 'norm' }
    | { type: 'finish' };

export type LoRAStep =
    | { type: 'start' }
    | { type: 'multiply-ba' }
    | { type: 'scale' }
    | { type: 'add-w' }
    | { type: 'finish' };

export type MambaStep =
    | { type: 'idle' | 'start' | 'finish' }
    | { type: 'update_h', index: number }
    | { type: 'calculate_y', index: number };

export type RMSNormStep =
    | { type: 'idle' | 'start' | 'finish' }
    | { type: 'square', index: number }
    | { type: 'sum-squares', value: number }
    | { type: 'calculate-rms', value: number }
    | { type: 'normalize', index: number };

export type MoEStep =
    | { type: 'start' }
    | { type: 'route' }
    | { type: 'compute' }
    | { type: 'combine' }
    | { type: 'finish' };

export type AdapterStep =
    | { type: 'start' }
    | { type: 'down_project' }
    | { type: 'activation' }
    | { type: 'up_project' }
    | { type: 'add_residual' }
    | { type: 'finish' };

export type SFTStep =
    | { type: 'start' }
    | { type: 'forward_pass' }
    | { type: 'calculate_loss' }
    | { type: 'backward_pass' }
    | { type: 'finish' };
// END OF FILE: src/components/visualization/types.ts