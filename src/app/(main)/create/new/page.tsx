"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CreateWizard, type CreateType } from "@/components/create/CreateWizard";

const VALID_TYPES: CreateType[] = ["story", "craft", "song", "photos", "video"];

function CreateNewInner() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const type: CreateType = VALID_TYPES.includes(typeParam as CreateType)
    ? (typeParam as CreateType)
    : "story";

  return <CreateWizard type={type} />;
}

export default function CreateNewPage() {
  return (
    <Suspense fallback={null}>
      <CreateNewInner />
    </Suspense>
  );
}
