import Anthropic from "@anthropic-ai/sdk";
import { ANTHROPIC_MODEL } from "@/lib/constants";

function getAnthropicApiKey(): string {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing required environment variable: ANTHROPIC_API_KEY");
  }
  return apiKey;
}

let haikuClientInstance: Anthropic | null = null;
let sonnetClientInstance: Anthropic | null = null;

export function getHaikuClient(): Anthropic {
  if (!haikuClientInstance) {
    haikuClientInstance = new Anthropic({
      apiKey: getAnthropicApiKey(),
    });
  }
  return haikuClientInstance;
}

export function getSonnetClient(): Anthropic {
  if (!sonnetClientInstance) {
    sonnetClientInstance = new Anthropic({
      apiKey: getAnthropicApiKey(),
    });
  }
  return sonnetClientInstance;
}

export async function classifyWithHaiku(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const client = getHaikuClient();

  try {
    const response = await client.messages.create({
      model: ANTHROPIC_MODEL.HAIKU,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const firstBlock = response.content[0];
    if (firstBlock.type !== "text") {
      throw new Error("Unexpected response type from Haiku");
    }
    return firstBlock.text;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      throw new Error(
        `Haiku API error (${String(error.status)}): ${error.message}`
      );
    }
    throw error;
  }
}

export async function reasonWithSonnet(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const client = getSonnetClient();

  try {
    const response = await client.messages.create({
      model: ANTHROPIC_MODEL.SONNET,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const firstBlock = response.content[0];
    if (firstBlock.type !== "text") {
      throw new Error("Unexpected response type from Sonnet");
    }
    return firstBlock.text;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      throw new Error(
        `Sonnet API error (${String(error.status)}): ${error.message}`
      );
    }
    throw error;
  }
}

export { ANTHROPIC_MODEL };
