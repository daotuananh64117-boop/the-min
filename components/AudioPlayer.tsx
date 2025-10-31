
import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, DownloadIcon } from './icons';

interface AudioPlayerProps {
  audioBuffer: AudioBuffer;
  audioBlob: Blob;
  voiceName: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioBuffer, audioBlob, voiceName }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Cleanup on unmount or when buffer changes
    return () => {
      sourceRef.current?.stop();
      audioContextRef.current?.close();
    };
  }, [audioBuffer]);

  const handlePlayPause = () => {
    if (isPlaying) {
      sourceRef.current?.stop();
      setIsPlaying(false);
    } else {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.onended = () => {
        setIsPlaying(false);
        audioContext.close();
      };
      source.start();

      sourceRef.current = source;
      audioContextRef.current = audioContext;
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-voice-${voiceName.toLowerCase()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-700/50 rounded-lg p-4 space-y-3 animate-fade-in">
        <p className="text-sm font-medium text-gray-300">Generated Audio ({voiceName})</p>
        <div className="flex items-center gap-4">
            <button
                onClick={handlePlayPause}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
                <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <div className="flex-grow h-2 bg-gray-600 rounded-full">
              <div className="bg-indigo-500 h-2 rounded-full" style={{ width: isPlaying ? '100%' : '0%', transition: isPlaying ? `width ${audioBuffer.duration}s linear` : 'none' }}></div>
            </div>
            <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
                <DownloadIcon />
                <span>Download</span>
            </button>
        </div>
    </div>
  );
};
