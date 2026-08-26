import { NextResponse } from 'next/server';
import { isVoicePreset, VOICE_PRESETS, type VoicePreset } from '@/lib/voiceConfig';

function pcm16ToWav(pcm: Buffer, sampleRate = 24000, channels = 1) {
  const header = Buffer.alloc(44);
  const bitsPerSample = 16;
  const byteRate = sampleRate * channels * bitsPerSample / 8;
  const blockAlign = channels * bitsPerSample / 8;
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

function sampleRateFromMime(mime = '') {
  const match = mime.match(/rate=(\d+)/i);
  return match ? Number(match[1]) : 24000;
}

function buildTeachingPrompt(text: string, preset: VoicePreset) {
  const voice = VOICE_PRESETS[preset];
  return `請合成以下繁體中文內容的語音。\n\n【聲音角色】台灣不動產經紀人考試的資深家教老師。\n【表演指導】${voice.direction}\n【口音】自然台灣國語。法律條號、數字與專有名詞要清楚，標點處自然停頓。避免新聞主播腔、導航機器音或逐字念稿感。\n【重要】只朗讀「逐字稿」區塊，不要朗讀以上指令。\n\n【逐字稿開始】\n${text}\n【逐字稿結束】`;
}

async function requestGeminiTTS(apiKey: string, text: string, preset: VoicePreset) {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent';
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    signal: AbortSignal.timeout(30000),
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildTeachingPrompt(text, preset) }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: VOICE_PRESETS[preset].geminiVoice },
          },
        },
      },
    }),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = body?.text;
    const preset: VoicePreset = isVoicePreset(body?.voicePreset) ? body.voicePreset : 'warm';
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'missing text' }, { status: 400 });
    }

    const clean = text.replace(/\s+/g, ' ').trim().slice(0, 6000);
    const suppliedKey = typeof body?.apiKey === 'string' ? body.apiKey.trim() : '';
    const geminiKey = suppliedKey || process.env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        // Preview TTS occasionally fails transiently; one retry keeps the UI resilient.
        let gRes = await requestGeminiTTS(geminiKey, clean, preset);
        if (!gRes.ok && gRes.status >= 500) gRes = await requestGeminiTTS(geminiKey, clean, preset);
        if (gRes.ok) {
          const json = await gRes.json();
          const inline = json?.candidates?.[0]?.content?.parts?.find((part: { inlineData?: { data?: string; mimeType?: string } }) => part.inlineData)?.inlineData;
          if (inline?.data) {
            const raw = Buffer.from(inline.data, 'base64');
            const mime = inline.mimeType || '';
            const needsWav = /L16|pcm/i.test(mime) || !/audio\/(wav|mpeg|mp3|ogg|webm)/i.test(mime);
            const audio = needsWav ? pcm16ToWav(raw, sampleRateFromMime(mime)) : raw;
            return new NextResponse(audio, {
              headers: {
                'Content-Type': needsWav ? 'audio/wav' : mime,
                'Cache-Control': 'private, max-age=86400',
                'X-TTS-Engine': 'gemini',
                'X-TTS-Voice': VOICE_PRESETS[preset].geminiVoice,
              },
            });
          }
        }
      } catch (error) {
        console.error('Gemini TTS failed', error);
      }
    }

    // Optional self-hosted / internal Edge-TTS-compatible endpoint.
    const edgeUrl = process.env.EDGE_TTS_URL;
    if (edgeUrl) {
      try {
        const eRes = await fetch(edgeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: clean, voice: 'zh-TW-HsiaoYuNeural' }),
        });
        if (eRes.ok) {
          const audio = await eRes.arrayBuffer();
          return new NextResponse(audio, {
            headers: {
              'Content-Type': eRes.headers.get('content-type') || 'audio/mpeg',
              'X-TTS-Engine': 'edge',
            },
          });
        }
      } catch (error) {
        console.error('Edge TTS fallback failed', error);
      }
    }

    return NextResponse.json({ error: 'no-server-tts', fallback: 'device-natural' }, { status: 503 });
  } catch {
    return NextResponse.json({ error: 'tts-failed' }, { status: 500 });
  }
}
