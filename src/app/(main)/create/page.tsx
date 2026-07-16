import Link from "next/link";
import { BookOpen, Scissors, Mic2, ImagePlus, Video, Shirt } from "lucide-react";
import { TopHeader } from "@/components/TopHeader";

const TYPES = [
  { type: "story", href: "/create/new?type=story", title: "Tell a Story", description: "Talk about your day or an idea.", icon: BookOpen, accent: "bg-lilac/25" },
  { type: "craft", href: "/create/new?type=craft", title: "Show My Craft", description: "Share something you made.", icon: Scissors, accent: "bg-butter/25" },
  { type: "song", href: "/create/new?type=song", title: "Sing or Record", description: "Record a song or sound.", icon: Mic2, accent: "bg-sky/25" },
  { type: "photos", href: "/create/new?type=photos", title: "Add Photos", description: "Share your favorite pictures.", icon: ImagePlus, accent: "bg-mint/25" },
  { type: "video", href: "/create/new?type=video", title: "Make a Video", description: "Record a short video.", icon: Video, accent: "bg-pink/25" },
  { type: "fashion", href: "/studio", title: "Fashion Post", description: "Design a look in the Studio.", icon: Shirt, accent: "bg-lilac/25" },
];

export default function CreateTypeSelectionPage() {
  return (
    <main className="flex flex-1 flex-col gap-5 px-5 pb-4">
      <TopHeader title="What do you want to make?" speak="What do you want to make?" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TYPES.map(({ type, href, title, description, icon: Icon, accent }) => (
          <Link
            key={type}
            href={href}
            className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition-transform hover:-translate-y-0.5"
          >
            <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${accent}`}>
              <Icon size={26} className="text-ink" />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="font-heading text-base font-bold text-ink">{title}</span>
              <span className="font-round text-sm text-ink/70">{description}</span>
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
