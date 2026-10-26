import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { UserIcon, BotIcon, SpeakerWaveIcon, CopyIcon, CheckIcon } from './icons';

interface ChatBubbleProps {
  message: ChatMessage;
  isPlayingAudio?: boolean;
  isLoadingAudio?: boolean;
  onPlayAudio?: () => void;
}

// Simple markdown-like text parser for neat biology explanations
const renderFormattedText = (text: string) => {
  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    // Empty line creates spacing
    if (!line.trim()) {
      return <div key={lineIdx} className="h-2" />;
    }

    // Header 3 or 2
    if (line.startsWith('### ')) {
      return (
        <h4 key={lineIdx} className="font-bold text-emerald-800 dark:text-emerald-300 mt-2 mb-1 text-base">
          {line.replace(/^###\s+/, '')}
        </h4>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h3 key={lineIdx} className="font-bold text-emerald-900 dark:text-emerald-200 mt-3 mb-1 text-lg">
          {line.replace(/^##\s+/, '')}
        </h3>
      );
    }

    // Bullet point
    const isBullet = line.startsWith('- ') || line.startsWith('* ');
    const displayLine = isBullet ? line.substring(2) : line;

    // Parse inline bold: **text** and inline code: `text`
    const parts: React.ReactNode[] = [];
    let remaining = displayLine;
    let partKey = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/^([\s\S]*?)\*\*(.+?)\*\*([\s\S]*)$/);
      const codeMatch = remaining.match(/^([\s\S]*?)`(.+?)`([\s\S]*)$/);

      let firstMatch: { type: 'bold' | 'code'; pre: string; match: string; post: string } | null = null;

      if (boldMatch && (!codeMatch || boldMatch[1].length <= codeMatch[1].length)) {
        firstMatch = { type: 'bold', pre: boldMatch[1], match: boldMatch[2], post: boldMatch[3] };
      } else if (codeMatch) {
        firstMatch = { type: 'code', pre: codeMatch[1], match: codeMatch[2], post: codeMatch[3] };
      }

      if (firstMatch) {
        if (firstMatch.pre) {
          parts.push(<span key={partKey++}>{firstMatch.pre}</span>);
        }
        if (firstMatch.type === 'bold') {
          parts.push(
            <strong key={partKey++} className="font-semibold text-emerald-950 dark:text-emerald-100">
              {firstMatch.match}
            </strong>
          );
        } else {
          parts.push(
            <code key={partKey++} className="bg-emerald-100/70 dark:bg-emerald-950 px-1.5 py-0.5 rounded text-xs font-mono text-emerald-900 dark:text-emerald-300">
              {firstMatch.match}
            </code>
          );
        }
        remaining = firstMatch.post;
      } else {
        parts.push(<span key={partKey++}>{remaining}</span>);
        break;
      }
    }

    if (isBullet) {
      return (
        <div key={lineIdx} className="flex items-start gap-2 my-0.5 ml-1">
          <span className="text-emerald-500 dark:text-emerald-400 mt-1 text-xs">•</span>
          <div className="flex-1">{parts}</div>
        </div>
      );
    }

    return (
      <p key={lineIdx} className="my-0.5 leading-relaxed">
        {parts}
      </p>
    );
  });
};

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isPlayingAudio = false,
  isLoadingAudio = false,
  onPlayAudio,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!message.text) return;
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bubbleClasses = isUser
    ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-none shadow-sm'
    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700/80 shadow-sm';

  const containerClasses = isUser ? 'flex-row-reverse' : 'flex-row';

  return (
    <div className={`flex items-start gap-2.5 max-w-3xl w-full ${containerClasses} ${isUser ? 'self-end' : 'self-start'}`}>
      {/* Avatar Icon */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
          isUser
            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
            : 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-sm'
        }`}
        title={isUser ? 'Học sinh' : 'Cô Bùi Thị Tường Vy'}
      >
        {isUser ? <UserIcon className="w-5 h-5" /> : <BotIcon className="w-5 h-5" />}
      </div>

      <div className="flex flex-col gap-1 max-w-[85%] md:max-w-[80%]">
        {/* Role Name */}
        <div className={`text-xs px-1 ${isUser ? 'text-right text-gray-500 dark:text-gray-400' : 'text-emerald-800 dark:text-emerald-400 font-medium'}`}>
          {isUser ? 'Em' : 'Cô Bùi Thị Tường Vy'}
        </div>

        {/* Message Bubble */}
        <div className={`px-4 py-3 ${bubbleClasses}`}>
          <div className="text-sm md:text-[15px] space-y-1">
            {renderFormattedText(message.text)}
          </div>

          {/* Model Actions: Listen & Copy */}
          {!isUser && message.text && (
            <div className="flex items-center justify-between gap-3 mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-700/70 text-xs">
              <div className="flex items-center gap-1">
                {onPlayAudio && (
                  <button
                    onClick={onPlayAudio}
                    disabled={isLoadingAudio}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                      isPlayingAudio
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 font-medium'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    title={isPlayingAudio ? 'Đang phát lời giảng' : 'Nghe cô đọc'}
                  >
                    <SpeakerWaveIcon
                      className={`w-3.5 h-3.5 ${
                        isPlayingAudio ? 'text-emerald-600 dark:text-emerald-400 animate-pulse' : ''
                      }`}
                    />
                    <span>
                      {isLoadingAudio
                        ? 'Đang chuẩn bị giọng đọc...'
                        : isPlayingAudio
                        ? 'Đang đọc...'
                        : 'Nghe cô đọc'}
                    </span>
                  </button>
                )}
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Sao chép nội dung"
              >
                {copied ? (
                  <>
                    <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">Đã chép</span>
                  </>
                ) : (
                  <>
                    <CopyIcon className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
