import { PencilRuler, Search, FileQuestion, BookOpen } from 'lucide-react';

export default function ExamsIndex() {
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
          <FileQuestion size={36} className="text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">題庫功能正在建置中</h2>
        <p className="text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
          我們建議您先完成「法規學習」的第一輪地圖建立。
          當您完成 30% 以上的進度後，題庫中心將為您自動產出個人化的弱點加強考卷。
        </p>
        <button className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-8 py-3 rounded-xl transition-colors flex items-center gap-2 mx-auto">
          <BookOpen size={20} /> 返回法規總覽
        </button>
      </div>
    </div>
  );
}
