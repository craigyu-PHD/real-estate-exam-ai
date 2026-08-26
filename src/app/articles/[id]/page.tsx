import { notFound } from 'next/navigation';
import { getArticleDetail } from '@/data/articleExplanations';
import { ArticleDetailClient } from '@/components/ArticleDetailClient';

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const parts = rawId.split('-');
  const lawId = parts[0] || 'civil';
  const articleId = parts.slice(1).join('-') || rawId;
  const detail = getArticleDetail(lawId, articleId);
  if (!detail) notFound();
  return <ArticleDetailClient rawId={rawId} detail={detail} />;
}
