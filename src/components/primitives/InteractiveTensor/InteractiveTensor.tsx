// FILE: src/components/primitives/InteractiveTensor/InteractiveTensor.tsx
import React, { useState } from 'react';
import { InteractiveMatrix } from '../InteractiveMatrix/InteractiveMatrix';
import { HighlightState, ElementIdentifier, Matrix } from '../types';
import './InteractiveTensor.css';

type Tensor = Matrix[];

interface InteractiveTensorProps {
    name: string;
    data: Tensor;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
    symbol?: string;
}

export const InteractiveTensor: React.FC<InteractiveTensorProps> = ({
                                                                        name,
                                                                        data,
                                                                        highlight,
                                                                        onElementClick,
                                                                        symbol,
                                                                    }) => {
    const [sliceIndex, setSliceIndex] = useState(0);

    if (!data || data.length === 0) {
        return <div>Invalid tensor data for {name}</div>;
    }

    const depth = data.length;
    const currentSlice = data[sliceIndex];

    // Modify the name for the child matrix to include slice info
    const matrixName = `${name}[${sliceIndex}]`;

    // Filter highlights to only pass down relevant ones for the current slice
    const sliceHighlight: HighlightState = {
        target: highlight.target?.name.startsWith(name) && highlight.target.row >= sliceIndex * currentSlice.length && highlight.target.row < (sliceIndex + 1) * currentSlice.length ? highlight.target : null,
        sources: highlight.sources.filter(s => s.name.startsWith(name) && s.row >= sliceIndex * currentSlice.length && s.row < (sliceIndex + 1) * currentSlice.length)
    };

    const handleSliceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSliceIndex(parseInt(event.target.value, 10));
    };

    const handleMatrixClick = (element: ElementIdentifier, event: React.MouseEvent) => {
        // We need to adjust the row index to be absolute for the parent component
        const absoluteRow = sliceIndex * currentSlice.length + element.row;
        onElementClick({ ...element, name: name, row: absoluteRow }, event);
    };

    return (
        <div className="interactive-tensor-wrapper">
            <div className="tensor-controls">
                <label htmlFor={`${name}-slice`}>Slice:</label>
                <input
                    id={`${name}-slice`}
                    type="range"
                    min="0"
                    max={depth - 1}
                    value={sliceIndex}
                    onChange={handleSliceChange}
                />
                <span className="slice-indicator">{sliceIndex} / {depth - 1}</span>
            </div>
            <div className="tensor-slice-container">
                <InteractiveMatrix
                    name={matrixName}
                    data={currentSlice}
                    highlight={sliceHighlight}
                    onElementClick={handleMatrixClick}
                    symbol={symbol ? `${symbol}_{${sliceIndex}}` : matrixName}
                />
            </div>
        </div>
    );
};
// END OF FILE: src/components/primitives/InteractiveTensor/InteractiveTensor.tsx