// Layered SVG paper-doll engine ported from the user's own "Dress-Up Studio"
// design (their asset). Each character is composed of independent layers —
// skin, eyes, hair, top, bottom, shoes, glasses, hat, jewelry, bag, wings, pet —
// drawn on a 220×380 canvas and stacked back-to-front, so any layer swaps
// without touching the others. buildDoll(config) returns an SVG markup string.

export interface DollConfig {
  name?: string;
  tag?: string;
  skin: string;
  eye: string;
  hairStyle: string;
  hairColor: string;
  top: string;
  topColor: string;
  bottom: string;
  bottomColor: string;
  shoes: string;
  shoeColor: string;
  glasses: string;
  glassesColor: string;
  hat: string;
  hatColor: string;
  earrings: string;
  earringColor: string;
  necklace: string;
  necklaceColor: string;
  bag: string;
  bagColor: string;
  wings: string;
  wingColor: string;
  pet: string;
  petColor: string;
}

export type StyleList = [string, string][];

// ---------- palettes ----------
export const SKINS = ["#FCD9B8", "#F3B98C", "#E0A470", "#C6824A", "#9A5E2E", "#5E3A1E"];
export const EYES = ["#6B4226", "#3B7A57", "#4E7CB0", "#2a2233", "#7A4FB5", "#B5652E"];
export const HAIR = ["#FF5CA8", "#A45CFF", "#4EA8FF", "#17C3B2", "#FFC93C", "#FF6B4A", "#6BE3B8", "#2B2B33", "#6B4226", "#F4D06F"];
export const CLOTH = ["#FF5CA8", "#A45CFF", "#4EA8FF", "#17C3B2", "#FFC93C", "#FF6B4A", "#6BE3B8", "#FF9F1C", "#3A3F58", "#FFFFFF"];
export const BRIGHT = ["#FF5CA8", "#A45CFF", "#4EA8FF", "#17C3B2", "#FFC93C", "#FF6B4A", "#8367FF", "#2ED1B4"];
// Jewelry / frame palette: gold, pearl, pink, blue, purple, teal, coral, black.
export const JEWEL = ["#FFC93C", "#F3F0F5", "#FF5CA8", "#4EA8FF", "#8367FF", "#17C3B2", "#FF6B4A", "#2B2B33"];

export const HAIRSTYLES: StyleList = [["short", "Short"], ["bob", "Bob"], ["long", "Long"], ["buns", "Twin buns"], ["pony", "Ponytail"], ["pig", "Pigtails"], ["afro", "Afro"]];
export const TOPS: StyleList = [["tee", "Tee"], ["stripes", "Stripes"], ["hoodie", "Hoodie"], ["tank", "Tank"], ["sweater", "Sweater"], ["dress", "Dress"]];
export const BOTTOMS: StyleList = [["skirt", "Skirt"], ["shorts", "Shorts"], ["pants", "Pants"]];
export const SHOES: StyleList = [["sneakers", "Sneakers"], ["boots", "Boots"], ["flats", "Flats"]];
export const GLASSES: StyleList = [["none", "None"], ["round", "Round"], ["square", "Square"], ["heart", "Heart"], ["cateye", "Cat-eye"], ["aviator", "Aviator"], ["hexagon", "Hexagon"]];
export const HATS: StyleList = [["none", "None"], ["beanie", "Beanie"], ["cap", "Cap"], ["band", "Headband"], ["bow", "Bow"], ["flowers", "Flowers"]];
export const EARRING_STYLES: StyleList = [["none", "None"], ["stud", "Studs"], ["hoop", "Hoops"], ["dangle", "Dangle"], ["flower", "Flower"], ["star", "Star"], ["pearl", "Pearl"]];
export const NECKLACE_STYLES: StyleList = [["none", "None"], ["choker", "Choker"], ["pendant", "Pendant"], ["pearls", "Pearls"], ["chainstar", "Star charm"], ["layered", "Layered"], ["bowcharm", "Bow charm"]];
export const BAGS: StyleList = [["none", "None"], ["backpack", "Backpack"], ["handbag", "Handbag"]];
export const WINGS: StyleList = [["none", "None"], ["fairy", "Fairy"], ["butterfly", "Butterfly"]];
export const PETS: StyleList = [["none", "None"], ["dog", "Puppy"], ["cat", "Cat"], ["turtle", "Turtle"], ["fox", "Fox"], ["bunny", "Bunny"], ["panda", "Panda"], ["wolf", "Wolf"], ["dragon", "Dragon"]];
export const PETDEF: Record<string, string> = { cat: "#FFB74D", dog: "#C69C6D", turtle: "#66BB6A", bunny: "#F3F0F5", fox: "#FF7043", panda: "#FFFFFF", wolf: "#9AA5B1", dragon: "#8367FF" };

export const CATS: [string, string][] = [
  ["skin", "Skin"], ["eyes", "Eyes"], ["hair", "Hair"], ["top", "Top"], ["bottom", "Bottom"],
  ["shoes", "Shoes"], ["glasses", "Glasses"], ["hat", "Hat"], ["earrings", "Earrings"], ["necklace", "Necklace"], ["bag", "Bag"], ["wings", "Wings"], ["pet", "Pet"],
];

