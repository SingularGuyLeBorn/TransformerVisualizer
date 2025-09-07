// FILE: src/hooks/useDraggableAndResizable.ts
import { useState, useCallback, useRef, MouseEvent, useEffect } from 'react';

type DragType = 'move' | 'resize-t' | 'resize-r' | 'resize-b' | 'resize-l' | 'resize-br';

interface DragState {
  type: DragType;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startLeft: number;
  startTop: number;
}

export const useDraggableAndResizable = (initialState: {
  width: number;
  height: number | 'auto';
  x: number;
  y: number;
}, contentRef: React.RefObject<HTMLDivElement>) => {
  const [size, setSize] = useState<{width: number, height: number | 'auto'}>({ width: initialState.width, height: initialState.height });
  const [position, setPosition] = useState({ x: initialState.x, y: initialState.y });
  const observerRef = useRef<ResizeObserver | null>(null);

  const dragState = useRef<DragState | null>(null);

  // --- [NEW] Effect to clamp initial position and size to be within the viewport ---
  useEffect(() => {
    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

    let initialWidth = initialState.width;
    let initialHeight = typeof initialState.height === 'number' ? initialState.height : 500; // Use a default for 'auto'

    let clampedWidth = clamp(initialWidth, 200, window.innerWidth);
    let clampedHeight = clamp(initialHeight, 100, window.innerHeight);

    let clampedX = clamp(initialState.x, 0, window.innerWidth - clampedWidth);
    let clampedY = clamp(initialState.y, 0, window.innerHeight - clampedHeight);

    // If the window is smaller than the component, adjust position to 0
    if (clampedWidth >= window.innerWidth) clampedX = 0;
    if (clampedHeight >= window.innerHeight) clampedY = 0;

    setSize({ width: clampedWidth, height: initialState.height === 'auto' ? 'auto' : clampedHeight });
    setPosition({ x: clampedX, y: clampedY });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount


  const disconnectObserver = useCallback(() => {
    if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (size.height === 'auto' && contentRef.current) {
        disconnectObserver();
        observerRef.current = new ResizeObserver(entries => {
            const entry = entries[0];
            if (entry) {
                const contentHeight = entry.contentRect.height;
                // Add panel header/padding height to content height
                const totalHeight = contentHeight + 80; // Approximate extra height
                setSize(s => ({...s, height: Math.min(totalHeight, window.innerHeight - 40)}));
            }
        });
        observerRef.current.observe(contentRef.current);
    }
    return () => disconnectObserver();
  }, [contentRef, size.height, disconnectObserver]);


  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>, type: DragType) => {
    e.preventDefault();
    e.stopPropagation();

    if (!contentRef.current) return;

    const currentHeight = typeof size.height === 'number' ? size.height : contentRef.current.offsetHeight;
    if (size.height === 'auto') {
        setSize(s => ({...s, height: currentHeight}));
    }

    dragState.current = {
      type,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: contentRef.current.offsetWidth,
      startHeight: currentHeight,
      startLeft: position.x,
      startTop: position.y,
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [size, position, contentRef]);

  const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
    if (!dragState.current) return;
    e.preventDefault();
    e.stopPropagation();

    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    const { type, startWidth, startHeight, startLeft, startTop } = dragState.current;

    let newWidth = startWidth;
    let newHeight = startHeight;
    let newX = startLeft;
    let newY = startTop;

    if (type === 'move') {
      newX = startLeft + dx;
      newY = startTop + dy;
    } else {
        if (type.includes('r')) newWidth = startWidth + dx;
        if (type.includes('l')) {
            newWidth = startWidth - dx;
            newX = startLeft + dx;
        }
        if (type.includes('b')) newHeight = startHeight + dy;
        if (type.includes('t')) {
            newHeight = startHeight - dy;
            newY = startTop + dy;
        }
    }

    // --- [MODIFIED] Add boundary constraints ---
    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

    // Minimum dimensions
    newWidth = Math.max(200, newWidth);
    newHeight = Math.max(100, newHeight);

    // Clamp size to viewport
    newWidth = Math.min(newWidth, window.innerWidth);
    newHeight = Math.min(newHeight, window.innerHeight);

    // Clamp position to viewport
    newX = clamp(newX, 0, window.innerWidth - newWidth);
    newY = clamp(newY, 0, window.innerHeight - newHeight);
    // --- End of boundary constraints ---

    setSize({ width: newWidth, height: newHeight });
    setPosition({ x: newX, y: newY });

  }, []);

  const handleMouseUp = useCallback(() => {
    dragState.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  return {
    size,
    position,
    dragHandleProps: { onMouseDown: (e: MouseEvent<HTMLDivElement>) => handleMouseDown(e, 'move') },
    resizeHandleProps: {
        br: { onMouseDown: (e: MouseEvent<HTMLDivElement>) => handleMouseDown(e, 'resize-br') },
        r: { onMouseDown: (e: MouseEvent<HTMLDivElement>) => handleMouseDown(e, 'resize-r') },
        b: { onMouseDown: (e: MouseEvent<HTMLDivElement>) => handleMouseDown(e, 'resize-b') },
        l: { onMouseDown: (e: MouseEvent<HTMLDivElement>) => handleMouseDown(e, 'resize-l') },
        t: { onMouseDown: (e: MouseEvent<HTMLDivElement>) => handleMouseDown(e, 'resize-t') },
    },
  };
};
// END OF FILE: src/hooks/useDraggableAndResizable.ts