import React from 'react';
import { ActiveTab } from '../types/biology';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  favoritesCount: number;
}

const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  favoritesCount,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white shrink-0 shadow-md">
      {/* Top Banner with Logo and Branding */}
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between flex-wrap gap-3">
        {/* DNA + Chatbot Logo */}
        <div
          onClick={() => onTabChange('chat')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-500 via-emerald-500 to-cyan-500 p-0.5 shadow-md group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="text-xl">🧬</span>
            </div>
            {/* Chatbot indicator badge */}
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black px-1 rounded-full shadow-xs">
              AI
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-white group-hover:text-teal-400 transition-colors">
                TRỢ LÝ SINH HỌC SGK
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                GDPT 2018
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Học đúng thuật ngữ – Hiểu đúng kiến thức
            </p>
          </div>
        </div>

        {/* Quick info or badge */}
        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-300">
          <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700">
            📚 THPT Lớp 10 • 11 • 12
          </span>
          <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700">
            🔬 Dữ liệu chuẩn giáo viên
          </span>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1.5 scrollbar-thin">
          <button
            type="button"
            onClick={() => onTabChange('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>💬</span>
            <span>Tra cứu & Chat</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('flashcard')}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'flashcard'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>🃏</span>
            <span>Ôn tập Flashcard</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('quiz')}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>📝</span>
            <span>Kiểm tra nhanh</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('favorites')}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>⭐</span>
            <span>Đã lưu</span>
            {favoritesCount > 0 && (
              <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {favoritesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('history')}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>📜</span>
            <span>Lịch sử</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('teacher')}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'teacher'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
            }`}
          >
            <span>👩‍🏫</span>
            <span>Giáo viên</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;