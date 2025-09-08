// FILE: src/components/visualizers/types.ts

/**
 * 定义可视化组件库共享的类型
 */

export type Vector = number[];
export type Matrix = number[][];

// 动画步骤的状态，用于控制分步可视化
export type AnimationStatus = 'idle' | 'running' | 'paused' | 'finished';

// 点积动画的详细步骤
export type MatMulStep =
  | { type: 'start' | 'finish' | 'idle', index: -1, cumulativeSum?: number }
  | { type: 'highlight-pair' | 'show-op', index: number }
  | { type: 'multiply', index: number, product: number }
  | { type: 'accumulate', index: number, product: number, cumulativeSum: number };

// [NEW] Element-wise operation animation steps
export type ElementWiseOpStep =
  | { type: 'idle' | 'start' | 'finish' }
  | { type: 'highlight', row: number, col: number }
  | { type: 'show-op', row: number, col: number }
  | { type: 'calculate', row: number, col: number };

// [NEW] Activation function animation steps
export type ActivationStep =
  | { type: 'idle' | 'start' | 'finish' }
  | { type: 'process', index: number };

// [NEW] Softmax animation steps
export type SoftmaxStep =
  | { type: 'idle' | 'start' | 'finish' }
  | { type: 'highlight-max', value: number }
  | { type: 'subtract-max', index: number }
  | { type: 'exponentiate', index: number }
  | { type: 'sum-exps', value: number }
  | { type: 'normalize', index: number };

// [NEW] LayerNorm animation steps
export type LayerNormStep =
  | { type: 'idle' | 'start' | 'finish' }
  | { type: 'highlight-for-mean', index: number }
  | { type: 'calculate-mean', value: number }
  | { type: 'highlight-for-variance', index: number }
  | { type: 'calculate-variance', value: number }
  | { type: 'apply-norm', index: number };

// [NEW] RMSNorm animation steps
export type RMSNormStep =
  | { type: 'idle' | 'start' | 'finish' }
  | { type: 'square', index: number }
  | { type: 'sum-squares', value: number }
  | { type: 'calculate-rms', value: number }
  | { type: 'normalize', index: number };


// Softmax/LayerNorm/RMSNorm 动画的步骤名称 (DEPRECATED FOR ANIMATED VISUALIZERS, kept for compatibility if needed)
export type ProcessingStep =
  | 'start'
  | 'subtract-max'
  | 'exponentiate'
  | 'sum-exps'
  | 'normalize'
  | 'calculate-mean'
  | 'calculate-variance'
  | 'apply-norm'
  | 'calculate-squared-sum' // For RMSNorm
  | 'calculate-rms'         // For RMSNorm
  | 'apply-rms-norm'      // For RMSNorm
  | 'done';

// 支持的激活函数类型
export type ActivationFunctionType = 'relu' | 'gelu' | 'silu';

// [NEW] For InteractiveMatMulVisualizer
export interface CalculationComponent {
    a: number;
    b: number;
}

// [NEW] Generic Symbol Information for tooltips
export interface SymbolInfo {
    base: string;
    superscript?: string;
    subscript?: string;
}
// END OF FILE: src/components/visualizers/types.ts