import { NextResponse } from 'next/server';

type GeminiModelsResponse = { models?: { name?: string; supportedGenerationMethods?: string[] }[]; error?: { message?: string } };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const suppliedKey = typeof body?.apiKey === 'string' ? body.apiKey.trim() : '';
    const apiKey = process.env.GEMINI_API_KEY?.trim() || suppliedKey;
    if (!apiKey) return NextResponse.json({ ok: false, error: '尚未設定 Gemini API Key。' }, { status: 401 });

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=100', {
      headers: { 'x-goog-api-key': apiKey },
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
    });
    const raw = await response.text();
    let data: GeminiModelsResponse = {};
    try { data = JSON.parse(raw) as GeminiModelsResponse; } catch {}
    if (!response.ok) {
      return NextResponse.json({ ok: false, error: data.error?.message || raw.slice(0, 240) || `HTTP ${response.status}` }, { status: 502 });
    }
    const names = (data.models || []).map(model => model.name || '');
    const textModel = names.some(name => name.includes('gemini-2.5-flash'));
    const ttsModel = names.some(name => name.includes('gemini-2.5-flash-preview-tts'));
    return NextResponse.json({ ok: true, textModel, ttsModel, source: process.env.GEMINI_API_KEY ? 'server' : 'browser-key' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gemini 連線測試失敗';
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
