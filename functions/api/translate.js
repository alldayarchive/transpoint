export async function onRequestPost(context) {
  try {
    const { text, src, target, mode } = await context.request.json();

    const response = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are a professional linguistic analyzer. Output ONLY valid JSON, no explanation, no markdown.
          
          FORMAT: {"lines": [{"original": "...", "phonetic": "...", "translation": "..."}]}
          
          PHONETIC RULES:
          - mode 'learn': Provide phonetic of the ${target} translation using the native script of ${src}.
            (Ex: src:KR, target:EN -> "Hello" is written as "헬로우" in Korean script)
          - mode 'teach': Provide phonetic of the original ${src} text using the native script of ${target}.
            (Ex: src:KR, target:EN -> "안녕하세요" is written as "Annyeong-haseyo" in English alphabet)`
        },
        { role: 'user', content: `Analyze in '${mode}' mode:\n\n${text}` }
      ]
    });

    const raw = response?.response || "";
    // 정규표현식으로 JSON 블록만 추출
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI failed to generate a valid data structure.");

    const parsed = JSON.parse(match[0]);
    // 데이터 구조 유효성 검사
    if (!parsed.lines) {
        // 단일 객체로 왔을 경우를 대비해 배열로 감싸줌
        parsed.lines = [parsed];
    }

    return new Response(JSON.stringify(parsed), {
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' 
      }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
