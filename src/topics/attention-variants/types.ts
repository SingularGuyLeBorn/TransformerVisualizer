// FILE: src/topics/attention-variants/types.ts
// 该文件为注意力变体专题定义了所有必要的类型

export type Matrix = number[][];
export type Vector = number[];

// 用于标识被点击的元素
export interface ElementIdentifier {
  variant: 'mha' | 'mqa' | 'gqa' | 'mla'; // 所属的注意力变体
  name: string; // 矩阵或向量的唯一名称, e.g., "mha.heads.0.Q" or "gqa.wk.1"
  row: number;
  col: number;
  isInternal?: boolean; // True if it's part of an internal calculation visualization
  symbol?: string; // e.g., "Z_GQA"
}

// 用于定义高亮的来源
export interface HighlightSource extends ElementIdentifier {
  highlightRow?: boolean;
  highlightCol?: boolean;
}

// 全局高亮状态
export interface HighlightState {
  target: ElementIdentifier | null;
  sources: HighlightSource[];
}

// 单个注意力头的计算结果
export interface AttentionHeadData {
  Q: Matrix;
  K: Matrix;
  V: Matrix;
  Scores: Matrix;
  Weights: Matrix;
  Output: Matrix;
}

// MHA, MQA, GQA 的计算结果结构
export interface AttentionVariantData {
  Q_proj: Matrix;
  K_proj: Matrix;
  V_proj: Matrix;
  heads: AttentionHeadData[];
  CombinedOutput: Matrix;
  FinalOutput: Matrix;
}

// MLA 的特定计算结果结构
export interface MLAData {
  C_kv: Matrix; // 潜在KV向量
  C_q: Matrix; // 潜在Q向量
  K_rope: Matrix; // RoPE部分的K
  // ... 其他MLA中间量，此处为简化示例
  FinalOutput: Matrix;
}

// 包含所有注意力变体计算结果的总数据结构
export interface AttentionData {
  input: Matrix;
  Wq: Matrix[]; // N_q_heads 个 Wq 矩阵
  Wk: Matrix[]; // N_kv_heads 个 Wk 矩阵
  Wv: Matrix[]; // N_kv_heads 个 Wv 矩阵
  Wo: Matrix;
  mha: AttentionVariantData;
  mqa: AttentionVariantData;
  gqa: AttentionVariantData;
  mla: MLAData; // MLA结构不同，单独定义
}

// Types for CalculationTooltip
export interface CalculationComponent {
    a: number;
    b: number;
}

export interface CalculationStep {
    a: Vector;
    b: Vector;
    op: string;
    result: number;
    aSymbol: string;
    bSymbol: string;
    components?: CalculationComponent[];
}

export interface TooltipState {
    target: ElementIdentifier;
    opType: 'matmul' | 'softmax' | 'info' | 'add';
    steps: CalculationStep[];
    title: string;
}


// END OF FILE: src/topics/attention-variants/types.ts