export async function onRequestPost(context) {
  try {
    const { text, src, target, mode } = await context.request.json();

    // Mistral 모델이 JSON을 더 잘 뱉으므로 모델 교체 제안 (llama도 작동하도록 파서 강화)
    const response = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are a professional linguistic analyzer. Output ONLY valid JSON. No explanation.
          FORMAT: {"lines": [{"original": "...", "phonetic": "...", "translation": "..."}]}
          - mode 'learn': phonetic = ${target} translation written in ${src} script
          - mode 'teach': phonetic = ${src} original written in ${target} script`
        },
        { role: 'user', content: `Analyze this text in ${mode} mode:\n\n${text}` }
      ]
    });

    const raw = response?.response || "";
    // 정규표현식으로 { } 사이의 내용만 추출 (철벽 방어)
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI Terminal provided invalid data structure: " + raw.slice(0, 100));
    
    const finalResult = JSON.parse(match[0]);

    return new Response(JSON.stringify(finalResult), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
