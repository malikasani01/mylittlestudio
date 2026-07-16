import { BottomNavigation } from "@/components/BottomNavigation";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <div className="flex flex-1 flex-col pb-2">{children}</div>
      <BottomNavigation />
    </div>
  );
}
