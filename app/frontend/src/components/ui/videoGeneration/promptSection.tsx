import React from 'react';
import type { PromptState } from '../../../types/videoGeneration.types';
import { PromptInput } from './promptInput';

interface PromptSectionProps {
  promptState: PromptState;
  setPromptState: (state: PromptState) => void;
}

export const PromptSection: React.FC<PromptSectionProps> = ({
  promptState,
  setPromptState,
}) => {
  return (
    <div className="space-y-4">
      <PromptInput promptState={promptState} setPromptState={setPromptState} />
    </div>
  );
};
