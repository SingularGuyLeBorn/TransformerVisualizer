// FILE: src/components/AddNorm.tsx
import React from 'react';
import { Matrix as MatrixType, HighlightState, ElementIdentifier } from '../types';
import { Matrix } from './Matrix';
import { InlineMath } from 'react-katex';
import { ResidualBlock } from './ResidualBlock';

interface AddNormProps {
    residualInput: MatrixType; // [MODIFIED] Pass the full residual input matrix
    residualInputName: string; // [MODIFIED] Name of the residual input matrix
    inputSublayer: MatrixType;
    output: MatrixType;
    sublayerMatrixName: string;
    outputMatrixName: string;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
    onComponentClick: (componentId: string) => void;
    activeId: string;
    residualId: string;
    residualMatrixSymbol: string;
    residualMatrixDims: string;
}

export const AddNorm: React.FC<AddNormProps> = ({
    residualInput,
    residualInputName,
    inputSublayer,
    output,
    sublayerMatrixName,
    outputMatrixName,
    highlight,
    onElementClick,
    onComponentClick,
    activeId,
    residualId,
    residualMatrixSymbol,
    residualMatrixDims,
}) => {
    const isActive = highlight.activeComponent === activeId;

    return (
         <div className={`diagram-component ${isActive ? 'active' : ''}`}>
            <div className="component-header" onClick={() => onComponentClick(activeId)}>Add & LayerNorm</div>
            <div className="component-body add-norm-component-body">
                <div className="add-norm-inputs">
                    {/* [MODIFIED] Show the full matrix for the residual connection */}
                    <Matrix name={residualInputName} data={residualInput} highlight={highlight} onElementClick={onElementClick} />
                    <ResidualBlock
                        id={residualId}
                        type="end"
                        highlight={highlight}
                        onElementClick={(el, e) => onElementClick(el, e)}
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