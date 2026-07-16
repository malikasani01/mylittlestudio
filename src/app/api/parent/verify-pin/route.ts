import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyPin } from "@/lib/pin";

const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 30;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { pin } = await request.json();

  const { data: parentUser, error: fetchError } = await supabase
    .from("parent_users")
    .select("pin_hash, failed_pin_attempts, pin_locked_until")
    .eq("id", user.id)
    .single();

  if (fetchError || !parentUser) {
    return NextResponse.json({ error: "Could not check the PIN." }, { status: 500 });
  }

  if (parentUser.pin_locked_until && new Date(parentUser.pin_locked_until) > new Date()) {
    const secondsLeft = Math.ceil(
      (new Date(parentUser.pin_locked_until).getTime() - Date.now()) / 1000
    );
    return NextResponse.json(
      { error: `Too many tries. Try again in ${secondsLeft}s.`, locked: true, secondsLeft },
      { status: 429 }
    );
  }

  if (!parentUser.pin_hash || typeof pin !== "string") {
    return NextResponse.json({ error: "No PIN has been set up yet.", needsSetup: true }, { status: 400 });
  }

  const isValid = await verifyPin(pin, parentUser.pin_hash);

  if (isValid) {
    await supabase
      .from("parent_users")
      .update({ failed_pin_attempts: 0, pin_locked_until: null })
      .eq("id", user.id);
    return NextResponse.json({ ok: true });
  }

  const attempts = parentUser.failed_pin_attempts + 1;
  const lockedUntil =
    attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_SECONDS * 1000).toISOString() : null;

  await supabase
    .from("parent_users")
    .update({ failed_pin_attempts: lockedUntil ? 0 : attempts, pin_locked_until: lockedUntil })
    .eq("id", user.id);

  if (lockedUntil) {
    return NextResponse.json(
      { error: `Too many tries. Try again in ${LOCK_SECONDS}s.`, locked: true, secondsLeft: LOCK_SECONDS },
      { status: 429 }
    );
  }

  return NextResponse.json(
    { error: "That's not right.", attemptsLeft: MAX_ATTEMPTS - attempts },
    { status: 401 }
  );
}
