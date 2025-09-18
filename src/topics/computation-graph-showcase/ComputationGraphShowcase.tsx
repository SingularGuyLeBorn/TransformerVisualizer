// FILE: src/topics/computation-graph-showcase/ComputationGraphShowcase.tsx
import React, { useRef } from 'react';
import { DraggableNode } from '../../components/primitives/DraggableNode/DraggableNode';
import './ComputationGraphShowcase.css';

export const ComputationGraphShowcase: React.FC = () => {
    const boundaryRef = useRef<HTMLDivElement>(null);

    return (
        <div className="graph-showcase-container" ref={boundaryRef}>
            <div className="graph-showcase-info">
                <h2>计算图展厅</h2>
                <p>拖拽下方的节点来构建您的计算图。</p>
            </div>

            <DraggableNode
                boundaryRef={boundaryRef}
                initialPosition={{ x: 50, y: 150 }}
                title="Input: X"
            >
                <span>Shape: [B, S, D_model]</span>
            </DraggableNode>

            <DraggableNode
                boundaryRef={boundaryRef}
                initialPosition={{ x: 300, y: 50 }}
                title="Weight: W_q"
            >
                <span>Shape: [D_model, D_k]</span>
            </DraggableNode>

            <DraggableNode
                boundaryRef={boundaryRef}
                initialPosition={{ x: 300, y: 250 }}
                title="Operation: MatMul"
            >
                <span>(X @ W_q)</span>
            </DraggableNode>

            <DraggableNode
                boundaryRef={boundaryRef}
                initialPosition={{ x: 550, y: 150 }}
                title="Output: Q"
            >
                <span>Shape: [B, S, D_k]</span>
            </DraggableNode>
        </div>
    );
};
// END OF FILE: src/topics/computation-graph-showcase/ComputationGraphShowcase.tsx