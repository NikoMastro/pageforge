import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ResizablePanelsProps {
  children: React.ReactNode[];
  direction?: 'horizontal' | 'vertical';
  initialSizes?: number[];
  minSizes?: number[];
  className?: string;
}

interface ResizeState {
  isResizing: boolean;
  index: number;
  startPos: number;
  startSizes: number[];
}

const ResizablePanels: React.FC<ResizablePanelsProps> = ({
  children,
  direction = 'horizontal',
  initialSizes,
  minSizes,
  className = ''
}) => {
  // Calculate default sizes if not provided
  const defaultSizes = initialSizes || children.map(() => 100 / children.length);
  const defaultMinSizes = minSizes || children.map(() => 10);

  const [sizes, setSizes] = useState<number[]>(defaultSizes);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault();
    const startPos = direction === 'horizontal' ? e.clientX : e.clientY;
    setResizeState({
      isResizing: true,
      index,
      startPos,
      startSizes: [...sizes]
    });
  }, [sizes, direction]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizeState || !containerRef.current) return;

    e.preventDefault();
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerSize = direction === 'horizontal'
      ? containerRect.width
      : containerRect.height;

    const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
    const delta = currentPos - resizeState.startPos;
    const deltaPercent = (delta / containerSize) * 100;

    const newSizes = [...resizeState.startSizes];
    const { index } = resizeState;

    // Ensure we don't go out of bounds
    if (index >= newSizes.length - 1) return;

    // Calculate new sizes with constraints
    const proposedCurrent = newSizes[index] + deltaPercent;
    const proposedNext = newSizes[index + 1] - deltaPercent;

    // Apply minimum size constraints
    const minCurrent = defaultMinSizes[index];
    const minNext = defaultMinSizes[index + 1];
    const maxCurrent = 100 - minNext;
    const maxNext = 100 - minCurrent;

    const currentPanel = Math.max(minCurrent, Math.min(maxCurrent, proposedCurrent));
    const nextPanel = Math.max(minNext, Math.min(maxNext, proposedNext));

    // Ensure the total is reasonable (accounting for floating point precision)
    const total = currentPanel + nextPanel;
    if (total > 0 && Math.abs(total - (newSizes[index] + newSizes[index + 1])) < 2) {
      newSizes[index] = currentPanel;
      newSizes[index + 1] = nextPanel;
      setSizes(newSizes);
    }
  }, [resizeState, direction, defaultMinSizes]);

  const handleMouseUp = useCallback(() => {
    setResizeState(null);
  }, []);

  useEffect(() => {
    if (resizeState?.isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [resizeState, handleMouseMove, handleMouseUp, direction]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex ${direction === 'horizontal' ? 'flex-row' : 'flex-col'} ${className}`}
    >
      {children.map((child, index) => (
        <React.Fragment key={index}>
          {/* Panel */}
          <div
            className={`${direction === 'horizontal' ? 'h-full' : 'w-full'} min-h-0 min-w-0`}
            style={{
              [direction === 'horizontal' ? 'width' : 'height']: `${sizes[index]}%`
            }}
          >
            {child}
          </div>

          {/* Splitter */}
          {index < children.length - 1 && (
            <div
              className={`
                ${direction === 'horizontal'
                  ? 'w-px h-full cursor-col-resize hover:w-0.5 transition-all duration-200'
                  : 'h-px w-full cursor-row-resize hover:h-0.5 transition-all duration-200'
                }
                bg-gray-200 hover:bg-gray-300 flex-shrink-0 group relative select-none opacity-50 hover:opacity-75
                ${resizeState?.index === index ? 'bg-gray-400 opacity-20' : ''}
              `}
              onMouseDown={(e) => handleMouseDown(e, index)}
            >
              {/* Invisible hit area for easier interaction */}
              <div
                className={`
                  absolute inset-0
                  ${direction === 'horizontal'
                    ? '-left-1 -right-1'
                    : '-top-1 -bottom-1'
                  }
                `}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ResizablePanels;
