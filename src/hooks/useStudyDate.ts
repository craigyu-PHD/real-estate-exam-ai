'use client';

import { useEffect, useState } from 'react';

const LAST_SEEN_DATE_KEY = 'app_last_seen_study_date';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dateFromKey(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function resolveStudyDateKey(now = new Date()) {
  const actualToday = localDateKey(now);
  if (typeof window === 'undefined') return actualToday;

  const stored = localStorage.getItem(LAST_SEEN_DATE_KEY);
  const validStored = stored && DATE_PATTERN.test(stored) ? stored : null;
  const next = validStored && validStored > actualToday ? validStored : actualToday;

  if (stored !== next) localStorage.setItem(LAST_SEEN_DATE_KEY, next);
  return next;
}

export function useStudyDateKey() {
  const [dateKey, setDateKey] = useState(() => localDateKey());

  useEffect(() => {
    let timer: number | undefined;

    const refresh = () => setDateKey(resolveStudyDateKey());
    const scheduleMidnightRefresh = () => {
      if (timer) window.clearTimeout(timer);
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1, 0);
      timer = window.setTimeout(() => {
        refresh();
        scheduleMidnightRefresh();
      }, Math.max(1000, nextMidnight.getTime() - now.getTime()));
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        refresh();
        scheduleMidnightRefresh();
      }
    };
    const onFocus = () => {
      refresh();
      scheduleMidnightRefresh();
    };

    refresh();
    scheduleMidnightRefresh();
    window.addEventListener('focus', onFocus);
    window.addEventListener('pageshow', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pageshow', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return dateKey;
}
