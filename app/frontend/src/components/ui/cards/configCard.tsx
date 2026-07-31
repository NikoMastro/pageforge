import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

export interface ConfigCardProps {
  name: string;
  description?: string;
  active?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  variant?: 'card' | 'list';
  author?: string;
}

const ConfigCard: React.FC<ConfigCardProps> = ({ name, description, active = false, onClick, onDelete, variant = 'card', author }) => {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
      className={
        variant === 'list'
          ? 'group cursor-pointer rounded-md border border-gray-700 bg-[#0e2432] px-4 py-3 hover:bg-[#112b3e]'
          : 'group cursor-pointer overflow-hidden rounded-lg border border-gray-700 bg-[#0e2432] shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl'
      }
    >
      {variant === 'list' ? (
        <div className="grid items-center gap-3" style={{ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))' }}>
          {/* Name */}
          <div className="min-w-0" style={{ gridColumn: 'span 3 / span 3' }}>
            <h3 className="truncate text-base font-semibold text-gray-100" title={name}>{name}</h3>
          </div>
          {/* Description */}
          <div className="min-w-0" style={{ gridColumn: 'span 5 / span 5' }}>
            {description ? (
              <p className="truncate text-sm text-gray-400" title={description}>{description}</p>
            ) : (
              <p className="truncate text-sm text-gray-500 italic">No description</p>
            )}
          </div>
          {/* Author */}
          <div className="min-w-0" style={{ gridColumn: 'span 2 / span 2' }}>
            <p className="truncate text-xs text-gray-500" title={author || ''}>{author || ''}</p>
          </div>
          {/* Status */}
          <div className="justify-self-end text-sm text-gray-400" style={{ gridColumn: 'span 1 / span 1' }}>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${active ? 'bg-green-900/40 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
              {active ? 'Active' : 'Inactive'}
            </span>
          </div>
          {/* Delete Button */}
          <div className="justify-self-end" style={{ gridColumn: 'span 1 / span 1' }}>
            {onDelete && (
              <button
                onClick={handleDeleteClick}
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                title="Delete configuration"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3 p-4 border-b border-gray-700">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-semibold text-gray-100" title={name}>{name}</h3>
              {description ? (
                <p className="mt-1 line-clamp-2 text-sm text-gray-400">{description}</p>
              ) : null}
              {author ? (
                <p className="mt-1 text-xs text-gray-500">Last by: {author}</p>
              ) : null}
            </div>
            {onDelete && (
              <button
                onClick={handleDeleteClick}
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                title="Delete configuration"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="p-4 text-sm text-gray-400">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${active ? 'bg-green-900/40 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
              {active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default ConfigCard;
