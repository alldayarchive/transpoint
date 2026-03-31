export async function onRequestPost(context) {
  try {
    const { text, src, target, mode, includePhonetic } = await context.request.json();

    const response = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are a high-end linguistic processor. 
          Task: Translate text and provide phonetic reading.

          PHONETIC RULE (EXTREMELY IMPORTANT):
          - Mode 'learn': Write how the TRANSLATED text sounds using ${src} characters. 
            Example: (Source: Korean, Target: English) "안녕하세요" -> EN "Hello" -> Phonetic "헬로우"
          - Mode 'teach': Write how the ORIGINAL text sounds using ${target} characters. 
            Example: (Source: Korean, Target: English) "안녕하세요" -> EN "Hello" -> Phonetic "An-nyeong-ha-se-yo"

          If includePhonetic is false, return phonetic as an empty string.

          Return ONLY JSON:
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
