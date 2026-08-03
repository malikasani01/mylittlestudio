"use client";

import { buildDoll, type DollConfig } from "@/lib/doll";

// Renders the layered paper-doll SVG produced by the doll engine. The inner
// <svg> stays in the DOM so the studio can serialise it to a PNG on save.
export function CharacterCanvas({ config }: { config: DollConfig }) {
  return (
    <div
      className="mx-auto h-72 w-full [&>svg]:mx-auto [&>svg]:block [&>svg]:h-full [&>svg]:w-auto"
      dangerouslySetInnerHTML={{ __html: buildDoll(config) }}
    />
  );
}
