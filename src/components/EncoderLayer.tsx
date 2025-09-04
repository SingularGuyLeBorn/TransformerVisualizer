// FILE: src/components/EncoderLayer.tsx
import React from 'react';
import { EncoderLayerData, HighlightState, ElementIdentifier } from '../types';
import { MultiHeadAttention } from './MultiHeadAttention';
import { AddNorm } from './AddNorm';
import { FeedForward } from './FeedForward';

interface EncoderLayerProps {
  layerIndex: number;
  data: EncoderLayerData;
  highlight: HighlightState;
  onElementClick: (element: ElementIdentifier) => void;
}

export const EncoderLayer: React.FC<EncoderLayerProps> = ({ layerIndex, data, highlight, onElementClick }) => {
  const baseName = `encoder.${layerIndex}`;
  return (
    <>
        <div className="arrow-down">↓</div>
        <div className="diagram-component">
            <div className="component-header" style={{backgroundColor: '#e3f2fd'}}>Encoder Layer {layerIndex + 1}</div>
            <div className="component-body" style={{padding: '5px'}}>

                <MultiHeadAttention
                    baseName={`${baseName}.mha`}
                    data={data.mha}
                    highlight={highlight}
                    onElementClick={onElementClick}
                />

                <AddNorm
                    inputResidual={data.encoder_input}
                    inputSublayer={data.mha_output}
                    output={data.add_norm_1_output}
                    residualMatrixName={`${baseName}.encoder_input`}
                    sublayerMatrixName={`${baseName}.mha_output`}
                    outputMatrixName={`${baseName}.add_norm_1_output`}
                    highlight={highlight}
                    onElementClick={onElementClick}
                    activeId="add_norm_1"
                />

                <FeedForward
                    baseName={`${baseName}.ffn`}
                    data={data.ffn}
                    highlight={highlight}
                    onElementClick={onElementClick}
                />

                <AddNorm
                    inputResidual={data.add_norm_1_output}
                    inputSublayer={data.ffn_output}
                    output={data.add_norm_2_output}
                    residualMatrixName={`${baseName}.add_norm_1_output`}
                    sublayerMatrixName={`${baseName}.ffn_output`}
                    outputMatrixName={`${baseName}.add_norm_2_output`}
                    highlight={highlight}
                    onElementClick={onElementClick}
                    activeId="add_norm_2"
                />
            </div>
        </div>
    </>
  );
};
// END OF FILE: src/components/EncoderLayer.tsx
