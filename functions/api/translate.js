export async function onRequestPost(context) {
  try {
    const { text, src, target, mode } = await context.request.json();

    const response = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are a professional lyric analyzer. You must output ONLY valid JSON. 
          No markdown, no explanation.

          PHONETIC SCRIPT RULE (STRICT):
          - Mode 'learn': Provide the phonetic sound of the TRANSLATED text using the NATIVE SCRIPT of the SOURCE language (${src}).
            * Example (src:Korean, target:English): "Hello" -> "헬로우" (In Hangul)
            * Example (src:Japanese, target:English): "Hello" -> "ハロー" (In Katakana)
            * Example (src:Russian, target:English): "Hello" -> "Хеллоу" (In Cyrillic)
          
          - Mode 'teach': Provide the phonetic sound of the ORIGINAL text using the NATIVE SCRIPT of the TARGET language (${target}).
            * Example (src:Korean, target:English): "안녕하세요" -> "Annyeong-haseyo" (In Latin)
            * Example (src:Korean, target:Japanese): "안녕하세요" -> "アンニョンハセヨ" (In Katakana)

          FORMAT: {"lines": [{"original": "...", "phonetic": "...", "translation": "..."}]}`
        },
        { role: 'user', content: `Mode: ${mode}\nFrom: ${src}\nTo: ${target}\nText:\n${text}` }
      ]
    });

    const raw = response?.response || "";
    const match = raw.match(/\{[\s\S]*\}/); // AI가 설명을 붙여도 JSON만 추출
    if (!match) throw new Error("AI Terminal Failure");

    return new Response(match[0], {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
