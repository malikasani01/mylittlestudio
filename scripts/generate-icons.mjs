// One-off asset generator: rasterizes scripts/icon-source.svg into every
// icon size the app needs, plus static iPad "Add to Home Screen" splash
// screens. Re-run with `node scripts/generate-icons.mjs` any time the
// source icon design changes.
//
// Text is drawn with @napi-rs/canvas (not SVG <text>) because the SVG
// rasterizer here has no fontconfig and ignores embedded @font-face rules,
// so it silently substitutes a generic fallback font for any <text> node.
import sharp from "sharp";
import { mkdir, readFile, copyFile } from "node:fs/promises";
import path from "node:path";
import { GlobalFonts, createCanvas } from "@napi-rs/canvas";

const ROOT = path.resolve(import.meta.dirname, "..");
const ICON_SVG_PATH = path.join(ROOT, "scripts", "icon-source.svg");

const ICON_SIZES = [16, 32, 180, 192, 512];

// Portrait hardware-pixel sizes for the iPad models still on sale / in common use.
const IPAD_SPLASH_SIZES = [
  { width: 1536, height: 2048, name: "ipad-9.7-and-mini-and-air" },
  { width: 1620, height: 2160, name: "ipad-10.2" },
  { width: 1640, height: 2360, name: "ipad-air-10.9-and-ipad-10.9" },
  { width: 1668, height: 2224, name: "ipad-pro-10.5" },
  { width: 1668, height: 2388, name: "ipad-pro-11" },
  { width: 2048, height: 2732, name: "ipad-pro-12.9" },
];

const FONT_URLS = {
  baloo: "https://fonts.gstatic.com/s/baloo2/v23/wXK0E3kTposypRydzVT08TS3JnAmtdj9yppo_leP6HcMqzQ.woff2",
  quicksand: "https://fonts.gstatic.com/s/quicksand/v37/6xK-dSZaM9iE8KbpRA_LJ3z8mH9BOJvgkM0o58a-wjwxUD2GFw.woff2",
};

async function registerFonts() {
  const [baloo, quicksand] = await Promise.all([
    fetch(FONT_URLS.baloo).then((r) => r.arrayBuffer()),
    fetch(FONT_URLS.quicksand).then((r) => r.arrayBuffer()),
  ]);
  GlobalFonts.register(Buffer.from(baloo), "Baloo 2");
  GlobalFonts.register(Buffer.from(quicksand), "Quicksand");
}

function backgroundAndIconSvg(width, height) {
  const short = Math.min(width, height);
  const iconSize = short * 0.24;
  const cx = width / 2;
  const cy = height / 2 - short * 0.05;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="#FFF9F2"/>
    <g transform="translate(${cx - iconSize / 2}, ${cy - iconSize / 2})">
      <rect width="${iconSize}" height="${iconSize}" rx="${iconSize * 0.22}" fill="url(#g)"/>
      <path d="M${iconSize * 0.5} ${iconSize * 0.235}
               L${iconSize * 0.543} ${iconSize * 0.442}
               L${iconSize * 0.75} ${iconSize * 0.484}
               L${iconSize * 0.543} ${iconSize * 0.527}
               L${iconSize * 0.5} ${iconSize * 0.734}
               L${iconSize * 0.457} ${iconSize * 0.527}
               L${iconSize * 0.25} ${iconSize * 0.484}
               L${iconSize * 0.457} ${iconSize * 0.442}
               Z" fill="#FFFFFF"/>
    </g>
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#F7B8D4"/>
        <stop offset="100%" stop-color="#C9B6F2"/>
      </linearGradient>
    </defs>
  </svg>`;
}

function renderSplashText(width, height) {
  const short = Math.min(width, height);
  const iconSize = short * 0.24;
  const cy = height / 2 - short * 0.05;
  const titleSize = Math.round(short * 0.05);
  const taglineSize = Math.round(short * 0.026);
  const titleY = cy + iconSize * 0.78 + titleSize;
  const taglineY = titleY + taglineSize * 2.1;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.textAlign = "center";
  ctx.fillStyle = "#3D3545";
  ctx.font = `700 ${titleSize}px "Baloo 2"`;
  ctx.fillText("My Little Studio", width / 2, titleY);

  ctx.globalAlpha = 0.65;
  ctx.font = `500 ${taglineSize}px "Quicksand"`;
  ctx.fillText("Create. Imagine. Share Your Sparkle.", width / 2, taglineY);
  ctx.globalAlpha = 1;

  return canvas.toBuffer("image/png");
}

async function main() {
  const iconSvg = await readFile(ICON_SVG_PATH, "utf-8");

  // Refreshed general-purpose icon (used by manifest + favicon).
  await copyFile(ICON_SVG_PATH, path.join(ROOT, "public", "icon.svg"));
  await copyFile(ICON_SVG_PATH, path.join(ROOT, "src", "app", "icon.svg"));

  // Manifest / favicon PNGs.
  const iconsDir = path.join(ROOT, "public", "icons");
  await mkdir(iconsDir, { recursive: true });
  for (const size of ICON_SIZES) {
    await sharp(Buffer.from(iconSvg))
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `icon-${size}.png`));
  }

  // iOS home-screen icon: Next.js auto-detects src/app/apple-icon.png.
  await sharp(Buffer.from(iconSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(ROOT, "src", "app", "apple-icon.png"));

  // iPad "Add to Home Screen" launch splash screens.
  await registerFonts();
  const splashDir = path.join(ROOT, "public", "splash");
  await mkdir(splashDir, { recursive: true });
  for (const { width, height, name } of IPAD_SPLASH_SIZES) {
    const background = await sharp(Buffer.from(backgroundAndIconSvg(width, height))).png().toBuffer();
    const textLayer = renderSplashText(width, height);
    await sharp(background)
      .composite([{ input: textLayer, top: 0, left: 0 }])
      .png()
      .toFile(path.join(splashDir, `${name}-${width}x${height}.png`));
  }

  console.log(`Generated ${ICON_SIZES.length} icon sizes and ${IPAD_SPLASH_SIZES.length} splash screens.`);
}

main();
