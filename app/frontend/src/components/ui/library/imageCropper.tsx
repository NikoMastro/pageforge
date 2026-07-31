import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CheckIcon, XMarkIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';

interface ImageCropperProps {
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

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageUrl, onCropComplete, onCancel }) => {
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
    const newScale = Math.min(scaleX, scaleY, 1) * 0.9; // 90% to leave some margin
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

    // Draw handles
    const handleSize = 8;
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
    handles.forEach((handle) => {
      ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
    });
  }, [image, cropArea, scale, offset]);

  const getHandleAtPosition = (x: number, y: number): DragHandle => {
    const handleSize = 12;
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
      if (!isDragging || !dragHandle || !canvasRef.current || !image) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
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
    [isDragging, dragHandle, dragStart, scale, image]
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
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">Crop Image</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            <ArrowsPointingOutIcon className="w-5 h-5" />
            <span>Reset</span>
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
            <span>Cancel</span>
          </button>
          <button
            onClick={handleCrop}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors"
          >
            <CheckIcon className="w-5 h-5" />
            <span>Apply Crop</span>
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 relative">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          className="absolute inset-0 cursor-crosshair"
          style={{ cursor: isDragging ? 'move' : 'crosshair' }}
        />
      </div>

      {/* Info */}
      <div className="p-4 bg-gray-900 border-t border-gray-700 text-center text-sm text-gray-400">
        <p>Drag the corners or edges to adjust the crop area. Click and drag inside to move it.</p>
        <p className="mt-1">
          Selection: {Math.round(cropArea.width)} × {Math.round(cropArea.height)} px
        </p>
      </div>
    </div>
  );
};

export default ImageCropper;
