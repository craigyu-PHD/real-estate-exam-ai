'use client';

import { useEffect, useState } from 'react';
import { Activity, Check, CircleAlert, CircleCheck, ExternalLink, Eye, EyeOff, KeyRound, Loader2, LockKeyhole, Monitor, Moon, Palette, Play, Shield, SlidersHorizontal, Smartphone, Sun, Trash2, Type, Volume2, WifiOff } from 'lucide-react';
import { WorkspacePageHeader } from '@/components/WorkspacePageHeader';
import { useSettings, type VoiceEngine } from '@/hooks/useSettings';
import { AudioPlayer } from '@/components/AudioPlayer';
import { VOICE_PRESETS, type VoicePreset } from '@/lib/voiceConfig';
import { getStoredAiKeys, maskApiKey, saveStoredAiKey, type AiProvider, type StoredAiKeys } from '@/lib/aiKeys';
import { THEMES, type Appearance, type ThemeId } from '@/lib/themeConfig';
import { ThemeArtwork } from '@/components/ThemeArtwork';

type TestState = { provider: AiProvider | 'edge' | null; state: 'idle' | 'testing' | 'ok' | 'error'; message: string };

export default function SettingsPage() {
  const { isLoaded, settings, updateSettings } = useSettings();
  const emptyKeys: StoredAiKeys = { gemini: '', groq: '', mistral: '', openrouter: '', huggingface: '' };
  const [apiKeys, setApiKeys] = useState<StoredAiKeys>(emptyKeys);
  const [savedKeys, setSavedKeys] = useState<StoredAiKeys>(emptyKeys);
  const [showProvider, setShowProvider] = useState<AiProvider | null>(null);
  const [testState, setTestState] = useState<TestState>({ provider: null, state: 'idle', message: '' });

  useEffect(() => {
    queueMicrotask(() => {
      const keys = getStoredAiKeys();
      setApiKeys(keys);
      setSavedKeys(keys);
    });
  }, []);

  if (!isLoaded) return <div className="p-10 text-center text-tertiary">載入設定中…</div>;

  const engines: { id: VoiceEngine; label: string; desc: string; icon: typeof Volume2 }[] = [
    { id: 'auto', label: '智慧自動（推薦）', desc: 'Gemini 可用時優先使用；否則自動切到免 Key 的台灣 Edge Neural，再退到裝置語音。', icon: Activity },
    { id: 'edge-neural', label: 'Edge Neural（免 Key）', desc: '直接使用 Microsoft 台灣 Natural／Neural 聲線，不需要 API Key。', icon: WifiOff },
    { id: 'gemini', label: 'Gemini 優先', desc: '有 Gemini Key 時優先使用 Gemini TTS；失敗會自動切換 Edge Neural。', icon: Volume2 },
    { id: 'device-natural', label: '裝置自然語音', desc: '不走伺服器，直接挑選目前裝置最佳中文 Natural／Neural 聲線。', icon: Smartphone },
    { id: 'web-speech', label: '系統相容語音', desc: '離線保底方案，音質依裝置與瀏覽器而異。', icon: Monitor },
  ];

  const appearances: { id: Appearance; label: string; desc: string; icon: typeof Sun }[] = [
    { id: 'system', label: '跟隨系統', desc: '跟著 macOS、Windows 或手機自動切換', icon: Monitor },
    { id: 'light', label: '淺色', desc: '明亮、高對比，適合白天閱讀', icon: Sun },
    { id: 'dark', label: '深色', desc: 'Dark Professional，適合長時間工作與閱讀', icon: Moon },
  ];

  const navItems = [
    { id: 'appearance', label: '外觀', icon: Palette },
    { id: 'learning', label: '學習', icon: SlidersHorizontal },
    { id: 'ai', label: 'AI 老師', icon: KeyRound },
    { id: 'voice', label: '語音', icon: Volume2 },
    { id: 'data', label: '資料', icon: Shield },
  ];

  const testText = '歡迎回來。先聽一次法條原文，再用白話拆解、案例和考點，把這一關真正弄懂。';

  const testProvider = async (provider: AiProvider | 'edge') => {
    const key = provider === 'edge' ? '' : apiKeys[provider].trim();
    if (provider !== 'edge') {
      saveStoredAiKey(provider, key);
      setSavedKeys(previous => ({ ...previous, [provider]: key }));
    }
    setTestState({ provider, state: 'testing', message: `正在測試 ${provider === 'edge' ? 'Edge Neural' : provider}…` });
    try {
      const response = await fetch('/api/ai/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider, apiKey: key || undefined }) });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || '驗證失敗');
      const detail = provider === 'gemini'
        ? `文字 ${data.text ? 'OK' : '—'} · TTS ${data.tts ? 'OK' : '—'}`
        : provider === 'edge'
          ? `${data.voice} · ${data.bytes} bytes`
          : `${data.model || 'API'} OK`;
      setTestState({ provider, state: 'ok', message: `連線成功：${detail}` });
      if (provider === 'edge') updateSettings({ voiceEngine: 'edge-neural' });
    } catch (error) {
      setTestState({ provider, state: 'error', message: error instanceof Error ? error.message : '連線測試失敗' });
    }
  };

  return (
    <div className="page-shell settings-workspace max-w-6xl space-y-5">
      <WorkspacePageHeader eyebrow="SETTINGS" title="設定" description="外觀、主題、AI Provider、閱讀與自然語音集中在同一個 Workspace。"/>

      <div className="grid lg:grid-cols-[180px_minmax(0,1fr)] gap-6 items-start">
        <aside className="hidden lg:block sticky top-6">
          <nav className="space-y-1" aria-label="設定導覽">
            {navItems.map(item => {
              const Icon = item.icon;
              return <a key={item.id} href={`#${item.id}`} className="settings-nav-link"><Icon size={15} strokeWidth={1.9}/>{item.label}</a>;
            })}
          </nav>
        </aside>

        <div className="min-w-0 space-y-5">
          <section id="appearance" className="settings-section">
            <SettingsSectionHeader icon={Palette} title="外觀與主題" description="Core UI 固定不變；Theme 只改 Accent、Ambient、Hero Artwork 與少量 Micro Motion。"/>
            <div className="p-4 md:p-5 space-y-6">
              <div>
                <div className="text-sm font-semibold text-primary">顯示模式</div>
                <div className="grid sm:grid-cols-3 gap-2 mt-3">
                  {appearances.map(item => {
                    const Icon = item.icon;
                    const active = settings.appearance === item.id;
                    return (
                      <button key={item.id} type="button" aria-pressed={active} onClick={() => updateSettings({ appearance: item.id })} className="settings-choice" style={active ? { borderColor: 'color-mix(in srgb,var(--primary) 42%,var(--border))', background: 'color-mix(in srgb,var(--primary) 6%,var(--card))' } : undefined}>
                        <div className="flex items-center gap-2"><Icon size={16} strokeWidth={1.9} style={{ color: active ? 'var(--primary)' : 'var(--text-2)' }}/><span className="text-sm font-semibold text-primary">{item.label}</span>{active && <Check size={14} strokeWidth={1.9} className="ml-auto" style={{ color: 'var(--primary)' }}/>}</div>
                        <p className="text-xs mt-2 leading-5 text-tertiary">{item.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-end justify-between gap-4"><div><div className="text-sm font-semibold text-primary">Theme Pack</div><p className="text-xs mt-1 text-tertiary">同一套專業工作台，切換五種不同 Mood；Classic 保留為低干擾基準。</p></div><span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>{THEMES[settings.theme].label}</span></div>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">
                  {(Object.entries(THEMES) as [ThemeId, (typeof THEMES)[ThemeId]][]).map(([id, theme]) => {
                    const active = settings.theme === id;
                    return (
                      <button key={id} type="button" aria-pressed={active} onClick={() => updateSettings({ theme: id })} className={`theme-preview theme-preview-${id} rounded-xl border p-4 text-left overflow-hidden relative`} style={{ borderColor: active ? 'var(--primary)' : 'var(--border)' }}>
                        <div className="absolute inset-0 theme-preview-bg pointer-events-none"/>
                        <ThemeArtwork theme={id} className="theme-preview-art"/>
                        <div className="relative theme-preview-copy">
                          <div className="flex items-start gap-2"><div><div className="text-sm font-semibold text-primary">{theme.label}</div><div className="text-xs mt-1 text-tertiary">{theme.subtitle}</div></div>{active && <CircleCheck size={16} strokeWidth={1.9} className="ml-auto" style={{ color: 'var(--primary)' }}/>}</div>
                          <p className="text-xs leading-5 mt-3 text-secondary">{theme.description}</p>
                          <div className="text-xs mt-3 text-tertiary">{theme.vibe}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button type="button" aria-pressed={settings.enhancedMotion} onClick={() => updateSettings({ enhancedMotion: !settings.enhancedMotion })} className="settings-toggle-row">
                <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg surface flex items-center justify-center"><Activity size={16} strokeWidth={1.9} style={{ color: 'var(--primary)' }}/></div><div><div className="text-sm font-semibold text-primary">Micro Motion</div><div className="text-xs mt-1 text-tertiary">只保留 hover、active、progress 與短暫換頁回饋；減少動態效果設定仍優先。</div></div></div>
                <Toggle active={settings.enhancedMotion}/>
              </button>
            </div>
          </section>

          <section id="learning" className="settings-section">
            <SettingsSectionHeader icon={SlidersHorizontal} title="學習體驗" description="控制閱讀字級與 Mini Lecture 的連播行為。"/>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              <div className="settings-row"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg surface flex items-center justify-center"><Type size={16} strokeWidth={1.9}/></div><div><div className="text-sm font-semibold text-primary">閱讀字級</div><div className="text-xs mt-1 text-tertiary">法條、講解與題目同步調整</div></div></div><div className="flex gap-1 surface rounded-lg p-1">{(['small', 'medium', 'large'] as const).map(size => <button key={size} type="button" aria-pressed={settings.fontSize === size} onClick={() => updateSettings({ fontSize: size })} className={`min-w-10 px-3 py-1.5 rounded-md text-xs font-medium ${settings.fontSize === size ? 'text-white' : 'text-secondary'}`} style={settings.fontSize === size ? { background: 'var(--primary)' } : undefined}>{size === 'small' ? '小' : size === 'medium' ? '中' : '大'}</button>)}</div></div>
              <button type="button" aria-pressed={settings.autoPlayNext} onClick={() => updateSettings({ autoPlayNext: !settings.autoPlayNext })} className="settings-toggle-row"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg surface flex items-center justify-center"><Play size={16} strokeWidth={1.9}/></div><div><div className="text-sm font-semibold text-primary">聽課自動連播</div><div className="text-xs mt-1 text-tertiary">Mini Lecture 播放完成後自動進入下一條</div></div></div><Toggle active={settings.autoPlayNext}/></button>
            </div>
          </section>

          <section id="ai" className="settings-section">
            <SettingsSectionHeader icon={KeyRound} title="AI 老師" description="五路 BYOK Provider 與 Local Tutor 備援；API Key 只存在目前瀏覽器。"/>
            <div className="p-4 md:p-5 space-y-4">
              <div className="surface rounded-xl p-4 flex gap-3"><LockKeyhole size={17} strokeWidth={1.9} className="shrink-0 mt-0.5" style={{ color: 'var(--primary)' }}/><div><div className="text-sm font-semibold text-primary">Provider fallback</div><p className="text-xs leading-5 mt-1 text-secondary">依序嘗試 Gemini、Groq、Mistral、OpenRouter、Hugging Face；全部無 Key 或暫時失敗時，使用本條預生成教材回答。</p></div></div>

              <div className="grid md:grid-cols-2 gap-3">
                {([
                  { id: 'gemini' as AiProvider, label: 'Gemini Free', desc: 'AI 老師＋Gemini TTS', placeholder: 'Google AI Studio API Key', href: 'https://aistudio.google.com/apikey' },
                  { id: 'groq' as AiProvider, label: 'Groq Free', desc: '高速文字 AI · Free Plan', placeholder: 'Groq API Key', href: 'https://console.groq.com/keys' },
                  { id: 'mistral' as AiProvider, label: 'Mistral Free', desc: 'Free mode · 無需信用卡', placeholder: 'Mistral API Key', href: 'https://console.mistral.ai/api-keys' },
                  { id: 'openrouter' as AiProvider, label: 'OpenRouter Free', desc: '免費模型自動路由', placeholder: 'OpenRouter API Key', href: 'https://openrouter.ai/settings/keys' },
                  { id: 'huggingface' as AiProvider, label: 'Hugging Face', desc: 'Inference Providers 免費額度', placeholder: 'HF Access Token', href: 'https://huggingface.co/settings/tokens' },
                ]).map(provider => (
                  <div key={provider.id} className="surface rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3"><div><div className="text-sm font-semibold text-primary">{provider.label}</div><div className="text-xs mt-1 text-tertiary">{provider.desc}</div></div><span className="text-xs text-tertiary">{savedKeys[provider.id] ? '已保存' : '未設定'}</span></div>
                    <div className="relative mt-3"><input type={showProvider === provider.id ? 'text' : 'password'} value={apiKeys[provider.id]} onChange={event => { setApiKeys(previous => ({ ...previous, [provider.id]: event.target.value })); setTestState({ provider: null, state: 'idle', message: '' }); }} aria-label={`${provider.label} API Key`} placeholder={provider.placeholder} className="input-shell w-full rounded-lg px-3 py-2.5 pr-10 text-xs outline-none" autoComplete="off" spellCheck={false}/><button type="button" onClick={() => setShowProvider(showProvider === provider.id ? null : provider.id)} className="absolute right-1.5 top-1/2 -translate-y-1/2 icon-button !w-8 !h-8 border-0" aria-label={showProvider === provider.id ? `隱藏 ${provider.label} API Key` : `顯示 ${provider.label} API Key`}>{showProvider === provider.id ? <EyeOff size={14} strokeWidth={1.9}/> : <Eye size={14} strokeWidth={1.9}/>}</button></div>
                    {savedKeys[provider.id] && <div className="mt-2 text-xs text-tertiary">{maskApiKey(savedKeys[provider.id])}</div>}
                    <div className="grid grid-cols-2 gap-2 mt-3"><button type="button" onClick={() => void testProvider(provider.id)} disabled={testState.state === 'testing'} className="workspace-primary-action !min-h-9 !text-xs disabled:opacity-50">{testState.provider === provider.id && testState.state === 'testing' ? '測試中…' : '儲存＋測試'}</button><a href={provider.href} target="_blank" rel="noreferrer" className="workspace-secondary-action !min-h-9 !text-xs">取得 Key <ExternalLink size={12} strokeWidth={1.9}/></a></div>
                  </div>
                ))}
              </div>

              <div className="surface rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"><div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'color-mix(in srgb,var(--primary) 8%,transparent)' }}><Volume2 size={16} strokeWidth={1.9} style={{ color: 'var(--primary)' }}/></div><div className="flex-1"><div className="text-sm font-semibold text-primary">Edge Neural · 免 API Key</div><div className="text-xs mt-1 text-secondary">台灣 Natural 聲線已直接接到 Server TTS，可作為 Gemini TTS 的免費備援。</div></div><button type="button" onClick={() => void testProvider('edge')} disabled={testState.state === 'testing'} className="workspace-secondary-action disabled:opacity-50">測試語音連線</button></div>

              {testState.state !== 'idle' && <div className="rounded-xl border p-3 text-sm flex items-start gap-2 text-secondary" style={{ borderColor: testState.state === 'ok' ? 'color-mix(in srgb,var(--success) 38%,var(--border))' : testState.state === 'error' ? 'color-mix(in srgb,var(--danger) 38%,var(--border))' : 'var(--border)' }}>{testState.state === 'testing' ? <Loader2 size={15} strokeWidth={1.9} className="animate-spin shrink-0"/> : testState.state === 'ok' ? <CircleCheck size={15} strokeWidth={1.9} className="shrink-0" style={{ color: 'var(--success)' }}/> : <CircleAlert size={15} strokeWidth={1.9} className="shrink-0" style={{ color: 'var(--danger)' }}/>}<span>{testState.message}</span></div>}
            </div>
          </section>

          <section id="voice" className="settings-section">
            <SettingsSectionHeader icon={Volume2} title="自然語音" description="選擇 TTS 來源、老師聲線與語速，並直接試聽。"/>
            <div className="p-4 md:p-5 space-y-6">
              <div><div className="text-sm font-semibold text-primary">語音來源</div><div className="grid md:grid-cols-2 gap-2 mt-3">{engines.map(engine => { const EngineIcon = engine.icon; const active = settings.voiceEngine === engine.id; return <button key={engine.id} type="button" aria-pressed={active} onClick={() => updateSettings({ voiceEngine: engine.id })} className="settings-choice" style={active ? { borderColor: 'color-mix(in srgb,var(--primary) 42%,var(--border))', background: 'color-mix(in srgb,var(--primary) 6%,var(--card))' } : undefined}><div className="flex items-start gap-3"><EngineIcon size={17} strokeWidth={1.9} className="mt-0.5" style={{ color: active ? 'var(--primary)' : 'var(--text-2)' }}/><div className="flex-1"><div className="text-sm font-semibold text-primary">{engine.label}</div><div className="text-xs mt-1 leading-5 text-tertiary">{engine.desc}</div></div>{active && <Check size={15} strokeWidth={1.9} style={{ color: 'var(--primary)' }}/>}</div></button>; })}</div></div>

              <div><div className="text-sm font-semibold text-primary">老師聲線</div><div className="grid sm:grid-cols-3 gap-2 mt-3">{(Object.entries(VOICE_PRESETS) as [VoicePreset, (typeof VOICE_PRESETS)[VoicePreset]][]).map(([id, voice]) => { const active = settings.voicePreset === id; return <button key={id} type="button" aria-pressed={active} onClick={() => updateSettings({ voicePreset: id })} className="settings-choice" style={active ? { borderColor: 'color-mix(in srgb,var(--primary) 42%,var(--border))', background: 'color-mix(in srgb,var(--primary) 6%,var(--card))' } : undefined}><Volume2 size={16} strokeWidth={1.9} style={{ color: active ? 'var(--primary)' : 'var(--text-2)' }}/><div className="text-sm font-semibold mt-3 text-primary">{voice.label}</div><div className="text-xs mt-1 leading-5 text-tertiary">{voice.description}</div></button>; })}</div></div>

              <div className="settings-row !px-0 !py-0"><div><div className="text-sm font-semibold text-primary">語速</div><div className="text-xs mt-1 text-tertiary">初學建議 0.85–1.0x</div></div><div className="flex gap-1 surface rounded-lg p-1">{[0.85, 1, 1.15, 1.25].map(speed => <button key={speed} type="button" aria-pressed={settings.voiceSpeed === speed} onClick={() => updateSettings({ voiceSpeed: speed })} className={`px-3 py-1.5 rounded-md text-xs font-medium ${settings.voiceSpeed === speed ? 'text-white' : 'text-secondary'}`} style={settings.voiceSpeed === speed ? { background: 'var(--primary)' } : undefined}>{speed}x</button>)}</div></div>

              <div className="surface rounded-xl p-4"><div className="text-sm font-semibold mb-3 text-primary">即時試聽</div><AudioPlayer text={testText}/></div>
            </div>
          </section>

          <section id="data" className="settings-section">
            <SettingsSectionHeader icon={Shield} title="資料與防呆" description="本機進度、設定、API Key 與快取管理。"/>
            <div className="p-4 md:p-5">
              <ul className="space-y-2 text-sm leading-6 text-secondary"><li>2,399 條教材為預先生成資料，AI Drawer 僅用於追問或修正建議。</li><li>AI 音檔快取在 IndexedDB，減少重複生成。</li><li>Appearance、Theme、語音設定與五路 BYOK API Keys 都只保存在本機。</li></ul>
              <button type="button" onClick={() => { if (confirm('確定要清除所有本機進度、標記、API Key 與設定？此動作無法復原。')) { localStorage.clear(); location.reload(); } }} className="mt-5 min-h-10 px-4 rounded-lg border text-sm font-semibold inline-flex items-center gap-2" style={{ color: 'var(--danger)', borderColor: 'color-mix(in srgb,var(--danger) 35%,var(--border))', background: 'color-mix(in srgb,var(--danger) 5%,transparent)' }}><Trash2 size={15} strokeWidth={1.9}/> 清除所有本機資料</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SettingsSectionHeader({ icon: Icon, title, description }: { icon: typeof Palette; title: string; description: string }) {
  return <div className="px-4 md:px-5 py-4 border-b flex items-start gap-3" style={{ borderColor: 'var(--border)' }}><div className="w-9 h-9 rounded-lg surface flex items-center justify-center shrink-0"><Icon size={16} strokeWidth={1.9} style={{ color: 'var(--primary)' }}/></div><div><h2 className="text-base font-semibold text-primary">{title}</h2><p className="text-xs leading-5 mt-1 text-tertiary">{description}</p></div></div>;
}

function Toggle({ active }: { active: boolean }) {
  return <span className="w-11 h-6 rounded-full relative shrink-0 transition-colors" style={{ background: active ? 'var(--primary)' : 'var(--surface-strong)' }}><span className="w-4 h-4 bg-white rounded-full absolute top-1 transition-[left] duration-150" style={{ left: active ? '24px' : '4px' }}/></span>;
}
