// FILE: src/topics/attention-variants/components/ElementwiseOperation.tsx
import React from 'react';
import { Matrix, HighlightState, ElementIdentifier } from '../types';
import { InlineMath } from 'react-katex';
import { ElementwiseCalculation } from './ElementwiseCalculation';

interface ElementwiseOperationProps {
    opType: 'softmax';
    inputMatrix: Matrix;
    outputMatrix: Matrix;
    outputMatrixName: string;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
    variant: 'mha' | 'mqa' | 'gqa' | 'mla';
}

export const ElementwiseOperation: React.FC<ElementwiseOperationProps> = ({
    opType,
    inputMatrix,
    outputMatrix,
    outputMatrixName,
    highlight,
    onElementClick,
    variant
}) => {
    let targetRowIndex = 0;

    if (highlight.target) {
        if (highlight.target.name === outputMatrixName || highlight.target.name.startsWith(outputMatrixName.split('.')[0] + ".heads." + outputMatrixName.split('.')[2] + ".Scores")) {
             targetRowIndex = highlight.target.row;
        } else if (highlight.target.isInternal && highlight.target.name.startsWith(outputMatrixName)) {
            targetRowIndex = highlight.target.row;
        }
    }

    const inputRow = inputMatrix[targetRowIndex] || [];
    const outputRow = outputMatrix[targetRowIndex] || [];

    const opName = opType.charAt(0).toUpperCase() + opType.slice(1);

    return (
        <div className="elementwise-op-container">
            <div className="elementwise-op-label">
                <InlineMath math={`\\text{Detailed Calculation: } \\text{${opName}}`} />
            </div>
            <p style={{margin: '0', fontSize: '0.8em', color: '#666'}}>* Showing calculation for Row {targetRowIndex}</p>
            <ElementwiseCalculation
                opType={opType}
                inputRow={inputRow}
                outputRow={outputRow}
                highlight={highlight}
                onElementClick={onElementClick}
                baseName={outputMatrixName}
                rowIndex={targetRowIndex}
                variant={variant}
            />
        </div>
    );
};
// END OF FILE: src/topics/attention-variants/components/ElementwiseOperation.tsx