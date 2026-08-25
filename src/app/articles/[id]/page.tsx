import { MessageCircleQuestion, Lightbulb, BookText, Bookmark, Flag, ChevronLeft, ChevronRight, PenLine } from 'lucide-react';
import { AudioPlayer } from '@/components/AudioPlayer';
import { ChatGPTButton } from '@/components/ChatGPTButton';

export default async function ArticleDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const explanationText = "這一條先不要急著背。你先記一件事情：不動產（像是房子或土地）因為非常值錢，所以國家規定，如果你們私底下簽約說要賣房子，這只代表你們有「債」的關係（你要付錢、他要交屋）。但是，這棟房子真正「換主人」的那一刻，是發生在你們去地政機關辦理「登記」完成的時候。沒有登記，在法律上這個房子就還不是你的！這就叫做「設權登記」。";

  return (
    <div className="max-w-3xl mx-auto pb-24 md:pb-12">
      {/* 頂部導航 */}
      <header className="sticky top-0 bg-slate-950/80 backdrop-blur-md z-10 border-b border-slate-800 p-4 flex justify-between items-center">
        <button className="p-2 hover:bg-slate-800 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <p className="text-xs text-slate-400">民法 ｜ 物權</p>
          <h1 className="text-lg font-bold">第 758 條</h1>
        </div>
        <button className="p-2 hover:bg-slate-800 rounded-full transition-colors">
          <ChevronRight size={24} />
        </button>
      </header>

      <main className="p-6 space-y-8">
        
        {/* 一句話 */}
        <section className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6 text-center shadow-inner">
          <Lightbulb className="mx-auto text-blue-400 mb-3" size={32} />
          <h2 className="text-xl font-bold text-blue-100 leading-relaxed">
            買了不動產，原則上還要完成登記，才發生物權變動。
          </h2>
        </section>

        {/* 原文 */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
              <BookText size={16} /> 法條原文
            </h3>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">看舊版</button>
          </div>
          <p className="text-slate-200 leading-loose text-lg font-serif">
            不動產物權，依法律行為而取得、設定、喪失及變更者，非經登記，不生效力。<br/><br/>
            前項行為，應以書面為之。
          </p>
        </section>

        {/* 白話講解 */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="bg-slate-800/50 p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-semibold text-slate-200 flex items-center gap-2">
              老師白話講解
            </h3>
            <AudioPlayer text={explanationText} isAiAvailable={false} />
          </div>
          <div className="p-6">
            <p className="text-slate-300 leading-relaxed">
              {explanationText}
            </p>
          </div>
        </section>

        {/* 案例 */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-4">生活案例</h3>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <p className="text-slate-300 leading-relaxed">
              小明把房子賣給小華，兩個人已經簽完買賣契約，小華也付了錢，但還沒有去地政事務所辦理所有權移轉登記。這時候如果小明又把房子賣給不知情的小美，並且先跟小美去辦了登記。<br/><br/>
              結果會怎樣？因為小美先完成了「登記」，所以小美才是房子真正的主人（物權變動生效）。小華只能拿著契約去告小明違約，要求賠償。
            </p>
          </div>
        </section>

        {/* 個人標記與行動 */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="flex flex-col items-center justify-center p-4 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors">
            <Bookmark size={24} className="text-slate-400 mb-2" />
            <span className="text-sm text-slate-300">收藏</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors">
            <Flag size={24} className="text-rose-400 mb-2" />
            <span className="text-sm text-slate-300">很重要</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors">
            <MessageCircleQuestion size={24} className="text-orange-400 mb-2" />
            <span className="text-sm text-slate-300">我不懂</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors">
            <PenLine size={24} className="text-emerald-400 mb-2" />
            <span className="text-sm text-slate-300">記筆記</span>
          </button>
        </section>

        {/* 我還是不懂 */}
        <section className="border-t border-slate-800 pt-8 mt-8">
          <h3 className="text-center text-sm font-semibold text-slate-500 mb-4">我還是不懂...</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {['再講白一點', '換一個例子', '為什麼？', '考試怎麼考？', '跟哪條容易搞混？'].map((q) => (
              <button key={q} className="px-4 py-2 bg-slate-900 border border-slate-700 hover:border-blue-500 hover:text-blue-400 rounded-full text-sm transition-colors text-slate-300">
                {q}
              </button>
            ))}
            <ChatGPTButton article="民法第 758 條" text={explanationText} />
          </div>
        </section>
      </main>

      {/* 底部固定行動按鈕 */}
      <div className="fixed bottom-0 md:bottom-auto md:sticky left-0 right-0 p-4 bg-slate-950/90 border-t border-slate-800 z-20 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-4 mb-14 md:mb-0">
        <button className="w-full max-w-md mx-auto block bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-blue-900/50 transition-transform active:scale-[0.98]">
          大致懂了，下一條
        </button>
      </div>
    </div>
  );
}

