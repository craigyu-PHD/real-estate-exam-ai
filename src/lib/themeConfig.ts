export type ThemeId = 'classic' | 'cyber-web' | 'iron-forge' | 'apex-racing' | 'deep-space' | 'shadow-ronin';
export type Appearance = 'system' | 'light' | 'dark';

export const THEMES: Record<ThemeId, { label: string; subtitle: string; description: string; vibe: string }> = {
  classic: { label: 'Classic', subtitle: '專注經典', description: '目前穩定的專業學習介面，低干擾、適合長時間閱讀。', vibe: 'Indigo / Teal' },
  'cyber-web': { label: 'Cyber Web', subtitle: 'AI 網路情報', description: '同一套專業工作台，以藍紫 Accent 與低干擾網路氛圍強化 AI、情報與關聯感。', vibe: 'AI Network / Blue Violet' },
  'iron-forge': { label: 'Iron Forge', subtitle: '法律結構工程', description: '同一套專業工作台，以 Slate 與 Teal 呈現制度、結構、工程與法律秩序感。', vibe: 'Legal Structure / Slate Teal' },
  'apex-racing': { label: 'Apex Racing', subtitle: '考前衝刺模式', description: '同一套專業工作台，以 Charcoal 與 Racing Red 提供考前衝刺與目標推進感。', vibe: 'Exam Sprint / Charcoal Red' },
  'deep-space': { label: 'Deep Space', subtitle: '深度沉浸學習', description: '同一套專業工作台，以 Navy、Cyan 與少量紫色建立深度閱讀與沉浸專注氛圍。', vibe: 'Deep Focus / Navy Cyan' },
  'shadow-ronin': { label: 'Shadow Ronin', subtitle: '精準專注模式', description: '同一套專業工作台，以 Warm Black 與 Crimson 表現克制、精準與低干擾專注。', vibe: 'Precision / Warm Black Crimson' },
};
