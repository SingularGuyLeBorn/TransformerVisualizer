// FILE: src/topics/transformer-explorer/types.ts
export type Matrix = number[][];
export type Vector = number[];

export interface ElementIdentifier {
  name: string; // e.g., "encoder.0.mha.h0.Q" or "residual.res1.start"
  row: number;
  col: number;
  isInternal?: boolean; // True if it's part of an internal calculation visualization
  matrixSymbol?: string; // e.g., "Z"
  matrixDims?: string; // e.g., "3x8"
  tokenId?: number; // e.g., 10 for "I"
  tokenStr?: string; // e.g., "I"
  probValue?: number; // For decoding, the probability of the chosen token
  symbol?: string; // The mathematical symbol for the tooltip title
}

export interface HighlightSource extends ElementIdentifier {
  highlightRow?: boolean;
  highlightCol?: boolean;
  highlightProbCol?: boolean;
}

export interface HighlightState {
  activeComponent: string | null; // e.g., "mha", "ffn"
  activeResidual: string | null; // e.g., "res1"
  target: ElementIdentifier | null;
  sources: HighlightSource[];
  destinations?: HighlightSource[]; // For forward tracing
}

export interface CalculationComponent {
    a: number;
    b: number;
}

export interface CalculationStep {
    title?: string; // Optional title for multi-step calculations
    a: Vector;
    b: Vector;
    op: string; // e.g., '·', '+', '...'
    result: number;
    aSymbol: string;
    bSymbol: string;
    components?: CalculationComponent[];
}

export interface TooltipState {
    target: ElementIdentifier;
    opType: 'matmul' | 'add' | 'info' | 'softmax' | 'relu';
    steps: CalculationStep[];
    title: string;
    initialPosition: { x: number, y: number };
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

export interface DecoderLayerData {
    decoder_input: Matrix;
    masked_mha: MultiHeadAttentionData;
    masked_mha_output: Matrix;
    add_norm_1_output: Matrix;

    enc_dec_mha: MultiHeadAttentionData;
    enc_dec_mha_output: Matrix;
    add_norm_2_output: Matrix;

    ffn: FFNData;
    ffn_output: Matrix;
    add_norm_3_output: Matrix;
}

export interface TransformerData {
    // Input Stage
    inputText: string[];
    tokenizedInput: number[];
    embeddingMatrix: Matrix;
    vocab: { [key: number]: string };

    // Encoder
    inputEmbeddings: Matrix;
    posEncodings: Matrix;
    encoderInput: Matrix;
    encoderLayers: EncoderLayerData[];
    finalEncoderOutput: Matrix;

    // Decoder
    outputEmbeddings: Matrix;
    decoderPosEncodings: Matrix;
    decoderInput: Matrix;
    decoderLayers: DecoderLayerData[];
    finalDecoderOutput: Matrix;
    finalLinear: Matrix; // Weights for the final linear layer
    logits: Matrix;
    outputProbabilities: Matrix;

    // Output Stage
    decodedTokens: number[];
    outputText: string[];
}
// END OF FILE: src/topics/transformer-explorer/types.ts