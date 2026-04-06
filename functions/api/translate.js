export async function onRequestPost(context) {
  try {
    const { text, src, target, mode } = await context.request.json();

    const response = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are a world-class linguistic transcriber. You MUST output ONLY valid JSON. No talk. No markdown.

          STRICT PHONETIC RULES:
          1. mode 'learn' (The user wants to read the translation):
             - Translate "${text}" to ${target}.
             - Write the PRONUNCIATION of the ${target} result using the SCRIPT/ALPHABET of ${src}.
             - EXAMPLE (src:Korean, target:English): "Hello" -> "헬로우" (Write in Hangul)
             - EXAMPLE (src:Japanese, target:English): "Hello" -> "ハロー" (Write in Katakana)

          2. mode 'teach' (The user wants to show their sound to foreigners):
             - Translate "${text}" to ${target}.
             - Write the PRONUNCIATION of the original ${src} text using the SCRIPT/ALPHABET of ${target}.
             - EXAMPLE (src:Korean, target:English): "안녕하세요" -> "Annyeong-haseyo" (Write in Latin alphabet)

          RETURN FORMAT: {"lines": [{"original": "...", "phonetic": "...", "translation": "..."}]}`
        },
        { role: 'user', content: `Mode: ${mode} | From: ${src} | To: ${target} | Text: ${text}` }
      ]
    });

    const raw = response?.response || "";
    const match = raw.match(/\{[\s\S]*\}/); // AI의 부가 설명을 잘라내고 JSON만 추출
    if (!match) throw new Error("AI Terminal Response Error");

    return new Response(match[0], {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
