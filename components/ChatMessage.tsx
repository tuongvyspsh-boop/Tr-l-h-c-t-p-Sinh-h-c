import React from 'react';
import { ChatMessage as ChatMessageType, BiologyTerm } from '../types/biology';
import TermResult from './TermResult';

interface ChatMessageProps {
  message: ChatMessageType;
  favorites: string[];
  onToggleFavorite: (term: BiologyTerm) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  favorites,
  onToggleFavorite,
}) => {
  const isUser = message.sender === 'user';

  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-2.5 my-2">
        <div className="max-w-[85%] md:max-w-[75%] rounded-2xl rounded-tr-none px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-xs text-sm md:text-base">
          <p className="font-medium">{message.text}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-800 dark:text-teal-300 font-bold text-xs shrink-0 mt-0.5">
          👤
        </div>
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="flex items-start gap-3 my-3">
      {/* Bot Icon */}
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-teal-800 text-teal-300 flex items-center justify-center text-lg font-bold shadow-xs shrink-0 mt-1 border border-teal-700/50">
        🧬
      </div>

      <div className="flex-1 max-w-full space-y-3">
        {/* If standard term matched from teacher DB */}
        {message.matchedTerm && (
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              <span>DỮ LIỆU CHUẨN CỦA GIÁO VIÊN BIÊN SOẠN:</span>
            </div>

            <TermResult
              term={message.matchedTerm}
              isFavorite={favorites.includes(message.matchedTerm.id)}
              onToggleFavorite={onToggleFavorite}
            />
          </div>
        )}

        {/* If not found in standard database */}
        {message.unrecognizedQuery && !message.matchedTerm && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-sm">
            <div className="flex items-center gap-2 font-bold mb-1">
              <span>⚠️</span>
              <span>Thuật ngữ này chưa có trong cơ sở dữ liệu chuẩn của giáo viên.</span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300">
              Bạn có thể xem gợi ý tham khảo từ AI dưới đây hoặc liên hệ giáo viên để bổ sung vào bộ dữ liệu chuẩn.
            </p>
          </div>
        )}

        {/* AI Suggested Answer */}
        {message.aiSuggestedAnswer && (
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-2xs text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
            {message.unrecognizedQuery && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-2">
                <span>🤖</span>
                <span>Gợi ý tham khảo từ AI (chưa được giáo viên xác nhận)</span>
              </div>
            )}
            <div className="whitespace-pre-wrap">{message.aiSuggestedAnswer}</div>
          </div>
        )}

        {/* Raw Text Fallback if any */}
        {!message.matchedTerm && !message.aiSuggestedAnswer && message.text && (
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm">
            <p className="whitespace-pre-wrap">{message.text}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
