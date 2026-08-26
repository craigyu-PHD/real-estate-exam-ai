'use client';
import { useEffect, useState } from 'react';

const KEY = 'app_question_progress';
type State = { wrongIds: string[]; answeredIds: string[] };
const initial: State = { wrongIds: [], answeredIds: [] };

export function useQuestionProgress() {
  const [state, setState] = useState<State>(initial);
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    queueMicrotask(() => {
      try { const raw = localStorage.getItem(KEY); if (raw) setState({ ...initial, ...JSON.parse(raw) }); } catch {}
      setIsLoaded(true);
    });
  }, []);
  const recordAnswer = (id: string, correct: boolean) => {
    setState(prev => {
      const answeredIds = Array.from(new Set([...prev.answeredIds, id]));
      const wrongIds = correct ? prev.wrongIds.filter(x => x !== id) : Array.from(new Set([...prev.wrongIds, id]));
      const next = { wrongIds, answeredIds };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };
  return { isLoaded, wrongIds: state.wrongIds, answeredIds: state.answeredIds, recordAnswer };
}
