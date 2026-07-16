import { PrimaryButton } from "@/components/PrimaryButton";

interface ErrorStateAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "ghost";
}

interface ErrorStateProps {
  message: string;
  actions?: ErrorStateAction[];
}

export function ErrorState({ message, actions = [] }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5">
      <p className="font-round text-base text-ink/80">{message}</p>
      {actions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3">
          {actions.map((action) => (
            <PrimaryButton key={action.label} variant={action.variant ?? "secondary"} onClick={action.onClick}>
              {action.label}
            </PrimaryButton>
          ))}
        </div>
      )}
    </div>
  );
}
