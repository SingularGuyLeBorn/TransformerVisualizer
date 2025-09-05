// FILE: src/types.ts
export type Matrix = number[][];
export type Vector = number[];

export interface ElementIdentifier {
  name: string; // e.g., "encoder.0.mha.h0.Q" or "residual.res1.start"
  row: number;
  col: number;
  isInternal?: boolean; // True if it's part of an internal calculation visualization
  matrixSymbol?: string; // e.g., "Z"
  matrixDims?: string; // e.g., "3x8"
}

export interface HighlightSource extends ElementIdentifier {
  highlightRow?: boolean;
  highlightCol?: boolean;
}

export interface HighlightState {
  activeComponent: string | null; // e.g., "mha", "ffn"
  activeResidual: string | null; // e.g., "res1"
  target: ElementIdentifier | null;
  sources: HighlightSource[];
  destinations?: HighlightSource[]; // For forward tracing
}

export interface AttentionHeadData {
  Wq: Matrix;
  Wk: Matrix;
  Wv: Matrix;
  Q: Matrix;
  K: Matrix;
  V: Matrix;
  Scores: Matrix;
  ScaledScores: Matrix;
  AttentionWeights: Matrix;
  HeadOutput: Matrix;
}

export interface MultiHeadAttentionData {
    heads: AttentionHeadData[];
    Wo: Matrix;
    output: Matrix;
}

export interface FFNData {
    W1: Matrix;
    b1: Vector; // bias is part of FFN data
    Intermediate: Matrix;
    Activated: Matrix;
    W2: Matrix;
    b2: Vector; // bias is part of FFN data
    Output: Matrix;
}

export interface EncoderLayerData {
    encoder_input: Matrix;
    mha: MultiHeadAttentionData;
    mha_output: Matrix;

    add_norm_1_output: Matrix;

    ffn: FFNData;
    ffn_output: Matrix;

    add_norm_2_output: Matrix;
}

export interface TransformerData {
    inputEmbeddings: Matrix;
    posEncodings: Matrix;
    encoderInput: Matrix;
    encoderLayers: EncoderLayerData[];
}
// END OF FILE: src/types.ts