// FILE: src/topics/transformer-explorer/components/DecoderLayer.tsx
import React from 'react';
import { DecoderLayerData, HighlightState, ElementIdentifier, Matrix as MatrixType } from '../types';
import { AddNorm } from './AddNorm';
import { FeedForward } from './FeedForward';
import { MATRIX_NAMES } from '../config/matrixNames';
import { ResidualBlock } from './ResidualBlock';
import { getSymbolParts } from '../lib/symbolMapping';
import { Matrix } from './Matrix';
import { MaskedMultiHeadAttention } from './MaskedMultiHeadAttention';
import { EncoderDecoderAttention } from './EncoderDecoderAttention';

interface DecoderLayerProps {
  layerIndex: number;
  data: DecoderLayerData;
  highlight: HighlightState;
  onElementClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
  onComponentClick: (componentId: string) => void;
  finalEncoderOutput: MatrixType;
}

export const DecoderLayer: React.FC<DecoderLayerProps> = ({ layerIndex, data, highlight, onElementClick, onComponentClick, finalEncoderOutput }) => {
  const baseName = `decoder.${layerIndex}`;
  const LN = MATRIX_NAMES.decoderLayer(layerIndex);

  const symbolRes1 = getSymbolParts(LN.decoder_input);
  const dimsRes1 = `${data.decoder_input.length}x${data.decoder_input[0].length}`;
  const mathSymbolRes1 = symbolRes1.base + (symbolRes1.subscript ? `_{${symbolRes1.subscript}}` : '') + (symbolRes1.superscript ? `^{${symbolRes1.superscript}}` : '');

  const symbolRes2 = getSymbolParts(LN.add_norm_1_output);
  const dimsRes2 = `${data.add_norm_1_output.length}x${data.add_norm_1_output[0].length}`;
  const mathSymbolRes2 = symbolRes2.base + (symbolRes2.subscript ? `_{${symbolRes2.subscript}}` : '') + (symbolRes2.superscript ? `^{${symbolRes2.superscript}}` : '');

  const symbolRes3 = getSymbolParts(LN.add_norm_2_output);
  const dimsRes3 = `${data.add_norm_2_output.length}x${data.add_norm_2_output[0].length}`;
  const mathSymbolRes3 = symbolRes3.base + (symbolRes3.subscript ? `_{${symbolRes3.subscript}}` : '') + (symbolRes3.superscript ? `^{${symbolRes3.superscript}}` : '');

  return (
    <div className="decoder-layer-container">
        <div className="arrow-down">↓</div>
        <div className="diagram-component" style={{padding: '5px', borderColor: '#d1c4e9', borderWidth: '3px'}}>
            <div className="component-header" style={{backgroundColor: '#ede7f6'}}>解码器层 (Decoder Layer) {layerIndex + 1}</div>
            <div className="component-body">

                <Matrix name={LN.decoder_input} data={data.decoder_input} highlight={highlight} onElementClick={onElementClick} />
                <ResidualBlock id={`res-l${layerIndex}-d1`} type="start" highlight={highlight} onElementClick={onElementClick} matrixSymbol={mathSymbolRes1} matrixDims={dimsRes1} />
                <MaskedMultiHeadAttention
                    baseName={`${baseName}.masked_mha`}
                    data={data.masked_mha}
                    highlight={highlight}
                    onElementClick={onElementClick}
                    onComponentClick={onComponentClick}
                />
                <AddNorm
                    residualInput={data.decoder_input}
                    residualInputName={LN.decoder_input}
                    inputSublayer={data.masked_mha_output}
                    output={data.add_norm_1_output}
                    sublayerMatrixName={LN.masked_mha_output}
                    outputMatrixName={LN.add_norm_1_output}
                    highlight={highlight}
                    onElementClick={onElementClick}
                    onComponentClick={onComponentClick}
                    activeId="add_norm_1_dec"
                    residualId={`res-l${layerIndex}-d1`}
                    residualMatrixSymbol={mathSymbolRes1}
                    residualMatrixDims={dimsRes1}
                />
                <div className="arrow-down">↓</div>

                <ResidualBlock id={`res-l${layerIndex}-d2`} type="start" highlight={highlight} onElementClick={onElementClick} matrixSymbol={mathSymbolRes2} matrixDims={dimsRes2} />
                <EncoderDecoderAttention
                    baseName={`${baseName}.enc_dec_mha`}
                    data={data.enc_dec_mha}
                    highlight={highlight}
                    onElementClick={onElementClick}
                    onComponentClick={onComponentClick}
                    decoderAddNorm1Output={data.add_norm_1_output}
                    finalEncoderOutput={finalEncoderOutput}
                />
                <AddNorm
                    residualInput={data.add_norm_1_output}
                    residualInputName={LN.add_norm_1_output}
                    inputSublayer={data.enc_dec_mha_output}
                    output={data.add_norm_2_output}
                    sublayerMatrixName={LN.enc_dec_mha_output}
                    outputMatrixName={LN.add_norm_2_output}
                    highlight={highlight}
                    onElementClick={onElementClick}
                    onComponentClick={onComponentClick}
                    activeId="add_norm_2_dec"
                    residualId={`res-l${layerIndex}-d2`}
                    residualMatrixSymbol={mathSymbolRes2}
                    residualMatrixDims={dimsRes2}
                />
                <div className="arrow-down">↓</div>

                <ResidualBlock id={`res-l${layerIndex}-d3`} type="start" highlight={highlight} onElementClick={onElementClick} matrixSymbol={mathSymbolRes3} matrixDims={dimsRes3} />
                <FeedForward
                    baseName={`${baseName}.ffn`}
                    input={data.add_norm_2_output}
                    inputName={LN.add_norm_2_output}
                    data={data.ffn}
                    highlight={highlight}
                    onElementClick={onElementClick}
                    onComponentClick={onComponentClick}
                />
                <AddNorm
                    residualInput={data.add_norm_2_output}
                    residualInputName={LN.add_norm_2_output}
                    inputSublayer={data.ffn_output}
                    output={data.add_norm_3_output}
                    sublayerMatrixName={LN.ffn_output}
                    outputMatrixName={LN.add_norm_3_output}
                    highlight={highlight}
                    onElementClick={onElementClick}
                    onComponentClick={onComponentClick}
                    activeId="add_norm_3_dec"
                    residualId={`res-l${layerIndex}-d3`}
                    residualMatrixSymbol={mathSymbolRes3}
                    residualMatrixDims={dimsRes3}
                />
            </div>
        </div>
    </div>
  );
};
// END OF FILE: src/topics/transformer-explorer/components/DecoderLayer.tsx