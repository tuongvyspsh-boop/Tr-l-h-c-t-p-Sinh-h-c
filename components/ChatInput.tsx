import React, { useState, useEffect, useRef } from 'react';
import { MicrophoneIcon, SendIcon } from './icons';

interface SpeechRecognition {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      return;
    }

    try {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionConstructor();
      recognition.continuous = false;
      recognition.lang = 'vi-VN';
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition status:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Web Speech API not initialized:', e);
    }
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleMicClick = () => {
    if (isLoading || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Could not start speech recognition:', err);
        setIsListening(false);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 md:p-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
      <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-2 md:gap-3">
        <div className="relative flex-grow">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              isListening
                ? 'Cô đang lắng nghe câu hỏi của em...'
                : 'Nhập câu hỏi Sinh học (ví dụ: gene, DNA, đột biến, nguyên phân...)'
            }
            className={`w-full py-3 pl-4 pr-11 rounded-full border text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white transition-all ${
              isListening
                ? 'border-red-400 ring-2 ring-red-300 dark:border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            disabled={isLoading}
          />
          {/* Mic icon inside input or next to it */}
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isLoading}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-sm'
                : 'text-gray-400 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400'
            }`}
            title={isListening ? 'Dừng thu âm' : 'Nói để đặt câu hỏi cho cô (Tiếng Việt)'}
          >
            <MicrophoneIcon className="w-5 h-5" />
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center transition-all duration-200 hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed shadow-sm shrink-0"
          title="Gửi câu hỏi"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;