export interface CatConfig {
  styleField?: keyof DollConfig;
  styles?: StyleList;
  colorField?: keyof DollConfig;
  colors?: string[];
  colorLabel?: string;
}

export function catConfig(id: string): CatConfig {
  switch (id) {
    case "skin": return { colorField: "skin", colors: SKINS, colorLabel: "Skin tone" };
    case "eyes": return { colorField: "eye", colors: EYES, colorLabel: "Eye colour" };
    case "hair": return { styleField: "hairStyle", styles: HAIRSTYLES, colorField: "hairColor", colors: HAIR, colorLabel: "Hair colour" };
    case "top": return { styleField: "top", styles: TOPS, colorField: "topColor", colors: CLOTH, colorLabel: "Top colour" };
    case "bottom": return { styleField: "bottom", styles: BOTTOMS, colorField: "bottomColor", colors: CLOTH, colorLabel: "Bottom colour" };
    case "shoes": return { styleField: "shoes", styles: SHOES, colorField: "shoeColor", colors: CLOTH, colorLabel: "Shoe colour" };
    case "glasses": return { styleField: "glasses", styles: GLASSES, colorField: "glassesColor", colors: JEWEL, colorLabel: "Frame colour" };
    case "hat": return { styleField: "hat", styles: HATS, colorField: "hatColor", colors: BRIGHT, colorLabel: "Hat colour" };
    case "earrings": return { styleField: "earrings", styles: EARRING_STYLES, colorField: "earringColor", colors: JEWEL, colorLabel: "Earring colour" };
    case "necklace": return { styleField: "necklace", styles: NECKLACE_STYLES, colorField: "necklaceColor", colors: JEWEL, colorLabel: "Necklace colour" };
    case "bag": return { styleField: "bag", styles: BAGS, colorField: "bagColor", colors: BRIGHT, colorLabel: "Bag colour" };
    case "wings": return { styleField: "wings", styles: WINGS, colorField: "wingColor", colors: BRIGHT, colorLabel: "Wing colour" };
    case "pet": return { styleField: "pet", styles: PETS, colorField: "petColor", colors: BRIGHT, colorLabel: "Pet colour" };
  }
  return {};
}

export function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, v));
  const r = Math.round(((n >> 16) & 255) * f);
  const g = Math.round(((n >> 8) & 255) * f);
  const b = Math.round((n & 255) * f);
  return "#" + ((1 << 24) + (c(r) << 16) + (c(g) << 8) + c(b)).toString(16).slice(1);
}

export function makeChar(o: Partial<DollConfig>): DollConfig {
  return Object.assign(
    {
      skin: "#F3B98C", eye: "#6B4226",
      hairStyle: "short", hairColor: "#6B4226",
      top: "tee", topColor: "#FF5CA8",
      bottom: "skirt", bottomColor: "#A45CFF",
      shoes: "sneakers", shoeColor: "#FFFFFF",
      glasses: "none", glassesColor: "#2B2B33", hat: "none", hatColor: "#FF5CA8",
      earrings: "none", earringColor: "#FFC93C", necklace: "none", necklaceColor: "#FFC93C",
      bag: "none", bagColor: "#4EA8FF",
      wings: "none", wingColor: "#FFC93C",
      pet: "none", petColor: "",
    },
    o
  ) as DollConfig;
}

export function defaultCharacters(): DollConfig[] {
  return [
    makeChar({ name: "Hana", tag: "fairy dress", skin: "#FCD9B8", eye: "#7A4FB5", hairStyle: "long", hairColor: "#FF5CA8", top: "dress", topColor: "#A45CFF", shoes: "flats", shoeColor: "#FF5CA8", hat: "bow", hatColor: "#FFC93C", wings: "fairy", wingColor: "#FF9BD2" }),
    makeChar({ name: "Sora", tag: "hoodie + specs", skin: "#5E3A1E", eye: "#2a2233", hairStyle: "short", hairColor: "#4EA8FF", top: "hoodie", topColor: "#4EA8FF", bottom: "pants", bottomColor: "#3A3F58", shoes: "boots", shoeColor: "#2B2B33", glasses: "round" }),
    makeChar({ name: "Emi", tag: "buns + flowers", skin: "#E0A470", eye: "#3B7A57", hairStyle: "buns", hairColor: "#17C3B2", top: "sweater", topColor: "#6BE3B8", bottom: "skirt", bottomColor: "#FFC93C", shoes: "flats", shoeColor: "#FF5CA8", hat: "flowers", earrings: "flower", earringColor: "#FF5CA8" }),
    makeChar({ name: "Riku", tag: "sporty tee", skin: "#C6824A", eye: "#6B4226", hairStyle: "short", hairColor: "#2B2B33", top: "tee", topColor: "#FF6B4A", bottom: "shorts", bottomColor: "#4EA8FF", shoes: "sneakers", shoeColor: "#FFC93C", hat: "cap", hatColor: "#8367FF" }),
    makeChar({ name: "Nia", tag: "pony + tank", skin: "#9A5E2E", eye: "#6B4226", hairStyle: "pony", hairColor: "#F4D06F", top: "tank", topColor: "#FF5CA8", bottom: "skirt", bottomColor: "#FFC93C", shoes: "sneakers", shoeColor: "#A45CFF", earrings: "stud", earringColor: "#FFC93C", necklace: "pendant", necklaceColor: "#FFC93C" }),
    makeChar({ name: "Pip", tag: "pigtails + pack", skin: "#F3B98C", eye: "#4E7CB0", hairStyle: "pig", hairColor: "#4EA8FF", top: "sweater", topColor: "#6BE3B8", bottom: "pants", bottomColor: "#FF5CA8", shoes: "flats", shoeColor: "#FFC93C", hat: "band", hatColor: "#FF5CA8", bag: "backpack", bagColor: "#A45CFF" }),
  ];
}

