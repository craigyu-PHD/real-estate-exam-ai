import Link from 'next/link';
import { CheckCircle, HelpCircle, Star, AlertTriangle, BookOpen } from 'lucide-react';

const mockChapters = [
  {
    title: '第一編 總則',
    progress: 100,
    articles: [
      { id: '1', number: '第 1 條', status: 'read', excerpt: '法源...' },
      { id: '2', number: '第 2 條', status: 'read', excerpt: '習慣法...' },
    ]
  },
  {
    title: '第二編 債',
    progress: 40,
    articles: [
      { id: '153', number: '第 153 條', status: 'important', excerpt: '契約之成立...' },
      { id: '154', number: '第 154 條', status: 'confusing', excerpt: '要約之拘束力...' },
    ]
  },
  {
    title: '第三編 物權',
    progress: 10,
    articles: [
      { id: '757', number: '第 757 條', status: 'unread', excerpt: '物權法定主義...' },
      { id: '758', number: '第 758 條', status: 'memorize', excerpt: '設權登記...' },
    ]
  }
];

export default async function LawDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  // 實作時可由 resolvedParams.id 撈取 db 資料
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <header className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-white mb-2">民法</h1>
        <div className="flex gap-4 text-sm text-slate-400">
          <span>共 1,225 條</span>
          <span>已讀 500 條</span>
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['總則', '債', '物權', '親屬', '繼承'].map(tab => (
          <button key={tab} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full whitespace-nowrap transition-colors">
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-8 mt-6">
        {mockChapters.map((chapter) => (
          <section key={chapter.title} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">{chapter.title}</h2>
            <div className="space-y-3">
              {chapter.articles.map(art => (
                <Link key={art.id} href={`/articles/${art.id}`} className="flex items-center p-3 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors">
                  <div className="w-10">
                    {art.status === 'read' && <CheckCircle size={20} className="text-emerald-500" />}
                    {art.status === 'unread' && <div className="w-5 h-5 rounded-full border-2 border-slate-600" />}
                    {art.status === 'important' && <Star size={20} className="text-yellow-400" />}
                    {art.status === 'confusing' && <HelpCircle size={20} className="text-orange-400" />}
                    {art.status === 'memorize' && <AlertTriangle size={20} className="text-rose-500" />}
                  </div>
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-slate-200 mr-4">{art.number}</span>
                      <span className="text-sm text-slate-500">{art.excerpt}</span>
                    </div>
                    <BookOpen size={16} className="text-slate-600" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
