"use client";

import type { ReactNode } from "react";
import type { FashionState } from "@/lib/fashionState";
import { SKIN_TONES, HAIR_COLORS, CLOTHING_COLORS, NAIL_COLORS, hexFor } from "@/lib/fashionOptions";

/**
 * An original cute "chibi" character (big head, big sparkly eyes, rosy cheeks,
 * small body) inspired by the dress-up genre — not a copy of any specific game.
 * Everything is driven by FashionState so each selection visibly changes the
 * drawing, and every accessory is anchored to a real body landmark.
 *
 * Coordinate system: viewBox 0 0 240 360, figure centred on x=120, feet at y≈322.
 */

// --- geometry landmarks ---
const CX = 120;
const HEAD_CY = 96;
const HEAD_RX = 56;
const HEAD_RY = 60;
const EYE_Y = 108;
const EYE_LX = 100;
const EYE_RX = 140;
const EAR_Y = 112;
const EAR_LX = 64;
const EAR_RX = 176;
const SHOULDER_Y = 168;
const WAIST_Y = 214;
const HIP_Y = 224;
const ANKLE_Y = 300;
const LEG_LX = 111; // centre of left leg
const LEG_RX = 129; // centre of right leg
const LEG_HALF = 9;
const HAND_LX = 74;
const HAND_RX = 166;
const HAND_Y = 224;

