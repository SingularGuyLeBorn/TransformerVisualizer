// FILE: src/hooks/useTransformer.ts
import { useMemo } from 'react';
import { TransformerData } from '../types';
import { calculateTransformer } from '../lib/transformer';

// --- Main Hook ---

interface Dims {
    d_model: number;
    h: number;
    seq_len: number; // Decoder sequence length
    n_layers: number;
    d_ff: number;
}

/**
 * A React hook that calculates the entire state of a Transformer model.
 * It uses a deterministic calculation function from `lib/transformer` and
 * memoizes the result to avoid re-computation on every render.
 *
 * @param inputText - The input sentence for the encoder.
 * @param dims - The dimensions of the Transformer model.
 * @returns A `TransformerData` object containing all intermediate matrices,
 *          or `null` if the dimensions are invalid or a calculation error occurs.
 */
export const useTransformer = (inputText: string, dims: Dims): TransformerData | null => {
  return useMemo(() => {
    if (!inputText.trim()) {
        return null; // Return null if input is empty to avoid calculation errors
    }
    try {
      // The core logic is now delegated to a pure function.
      // This makes the hook cleaner and separates concerns.
      // The heavy computation is in `calculateTransformer`.
      const transformerData = calculateTransformer(inputText, dims);
      return transformerData;
    } catch (e) {
      console.error("Error during transformer calculation:", e);
      // If any error occurs during the complex calculation,
      // return null to indicate failure to the UI.
      return null;
    }
  }, [inputText, dims]); // The hook will only re-run if the dimensions or input text change.
};
// END OF FILE: src/hooks/useTransformer.ts