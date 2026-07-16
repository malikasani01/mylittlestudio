import "server-only";
import OpenAI from "openai";

// Real implementation, used when OPENAI_API_KEY is set. Falls back to a
// placeholder transcript so the recording flow is still clickable offline.
export async function transcribeAudio(file: File): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return "I made something today and I want to tell you about it.";
  }

  const openai = new OpenAI({ apiKey });
  const result = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
  });

  return result.text;
}
