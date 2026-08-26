import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `你是台灣不動產經紀人考試的資深補習班老師。學生可能完全沒有法律基礎。
規則：
1. 法條原文視為唯一正式來源，不得改寫後冒充原文，也不得捏造不存在的條文。
2. 回答順序優先採「先講結論→白話拆解→房屋/土地生活案例→易錯點→考試提醒」。
3. 如果使用者正在看特定法條，所有回答都要以該條及提供的既有教材脈絡為核心，不要要求使用者再次複製貼上。
4. 不確定法義時明確說不確定，建議回查官方法規，不要自行補出實務見解。
5. 使用繁體中文、台灣法律用語，內容清楚但不要堆砌術語。`;

type GeminiPart = { text?: string };
type GeminiResponse = { candidates?: { content?: { parts?: GeminiPart[] } }[]; error?: { message?: string } };

async function callGemini(apiKey: string, prompt: string) {
  const models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];
  let lastError = '';
  for (const model of models) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.45, maxOutputTokens: 2600 },
      }),
      signal: AbortSignal.timeout(30000),
    });
    const raw = await r.text();
    let data: GeminiResponse = {};
    try { data = JSON.parse(raw) as GeminiResponse; } catch {}
    if (r.ok) {
      const reply = data.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('\n').trim();
      if (reply) return { reply, model };
      lastError = `${model}: Gemini 回傳空內容`;
    } else {
      const message = data.error?.message || raw.slice(0, 240) || `HTTP ${r.status}`;
      lastError = `${model}: ${message}`;
      if (![404, 429, 500, 502, 503].includes(r.status)) break;
    }
  }
  throw new Error(lastError || 'Gemini 服務沒有可用回覆');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const suppliedKey = typeof body?.apiKey === 'string' ? body.apiKey.trim() : '';
    const apiKey = process.env.GEMINI_API_KEY?.trim() || suppliedKey;
    const articleText = typeof body?.articleText === 'string' ? body.articleText : '';
    const question = typeof body?.question === 'string' ? body.question.trim() : '';
    const lawName = typeof body?.lawName === 'string' ? body.lawName : '';
    const articleId = typeof body?.articleId === 'string' ? body.articleId : '';
    const teachingContext = typeof body?.teachingContext === 'string' ? body.teachingContext.slice(0, 8000) : '';

    if (!apiKey) {
      return NextResponse.json({
        error: '尚未設定 Gemini API Key。請到「設定 → Gemini API」完成連線，或由網站管理端設定 GEMINI_API_KEY。',
        code: 'GEMINI_KEY_MISSING',
      }, { status: 401 });
    }
    if (!question) return NextResponse.json({ error: '請輸入問題。', code: 'QUESTION_MISSING' }, { status: 400 });

    const context = lawName || articleId || articleText ? `\n\n【目前學習脈絡】\n法規：${lawName || '未指定'}\n條號：${articleId ? `第 ${articleId} 條` : '未指定'}\n正式法條原文：${articleText || '未提供'}\n既有教材：${teachingContext || '未提供'}` : '';
    const prompt = `${SYSTEM_PROMPT}${context}\n\n【學生問題】\n${question}`;
    const result = await callGemini(apiKey, prompt);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI 服務暫時無法使用';
    console.error('Gemini explain failed:', message);
    return NextResponse.json({ error: `Gemini 連線失敗：${message}`, code: 'GEMINI_REQUEST_FAILED' }, { status: 502 });
  }
}
