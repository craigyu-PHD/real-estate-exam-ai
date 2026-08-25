'use client';
import { useState, useEffect } from 'react';

type ProgressData = {
  [lawId: string]: {
    readArticles: string[];
  }
};

const lawTotalArticles: Record<string, number> = {
  'civil': 1225,
  'land': 324,
  'tax': 200,
  'broker': 154,
  'appraisal': 139,
};

export function useProgress() {
  const [data, setData] = useState<ProgressData>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('law_progress');
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

  const markAsRead = (lawId: string, articleId: string) => {
    setData(prev => {
      const lawData = prev[lawId] || { readArticles: [] };
      if (lawData.readArticles.includes(articleId)) return prev; // Already read
      
      const newData = {
        ...prev,
        [lawId]: {
          ...lawData,
          readArticles: [...lawData.readArticles, articleId]
        }
      };
      localStorage.setItem('law_progress', JSON.stringify(newData));
      return newData;
    });
  };

  const getProgress = (lawId: string) => {
    if (!isLoaded) return { read: 0, total: lawTotalArticles[lawId] || 100, percentage: 0 };
    
    const read = data[lawId]?.readArticles.length || 0;
    const total = lawTotalArticles[lawId] || 100;
    const percentage = Math.floor((read / total) * 100);
    
    return { read, total, percentage };
  };

  const getTotalProgress = () => {
    if (!isLoaded) return 0;
    let totalRead = 0;
    let totalArticles = 0;
    
    Object.keys(lawTotalArticles).forEach(key => {
      totalRead += data[key]?.readArticles.length || 0;
      totalArticles += lawTotalArticles[key];
    });
    
    return Math.floor((totalRead / totalArticles) * 100);
  };

  return { isLoaded, markAsRead, getProgress, getTotalProgress, lawTotalArticles };
}
