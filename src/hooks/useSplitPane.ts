// FILE: src/hooks/useSplitPane.ts
import { useState, useCallback, useRef, MouseEvent } from 'react';

export const useSplitPane = (initialPrimarySize: number, minPrimarySize: number = 200, minSecondarySize: number = 200) => {
    const [primarySize, setPrimarySize] = useState(initialPrimarySize);
    const separatorRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();

        const startX = e.clientX;
        const startSize = primarySize;

        const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
            if (!containerRef.current) return;
            const dx = moveEvent.clientX - startX;
            const containerWidth = containerRef.current.offsetWidth;

            let newPrimarySize = startSize + dx;

            // Enforce min sizes
            if (newPrimarySize < minPrimarySize) {
                newPrimarySize = minPrimarySize;
            }
            if (containerWidth - newPrimarySize < minSecondarySize) {
                newPrimarySize = containerWidth - minSecondarySize;
            }

            setPrimarySize(newPrimarySize);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [primarySize, minPrimarySize, minSecondarySize]);

    return {
        primarySize,
        separatorProps: {
            ref: separatorRef,
            onMouseDown: handleMouseDown,
        },
        containerProps: {
            ref: containerRef,
        },
    };
};

// END OF FILE: src/hooks/useSplitPane.ts