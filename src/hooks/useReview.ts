'use client';
import { useState, useEffect } from 'react';

type ReviewItem = {
  lawId: string;
  articleId: string;
  dueDate: string; // ISO date
  interval: number; // days
  ease: number;
  lastResult?: string;
};

const KEY = 'app_review_queue';

export function useReview() {
  const [queue, setQueue] = useState<ReviewItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (stored) try { setQueue(JSON.parse(stored)); } catch {}
    setIsLoaded(true);
  }, []);

  const save = (q: ReviewItem[]) => {
    localStorage.setItem(KEY, JSON.stringify(q));
    setQueue(q);
  };

  const schedule = (lawId: string, articleId: string) => {
    // add if not exists, due tomorrow
    if (queue.find(x => x.lawId===lawId && x.articleId===articleId)) return;
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
    const next = [...queue, { lawId, articleId, dueDate: tomorrow.toISOString(), interval: 1, ease: 2.5 }];
    save(next);
  };

  const grade = (lawId: string, articleId: string, result: 'again'|'hard'|'good'|'easy') => {
    const idx = queue.findIndex(x=>x.lawId===lawId && x.articleId===articleId);
    if (idx===-1) return;
    const item = queue[idx];
    let interval = item.interval;
    let ease = item.ease;
    if (result==='again') { interval=1; ease=Math.max(1.3, ease-0.2); }
    else if (result==='hard') { interval=Math.max(1, Math.round(interval*1.2)); ease=Math.max(1.3, ease-0.15); }
    else if (result==='good') { interval=Math.round(interval*ease); }
    else if (result==='easy') { interval=Math.round(interval*ease*1.3); ease+=0.15; }
    const due = new Date(); due.setDate(due.getDate()+interval);
    const next = [...queue]; next[idx]={...item, interval, ease, dueDate: due.toISOString(), lastResult: result};
    save(next);
  };

  const dueToday = queue.filter(x => new Date(x.dueDate) <= new Date());
  const overdue = queue.filter(x => new Date(x.dueDate) < new Date(new Date().setHours(0,0,0,0)));

  return { isLoaded, queue, dueToday, overdue, schedule, grade };
}
