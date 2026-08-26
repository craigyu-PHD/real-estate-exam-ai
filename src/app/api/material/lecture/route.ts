import { NextResponse } from 'next/server';
import { getPodcastLecture } from '@/lib/server/podcastLecture';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const lawId = typeof body?.lawId === 'string' ? body.lawId : '';
    const articleId = typeof body?.articleId === 'string' ? body.articleId : '';
    if (!lawId || !articleId) return NextResponse.json({ error: 'missing article' }, { status: 400 });
    const podcast = getPodcastLecture(lawId, articleId);
    if (!podcast) return NextResponse.json({ error: 'article not found' }, { status: 404 });
    return NextResponse.json({ lectureScript: podcast.lectureScript, oneLiner: podcast.detail.oneLiner });
  } catch {
    return NextResponse.json({ error: 'material failed' }, { status: 500 });
  }
}
