import React from 'react';
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';

export type ViewMode = 'cards' | 'list';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="inline-flex items-center bg-gray-700 rounded-md p-1">
      <button
        onClick={() => onViewModeChange('list')}
        className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded transition-colors duration-200 ${viewMode === 'list'
          ? 'bg-gray-600 text-white shadow-sm'
          : 'text-gray-300 hover:text-white hover:bg-gray-600/50'
          }`}
      >
        <ListBulletIcon className="h-4 w-4 sm:mr-1" />
        <span className="hidden sm:inline">List</span>
      </button>
      <button
        onClick={() => onViewModeChange('cards')}
        className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded transition-colors duration-200 ${viewMode === 'cards'
          ? 'bg-gray-600 text-white shadow-sm'
          : 'text-gray-300 hover:text-white hover:bg-gray-600/50'
          }`}
      >
        <Squares2X2Icon className="h-4 w-4 sm:mr-1" />
        <span className="hidden sm:inline">Cards</span>
      </button>
    </div>
  );
};

export default ViewToggle;
