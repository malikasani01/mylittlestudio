import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { transcribeAudio } from "@/lib/ai/transcribe";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("audio");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No audio file provided." }, { status: 400 });
  }

  try {
    const transcript = await transcribeAudio(file);
    return NextResponse.json({ transcript });
  } catch {
    return NextResponse.json(
      { error: "I couldn't hear that recording. Let's try again." },
      { status: 502 }
    );
  }
}
