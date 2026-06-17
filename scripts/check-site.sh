#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
pages=(index.html experiments.html case.html)
port="${PORT:-8765}"

node "$root/scripts/sync-content.mjs"
node "$root/scripts/build-site.mjs"

count_matches() {
  { rg -o "$1" "$2" 2>/dev/null || true; } | wc -l | tr -d ' '
}

for page in "${pages[@]}"; do
  if [[ ! -f "$root/$page" ]]; then
    echo "Missing $page" >&2
    exit 1
  fi

  header_count="$(count_matches '<header\b' "$root/$page")"
  main_count="$(count_matches '<main\b' "$root/$page")"
  if [[ "$header_count" != "1" || "$main_count" != "1" ]]; then
    echo "$page should have exactly one header and one main landmark." >&2
    exit 1
  fi

  for tag in nav article section button; do
    open_count="$(count_matches "<$tag\b" "$root/$page")"
    close_count="$(count_matches "</$tag>" "$root/$page")"
    if [[ "$open_count" != "$close_count" ]]; then
      echo "$page has unbalanced <$tag> tags: $open_count opened, $close_count closed." >&2
      exit 1
    fi
  done
done

if rg --pcre2 -n "(href|src)=['\"]/(?!/)|url\\(/|localhost|file://" "$root" \
  -g '!*.map' -g '!.git/**' -g '!README.md' -g '!scripts/check-site.sh'; then
  echo "Found root-relative or local-only asset references." >&2
  exit 1
fi

ROOT="$root" node --input-type=module <<'NODE'
import fs from "node:fs";
import path from "node:path";

const root = process.env.ROOT;
const siteDataFiles = new Set(["js/content.js", "src/data/content.json"]);
const filesToCheck = [
  "index.html",
  "experiments.html",
  "case.html",
  "css/main.css",
  "css/main2.css",
  "css/theme.css",
  "js/content.js",
  "js/main.js",
  "js/site.js",
  "src/data/content.json",
  "favicon/manifest.json",
  "favicon/browserconfig.xml",
].filter((file) => fs.existsSync(path.join(root, file)));

const ignoredRef = /^(?:#|mailto:|tel:|https?:|data:|javascript:|about:blank|\/\/|var\()/i;
const mimeLike = /^[a-z]+\/[a-z0-9.+-]+$/i;
const rootAssetPath = /^(?:css|js|img|images|fonts|favicon|video|audio|assets)\//;
const pagePath = /^(?:index|case|experiments)\.html$/;
const assetDirectoryPath = /^(?:\.?\.?\/)?(?:css|js|img|images|fonts|favicon|video|audio|assets)\//i;
const assetExtensionPath = /^[^"',\s]+\.(?:html|css|js|png|jpe?g|gif|svg|ico|webp|avif|mp4|webm|mov|woff2?|ttf|otf|json|xml)(?:[#?].*)?$/i;

const cleanRef = (value) =>
  value
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/[?#].*$/, "");

const resolveRef = (ref, sourceFile) => {
  if (ref.startsWith("/")) return path.join(root, ref);
  if (pagePath.test(ref)) return path.join(root, ref);
  if (siteDataFiles.has(sourceFile) && rootAssetPath.test(ref)) {
    return path.join(root, ref);
  }
  return path.resolve(path.dirname(path.join(root, sourceFile)), ref);
};

const refsFrom = (source) => {
  const refs = [];
  const attrPattern = /\b(?:href|src|poster|data-video)=["']([^"']+)["']/g;
  const cssUrlPattern = /url\(\s*["']?([^"')]+)["']?\s*\)/g;
  const quotedAssetPattern = /["']([^"']+)["']/g;

  for (const pattern of [attrPattern, cssUrlPattern, quotedAssetPattern]) {
    let match;
    while ((match = pattern.exec(source))) {
      const ref = cleanRef(match[1]);
      if (
        !ref ||
        ignoredRef.test(ref) ||
        mimeLike.test(ref) ||
        !(assetDirectoryPath.test(ref) || assetExtensionPath.test(ref) || pagePath.test(ref))
      ) {
        continue;
      }
      refs.push(ref);
    }
  }

  return [...new Set(refs)];
};

const missing = [];
for (const file of filesToCheck) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  for (const ref of refsFrom(source)) {
    if (!fs.existsSync(resolveRef(ref, file))) {
      missing.push(`${file}: ${ref}`);
    }
  }
}

if (missing.length) {
  console.error("Missing local asset references:");
  for (const ref of missing) console.error(`  ${ref}`);
  process.exit(1);
}
NODE

python3 -m http.server "$port" --directory "$root" >/tmp/mxpf-site-check.log 2>&1 &
server_pid=$!
trap 'kill "$server_pid" 2>/dev/null || true' EXIT
sleep 1

for page in "${pages[@]}"; do
  code="$(curl -s -o /tmp/mxpf-check-page.html -w '%{http_code}' "http://127.0.0.1:$port/$page")"
  if [[ "$code" != "200" ]]; then
    echo "$page returned HTTP $code" >&2
    exit 1
  fi
done

echo "Site check passed on http://127.0.0.1:$port/"
