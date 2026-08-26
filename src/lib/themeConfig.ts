export type ThemeId = 'classic' | 'cyber-web' | 'iron-forge' | 'apex-racing' | 'deep-space' | 'shadow-ronin';
export type Appearance = 'system' | 'light' | 'dark';

export const THEMES: Record<ThemeId, { label: string; subtitle: string; emoji: string; description: string; vibe: string }> = {
  classic: { label: 'Classic', subtitle: '專注經典', emoji: '🎓', description: '目前穩定的專業學習介面，低干擾、適合長時間閱讀。', vibe: 'Indigo / Teal' },
  'cyber-web': { label: 'Cyber Web', subtitle: '蛛網英雄', emoji: '🕸️', description: '真正的多層蛛網、原創網紋英雄徽章與絲線點擊動畫，深紅配科技藍。', vibe: 'Web / Crimson / Electric Blue' },
  'iron-forge': { label: 'Iron Forge', subtitle: '機甲工業', emoji: '⚙️', description: '原創機械核心、工程格線與銅色火花，點擊像齒輪能量脈衝。', vibe: 'Gunmetal / Steel Blue / Copper' },
  'apex-racing': { label: 'Apex Racing', subtitle: '極速賽道', emoji: '🏎️', description: '原創流線賽車、賽道弧線與格紋旗，點擊會帶出車影與速度拖尾。', vibe: 'Carbon / Racing Red / Pit Lane' },
  'deep-space': { label: 'Deep Space', subtitle: '深空指揮艦', emoji: '🌌', description: '原創星艦、星圖雷達與艦橋 HUD，點擊形成雷達掃描與艦影脈衝。', vibe: 'Command Navy / Cyan / Nebula' },
  'shadow-ronin': { label: 'Shadow Ronin', subtitle: '夜行武士', emoji: '🥷', description: '原創面甲、刀鋒與月輪，保留和紙質感並加強俐落刀光過場。', vibe: 'Ink / Vermilion / Moonlight' },
};
