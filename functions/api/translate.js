export async function onRequestPost(context) {
  try {
    const { text, src, target, mode, includePhonetic } = await context.request.json();

    const response = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are a high-tech translation terminal. 
          Respond ONLY with valid JSON. No markdown. No explanation.

          TASK:
          1. Translate from ${src} to ${target}.
          2. Phonetic Rule:
             - Mode 'learn': Phonetic of TRANSLATED text using characters of ${src}. 
               (Ex: "안녕하세요" -> EN "Hello" -> Phonetic "헬로우")
             - Mode 'teach': Phonetic of ORIGINAL text using characters of ${target}. 
               (Ex: "안녕하세요" -> EN "Hello" -> Phonetic "An-nyeong-ha-se-yo")

          JSON FORMAT: {"translation": "...", "phonetic": "..."}`
        },
        { role: 'user', content: text }
      ]
    });

    // Cloudflare AI 응답 처리 최적화
    const data = response.response || response;
    const finalResult = typeof data === 'string' ? JSON.parse(data.replace(/```json|```/g, '').trim()) : data;

    return new Response(JSON.stringify(finalResult), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
