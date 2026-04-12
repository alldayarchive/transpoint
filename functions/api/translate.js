export async function onRequestPost(context) {
  try {
    const { text, src, target, mode } = await context.request.json();

    const response = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: `You are a professional linguistic transcriber. 
          STRICT SCRIPT ENFORCEMENT:
          
          1. mode 'learn':
             - Goal: Write how the ${target} translation SOUNDS.
             - Rule: Use ONLY the script/alphabet of ${src}. 
             - DO NOT use any Latin/English letters if ${src} is not English.
             - Example (src:Korean, target:English): "Hello" -> {"translation": "Hello", "phonetic": "헬로우"}
             - Example (src:Japanese, target:English): "Hello" -> {"translation": "Hello", "phonetic": "ハロー"}

          2. mode 'teach':
             - Goal: Write how the original ${src} SOUNDS for a ${target} speaker.
             - Rule: Use ONLY the script/alphabet of ${target}.
             - Example (src:Korean, target:English): "안녕하세요" -> {"translation": "Hello", "phonetic": "Annyeong-haseyo"}

          Output ONLY valid JSON. No explanation.
          FORMAT: {"lines": [{"original": "...", "phonetic": "...", "translation": "..."}]}`
        },
        { role: 'user', content: `Mode: ${mode} | From: ${src} | To: ${target} | Text: ${text}` }
      ]
    });

    const raw = response?.response || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI Terminal Failure");

    return new Response(match[0], {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
