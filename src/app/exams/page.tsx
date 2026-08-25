'use client';
import { useState } from 'react';
import { PencilRuler, Search, FileQuestion, BookOpen, Check, X, RotateCcw } from 'lucide-react';
import { examQuestions } from '@/data/examData';

export default function ExamsIndex() {
  const [started, setStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);

  const question = examQuestions[currentIdx];

  const handleSelect = (idx: number) => {
    if (showAnswer) return;
    setSelected(idx);
    setShowAnswer(true);
    if (idx === question.answer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < examQuestions.length - 1) {
      setCurrentIdx(i => i + 1);
      setSelected(null);
      setShowAnswer(false);
    } else {
      // Done
      setCurrentIdx(examQuestions.length);
    }
  };

  const handleRestart = () => {
    setStarted(false);
    setCurrentIdx(0);
    setSelected(null);
    setShowAnswer(false);
    setScore(0);
  };

  if (!started) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 relative z-10">
        <header className="border-b border-slate-800 pb-6 flex items-center gap-4">
          <PencilRuler size={32} className="text-pink-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">題庫中心</h1>
            <p className="text-slate-400">歷屆試題與法條克漏字測驗。</p>
          </div>
        </header>

        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-8 text-center mt-12">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileQuestion size={36} className="text-pink-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">隨機模擬測驗</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
            系統將從歷屆試題與重點法條中，為您隨機抽出 {examQuestions.length} 題進行測驗，幫助您檢視學習成效。
          </p>
          <button 
            onClick={() => setStarted(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-3 rounded-xl transition-colors flex items-center gap-2 mx-auto"
          >
            <BookOpen size={20} /> 開始測驗
          </button>
        </div>
      </div>
    );
  }

  if (currentIdx >= examQuestions.length) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 relative z-10 text-center">
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-10 mt-12">
          <h1 className="text-4xl font-bold text-white mb-4">測驗完成！</h1>
          <p className="text-xl text-slate-400 mb-8">
            您的得分：<span className="text-emerald-400 font-bold text-3xl mx-2">{score}</span> / {examQuestions.length}
          </p>
          <button 
            onClick={handleRestart}
            className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-8 py-3 rounded-xl transition-colors flex items-center gap-2 mx-auto"
          >
            <RotateCcw size={20} /> 再測驗一次
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8 relative z-10">
      <div className="flex justify-between items-center text-sm font-medium text-slate-400">
        <span>題庫測驗</span>
        <span>第 {currentIdx + 1} / {examQuestions.length} 題</span>
      </div>

      <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 md:p-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded">{question.year}</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed mb-8">
          {question.question}
        </h2>

        <div className="space-y-3">
          {question.options.map((opt, idx) => {
            const isSelected = selected === idx;
            const isCorrect = idx === question.answer;
            
            let btnClass = "w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ";
            
            if (!showAnswer) {
              btnClass += "bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-300";
            } else {
              if (isCorrect) {
                btnClass += "bg-emerald-900/30 border-emerald-500/50 text-emerald-400";
              } else if (isSelected && !isCorrect) {
                btnClass += "bg-rose-900/30 border-rose-500/50 text-rose-400";
              } else {
                btnClass += "bg-slate-800/20 border-slate-800/50 text-slate-500 opacity-50";
              }
            }

            return (
              <button 
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={showAnswer}
                className={btnClass}
              >
                <span>{String.fromCharCode(65 + idx)}. {opt}</span>
                {showAnswer && isCorrect && <Check size={20} className="text-emerald-500" />}
                {showAnswer && isSelected && !isCorrect && <X size={20} className="text-rose-500" />}
              </button>
            );
          })}
        </div>

        {showAnswer && (
          <div className="mt-8 pt-6 border-t border-slate-800">
            <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
              <BookOpen size={18} /> 解析
            </h3>
            <p className="text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              {question.explanation}
            </p>
            <button 
              onClick={handleNext}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-colors"
            >
              下一題
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
