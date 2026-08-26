import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `你是台灣不動產經紀人考試的資深補習班老師。學生可能完全沒有法律基礎。
規則：
1. 法條原文視為唯一正式來源，不得改寫後冒充原文，也不得捏造不存在的條文。
2. 回答優先採「先講結論→拆主體/要件/效果→生活或地政實務案例→易錯點→考試提醒」。
3. 如果使用者正在看特定法條，所有回答都要以該條原文與既有教材為核心，不要求使用者再次複製貼上。
4. 不確定法義、實務見解或法規版本時，明確說不確定，建議回查官方法規，不要自行補造。
5. 使用繁體中文、台灣法律用語。不要用空泛的「維護交易秩序」帶過，必須說明制度實際解決的問題。
6. 回答要有教學感，但避免冗長前言。`;

type GeminiPart = { text?: string };
type GeminiResponse = { candidates?: { content?: { parts?: GeminiPart[] } }[]; error?: { message?: string } };
type OpenAiLikeResponse = { choices?: { message?: { content?: string } }[]; error?: { message?: string } };

type ProviderFailure = { provider: string; message: string };

async function callGemini(apiKey: string, prompt: string) {
  const models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];
  let lastError = '';
  for (const model of models) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.35, maxOutputTokens: 2600 } }),
      signal: AbortSignal.timeout(25000),
    });
    const raw = await r.text(); let data: GeminiResponse = {};
    try { data = JSON.parse(raw) as GeminiResponse; } catch {}
    if (r.ok) {
      const reply = data.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('\n').trim();
      if (reply) return { reply, model, provider: 'Gemini' };
      lastError = `${model}: 空回覆`;
    } else {
      lastError = data.error?.message || raw.slice(0, 240) || `HTTP ${r.status}`;
      if (![404, 429, 500, 502, 503].includes(r.status)) break;
    }
  }
  throw new Error(lastError || 'Gemini 暫時不可用');
}

async function callGroq(apiKey: string, prompt: string) {
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: prompt }],
      temperature: 0.35,
      max_completion_tokens: 2200,
      reasoning_effort: 'low',
      reasoning_format: 'hidden',
    }),
    signal: AbortSignal.timeout(25000),
  });
  const raw = await r.text(); let data: OpenAiLikeResponse = {};
  try { data = JSON.parse(raw) as OpenAiLikeResponse; } catch {}
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!r.ok || !reply) throw new Error(data.error?.message || raw.slice(0, 240) || `HTTP ${r.status}`);
  return { reply, model: 'openai/gpt-oss-20b', provider: 'Groq' };
}

async function callOpenRouter(apiKey: string, prompt: string) {
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://webapp-omega-ten-95.vercel.app',
      'X-Title': 'Real Estate Exam AI',
    },
    body: JSON.stringify({
      model: 'openrouter/free',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: prompt }],
      temperature: 0.35,
      max_tokens: 2200,
    }),
    signal: AbortSignal.timeout(30000),
  });
  const raw = await r.text(); let data: OpenAiLikeResponse = {};
  try { data = JSON.parse(raw) as OpenAiLikeResponse; } catch {}
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!r.ok || !reply) throw new Error(data.error?.message || raw.slice(0, 240) || `HTTP ${r.status}`);
  return { reply, model: 'openrouter/free', provider: 'OpenRouter Free' };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const keys = {
      gemini: process.env.GEMINI_API_KEY?.trim() || (typeof body?.apiKey === 'string' ? body.apiKey.trim() : '') || (typeof body?.keys?.gemini === 'string' ? body.keys.gemini.trim() : ''),
      groq: process.env.GROQ_API_KEY?.trim() || (typeof body?.keys?.groq === 'string' ? body.keys.groq.trim() : ''),
      openrouter: process.env.OPENROUTER_API_KEY?.trim() || (typeof body?.keys?.openrouter === 'string' ? body.keys.openrouter.trim() : ''),
    };
    const articleText = typeof body?.articleText === 'string' ? body.articleText : '';
    const question = typeof body?.question === 'string' ? body.question.trim() : '';
    const lawName = typeof body?.lawName === 'string' ? body.lawName : '';
    const articleId = typeof body?.articleId === 'string' ? body.articleId : '';
    const teachingContext = typeof body?.teachingContext === 'string' ? body.teachingContext.slice(0, 10000) : '';
    if (!question) return NextResponse.json({ error: '請輸入問題。', code: 'QUESTION_MISSING' }, { status: 400 });

    const hasAnyKey = Boolean(keys.gemini || keys.groq || keys.openrouter);
    if (!hasAnyKey) return NextResponse.json({
      error: '目前沒有可用的文字 AI API Key。請到設定頁連接 Gemini、Groq Free 或 OpenRouter Free；語音仍可使用免 Key 的 Edge Neural。',
      code: 'AI_KEYS_MISSING',
    }, { status: 401 });

    const context = lawName || articleId || articleText ? `【目前學習脈絡】\n法規：${lawName || '未指定'}\n條號：${articleId ? `第 ${articleId} 條` : '未指定'}\n正式法條原文：${articleText || '未提供'}\n既有教材：${teachingContext || '未提供'}` : '';
    const prompt = `${context}\n\n【學生問題】\n${question}`;
    const failures: ProviderFailure[] = [];

    if (keys.gemini) {
      try { return NextResponse.json(await callGemini(keys.gemini, `${SYSTEM_PROMPT}\n\n${prompt}`)); }
      catch (e) { failures.push({ provider: 'Gemini', message: e instanceof Error ? e.message : 'failed' }); }
    }
    if (keys.groq) {
      try { return NextResponse.json(await callGroq(keys.groq, prompt)); }
      catch (e) { failures.push({ provider: 'Groq', message: e instanceof Error ? e.message : 'failed' }); }
    }
    if (keys.openrouter) {
      try { return NextResponse.json(await callOpenRouter(keys.openrouter, prompt)); }
      catch (e) { failures.push({ provider: 'OpenRouter', message: e instanceof Error ? e.message : 'failed' }); }
    }

    return NextResponse.json({
      error: `已嘗試所有已設定的免費 API，但目前都不可用：${failures.map(f => `${f.provider}：${f.message}`).join('｜')}`,
      code: 'ALL_AI_PROVIDERS_FAILED', failures,
    }, { status: 502 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'AI 服務暫時無法使用', code: 'AI_REQUEST_FAILED' }, { status: 500 });
  }
}
