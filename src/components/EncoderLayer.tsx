// FILE: src/components/EncoderLayer.tsx
import React from 'react';
import { EncoderLayerData, HighlightState, ElementIdentifier } from '../types';
import { MultiHeadAttention } from './MultiHeadAttention';
import { AddNorm } from './AddNorm';
import { FeedForward } from './FeedForward';
import { MATRIX_NAMES } from '../config/matrixNames';
import { ResidualBlock } from './ResidualBlock';
import { getSymbolParts } from '../config/symbolMapping';
import { Matrix } from './Matrix';

interface EncoderLayerProps {
  layerIndex: number;
  data: EncoderLayerData;
  highlight: HighlightState;
  onElementClick: (element: ElementIdentifier) => void;
}

export const EncoderLayer: React.FC<EncoderLayerProps> = ({ layerIndex, data, highlight, onElementClick }) => {
  const baseName = `encoder.${layerIndex}`;
  const LN = MATRIX_NAMES.layer(layerIndex);

  const symbolRes1 = getSymbolParts(LN.encoder_input);
  const dimsRes1 = `${data.encoder_input.length}x${data.encoder_input[0].length}`;
  const mathSymbolRes1 = symbolRes1.base + (symbolRes1.subscript ? `_{${symbolRes1.subscript}}` : '') + (symbolRes1.superscript ? `^{${symbolRes1.superscript}}` : '');

  const symbolRes2 = getSymbolParts(LN.add_norm_1_output);
  const dimsRes2 = `${data.add_norm_1_output.length}x${data.add_norm_1_output[0].length}`;
  const mathSymbolRes2 = symbolRes2.base + (symbolRes2.subscript ? `_{${symbolRes2.subscript}}` : '') + (symbolRes2.superscript ? `^{${symbolRes2.superscript}}` : '');

  return (
    <div className="encoder-layer-container">
        <div className="arrow-down">↓</div>
        <div className="diagram-component" style={{padding: '5px', borderColor: '#e3f2fd', borderWidth: '3px'}}>
            <div className="component-header" style={{backgroundColor: '#e3f2fd'}}>编码器层 (Encoder Layer) {layerIndex + 1}</div>
            <div className="component-body">

                {/* --- MHA Sub-layer with Residual Connection --- */}
                <Matrix name={LN.encoder_input} data={data.encoder_input} highlight={highlight} onElementClick={onElementClick} />
                <ResidualBlock id={`res-l${layerIndex}-1`} type="start" highlight={highlight} onElementClick={onElementClick} matrixSymbol={mathSymbolRes1} matrixDims={dimsRes1} />
                <MultiHeadAttention
                    baseName={`${baseName}.mha`}
                    data={data.mha}
                    highlight={highlight}
                    onElementClick={onElementClick}
                />
                <AddNorm
                    inputSublayer={data.mha_output}
                    output={data.add_norm_1_output}
                    sublayerMatrixName={LN.mha_output}
                    outputMatrixName={LN.add_norm_1_output}
                    highlight={highlight}
                    onElementClick={onElementClick}
                    activeId="add_norm_1"
                    residualId={`res-l${layerIndex}-1`}
                    residualMatrixSymbol={mathSymbolRes1}
                    residualMatrixDims={dimsRes1}
                />

                {/* --- FFN Sub-layer with Residual Connection --- */}
                <div className="arrow-down">↓</div>
                <Matrix name={LN.add_norm_1_output} data={data.add_norm_1_output} highlight={highlight} onElementClick={onElementClick} />
                <ResidualBlock id={`res-l${layerIndex}-2`} type="start" highlight={highlight} onElementClick={onElementClick} matrixSymbol={mathSymbolRes2} matrixDims={dimsRes2} />
                <FeedForward
                    baseName={`${baseName}.ffn`}
                    input={data.add_norm_1_output}
                    inputName={LN.add_norm_1_output}
                    data={data.ffn}
                    highlight={highlight}
                    onElementClick={onElementClick}
                />
                <AddNorm
                    inputSublayer={data.ffn_output}
                    output={data.add_norm_2_output}
                    sublayerMatrixName={LN.ffn_output}
                    outputMatrixName={LN.add_norm_2_output}
                    highlight={highlight}
                    onElementClick={onElementClick}
                    activeId="add_norm_2"
                    residualId={`res-l${layerIndex}-2`}
                    residualMatrixSymbol={mathSymbolRes2}
                    residualMatrixDims={dimsRes2}
                />

            </div>
        </div>
    </div>
  );
};
// END OF FILE: src/components/EncoderLayer.tsx