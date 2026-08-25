'use client';
import { useState, useEffect } from 'react';
import { lawsData } from '@/data/lawsData';

type ProgressData = {
  readArticles: Record<string, string[]>;
  dailyCounts: Record<string, number>; // date -> count
  lastStudyDate: string | null;
  streak: number;
};

export function useProgress() {
  const [data, setData] = useState<ProgressData>({ readArticles: {}, dailyCounts: {}, lastStudyDate: null, streak: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('app_progress');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (!parsed.dailyCounts) parsed.dailyCounts = {};
        setData(parsed);
      } catch {}
    }
    setIsLoaded(true);
  }, []);

  const markAsRead = (lawId: string, articleId: string) => {
    setData(prev => {
      const currentRead = prev.readArticles[lawId] || [];
      if (currentRead.includes(articleId)) return prev;
      const today = new Date().toISOString().split('T')[0];
      let newStreak = prev.streak;
      if (prev.lastStudyDate) {
        const lastDate = new Date(prev.lastStudyDate);
        const cur = new Date(today);
        const diffDays = Math.round((cur.getTime() - lastDate.getTime())/(1000*60*60*24));
        if (diffDays === 1) newStreak += 1;
        else if (diffDays > 1) newStreak = 1;
      } else newStreak = 1;
      const newData: ProgressData = {
        readArticles: { ...prev.readArticles, [lawId]: [...currentRead, articleId] },
        dailyCounts: { ...prev.dailyCounts, [today]: (prev.dailyCounts[today]||0)+1 },
        lastStudyDate: today,
        streak: newStreak
      };
      localStorage.setItem('app_progress', JSON.stringify(newData));
      return newData;
    });
  };

  const isArticleRead = (lawId: string, articleId: string) => {
    return !!data.readArticles[lawId]?.includes(articleId);
  };

  const getProgress = (lawId: string) => {
    if (!isLoaded) return { read: 0, total: 100, percentage: 0 };
    const law = lawsData.find(l => l.id === lawId);
    const total = law ? law.totalArticles : 100;
    const read = data.readArticles[lawId]?.length || 0;
    const percentage = total === 0 ? 0 : Math.floor((read / total) * 100);
    return { read, total, percentage };
  };

  const getTotalProgress = () => {
    if (!isLoaded) return 0;
    let totalRead = 0; let totalArticles = 0;
    lawsData.forEach(law => { totalRead += data.readArticles[law.id]?.length || 0; totalArticles += law.totalArticles; });
    return totalArticles === 0 ? 0 : Math.floor((totalRead / totalArticles) * 100);
  };

  const getTodayReadCount = () => {
    if (!isLoaded) return 0;
    const today = new Date().toISOString().split('T')[0];
    return data.dailyCounts[today] || 0;
  };

  return { isLoaded, markAsRead, getProgress, getTotalProgress, streak: data.streak, getTodayReadCount, isArticleRead };
}
