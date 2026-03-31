export async function onRequestPost(context) {
  try {
    const { text, src, target, mode } = await context.request.json();

    const response = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are a professional linguist. Output ONLY valid JSON. No talk.
          
          TASK:
          1. Translate text from ${src} to ${target}.
          2. Provide PHONETIC reading based on "mode":
             - If mode is "learn": Phonetic of TRANSLATED text using characters of ${src}. 
               (Ex: KR "안녕하세요" -> EN "Hello" -> Phonetic "헬로우")
             - If mode is "teach": Phonetic of ORIGINAL text using characters of ${target}. 
               (Ex: KR "안녕하세요" -> EN "Hello" -> Phonetic "Annyeong-haseyo")

          FORMAT: {"original": "...", "translation": "...", "phonetic": "..."}`
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
