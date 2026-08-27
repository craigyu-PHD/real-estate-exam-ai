'use client';
import Link from 'next/link';
import { Play, Sparkles, BookOpen, Flame, Target, ArrowRight, CalendarDays, GraduationCap, BarChart3, ShieldCheck, Users, Award, Trophy, Zap, Headphones, ChevronRight } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { useBookmarks } from '@/hooks/useBookmarks';
import { lawsData } from '@/data/lawsData';
import { StudyCalendar, ExamCountdown } from '@/components/StudyCalendar';
import { ActiveThemeArtwork } from '@/components/ThemeArtwork';
import { dateFromKey } from '@/hooks/useStudyDate';

export default function Home() {
  const { isLoaded, getTotalProgress, streak, todayKey, getTodayReadCount, getProgress, getGamificationStats } = useProgress();
  const { getBookmarksByType } = useBookmarks();
  const total = getTotalProgress();
  const today = getTodayReadCount();
  const game = getGamificationStats();
  const confusing = getBookmarksByType('confusing').length;
  const todayStr = dateFromKey(todayKey).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  if (!isLoaded) return <div className="p-10 text-center" style={{ color: 'var(--text-3)' }}>正在整理今日學習地圖…</div>;

  const inProgress = lawsData.filter(l => { const p = getProgress(l.id); return p.read > 0 && p.percentage < 100; });
  const nextLaw = inProgress.sort((a,b) => getProgress(b.id).percentage - getProgress(a.id).percentage)[0]
    || lawsData.find(l => getProgress(l.id).percentage < 100)
    || lawsData[0];
  const prog = getProgress(nextLaw.id);
  const questDone = game.today >= game.dailyGoal;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6 pb-28 md:pb-10">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 card px-3 py-1.5 rounded-full font-black text-emerald-700 dark:text-emerald-300"><ShieldCheck size={14}/> 官方法條優先</span>
        <span className="inline-flex items-center gap-1.5 card px-3 py-1.5 rounded-full font-bold" style={{ color: 'var(--text-2)' }}><Users size={14}/> 零基礎家教模式</span>
        <span className="ml-auto hidden sm:inline-flex items-center gap-2 card px-3 py-1.5 rounded-full" style={{ color: 'var(--text-2)' }}><CalendarDays size={14} className="text-indigo-600"/> {todayStr}</span>
      </div>

      <section className="hero-surface rounded-[2rem] shadow-xl overflow-hidden text-white relative">
        <ActiveThemeArtwork className="theme-hero-art" />
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute left-1/3 -bottom-24 w-72 h-72 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="relative grid lg:grid-cols-[1.1fr_.9fr]">
          <div className="p-7 md:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs font-black"><Trophy size={13} className="text-amber-300"/> LV.{game.level} · {game.title}</span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs font-bold"><Zap size={13} className="text-yellow-300"/> {game.xp} XP</span>
            </div>
            <h1 className="text-[28px] md:text-[36px] font-black mt-5 leading-tight">今天只要再推進一格，<br/><span className="text-amber-200">法律地圖就更完整。</span></h1>
            <p className="text-sm md:text-base mt-3 leading-relaxed text-white/75 max-w-xl">第一輪先建立全貌，不求一次背完。每天完成一小關，系統會把進度、弱點與複習節奏接起來。</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/laws/${nextLaw.id}`} className="inline-flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 font-black px-6 py-3 rounded-full text-sm shadow-sm transition active:scale-[0.98]">繼續闖關 <Play size={14} className="fill-current" /></Link>
              <Link href="/listen" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-black px-5 py-3 rounded-full text-sm transition"><Headphones size={15}/> 聽課模式</Link>
            </div>

            <div className="mt-7 max-w-xl">
              <div className="flex items-center justify-between text-xs mb-2"><span className="font-black">下一等級進度</span><span className="text-white/60">{game.levelProgress}%</span></div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-300 transition-all duration-700" style={{ width: `${game.levelProgress}%` }} /></div>
            </div>
          </div>

          <div className="p-7 md:p-10 border-t lg:border-t-0 lg:border-l border-white/10 bg-black/5 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4">
              <div><div className="text-xs font-black tracking-[0.18em] text-white/60">TODAY&apos;S QUEST</div><h2 className="text-xl font-black mt-1">今日任務：讀懂 {game.dailyGoal} 條</h2></div>
              <span className="text-3xl">{questDone ? '🏆' : '🗺️'}</span>
            </div>
            <div className="mt-5 flex items-end justify-between"><div><span className="text-4xl font-black">{Math.min(game.today, game.dailyGoal)}</span><span className="text-white/55 text-sm"> / {game.dailyGoal} 條</span></div><span className={`text-xs font-black px-3 py-1 rounded-full ${questDone?'bg-emerald-300 text-emerald-950':'bg-white/10 text-white/80'}`}>{questDone ? '今日任務完成 ✓' : `還差 ${Math.max(0, game.dailyGoal - game.today)} 條`}</span></div>
            <div className="h-3 rounded-full bg-white/10 overflow-hidden mt-3"><div className="h-full rounded-full bg-emerald-300 transition-all duration-700" style={{ width: `${game.questProgress}%` }} /></div>
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="rounded-2xl bg-white/10 border border-white/10 p-3 text-center"><Flame size={15} className="mx-auto text-orange-300"/><div className="text-lg font-black mt-1">{streak}</div><div className="text-[10px] text-white/55">連續天數</div></div>
              <div className="rounded-2xl bg-white/10 border border-white/10 p-3 text-center"><Target size={15} className="mx-auto text-sky-300"/><div className="text-lg font-black mt-1">{today}</div><div className="text-[10px] text-white/55">今日完成</div></div>
              <div className="rounded-2xl bg-white/10 border border-white/10 p-3 text-center"><Award size={15} className="mx-auto text-amber-300"/><div className="text-lg font-black mt-1">{total}%</div><div className="text-[10px] text-white/55">全科進度</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-[1.35fr_.65fr] gap-5">
        <div className="space-y-5">
          <ExamCountdown />

          <div className="grid md:grid-cols-2 gap-4">
            <div className="card rounded-[1.6rem] p-5 card-hover quest-glow">
              <div className="flex items-center justify-between gap-3"><span className="inline-flex items-center gap-2 text-xs font-black text-indigo-600"><BookOpen size={15}/> 下一關</span><span className="text-2xl">📘</span></div>
              <h3 className="text-lg font-black mt-2" style={{ color: 'var(--text-1)' }}>{nextLaw.name}</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>目前 {prog.read}/{prog.total} · 完成 {prog.percentage}%</p>
              <div className="h-2 rounded-full overflow-hidden mt-4 xp-track"><div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${prog.percentage}%` }} /></div>
              <Link href={`/laws/${nextLaw.id}`} className="mt-4 flex items-center justify-between bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-3 rounded-xl text-sm transition"><span>繼續這一科</span><ArrowRight size={14}/></Link>
            </div>

            <div className="card rounded-[1.6rem] p-5 card-hover">
              <div className="flex items-center justify-between gap-3"><span className="inline-flex items-center gap-2 text-xs font-black text-emerald-600"><Sparkles size={15}/> 弱點修復</span><span className="text-2xl">🧩</span></div>
              <h3 className="text-lg font-black mt-2" style={{ color: 'var(--text-1)' }}>{confusing > 0 ? `${confusing} 條還沒完全搞懂` : '目前沒有標記不懂的法條'}</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{confusing > 0 ? '把最卡的地方清掉，進度才是真的進度。' : '遇到卡住的條文，記得標記「不懂」。'}</p>
              <Link href="/review" className="mt-4 flex items-center justify-between border font-black px-4 py-3 rounded-xl text-sm transition hover:border-emerald-400" style={{ borderColor:'var(--border)', color:'var(--text-1)' }}><span>進入複習中心</span><ChevronRight size={14}/></Link>
            </div>
          </div>

          <section className="card rounded-[1.6rem] p-5 md:p-6">
            <div className="flex items-center justify-between mb-5"><span className="text-sm font-black flex items-center gap-2" style={{ color: 'var(--text-1)' }}><BarChart3 size={16} className="text-indigo-600"/> 法規地圖</span><Link href="/laws" className="text-xs font-black text-indigo-600 hover:underline">全部法規 →</Link></div>
            <div className="space-y-3">
              {lawsData.slice(0, 8).map(law => {
                const p = getProgress(law.id);
                return (
                  <Link key={law.id} href={`/laws/${law.id}`} className="group grid grid-cols-[7rem_1fr_auto] items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-indigo-500/[0.04] transition">
                    <span className="text-xs font-bold truncate" style={{ color: 'var(--text-2)' }}>{law.name}</span>
                    <div className="h-2 rounded-full overflow-hidden xp-track"><div className="h-2 rounded-full bg-indigo-600 group-hover:bg-violet-600 transition" style={{ width: `${p.percentage}%` }} /></div>
                    <span className="text-xs font-black w-10 text-right" style={{ color: 'var(--text-2)' }}>{p.percentage}%</span>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <StudyCalendar />
          <section className="card rounded-[1.6rem] p-5">
            <div className="text-sm font-black flex items-center gap-2" style={{ color: 'var(--text-1)' }}><GraduationCap size={16} className="text-amber-500"/> 第一輪攻略原則</div>
            <div className="mt-4 space-y-3">
              {[
                ['👀','先見過','先知道這條在處理什麼'],
                ['💡','再理解','白話解析＋制度脈絡＋生活案例'],
                ['✅','最後標記','懂了、不懂、必背都留下痕跡'],
              ].map(([emoji,title,desc]) => <div key={title} className="flex gap-3 rounded-xl p-3" style={{background:'var(--muted)'}}><span className="text-lg">{emoji}</span><div><div className="text-xs font-black" style={{color:'var(--text-1)'}}>{title}</div><div className="text-[11px] mt-0.5" style={{color:'var(--text-3)'}}>{desc}</div></div></div>)}
            </div>
          </section>

          <Link href="/listen" className="block card rounded-[1.6rem] p-5 card-hover">
            <div className="flex items-start gap-3"><div className="w-11 h-11 rounded-2xl bg-violet-500/10 text-violet-600 flex items-center justify-center"><Headphones size={20}/></div><div className="flex-1"><div className="text-xs font-black text-violet-600">不方便看螢幕？</div><div className="text-sm font-black mt-1" style={{color:'var(--text-1)'}}>切換 AI 聽課模式</div><div className="text-xs mt-1" style={{color:'var(--text-3)'}}>5 / 10 / 20 / 30 分鐘，免費自然語音優先。</div></div></div>
          </Link>
        </div>
      </section>

      <div className="sm:hidden text-center text-xs" style={{color:'var(--text-3)'}}>{todayStr}</div>
    </div>
  );
}
