"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { PrimaryButton } from "@/components/PrimaryButton";

interface ParentPinModalProps {
  heading?: string;
  onVerified: () => void;
  onCancel?: () => void;
}

export function ParentPinModal({ heading = "Grown-Ups Only", onVerified, onCancel }: ParentPinModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [needsSetup, setNeedsSetup] = useState(false);
  const [checking, setChecking] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setChecking(true);
    setError("");
    const res = await fetch("/api/parent/verify-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    const data = await res.json();
    setChecking(false);
    if (res.ok) {
      onVerified();
      return;
    }
    if (data.needsSetup) setNeedsSetup(true);
    setError(data.error ?? "That's not right.");
    setPin("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6">
      <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-3xl bg-white p-6 text-center shadow-lg">
        <ShieldCheck size={32} className="text-ink/70" />
        <h2 className="font-heading text-xl font-bold text-ink">{heading}</h2>

        {needsSetup ? (
          <p className="font-round text-sm text-ink/70">
            No PIN has been set up yet. Go to Parent Settings to create one.
          </p>
        ) : (
          <form onSubmit={submit} className="flex w-full flex-col items-center gap-3">
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="w-32 rounded-2xl border border-lilac/40 px-4 py-2 text-center font-round text-2xl tracking-[0.5em] outline-none focus:ring-2 focus:ring-lilac"
              autoFocus
            />
            {error && <p className="font-round text-sm text-ink/70">{error}</p>}
            <PrimaryButton type="submit" disabled={pin.length !== 4 || checking}>
              {checking ? "Checking…" : "Enter"}
            </PrimaryButton>
          </form>
        )}

        {onCancel && (
          <button onClick={onCancel} className="font-round text-sm text-ink/50 underline">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
