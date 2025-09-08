// FILE: src/topics/transformer-explorer/types.ts
import { SymbolInfo } from '../../components/visualizers/types';
import { ElementIdentifier as GenericElementIdentifier, CalculationComponent as GenericCalculationComponent } from '../../components/CalculationTooltip/types';

export type Matrix = number[][];
export type Vector = number[];
export type CalculationComponent = GenericCalculationComponent;

// Extend the generic ElementIdentifier with topic-specific fields
export interface ElementIdentifier extends GenericElementIdentifier {
  matrixSymbol?: string;
  matrixDims?: string;
  tokenId?: number;
  tokenStr?: string;
  probValue?: number;
}

export interface HighlightSource extends ElementIdentifier {
  highlightRow?: boolean;
  highlightCol?: boolean;
  highlightProbCol?: boolean;
}

export interface HighlightState {
  activeComponent: string | null;
  activeResidual: string | null;
  target: ElementIdentifier | null;
  sources: HighlightSource[];
  destinations?: HighlightSource[];
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
    b1: Vector;
    Intermediate: Matrix;
    Activated: Matrix;
    W2: Matrix;
    b2: Vector;
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
    inputText: string[];
    tokenizedInput: number[];
    embeddingMatrix: Matrix;
    vocab: { [key: number]: string };
    inputEmbeddings: Matrix;
    posEncodings: Matrix;
    encoderInput: Matrix;
    encoderLayers: EncoderLayerData[];
    finalEncoderOutput: Matrix;
    outputEmbeddings: Matrix;
    decoderPosEncodings: Matrix;
    decoderInput: Matrix;
    decoderLayers: DecoderLayerData[];
    finalDecoderOutput: Matrix;
    finalLinear: Matrix;
    logits: Matrix;
    outputProbabilities: Matrix;
    decodedTokens: number[];
    outputText: string[];
}
// END OF FILE: src/topics/transformer-explorer/types.ts