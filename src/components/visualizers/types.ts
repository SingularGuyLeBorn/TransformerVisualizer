// FILE: src/components/visualizers/types.ts

/**
 * 定义可视化组件库共享的类型
 */

export type Vector = number[];
export type Matrix = number[][];

// 动画步骤的状态，用于控制分步可视化
export type AnimationStatus = 'idle' | 'running' | 'paused' | 'finished';

// 点积动画的详细步骤
export interface MatMulStep {
  type: 'highlight-pair' | 'multiply' | 'accumulate' | 'finish' | 'idle'; // [FIXED] Added 'idle'
  index: number; // 当前处理的元素索引
  product?: number; // 乘积结果
  cumulativeSum?: number; // 累加和
}

// Softmax/LayerNorm/RMSNorm 动画的步骤名称
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