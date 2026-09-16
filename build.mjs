import { execSync } from "child_process";
import fs from "fs";
import path from "path";

console.log("[Build] Building botcast-sdk with TypeScript compiler...");

// Clean dist
fs.rmSync("dist", { recursive: true, force: true });

// 1. Build ESM & Declarations
console.log("[Build] Compiling ESM and TypeScript declarations...");
execSync("npx tsc --project tsconfig.json", { stdio: "inherit" });

// 2. Build CommonJS
console.log("[Build] Compiling CommonJS modules...");
execSync("npx tsc --project tsconfig.cjs.json", { stdio: "inherit" });

// Helper to recursively copy files with extension mapping
function copyDir(src, dest, extMap = {}) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, path.join(dest, entry.name), extMap);
    } else {
      let destName = entry.name;
      for (const [fromExt, toExt] of Object.entries(extMap)) {
        if (destName.endsWith(fromExt)) {
          destName = destName.slice(0, -fromExt.length) + toExt;
          break;
        }
      }
      fs.copyFileSync(srcPath, path.join(dest, destName));
    }
  }
}

// 3. Organize into dist root
console.log("[Build] Organizing distribution bundles...");

// Copy ESM files as .js (and .d.ts, .d.ts.map)
copyDir("dist/esm", "dist", {});

// Copy CJS files as .cjs
copyDir("dist/cjs", "dist", { ".js": ".cjs" });

// Remove intermediate dirs
fs.rmSync("dist/esm", { recursive: true, force: true });
fs.rmSync("dist/cjs", { recursive: true, force: true });

console.log("[Build] Completed successfully.");
