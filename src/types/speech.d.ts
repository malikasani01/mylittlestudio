interface SpeechRecognitionEvent extends Event {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

interface Window {
  webkitSpeechRecognition?: new () => SpeechRecognition;
}
