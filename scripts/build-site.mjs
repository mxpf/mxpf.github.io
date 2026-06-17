#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const srcRoot = join(root, "src");
const pageRoot = join(srcRoot, "pages");
const partialRoot = join(srcRoot, "partials");

const pages = [
  ["index.html", "index.html"],
  ["experiments.html", "experiments.html"],
  ["case.html", "case.html"],
];

const includePattern = /\{\{\>\s*([a-zA-Z0-9_./-]+)\s*\}\}/g;

function readPartial(name, stack = []) {
  const partialPath = join(partialRoot, `${name}.html`);
  if (stack.includes(name)) {
    throw new Error(`Circular include detected: ${[...stack, name].join(" -> ")}`);
  }

  let source;
  try {
    source = readFileSync(partialPath, "utf8");
  } catch {
    throw new Error(`Missing partial: ${name} (${partialPath})`);
  }

  return render(source, [...stack, name]);
}

function render(source, stack = []) {
  return source.replace(includePattern, (_match, name) => readPartial(name, stack));
}

for (const [sourceName, outputName] of pages) {
  const sourcePath = join(pageRoot, sourceName);
  const outputPath = join(root, outputName);
  const source = readFileSync(sourcePath, "utf8");
  const output = render(source).replace(/\n{2,}$/u, "\n");

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, output);
  console.log(`Built ${outputName}`);
}