function shade(hex: string, amt: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

interface BaseConfig {
  scale: number;
  eye: "round" | "big" | "almond";
}
const BASE_CONFIG: Record<string, BaseConfig> = {
  "base-1": { scale: 1, eye: "round" },
  "base-2": { scale: 0.93, eye: "big" },
  "base-3": { scale: 1.05, eye: "almond" },
};

// ---------- HAIR ----------
function renderHair(style: string, hair: string): { back: ReactNode; front: ReactNode } {
  const dark = shade(hair, -28);
  const back = (elements: ReactNode) => <g fill={hair}>{elements}</g>;

  switch (style) {
    case "long-straight":
      return {
        back: back(
          <path d="M60 96 Q56 42 120 40 Q184 42 180 96 L188 260 L156 264 L156 120 L84 120 L84 264 L52 260 Z" />
        ),
        front: (
          <g fill={hair}>
            <path d="M62 96 Q58 40 120 38 Q182 40 178 96 Q168 70 120 68 Q72 70 62 96 Z" />
            <path d="M62 96 Q58 62 74 58 L82 104 Q70 104 62 96 Z" fill={dark} opacity="0.5" />
          </g>
        ),
      };
    case "long-curly":
      return {
        back: back(
          <g>
            <path d="M60 96 Q56 44 120 42 Q184 44 180 96 L184 220 L150 226 L150 120 L90 120 L90 226 L56 220 Z" />
            <circle cx="58" cy="220" r="20" />
            <circle cx="80" cy="238" r="18" />
            <circle cx="182" cy="220" r="20" />
            <circle cx="160" cy="238" r="18" />
          </g>
        ),
        front: (
          <path d="M62 98 Q58 40 120 38 Q182 40 178 98 Q170 74 150 78 Q150 60 120 62 Q90 60 90 78 Q70 74 62 98 Z" fill={hair} />
        ),
      };
    case "braids":
      return {
        back: back(
          <g>
            <path d="M64 96 Q60 44 120 42 Q180 44 176 96 L176 116 L64 116 Z" />
            {[0, 1, 2].map((i) => (
              <ellipse key={`l${i}`} cx={66} cy={130 + i * 34} rx="12" ry="18" />
            ))}
            {[0, 1, 2].map((i) => (
              <ellipse key={`r${i}`} cx={174} cy={130 + i * 34} rx="12" ry="18" />
            ))}
          </g>
        ),
        front: <path d="M64 100 Q60 40 120 38 Q180 40 176 100 Q166 72 120 70 Q74 72 64 100 Z" fill={hair} />,
      };
    case "locs":
      return {
        back: back(
          <g>
            <path d="M62 96 Q58 44 120 42 Q182 44 178 96 L178 118 L62 118 Z" />
            {Array.from({ length: 6 }).map((_, i) => (
              <rect key={`l${i}`} x={54 + i * 5} y={110} width="7" height={110 + (i % 2) * 24} rx="3.5" />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <rect key={`r${i}`} x={178 - i * 5} y={110} width="7" height={110 + (i % 2) * 24} rx="3.5" />
            ))}
          </g>
        ),
        front: <path d="M62 100 Q58 40 120 38 Q182 40 178 100 Q166 72 120 70 Q74 72 62 100 Z" fill={hair} />,
      };
    case "bun":
      return {
        back: back(<circle cx="120" cy="42" r="22" />),
        front: <path d="M62 100 Q58 44 120 42 Q182 44 178 100 Q166 70 120 68 Q74 70 62 100 Z" fill={hair} />,
      };
    case "ponytail":
      return {
        back: back(
          <g>
            <path d="M170 70 Q206 96 196 160 Q190 200 168 210 Q182 170 176 120 Q172 92 160 78 Z" />
          </g>
        ),
        front: (
          <g fill={hair}>
            <path d="M62 100 Q58 40 120 38 Q182 40 178 100 Q168 70 120 68 Q74 70 62 100 Z" />
            <circle cx="172" cy="72" r="10" />
          </g>
        ),
      };
    case "puffs":
      return {
        back: back(
          <g>
            <circle cx="58" cy="86" r="26" />
            <circle cx="182" cy="86" r="26" />
          </g>
        ),
        front: <path d="M66 98 Q62 44 120 42 Q178 44 174 98 Q164 72 120 70 Q76 72 66 98 Z" fill={hair} />,
      };
    case "short-curly":
      return {
        back: back(<path d="M66 110 Q60 50 120 46 Q180 50 174 110 Z" />),
        front: (
          <g fill={hair}>
            <circle cx="74" cy="70" r="18" />
            <circle cx="100" cy="54" r="20" />
            <circle cx="140" cy="54" r="20" />
            <circle cx="166" cy="70" r="18" />
            <circle cx="68" cy="96" r="14" />
            <circle cx="172" cy="96" r="14" />
          </g>
        ),
      };
    case "bob":
      return {
        back: back(<path d="M62 96 Q58 44 120 42 Q182 44 178 96 L180 148 L60 148 Z" />),
        front: <path d="M62 100 Q58 40 120 38 Q182 40 178 100 Q168 68 120 66 Q72 68 62 100 Z" fill={hair} />,
      };
    case "space-buns":
      return {
        back: back(
          <g>
            <circle cx="78" cy="40" r="18" />
            <circle cx="162" cy="40" r="18" />
          </g>
        ),
        front: <path d="M64 98 Q60 44 120 42 Q180 44 176 98 Q166 70 120 68 Q74 70 64 98 Z" fill={hair} />,
      };
    default:
      return {
        back: null,
        front: <path d="M62 100 Q58 40 120 38 Q182 40 178 100 Q168 70 120 68 Q74 70 62 100 Z" fill={hair} />,
      };
  }
}

// ---------- EYES ----------
function renderEyes(eye: BaseConfig["eye"]) {
  const iris = "#6B4A34";
  const dims =
    eye === "big"
      ? { rx: 13, ry: 16 }
      : eye === "almond"
        ? { rx: 12, ry: 11 }
        : { rx: 12, ry: 14 };

  const oneEye = (x: number) => (
    <g key={x}>
      {eye === "almond" ? (
        <path
          d={`M${x - dims.rx} ${EYE_Y} Q${x} ${EYE_Y - dims.ry} ${x + dims.rx} ${EYE_Y} Q${x} ${EYE_Y + dims.ry} ${x - dims.rx} ${EYE_Y} Z`}
          fill="#fff"
        />
      ) : (
        <ellipse cx={x} cy={EYE_Y} rx={dims.rx} ry={dims.ry} fill="#fff" />
      )}
      <ellipse cx={x} cy={EYE_Y + 1} rx={dims.rx - 3} ry={dims.ry - 3} fill={iris} />
      <circle cx={x} cy={EYE_Y + 2} r={dims.rx - 6} fill="#2B2320" />
      <circle cx={x - 3} cy={EYE_Y - 3} r={dims.rx - 8.5} fill="#fff" />
      <circle cx={x + 3} cy={EYE_Y + 5} r={1.6} fill="#fff" opacity="0.8" />
    </g>
  );

  return (
    <g>
      {/* brows */}
      <path d={`M${EYE_LX - 10} ${EYE_Y - dims.ry - 5} Q${EYE_LX} ${EYE_Y - dims.ry - 9} ${EYE_LX + 10} ${EYE_Y - dims.ry - 5}`} stroke="#6B4A34" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d={`M${EYE_RX - 10} ${EYE_Y - dims.ry - 5} Q${EYE_RX} ${EYE_Y - dims.ry - 9} ${EYE_RX + 10} ${EYE_Y - dims.ry - 5}`} stroke="#6B4A34" strokeWidth="2" fill="none" strokeLinecap="round" />
      {oneEye(EYE_LX)}
      {oneEye(EYE_RX)}
    </g>
  );
}

// ---------- LEGS + BOTTOM ----------
function renderLegsAndBottom(state: FashionState, skin: string, primary: string, secondary: string) {
  const leg = (cx: number) => <rect key={cx} x={cx - LEG_HALF} y={HIP_Y - 4} width={LEG_HALF * 2} height={ANKLE_Y - HIP_Y + 4} rx={LEG_HALF} fill={skin} />;
  const legs = (
    <>
      {leg(LEG_LX)}
      {leg(LEG_RX)}
    </>
  );

  const isDress = state.clothingMode === "dress" && state.dress;
  if (isDress) return legs; // dress skirt drawn by top layer; legs peek below

  const b = state.bottom;
  const dark = shade(primary, -22);

  if (!b) return legs;

  if (b === "skirt") {
    return (
      <>
        {legs}
        <path d={`M88 ${WAIST_Y} L152 ${WAIST_Y} L166 ${WAIST_Y + 34} L74 ${WAIST_Y + 34} Z`} fill={primary} />
        <path d={`M74 ${WAIST_Y + 34} L166 ${WAIST_Y + 34} L162 ${WAIST_Y + 40} L78 ${WAIST_Y + 40} Z`} fill={dark} />
      </>
    );
  }
  if (b === "shorts") {
    return (
      <>
        {legs}
        <path d={`M90 ${WAIST_Y} L150 ${WAIST_Y} L150 ${WAIST_Y + 30} L124 ${WAIST_Y + 30} L120 ${WAIST_Y + 22} L116 ${WAIST_Y + 30} L90 ${WAIST_Y + 30} Z`} fill={primary} />
      </>
    );
  }
  // full-length pant styles
  const pantWidth = b === "wide-leg-pants" ? 15 : 11;
  const pantLeg = (cx: number, key: string) => (
    <rect key={key} x={cx - pantWidth} y={WAIST_Y} width={pantWidth * 2} height={ANKLE_Y - WAIST_Y + 2} rx={6} fill={primary} />
  );
  return (
    <>
      {legs}
      <rect x={88} y={WAIST_Y - 2} width={64} height={20} rx={6} fill={primary} />
      {pantLeg(LEG_LX - 1, "pl")}
      {pantLeg(LEG_RX + 1, "pr")}
      {b === "jeans" && (
        <>
          <line x1={LEG_LX} y1={WAIST_Y + 10} x2={LEG_LX} y2={ANKLE_Y} stroke={dark} strokeWidth="1.5" />
          <line x1={LEG_RX} y1={WAIST_Y + 10} x2={LEG_RX} y2={ANKLE_Y} stroke={dark} strokeWidth="1.5" />
        </>
      )}
      {b === "patterned-pants" &&
        [0, 1, 2, 3].map((i) => (
          <g key={i}>
            <circle cx={LEG_LX} cy={WAIST_Y + 20 + i * 20} r="2.5" fill="#fff" opacity="0.8" />
            <circle cx={LEG_RX} cy={WAIST_Y + 20 + i * 20} r="2.5" fill="#fff" opacity="0.8" />
          </g>
        ))}
    </>
  );
}

// ---------- SHOES ----------
function renderShoes(shoes: string | null, color: string) {
  if (!shoes) return null;
  const dark = shade(color, -30);
  const y = ANKLE_Y - 2;
  const foot = (cx: number, key: string) => {
    switch (shoes) {
      case "boots":
        return (
          <g key={key}>
            <rect x={cx - 10} y={y - 20} width="20" height="30" rx="6" fill={color} />
            <ellipse cx={cx + 3} cy={y + 12} rx="15" ry="7" fill={dark} />
          </g>
        );
      case "high-tops":
        return (
          <g key={key}>
            <rect x={cx - 9} y={y - 12} width="18" height="18" rx="5" fill={color} />
            <ellipse cx={cx + 3} cy={y + 11} rx="15" ry="7" fill="#fff" />
            <ellipse cx={cx + 3} cy={y + 13} rx="15" ry="4" fill={dark} />
          </g>
        );
      case "flats":
        return <ellipse key={key} cx={cx + 2} cy={y + 10} rx="15" ry="7" fill={color} />;
      case "sandals":
        return (
          <g key={key}>
            <ellipse cx={cx + 2} cy={y + 12} rx="15" ry="6" fill={color} />
            <path d={`M${cx - 8} ${y + 8} L${cx + 8} ${y + 6}`} stroke={dark} strokeWidth="3" strokeLinecap="round" />
          </g>
        );
      case "dress-shoes":
        return (
          <g key={key}>
            <ellipse cx={cx + 2} cy={y + 10} rx="14" ry="6" fill={color} />
            <rect x={cx + 10} y={y + 8} width="5" height="10" fill={dark} />
            <path d={`M${cx - 4} ${y + 6} Q${cx + 2} ${y + 1} ${cx + 8} ${y + 6}`} stroke="#fff" strokeWidth="2" fill="none" />
          </g>
        );
      default: // sneakers
        return (
          <g key={key}>
            <path d={`M${cx - 12} ${y + 4} Q${cx - 12} ${y - 6} ${cx - 2} ${y - 6} L${cx + 10} ${y + 2} Q${cx + 16} ${y + 4} ${cx + 16} ${y + 8} L${cx - 12} ${y + 8} Z`} fill={color} />
            <ellipse cx={cx + 2} cy={y + 11} rx="16" ry="5" fill="#fff" />
            <path d={`M${cx - 4} ${y - 2} L${cx + 4} ${y}`} stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
    }
  };
  return (
    <>
      {foot(LEG_LX - 3, "sl")}
      {foot(LEG_RX + 3, "sr")}
    </>
  );
}

// ---------- ARMS ----------
function renderArms(skin: string) {
  return (
    <g fill={skin}>
      <path d="M92 170 Q72 178 74 224 L82 224 Q84 186 100 180 Z" />
      <path d="M148 170 Q168 178 166 224 L158 224 Q156 186 140 180 Z" />
      <circle cx={HAND_LX + 4} cy={HAND_Y} r="8" />
      <circle cx={HAND_RX - 4} cy={HAND_Y} r="8" />
    </g>
  );
}

// ---------- TORSO CLOTHING (top or dress) ----------
function renderTorsoClothing(state: FashionState, primary: string, secondary: string) {
  const dark = shade(primary, -22);
  const bodice = (
    <path d={`M88 ${SHOULDER_Y} Q120 ${SHOULDER_Y - 8} 152 ${SHOULDER_Y} L150 ${WAIST_Y + 4} Q120 ${WAIST_Y + 12} 90 ${WAIST_Y + 4} Z`} fill={primary} />
  );
  const sleeve = (long: boolean) =>
    long ? (
      <g fill={primary}>
        <path d="M92 168 Q70 176 72 224 L84 224 Q84 184 100 178 Z" />
        <path d="M148 168 Q170 176 168 224 L156 224 Q156 184 140 178 Z" />
      </g>
    ) : (
      <g fill={primary}>
        <ellipse cx="88" cy="176" rx="12" ry="10" />
        <ellipse cx="152" cy="176" rx="12" ry="10" />
      </g>
    );

  if (state.clothingMode === "dress" && state.dress) {
    const d = state.dress;
    const skirtLen = d === "princess-dress" ? 96 : d === "summer-dress" ? 60 : d === "party-dress" || d === "sparkle-dress" ? 84 : 76;
    const skirtWide = d === "princess-dress" ? 78 : 58;
    const hemY = HIP_Y + skirtLen;
    const skirt = (
      <path d={`M92 ${WAIST_Y} L148 ${WAIST_Y} L${120 + skirtWide} ${hemY} Q120 ${hemY + 12} ${120 - skirtWide} ${hemY} Z`} fill={primary} />
    );
    return (
      <g>
        {skirt}
        <path d={`M${120 - skirtWide} ${hemY} Q120 ${hemY + 12} ${120 + skirtWide} ${hemY} L${118 + skirtWide} ${hemY - 8} Q120 ${hemY} ${122 - skirtWide} ${hemY - 8} Z`} fill={secondary} />
        {bodice}
        {(d === "party-dress" || d === "casual-dress" || d === "floral-dress") && sleeve(false)}
        {(d === "summer-dress" || d === "sparkle-dress" || d === "princess-dress") && (
          <>
            <rect x="98" y="160" width="6" height="18" rx="3" fill={primary} />
            <rect x="136" y="160" width="6" height="18" rx="3" fill={primary} />
          </>
        )}
        {/* waist sash */}
        <rect x="90" y={WAIST_Y - 4} width="60" height="7" rx="3" fill={secondary} />
        {d === "princess-dress" && (
          <g fill="#fff" opacity="0.8">
            <circle cx="105" cy={hemY - 30} r="2.5" />
            <circle cx="135" cy={hemY - 45} r="2.5" />
            <circle cx="120" cy={hemY - 20} r="2.5" />
          </g>
        )}
        {d === "sparkle-dress" &&
          [[100, 250], [140, 268], [120, 240], [130, 285]].map(([sx, sy], i) => (
            <text key={i} x={sx} y={sy} fontSize="12" textAnchor="middle">✨</text>
          ))}
        {d === "floral-dress" &&
          [[104, 250], [138, 262], [120, 244]].map(([sx, sy], i) => (
            <text key={i} x={sx} y={sy} fontSize="12" textAnchor="middle">🌸</text>
          ))}
      </g>
    );
  }

  // separates: a top only (bottom drawn elsewhere)
  const t = state.top;
  if (!t) return null;

  switch (t) {
    case "hoodie":
      return (
        <g>
          {sleeve(true)}
          {bodice}
          <path d="M100 160 Q120 150 140 160 L138 172 Q120 164 102 172 Z" fill={dark} />
          <rect x="104" y="192" width="32" height="16" rx="4" fill={dark} />
        </g>
      );
    case "sweater":
      return (
        <g>
          {sleeve(true)}
          {bodice}
          <rect x="90" y={WAIST_Y - 2} width="60" height="8" rx="3" fill={dark} />
          {[0, 1, 2].map((i) => (
            <line key={i} x1={100 + i * 14} y1={SHOULDER_Y + 6} x2={100 + i * 14} y2={WAIST_Y} stroke={dark} strokeWidth="1" opacity="0.5" />
          ))}
        </g>
      );
    case "blouse":
      return (
        <g>
          {sleeve(false)}
          {bodice}
          <path d="M112 160 L120 172 L128 160 Z" fill="#fff" />
        </g>
      );
    case "crop-top":
      return (
        <g>
          {sleeve(false)}
          <path d={`M90 ${SHOULDER_Y} Q120 ${SHOULDER_Y - 8} 150 ${SHOULDER_Y} L148 194 Q120 200 92 194 Z`} fill={primary} />
        </g>
      );
    case "craft-apron":
      return (
        <g>
          {sleeve(false)}
          <path d={`M88 ${SHOULDER_Y} Q120 ${SHOULDER_Y - 8} 152 ${SHOULDER_Y} L150 ${WAIST_Y + 4} Q120 ${WAIST_Y + 12} 90 ${WAIST_Y + 4} Z`} fill={shade(primary, 20)} />
          <path d="M104 168 L136 168 L140 214 L100 214 Z" fill={secondary} />
          <rect x="112" y="184" width="16" height="14" rx="2" fill={shade(secondary, -25)} />
        </g>
      );
    case "sparkly-top":
      return (
        <g>
          {sleeve(false)}
          {bodice}
          {[[104, 186], [136, 190], [120, 178]].map(([sx, sy], i) => (
            <text key={i} x={sx} y={sy} fontSize="11" textAnchor="middle">✨</text>
          ))}
        </g>
      );
    default: // tshirt
      return (
        <g>
          {sleeve(false)}
          {bodice}
        </g>
      );
  }
}

// ---------- ACCESSORIES ----------
function renderAccessories(accessories: string[]) {
  const items: ReactNode[] = [];
  const has = (id: string) => accessories.includes(id);

  if (has("hat")) items.push(<text key="hat" x={CX} y="44" fontSize="46" textAnchor="middle">👒</text>);
  if (has("headband"))
    items.push(
      <path key="headband" d="M70 66 Q120 44 170 66" stroke="#F7B8D4" strokeWidth="7" fill="none" strokeLinecap="round" />
    );
  if (has("bow")) items.push(<text key="bow" x="150" y="60" fontSize="26" textAnchor="middle">🎀</text>);

  if (has("glasses"))
    items.push(
      <g key="glasses" fill="none" stroke="#3D3545" strokeWidth="2.5">
        <circle cx={EYE_LX} cy={EYE_Y} r="15" />
        <circle cx={EYE_RX} cy={EYE_Y} r="15" />
        <line x1={EYE_LX + 15} y1={EYE_Y} x2={EYE_RX - 15} y2={EYE_Y} />
      </g>
    );
  if (has("sunglasses"))
    items.push(
      <g key="sunglasses">
        <circle cx={EYE_LX} cy={EYE_Y} r="15" fill="#3D3545" />
        <circle cx={EYE_RX} cy={EYE_Y} r="15" fill="#3D3545" />
        <line x1={EYE_LX + 15} y1={EYE_Y} x2={EYE_RX - 15} y2={EYE_Y} stroke="#3D3545" strokeWidth="3" />
      </g>
    );

  if (has("earrings"))
    items.push(
      <g key="earrings" fill="#F2C14E">
        <circle cx={EAR_LX} cy={EAR_Y + 12} r="4" />
        <circle cx={EAR_RX} cy={EAR_Y + 12} r="4" />
      </g>
    );

  if (has("scarf"))
    items.push(
      <g key="scarf" fill="#C9B6F2">
        <path d="M96 158 Q120 172 144 158 L146 172 Q120 186 94 172 Z" />
        <path d="M116 172 L112 196 L124 196 L122 172 Z" />
      </g>
    );
  if (has("necklace"))
    items.push(
      <g key="necklace">
        <path d="M104 164 Q120 182 136 164" stroke="#F2C14E" strokeWidth="2.5" fill="none" />
        <circle cx="120" cy="178" r="3.5" fill="#F2C14E" />
      </g>
    );

  if (has("bracelet")) items.push(<circle key="bracelet" cx={HAND_RX - 4} cy={HAND_Y - 8} r="6" fill="none" stroke="#F2C14E" strokeWidth="3" />);
  if (has("handbag"))
    items.push(
      <g key="handbag">
        <path d={`M${HAND_LX - 6} ${HAND_Y + 4} q10 -10 20 0`} stroke="#E38FB6" strokeWidth="2" fill="none" />
        <rect x={HAND_LX - 10} y={HAND_Y + 4} width="28" height="22" rx="5" fill="#E38FB6" />
        <rect x={HAND_LX - 10} y={HAND_Y + 12} width="28" height="4" fill={shade("#E38FB6", -25)} />
      </g>
    );

  return <g>{items}</g>;
}

// ---------- NAILS ----------
function renderNails(state: FashionState, nailHex: string) {
  const dots = (cx: number, key: string) => (
    <g key={key}>
      <circle cx={cx - 4} cy={HAND_Y + 4} r="1.8" fill={nailHex} />
      <circle cx={cx} cy={HAND_Y + 6} r="1.8" fill={nailHex} />
      <circle cx={cx + 4} cy={HAND_Y + 4} r="1.8" fill={nailHex} />
    </g>
  );
  return (
    <>
      {dots(HAND_LX + 4, "nl")}
      {dots(HAND_RX - 4, "nr")}
      {state.nailStyle === "glitter" && (
        <>
          <text x={HAND_LX + 4} y={HAND_Y + 2} fontSize="7" textAnchor="middle">✨</text>
          <text x={HAND_RX - 4} y={HAND_Y + 2} fontSize="7" textAnchor="middle">✨</text>
        </>
      )}
    </>
  );
}

export function CharacterCanvas({ state }: { state: FashionState }) {
  const skin = hexFor(SKIN_TONES, state.skinTone, "#D8A074");
  const rawHair = hexFor(HAIR_COLORS, state.hairColor, "#4A3222");
  const primary = hexFor(CLOTHING_COLORS, state.primaryColor, "#F7B8D4");
  const secondary = hexFor(CLOTHING_COLORS, state.secondaryColor, "#C9B6F2");
  const nailHex = hexFor(NAIL_COLORS, state.nailColor, "#F7B8D4");
  const base = BASE_CONFIG[state.characterBase] ?? BASE_CONFIG["base-1"];

  const hairIsRainbow = state.hairColor === "rainbow";
  const hair = hairIsRainbow ? "url(#rainbowHair)" : rawHair;
  const { back: hairBack, front: hairFront } = renderHair(state.hairstyle, hair);

  // shoes follow the secondary colour so the "Colors" tab affects them too
  const shoeColor = secondary;

  return (
    <svg viewBox="0 0 240 360" className="h-72 w-full" role="img" aria-label="Your character">
      <defs>
        <linearGradient id="rainbowHair" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F7B8D4" />
          <stop offset="35%" stopColor="#C9B6F2" />
          <stop offset="70%" stopColor="#A9D8F5" />
          <stop offset="100%" stopColor="#BCE8D5" />
        </linearGradient>
      </defs>

      <g transform={`translate(${CX} 322) scale(${base.scale}) translate(${-CX} -322)`}>
        {hairBack}
        {renderLegsAndBottom(state, skin, primary, secondary)}
        {renderShoes(state.shoes, shoeColor)}
        {renderArms(skin)}

        {/* neck */}
        <path d="M110 146 Q120 156 130 146 L130 168 L110 168 Z" fill={skin} />

        {renderTorsoClothing(state, primary, secondary)}
        {renderNails(state, nailHex)}

        {/* head */}
        <ellipse cx={CX} cy={HEAD_CY} rx={HEAD_RX} ry={HEAD_RY} fill={skin} />
        {/* ears */}
        <circle cx={EAR_LX} cy={EAR_Y} r="8" fill={skin} />
        <circle cx={EAR_RX} cy={EAR_Y} r="8" fill={skin} />

        {hairFront}

        {/* face */}
        {renderEyes(base.eye)}
        <ellipse cx="84" cy="124" rx="8" ry="5" fill="#F7B8D4" opacity="0.55" />
        <ellipse cx="156" cy="124" rx="8" ry="5" fill="#F7B8D4" opacity="0.55" />
        <path d="M112 128 Q120 136 128 128" stroke="#B5566E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx={CX} cy="120" r="1.4" fill="#B5566E" opacity="0.5" />

        {renderAccessories(state.accessories)}
      </g>
    </svg>
  );
}