export function randomizeChar(c: DollConfig): DollConfig {
  const pick = <T>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
  return Object.assign({}, c, {
    hairStyle: pick(HAIRSTYLES)[0], hairColor: pick(HAIR),
    top: pick(TOPS)[0], topColor: pick(CLOTH),
    bottom: pick(BOTTOMS)[0], bottomColor: pick(CLOTH),
    shoes: pick(SHOES)[0], shoeColor: pick(CLOTH),
    glasses: pick(GLASSES)[0], glassesColor: pick(JEWEL), hat: pick(HATS)[0], hatColor: pick(BRIGHT),
    earrings: pick(EARRING_STYLES)[0], earringColor: pick(JEWEL),
    necklace: pick(NECKLACE_STYLES)[0], necklaceColor: pick(JEWEL),
    bag: pick(BAGS)[0], bagColor: pick(BRIGHT),
    wings: pick(WINGS)[0], wingColor: pick(BRIGHT),
  });
}

function flowerAt(cx: number, cy: number, col: string, d: string, scale = 1): string {
  let s = "";
  for (let i = 0; i < 5; i++) {
    const rad = ((i * 72) * Math.PI) / 180;
    const px = cx + Math.cos(rad) * 6 * scale;
    const py = cy + Math.sin(rad) * 6 * scale;
    s += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${(5 * scale).toFixed(1)}" fill="${col}"/>`;
  }
  return s + `<circle cx="${cx}" cy="${cy}" r="${(3.2 * scale).toFixed(1)}" fill="${d}"/>`;
}

function starAt(cx: number, cy: number, r: number, col: string): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rad = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    pts.push((cx + Math.cos(rad) * rr).toFixed(1) + "," + (cy + Math.sin(rad) * rr).toFixed(1));
  }
  return `<polygon points="${pts.join(" ")}" fill="${col}"/>`;
}

