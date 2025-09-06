// FILE: src/topics/attention-variants/hooks/useAttention.ts
import { useMemo } from 'react';
import { AttentionData } from '../types';
import { calculateAttentionVariants } from '../lib/attention';

interface Dims {
  seq_len: number;
  d_model: number;
  d_head: number;
  n_q_heads: number;
  n_kv_heads: number;
}

export const useAttention = (dims: Dims): AttentionData | null => {
  return useMemo(() => {
    try {
      return calculateAttentionVariants(dims);
    } catch (e) {
      console.error("在注意力计算中发生错误:", e);
      return null;
    }
  }, [dims]);
};

// END OF FILE: src/topics/attention-variants/hooks/useAttention.ts