export async function onRequestPost(context) {
  try {
    const { text, src, target, mode } = await context.request.json();

    const response = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are a high-tech linguistic terminal. You must output ONLY valid JSON. No explanation.
          
          TASK: Process input line by line.
          - mode 'learn': Provide phonetic reading of the ${target} translation using the native script of ${src}.
            (Ex: src:Korean, target:English -> "Hello" -> "헬로우" in Hangul)
          - mode 'teach': Provide phonetic reading of the original ${src} text using the native script of ${target}.
            (Ex: src:Korean, target:English -> "안녕하세요" -> "Annyeong-haseyo" in Latin alphabet)

          FORMAT: {"lines": [{"original": "...", "phonetic": "...", "translation": "..."}]}`
        },
        { role: 'user', content: `Mode: ${mode} | From: ${src} | To: ${target} | Text: ${text}` }
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
