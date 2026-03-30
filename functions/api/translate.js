export async function onRequestPost(context) {
  try {
    const { text, target } = await context.request.json();

    const response = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are a translation expert. Translate to ${target}. 
          Return ONLY JSON. No talk. No markdown. 
          Format: {"original": "...", "translation": "...", "phonetic": "..."}`
        },
        { role: 'user', content: text }
      ]
    });

    // Cloudflare AI 모델에 따라 응답 구조가 다를 수 있어 안전하게 처리합니다.
    const result = response.response ? JSON.parse(response.response) : response;

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Check Binding or JSON Format" }), { status: 500 });
  }
}
