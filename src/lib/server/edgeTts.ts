import 'server-only';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import type { VoicePreset } from '@/lib/voiceConfig';
import type { Readable } from 'node:stream';

const EDGE_VOICES: Record<VoicePreset, string> = {
  warm: 'zh-TW-HsiaoChenNeural',
  mentor: 'zh-TW-YunJheNeural',
  energetic: 'zh-TW-HsiaoYuNeural',
};

const EDGE_PROSODY: Record<VoicePreset, { rate: string; pitch: string }> = {
  warm: { rate: '-6%', pitch: '-1Hz' },
  mentor: { rate: '-2%', pitch: '-2Hz' },
  energetic: { rate: '+4%', pitch: '+1Hz' },
};

function splitForParallel(text: string, maxChars = 155) {
  const units = text.split(/(?<=[。！？；\n])/).map(part => part.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = '';
  for (const unit of units) {
    if (unit.length > maxChars) {
      if (current) { chunks.push(current); current = ''; }
      for (let i = 0; i < unit.length; i += maxChars) chunks.push(unit.slice(i, i + maxChars));
      continue;
    }
    if (current && current.length + unit.length > maxChars) {
      chunks.push(current);
      current = unit;
    } else current += unit;
  }
  if (current) chunks.push(current);
  return chunks.length ? chunks : [text];
}

async function synthesizeChunk(text: string, preset: VoicePreset) {
  const client = new MsEdgeTTS();
  try {
    await client.setMetadata(EDGE_VOICES[preset], OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = client.toStream(text, EDGE_PROSODY[preset]);
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks);
  } finally {
    client.close();
  }
}

export async function synthesizeEdgeTTS(text: string, preset: VoicePreset) {
  const pieces = splitForParallel(text.slice(0, 2800));
  const audioParts: Buffer[] = [];
  for (let i = 0; i < pieces.length; i += 12) {
    const batch = await Promise.all(pieces.slice(i, i + 12).map(piece => synthesizeChunk(piece, preset)));
    audioParts.push(...batch);
  }
  const audio = Buffer.concat(audioParts);
  if (audio.length < 1000) throw new Error('Edge Neural returned empty audio');
  return { audio, voice: EDGE_VOICES[preset] };
}

export async function createEdgeTTSStream(text: string, preset: VoicePreset): Promise<{
  audioStream: Readable;
  voice: string;
  close: () => void;
}> {
  const client = new MsEdgeTTS();
  const voice = EDGE_VOICES[preset];
  await client.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const { audioStream } = client.toStream(text, EDGE_PROSODY[preset]);
  return { audioStream, voice, close: () => client.close() };
}
