// FILE: src/components/primitives/InteractiveVector/InteractiveVector.tsx
import React from 'react';
import { InteractiveElement } from '../InteractiveElement/InteractiveElement';
import { Vector as VectorType, HighlightState, ElementIdentifier } from '../types';
import './InteractiveElement/InteractiveElement.css'; // Reuse element styles

interface InteractiveVectorProps {
  name: string;
  data: VectorType;
  highlight: HighlightState;
  onElementClick: (element: ElementIdentifier, event: React.MouseEvent) => void;
  direction?: 'row' | 'column';
}

const vectorStyle: React.CSSProperties = {
  display: 'flex',
  gap: '3px',
  border: '1px solid #dcdfe6',
  borderRadius: '4px',
  padding: '4px',
  backgroundColor: '#f9fafb',
  width: 'max-content',
};

export const InteractiveVector: React.FC<InteractiveVectorProps> = ({
  name,
  data,
  highlight,
  onElementClick,
  direction = 'row',
}) => {
  const style: React.CSSProperties = {
    ...vectorStyle,
    flexDirection: direction,
  };

  return (
    <div style={style}>
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