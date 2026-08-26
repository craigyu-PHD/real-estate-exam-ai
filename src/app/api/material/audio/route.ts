import { getArticleDetail } from '@/data/articleExplanations';
import { createEdgeTTSStream } from '@/lib/server/edgeTts';
import { isVoicePreset, type VoicePreset } from '@/lib/voiceConfig';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lawId = url.searchParams.get('lawId') || '';
  const articleId = url.searchParams.get('articleId') || '';
  const rawPreset = url.searchParams.get('preset');
  const preset: VoicePreset = isVoicePreset(rawPreset) ? rawPreset : 'warm';
  if (!lawId || !articleId) return Response.json({ error: 'missing article' }, { status: 400 });

  const detail = getArticleDetail(lawId, articleId);
  if (!detail) return Response.json({ error: 'article not found' }, { status: 404 });
  const lecture = (detail.lectureScript || [detail.articleText, detail.explanation, detail.why, detail.cases[0]?.content, detail.examTips.join(' ')].filter(Boolean).join('\n')).slice(0, 3200);

  try {
    const edge = await createEdgeTTSStream(lecture, preset);
    let cancelled = false;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        edge.audioStream.on('data', chunk => {
          if (!cancelled) controller.enqueue(new Uint8Array(Buffer.from(chunk)));
        });
        edge.audioStream.once('end', () => {
          edge.close();
          if (!cancelled) controller.close();
        });
        edge.audioStream.once('error', error => {
          edge.close();
          if (!cancelled) controller.error(error);
        });
      },
      cancel() {
        // Do not force-close the Edge websocket mid-frame. Let the upstream stream
        // finish naturally while discarding bytes; abrupt close can race msedge-tts internals.
        cancelled = true;
      },
    });
    return new Response(body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
        'X-TTS-Engine': 'edge-neural-stream',
        'X-TTS-Voice': edge.voice,
      },
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'edge stream failed' }, { status: 502 });
  }
}
