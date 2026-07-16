import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { AiMode } from "@/lib/types";

export interface GeneratedPost {
  title: string;
  body: string;
  category: string;
  suggestedSticker: string;
  safetyFlag: boolean;
  safetyReason: string;
}

const SYSTEM_PROMPT =
  "You help an 8-year-old child turn her own spoken words into a short creative journal post. " +
  "Preserve her ideas, personality, and first-person voice. Use simple, age-appropriate language. " +
  "Do not invent events, facts, emotions, names, places, or details she did not provide. " +
  "Do not make the writing sound adult or overly polished. Avoid complex vocabulary. " +
  "Avoid public-sharing language. Return a suggested title and one short paragraph. " +
  "If the transcript describes immediate danger, self-harm, abuse, threats, sexual content, severe bullying, " +
  "someone asking for secrets or private pictures, or plans to meet a stranger, set safetyFlag to true, " +
  "explain briefly in safetyReason, and keep title/body minimal and neutral instead of playful.";

const MODE_PROMPTS: Record<AiMode, string> = {
  keepMyWords:
    "Make only minimal corrections to punctuation, repeated filler words, and obvious transcription mistakes.",
  makeItClearer:
    "Organize the child's words into a clear beginning, middle, and ending without adding new ideas.",
  makeItMagical:
    "Add light imagination and playful wording while keeping the child's original meaning and age-appropriate voice. " +
    "Do not invent major details. Do not overuse exclamation marks.",
};

const RESPONSE_SCHEMA = {
  name: "journal_post",
  description: "A generated journal post for a child's creative diary.",
  input_schema: {
    type: "object" as const,
    properties: {
      title: { type: "string" as const },
      body: { type: "string" as const },
      category: {
        type: "string" as const,
        enum: ["crafts", "stories", "fashion", "songs", "videos", "pictures", "other"],
      },
      suggestedSticker: { type: "string" as const },
      safetyFlag: { type: "boolean" as const },
      safetyReason: { type: "string" as const },
    },
    required: ["title", "body", "category", "suggestedSticker", "safetyFlag", "safetyReason"],
  },
};

export interface GeneratePostInput {
  transcript: string;
  aiMode: AiMode;
  category?: string;
}

// Real implementation, used when ANTHROPIC_API_KEY is set. Falls back to a
// deterministic mock so the flow still works offline / without a key.
export async function generatePost({
  transcript,
  aiMode,
  category,
}: GeneratePostInput): Promise<GeneratedPost> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return mockGeneratePost({ transcript, aiMode, category });
  }

  const anthropic = new Anthropic({ apiKey });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content:
          `Writing mode: ${MODE_PROMPTS[aiMode]}\n\n` +
          (category ? `Suggested category hint: ${category}\n\n` : "") +
          `Child's transcript:\n"""${transcript}"""`,
      },
    ],
    tools: [RESPONSE_SCHEMA],
    tool_choice: { type: "tool", name: RESPONSE_SCHEMA.name },
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return mockGeneratePost({ transcript, aiMode, category });
  }

  return toolUse.input as GeneratedPost;
}

function mockGeneratePost({ transcript, category }: GeneratePostInput): GeneratedPost {
  const trimmed = transcript.trim();
  const firstSentence = trimmed.split(/[.!?]/)[0] || trimmed;
  const title = firstSentence.slice(0, 40) || "My New Creation";
  return {
    title,
    body: trimmed || "Tell me about what you made!",
    category: category || "other",
    suggestedSticker: "sparkle",
    safetyFlag: false,
    safetyReason: "",
  };
}
