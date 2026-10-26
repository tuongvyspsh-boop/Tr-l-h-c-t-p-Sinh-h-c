import React from 'react';
import { BiologyTerm } from '../types/biology';
import TermResult from './TermResult';

interface FavoritesProps {
  terms: BiologyTerm[];
  favoriteIds: string[];
  onToggleFavorite: (term: BiologyTerm) => void;
  onClearFavorites: () => void;
}

const Favorites: React.FC<FavoritesProps> = ({
  terms,
  favoriteIds,
  onToggleFavorite,
  onClearFavorites,
}) => {
  const favoriteTerms = terms.filter((t) => favoriteIds.includes(t.id));

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <span>⭐</span>
            <span>Thuật ngữ yêu thích đã lưu</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tổng cộng: {favoriteTerms.length} thuật ngữ được đánh dấu
          </p>
        </div>

        {favoriteTerms.length > 0 && (
          <button
            onClick={onClearFavorites}
            className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {favoriteTerms.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2">
          <div className="text-4xl">⭐</div>
          <h4 className="font-bold text-slate-700 dark:text-slate-200 text-base">
            Chưa có thuật ngữ nào được lưu
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Khi tra cứu hoặc ôn tập flashcard, bạn hãy nhấn biểu tượng ⭐ để lưu các thuật ngữ quan trọng vào đây nhé!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {favoriteTerms.map((term) => (
            <TermResult
              key={term.id}
              term={term}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
