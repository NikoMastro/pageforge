import React, { useState } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SearchbarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  value?: string;
  className?: string;
  disabled?: boolean;
}

const Searchbar: React.FC<SearchbarProps> = ({
  placeholder = "Search...",
  onSearch,
  onClear,
  value = "",
  className = "",
  disabled = false
}) => {
  const [query, setQuery] = useState(value);

  // Sync internal state with external value prop
  React.useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    if (onSearch) {
      onSearch(newQuery);
    }
  };

  const handleClear = () => {
    setQuery("");
    if (onClear) {
      onClear();
    }
    if (onSearch) {
      onSearch("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(query);
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative">
        {/* Search icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon
            className={`h-4 w-4 ${disabled ? 'text-gray-600' : 'text-gray-400'}`}
          />
        </div>

        {/* Search input */}
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            block w-full pl-9 ${query ? 'pr-9' : 'pr-3'} py-2 text-sm
            border border-gray-700 rounded-md
            bg-gray-800 shadow-sm
            placeholder-gray-500 text-gray-100
            focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500
            disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed
            transition duration-200 ease-in-out
            hover:border-gray-600
          `}
        />

        {/* Right side buttons */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
          {/* Clear button */}
          {query && !disabled && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-700 rounded-md transition duration-150 ease-in-out"
              aria-label="Clear search query"
            >
              <XMarkIcon className="h-3.5 w-3.5 text-gray-400 hover:text-gray-200" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Searchbar;
