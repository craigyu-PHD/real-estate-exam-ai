'use client';
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Settings } from 'lucide-react';

export function AudioPlayer({ text, isAiAvailable = false }: { text: string, isAiAvailable?: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (!synthRef.current) return;

    if (isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
    } else {
      if (synthRef.current.paused) {
        synthRef.current.resume();
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-TW';
        utterance.rate = 1.0;
        
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        
        utteranceRef.current = utterance;
        synthRef.current.speak(utterance);
      }
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button 
        onClick={handlePlayPause}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-full text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20"
      >
        {isPlaying ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current" />}
        {isPlaying ? '暫停' : '聽老師說'}
      </button>
      <div className="flex items-center gap-1 text-slate-400 text-xs">
        {isAiAvailable ? (
          <span className="flex items-center gap-1 text-purple-400"><Volume2 size={12}/> AI 語音</span>
        ) : (
          <span className="flex items-center gap-1"><Volume2 size={12}/> 系統語音</span>
        )}
      </div>
    </div>
  );
}
