// FILE: src/components/primitives/DraggableNode/DraggableNode.tsx
import React, { useState, useRef } from 'react';
import './DraggableNode.css';

interface DraggableNodeProps {
    initialPosition: { x: number; y: number };
    boundaryRef: React.RefObject<HTMLElement>;
    title: string;
    children?: React.ReactNode;
}

export const DraggableNode: React.FC<DraggableNodeProps> = ({ initialPosition, boundaryRef, title, children }) => {
    const [position, setPosition] = useState(initialPosition);
    const nodeRef = useRef<HTMLDivElement>(null);
    const dragInfo = useRef({ isDragging: false, offsetX: 0, offsetY: 0 });

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!nodeRef.current) return;
        const nodeRect = nodeRef.current.getBoundingClientRect();
        dragInfo.current = {
            isDragging: true,
            offsetX: e.clientX - nodeRect.left,
            offsetY: e.clientY - nodeRect.top,
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!dragInfo.current.isDragging || !boundaryRef.current || !nodeRef.current) return;
        e.preventDefault();

        const boundaryRect = boundaryRef.current.getBoundingClientRect();
        const nodeRect = nodeRef.current.getBoundingClientRect();

        let newX = e.clientX - boundaryRect.left - dragInfo.current.offsetX;
        let newY = e.clientY - boundaryRect.top - dragInfo.current.offsetY;

        // Clamp position within boundary
        newX = Math.max(0, Math.min(newX, boundaryRect.width - nodeRect.width));
        newY = Math.max(0, Math.min(newY, boundaryRect.height - nodeRect.height));

        setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
        dragInfo.current.isDragging = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    return (
        <div
            ref={nodeRef}
            className="draggable-node"
            style={{ top: position.y, left: position.x }}
            onMouseDown={handleMouseDown}
        >
            <div className="node-header">{title}</div>
            {children && <div className="node-content">{children}</div>}
        </div>
    );
};
// END OF FILE: src/components/primitives/DraggableNode/DraggableNode.tsx