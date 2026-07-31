import React from 'react';
import type { PromptState } from '../../../types/videoGeneration.types';

type PromptInputProps = {
  promptState: PromptState;
  setPromptState: (state: PromptState) => void;
};

export const PromptInput: React.FC<PromptInputProps> = ({
  promptState,
  setPromptState,
}) => {
  const [showNegativePrompt, setShowNegativePrompt] = React.useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-white">Prompt</h2>
        <div className="flex items-center gap-2">
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={showNegativePrompt}
              onChange={(e) => setShowNegativePrompt(e.target.checked)}
              className="peer sr-only"
            />
            <div className="peer h-5 w-9 rounded-full bg-gray-600 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500"></div>
          </label>
          <span className="text-sm text-gray-400">Add negative prompt</span>
        </div>
      </div>

      <textarea
        value={promptState.prompt}
        onChange={(e) => setPromptState({ ...promptState, prompt: e.target.value })}
        placeholder="Describe the video you want to generate... Be specific about the scene, actions, style, and mood."
        rows={3}
        className="w-full resize-none rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {showNegativePrompt && (
        <div className="mt-3">
          <div className="mb-2 flex items-center gap-3">
            <label className="text-xs font-medium text-gray-300">Negative Prompt</label>
            <label className="flex items-center gap-2 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={promptState.useMultipleNegativePrompts}
                onChange={(e) =>
                  setPromptState({ ...promptState, useMultipleNegativePrompts: e.target.checked })
                }
                className="accent-blue-500"
              />
              Multiple prompts
            </label>
          </div>

          {!promptState.useMultipleNegativePrompts ? (
            <textarea
              value={promptState.negativePrompt}
              onChange={(e) => setPromptState({ ...promptState, negativePrompt: e.target.value })}
              placeholder="What you don't want in the video..."
              rows={2}
              className="w-full resize-none rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <textarea
              value={promptState.negativePromptsText}
              onChange={(e) =>
                setPromptState({ ...promptState, negativePromptsText: e.target.value })
              }
              placeholder="Enter multiple negative prompts, one per line..."
              rows={3}
              className="w-full resize-none rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      )}
    </div>
  );
};
