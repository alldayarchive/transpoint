export async function onRequestPost(context) {
  try {
    const { text, src, target, mode } = await context.request.json();
    const response = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are a professional lyric and linguistic analyzer. Output ONLY valid JSON.
          TASK: Translate and provide phonetics for EACH LINE.
          
          LOGIC:
          - 'learn': Read ${target} using ${src} characters. (Ex: "Hello" -> "헬로우")
          - 'teach': Read original ${src} using ${target} characters. (Ex: "안녕하세요" -> "Annyeong")
          
          FORMAT: {"lines": [{"original": "line1", "translation": "trans1", "phonetic": "phon1"}, ...]}`
        },
        { role: 'user', content: text }
      ]
    });
    const data = response.response || response;
    const finalResult = typeof data === 'string' ? JSON.parse(data.replace(/```json|```/g, '').trim()) : data;
    return new Response(JSON.stringify(finalResult), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
