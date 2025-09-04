/* START OF FILE: src/components/EncoderLayer.tsx */
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
                    baseName={`${baseName}.add_norm_1`}
                    inputResidual={data.add_norm_1_in_residual}
                    inputSublayer={data.add_norm_1_in_sublayer}
                    output={data.add_norm_1_out}
                    highlight={highlight}
                    onElementClick={onElementClick}
                />

                <FeedForward
                    baseName={`${baseName}.ffn`}
                    data={data.ffn}
                    highlight={highlight}
                    onElementClick={onElementClick}
                />

                <AddNorm
                    baseName={`${baseName}.add_norm_2`}
                    inputResidual={data.add_norm_2_in_residual}
                    inputSublayer={data.add_norm_2_in_sublayer}
                    output={data.add_norm_2_out}
                    highlight={highlight}
                    onElementClick={onElementClick}
                />
            </div>
        </div>
    </>
  );
};
// END OF FILE: src/components/EncoderLayer.tsx
/* END OF FILE: src/components/EncoderLayer.tsx */