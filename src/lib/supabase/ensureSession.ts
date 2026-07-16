"use client";

import { createClient } from "@/lib/supabase/client";

// This app runs as one installed, trusted-device PWA per family — there's no
// need for the child (or parent) to sign in with an email. An anonymous
// Supabase session is created transparently on first launch and persists on
// the device; RLS policies key off its stable auth.uid() exactly like a real
// account would. The Parent Area PIN is the actual privacy gate.
export async function ensureSession() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) return session;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.session) throw error ?? new Error("Could not start a session.");
  return data.session;
}
