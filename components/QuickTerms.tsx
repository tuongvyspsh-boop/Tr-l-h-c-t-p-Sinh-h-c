import React from 'react';

interface QuickTermsProps {
  onSelectTerm: (term: string) => void;
  disabled?: boolean;
}

const QUICK_TERMS_LIST = [
  { label: 'Gene', query: 'Gene là gì?' },
  { label: 'DNA', query: 'DNA là gì?' },
  { label: 'RNA', query: 'RNA là gì?' },
  { label: 'Chromosome', query: 'Chromosome nghĩa là gì?' },
  { label: 'Protein', query: 'Protein là gì?' },
  { label: 'Mitosis', query: 'Mitosis là gì?' },
  { label: 'Meiosis', query: 'Meiosis là gì?' },
  { label: 'Transcription', query: 'Transcription là gì?' },
  { label: 'Translation', query: 'Translation là gì?' },
  { label: 'Enzyme', query: 'Enzyme là gì?' },
  { label: 'Osmosis', query: 'Osmosis là gì?' },
  { label: 'Operon Lac', query: 'Operon Lac là gì?' },
];

const QuickTerms: React.FC<QuickTermsProps> = ({ onSelectTerm, disabled = false }) => {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <span>⚡ Tra cứu nhanh thuật ngữ phổ biến:</span>
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
        {QUICK_TERMS_LIST.map((item) => (
          <button
            key={item.label}
            type="button"
            disabled={disabled}
            onClick={() => onSelectTerm(item.query)}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-300 dark:hover:border-teal-600 transition-all shadow-2xs whitespace-nowrap active:scale-95 disabled:opacity-50"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickTerms;
