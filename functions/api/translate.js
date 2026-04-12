export async function onRequestPost(context) {
  try {
    const { text, src, target, mode } = await context.request.json();

    const response = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are a professional linguistic transcriber. You MUST output ONLY valid JSON. No markdown.
          
          CORE RULE: You are writing a "sounds-like" guide for someone who cannot read the other language's script.

          1. mode 'learn' (User's Perspective):
             - You are a ${src} speaker learning ${target}.
             - Write the pronunciation of the ${target} translation using ONLY ${src} characters.
             - EXAMPLE: src:Korean, target:English -> Translation: "Hello", Phonetic: "헬로우" (Hangul only!)
             - EXAMPLE: src:Japanese, target:English -> Translation: "Hello", Phonetic: "ハロー" (Katakana only!)

          2. mode 'teach' (Foreigner's Perspective):
             - You are showing a ${target} speaker how to say the original ${src} text.
             - Write the pronunciation of the original ${src} text using ONLY ${target} characters.
             - EXAMPLE: src:Korean, target:English -> Original: "안녕하세요", Phonetic: "Annyeong-haseyo" (Latin alphabet only!)

          FORMAT: {"lines": [{"original": "...", "phonetic": "...", "translation": "..."}]}`
        },
        { role: 'user', content: `Mode: ${mode}\nFrom: ${src} to ${target}\nText:\n${text}` }
      ]
    });

    const raw = response?.response || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI Signal Disruption");

    return new Response(match[0], {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
