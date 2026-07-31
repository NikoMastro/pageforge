import React, { useState } from 'react';

interface DragDropReorderProps<T> {
  items: T[];
  onReorder: (newItems: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  className?: string;
}

function DragDropReorder<T>({
  items,
  onReorder,
  renderItem,
  keyExtractor,
  className = ''
}: DragDropReorderProps<T>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', ''); // For Firefox
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];

    // Remove the dragged item
    newItems.splice(draggedIndex, 1);

    // Insert it at the new position
    const insertIndex = draggedIndex < index ? index - 1 : index;
    newItems.splice(insertIndex, 0, draggedItem);

    onReorder(newItems);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div
          key={keyExtractor(item, index)}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`
            relative cursor-move transition-all duration-200
            ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
            ${dragOverIndex === index && draggedIndex !== index ? 'transform translate-y-1' : ''}
          `}
        >
          {dragOverIndex === index && draggedIndex !== null && draggedIndex !== index && (
            <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-10" />
          )}
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

export default DragDropReorder;
