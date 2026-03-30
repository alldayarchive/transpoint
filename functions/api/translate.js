export async function onRequestPost(context) {
  try {
    const { text, target } = await context.request.json();

    // Cloudflare Workers AI 호출 (무료 모델)
    const response = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the given text to ${target}. 
          IMPORTANT: Return ONLY a valid JSON object. 
          Format: {"original": "source text", "translation": "translated text", "phonetic": "pronunciation in user's native language"}`
        },
        { role: 'user', content: text }
      ]
    });

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
