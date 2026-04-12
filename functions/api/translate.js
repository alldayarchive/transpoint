export async function onRequestPost(context) {
  try {
    const { text, src, target, mode } = await context.request.json();

    const response = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are a world-class linguistic analyzer. Your goal is to provide a phonetic transcription that a native speaker of the ${mode === 'learn' ? src : target} language can read.

          STRICT SCRIPT RULES:
          1. mode 'learn':
             - Translate to ${target}.
             - Write the pronunciation of the ${target} translation using ONLY ${src} characters.
             - Example (src:Korean, target:English): "Hello" -> "헬로우" (MUST be in Hangul)
             - Example (src:Japanese, target:English): "Hello" -> "ハロー" (MUST be in Katakana)

          2. mode 'teach':
             - Translate to ${target}.
             - Write the pronunciation of the original ${src} text using ONLY ${target} characters.
             - Example (src:Korean, target:English): "안녕하세요" -> "Annyeong-haseyo" (MUST be in Latin/English script)

          Return ONLY a valid JSON object:
          {"lines": [{"original": "...", "phonetic": "...", "translation": "..."}]}`
        },
        { role: 'user', content: `Mode: ${mode}\nFrom: ${src} to ${target}\nInput: ${text}` }
      ]
    });

    const raw = response?.response || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI Protocol Error");

    return new Response(match[0], {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
