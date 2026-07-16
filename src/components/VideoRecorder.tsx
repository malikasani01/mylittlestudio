"use client";

import { useEffect, useRef, useState } from "react";
import { Video, Square, RotateCcw } from "lucide-react";
import { PrimaryButton } from "@/components/PrimaryButton";

interface VideoRecorderProps {
  maxSeconds?: number;
  onDone: (blob: Blob) => void;
}

export function VideoRecorder({ maxSeconds = 60, onDone }: VideoRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      timerRef.current && clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function startRecording() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setVideoUrl(URL.createObjectURL(blob));
        streamRef.current?.getTracks().forEach((t) => t.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
      };
      recorder.start();
      recorderRef.current = recorder;
      setSeconds(0);
      setRecording(true);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= maxSeconds) {
            stopRecording();
            return maxSeconds;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      setError("I couldn't start the camera. Let's try again.");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    timerRef.current && clearInterval(timerRef.current);
    setRecording(false);
  }

  function recordAgain() {
    setVideoUrl(null);
    setSeconds(0);
  }

  function useVideo() {
    fetch(videoUrl!)
      .then((r) => r.blob())
      .then(onDone);
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="flex h-56 w-full items-center justify-center overflow-hidden rounded-2xl bg-ink/90">
        {videoUrl ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={videoUrl} controls className="h-full w-full object-cover" />
        ) : (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video ref={videoRef} muted className="h-full w-full object-cover" />
        )}
      </div>

      {error && <p className="font-round text-sm text-ink/70">{error}</p>}
      {recording && <p className="font-round text-lg font-bold text-ink tabular-nums">{mm}:{ss}</p>}

      {!videoUrl && !recording && (
        <button
          onClick={startRecording}
          aria-label="Record video"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-pink shadow-md"
        >
          <Video size={26} className="text-ink" />
        </button>
      )}

      {recording && (
        <button
          onClick={stopRecording}
          aria-label="Stop recording"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-pink shadow-md"
        >
          <Square size={22} className="text-ink" />
        </button>
      )}

      {videoUrl && (
        <div className="flex gap-3">
          <PrimaryButton variant="secondary" icon={RotateCcw} onClick={recordAgain}>
            Record Again
          </PrimaryButton>
          <PrimaryButton onClick={useVideo}>Use This Video</PrimaryButton>
        </div>
      )}
    </div>
  );
}
