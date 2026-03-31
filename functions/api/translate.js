export async function onRequestPost(context) {
  try {
    const { text, src, target, mode } = await context.request.json();

    const response = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are a high-tech translation engine. 
          Task: Translate the text and provide phonetic readings based on the requested mode.

          Logic Rules:
          1. mode === 'learn': Provide phonetic of the TRANSLATED text using ${src} characters.
             (Ex: KR "안녕하세요" -> EN "Hello" -> Phonetic "헬로우")
          2. mode === 'teach': Provide phonetic of the ORIGINAL text using ${target} characters.
             (Ex: KR "안녕하세요" -> EN "Hello" -> Phonetic "Annyeong-haseyo")

          Return ONLY a valid JSON object:
          {"original": "${text}", "translation": "...", "phonetic": "..."}`
        },
        { role: 'user', content: text }
      ]
    });

    const data = response.response || response;
    const finalResult = typeof data === 'string' ? JSON.parse(data.replace(/```json|```/g, '')) : data;

    return new Response(JSON.stringify(finalResult), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
