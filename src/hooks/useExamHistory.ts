'use client';
import { useState, useEffect } from 'react';

export type ExamRecord = {
  id: string;
  date: string;
  mode: string;
  score: number;
  total: number;
  durationSec?: number;
};

const KEY='app_exam_history';

export function useExamHistory(){
  const [records,setRecords]=useState<ExamRecord[]>([]);
  const [isLoaded,setIsLoaded]=useState(false);
  useEffect(()=>{
    queueMicrotask(() => {
      try{ const v=localStorage.getItem(KEY); if(v) setRecords(JSON.parse(v)); }catch{}
      setIsLoaded(true);
    });
  },[]);
  const add = (r: ExamRecord)=>{
    const next=[r,...records].slice(0,50);
    setRecords(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    // optional cloud sync
    try{
      const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
      if(url) fetch('/api/sync/exam',{method:'POST', body: JSON.stringify(r)}).catch(()=>{});
    }catch{}
  };
  return { isLoaded, records, add };
}
