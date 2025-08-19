#!/usr/bin/env node
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { chromium } from "playwright";
import process from "process";
import { fileURLToPath } from "url";

/**
 * Scenic Valley Quilts – Automated Debugger
 *
 * Steps performed:
 * 1. Ensure the frontend production bundle is built (with sourcemaps).
 * 2. Perform a very naive duplicate-React check in the Vite bundle.
 * 3. Launch `wrangler pages dev` in the background to emulate the edge runtime.
 * 4. Launch a headless Chromium browser (via Playwright), load http://localhost:8788, and stream:
 *    – Browser console messages (errors & warnings)
 *    – Uncaught page errors
 *    – Failed network requests
 * 5. Shut everything down gracefully.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const frontendDir = path.join(rootDir, "frontend");
const distDir = path.join(frontendDir, "dist");

function run(cmd, cwd = rootDir) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, {
      cwd,
      shell: true,
      stdio: "inherit",
    });
    proc.on("exit", (code) => {
      code === 0 ? resolve() : reject(new Error(`${cmd} exited with code ${code}`));
    });
  });
}

function findFirstJsBundle() {
  try {
    const assetsDir = path.join(distDir, "assets");
    const files = fs.readdirSync(assetsDir);
    const jsFiles = files.filter((f) => f.endsWith(".js"));
    if (jsFiles.length === 0) return null;
    return path.join(assetsDir, jsFiles[0]);
  } catch {
    return null;
  }
}

function countReactCopies(bundlePath) {
  if (!bundlePath || !fs.existsSync(bundlePath)) return 0;
  const code = fs.readFileSync(bundlePath, "utf8");
  // Rough heuristic: look for the license header of React or for createElement string.
  const matches = code.match(/react\.production\.min\.js/g) || [];
  if (matches.length) return matches.length;
  // fallback: look for "useState(" occurrences – each React copy defines it once.
  const useStateMatches = code.match(/\.useState\(/g) || [];
  return Math.max(1, Math.round(useStateMatches.length / 5)); // heuristic
}

async function main() {
  console.log("\n[Debugger] Step 1/5 – Building frontend bundle (vite build)…\n");
  await run("npm run build", frontendDir);

  console.log("\n[Debugger] Step 2/5 – Checking bundle for duplicate React copies…\n");
  const bundlePath = findFirstJsBundle();
  const reactCopies = countReactCopies(bundlePath);
  console.log(`   → Detected ${reactCopies} potential React copy/copies in ${bundlePath || 'N/A'}`);

  console.log("\n[Debugger] Step 3/5 – Launching wrangler pages dev (background)…\n");
  const wrangler = spawn(
    "wrangler",
    [
      "pages",
      "dev",
      distDir,
      "--d1=DB",
      "--r2=R2",
      "--compatibility-date=2023-07-06",
    ],
    { cwd: rootDir, shell: true, stdio: "pipe" }
  );
  wrangler.stdout.on("data", (d) => process.stdout.write(`[wrangler] ${d}`));
  wrangler.stderr.on("data", (d) => process.stderr.write(`[wrangler] ${d}`));

  // Give wrangler a second to boot
  await new Promise((r) => setTimeout(r, 3000));

  console.log("\n[Debugger] Step 4/5 – Launching headless Chromium via Playwright…\n");
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      console.log(`[browser ${msg.type()}]`, msg.text());
    }
  });
  page.on("pageerror", (err) => {
    console.log("[page error]", err);
  });
  page.on("requestfailed", (req) => {
    console.log("[request failed]", req.url(), req.failure()?.errorText);
  });

  try {
    await page.goto("http://localhost:8788", { waitUntil: "load" });
    // wait a little for SPA to mount
    await page.waitForTimeout(6000);
  } catch (err) {
    console.error("[Debugger] Navigation failed:", err);
  }

  await browser.close();
  wrangler.kill("SIGINT");
  console.log("\n[Debugger] Step 5/5 – Finished. Wrangler stopped, browser closed. ✅\n");
}

main().catch((err) => {
  console.error("[Debugger] Unhandled error:", err);
  process.exit(1);
}); 