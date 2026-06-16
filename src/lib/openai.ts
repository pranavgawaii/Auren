import OpenAI from "openai";
import { EMBEDDING_DIMENSIONS } from "@/lib/constants";

const EMBEDDING_MODEL = "text-embedding-ada-002";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing required environment variable: OPENAI_API_KEY");
  return new OpenAI({ apiKey });
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getOpenAIClient();
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.replace(/\n/g, " ").trim().slice(0, 8000),
  });
  const embedding = response.data[0]?.embedding;
  if (!embedding || embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(`Expected ${EMBEDDING_DIMENSIONS}-dim embedding, got ${embedding?.length ?? 0}`);
  }
  return embedding;
}
