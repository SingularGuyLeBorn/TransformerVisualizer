// FILE: src/components/ElementwiseOperation.tsx
import React from 'react';
import { Matrix, HighlightState, ElementIdentifier } from '../types';
import { InlineMath } from 'react-katex';
import { MATRIX_NAMES } from '../config/matrixNames';
import { ElementwiseCalculation } from './ElementwiseCalculation';

interface ElementwiseOperationProps {
    opType: 'softmax' | 'relu';
    inputMatrix: Matrix;
    outputMatrix: Matrix;
    outputMatrixName: string;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier) => void;
    layerIndex: number; // [NEW] Explicitly pass layerIndex
    headIndex?: number; // [NEW] Optional headIndex for MHA
}

const getInputMatrixName = (opType: 'softmax' | 'relu', layerIndex: number, headIndex?: number) => {
    if (opType === 'softmax') {
        return MATRIX_NAMES.head(layerIndex, headIndex ?? 0).ScaledScores;
    }
    return MATRIX_NAMES.layer(layerIndex).Intermediate;
};

export const ElementwiseOperation: React.FC<ElementwiseOperationProps> = ({
    opType,
    inputMatrix,
    outputMatrix,
    outputMatrixName,
    highlight,
    onElementClick,
    layerIndex,
    headIndex,
}) => {
    const relevantInputName = getInputMatrixName(opType, layerIndex, headIndex);
    let targetRowIndex = 0;

    if (highlight.target) {
        if (highlight.target.name === relevantInputName || highlight.target.name === outputMatrixName) {
            targetRowIndex = highlight.target.row;
        } else if (highlight.target.isInternal && highlight.target.name.startsWith(outputMatrixName)) {
            targetRowIndex = highlight.target.row;
        }
    }

    const inputRow = inputMatrix[targetRowIndex] || [];
    const outputRow = outputMatrix[targetRowIndex] || [];

    const opName = opType.charAt(0).toUpperCase() + opType.slice(1);
    const opFunction = opType === 'relu' ? 'max(0, x)' : 'softmax(x_i)';

    return (
        <div className="elementwise-op-container">
            <div className="elementwise-op-label">
                <InlineMath math={`\\text{Detailed Calculation: } ${opName}(x_i) = ${opFunction}`} />
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
            />
        </div>
    );
};
// END OF FILE: src/components/ElementwiseOperation.tsx