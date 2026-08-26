import { NextResponse } from 'next/server';
import { synthesizeEdgeTTS } from '@/lib/server/edgeTts';

type Provider = 'gemini' | 'groq' | 'openrouter' | 'edge';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const provider = body?.provider as Provider;
    const supplied = typeof body?.apiKey === 'string' ? body.apiKey.trim() : '';
    if (provider === 'edge') {
      const result = await synthesizeEdgeTTS('自然語音連線正常。', 'warm');
      return NextResponse.json({ ok: result.audio.length > 1000, provider: 'Edge Neural', voice: result.voice, bytes: result.audio.length });
    }
    if (!supplied) return NextResponse.json({ ok: false, error: '請先輸入 API Key。' }, { status: 400 });

    if (provider === 'gemini') {
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=100', { headers: { 'x-goog-api-key': supplied }, cache: 'no-store', signal: AbortSignal.timeout(12000) });
      const raw = await r.text();
      if (!r.ok) return NextResponse.json({ ok:false,error: safeMessage(raw, r.status) }, { status:502 });
      const data = JSON.parse(raw) as { models?: { name?: string }[] };
      const names=(data.models||[]).map(x=>x.name||'');
      return NextResponse.json({ok:true,provider:'Gemini',text:names.some(n=>n.includes('gemini-2.5-flash')),tts:names.some(n=>n.includes('gemini-2.5-flash-preview-tts'))});
    }
    if (provider === 'groq') {
      const r=await fetch('https://api.groq.com/openai/v1/models',{headers:{Authorization:`Bearer ${supplied}`},cache:'no-store',signal:AbortSignal.timeout(12000)});
      const raw=await r.text(); if(!r.ok)return NextResponse.json({ok:false,error:safeMessage(raw,r.status)},{status:502});
      const data=JSON.parse(raw) as {data?:{id?:string}[]};
      return NextResponse.json({ok:true,provider:'Groq Free',model:(data.data||[]).some(x=>x.id==='openai/gpt-oss-20b')});
    }
    if (provider === 'openrouter') {
      const r=await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${supplied}`},body:JSON.stringify({model:'openrouter/free',messages:[{role:'user',content:'只回答 OK'}],max_tokens:4}),signal:AbortSignal.timeout(20000)});
      const raw=await r.text(); if(!r.ok)return NextResponse.json({ok:false,error:safeMessage(raw,r.status)},{status:502});
      return NextResponse.json({ok:true,provider:'OpenRouter Free',model:'openrouter/free'});
    }
    return NextResponse.json({ok:false,error:'unknown provider'},{status:400});
  } catch (error) {
    return NextResponse.json({ok:false,error:error instanceof Error?error.message:'test failed'},{status:502});
  }
}

function safeMessage(raw: string, status: number) {
  try { const j=JSON.parse(raw) as {error?:{message?:string}|string}; return typeof j.error==='string'?j.error:j.error?.message||`HTTP ${status}`; }
  catch { return raw.slice(0,200)||`HTTP ${status}`; }
}
