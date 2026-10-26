import React, { useState } from 'react';
import { speakEnglishTerm } from '../services/geminiService';

interface PronunciationButtonProps {
  term: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

const PronunciationButton: React.FC<PronunciationButtonProps> = ({
  term,
  size = 'md',
  className = '',
  showText = true,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSpeaking(true);
    const success = speakEnglishTerm(term);
    setTimeout(() => setIsSpeaking(false), 1200);
    if (!success) {
      setIsSpeaking(false);
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-2.5 py-1.5 text-xs font-medium gap-1.5',
    lg: 'px-3.5 py-2 text-sm font-semibold gap-2',
  }[size];

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:hover:bg-teal-900 dark:text-teal-300 border border-teal-200 dark:border-teal-800 transition-all active:scale-95 shadow-2xs ${sizeClasses} ${className}`}
      title={`Nghe phát âm chuẩn tiếng Anh: "${term}"`}
    >
      <span className={`text-base ${isSpeaking ? 'animate-bounce text-teal-600' : ''}`}>🔊</span>
      {showText && <span>{isSpeaking ? 'Đang đọc...' : 'Nghe phát âm'}</span>}
    </button>
  );
};

export default PronunciationButton;
