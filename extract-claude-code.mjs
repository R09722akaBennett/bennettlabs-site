#!/usr/bin/env bun

/**
 * Download a specific version of Claude Code from npm,
 * then extract the original TypeScript source from its source map.
 *
 * Usage:
 *   bun extract-claude-code.mjs [version]
 *
 * Example:
 *   bun extract-claude-code.mjs 2.1.88
 *   bun extract-claude-code.mjs          # defaults to 2.1.88
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync, readdirSync, statSync } from "fs";
import { join, resolve, dirname } from "path";

const PACKAGE_NAME = "@anthropic-ai/claude-code";
const version = process.argv[2] || "2.1.88";
const baseDir = resolve("claude-code-source");
const versionDir = join(baseDir, version);
const extractedDir = join(versionDir, "src-extracted");

// Step 1: Download the npm package
console.log(`\n=== Step 1: Download ${PACKAGE_NAME}@${version} ===\n`);

if (existsSync(join(versionDir, "cli.js.map"))) {
  console.log(`Package already downloaded at ${versionDir}, skipping.`);
} else {
  mkdirSync(versionDir, { recursive: true });

  console.log(`Downloading ${PACKAGE_NAME}@${version}...`);
  const tarball = execSync(`npm pack ${PACKAGE_NAME}@${version}`, {
    encoding: "utf8",
    cwd: baseDir,
  }).trim();
  const tarballPath = resolve(baseDir, tarball);

  console.log(`Extracting to ${versionDir}...`);
  execSync(`tar -xzf "${tarballPath}" --strip-components=1`, { cwd: versionDir });
  unlinkSync(tarballPath);

  console.log(`Done. Package extracted to ${versionDir}`);
}

// Step 2: Check for source map
const mapFile = join(versionDir, "cli.js.map");

if (!existsSync(mapFile)) {
  console.error(`\nError: ${mapFile} not found. This version may not include a source map.`);
  process.exit(1);
}

const mapSize = statSync(mapFile).size;
console.log(`\n=== Step 2: Parse source map (${(mapSize / 1024 / 1024).toFixed(1)} MB) ===\n`);

const map = JSON.parse(readFileSync(mapFile, "utf8"));

if (!map.sources || !map.sourcesContent) {
  console.error("Error: source map missing sources or sourcesContent.");
  process.exit(1);
}

console.log(`Source map version: ${map.version}`);
console.log(`Total sources: ${map.sources.length}`);
console.log(`Total sourcesContent: ${map.sourcesContent.length}`);

// Step 3: Extract source files (skip node_modules)
console.log(`\n=== Step 3: Extract source files ===\n`);

mkdirSync(extractedDir, { recursive: true });

let written = 0;
let skipped = 0;

for (let i = 0; i < map.sources.length; i++) {
  const src = map.sources[i];
  const content = map.sourcesContent[i];

  if (src.includes("node_modules") || content == null) {
    skipped++;
    continue;
  }

  const cleaned = src.replace(/^(\.\.\/)+(\.\/)?/, "");
  const outPath = resolve(extractedDir, cleaned);

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, content);
  written++;
}

console.log(`Wrote ${written} source files to ${extractedDir}`);
console.log(`Skipped ${skipped} (node_modules or empty)`);

// Step 4: Summary
console.log(`\n=== Summary ===\n`);

function countFiles(dir) {
  let count = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) count += countFiles(full);
    else count++;
  }
  return count;
}

const totalFiles = countFiles(extractedDir);
const topDirs = readdirSync(extractedDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

console.log(`Total files extracted: ${totalFiles}`);
console.log(`Top-level directories: ${topDirs.join(", ") || "(none)"}`);
console.log(`Output: ${extractedDir}`);
console.log(`\nDone.`);
