export async function reasonWithAI(
  systemInstruction: string,
  userMessage: string,
  _responseMimeType: "application/json" | "text/plain" = "application/json",
  maxRetries = 3
): Promise<string> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY environment variable is missing.");
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", // Groq free tier — 14,400 req/day, 128k context, fastest inference
          messages: [
            { role: "system", content: systemInstruction + "\nIMPORTANT: RETURN ONLY VALID JSON. Do not include markdown codeblocks." },
            { role: "user", content: userMessage }
          ],
          temperature: 0.2,
          response_format: { type: "json_object" }, // Enforce JSON output natively
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        // 413 means the prompt itself is over the per-minute token cap — retrying the
        // same payload can only fail again, so say what's actually wrong.
        if (response.status === 413) {
          throw new Error(
            `Groq HTTP 413: prompt exceeds the token-per-minute limit. Trim the context being sent (email body / chat history). ${errorText}`
          );
        }
        throw new Error(`Groq HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      let text: string = data.choices?.[0]?.message?.content ?? "";
      
      // Robust JSON extractor — free models often wrap output in prose
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
        console.warn(`[Groq] Rate limited. Retry ${attempt}/${maxRetries} in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        break;
      }
    }
  }

  console.error("Groq API Error after retries:", lastError);
  throw new Error(
    `AI error: ${lastError instanceof Error ? lastError.message : String(lastError)}`
  );
}
