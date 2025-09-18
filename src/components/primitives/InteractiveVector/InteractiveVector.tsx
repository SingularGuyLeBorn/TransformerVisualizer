// FILE: src/components/primitives/InteractiveVector/InteractiveVector.tsx
import React from 'react';
import { InteractiveElement } from '../InteractiveElement/InteractiveElement';
import { Vector as VectorType, HighlightState, ElementIdentifier } from '../types';
import './InteractiveVector.css'; // [FIX] Corrected CSS import path

interface InteractiveVectorProps {
    name: string;
    data: VectorType;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
    direction?: 'row' | 'column';
}

export const InteractiveVector: React.FC<InteractiveVectorProps> = ({
                                                                        name,
                                                                        data,
                                                                        highlight,
                                                                        onElementClick,
                                                                        direction = 'row',
                                                                    }) => {
    const classNames = `interactive-vector ${direction}`;

    return (
        <div className={classNames}>
            {data.map((val, i) => (
                <InteractiveElement
                    key={i}
                    identifier={{ name: name, row: 0, col: i }}
                    value={val}
                    highlight={highlight}
                    onElementClick={onElementClick}
                />
            ))}
        </div>
    );
};
// END OF FILE: src/components/primitives/InteractiveVector/InteractiveVector.tsx