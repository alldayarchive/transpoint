export async function onRequestPost(context) {
  try {
    const { text, src, target, mode } = await context.request.json();

    const response = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are a linguistic expert.
          Task: Translate and provide specific phonetic readings.
          
          Logic:
          - If mode is 'target_phonetic': Provide the phonetic reading of the TRANSLATED text using the script of the ORIGINAL text. (e.g., Hello -> 안녕하세요 -> [안녕-하세-요])
          - If mode is 'source_phonetic': Provide the phonetic reading of the ORIGINAL text using the script of the TRANSLATED text. (e.g., 안녕하세요 -> Hello -> [An-nyeong-ha-se-yo])

          Return ONLY JSON:
          {"original": "${text}", "translation": "...", "phonetic": "..."}`
        },
        { role: 'user', content: text }
      ]
    });

    const result = response.response ? JSON.parse(response.response.replace(/```json|```/g, '')) : response;
    return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
