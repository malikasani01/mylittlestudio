import Link from "next/link";
import { Scissors, Camera, Mic, Shirt, BookOpen } from "lucide-react";

export default function WelcomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-gradient-to-b from-pink/25 via-cream to-lilac/15 px-6 py-12 text-center">
      <div className="flex flex-col items-center gap-3">
        <h1 className="font-heading text-3xl font-bold text-ink">Welcome to My Little Studio</h1>
        <p className="max-w-sm font-round text-base text-ink/70">
          A special place for your stories, crafts, songs, pictures, and fashion ideas.
        </p>
      </div>

      <div className="flex gap-3 rounded-3xl bg-white/70 p-4 shadow-sm">
        {[Scissors, Camera, Mic, Shirt, BookOpen].map((Icon, i) => (
          <span
            key={i}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm"
          >
            <Icon size={22} className="text-ink/70" />
          </span>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3">
        <Link
          href="/auth"
          className="flex min-h-[52px] items-center justify-center rounded-2xl bg-pink px-10 py-3 font-round text-lg font-bold text-ink shadow-sm hover:bg-pink/80"
        >
          Start Creating
        </Link>
        <Link href="/auth?parent=1" className="font-round text-sm text-ink/60 underline">
          Parent Setup
        </Link>
      </div>
    </main>
  );
}
