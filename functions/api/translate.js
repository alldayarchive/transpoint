export async function onRequestPost(context) {
  try {
    const { text, src, target, mode } = await context.request.json();

    const response = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are a linguistic transcription expert. Output ONLY valid JSON. 
          
          STRICT OPERATING RULES:
          1. mode 'learn':
             - Goal: Let a ${src} speaker pronounce the ${target} result.
             - Rule: Write the sound of the ${target} translation using the script of ${src}.
             - EXAMPLE (src:Korean, target:English): "Hello" -> translation is "Hello", phonetic is "헬로우" (Write in Korean script).

          2. mode 'teach':
             - Goal: Let a ${target} speaker pronounce the original ${src} text.
             - Rule: Write the sound of the original ${src} text using the script of ${target}.
             - EXAMPLE (src:Korean, target:English): "안녕하세요" -> translation is "Hello", phonetic is "Annyeong-haseyo" (Write in English script).

          Return ONLY JSON: {"lines": [{"original": "...", "phonetic": "...", "translation": "..."}]}`
        },
        { role: 'user', content: `Current Mode: ${mode} | From ${src} to ${target} | Text to analyze: ${text}` }
      ]
    });

    const raw = response?.response || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI Signal Failed");

    return new Response(match[0], {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
