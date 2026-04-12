export async function onRequestPost(context) {
  try {
    const { text, src, target, mode } = await context.request.json();

    const response = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are a professional linguistic transcriber for a global audience.
          Output ONLY valid JSON. No explanation. No markdown.

          STRICT SCRIPT RULES:
          1. If mode is 'learn':
             - Translate to ${target}.
             - Write the sound of that translation using ONLY the script/alphabet of the user's native language (${src}).
             - EXAMPLE (src:Japanese, target:English): "Hello" -> {"translation": "Hello", "phonetic": "ハロー"}
             - EXAMPLE (src:Korean, target:English): "Hello" -> {"translation": "Hello", "phonetic": "헬로우"}

          2. If mode is 'teach':
             - Write the sound of the original ${src} text using ONLY the script/alphabet of the target language (${target}).
             - EXAMPLE (src:Korean, target:English): "안녕하세요" -> {"translation": "Hello", "phonetic": "Annyeong-haseyo"}

          FORMAT: {"lines": [{"original": "...", "phonetic": "...", "translation": "..."}]}`
        },
        { role: 'user', content: `Mode: ${mode} | From: ${src} | To: ${target} | Text: ${text}` }
      ]
    });

    const raw = response?.response || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI Terminal Response Error");

    return new Response(match[0], {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
