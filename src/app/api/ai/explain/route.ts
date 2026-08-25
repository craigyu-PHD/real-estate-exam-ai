import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `你是台灣不動產經紀人考試補習班資深老師，學生完全沒法律基礎。
教學原則：先講概念再講術語、一次只教一個核心、用人/房子/土地/金錢做案例、區分「法規明文/一般理解/考試技巧」、不改寫法條原文、不捏造。
輸出格式：
一句話→白話解釋(300字)→生活案例→為什麼這樣規定→容易誤會→考試提醒→相關法條`;

export async function POST(req: Request) {
  try {
    const { articleText, question, lawName, articleId } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: `（離線模擬）針對 ${lawName || ''} ${articleId || ''}：${question || '請先設定 GEMINI_API_KEY 以啟用真實 AI 講解。'}\n\n法條：${(articleText||'').slice(0,120)}...` });
    }
    const prompt = `${SYSTEM_PROMPT}\n\n法條：${lawName || ''} 第${articleId || ''}條\n原文：${articleText}\n學生提問：${question || '請用上述格式詳細解說本條，越詳細越好，含兩個案例與易混淆條文對比。'}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 3000 } })
    });
    if (!r.ok) {
      const t = await r.text();
      return NextResponse.json({ error: `Gemini error ${r.status}: ${t.slice(0,300)}` }, { status: 502 });
    }
    const j: any = await r.json();
    const reply = j?.candidates?.[0]?.content?.parts?.map((p:any)=>p.text).join('\n') || '（無回覆）';
    return NextResponse.json({ reply });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'AI 服務暫時無法使用' }, { status: 500 });
  }
}
