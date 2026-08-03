"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Pause, Play, Square, RotateCcw } from "lucide-react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { pickAudioFormat } from "@/lib/recording";

interface VoiceRecorderProps {
  maxSeconds?: number;
  onDone: (blob: Blob) => void;
}

type RecordState = "idle" | "recording" | "paused" | "stopped";

export function VoiceRecorder({ maxSeconds = 180, onDone }: VoiceRecorderProps) {
  const [state, setState] = useState<RecordState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      timerRef.current && clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function startTimer() {
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= maxSeconds) {
          stopRecording();
          return maxSeconds;
        }
        return s + 1;
      });
    }, 1000);
  }

  async function startRecording() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const { mimeType } = pickAudioFormat();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        // Use the recorder's real mime type so the blob is labelled correctly
        // (iOS records mp4, not webm) for playback, upload, and transcription.
        const type = recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        setAudioUrl(URL.createObjectURL(blob));
        streamRef.current?.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setSeconds(0);
      setState("recording");
      startTimer();
    } catch {
      setError("I couldn't hear that recording. Let's try again.");
    }
  }

  function pauseRecording() {
    mediaRecorderRef.current?.pause();
    timerRef.current && clearInterval(timerRef.current);
    setState("paused");
  }

  function resumeRecording() {
    mediaRecorderRef.current?.resume();
    startTimer();
    setState("recording");
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    timerRef.current && clearInterval(timerRef.current);
    setState("stopped");
  }

  function recordAgain() {
    setAudioUrl(null);
    setSeconds(0);
    setState("idle");
  }

  function getBlobAndContinue() {
    fetch(audioUrl!)
      .then((r) => r.blob())
      .then(onDone);
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="flex h-16 items-end gap-1" aria-hidden>
        {state === "recording" &&
          Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="w-2 animate-pulse rounded-full bg-pink"
              style={{ height: `${12 + ((i * 37) % 40)}px`, animationDelay: `${i * 80}ms` }}
            />
          ))}
        {state !== "recording" && <span className="font-round text-sm text-ink/40">&nbsp;</span>}
      </div>

      <p className="font-round text-2xl font-bold text-ink tabular-nums">
        {mm}:{ss}
      </p>

      {error && <p className="font-round text-sm text-ink/70">{error}</p>}

      {state === "idle" && (
        <button
          onClick={startRecording}
          aria-label="Start recording"
          className="flex h-20 w-20 items-center justify-center rounded-full bg-pink shadow-md hover:bg-pink/80"
        >
          <Mic size={32} className="text-ink" />
        </button>
      )}

      {(state === "recording" || state === "paused") && (
        <div className="flex items-center gap-4">
          {state === "recording" ? (
            <button
              onClick={pauseRecording}
              aria-label="Pause"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-lilac/40"
            >
              <Pause size={22} />
            </button>
          ) : (
            <button
              onClick={resumeRecording}
              aria-label="Resume"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-lilac/40"
            >
              <Play size={22} />
            </button>
          )}
          <button
            onClick={stopRecording}
            aria-label="Stop"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-pink shadow-md"
          >
            <Square size={24} className="text-ink" />
          </button>
        </div>
      )}

      {state === "stopped" && audioUrl && (
        <div className="flex flex-col items-center gap-4">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls src={audioUrl} className="w-64" />
          <div className="flex gap-3">
            <PrimaryButton variant="secondary" icon={RotateCcw} onClick={recordAgain}>
              Record Again
            </PrimaryButton>
            <PrimaryButton onClick={getBlobAndContinue}>Use This Recording</PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}
