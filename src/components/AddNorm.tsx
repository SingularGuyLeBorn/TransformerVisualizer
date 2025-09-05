// FILE: src/components/AddNorm.tsx
import React from 'react';
import { Matrix as MatrixType, HighlightState, ElementIdentifier } from '../types';
import { Matrix } from './Matrix';
import { InlineMath } from 'react-katex';

interface AddNormProps {
    inputResidual: MatrixType;
    inputSublayer: MatrixType;
    output: MatrixType;
    residualMatrixName: string;
    sublayerMatrixName: string;
    outputMatrixName: string;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier) => void;
    activeId: 'add_norm_1' | 'add_norm_2';
}

export const AddNorm: React.FC<AddNormProps> = ({ inputResidual, inputSublayer, output, residualMatrixName, sublayerMatrixName, outputMatrixName, highlight, onElementClick, activeId }) => {
    const isActive = highlight.activeComponent === activeId;
    return (
         <div className={`diagram-component ${isActive ? 'active' : ''}`}>
            <div className="component-header">Add & LayerNorm</div>
            <div className="component-body">
                <div className="viz-formula-row">
                    <Matrix name={residualMatrixName} data={inputResidual} highlight={highlight} onElementClick={onElementClick} />
                    <div className="op-symbol">+</div>
                    <Matrix name={sublayerMatrixName} data={inputSublayer} highlight={highlight} onElementClick={onElementClick} />
                </div>
                <div className="arrow-down"><InlineMath math="\rightarrow \text{LayerNorm} \rightarrow" /></div>
                <Matrix name={outputMatrixName} data={output} highlight={highlight} onElementClick={onElementClick} />
            </div>
        </div>
    );
};
// END OF FILE: src/components/AddNorm.tsx