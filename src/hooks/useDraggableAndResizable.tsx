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
                setSize(s => ({...s, height: Math.min(contentHeight + 40, 600)}));
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

    // Switch to numeric height for resizing calculations
    const currentHeight = typeof size.height === 'number' ? size.height : contentRef.current.offsetHeight;
    // [FIXED] Correctly check the value, not the typeof
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

    if (newWidth < 200) {
        if(type.includes('l')) newX = position.x;
        newWidth = 200;
    }
    if (newHeight < 100) {
        if(type.includes('t')) newY = position.y;
        newHeight = 100;
    }

    setSize({ width: newWidth, height: newHeight });
    setPosition({ x: newX, y: newY });

  }, [position.x, position.y]);

  const handleMouseUp = useCallback(() => {
    dragState.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, []);

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