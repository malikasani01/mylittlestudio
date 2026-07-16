import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hashPin } from "@/lib/pin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { pin } = await request.json();
  if (typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: "PIN must be 4 digits." }, { status: 400 });
  }

  const pinHash = await hashPin(pin);
  const { error } = await supabase
    .from("parent_users")
    .update({ pin_hash: pinHash })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
