import React, { useState, useMemo } from 'react';
import { BiologyTerm } from '../types/biology';
import PronunciationButton from './PronunciationButton';

interface FlashcardProps {
  terms: BiologyTerm[];
  favorites: string[];
  onToggleFavorite: (term: BiologyTerm) => void;
}

const Flashcard: React.FC<FlashcardProps> = ({
  terms,
  favorites,
  onToggleFavorite,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Extract distinct topics
  const topics = useMemo(() => {
    const set = new Set<string>();
    terms.forEach((t) => {
      if (t.topic) set.add(t.topic);
    });
    return Array.from(set);
  }, [terms]);

  // Filtered terms
  const filteredTerms = useMemo(() => {
    return terms.filter((t) => {
      const matchGrade = selectedGrade === 'all' || t.grade === selectedGrade;
      const matchTopic = selectedTopic === 'all' || t.topic === selectedTopic;
      return matchGrade && matchTopic;
    });
  }, [terms, selectedGrade, selectedTopic]);

  // Ensure current index is valid
  const currentTerm = filteredTerms[currentIndex] || filteredTerms[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredTerms.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredTerms.length) % filteredTerms.length);
  };

  const handleRandom = () => {
    if (filteredTerms.length <= 1) return;
    setIsFlipped(false);
    let randomIdx = Math.floor(Math.random() * filteredTerms.length);
    if (randomIdx === currentIndex) {
      randomIdx = (randomIdx + 1) % filteredTerms.length;
    }
    setCurrentIndex(randomIdx);
  };

  if (filteredTerms.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <p className="text-lg font-bold mb-2">Không tìm thấy thuật ngữ phù hợp bộ lọc.</p>
        <button
          onClick={() => {
            setSelectedGrade('all');
            setSelectedTopic('all');
          }}
          className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold"
        >
          Đặt lại bộ lọc
        </button>
      </div>
    );
  }

  const isFavorite = currentTerm ? favorites.includes(currentTerm.id) : false;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Filter Header */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <span>🃏</span>
            <span>Chế độ Flashcard Ôn tập</span>
          </h3>
          <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-full">
            {currentIndex + 1} / {filteredTerms.length} thẻ
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* Grade Filter */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
              Khối lớp:
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            >
              <option value="all">Tất cả các lớp (10, 11, 12)</option>
              <option value="10">Sinh học 10 (Tế bào & Vi sinh)</option>
              <option value="11">Sinh học 11 (Sinh lý thực vật & Động vật)</option>
              <option value="12">Sinh học 12 (Di truyền, Tiến hóa & Sinh thái)</option>
            </select>
          </div>

          {/* Topic Filter */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
              Chủ đề chuyên đề:
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            >
              <option value="all">Tất cả chủ đề ({topics.length})</option>
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* The Flashcard with 3D Flip style */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="cursor-pointer min-h-[320px] rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all duration-300 shadow-md relative border border-slate-700/60 text-white select-none group"
        style={{
          background: isFlipped
            ? 'linear-gradient(135deg, #042f2e 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #0f172a 0%, #115e59 100%)',
        }}
      >
        {/* Top bar inside card */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-teal-200 border border-white/10">
              Lớp {currentTerm.grade}
            </span>
            <span className="text-xs text-slate-300 font-medium">
              {currentTerm.topic}
            </span>
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <PronunciationButton term={currentTerm.englishTerm} size="sm" showText={false} />
            <button
              onClick={() => onToggleFavorite(currentTerm)}
              className="p-1.5 rounded-lg bg-white/10 text-amber-300 hover:bg-white/20 transition-all text-sm"
              title="Lưu yêu thích"
            >
              {isFavorite ? '⭐' : '☆'}
            </button>
          </div>
        </div>

        {/* Card Content */}
        {!isFlipped ? (
          /* FRONT SIDE */
          <div className="text-center my-auto py-8">
            <span className="text-xs font-semibold tracking-wider uppercase text-teal-300 mb-2 block">
              Mặt trước • Thuật ngữ Tiếng Anh
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-3">
              {currentTerm.englishTerm}
            </h2>
            {currentTerm.pronunciation && (
              <p className="text-lg md:text-xl font-mono text-teal-200">
                {currentTerm.pronunciation}
              </p>
            )}
            <div className="mt-6 inline-flex items-center gap-1.5 text-xs text-slate-300 bg-white/10 px-3 py-1.5 rounded-full">
              <span>👆 Nhấn để lật xem định nghĩa tiếng Việt</span>
            </div>
          </div>
        ) : (
          /* BACK SIDE */
          <div className="my-auto py-4 space-y-3">
            <span className="text-xs font-semibold tracking-wider uppercase text-teal-300 block text-center">
              Mặt sau • Nghĩa & Định nghĩa
            </span>
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-extrabold text-teal-300">
                {currentTerm.vietnameseTerm}
              </h3>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                {currentTerm.englishTerm} {currentTerm.pronunciation}
              </p>
            </div>

            <div className="bg-black/30 p-3.5 rounded-xl border border-white/10 text-xs md:text-sm text-slate-200 leading-relaxed">
              <span className="font-bold text-teal-300 block mb-1">📖 Định nghĩa chuẩn SGK:</span>
              {currentTerm.definition}
            </div>

            {currentTerm.memoryTip && (
              <div className="bg-amber-400/10 p-3 rounded-xl border border-amber-400/20 text-xs text-amber-200">
                <span className="font-bold block mb-0.5">⚡ Mẹo ghi nhớ:</span>
                {currentTerm.memoryTip}
              </div>
            )}
          </div>
        )}

        {/* Bottom hint */}
        <div className="text-center text-xs text-slate-400">
          <span>{isFlipped ? 'Nhấn lại để xem mặt trước' : 'Được biên soạn theo SGK GDPT 2018'}</span>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handlePrev}
          className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-2xs flex items-center justify-center gap-2"
        >
          <span>←</span>
          <span>Thẻ trước</span>
        </button>

        <button
          onClick={handleRandom}
          className="py-3 px-4 rounded-xl font-bold text-sm bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-all shadow-2xs flex items-center justify-center gap-1.5"
          title="Thẻ ngẫu nhiên"
        >
          <span>🎲</span>
          <span className="hidden sm:inline">Ngẫu nhiên</span>
        </button>

        <button
          onClick={handleNext}
          className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <span>Thẻ kế tiếp</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default Flashcard;
