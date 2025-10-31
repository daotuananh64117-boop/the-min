
import React from 'react';
import { PREBUILT_VOICES } from '../constants';
import { Voice } from '../types';

interface VoiceSelectorProps {
  selectedVoice: Voice;
  onVoiceChange: (voice: Voice) => void;
  disabled: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onVoiceChange, disabled }) => {
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const voiceId = event.target.value;
    const voice = PREBUILT_VOICES.find(v => v.id === voiceId) || PREBUILT_VOICES[0];
    onVoiceChange(voice);
  };

  return (
    <div className="space-y-2">
      <label htmlFor="voice-selector" className="block text-sm font-medium text-gray-300">
        Choose a Voice
      </label>
      <select
        id="voice-selector"
        value={selectedVoice.id}
        onChange={handleSelectChange}
        disabled={disabled}
        className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-gray-200 disabled:bg-gray-700 disabled:cursor-not-allowed"
      >
        {PREBUILT_VOICES.map(voice => (
          <option key={voice.id} value={voice.id}>
            {voice.name}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-400 mt-1">{selectedVoice.description}</p>
    </div>
  );
};
