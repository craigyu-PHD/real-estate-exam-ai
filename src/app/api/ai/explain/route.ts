import { NextResponse } from 'next/server';
import { lawsData } from '@/data/lawsData';
import { getArticleDetail } from '@/data/articleExplanations';

export const runtime = 'nodejs';

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


async function callMistral(apiKey: string, prompt: string) {
  const r = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2200,
    }),
    signal: AbortSignal.timeout(25000),
  });
  const raw = await r.text(); let data: OpenAiLikeResponse = {};
  try { data = JSON.parse(raw) as OpenAiLikeResponse; } catch {}
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!r.ok || !reply) throw new Error(data.error?.message || raw.slice(0, 240) || `HTTP ${r.status}`);
  return { reply, model: 'mistral-small-latest', provider: 'Mistral Free' };
}

async function callHuggingFace(apiKey: string, prompt: string) {
  const r = await fetch('https://router.huggingface.co/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b:groq',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1800,
    }),
    signal: AbortSignal.timeout(30000),
  });
  const raw = await r.text(); let data: OpenAiLikeResponse = {};
  try { data = JSON.parse(raw) as OpenAiLikeResponse; } catch {}
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!r.ok || !reply) throw new Error(data.error?.message || raw.slice(0, 240) || `HTTP ${r.status}`);
  return { reply, model: 'openai/gpt-oss-20b:groq', provider: 'Hugging Face' };
}

function section(context: string, label: string, nextLabels: string[]) {
  const start = context.indexOf(label);
  if (start < 0) return '';
  const from = start + label.length;
  const ends = nextLabels.map(next => context.indexOf(next, from)).filter(pos => pos >= 0);
  const end = ends.length ? Math.min(...ends) : context.length;
  return context.slice(from, end).trim();
}

