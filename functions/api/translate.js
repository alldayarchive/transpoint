export async function onRequestPost(context) {
  try {
    const { text, src, target, mode } = await context.request.json();

    const response = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are a high-tech linguistic transcription engine. 
          Respond ONLY with valid JSON. No markdown, no talk.

          CRITICAL SCRIPT RULE:
          - If mode is 'learn': You must write the pronunciation of the ${target} translation using ONLY the script of ${src}. 
            (Example: src:Korean, target:English -> "Hello" is written as "헬로우" in Hangul characters)
            (Example: src:Japanese, target:English -> "Hello" is written as "ハロー" in Katakana characters)
          
          - If mode is 'teach': You must write the pronunciation of the original ${src} text using ONLY the script of ${target}.
            (Example: src:Korean, target:English -> "안녕하세요" is written as "An-nyeong-ha-se-yo" in Latin alphabet)

          RETURN FORMAT: {"lines": [{"original": "...", "phonetic": "...", "translation": "..."}]}`
        },
        { role: 'user', content: `Analyze this based on the SCRIPT RULE. Mode: ${mode} | From: ${src} to ${target}. Input: ${text}` }
      ]
    });

    const raw = response?.response || "";
    const match = raw.match(/\{[\s\S]*\}/); // AI가 헛소리를 붙여도 JSON만 정확히 추출
    if (!match) throw new Error("AI Signal Failed");

    return new Response(match[0], {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
