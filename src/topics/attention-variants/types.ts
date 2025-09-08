// FILE: src/topics/attention-variants/types.ts
import { SymbolInfo as GenericSymbolInfo } from '../../components/visualizers/types';
import { ElementIdentifier as GenericElementIdentifier, CalculationComponent as GenericCalculationComponent } from '../../components/CalculationTooltip/types';

// 该文件为注意力变体专题定义了所有必要的类型
export type SymbolInfo = GenericSymbolInfo;
export type Matrix = number[][];
export type Vector = number[];
export type CalculationComponent = GenericCalculationComponent;


// 用于标识被点击的元素, 继承自通用的 ElementIdentifier
export interface ElementIdentifier extends GenericElementIdentifier {
  variant: 'mha' | 'mqa' | 'gqa' | 'mla'; // 所属的注意力变体
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
  activeComponent?: string | null; // e.g., "mha", "gqa"
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

// END OF FILE: src/topics/attention-variants/types.ts