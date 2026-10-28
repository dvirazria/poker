// Copies the generated web app (repo root, built by build.py) into www/ for the iOS shell.
// www/ is a build artifact -- never edit it; edit kupa-sgura.html and run build.py instead.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const www = join(import.meta.dirname, "www");
const FILES = ["index.html", "manifest.webmanifest", "privacy.html", "terms.html",
  "icon-180.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png"];

rmSync(www, { recursive: true, force: true });
mkdirSync(www);
for (const f of FILES) cpSync(join(root, f), join(www, f));

// The website loads supabase-js from a CDN at whatever 2.x is newest. The app ships its own copy
// instead, pinned in package.json: App Review expects the code to be in the bundle, and the app
// then connects without depending on the CDN being reachable.
const CDN_SUPABASE = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
const LOCAL_SUPABASE = "./vendor/supabase.js";
mkdirSync(join(www, "vendor"));
cpSync(join(import.meta.dirname, "node_modules/@supabase/supabase-js/dist/umd/supabase.js"), join(www, "vendor/supabase.js"));
const indexPath = join(www, "index.html");
const html = readFileSync(indexPath, "utf8");
const uses = html.split(CDN_SUPABASE).length - 1;
// the <script> tag and the reconnect retry: if either moved, fail loudly rather than ship the CDN
if (uses !== 2) throw new Error("sync-web: expected the supabase-js CDN URL twice in index.html, found " + uses);
writeFileSync(indexPath, html.split(CDN_SUPABASE).join(LOCAL_SUPABASE));

console.log("www/ <- " + FILES.join(", ") + ", vendor/supabase.js");
