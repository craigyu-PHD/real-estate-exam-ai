import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { articleText, question } = await req.json();

    // 這裡將串接 @google/genai 或直接呼叫 Gemini REST API
    // 由於我們只是先建立骨架，所以先回傳 mock response
    
    // const apiKey = process.env.GEMINI_API_KEY;
    // ... (呼叫 Gemini 的邏輯)

    const mockResponse = `（這是來自 Vercel Function 的模擬回覆）\n\n針對法條「${articleText.substring(0, 10)}...」的問題：\n${question}\n\n這部分主要是因為...（AI 的解釋）`;

    return NextResponse.json({ reply: mockResponse });
  } catch (error) {
    console.error('AI Error:', error);
    return NextResponse.json({ error: 'AI 服務暫時無法使用' }, { status: 500 });
  }
}
