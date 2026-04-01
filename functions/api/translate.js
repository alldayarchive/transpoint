export async function onRequestPost(context) {
  try {
    const { text, src, target, mode } = await context.request.json();
    const response = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are a professional lyric analyzer. You MUST output ONLY valid JSON.
          
          TASK: Process the input line by line.
          1. Translation: Translate to ${target}.
          2. Phonetic Rule (CRITICAL):
             - mode 'learn': Provide phonetic of the ${target} result using ${src} characters.
               (Ex: Source:KR, Target:EN -> "Hello" -> "헬로우")
             - mode 'teach': Provide phonetic of the ORIGINAL ${src} text using ${target} characters.
               (Ex: Source:JP, Target:KR -> "風の強さ" -> "카제노츠요사")
          
          FORMAT: {"lines": [{"original": "...", "phonetic": "...", "translation": "..."}]}`
        },
        { role: 'user', content: text }
      ]
    });
    const data = response.response || response;
    const final = typeof data === 'string' ? JSON.parse(data.replace(/```json|```/g, '').trim()) : data;
    return new Response(JSON.stringify(final), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
