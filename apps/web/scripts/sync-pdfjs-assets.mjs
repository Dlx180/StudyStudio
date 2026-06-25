import { createRequire } from "node:module";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const webRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const pdfjsRoot = dirname(require.resolve("pdfjs-dist/package.json"));
const publicPdfjsRoot = join(webRoot, "public", "pdfjs");
const assetDirs = ["wasm", "cmaps", "standard_fonts", "iccs"];

mkdirSync(join(webRoot, "public"), { recursive: true });
rmSync(publicPdfjsRoot, { recursive: true, force: true });
mkdirSync(publicPdfjsRoot, { recursive: true });

for (const dir of assetDirs) {
  cpSync(join(pdfjsRoot, dir), join(publicPdfjsRoot, dir), { recursive: true });
}

console.log(`Synced PDF.js assets to ${publicPdfjsRoot}`);
