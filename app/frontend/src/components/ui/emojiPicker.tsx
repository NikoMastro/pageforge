import React, { useState, useRef, useEffect } from 'react';

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const FAVICON_EMOJIS = [
  // Games & Fun
  '🎮', '🎲', '🎯', '🎪', '🎨', '🎬', '🎵', '🎸', '🎺', '🎻',
  '🎹', '🎷', '🪘', '🎰', '🧩', '🪀', '🪁', '🃏', '🀄', '🎴',
  // Tech & Tools
  '🚀', '💻', '🖥️', '📱', '⚡', '🔧', '🛠️', '💡', '🔒', '🔑',
  '⌨️', '🖱️', '💾', '💿', '📀', '🔌', '🔋', '📡', '🛰️', '🤖',
  // Objects
  '📦', '📚', '📖', '✏️', '🖊️', '📝', '📋', '📌', '📍', '🗂️',
  '🗃️', '🗄️', '📎', '🔗', '📐', '📏', '🧮', '🔬', '🔭', '💼',
  // Nature & Weather
  '🌟', '⭐', '✨', '🔥', '💧', '🌈', '☀️', '🌙', '🌊', '❄️',
  '🌸', '🌺', '🌻', '🌹', '🍀', '🌴', '🌵', '🍁', '🍂', '🌾',
  // Symbols
  '❤️', '💜', '💙', '💚', '💛', '🧡', '🤍', '🖤', '💎', '👑',
  '🏅', '🎖️', '🏆', '🥇', '🥈', '🥉', '⚜️', '🔱', '💫', '🌀',
  // Faces & People
  '😀', '😎', '🤖', '👻', '💀', '👽', '🦊', '🐱', '🐶', '🦁',
  '🐼', '🐨', '🐯', '🦄', '🐲', '🦅', '🦋', '🐙', '🦈', '🐊',
  // Food & Drink
  '🍕', '🍔', '🍟', '🌮', '🍦', '🍩', '🎂', '🍪', '☕', '🍺',
  '🍷', '🍹', '🧃', '🧋', '🍿', '🧁', '🍫', '🍬', '🍭', '🥤',
  // Sports
  '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🎱', '🏓', '🥊', '🏆',
  '🏋️', '🤸', '⛷️', '🏂', '🏄', '🚴', '🎿', '⛳', '🏹', '🥋',
  // Transport
  '🚗', '🚕', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '✈️', '🛸',
  '🚂', '🚁', '⛵', '🚢', '🛥️', '🏍️', '🛵', '🚲', '🛴', '🛩️',
  // Misc
  '🔫', '🎧', '🎤', '📷', '📹', '🔔', '🏠', '🏰', '🗿', '🎁',
  '💰', '💵', '💳', '🧲', '⚙️', '🧪', '💊', '🩺', '🛡️', '⚔️',
  // Flags & Symbols
  '🚩', '🏴', '🏳️', '🎌', '✅', '❌', '⭕', '❓', '❗', '💯',
  '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔶'
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  value,
  onChange,
  label = 'Emoji',
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const emojiSizeClasses = {
    sm: 'text-lg w-7 h-7',
    md: 'text-xl w-8 h-8',
    lg: 'text-2xl w-10 h-10'
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center gap-2 rounded-md border border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${sizeClasses[size]}`}
      >
        {value ? <span className="text-xl">{value}</span> : null}
        <span>{label}</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-72 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-3">
          {/* Search input */}
          <input
            type="text"
            placeholder="Paste or type an emoji..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              const trimmed = e.target.value.trim();
              if (trimmed && /^\p{Emoji}$/u.test(trimmed)) {
                onChange(trimmed);
                setIsOpen(false);
                setSearch('');
              }
            }}
            className="w-full mb-3 rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-gray-200 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />

          {/* Emoji grid */}
          <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
            {FAVICON_EMOJIS.map((emoji, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  onChange(emoji);
                  setIsOpen(false);
                  setSearch('');
                }}
                className={`flex items-center justify-center ${emojiSizeClasses[size]} rounded hover:bg-gray-700 transition-colors`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Clear button */}
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="mt-3 w-full px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 border border-gray-600 rounded hover:bg-gray-700 transition-colors"
            >
              Clear emoji
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
