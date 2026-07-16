export interface FashionState {
  characterBase: string;
  skinTone: string;
  hairstyle: string;
  hairColor: string;
  clothingMode: "outfit" | "dress";
  top: string | null;
  bottom: string | null;
  dress: string | null;
  shoes: string | null;
  accessories: string[];
  nailStyle: string;
  nailColor: string;
  primaryColor: string;
  secondaryColor: string;
  pattern: string;
  decorativeElement: string | null;
  background: string;
}

export const DEFAULT_FASHION_STATE: FashionState = {
  characterBase: "base-1",
  skinTone: "medium",
  hairstyle: "ponytail",
  hairColor: "dark-brown",
  clothingMode: "dress",
  top: null,
  bottom: null,
  dress: "party-dress",
  shoes: "sneakers",
  accessories: [],
  nailStyle: "solid",
  nailColor: "pink",
  primaryColor: "pink",
  secondaryColor: "lilac",
  pattern: "none",
  decorativeElement: null,
  background: "cream",
};

const HAIRSTYLE_SHAPES: Record<string, "long" | "short" | "buns" | "braids" | "curly"> = {
  "long-straight": "long",
  "long-curly": "curly",
  braids: "braids",
  locs: "braids",
  bun: "buns",
  ponytail: "long",
  puffs: "buns",
  "short-curly": "curly",
  bob: "short",
  "space-buns": "buns",
};

export function hairShapeFor(hairstyle: string) {
  return HAIRSTYLE_SHAPES[hairstyle] ?? "long";
}
