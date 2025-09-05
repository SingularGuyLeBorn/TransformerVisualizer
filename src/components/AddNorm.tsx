// FILE: src/components/AddNorm.tsx
import React from 'react';
import { Matrix as MatrixType, HighlightState, ElementIdentifier } from '../types';
import { Matrix } from './Matrix';
import { InlineMath } from 'react-katex';
import { ResidualBlock } from './ResidualBlock';

interface AddNormProps {
    inputSublayer: MatrixType;
    output: MatrixType;
    sublayerMatrixName: string;
    outputMatrixName: string;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier) => void;
    activeId: string;
    residualId: string; // e.g., "res-l0-1"
    residualMatrixSymbol: string;
    residualMatrixDims: string;
}

export const AddNorm: React.FC<AddNormProps> = ({
    inputSublayer,
    output,
    sublayerMatrixName,
    outputMatrixName,
    highlight,
    onElementClick,
    activeId,
    residualId,
    residualMatrixSymbol,
    residualMatrixDims,
}) => {
    const isActive = highlight.activeComponent === activeId;

    return (
         <div className={`diagram-component ${isActive ? 'active' : ''}`}>
            <div className="component-header">Add & LayerNorm</div>
            <div className="component-body add-norm-component-body">
                <div className="add-norm-inputs">
                    <ResidualBlock
                        id={residualId}
                        type="end"
                        highlight={highlight}
                        onElementClick={onElementClick}
                        matrixSymbol={residualMatrixSymbol}
                        matrixDims={residualMatrixDims}
                    />
                    <div className="op-symbol">+</div>
                    <Matrix name={sublayerMatrixName} data={inputSublayer} highlight={highlight} onElementClick={onElementClick} />
                </div>

                <div className="arrow-down"><InlineMath math="\xrightarrow{\text{LayerNorm}}" /></div>

                <Matrix name={outputMatrixName} data={output} highlight={highlight} onElementClick={onElementClick} />
            </div>
        </div>
    );
};
// END OF FILE: src/components/AddNorm.tsx