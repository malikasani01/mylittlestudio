export interface SwatchOption {
  id: string;
  label: string;
  hex?: string;
  emoji?: string;
}

export function hexFor(list: SwatchOption[], id: string, fallback = "#C9B6F2") {
  return list.find((o) => o.id === id)?.hex ?? fallback;
}

export const CHARACTER_BASES: SwatchOption[] = [
  { id: "base-1", label: "Rosie", emoji: "🧍‍♀️" },
  { id: "base-2", label: "Luna", emoji: "🧍‍♀️" },
  { id: "base-3", label: "Sunny", emoji: "🧍‍♀️" },
];

export const SKIN_TONES: SwatchOption[] = [
  { id: "porcelain", label: "Porcelain", hex: "#F6D9C4" },
  { id: "light", label: "Light", hex: "#F0C29B" },
  { id: "medium", label: "Medium", hex: "#D8A074" },
  { id: "tan", label: "Tan", hex: "#B97A4E" },
  { id: "deep", label: "Deep", hex: "#8B5A2B" },
  { id: "dark", label: "Dark", hex: "#5C3A21" },
];

export const HAIRSTYLES: SwatchOption[] = [
  { id: "long-straight", label: "Long Straight" },
  { id: "long-curly", label: "Long Curly" },
  { id: "braids", label: "Braids" },
  { id: "locs", label: "Locs" },
  { id: "bun", label: "Bun" },
  { id: "ponytail", label: "Ponytail" },
  { id: "puffs", label: "Puffs" },
  { id: "short-curly", label: "Short Curly" },
  { id: "bob", label: "Bob" },
  { id: "space-buns", label: "Space Buns" },
];

export const HAIR_COLORS: SwatchOption[] = [
  { id: "black", label: "Black", hex: "#2B2320" },
  { id: "dark-brown", label: "Dark Brown", hex: "#4A3222" },
  { id: "light-brown", label: "Light Brown", hex: "#8C5A34" },
  { id: "blonde", label: "Blonde", hex: "#E8C77A" },
  { id: "red", label: "Red", hex: "#B5502D" },
  { id: "pink", label: "Pink", hex: "#F2A6D0" },
  { id: "purple", label: "Purple", hex: "#B79AE8" },
  { id: "blue", label: "Blue", hex: "#8FC4EA" },
  { id: "rainbow", label: "Rainbow", hex: "#F2A6D0" },
];

export const TOPS: SwatchOption[] = [
  { id: "tshirt", label: "T-Shirt" },
  { id: "blouse", label: "Blouse" },
  { id: "sweater", label: "Sweater" },
  { id: "hoodie", label: "Hoodie" },
  { id: "crop-top", label: "Crop Top" },
  { id: "sparkly-top", label: "Sparkly Top" },
  { id: "craft-apron", label: "Craft Apron" },
];

export const BOTTOMS: SwatchOption[] = [
  { id: "jeans", label: "Jeans" },
  { id: "leggings", label: "Leggings" },
  { id: "skirt", label: "Skirt" },
  { id: "shorts", label: "Shorts" },
  { id: "wide-leg-pants", label: "Wide-Leg Pants" },
  { id: "patterned-pants", label: "Patterned Pants" },
];

export const DRESSES: SwatchOption[] = [
  { id: "party-dress", label: "Party Dress" },
  { id: "casual-dress", label: "Casual Dress" },
  { id: "princess-dress", label: "Princess Dress" },
  { id: "floral-dress", label: "Floral Dress" },
  { id: "sparkle-dress", label: "Sparkle Dress" },
  { id: "summer-dress", label: "Summer Dress" },
];

export const SHOES: SwatchOption[] = [
  { id: "sneakers", label: "Sneakers" },
  { id: "boots", label: "Boots" },
  { id: "flats", label: "Flats" },
  { id: "sandals", label: "Sandals" },
  { id: "dress-shoes", label: "Dress Shoes" },
  { id: "high-tops", label: "High-Tops" },
];

export const ACCESSORIES: SwatchOption[] = [
  { id: "glasses", label: "Glasses", emoji: "👓" },
  { id: "sunglasses", label: "Sunglasses", emoji: "🕶️" },
  { id: "earrings", label: "Earrings", emoji: "💎" },
  { id: "necklace", label: "Necklace", emoji: "📿" },
  { id: "bracelet", label: "Bracelet", emoji: "⭕" },
  { id: "handbag", label: "Handbag", emoji: "👜" },
  { id: "hat", label: "Hat", emoji: "👒" },
  { id: "bow", label: "Bow", emoji: "🎀" },
  { id: "headband", label: "Headband", emoji: "➰" },
  { id: "scarf", label: "Scarf", emoji: "🧣" },
];

export const NAIL_STYLES: SwatchOption[] = [
  { id: "solid", label: "Solid Color" },
  { id: "glitter", label: "Glitter" },
  { id: "hearts", label: "Hearts" },
  { id: "flowers", label: "Flowers" },
  { id: "rainbow", label: "Rainbow" },
  { id: "stars", label: "Stars" },
];

export const NAIL_COLORS: SwatchOption[] = [
  { id: "pink", label: "Pink", hex: "#F7B8D4" },
  { id: "lilac", label: "Lilac", hex: "#C9B6F2" },
  { id: "sky", label: "Sky", hex: "#A9D8F5" },
  { id: "red", label: "Red", hex: "#E06C75" },
  { id: "gold", label: "Gold", hex: "#E8C77A" },
  { id: "white", label: "White", hex: "#FFFFFF" },
];

export const CLOTHING_COLORS: SwatchOption[] = [
  { id: "pink", label: "Pink", hex: "#F7B8D4" },
  { id: "lilac", label: "Lilac", hex: "#C9B6F2" },
  { id: "sky", label: "Sky", hex: "#A9D8F5" },
  { id: "butter", label: "Butter", hex: "#F8E49A" },
  { id: "mint", label: "Mint", hex: "#BCE8D5" },
  { id: "white", label: "White", hex: "#FFFFFF" },
  { id: "red", label: "Red", hex: "#E06C75" },
  { id: "purple", label: "Purple", hex: "#9B7FD4" },
];

export const PATTERNS: SwatchOption[] = [
  { id: "none", label: "Plain" },
  { id: "flowers", label: "Flowers", emoji: "🌸" },
  { id: "hearts", label: "Hearts", emoji: "💗" },
  { id: "stars", label: "Stars", emoji: "⭐" },
  { id: "stripes", label: "Stripes", emoji: "〰️" },
  { id: "polka-dots", label: "Polka Dots", emoji: "⚪" },
  { id: "sparkles", label: "Sparkles", emoji: "✨" },
  { id: "rainbow", label: "Rainbow", emoji: "🌈" },
  { id: "butterflies", label: "Butterflies", emoji: "🦋" },
];

export const DECORATIVE_ELEMENTS: SwatchOption[] = [
  { id: "bow", label: "Bow", emoji: "🎀" },
  { id: "flower", label: "Flower", emoji: "🌸" },
  { id: "heart", label: "Heart", emoji: "💗" },
  { id: "star", label: "Star", emoji: "⭐" },
  { id: "gem", label: "Gem", emoji: "💎" },
  { id: "patch", label: "Patch", emoji: "🩹" },
  { id: "initials", label: "Initials", emoji: "🔤" },
];

export const BACKGROUND_OPTIONS = [
  "cream",
  "pink",
  "lilac",
  "sky",
  "mint",
  "yellow",
] as const;
