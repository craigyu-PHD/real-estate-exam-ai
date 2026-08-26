'use client';
import { useState, useEffect } from 'react';
import { lawsData } from '@/data/lawsData';

type ProgressData = {
  readArticles: Record<string, string[]>;
  readDates: Record<string, string>;
  dailyCounts: Record<string, number>;
  lastStudyDate: string | null;
  streak: number;
};

const emptyData: ProgressData = {
  readArticles: {},
  readDates: {},
  dailyCounts: {},
  lastStudyDate: null,
  streak: 0,
};

function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function dayDiff(a: string, b: string) {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const first = new Date(ay, am - 1, ad);
  const second = new Date(by, bm - 1, bd);
  return Math.round((second.getTime() - first.getTime()) / 86400000);
}

function normalize(parsed: Partial<ProgressData>): ProgressData {
  return {
    readArticles: parsed.readArticles || {},
    readDates: parsed.readDates || {},
    dailyCounts: parsed.dailyCounts || {},
    lastStudyDate: parsed.lastStudyDate || null,
    streak: parsed.streak || 0,
  };
}

export function useProgress() {
  const [data, setData] = useState<ProgressData>(emptyData);
  const [isLoaded, setIsLoaded] = useState(false);

  const readStored = () => {
    const stored = localStorage.getItem('app_progress');
    if (!stored) return emptyData;
    try { return normalize(JSON.parse(stored)); } catch { return emptyData; }
  };

  useEffect(() => {
    queueMicrotask(() => {
      setData(readStored());
      setIsLoaded(true);
    });
    const sync = () => setData(readStored());
    window.addEventListener('app-progress-updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('app-progress-updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const persist = (next: ProgressData) => {
    localStorage.setItem('app_progress', JSON.stringify(next));
    queueMicrotask(() => window.dispatchEvent(new Event('app-progress-updated')));
    return next;
  };

  const markAsRead = (lawId: string, articleId: string) => {
    setData(prev => {
      const currentRead = prev.readArticles[lawId] || [];
      if (currentRead.includes(articleId)) return prev;
      const today = localDateKey();
      let newStreak = prev.streak;
      if (prev.lastStudyDate) {
        const diff = dayDiff(prev.lastStudyDate, today);
        if (diff === 1) newStreak += 1;
        else if (diff > 1) newStreak = 1;
        else if (diff < 0) newStreak = Math.max(1, newStreak);
      } else newStreak = 1;
      const articleKey = `${lawId}:${articleId}`;
      return persist({
        readArticles: { ...prev.readArticles, [lawId]: [...currentRead, articleId] },
        readDates: { ...prev.readDates, [articleKey]: today },
        dailyCounts: { ...prev.dailyCounts, [today]: (prev.dailyCounts[today] || 0) + 1 },
        lastStudyDate: today,
        streak: newStreak,
      });
    });
  };

  const unmarkAsRead = (lawId: string, articleId: string) => {
    setData(prev => {
      const currentRead = prev.readArticles[lawId] || [];
      if (!currentRead.includes(articleId)) return prev;
      const articleKey = `${lawId}:${articleId}`;
      const readDate = prev.readDates[articleKey];
      const nextDates = { ...prev.readDates };
      delete nextDates[articleKey];
      const nextCounts = { ...prev.dailyCounts };
      if (readDate && nextCounts[readDate]) nextCounts[readDate] = Math.max(0, nextCounts[readDate] - 1);
      return persist({
        ...prev,
        readArticles: { ...prev.readArticles, [lawId]: currentRead.filter(id => id !== articleId) },
        readDates: nextDates,
        dailyCounts: nextCounts,
      });
    });
  };

  const isArticleRead = (lawId: string, articleId: string) => !!data.readArticles[lawId]?.includes(articleId);

  const getProgress = (lawId: string) => {
    if (!isLoaded) return { read: 0, total: 100, percentage: 0 };
    const law = lawsData.find(l => l.id === lawId);
    const total = law ? law.totalArticles : 100;
    const read = data.readArticles[lawId]?.length || 0;
    const percentage = total === 0 ? 0 : Math.min(100, Math.floor((read / total) * 100));
    return { read, total, percentage };
  };

  const getTotalReadCount = () => Object.values(data.readArticles).reduce((sum, ids) => sum + ids.length, 0);

  const getTotalProgress = () => {
    if (!isLoaded) return 0;
    let totalRead = 0;
    let totalArticles = 0;
    lawsData.forEach(law => {
      totalRead += data.readArticles[law.id]?.length || 0;
      totalArticles += law.totalArticles;
    });
    return totalArticles === 0 ? 0 : Math.min(100, Math.floor((totalRead / totalArticles) * 100));
  };

  const getTodayReadCount = () => isLoaded ? data.dailyCounts[localDateKey()] || 0 : 0;

  const getGamificationStats = () => {
    const totalRead = getTotalReadCount();
    const today = getTodayReadCount();
    const xp = totalRead * 12 + data.streak * 20;
    const level = Math.max(1, Math.floor(Math.sqrt(xp / 160)) + 1);
    const levelStart = Math.pow(level - 1, 2) * 160;
    const nextLevel = Math.pow(level, 2) * 160;
    const levelProgress = nextLevel === levelStart ? 0 : Math.min(100, Math.floor(((xp - levelStart) / (nextLevel - levelStart)) * 100));
    const dailyGoal = 8;
    const questProgress = Math.min(100, Math.floor((today / dailyGoal) * 100));
    const title = level >= 8 ? '法規攻略王' : level >= 6 ? '考點獵人' : level >= 4 ? '穩定進階者' : level >= 2 ? '法規探索者' : '新手上路';
    return { xp, level, levelProgress, nextLevel, title, totalRead, today, dailyGoal, questProgress };
  };

  return {
    isLoaded,
    markAsRead,
    unmarkAsRead,
    getProgress,
    getTotalProgress,
    getTotalReadCount,
    getGamificationStats,
    streak: data.streak,
    getTodayReadCount,
    isArticleRead,
  };
}
