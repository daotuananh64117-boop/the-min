import React, { useState } from 'react';
import { generateSpeech } from './services/geminiService';
import { decode, decodeAudioData, bufferToWav } from './utils/audioUtils';
import { AudioPlayer } from './components/AudioPlayer';
import { VoiceSelector } from './components/VoiceSelector';
import { PREBUILT_VOICES } from './constants';
import { Voice } from './types';
import { GithubIcon, InfoIcon, LoaderIcon } from './components/icons';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedAudio, setGeneratedAudio] = useState<{ buffer: AudioBuffer; blob: Blob } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<Voice>(PREBUILT_VOICES[0]);

  const handleGenerateAudio = async () => {
    if (!inputText.trim()) {
      setError("Please type some text first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedAudio(null);

    try {
      const base64Audio = await generateSpeech(inputText, selectedVoice.id);
      if (!base64Audio) {
        throw new Error("API did not return audio data.");
      }

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const decodedBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(decodedBytes, audioContext, 24000, 1);
      const wavBlob = bufferToWav(audioBuffer);

      setGeneratedAudio({ buffer: audioBuffer, blob: wavBlob });
    } catch (err) {
      console.error(err);
      setError(`Failed to generate audio. ${err instanceof Error ? err.message : 'Unknown error'}. Make sure your API key is configured correctly.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 border border-gray-700">
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">AI Voice Studio</h1>
          <p className="text-gray-400 mt-2">Enter text to generate high-quality audio.</p>
        </header>
        
        <div className="space-y-2">
          <label htmlFor="text-input" className="block text-sm font-medium text-gray-300">
            Text Input
          </label>
          <textarea
            id="text-input"
            rows={5}
            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-gray-200 placeholder-gray-500"
            placeholder="Enter text here to generate audio..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-4">
            <VoiceSelector selectedVoice={selectedVoice} onVoiceChange={setSelectedVoice} disabled={isLoading} />
            <button
                onClick={handleGenerateAudio}
                disabled={isLoading || !inputText.trim()}
                className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100"
            >
                {isLoading ? <LoaderIcon /> : 'Generate Audio'}
            </button>
        </div>
        
        {error && !isLoading && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg flex items-center" role="alert">
            <InfoIcon />
            <span className="ml-3">{error}</span>
          </div>
        )}

        {generatedAudio && (
            <AudioPlayer audioBuffer={generatedAudio.buffer} audioBlob={generatedAudio.blob} voiceName={selectedVoice.name} />
        )}
      </div>
       <footer className="text-center mt-8 text-gray-500 text-sm">
        <p>Built with React, Tailwind CSS, and the Google Gemini API.</p>
        <a href="https://github.com/google/generative-ai-docs/tree/main/site/en/gemini-api/docs/text-to-speech" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-indigo-400 transition-colors mt-2">
            <GithubIcon />
            View Gemini TTS Docs
        </a>
      </footer>
    </div>
  );
};

export default App;