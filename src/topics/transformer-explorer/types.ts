// FILE: src/topics/transformer-explorer/types.ts
import { SymbolInfo } from '../../components/visualizers/types';
import { ElementIdentifier as GenericElementIdentifier, CalculationComponent as GenericCalculationComponent } from '../../components/CalculationTooltip/types';

// [FIXED] Define Vector and Matrix locally to avoid import conflicts, consistent with other topics.
export type Matrix = number[][];
export type Vector = number[];
export type CalculationComponent = GenericCalculationComponent;

// Extend the generic ElementIdentifier with topic-specific fields
export interface ElementIdentifier extends GenericElementIdentifier {
  matrixSymbol?: string; // e.g., "Z"
  matrixDims?: string; // e.g., "3x8"
  tokenId?: number; // e.g., 10 for "I"
  tokenStr?: string; // e.g., "I"
  probValue?: number; // For decoding, the probability of the chosen token
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