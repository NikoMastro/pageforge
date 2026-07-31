import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CheckIcon, XMarkIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';

interface InlineImageCropperProps {
  imageUrl: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

type DragHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 'e' | 's' | 'w' | 'move' | null;

export const InlineImageCropper: React.FC<InlineImageCropperProps> = ({ imageUrl, onCropComplete, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState<DragHandle>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
      // Initialize crop area to center 80% of image
      const margin = 0.1;
      setCropArea({
        x: img.naturalWidth * margin,
        y: img.naturalHeight * margin,
        width: img.naturalWidth * (1 - 2 * margin),
        height: img.naturalHeight * (1 - 2 * margin),
      });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Calculate scale to fit image in canvas
  useEffect(() => {
    if (!image || !containerRef.current) return;
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const scaleX = containerWidth / image.naturalWidth;
    const scaleY = containerHeight / image.naturalHeight;
    const newScale = Math.min(scaleX, scaleY, 1) * 0.95; // 95% to leave some margin
    setScale(newScale);
    setOffset({
      x: (containerWidth - image.naturalWidth * newScale) / 2,
      y: (containerHeight - image.naturalHeight * newScale) / 2,
    });
  }, [image]);

  // Draw canvas
  useEffect(() => {
    if (!canvasRef.current || !image) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const container = containerRef.current;
    if (!container) return;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(image, offset.x, offset.y, image.naturalWidth * scale, image.naturalHeight * scale);

    // Draw overlay (darken non-cropped area)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear crop area
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(
      offset.x + cropArea.x * scale,
      offset.y + cropArea.y * scale,
      cropArea.width * scale,
      cropArea.height * scale
    );
    ctx.globalCompositeOperation = 'source-over';

    // Draw crop area border
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      offset.x + cropArea.x * scale,
      offset.y + cropArea.y * scale,
      cropArea.width * scale,
      cropArea.height * scale
    );

    // Draw grid lines (rule of thirds)
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.3)';
    ctx.lineWidth = 1;
    const gridX = offset.x + cropArea.x * scale;
    const gridY = offset.y + cropArea.y * scale;
    const gridW = cropArea.width * scale;
    const gridH = cropArea.height * scale;

    // Vertical lines
    ctx.beginPath();
    ctx.moveTo(gridX + gridW / 3, gridY);
    ctx.lineTo(gridX + gridW / 3, gridY + gridH);
    ctx.moveTo(gridX + (2 * gridW) / 3, gridY);
    ctx.lineTo(gridX + (2 * gridW) / 3, gridY + gridH);
    ctx.stroke();

    // Horizontal lines
    ctx.beginPath();
    ctx.moveTo(gridX, gridY + gridH / 3);
    ctx.lineTo(gridX + gridW, gridY + gridH / 3);
    ctx.moveTo(gridX, gridY + (2 * gridH) / 3);
    ctx.lineTo(gridX + gridW, gridY + (2 * gridH) / 3);
    ctx.stroke();

    // Draw handles
    const handleSize = 10;
    const handles = [
      { x: offset.x + cropArea.x * scale, y: offset.y + cropArea.y * scale }, // nw
      { x: offset.x + (cropArea.x + cropArea.width) * scale, y: offset.y + cropArea.y * scale }, // ne
      { x: offset.x + cropArea.x * scale, y: offset.y + (cropArea.y + cropArea.height) * scale }, // sw
      { x: offset.x + (cropArea.x + cropArea.width) * scale, y: offset.y + (cropArea.y + cropArea.height) * scale }, // se
      { x: offset.x + (cropArea.x + cropArea.width / 2) * scale, y: offset.y + cropArea.y * scale }, // n
      { x: offset.x + (cropArea.x + cropArea.width) * scale, y: offset.y + (cropArea.y + cropArea.height / 2) * scale }, // e
      { x: offset.x + (cropArea.x + cropArea.width / 2) * scale, y: offset.y + (cropArea.y + cropArea.height) * scale }, // s
      { x: offset.x + cropArea.x * scale, y: offset.y + (cropArea.y + cropArea.height / 2) * scale }, // w
    ];

    ctx.fillStyle = '#60a5fa';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    handles.forEach((handle) => {
      ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
    });
  }, [image, cropArea, scale, offset]);

  const getHandleAtPosition = (x: number, y: number): DragHandle => {
    const handleSize = 15;
    const handles: { type: DragHandle; x: number; y: number }[] = [
      { type: 'nw', x: offset.x + cropArea.x * scale, y: offset.y + cropArea.y * scale },
      { type: 'ne', x: offset.x + (cropArea.x + cropArea.width) * scale, y: offset.y + cropArea.y * scale },
      { type: 'sw', x: offset.x + cropArea.x * scale, y: offset.y + (cropArea.y + cropArea.height) * scale },
      { type: 'se', x: offset.x + (cropArea.x + cropArea.width) * scale, y: offset.y + (cropArea.y + cropArea.height) * scale },
      { type: 'n', x: offset.x + (cropArea.x + cropArea.width / 2) * scale, y: offset.y + cropArea.y * scale },
      { type: 'e', x: offset.x + (cropArea.x + cropArea.width) * scale, y: offset.y + (cropArea.y + cropArea.height / 2) * scale },
      { type: 's', x: offset.x + (cropArea.x + cropArea.width / 2) * scale, y: offset.y + (cropArea.y + cropArea.height) * scale },
      { type: 'w', x: offset.x + cropArea.x * scale, y: offset.y + (cropArea.y + cropArea.height / 2) * scale },
    ];

    for (const handle of handles) {
      if (Math.abs(x - handle.x) < handleSize && Math.abs(y - handle.y) < handleSize) {
        return handle.type;
      }
    }

    // Check if inside crop area (for moving)
    if (
      x >= offset.x + cropArea.x * scale &&
      x <= offset.x + (cropArea.x + cropArea.width) * scale &&
      y >= offset.y + cropArea.y * scale &&
      y <= offset.y + (cropArea.y + cropArea.height) * scale
    ) {
      return 'move';
    }

    return null;
  };

