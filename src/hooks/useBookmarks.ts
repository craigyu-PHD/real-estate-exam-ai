'use client';
import { useState, useEffect } from 'react';

export type BookmarkType = 'important' | 'confusing' | 'memorize' | 'note';

export interface Bookmark {
  id: string; // lawId_articleId
  lawId: string;
  articleId: string;
  type: BookmarkType;
  note?: string;
  createdAt: string;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const stored = localStorage.getItem('app_bookmarks');
      if (stored) {
        try { setBookmarks(JSON.parse(stored)); } catch {}
      }
      setIsLoaded(true);
    });
  }, []);

  const toggleBookmark = (lawId: string, articleId: string, type: BookmarkType, note?: string) => {
    setBookmarks(prev => {
      const id = `${lawId}_${articleId}`;
      const existing = prev.find(b => b.id === id && b.type === type);
      
      let newBookmarks;
      if (existing) {
        // Remove it
        newBookmarks = prev.filter(b => b.id !== id || b.type !== type);
      } else {
        // Add it
        newBookmarks = [...prev, { id, lawId, articleId, type, note, createdAt: new Date().toISOString() }];
      }
      
      localStorage.setItem('app_bookmarks', JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  };

  const hasBookmark = (lawId: string, articleId: string, type: BookmarkType) => {
    return bookmarks.some(b => b.lawId === lawId && b.articleId === articleId && b.type === type);
  };

  const getBookmarksByType = (type?: BookmarkType | 'all') => {
    if (!type || type === 'all') return bookmarks;
    return bookmarks.filter(b => b.type === type);
  };

  return { isLoaded, bookmarks, toggleBookmark, hasBookmark, getBookmarksByType };
}