export function buildPet(kind: string, col: string): string {
  const d = shade(col, 0.72), face = "#2a2233", nose = "#e58aa0";
  const eyes = `<circle cx="23" cy="27" r="2.6" fill="${face}"/><circle cx="37" cy="27" r="2.6" fill="${face}"/><circle cx="24" cy="26" r="1" fill="#fff"/><circle cx="38" cy="26" r="1" fill="#fff"/>`;
  if (kind === "cat") return `<ellipse cx="30" cy="50" rx="17" ry="13" fill="${col}"/><path d="M45,52 q15,-2 13,-22 q-9,7 -13,12 Z" fill="${col}"/><circle cx="30" cy="27" r="14" fill="${col}"/><path d="M18,17 l-4,-13 l13,7 Z" fill="${col}"/><path d="M42,17 l4,-13 l-13,7 Z" fill="${col}"/><path d="M18,14 l-1,-6 l5,3 Z" fill="${d}"/><path d="M42,14 l1,-6 l-5,3 Z" fill="${d}"/>${eyes}<path d="M27,31 l6,0 l-3,3 Z" fill="${nose}"/><path d="M14,30 l-8,-2 M14,33 l-8,2 M46,30 l8,-2 M46,33 l8,2" stroke="${d}" stroke-width="1" fill="none"/>`;
  if (kind === "dog") return `<ellipse cx="30" cy="50" rx="18" ry="13" fill="${col}"/><path d="M48,54 q10,2 8,-8 q-6,1 -8,4 Z" fill="${col}"/><circle cx="30" cy="28" r="15" fill="${col}"/><ellipse cx="14" cy="30" rx="6" ry="13" fill="${d}"/><ellipse cx="46" cy="30" rx="6" ry="13" fill="${d}"/>${eyes}<ellipse cx="30" cy="34" rx="6" ry="5" fill="#fff2ea"/><ellipse cx="30" cy="32" rx="3.5" ry="3" fill="${face}"/>`;
  if (kind === "bunny") return `<ellipse cx="30" cy="51" rx="16" ry="13" fill="${col}"/><ellipse cx="21" cy="14" rx="5" ry="16" fill="${col}" transform="rotate(-10 21 14)"/><ellipse cx="39" cy="14" rx="5" ry="16" fill="${col}" transform="rotate(10 39 14)"/><ellipse cx="21" cy="14" rx="2.4" ry="11" fill="#ffc2d6" transform="rotate(-10 21 14)"/><ellipse cx="39" cy="14" rx="2.4" ry="11" fill="#ffc2d6" transform="rotate(10 39 14)"/><circle cx="30" cy="34" r="14" fill="${col}"/>${eyes}<path d="M28,38 l4,0 l-2,3 Z" fill="${nose}"/><circle cx="47" cy="52" r="6" fill="#fff"/>`;
  if (kind === "fox") return `<ellipse cx="28" cy="50" rx="16" ry="12" fill="${col}"/><path d="M44,54 q18,-2 16,-20 q-12,4 -18,12 Z" fill="${col}"/><path d="M58,40 q4,7 0,14 q-6,-4 -6,-10 Z" fill="#fff"/><circle cx="28" cy="28" r="14" fill="${col}"/><path d="M15,16 l-4,-14 l12,8 Z" fill="${col}"/><path d="M41,16 l4,-14 l-12,8 Z" fill="${col}"/><path d="M28,30 q-9,4 -13,10 q10,3 13,1 q3,2 13,-1 q-4,-6 -13,-10 Z" fill="#fff"/>${eyes}<path d="M26,34 l4,0 l-2,3 Z" fill="${face}"/>`;
  if (kind === "panda") return `<ellipse cx="30" cy="50" rx="17" ry="13" fill="#fff"/><circle cx="30" cy="27" r="14" fill="#fff"/><circle cx="17" cy="16" r="6" fill="${face}"/><circle cx="43" cy="16" r="6" fill="${face}"/><ellipse cx="22" cy="27" rx="5" ry="6" fill="${face}"/><ellipse cx="38" cy="27" rx="5" ry="6" fill="${face}"/><circle cx="22" cy="27" r="2.2" fill="#fff"/><circle cx="38" cy="27" r="2.2" fill="#fff"/><path d="M27,33 l6,0 l-3,3 Z" fill="${face}"/><ellipse cx="14" cy="52" rx="6" ry="7" fill="${face}"/>`;
  if (kind === "dragon") return `<ellipse cx="30" cy="50" rx="16" ry="13" fill="${col}"/><path d="M44,50 q16,-6 14,-24 q-10,8 -16,16 Z" fill="${col}"/><path d="M12,44 q-12,-6 -6,-18 q8,6 12,12 Z" fill="${d}" opacity="0.85"/><path d="M48,44 q12,-6 6,-18 q-8,6 -12,12 Z" fill="${d}" opacity="0.85"/><circle cx="30" cy="27" r="14" fill="${col}"/><path d="M21,13 l-2,-9 l6,6 Z" fill="${d}"/><path d="M39,13 l2,-9 l-6,6 Z" fill="${d}"/>${eyes}<ellipse cx="30" cy="34" rx="6" ry="4" fill="${d}"/><circle cx="27" cy="34" r="1.2" fill="${face}"/><circle cx="33" cy="34" r="1.2" fill="${face}"/>`;
  if (kind === "turtle") return `<ellipse cx="16" cy="51" rx="6" ry="4" fill="${shade(col, 1.18)}"/><ellipse cx="44" cy="51" rx="6" ry="4" fill="${shade(col, 1.18)}"/><circle cx="55" cy="41" r="8" fill="${shade(col, 1.18)}"/><circle cx="58" cy="39" r="1.6" fill="${face}"/><path d="M7,47 q23,-27 46,0 Z" fill="${col}"/><circle cx="30" cy="33" r="5.5" fill="${d}" opacity="0.55"/><circle cx="17" cy="42" r="4.5" fill="${d}" opacity="0.55"/><circle cx="43" cy="42" r="4.5" fill="${d}" opacity="0.55"/><path d="M7,47 q23,-27 46,0" fill="none" stroke="${d}" stroke-width="1.2"/>`;
  if (kind === "wolf") return `<ellipse cx="28" cy="50" rx="17" ry="13" fill="${col}"/><path d="M43,52 q18,0 18,-16 q-12,2 -18,8 Z" fill="${col}"/><path d="M58,38 q4,8 0,14 q-6,-4 -6,-9 Z" fill="${shade(col, 1.22)}"/><circle cx="28" cy="28" r="14" fill="${col}"/><path d="M15,15 l-5,-13 l13,7 Z" fill="${col}"/><path d="M41,15 l5,-13 l-13,7 Z" fill="${col}"/><path d="M17,13 l-1,-6 l5,3 Z" fill="${d}"/><path d="M39,13 l1,-6 l-5,3 Z" fill="${d}"/><path d="M28,32 q-10,3 -14,10 q11,3 14,1 q3,2 14,-1 q-4,-7 -14,-10 Z" fill="${shade(col, 1.28)}"/>${eyes}<path d="M25,36 l6,0 l-3,4 Z" fill="${face}"/>`;
  return "";
}

