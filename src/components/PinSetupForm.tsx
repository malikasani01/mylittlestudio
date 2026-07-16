"use client";

import { useState } from "react";
import { ShieldPlus } from "lucide-react";
import { PrimaryButton } from "@/components/PrimaryButton";

export function PinSetupForm({ onDone }: { onDone: () => void }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pin.length !== 4) {
      setError("PIN must be 4 digits.");
      return;
    }
    if (pin !== confirmPin) {
      setError("PINs don't match.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/parent/set-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    setSaving(false);
    if (res.ok) {
      onDone();
      return;
    }
    setError("That didn't save. Please try again.");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6">
      <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-3xl bg-white p-6 text-center shadow-lg">
        <ShieldPlus size={32} className="text-ink/70" />
        <h2 className="font-heading text-xl font-bold text-ink">Create a Parent PIN</h2>
        <p className="font-round text-sm text-ink/70">This keeps the Parent Area private.</p>
        <form onSubmit={submit} className="flex w-full flex-col items-center gap-3">
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            placeholder="New PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            className="w-32 rounded-2xl border border-lilac/40 px-4 py-2 text-center font-round text-2xl tracking-[0.5em] outline-none focus:ring-2 focus:ring-lilac"
          />
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            placeholder="Confirm PIN"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
            className="w-32 rounded-2xl border border-lilac/40 px-4 py-2 text-center font-round text-2xl tracking-[0.5em] outline-none focus:ring-2 focus:ring-lilac"
          />
          {error && <p className="font-round text-sm text-ink/70">{error}</p>}
          <PrimaryButton type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save PIN"}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}
