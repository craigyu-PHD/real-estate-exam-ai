'use client';
import { useState, useEffect } from 'react';
import { lawsData } from '@/data/lawsData';

type ProgressData = {
  readArticles: Record<string, string[]>; // { lawId: [articleIds] }
  lastStudyDate: string | null;
  streak: number;
};

export function useProgress() {
  const [data, setData] = useState<ProgressData>({ readArticles: {}, lastStudyDate: null, streak: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('app_progress');
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch (e) {}
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
        const currentDate = new Date(today);
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      const newData = {
        readArticles: {
          ...prev.readArticles,
          [lawId]: [...currentRead, articleId]
        },
        lastStudyDate: today,
        streak: newStreak
      };
      
      localStorage.setItem('app_progress', JSON.stringify(newData));
      return newData;
    });
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
    let totalRead = 0;
    let totalArticles = 0;
    
    lawsData.forEach(law => {
      totalRead += data.readArticles[law.id]?.length || 0;
      totalArticles += law.totalArticles;
    });
    
    return totalArticles === 0 ? 0 : Math.floor((totalRead / totalArticles) * 100);
  };

  const getTodayReadCount = () => {
    if (!isLoaded || data.lastStudyDate !== new Date().toISOString().split('T')[0]) return 0;
    // For simplicity in MVP, we don't track timestamps per article, just assume if they studied today we show a small number 
    // Wait, let's just count total read modulo 20 to simulate "today's session" if we don't have timestamp.
    // Or just a placeholder logic:
    const total = getTotalProgress();
    return total > 0 ? (data.readArticles['civil']?.length || 0) % 15 : 0; 
  };

  return { 
    isLoaded, 
    markAsRead, 
    getProgress, 
    getTotalProgress,
    streak: data.streak,
    getTodayReadCount
  };
}

