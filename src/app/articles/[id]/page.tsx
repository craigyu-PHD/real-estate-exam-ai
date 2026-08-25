'use client';
import { useState, use } from 'react';
import { MessageCircleQuestion, Lightbulb, BookText, Bookmark, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { AudioPlayer } from '@/components/AudioPlayer';
import { ChatGPTButton } from '@/components/ChatGPTButton';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useProgress } from '@/hooks/useProgress';

export default function ArticleDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { markAsRead } = useProgress();
  const { hasBookmark, toggleBookmark } = useBookmarks();
  const [isMarked, setIsMarked] = useState(false);

  // Parsing civil-758 or just 758
  const rawId = resolvedParams.id;
  const lawId = rawId.includes('-') ? rawId.split('-')[0] : 'civil';
  const articleId = rawId.includes('-') ? rawId.split('-')[1] : rawId;

  const explanationText = "這一條先不要急著背。你先記一件事情：不動產（像是房子或土地）因為非常值錢，所以國家規定，如果你們私底下簽約說要賣房子，這只代表你們有「債」的關係（你要付錢、他要交屋）。但是，這棟房子真正「換主人」的那一刻，是發生在你們去地政機關辦理「登記」完成的時候。沒有登記，在法律上這個房子就還不是你的！這就叫做「設權登記」。";
  const articleText = "不動產物權，依法律行為而取得、設定、喪失及變更者，非經登記，不生效力。\n前項行為，應以書面為之。";

  const handleMarkAsRead = () => {
    markAsRead(lawId, articleId);
    setIsMarked(true);
  };

  const isImportant = hasBookmark(lawId, articleId, 'important');

  return (
    <div className="max-w-3xl mx-auto pb-24 relative z-10">
      <header className="sticky top-0 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded">民法 / 物權</span>
          <h1 className="font-bold text-white text-lg">第 {articleId} 條</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => toggleBookmark(lawId, articleId, 'important')}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isImportant ? 'bg-yellow-500/20 text-yellow-400' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <Bookmark size={20} className={isImportant ? "fill-current" : ""} />
          </button>
          <AudioPlayer text={`${articleText}。解釋：${explanationText}`} />
        </div>
      </header>

      <main className="p-6 md:p-10 space-y-8">
        
        {/* 一句話解釋 */}
        <section className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-blue-400 mb-3 font-semibold">
            <Lightbulb size={20} />
            <span>AI 白話一句話</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-white leading-relaxed font-sans">
            房子就算付了錢、交了屋，沒有去地政事務所辦「登記」，在法律上就還不是你的。
          </p>
        </section>

        {/* 法條原文 */}
        <section>
          <div className="flex items-center gap-2 text-slate-400 mb-3 font-semibold">
            <BookText size={20} />
            <span>法條原文</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-lg text-slate-300 leading-loose tracking-wide font-serif">
            {articleText}
          </div>
        </section>

        {/* 老師講解 */}
        <section>
          <div className="flex items-center gap-2 text-emerald-400 mb-3 font-semibold">
            <MessageCircleQuestion size={20} />
            <span>老師講解</span>
          </div>
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-2xl p-6 text-slate-200 leading-loose font-sans text-lg">
            {explanationText}
          </div>
        </section>

        {/* 學習確認區塊 (極簡化) */}
        <section className="pt-6 border-t border-slate-800">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <button 
              onClick={handleMarkAsRead}
              disabled={isMarked}
              className={`w-full md:w-auto px-8 py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 transition-all ${isMarked ? 'bg-emerald-600 text-white cursor-default' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
            >
              {isMarked ? <CheckCircle2 size={24} /> : null}
              {isMarked ? '已完成學習' : '大致懂了，標為已讀'}
            </button>
            <ChatGPTButton 
              article={`第 ${resolvedParams.id} 條`} 
              text={articleText} 
            />
          </div>
        </section>
      </main>

      {/* 底部導覽列 */}
      <footer className="fixed bottom-0 left-0 md:left-64 right-0 bg-slate-900 border-t border-slate-800 p-4 flex justify-between z-20">
        <button className="flex items-center gap-2 text-slate-400 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
          <ChevronLeft size={20} /> 上一條
        </button>
        <button className="flex items-center gap-2 text-slate-400 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
          下一條 <ChevronRight size={20} />
        </button>
      </footer>
    </div>
  );
}
