import React, { useState, useEffect, useCallback } from 'react';
import { BiologyTerm, QuizQuestion } from '../types/biology';
import PronunciationButton from './PronunciationButton';

interface QuizProps {
  terms: BiologyTerm[];
}

const Quiz: React.FC<QuizProps> = ({ terms }) => {
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [streak, setStreak] = useState(0);

  // Generate a multiple choice question dynamically from the database
  const generateQuestion = useCallback((): QuizQuestion | null => {
    if (terms.length < 4) return null;

    // Pick a random target term
    const targetIdx = Math.floor(Math.random() * terms.length);
    const target = terms[targetIdx];

    // Pick 3 other distractor terms
    const distractors: BiologyTerm[] = [];
    const pool = terms.filter((_, i) => i !== targetIdx);

    while (distractors.length < 3 && pool.length > 0) {
      const rand = Math.floor(Math.random() * pool.length);
      distractors.push(pool.splice(rand, 1)[0]);
    }

    // Determine question type:
    // 0: "Thuật ngữ tiếng Anh 'X' có nghĩa hoặc định nghĩa là gì?"
    // 1: "Khái niệm '...' là định nghĩa của thuật ngữ nào?"
    const type = Math.random() > 0.5 ? 0 : 1;
    let questionText = '';
    let correctOptionText = '';
    const rawOptions: string[] = [];

    if (type === 0) {
      questionText = `Theo SGK Sinh học, "${target.englishTerm}" (${target.vietnameseTerm}) là gì?`;
      correctOptionText = target.definition;
      rawOptions.push(correctOptionText);
      distractors.forEach((d) => rawOptions.push(d.definition));
    } else {
      questionText = `"${target.definition}" là định nghĩa chính xác của thuật ngữ nào?`;
      correctOptionText = `${target.englishTerm} (${target.vietnameseTerm})`;
      rawOptions.push(correctOptionText);
      distractors.forEach((d) => rawOptions.push(`${d.englishTerm} (${d.vietnameseTerm})`));
    }

    // Shuffle options
    const shuffledOptions = [...rawOptions].sort(() => Math.random() - 0.5);
    const correctIdx = shuffledOptions.indexOf(correctOptionText);

    return {
      id: `q-${Date.now()}`,
      termId: target.id,
      question: questionText,
      options: shuffledOptions,
      correctAnswerIndex: correctIdx,
      explanation: `${target.englishTerm} (${target.vietnameseTerm}): ${target.simpleExplanation} ${target.memoryTip ? `(Mẹo: ${target.memoryTip})` : ''}`,
      englishTerm: target.englishTerm,
      vietnameseTerm: target.vietnameseTerm,
    };
  }, [terms]);

  const loadNextQuestion = useCallback(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    const q = generateQuestion();
    setCurrentQuestion(q);
  }, [generateQuestion]);

  useEffect(() => {
    loadNextQuestion();
  }, [loadNextQuestion]);

  const handleSelectOption = (index: number) => {
    if (isAnswered || !currentQuestion) return;

    setSelectedOption(index);
    setIsAnswered(true);
    setTotalAnswered((prev) => prev + 1);

    if (index === currentQuestion.correctAnswerIndex) {
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleResetScore = () => {
    setScore(0);
    setTotalAnswered(0);
    setStreak(0);
    loadNextQuestion();
  };

  if (!currentQuestion) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <p className="text-slate-500">Đang chuẩn bị câu hỏi trắc nghiệm...</p>
      </div>
    );
  }

  const isCorrect = selectedOption === currentQuestion.correctAnswerIndex;
  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Quiz Header Score Board */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <span>📝</span>
            <span>Kiểm tra nhanh Thuật ngữ Sinh học</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dữ liệu câu hỏi tự động cập nhật từ ngân hàng 30+ thuật ngữ SGK
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-400 font-medium block">Điểm số:</span>
            <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
              {score} / {totalAnswered}
            </span>
          </div>

          {streak >= 2 && (
            <div className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-full text-xs font-bold text-amber-600 dark:text-amber-300 animate-pulse">
              🔥 Chuỗi {streak}
            </div>
          )}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 md:p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-md">
            Câu hỏi #{totalAnswered + 1}
          </span>
          <PronunciationButton term={currentQuestion.englishTerm} size="sm" />
        </div>

        <h4 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-snug">
          {currentQuestion.question}
        </h4>

        {/* 4 Options */}
        <div className="space-y-2.5 pt-1">
          {currentQuestion.options.map((option, idx) => {
            const isThisSelected = selectedOption === idx;
            const isThisCorrect = idx === currentQuestion.correctAnswerIndex;

            let buttonStyles =
              'border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 text-slate-800 dark:text-slate-200';

            if (isAnswered) {
              if (isThisCorrect) {
                buttonStyles =
                  'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-medium ring-2 ring-emerald-500/30';
              } else if (isThisSelected && !isThisCorrect) {
                buttonStyles =
                  'border-red-400 bg-red-50 dark:bg-red-950/60 text-red-900 dark:text-red-200 ring-2 ring-red-400/30';
              } else {
                buttonStyles = 'border-slate-200 dark:border-slate-700 opacity-60 text-slate-500';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs md:text-sm flex items-start gap-3 shadow-2xs ${buttonStyles}`}
              >
                <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-xs shrink-0 text-slate-700 dark:text-slate-300 mt-0.5">
                  {optionLetters[idx]}
                </span>
                <span className="flex-1 leading-relaxed">{option}</span>
                {isAnswered && isThisCorrect && (
                  <span className="text-emerald-600 font-bold shrink-0 text-base">✓</span>
                )}
                {isAnswered && isThisSelected && !isThisCorrect && (
                  <span className="text-red-500 font-bold shrink-0 text-base">✕</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback Section */}
        {isAnswered && (
          <div
            className={`p-4 rounded-xl border space-y-2 mt-4 animate-fadeIn ${
              isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-950 dark:text-red-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              <span className="text-lg">{isCorrect ? '✓ Chính xác!' : '✕ Chưa chính xác!'}</span>
            </div>

            <p className="text-xs md:text-sm leading-relaxed">
              <span className="font-semibold">Giải thích chi tiết: </span>
              {currentQuestion.explanation}
            </p>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={loadNextQuestion}
                className="px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>Câu tiếp theo</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {totalAnswered > 0 && (
        <div className="text-center pt-2">
          <button
            onClick={handleResetScore}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
          >
            Làm lại từ đầu (Đặt lại điểm số)
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
