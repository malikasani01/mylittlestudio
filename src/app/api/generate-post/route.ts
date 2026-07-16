import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePost } from "@/lib/ai/generatePost";
import type { AiMode } from "@/lib/types";

const VALID_MODES: AiMode[] = ["keepMyWords", "makeItClearer", "makeItMagical"];

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json();
  const transcript = typeof body.transcript === "string" ? body.transcript : "";
  const aiMode: AiMode = VALID_MODES.includes(body.aiMode) ? body.aiMode : "keepMyWords";
  const category = typeof body.category === "string" ? body.category : undefined;

  if (!transcript.trim()) {
    return NextResponse.json({ error: "Nothing was said yet." }, { status: 400 });
  }

  try {
    const post = await generatePost({ transcript, aiMode, category });
    return NextResponse.json(post);
  } catch {
    return NextResponse.json(
      { error: "I couldn't turn your words into a post right now. Your recording is still safe." },
      { status: 502 }
    );
  }
}
