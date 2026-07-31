import React from 'react';

interface ToggleSwitchProps {
  leftLabel: string;
  rightLabel: string;
  value: string;
  onToggle: (value: string) => void;
  leftValue: string;
  rightValue: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  leftLabel,
  rightLabel,
  value,
  onToggle,
  leftValue,
  rightValue
}) => {
  return (
    <div className="flex items-center space-x-3">
      <span className={`text-sm font-medium ${value === leftValue ? 'text-indigo-400' : 'text-gray-500'}`}>
        {leftLabel}
      </span>
      <button
        type="button"
        onClick={() => onToggle(value === leftValue ? rightValue : leftValue)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${value === rightValue ? 'bg-indigo-600' : 'bg-gray-600'
          }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value === rightValue ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
      </button>
      <span className={`text-sm font-medium ${value === rightValue ? 'text-indigo-400' : 'text-gray-500'}`}>
        {rightLabel}
      </span>
    </div>
  );
};

export default ToggleSwitch;
