/* START OF FILE: src/components/AddNorm.tsx */
// FILE: src/components/AddNorm.tsx
import React from 'react';
import { Matrix as MatrixType, HighlightState, ElementIdentifier } from '../types';
import { Matrix } from './Matrix';
import { InlineMath } from 'react-katex';

interface AddNormProps {
    baseName: string;
    inputResidual: MatrixType;
    inputSublayer: MatrixType;
    output: MatrixType;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier) => void;
}

export const AddNorm: React.FC<AddNormProps> = ({ baseName, inputResidual, inputSublayer, output, highlight, onElementClick }) => {
    return (
         <div className="diagram-component">
            <div className="component-header">Add & LayerNorm</div>
            <div className="component-body">
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center'}}>
                    <Matrix name={`${baseName}_in_residual`} data={inputResidual} highlight={highlight} onElementClick={onElementClick} />
                    <div className="op-symbol">+</div>
                    <Matrix name={`${baseName}_in_sublayer`} data={inputSublayer} highlight={highlight} onElementClick={onElementClick} />
                </div>
                <div className="arrow-down"><InlineMath math="\rightarrow \text{LayerNorm} \rightarrow" /></div>
                <Matrix name={`${baseName}_out`} data={output} highlight={highlight} onElementClick={onElementClick} />
            </div>
        </div>
    );
};
// END OF FILE: src/components/AddNorm.tsx
/* END OF FILE: src/components/AddNorm.tsx */