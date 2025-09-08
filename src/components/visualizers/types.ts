// FILE: src/components/visualizers/types.ts

/**
 * 定义可视化组件库共享的类型
 */

export type Vector = number[];
export type Matrix = number[][];

export type AnimationStatus = 'idle' | 'running' | 'paused' | 'finished';

export type MatMulStep =
  | { type: 'start' | 'finish' | 'idle', index: -1, cumulativeSum?: number }
  | { type: 'highlight-pair' | 'show-op', index: number }
  | { type: 'multiply', index: number, product: number }
  | { type: 'accumulate', index: number, product: number, cumulativeSum: number };

export type ElementWiseOpStep =
  | { type: 'idle' | 'start' | 'finish' }
  | { type: 'highlight', row: number, col: number }
  | { type: 'show-op', row: number, col: number }
  | { type: 'calculate', row: number, col: number };

export type ActivationStep =
  | { type: 'idle' | 'start' | 'finish' }
  | { type: 'process', index: number };

export type SoftmaxStep =
  | { type: 'idle' | 'start' | 'finish' }
  | { type: 'highlight-max', value: number }
  | { type: 'subtract-max', index: number }
  | { type: 'exponentiate', index: number }
  | { type: 'sum-exps', value: number }
  | { type: 'normalize', index: number };

export type LayerNormStep =
  | { type: 'idle' | 'start' | 'finish' }
  | { type: 'highlight-for-mean', index: number }
  | { type: 'accumulate-mean', index: number, sum: number }
  | { type: 'calculate-mean', value: number }
  | { type: 'highlight-for-variance', index: number }
  | { type: 'accumulate-variance', index: number, sum: number }
  | { type: 'calculate-variance', value: number }
  | { type: 'show-norm-formula', index: number }
  | { type: 'apply-norm', index: number };

export type RMSNormStep =
  | { type: 'idle' | 'start' | 'finish' }
  | { type: 'square', index: number }
  | { type: 'sum-squares', value: number }
  | { type: 'calculate-rms', value: number }
  | { type: 'normalize', index: number };

// [NEW] Combined Wx+b animation steps
export type WxPlusBStep =
  | { type: 'idle' }
  | { type: 'start-matmul' }
  | { type: 'matmul-step', step: number } // Corresponds to the inner matmul step
  | { type: 'finish-matmul', matmulResult: number }
  | { type: 'highlight-bias' }
  | { type: 'add-bias', finalResult: number }
  | { type: 'finish-add' };

export type ProcessingStep =
  | 'start'
  | 'subtract-max'
  | 'exponentiate'
  | 'sum-exps'
  | 'normalize'
  | 'calculate-mean'
  | 'calculate-variance'
  | 'apply-norm'
  | 'calculate-squared-sum'
  | 'calculate-rms'
  | 'apply-rms-norm'
  | 'done';

export type ActivationFunctionType = 'relu' | 'gelu' | 'silu';

export interface CalculationComponent {
    a: number;
    b: number;
}

export interface SymbolInfo {
    base: string;
    superscript?: string;
    subscript?: string;
}
// END OF FILE: src/components/visualizers/types.ts