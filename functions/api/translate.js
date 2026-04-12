export async function onRequestPost(context) {
  try {
    const { text, src, target, mode } = await context.request.json();

    const response = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are a professional linguistic transcriber. Output ONLY valid JSON.
          
          TASK:
          1. Translate from ${src} to ${target}.
          2. Phonetic Rule (STRICT):
             - mode 'learn': Provide phonetic of the ${target} result using ONLY the script of ${src}.
               (Ex: src:Korean, target:English -> "Hello" -> "헬로우")
               (Ex: src:Japanese, target:English -> "Hello" -> "ハロー")
             - mode 'teach': Provide phonetic of the original ${src} text using ONLY the script of ${target}.
               (Ex: src:Korean, target:English -> "안녕하세요" -> "Annyeong-haseyo")

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
