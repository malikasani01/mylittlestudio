// Picks a MediaRecorder mime type the current browser actually supports.
// Chrome/Firefox → webm; iOS/Safari → mp4. Passing an unsupported type (or
// mislabelling the blob) breaks playback, upload, and Whisper transcription,
// so we detect it once and carry the real type + extension everywhere.

interface RecordingFormat {
  mimeType: string; // "" means "let the browser choose its default"
  ext: string;
}

const AUDIO_CANDIDATES = [
  { mimeType: "audio/webm;codecs=opus", ext: "webm" },
  { mimeType: "audio/webm", ext: "webm" },
  { mimeType: "audio/mp4", ext: "m4a" },
  { mimeType: "audio/aac", ext: "aac" },
  { mimeType: "audio/mpeg", ext: "mp3" },
];

const VIDEO_CANDIDATES = [
  { mimeType: "video/webm;codecs=vp9,opus", ext: "webm" },
  { mimeType: "video/webm;codecs=vp8,opus", ext: "webm" },
  { mimeType: "video/webm", ext: "webm" },
  { mimeType: "video/mp4", ext: "mp4" },
];

function pick(candidates: { mimeType: string; ext: string }[], fallbackExt: string): RecordingFormat {
  if (typeof MediaRecorder !== "undefined" && typeof MediaRecorder.isTypeSupported === "function") {
    for (const c of candidates) {
      if (MediaRecorder.isTypeSupported(c.mimeType)) return c;
    }
  }
  // Nothing reported as supported: let the browser default and guess extension.
  return { mimeType: "", ext: fallbackExt };
}

export function pickAudioFormat(): RecordingFormat {
  return pick(AUDIO_CANDIDATES, "m4a");
}

export function pickVideoFormat(): RecordingFormat {
  return pick(VIDEO_CANDIDATES, "mp4");
}

// Maps an actual blob mime type back to a sensible file extension for upload.
export function extForMime(mime: string, fallback: string): string {
  const m = mime.toLowerCase();
  if (m.includes("webm")) return "webm";
  if (m.includes("mp4")) return m.startsWith("audio") ? "m4a" : "mp4";
  if (m.includes("m4a")) return "m4a";
  if (m.includes("aac")) return "aac";
  if (m.includes("mpeg") || m.includes("mp3")) return "mp3";
  if (m.includes("ogg")) return "ogg";
  if (m.includes("quicktime")) return "mov";
  return fallback;
}
