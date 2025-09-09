// FILE: src/topics/transformer-explorer/components/ElementwiseOperation.tsx
import React from 'react';
import { Matrix, HighlightState, ElementIdentifier } from '../types';
import { InlineMath } from 'react-katex';
import { ElementwiseCalculation } from './ElementwiseCalculation';

interface ElementwiseOperationProps {
    opType: 'softmax' | 'relu';
    inputMatrix: Matrix;
    inputMatrixName: string;
    outputMatrix: Matrix;
    outputMatrixName: string;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
    layerIndex: number;
    headIndex?: number;
}

export const ElementwiseOperation: React.FC<ElementwiseOperationProps> = ({
                                                                              opType,
                                                                              inputMatrix,
                                                                              inputMatrixName,
                                                                              outputMatrix,
                                                                              outputMatrixName,
                                                                              highlight,
                                                                              onElementClick,
                                                                              layerIndex,
                                                                              headIndex,
                                                                          }) => {
    let targetRowIndex = 0;

    if (highlight.target) {
        if (highlight.target.name === inputMatrixName || highlight.target.name === outputMatrixName) {
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
// END OF FILE: src/topics/transformer-explorer/components/ElementwiseOperation.tsx