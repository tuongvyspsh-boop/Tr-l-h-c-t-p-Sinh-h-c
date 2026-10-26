import React from 'react';
import { BiologyTerm } from '../types/biology';
import PronunciationButton from './PronunciationButton';

interface TermResultProps {
  term: BiologyTerm;
  isFavorite?: boolean;
  onToggleFavorite?: (term: BiologyTerm) => void;
}

const TermResult: React.FC<TermResultProps> = ({
  term,
  isFavorite = false,
  onToggleFavorite,
}) => {
  return (
    <div className="space-y-3 w-full my-2">
      {/* CARD 1: TERM */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-5 shadow-md border border-slate-700/60 relative overflow-hidden">
        {/* Subtle decorative DNA background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Lớp {term.grade}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50">
                {term.topic}
              </span>
              <span className="text-xs text-slate-400 font-mono">#{term.id}</span>
            </div>

            {/* English Term */}
            <div className="flex items-baseline gap-3 flex-wrap mt-1">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                {term.englishTerm}
              </h2>
              {term.pronunciation && (
                <span className="text-sm md:text-base font-mono text-teal-300 bg-slate-800/80 px-2 py-0.5 rounded">
                  {term.pronunciation}
                </span>
              )}
            </div>

            {/* Vietnamese Term */}
            <p className="text-lg md:text-xl font-bold text-teal-400 mt-1">
              {term.vietnameseTerm}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Pronunciation Audio Button */}
            <PronunciationButton term={term.englishTerm} size="md" />

            {/* Favorite Star Button */}
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(term)}
                className={`p-2 rounded-xl transition-all active:scale-90 border ${
                  isFavorite
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-xs'
                    : 'bg-slate-800/80 text-slate-400 hover:text-amber-300 hover:bg-slate-700 border-slate-700'
                }`}
                title={isFavorite ? 'Bỏ lưu thuật ngữ' : 'Lưu vào mục yêu thích (⭐)'}
              >
                <span className="text-lg">{isFavorite ? '⭐' : '☆'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CARD 2: ĐỊNH NGHĨA CHUẨN SGK */}
      <div className="bg-white dark:bg-slate-800/90 rounded-xl p-4 border-l-4 border-l-teal-500 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-1.5">
          <span>📖</span>
          <span>Định nghĩa chuẩn SGK GDPT 2018</span>
        </div>
        <p className="text-slate-800 dark:text-slate-100 text-sm md:text-base leading-relaxed font-medium">
          {term.definition}
        </p>
      </div>

      {/* CARD 3: GIẢI THÍCH DỄ HIỂU */}
      <div className="bg-white dark:bg-slate-800/90 rounded-xl p-4 border-l-4 border-l-sky-500 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 mb-1.5">
          <span>💡</span>
          <span>Giải thích dễ hiểu</span>
        </div>
        <p className="text-slate-700 dark:text-slate-200 text-sm md:text-base leading-relaxed">
          {term.simpleExplanation}
        </p>
      </div>

      {/* CARD 4: VÍ DỤ MINH HỌA */}
      <div className="bg-white dark:bg-slate-800/90 rounded-xl p-4 border-l-4 border-l-emerald-500 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5">
          <span>🔬</span>
          <span>Ví dụ thực tế</span>
        </div>
        <p className="text-slate-700 dark:text-slate-200 text-sm md:text-base leading-relaxed">
          {term.example}
        </p>
      </div>

      {/* CARD 5: GỢI Ý GHI NHỚ */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl p-4 border-l-4 border-l-amber-500 border border-amber-200/80 dark:border-amber-800/60 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-1.5">
          <span>⚡</span>
          <span>Gợi ý ghi nhớ nhanh</span>
        </div>
        <p className="text-amber-900 dark:text-amber-200 text-sm md:text-base font-semibold leading-relaxed">
          {term.memoryTip}
        </p>
      </div>
    </div>
  );
};

export default TermResult;