export function buildDoll(c: DollConfig): string {
  const S: string[] = [];
  const sk = c.skin, hc = c.hairColor, dk = shade(sk, 0.9);
  // wings (behind)
  if (c.wings === "fairy") { const w = c.wingColor; S.push(`<g opacity="0.6"><ellipse cx="70" cy="196" rx="30" ry="46" fill="${w}" transform="rotate(-20 70 196)"/><ellipse cx="76" cy="250" rx="24" ry="34" fill="${w}" transform="rotate(-12 76 250)"/><ellipse cx="150" cy="196" rx="30" ry="46" fill="${w}" transform="rotate(20 150 196)"/><ellipse cx="144" cy="250" rx="24" ry="34" fill="${w}" transform="rotate(12 144 250)"/></g>`); }
  if (c.wings === "butterfly") { const w = c.wingColor, w2 = shade(w, 0.8); S.push(`<g opacity="0.7"><ellipse cx="66" cy="188" rx="30" ry="34" fill="${w}"/><ellipse cx="72" cy="244" rx="24" ry="28" fill="${w2}"/><ellipse cx="154" cy="188" rx="30" ry="34" fill="${w}"/><ellipse cx="148" cy="244" rx="24" ry="28" fill="${w2}"/><circle cx="60" cy="186" r="5" fill="#ffffffaa"/><circle cx="160" cy="186" r="5" fill="#ffffffaa"/></g>`); }
  // back hair
  if (c.hairStyle === "long") { S.push(`<rect x="34" y="90" width="22" height="188" rx="11" fill="${hc}"/><rect x="164" y="90" width="22" height="188" rx="11" fill="${hc}"/>`); }
  if (c.hairStyle === "buns") { S.push(`<circle cx="52" cy="50" r="25" fill="${hc}"/><circle cx="168" cy="50" r="25" fill="${hc}"/>`); }
  if (c.hairStyle === "pony") { S.push(`<ellipse cx="190" cy="150" rx="22" ry="62" fill="${hc}"/>`); }
  if (c.hairStyle === "pig") { S.push(`<ellipse cx="42" cy="158" rx="20" ry="46" fill="${hc}"/><ellipse cx="178" cy="158" rx="20" ry="46" fill="${hc}"/>`); }
  // legs
  S.push(`<rect x="90" y="248" width="16" height="78" rx="8" fill="${sk}"/><rect x="114" y="248" width="16" height="78" rx="8" fill="${sk}"/>`);
  // bottoms (skip for dress)
  if (c.top !== "dress") {
    const b = c.bottomColor;
    if (c.bottom === "skirt") S.push(`<path d="M70,230 L150,230 L164,282 Q110,296 56,282 Z" fill="${b}"/>`);
    if (c.bottom === "shorts") S.push(`<path d="M74,230 L146,230 L146,262 L114,266 L110,238 L106,266 L74,262 Z" fill="${b}"/>`);
    if (c.bottom === "pants") S.push(`<path d="M74,230 L146,230 L146,248 L108,250 L108,322 L92,322 L88,250 L74,248 Z" fill="${b}"/><rect x="88" y="230" width="20" height="94" rx="8" fill="${b}"/><rect x="112" y="230" width="20" height="94" rx="8" fill="${b}"/>`);
  }
  // shoes
  const sc = c.shoeColor, sol = "#ffffff";
  if (c.shoes === "sneakers") S.push(`<ellipse cx="98" cy="330" rx="17" ry="11" fill="${sc}"/><ellipse cx="122" cy="330" rx="17" ry="11" fill="${sc}"/><ellipse cx="98" cy="335" rx="17" ry="5" fill="${sol}"/><ellipse cx="122" cy="335" rx="17" ry="5" fill="${sol}"/>`);
  if (c.shoes === "boots") S.push(`<rect x="86" y="300" width="24" height="34" rx="8" fill="${sc}"/><rect x="110" y="300" width="24" height="34" rx="8" fill="${sc}"/><ellipse cx="98" cy="334" rx="15" ry="7" fill="${shade(sc, 0.7)}"/><ellipse cx="122" cy="334" rx="15" ry="7" fill="${shade(sc, 0.7)}"/>`);
  if (c.shoes === "flats") S.push(`<ellipse cx="98" cy="330" rx="15" ry="8" fill="${sc}"/><ellipse cx="122" cy="330" rx="15" ry="8" fill="${sc}"/>`);
  // arms
  S.push(`<rect x="58" y="156" width="16" height="86" rx="8" fill="${sk}"/><circle cx="66" cy="246" r="9" fill="${sk}"/><rect x="146" y="156" width="16" height="86" rx="8" fill="${sk}"/><circle cx="154" cy="246" r="9" fill="${sk}"/>`);
  // torso base
  S.push(`<rect x="82" y="150" width="56" height="98" rx="20" fill="${dk}"/>`);
  // top
  const tc = c.topColor, td = shade(tc, 0.82);
  const sleeves = `<circle cx="70" cy="162" r="18" fill="${tc}"/><circle cx="150" cy="162" r="18" fill="${tc}"/>`;
  if (c.top === "tee") { S.push(`<path d="M72,150 Q110,142 148,150 L152,242 Q110,252 68,242 Z" fill="${tc}"/>` + sleeves); }
  if (c.top === "stripes") { S.push(`<path d="M72,150 Q110,142 148,150 L152,242 Q110,252 68,242 Z" fill="${tc}"/>` + sleeves + `<g fill="#ffffffcc"><path d="M69,178 Q110,172 151,178 L151,188 Q110,182 69,188 Z"/><path d="M69,200 Q110,194 152,200 L152,210 Q110,204 69,210 Z"/><path d="M69,222 Q110,216 152,222 L152,232 Q110,226 69,232 Z"/></g>`); }
  if (c.top === "hoodie") { S.push(`<path d="M72,150 Q110,142 148,150 L152,242 Q110,252 68,242 Z" fill="${tc}"/>` + sleeves + `<path d="M84,148 Q110,166 136,148 Q138,136 110,134 Q82,136 84,148 Z" fill="${td}"/><rect x="90" y="204" width="40" height="26" rx="8" fill="${td}"/><rect x="102" y="150" width="3" height="20" fill="#ffffffaa"/><rect x="115" y="150" width="3" height="20" fill="#ffffffaa"/>`); }
  if (c.top === "tank") { S.push(`<path d="M82,152 L138,152 L148,242 Q110,252 72,242 Z" fill="${tc}"/><rect x="88" y="138" width="9" height="20" rx="4" fill="${tc}"/><rect x="123" y="138" width="9" height="20" rx="4" fill="${tc}"/>`); }
  if (c.top === "sweater") { S.push(`<path d="M72,150 Q110,142 148,150 L152,242 Q110,252 68,242 Z" fill="${tc}"/>` + sleeves + `<rect x="58" y="230" width="16" height="14" rx="6" fill="${td}"/><rect x="146" y="230" width="16" height="14" rx="6" fill="${td}"/><path d="M96,148 Q110,158 124,148" stroke="${td}" stroke-width="4" fill="none"/>`); }
  if (c.top === "dress") { S.push(`<path d="M72,150 Q110,142 148,150 L172,270 Q110,290 48,270 Z" fill="${tc}"/>` + sleeves + `<path d="M52,266 Q110,282 168,266" stroke="${td}" stroke-width="4" fill="none"/>`); }
  // neck + head
  S.push(`<rect x="99" y="140" width="22" height="22" rx="9" fill="${sk}"/><path d="M99,142 q11,7 22,0 v6 q-11,6 -22,0 Z" fill="${shade(sk, 0.9)}"/>`);
  S.push(`<ellipse cx="52" cy="108" rx="9" ry="12" fill="${sk}"/><ellipse cx="168" cy="108" rx="9" ry="12" fill="${sk}"/>`);
  // hair volume behind face
  if (c.hairStyle === "afro") { for (let i = 0; i < 12; i++) { const a = (Math.PI * 2 * i) / 12, x = 110 + Math.cos(a) * 68, y = 92 + Math.sin(a) * 62; S.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="26" fill="${hc}"/>`); } S.push(`<ellipse cx="110" cy="90" rx="70" ry="66" fill="${hc}"/>`); }
  else { S.push(`<path d="M110,24 C160,24 182,64 180,106 C179,132 172,150 166,166 L150,150 C158,120 156,96 150,86 C120,74 100,74 70,86 C64,96 62,120 70,150 L54,166 C48,150 41,132 40,106 C38,64 60,24 110,24 Z" fill="${hc}"/>`); }
  // face
  S.push(`<path d="M110,42 C148,42 166,74 165,104 C164,132 148,158 110,172 C72,158 56,132 55,104 C54,74 72,42 110,42 Z" fill="${sk}"/>`);
  // eyebrows
  const brow = shade(hc, 0.72);
  S.push(`<path d="M70,84 Q84,78 98,83" stroke="${brow}" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M122,83 Q136,78 150,84" stroke="${brow}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`);
  // large glossy anime eyes
  const ec = c.eye, ecd = shade(ec, 0.62), ecl = shade(ec, 1.35);
  const eye = (x: number) => `<g>
      <path d="M${x - 17},98 Q${x},90 ${x + 17},99 Q${x + 16},125 ${x},130 Q${x - 16},125 ${x - 17},98 Z" fill="#fff"/>
      <ellipse cx="${x}" cy="110" rx="14" ry="18" fill="${ec}"/>
      <ellipse cx="${x}" cy="116" rx="14" ry="12" fill="${ecd}"/>
      <ellipse cx="${x}" cy="100" rx="11" ry="6" fill="${ecl}" opacity="0.6"/>
      <ellipse cx="${x}" cy="112" rx="7" ry="10" fill="#1e1726"/>
      <circle cx="${x - 5}" cy="103" r="5.5" fill="#fff"/>
      <circle cx="${x + 5}" cy="118" r="3" fill="#ffffffcc"/>
      <path d="M${x - 18},96 Q${x - 4},87 ${x + 18},95 L${x + 16},103 Q${x - 2},94 ${x - 16},104 Z" fill="#2a2233"/>
      <path d="M${x + 15},95 l6,-4" stroke="#2a2233" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    </g>`;
  S.push(eye(83) + eye(137));
  // nose hint + blush + mouth
  S.push(`<path d="M110,116 l-3,6 q3,2 6,0 Z" fill="${shade(sk, 0.86)}"/>`);
  S.push(`<ellipse cx="66" cy="128" rx="10" ry="6" fill="#ff8fb0" opacity="0.45"/><ellipse cx="154" cy="128" rx="10" ry="6" fill="#ff8fb0" opacity="0.45"/>`);
  S.push(`<path d="M102,133 Q110,140 118,133" stroke="#a24b52" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M105,135 Q110,138 115,135" fill="#e58aa0"/>`);
  // pointed anime bangs + side locks + shine
  if (c.hairStyle !== "afro") {
    S.push(`<path d="M44,100 Q48,52 110,50 Q172,52 176,100 C168,92 160,90 150,102 C146,84 139,80 131,100 C125,82 117,80 110,100 C103,80 95,82 89,100 C81,80 74,84 70,102 C60,90 52,92 44,100 Z" fill="${hc}"/>`);
    S.push(`<path d="M46,98 Q40,142 56,172 L68,152 Q56,122 62,100 Z" fill="${hc}"/><path d="M174,98 Q180,142 164,172 L152,152 Q164,122 158,100 Z" fill="${hc}"/>`);
  } else {
    S.push(`<path d="M54,94 C64,86 74,86 82,98 C90,84 100,82 110,96 C120,82 130,84 138,98 C146,86 156,86 166,94 C150,80 130,76 110,76 C90,76 70,80 54,94 Z" fill="${hc}"/>`);
  }
  S.push(`<path d="M80,66 Q112,54 148,70" stroke="${shade(hc, 1.4)}" stroke-width="6" fill="none" opacity="0.45" stroke-linecap="round"/>`);
  // hat
  const ha = c.hatColor, had = shade(ha, 0.78);
  if (c.hat === "beanie") S.push(`<path d="M42,86 Q110,30 178,86 Q110,100 42,86 Z" fill="${ha}"/><rect x="42" y="80" width="136" height="14" rx="7" fill="${had}"/><circle cx="110" cy="34" r="10" fill="${had}"/>`);
  if (c.hat === "cap") S.push(`<path d="M48,88 Q110,38 172,88 Q110,98 48,88 Z" fill="${ha}"/><path d="M108,90 Q166,86 182,104 Q140,96 108,98 Z" fill="${had}"/>`);
  if (c.hat === "band") S.push(`<path d="M44,82 Q110,64 176,82" stroke="${ha}" stroke-width="13" fill="none" stroke-linecap="round"/>`);
  if (c.hat === "bow") S.push(`<g><path d="M138,58 L162,48 L162,80 L138,70 Z" fill="${ha}"/><path d="M182,58 L158,48 L158,80 L182,70 Z" fill="${ha}"/><circle cx="160" cy="64" r="8" fill="${had}"/></g>`);
  if (c.hat === "flowers") { const cols = ["#FF5CA8", "#FFC93C", "#4EA8FF", "#8367FF", "#2ED1B4"]; let x = 54; let s = ""; for (let i = 0; i < 6; i++) { s += `<circle cx="${x}" cy="${70 + (i % 2 ? 6 : 0)}" r="9" fill="${cols[i % cols.length]}"/><circle cx="${x}" cy="${70 + (i % 2 ? 6 : 0)}" r="3.5" fill="#fff"/>`; x += 21; } S.push(`<g>${s}</g>`); }
  // glasses (frame colour recolourable)
  const gc = c.glassesColor || "#3a3340", lens = "#ffffff33";
  if (c.glasses === "round") S.push(`<circle cx="84" cy="106" r="16" fill="${lens}" stroke="${gc}" stroke-width="4"/><circle cx="136" cy="106" r="16" fill="${lens}" stroke="${gc}" stroke-width="4"/><line x1="100" y1="106" x2="120" y2="106" stroke="${gc}" stroke-width="4"/>`);
  if (c.glasses === "square") S.push(`<rect x="68" y="93" width="32" height="26" rx="7" fill="${lens}" stroke="${gc}" stroke-width="4"/><rect x="120" y="93" width="32" height="26" rx="7" fill="${lens}" stroke="${gc}" stroke-width="4"/><line x1="100" y1="106" x2="120" y2="106" stroke="${gc}" stroke-width="4"/>`);
  if (c.glasses === "heart") { const h = (x: number) => `<path d="M${x},116 C${x - 18},100 ${x - 14},90 ${x},98 C${x + 14},90 ${x + 18},100 ${x},116 Z" fill="#ffffff22" stroke="${gc}" stroke-width="4"/>`; S.push(h(84) + h(136) + `<line x1="100" y1="103" x2="120" y2="103" stroke="${gc}" stroke-width="4"/>`); }
  if (c.glasses === "cateye") { const ce = (x: number) => `<path d="M${x - 16},108 Q${x - 18},95 ${x - 1},95 Q${x + 15},93 ${x + 16},104 Q${x + 16},117 ${x},117 Q${x - 14},117 ${x - 16},108 Z" fill="${lens}" stroke="${gc}" stroke-width="4"/>`; S.push(ce(84) + ce(136) + `<line x1="100" y1="104" x2="120" y2="104" stroke="${gc}" stroke-width="4"/>`); }
  if (c.glasses === "aviator") { const av = (x: number) => `<path d="M${x - 15},99 Q${x + 15},99 ${x + 15},108 Q${x + 14},121 ${x},122 Q${x - 14},121 ${x - 15},108 Q${x - 15},99 ${x - 15},99 Z" fill="${lens}" stroke="${gc}" stroke-width="4"/>`; S.push(av(84) + av(136) + `<line x1="100" y1="102" x2="120" y2="102" stroke="${gc}" stroke-width="4"/>`); }
  if (c.glasses === "hexagon") { const hx = (x: number) => `<polygon points="${x - 8},92 ${x + 8},92 ${x + 16},106 ${x + 8},120 ${x - 8},120 ${x - 16},106" fill="${lens}" stroke="${gc}" stroke-width="4"/>`; S.push(hx(84) + hx(136) + `<line x1="100" y1="106" x2="120" y2="106" stroke="${gc}" stroke-width="4"/>`); }
  // earrings
  const eac = c.earringColor || "#FFC93C", ead = shade(eac, 0.75);
  if (c.earrings !== "none" && c.earrings) {
    const ear = (x: number) => {
      if (c.earrings === "stud") return `<circle cx="${x}" cy="121" r="5" fill="${eac}"/>`;
      if (c.earrings === "hoop") return `<circle cx="${x}" cy="126" r="8" fill="none" stroke="${eac}" stroke-width="3"/>`;
      if (c.earrings === "dangle") return `<circle cx="${x}" cy="118" r="3.5" fill="${eac}"/><path d="M${x - 4},124 Q${x},137 ${x + 4},124 Q${x + 4},132 ${x},135 Q${x - 4},132 ${x - 4},124 Z" fill="${eac}"/>`;
      if (c.earrings === "flower") return flowerAt(x, 123, eac, ead, 0.7);
      if (c.earrings === "star") return starAt(x, 123, 7, eac);
      if (c.earrings === "pearl") return `<circle cx="${x}" cy="116" r="3.5" fill="${eac}"/><line x1="${x}" y1="119" x2="${x}" y2="126" stroke="${ead}" stroke-width="1.5"/><circle cx="${x}" cy="130" r="4.5" fill="${eac}"/><circle cx="${x - 1.5}" cy="128.5" r="1.3" fill="#ffffffcc"/>`;
      return "";
    };
    S.push(ear(52) + ear(168));
  }
  // necklace
  const nc = c.necklaceColor || "#FFC93C", nd = shade(nc, 0.75);
  if (c.necklace === "choker") S.push(`<path d="M88,153 Q110,164 132,153" stroke="${nc}" stroke-width="8" fill="none" stroke-linecap="round"/>`);
  if (c.necklace === "pendant") S.push(`<path d="M86,151 Q110,172 134,151" stroke="${nc}" stroke-width="3" fill="none"/><path d="M110,170 C104,163 106,157 110,161 C114,157 116,163 110,170 Z" fill="${nc}"/>`);
  if (c.necklace === "pearls") S.push(`<path d="M86,151 Q110,170 134,151" stroke="${nd}" stroke-width="2" fill="none"/>` + [[92, 157], [101, 163], [110, 166], [119, 163], [128, 157]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${nc}"/><circle cx="${x - 1.3}" cy="${y - 1.3}" r="1.1" fill="#ffffffcc"/>`).join(""));
  if (c.necklace === "chainstar") S.push(`<path d="M86,151 Q110,170 134,151" stroke="${nc}" stroke-width="2.5" fill="none"/>` + starAt(110, 172, 8, nc));
  if (c.necklace === "layered") S.push(`<path d="M92,151 Q110,163 128,151" stroke="${nd}" stroke-width="2.5" fill="none"/><path d="M86,151 Q110,177 134,151" stroke="${nc}" stroke-width="2.5" fill="none"/><circle cx="110" cy="177" r="4.5" fill="${nc}"/>`);
  if (c.necklace === "bowcharm") S.push(`<path d="M86,151 Q110,170 134,151" stroke="${nc}" stroke-width="3" fill="none"/><path d="M110,169 L100,163 L100,177 Z" fill="${nc}"/><path d="M110,169 L120,163 L120,177 Z" fill="${nc}"/><circle cx="110" cy="169" r="3.2" fill="${nd}"/>`);
  // bag
  const bg = c.bagColor, bgd = shade(bg, 0.78);
  if (c.bag === "backpack") S.push(`<rect x="150" y="176" width="24" height="56" rx="10" fill="${bg}"/><rect x="86" y="150" width="10" height="86" rx="5" fill="${bgd}"/><rect x="124" y="150" width="10" height="86" rx="5" fill="${bgd}"/>`);
  if (c.bag === "handbag") S.push(`<path d="M150,244 Q161,226 172,244" stroke="${bgd}" stroke-width="4" fill="none"/><rect x="142" y="242" width="36" height="28" rx="8" fill="${bg}"/>`);
  // pet companion (front, by the feet)
  if (c.pet && c.pet !== "none") S.push(`<g transform="translate(150,290) scale(1.05)">${buildPet(c.pet, c.petColor || PETDEF[c.pet])}</g>`);
  return `<svg viewBox="0 0 220 380" width="100%" xmlns="http://www.w3.org/2000/svg">${S.join("")}</svg>`;
}

export function petPreviewSvg(kind: string): string {
  return `<svg viewBox="-8 -8 76 76" width="100%" xmlns="http://www.w3.org/2000/svg">${buildPet(kind, PETDEF[kind] || "#FFB74D")}</svg>`;
}
