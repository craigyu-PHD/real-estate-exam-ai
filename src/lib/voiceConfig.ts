export type VoicePreset = 'warm' | 'mentor' | 'energetic';

export const VOICE_PRESETS: Record<VoicePreset, {
  label: string;
  shortLabel: string;
  description: string;
  emoji: string;
  geminiVoice: string;
  direction: string;
}> = {
  warm: {
    label: '溫暖家教',
    shortLabel: '溫暖',
    description: '自然、耐聽，適合長時間讀法條',
    emoji: '☕',
    geminiVoice: 'Sulafat',
    direction: '溫暖、沉穩、有親和力，像台灣資深補習班老師一對一教學。語速自然偏慢，句子之間保留短暫呼吸，不要播報腔。',
  },
  mentor: {
    label: '清晰名師',
    shortLabel: '名師',
    description: '條理清楚、重點分明，適合考點複習',
    emoji: '🎓',
    geminiVoice: 'Sadaltager',
    direction: '知識型、清晰、沉著，像經驗豐富的考試名師。重要法律名詞稍微放慢並自然加重，但不要誇張。',
  },
  energetic: {
    label: '活力陪讀',
    shortLabel: '活力',
    description: '節奏明快，適合通勤與精神較疲倦時',
    emoji: '⚡',
    geminiVoice: 'Puck',
    direction: '有精神、友善、帶一點鼓勵感，像陪學生闖關的年輕老師。保持專業，不要卡通化，也不要過度興奮。',
  },
};

export function isVoicePreset(value: unknown): value is VoicePreset {
  return value === 'warm' || value === 'mentor' || value === 'energetic';
}
