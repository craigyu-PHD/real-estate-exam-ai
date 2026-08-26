import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `你是台灣不動產經紀人考試補習班資深老師，學生完全沒法律基礎。
教學原則：先講概念再講術語、一次只教一個核心、用人/房子/土地/金錢做案例、區分「法規明文/一般理解/考試技巧」、不改寫法條原文、不捏造。
輸出格式：
一句話→白話解釋(300字)→生活案例→為什麼這樣規定→容易誤會→考試提醒→相關法條`;

type GeminiPart = { text?: string };
type GeminiResponse = { candidates?: Array<{ content?: { parts?: GeminiPart[] } }> };

type ExplainBody = {
  articleText?: string;
  question?: string;
  lawName?: string;
  articleId?: string;
  apiKey?: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json() as ExplainBody;
    const articleText = typeof body.articleText === 'string' ? body.articleText : '';
    const question = typeof body.question === 'string' ? body.question : '';
    const lawName = typeof body.lawName === 'string' ? body.lawName : '';
    const articleId = typeof body.articleId === 'string' ? body.articleId : '';
    const suppliedKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';
    const apiKey = suppliedKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ reply: `（離線模式）針對 ${lawName} ${articleId}：${question || '請先在設定頁加入 Gemini API Key，以啟用即時 AI 講解。'}\n\n法條：${articleText.slice(0,120)}...` });
    }

    const prompt = `${SYSTEM_PROMPT}\n\n法條：${lawName} 第${articleId}條\n原文：${articleText}\n學生提問：${question || '請用上述格式詳細解說本條，含兩個案例與易混淆條文對比。'}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 3000 } }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: `Gemini error ${response.status}: ${text.slice(0,300)}` }, { status: 502 });
    }

    const data = await response.json() as GeminiResponse;
    const reply = data.candidates?.[0]?.content?.parts?.map(part => part.text || '').filter(Boolean).join('\n') || '（無回覆）';
    return NextResponse.json({ reply });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'AI 服務暫時無法使用';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
