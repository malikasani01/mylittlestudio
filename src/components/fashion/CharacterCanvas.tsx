"use client";

import type { FashionState } from "@/lib/fashionState";
import { hairShapeFor } from "@/lib/fashionState";
import { SKIN_TONES, HAIR_COLORS, CLOTHING_COLORS, NAIL_COLORS, hexFor } from "@/lib/fashionOptions";

const ACCESSORY_EMOJI: Record<string, { emoji: string; x: number; y: number }> = {
  glasses: { emoji: "👓", x: 100, y: 92 },
  sunglasses: { emoji: "🕶️", x: 100, y: 92 },
  earrings: { emoji: "💎", x: 128, y: 100 },
  necklace: { emoji: "📿", x: 100, y: 140 },
  bracelet: { emoji: "⭕", x: 60, y: 190 },
  handbag: { emoji: "👜", x: 150, y: 210 },
  hat: { emoji: "👒", x: 100, y: 45 },
  bow: { emoji: "🎀", x: 130, y: 60 },
  headband: { emoji: "➰", x: 100, y: 55 },
  scarf: { emoji: "🧣", x: 100, y: 132 },
};

export function CharacterCanvas({ state }: { state: FashionState }) {
  const skinHex = hexFor(SKIN_TONES, state.skinTone, "#D8A074");
  const hairHex = hexFor(HAIR_COLORS, state.hairColor, "#4A3222");
  const primaryHex = hexFor(CLOTHING_COLORS, state.primaryColor, "#F7B8D4");
  const secondaryHex = hexFor(CLOTHING_COLORS, state.secondaryColor, "#C9B6F2");
  const nailHex = hexFor(NAIL_COLORS, state.nailColor, "#F7B8D4");
  const hairShape = hairShapeFor(state.hairstyle);

  return (
    <svg viewBox="0 0 200 300" className="h-72 w-full" role="img" aria-label="Your character">
      {/* legs + shoes */}
      <rect x="82" y="220" width="14" height="55" rx="6" fill={skinHex} />
      <rect x="104" y="220" width="14" height="55" rx="6" fill={skinHex} />
      <ellipse cx="89" cy="278" rx="14" ry="8" fill="#3D3545" opacity={state.shoes ? 0.85 : 0} />
      <ellipse cx="111" cy="278" rx="14" ry="8" fill="#3D3545" opacity={state.shoes ? 0.85 : 0} />

      {/* dress or bottom+top */}
      {state.clothingMode === "dress" ? (
        <path d="M70 150 L130 150 L145 230 L55 230 Z" fill={primaryHex} stroke={secondaryHex} strokeWidth="4" />
      ) : (
        <>
          <rect x="72" y="195" width="56" height="45" rx="8" fill={secondaryHex} />
          <rect x="65" y="140" width="70" height="60" rx="14" fill={primaryHex} />
        </>
      )}

      {/* pattern dots */}
      {state.pattern !== "none" && (
        <>
          <circle cx="85" cy="165" r="3" fill="white" opacity="0.8" />
          <circle cx="115" cy="180" r="3" fill="white" opacity="0.8" />
          <circle cx="100" cy="200" r="3" fill="white" opacity="0.8" />
        </>
      )}

      {/* arms */}
      <rect x="45" y="145" width="16" height="60" rx="8" fill={skinHex} />
      <rect x="139" y="145" width="16" height="60" rx="8" fill={skinHex} />

      {/* nails */}
      <circle cx="53" cy="207" r="4" fill={nailHex} />
      <circle cx="147" cy="207" r="4" fill={nailHex} />

      {/* head */}
      <circle cx="100" cy="95" r="38" fill={skinHex} />

      {/* hair (behind + around) */}
      {hairShape === "long" && <path d="M60 90 Q60 40 100 40 Q140 40 140 90 L150 170 L128 170 L128 100 L72 100 L72 170 L50 170 Z" fill={hairHex} />}
      {hairShape === "short" && <path d="M60 90 Q60 45 100 45 Q140 45 140 90 L136 110 L64 110 Z" fill={hairHex} />}
      {hairShape === "curly" && (
        <g fill={hairHex}>
          <circle cx="65" cy="70" r="18" />
          <circle cx="100" cy="55" r="22" />
          <circle cx="135" cy="70" r="18" />
          <circle cx="70" cy="100" r="14" />
          <circle cx="130" cy="100" r="14" />
        </g>
      )}
      {hairShape === "buns" && (
        <g fill={hairHex}>
          <path d="M62 92 Q62 46 100 46 Q138 46 138 92 L134 105 L66 105 Z" />
          <circle cx="66" cy="45" r="14" />
          <circle cx="134" cy="45" r="14" />
        </g>
      )}
      {hairShape === "braids" && (
        <g fill={hairHex}>
          <path d="M62 90 Q62 44 100 44 Q138 44 138 90 L132 100 L68 100 Z" />
          <rect x="55" y="95" width="12" height="70" rx="6" />
          <rect x="133" y="95" width="12" height="70" rx="6" />
        </g>
      )}

      {/* face */}
      <circle cx="88" cy="95" r="3.5" fill="#3D3545" />
      <circle cx="112" cy="95" r="3.5" fill="#3D3545" />
      <path d="M88 110 Q100 118 112 110" stroke="#3D3545" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="78" cy="105" r="6" fill="#F7B8D4" opacity="0.5" />
      <circle cx="122" cy="105" r="6" fill="#F7B8D4" opacity="0.5" />

      {/* accessories */}
      {state.accessories.map((id) => {
        const acc = ACCESSORY_EMOJI[id];
        if (!acc) return null;
        return (
          <text key={id} x={acc.x} y={acc.y} fontSize="22" textAnchor="middle">
            {acc.emoji}
          </text>
        );
      })}
    </svg>
  );
}
