import { NextResponse } from 'next/server';

// Gemini TTS -> Edge TTS fallback -> 503 to let client use Web Speech
export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== 'string') return NextResponse.json({ error: 'missing text' }, { status: 400 });
    // Truncate to avoid abuse
    const clean = text.slice(0, 4000);

    // 1) Try Gemini
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        // Use Gemini 2.5 Flash TTS endpoint (if available). Fallback gracefully if model not found.
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${geminiKey}`;
        const gRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: clean }] }],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
            }
          })
        });
        if (gRes.ok) {
          const j: any = await gRes.json();
          const inline = j?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData;
          if (inline?.data) {
            const buf = Buffer.from(inline.data, 'base64');
            return new NextResponse(buf, { headers: { 'Content-Type': inline.mimeType || 'audio/wav', 'X-TTS-Engine': 'gemini' } });
          }
        }
      } catch {}
    }

    // 2) Try Edge TTS via public proxy (no key required). Use lightweight edge-tts style endpoint.
    // We call an internal helper that mimics edge speech WebSocket via REST wrapper if available.
    // If no edge implementation, we return 503 so client falls back to Web Speech (still zero-cost).
    // For now, attempt to use HuggingFace-style or edge TTS rest if EDGE_TTS_URL is set.
    const edgeUrl = process.env.EDGE_TTS_URL;
    if (edgeUrl) {
      try {
        const eRes = await fetch(edgeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: clean, voice: 'zh-TW-HsiaoYuNeural' })
        });
        if (eRes.ok) {
          const blob = await eRes.arrayBuffer();
          return new NextResponse(blob, { headers: { 'Content-Type': eRes.headers.get('content-type') || 'audio/mpeg', 'X-TTS-Engine': 'edge' } });
        }
      } catch {}
    }

    // No server TTS available -> tell client to use local
    return NextResponse.json({ error: 'no-server-tts', fallback: 'web-speech' }, { status: 503 });
  } catch (e) {
    return NextResponse.json({ error: 'tts-failed' }, { status: 500 });
  }
}
