import React from 'react';
import { TermCorrection } from '../types/biology';
import PronunciationButton from './PronunciationButton';

interface TermCorrectionAlertProps {
  correction: TermCorrection;
}

const TermCorrectionAlert: React.FC<TermCorrectionAlertProps> = ({ correction }) => {
  return (
    <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/40 border-2 border-amber-400/80 dark:border-amber-600/80 rounded-2xl p-4 shadow-sm space-y-3 animate-fadeIn">
      <div className="flex items-center justify-between gap-2 border-b border-amber-200/80 dark:border-amber-800/60 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">✍️</span>
          <h4 className="font-bold text-amber-950 dark:text-amber-200 text-sm md:text-base">
            Đính chính cách viết & phát âm chuẩn SGK GDPT 2018
          </h4>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
          Chuẩn thuật ngữ
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs md:text-sm">
        {/* From Mistake to Standard */}
        <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-amber-200 dark:border-amber-800/40 space-y-1.5">
          <p className="text-slate-500 dark:text-slate-400 text-xs">Từ bạn vừa nhập:</p>
          <div className="flex items-center gap-2">
            <span className="line-through text-red-600 dark:text-red-400 font-bold bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded">
              {correction.originalWord}
            </span>
            <span className="text-slate-400 font-bold">➔</span>
            <span className="text-emerald-700 dark:text-emerald-300 font-black bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded text-sm md:text-base">
              {correction.standardEnglish}
            </span>
          </div>
        </div>

        {/* Pronunciation & Audio */}
        <div className="bg-white/80 dark:bg-slate-800/80 p-3 rounded-xl border border-amber-200 dark:border-amber-800/40 flex flex-col justify-between gap-2">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Phát âm chuẩn tiếng Anh:</p>
            <p className="font-mono font-bold text-teal-700 dark:text-teal-300 text-sm mt-0.5">
              {correction.standardPronunciation}
            </p>
          </div>
          <div className="pt-1">
            <PronunciationButton term={correction.standardEnglish} size="sm" />
          </div>
        </div>
      </div>

      {/* Note / Pedagogical Rationale */}
      <div className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed bg-amber-100/50 dark:bg-amber-900/30 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-800/30">
        <span className="font-semibold">💡 Lý giải: </span>
        {correction.note}
      </div>
    </div>
  );
};

export default TermCorrectionAlert;
