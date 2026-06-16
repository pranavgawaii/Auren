export async function reasonWithGemini(
  systemInstruction: string,
  userMessage: string,
  responseMimeType: "application/json" | "text/plain" = "application/json",
  maxRetries = 3
): Promise<string> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openrouter/free", // Using free model on OpenRouter
          messages: [
            { role: "system", content: systemInstruction + "\nIMPORTANT: RETURN ONLY VALID JSON. Do not include markdown codeblocks." },
            { role: "user", content: userMessage }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      let text = data.choices[0].message.content;
      
      // Highly robust JSON extractor for free models that often include conversational wrapper text
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
        text = text.substring(firstBrace, lastBrace + 1);
      } else {
        text = text.replace(/^```(json)?/, "").replace(/```$/, "").trim();
      }
      
      return text;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const isRateLimit =
        lastError.message.includes("429") ||
        lastError.message.toLowerCase().includes("quota") ||
        lastError.message.toLowerCase().includes("rate");

      if (isRateLimit && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`[OpenRouter] Rate limited. Retry ${attempt}/${maxRetries} in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        break;
      }
    }
  }

  console.error("OpenRouter API Error after retries:", lastError);
  throw new Error(
    `AI error: ${lastError instanceof Error ? lastError.message : String(lastError)}`
  );
}
