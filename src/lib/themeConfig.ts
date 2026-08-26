export type ThemeId = 'classic' | 'cyber-web' | 'iron-forge' | 'apex-racing' | 'deep-space' | 'shadow-ronin';
export type Appearance = 'system' | 'light' | 'dark';

export const THEMES: Record<ThemeId, { label: string; subtitle: string; emoji: string; description: string; vibe: string }> = {
  classic: { label: 'Classic', subtitle: '專注經典', emoji: '🎓', description: '目前穩定的專業學習介面，低干擾、適合長時間閱讀。', vibe: 'Indigo / Teal' },
  'cyber-web': { label: 'Cyber Web', subtitle: '蛛網英雄', emoji: '🕸️', description: '深紅與科技藍的原創蛛網世界，點擊會展開蛛網脈衝。', vibe: 'Crimson / Electric Blue' },
  'iron-forge': { label: 'Iron Forge', subtitle: '機甲工業', emoji: '⚙️', description: '冷鋼、工程儀表與少量銅色點綴，點擊帶出火花與機械脈衝。', vibe: 'Gunmetal / Steel Blue / Copper' },
  'apex-racing': { label: 'Apex Racing', subtitle: '極速賽道', emoji: '🏎️', description: '賽車 HUD 與速度線語彙，頁面切換有短促加速掃光。', vibe: 'Carbon / Racing Red' },
  'deep-space': { label: 'Deep Space', subtitle: '深空指揮艦', emoji: '🌌', description: '星艦控制台與深空光點，點擊形成小型軌道波紋。', vibe: 'Navy / Cyan' },
  'shadow-ronin': { label: 'Shadow Ronin', subtitle: '夜行武士', emoji: '🥷', description: '墨色、緋紅與和紙紋理，點擊像刀光切過介面。', vibe: 'Ink / Vermilion' },
};