  const getCursor = (handle: DragHandle): string => {
    if (!handle) return 'default';
    const cursors: Record<string, string> = {
      'nw': 'nwse-resize',
      'ne': 'nesw-resize',
      'sw': 'nesw-resize',
      'se': 'nwse-resize',
      'n': 'ns-resize',
      's': 'ns-resize',
      'e': 'ew-resize',
      'w': 'ew-resize',
      'move': 'move',
    };
    return cursors[handle] || 'default';
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const handle = getHandleAtPosition(x, y);
    if (handle) {
      setIsDragging(true);
      setDragHandle(handle);
      setDragStart({ x, y });
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (!isDragging) {
        // Update cursor based on position
        const handle = getHandleAtPosition(x, y);
        if (canvasRef.current) {
          canvasRef.current.style.cursor = getCursor(handle);
        }
        return;
      }

      if (!dragHandle || !image) return;
      const dx = (x - dragStart.x) / scale;
      const dy = (y - dragStart.y) / scale;

      setCropArea((prev) => {
        let newCrop = { ...prev };

        if (dragHandle === 'move') {
          newCrop.x = Math.max(0, Math.min(image.naturalWidth - prev.width, prev.x + dx));
          newCrop.y = Math.max(0, Math.min(image.naturalHeight - prev.height, prev.y + dy));
        } else {
          // Handle resizing
          if (dragHandle.includes('n')) {
            const newY = Math.max(0, prev.y + dy);
            const newHeight = prev.height + (prev.y - newY);
            if (newHeight > 10) {
              newCrop.y = newY;
              newCrop.height = newHeight;
            }
          }
          if (dragHandle.includes('s')) {
            newCrop.height = Math.max(10, Math.min(image.naturalHeight - prev.y, prev.height + dy));
          }
          if (dragHandle.includes('w')) {
            const newX = Math.max(0, prev.x + dx);
            const newWidth = prev.width + (prev.x - newX);
            if (newWidth > 10) {
              newCrop.x = newX;
              newCrop.width = newWidth;
            }
          }
          if (dragHandle.includes('e')) {
            newCrop.width = Math.max(10, Math.min(image.naturalWidth - prev.x, prev.width + dx));
          }
        }

        return newCrop;
      });

      setDragStart({ x, y });
    },
    [isDragging, dragHandle, dragStart, scale, image, offset, cropArea]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragHandle(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleCrop = async () => {
    if (!image) return;

    // Create a canvas for cropping
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropArea.width;
    cropCanvas.height = cropArea.height;
    const ctx = cropCanvas.getContext('2d');
    if (!ctx) return;

    // Draw cropped portion
    ctx.drawImage(
      image,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      0,
      0,
      cropArea.width,
      cropArea.height
    );

    // Convert to blob
    cropCanvas.toBlob((blob) => {
      if (blob) {
        onCropComplete(blob);
      }
    }, 'image/png', 0.95);
  };

  const handleReset = () => {
    if (!image) return;
    const margin = 0.1;
    setCropArea({
      x: image.naturalWidth * margin,
      y: image.naturalHeight * margin,
      width: image.naturalWidth * (1 - 2 * margin),
      height: image.naturalHeight * (1 - 2 * margin),
    });
  };

  return (
    <div className="relative w-full h-full">
      {/* Canvas */}
      <div ref={containerRef} className="w-full h-full">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          className="w-full h-full"
        />
      </div>

      {/* Floating Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-gray-900/90 border border-gray-600 rounded-lg px-3 py-2 shadow-lg">
        <span className="text-xs text-gray-300">
          {Math.round(cropArea.width)} × {Math.round(cropArea.height)} px
        </span>
        <div className="w-px h-6 bg-gray-600" />
        <button
          onClick={handleReset}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          title="Reset crop area"
        >
          <ArrowsPointingOutIcon className="w-4 h-4" />
          Reset
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          title="Cancel crop"
        >
          <XMarkIcon className="w-4 h-4" />
          Cancel
        </button>
        <button
          onClick={handleCrop}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
          title="Apply crop"
        >
          <CheckIcon className="w-4 h-4" />
          Apply
        </button>
      </div>

      {/* Help text */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-900/90 border border-gray-600 rounded-lg px-3 py-1.5 text-xs text-gray-300 shadow-lg">
        Drag corners/edges to resize • Drag inside to move
      </div>
    </div>
  );
};

export default InlineImageCropper;
