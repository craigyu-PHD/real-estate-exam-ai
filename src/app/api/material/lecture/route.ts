import { NextResponse } from 'next/server';
import { getArticleDetail } from '@/data/articleExplanations';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const lawId = typeof body?.lawId === 'string' ? body.lawId : '';
    const articleId = typeof body?.articleId === 'string' ? body.articleId : '';
    if (!lawId || !articleId) return NextResponse.json({ error: 'missing article' }, { status: 400 });
    const detail = getArticleDetail(lawId, articleId);
    if (!detail) return NextResponse.json({ error: 'article not found' }, { status: 404 });
    return NextResponse.json({
      lectureScript: detail.lectureScript || [detail.articleText, detail.explanation, detail.why, detail.cases[0]?.content, detail.examTips.join(' ')].filter(Boolean).join('\n'),
      oneLiner: detail.oneLiner,
    });
  } catch {
    return NextResponse.json({ error: 'material failed' }, { status: 500 });
  }
}
