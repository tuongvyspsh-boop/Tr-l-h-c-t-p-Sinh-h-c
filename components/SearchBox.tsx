import React, { useState, useEffect, useRef } from 'react';

interface SearchBoxProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSearch, isLoading = false }) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.lang = 'vi-VN';
      rec.continuous = false;
      rec.interimResults = false;

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuery(transcript);
        }
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    } catch (e) {
      console.warn('SpeechRecognition not available:', e);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
      setQuery('');
    }
  };

  const toggleMic = () => {
    if (!recognitionRef.current || isLoading) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Could not start recognition:', err);
        setIsListening(false);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3 md:p-4 shadow-lg shrink-0">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center gap-2">
        <div className="relative flex-grow">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            placeholder={
              isListening
                ? 'Đang lắng nghe... bạn hãy nói thuật ngữ Sinh học...'
                : 'Hỏi một thuật ngữ Sinh học... Ví dụ: Gene là gì? hoặc ADN là gì?'
            }
            className={`w-full py-3.5 pl-4 pr-12 rounded-xl text-sm md:text-base border focus:outline-none transition-all dark:bg-slate-800 dark:text-white shadow-2xs ${
              isListening
                ? 'border-red-400 ring-2 ring-red-400/30'
                : 'border-slate-300 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
            }`}
          />

          {/* Microphone button inside input */}
          <button
            type="button"
            onClick={toggleMic}
            disabled={isLoading}
            className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title={isListening ? 'Dừng ghi âm' : 'Nói để đặt câu hỏi (Microphone)'}
          >
            <span className="text-base">{isListening ? '🛑' : '🎤'}</span>
          </button>
        </div>

        {/* GỬI Button */}
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="px-5 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 active:scale-95 text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>GỬI</span>
              <span className="text-xs">➤</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SearchBox;