function localTutor(question: string, lawName: string, articleId: string, articleText: string, teachingContext: string) {
  const one = section(teachingContext, '一句話：', ['B 白話解析：']);
  const explain = section(teachingContext, 'B 白話解析：', ['C 為什麼：']);
  const why = section(teachingContext, 'C 為什麼：', ['D 案例：']);
  const cases = section(teachingContext, 'D 案例：', ['易錯：']);
  const pitfalls = section(teachingContext, '易錯：', ['易混淆：', '考點：']);
  const confuse = section(teachingContext, '易混淆：', ['考點：']);
  const exam = section(teachingContext, '考點：', []);
  const head = `${lawName || '本法'}第 ${articleId || '?'} 條`;

  if (/白話|簡單|看不懂|再講/.test(question)) return { reply: `【${head}｜零基礎版】
${one || explain || articleText}

拆開來看：
${explain || '先確認誰受到本條規範、發生什麼條件，以及最後產生什麼法律效果。'}

你只要先記住：${one || exam || '先抓主體、要件與效果。'}`, provider: 'Local Tutor', model: 'local-material-v2' };
  if (/例子|案例|房仲|實務/.test(question)) return { reply: `【${head}｜情境案例】
${cases || explain || one}

套題時請依序問：人物是誰 → 發生什麼事 → 本條要件有沒有成立 → 法律效果是什麼。`, provider: 'Local Tutor', model: 'local-material-v2' };
  if (/為什麼|目的|理由/.test(question)) return { reply: `【${head}｜制度目的】
${why || explain || one}

考試上不要只背抽象口號，要把「法律想避免的現實問題」和條文手段一起記。`, provider: 'Local Tutor', model: 'local-material-v2' };
  if (/重要|幾星|必背/.test(question)) return { reply: `【${head}｜重要度判斷】
最低限度必記：${exam || one || explain}

常見失分點：${pitfalls || '題目會替換主體、期限、比例或法律效果，看到熟悉字眼仍要逐項核對。'}`, provider: 'Local Tutor', model: 'local-material-v2' };
  if (/搞混|混淆|比較|差別/.test(question)) return { reply: `【${head}｜易混淆整理】
${confuse || pitfalls || '先比較規範主體、成立要件、期限／比例與法律效果，不要只看條文關鍵字相似。'}

本條核心：${one || explain}`, provider: 'Local Tutor', model: 'local-material-v2' };
  if (/考試|出題|選擇題|怎麼考/.test(question)) return { reply: `【${head}｜國考模式】
${exam || explain || one}

常見陷阱：${pitfalls || '把主體、期限、比例或「得／應／不得」互換。'}

作答口訣：先圈主體，再找條件，最後確認法律效果。`, provider: 'Local Tutor', model: 'local-material-v2' };
  if (!articleText && !teachingContext) return { reply: '目前外部免費 AI 尚未連線，而本機 Tutor 需要一個明確法規與條號才能從正式教材回答。你可以直接問「民法第 758 條怎麼理解？」或先到學習中心打開任一條文再問我。', provider: 'Local Tutor', model: 'local-material-v2' };
  return { reply: `【${head}｜教材型回答】
重點：${one || explain || articleText}

白話：${explain || one}

為什麼：${why || '請把制度目的和法律效果一起理解。'}

案例：${cases || '把題目人物代入本條主體與要件逐步檢查。'}

考點：${exam || pitfalls || '注意主體、要件與效果。'}

目前是本機教材模式；若設定任一免費 AI Key，系統會優先交由外部模型延伸回答。`, provider: 'Local Tutor', model: 'local-material-v2' };
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

function resolveQuestionContext(question: string) {
  const law = lawsData.find(item => question.includes(item.name));
  if (!law) return null;
  const escaped = law.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const afterLaw = question.match(new RegExp(`${escaped}\\s*(?:第\\s*)?([0-9]+(?:-[0-9]+)*)\\s*(?:條)?`));
  const generic = question.match(/第\s*([0-9]+(?:-[0-9]+)*)\s*條/);
  const articleId = afterLaw?.[1] || generic?.[1];
  if (!articleId) return null;
  const detail = getArticleDetail(law.id, articleId);
  if (!detail) return null;
  const teachingContext = `一句話：${detail.oneLiner}\nB 白話解析：${detail.explanation}\nC 為什麼：${detail.why}\nD 案例：${detail.cases.map(c => `${c.title}：${c.content}`).join('\n')}\n易錯：${detail.pitfalls.join('；')}\n易混淆：${(detail.confuseWith || []).map(item => `${item.article}：${item.diff}`).join('；')}\n考點：${detail.examTips.join('；')}`;
  return { lawName: law.name, articleId, articleText: detail.articleText, teachingContext };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const keys = {
      gemini: process.env.GEMINI_API_KEY?.trim() || (typeof body?.apiKey === 'string' ? body.apiKey.trim() : '') || (typeof body?.keys?.gemini === 'string' ? body.keys.gemini.trim() : ''),
      groq: process.env.GROQ_API_KEY?.trim() || (typeof body?.keys?.groq === 'string' ? body.keys.groq.trim() : ''),
      mistral: process.env.MISTRAL_API_KEY?.trim() || (typeof body?.keys?.mistral === 'string' ? body.keys.mistral.trim() : ''),
      openrouter: process.env.OPENROUTER_API_KEY?.trim() || (typeof body?.keys?.openrouter === 'string' ? body.keys.openrouter.trim() : ''),
      huggingface: process.env.HF_TOKEN?.trim() || (typeof body?.keys?.huggingface === 'string' ? body.keys.huggingface.trim() : ''),
    };
    let articleText = typeof body?.articleText === 'string' ? body.articleText : '';
    const question = typeof body?.question === 'string' ? body.question.trim() : '';
    let lawName = typeof body?.lawName === 'string' ? body.lawName : '';
    let articleId = typeof body?.articleId === 'string' ? body.articleId : '';
    let teachingContext = typeof body?.teachingContext === 'string' ? body.teachingContext.slice(0, 10000) : '';
    if (!articleText && !teachingContext && question) {
      const resolved = resolveQuestionContext(question);
      if (resolved) ({ lawName, articleId, articleText, teachingContext } = resolved);
    }
    if (!question) return NextResponse.json({ error: '請輸入問題。', code: 'QUESTION_MISSING' }, { status: 400 });

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
    if (keys.mistral) {
      try { return NextResponse.json(await callMistral(keys.mistral, prompt)); }
      catch (e) { failures.push({ provider: 'Mistral', message: e instanceof Error ? e.message : 'failed' }); }
    }
    if (keys.openrouter) {
      try { return NextResponse.json(await callOpenRouter(keys.openrouter, prompt)); }
      catch (e) { failures.push({ provider: 'OpenRouter', message: e instanceof Error ? e.message : 'failed' }); }
    }
    if (keys.huggingface) {
      try { return NextResponse.json(await callHuggingFace(keys.huggingface, prompt)); }
      catch (e) { failures.push({ provider: 'Hugging Face', message: e instanceof Error ? e.message : 'failed' }); }
    }

    const local = localTutor(question, lawName, articleId, articleText, teachingContext);
    return NextResponse.json({ ...local, fallback: true, failures });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'AI 服務暫時無法使用', code: 'AI_REQUEST_FAILED' }, { status: 500 });
  }
}
