// FILE: src/topics/attention-variants/components/Matrix.tsx
import React from 'react';
import { Element } from './Element';
import { Matrix as MatrixType, HighlightState, ElementIdentifier } from '../types';
import { InlineMath } from 'react-katex';
import { getVisibleIndices, ELLIPSIS } from '../utils/matrixView';
import { getSymbolParts } from '../lib/symbolMapping';

interface MatrixProps {
    name: string;
    data: MatrixType;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
    sideLabel?: boolean; // For explicit side-labeling when not in a vertical row
    isTransposed?: boolean;
}

export const Matrix: React.FC<MatrixProps> = ({ name, data, highlight, onElementClick, sideLabel = false, isTransposed = false }) => {
    if (!data || data.length === 0 || data[0].length === 0) {
        return <div>Invalid matrix data for {name}</div>;
    }

    const numRows = data.length;
    const numCols = data[0].length;

    // [NEW] Logic for dynamic label positioning
    const useBottomLabel = numCols > 8;
    const wrapperClasses = ['matrix-wrapper'];
    if (sideLabel && !useBottomLabel) {
        wrapperClasses.push('side-label');
    }
    if (useBottomLabel) {
        wrapperClasses.push('label-bottom');
    }


    const displayRows = isTransposed ? numCols : numRows;
    const displayCols = isTransposed ? numRows : numCols;


    let focusRow = -1;
    let focusCol = -1;

    const isTargetMatrix = !!highlight.target && highlight.target.name === name;
    const isSourceMatrix = highlight.sources.some(s => s.name === name);
    const shouldShowHeaders = isTargetMatrix || isSourceMatrix;

    if (isTargetMatrix) {
        focusRow = highlight.target!.row;
        focusCol = highlight.target!.col;
    } else if (isSourceMatrix) {
        const relevantSource = highlight.sources.find(s => s.name === name)!;
        focusRow = relevantSource.row === -1 ? focusRow : relevantSource.row;
        focusCol = relevantSource.col === -1 ? focusCol : relevantSource.col;
    }

    const visibleRowIndices = getVisibleIndices(displayRows, isTransposed ? focusCol : focusRow);
    const visibleColIndices = getVisibleIndices(displayCols, isTransposed ? focusRow : focusCol);

    const symbolParts = getSymbolParts(name);
    let mathSymbol = symbolParts.base;
    if(symbolParts.superscript) mathSymbol = `${mathSymbol}^{${symbolParts.superscript}}`;
    if(symbolParts.subscript) mathSymbol = `${mathSymbol}_{${symbolParts.subscript}}`;
    if(isTransposed) mathSymbol = `${mathSymbol}^T`;


    const matrixGrid = (
        <div className="matrix-grid" data-name={name} style={{ gridTemplateColumns: shouldShowHeaders ? `auto repeat(${visibleColIndices.length}, auto)` : `repeat(${visibleColIndices.length}, auto)` }}>
            {shouldShowHeaders && <div key="corner" />}
            {shouldShowHeaders && visibleColIndices.map((c, cIdx) => (
                <div key={`ch-${cIdx}`} className="matrix-header-item">{c}</div>
            ))}
            {visibleRowIndices.map((r, rIdx) => (
                <React.Fragment key={`row-frag-${rIdx}`}>
                    {shouldShowHeaders && <div className="matrix-header-item">{r}</div>}
                    {visibleColIndices.map((c, cIdx) => {
                        if (r === ELLIPSIS) {
                            return <div key={`ellipsis-r-${rIdx}-c-${cIdx}`} className="matrix-ellipsis">{c === ELLIPSIS ? '⋱' : '…'}</div>;
                        }
                        if (c === ELLIPSIS) {
                            return <div key={`ellipsis-r-${rIdx}-c-${cIdx}`} className="matrix-ellipsis">…</div>;
                        }
                        const originalRow = isTransposed ? c : r;
                        const originalCol = isTransposed ? r : c;
                        return (
                            <Element
                                key={`${name}-${originalRow}-${originalCol}`}
                                name={name}
                                row={originalRow}
                                col={originalCol}
                                value={data[originalRow][originalCol]}
                                highlight={highlight}
                                onElementClick={onElementClick}
                            />
                        );
                    })}
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <div className={wrapperClasses.join(' ')} data-name={name}>
            <div className="matrix-label-side">
                <div className="matrix-symbol-tag"><InlineMath math={mathSymbol} /></div>
            </div>

            {/* The grid is no longer wrapped in a separate scrolling container */}
            {matrixGrid}

            <div className="matrix-label-container">
                <div className="matrix-symbol-tag"><InlineMath math={mathSymbol} /></div>
            </div>
        </div>
    );
};
// END OF FILE: src/topics/attention-variants/components/Matrix.tsx