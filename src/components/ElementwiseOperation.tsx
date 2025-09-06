// FILE: src/components/ElementwiseOperation.tsx
import React from 'react';
import { Matrix as MatrixType, HighlightState, ElementIdentifier } from '../types';
import { InlineMath } from 'react-katex';
import { ElementwiseCalculation } from './ElementwiseCalculation';
import { Matrix } from './Matrix';

interface ElementwiseOperationProps {
    opType: 'softmax' | 'relu';
    inputMatrix: MatrixType;
    inputMatrixName: string; // [ADDED] Name for the input matrix
    outputMatrix: MatrixType;
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
}) => {
    let targetRowIndex = 0;

    if (highlight.target) {
        if (highlight.target.name === inputMatrixName || highlight.target.name === outputMatrixName) {
            targetRowIndex = highlight.target.row;
        } else if (highlight.target.isInternal && highlight.target.name.startsWith(outputMatrixName)) {
            targetRowIndex = highlight.target.row;
        }
    }

    const opName = opType.charAt(0).toUpperCase() + opType.slice(1);

    return (
        <div className="elementwise-op-container">
            <div className="elementwise-op-label">
                <InlineMath math={`\\text{Apply } ${opName}`} />
            </div>

            {/* [MODIFIED] Always show input and output for both ReLU and Softmax */}
            <div className="viz-formula-row">
                <Matrix name={inputMatrixName} data={inputMatrix} highlight={highlight} onElementClick={onElementClick} />
                <div className="arrow-down" style={{fontSize: '1.5em', margin: '0 10px'}}><InlineMath math={`\\xrightarrow{\\text{${opName}}}`} /></div>
                <Matrix name={outputMatrixName} data={outputMatrix} highlight={highlight} onElementClick={onElementClick} />
            </div>

            <p style={{margin: '5px 0 0 0', fontSize: '0.8em', color: '#666'}}>
                * Click a cell in the output to see its detailed calculation for Row {targetRowIndex}.
            </p>
            {(highlight.target?.name === outputMatrixName || (highlight.target?.isInternal && highlight.target.name.startsWith(outputMatrixName))) && (
                <ElementwiseCalculation
                    opType={opType}
                    inputRow={inputMatrix[targetRowIndex] || []}
                    outputRow={outputMatrix[targetRowIndex] || []}
                    highlight={highlight}
                    onElementClick={onElementClick}
                    baseName={outputMatrixName}
                    rowIndex={targetRowIndex}
                />
            )}
        </div>
    );
};
// END OF FILE: src/components/ElementwiseOperation.tsx