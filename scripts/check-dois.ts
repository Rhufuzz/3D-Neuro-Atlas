#!/usr/bin/env node
// Verify that every DOI in lib/data/citations.ts resolves at doi.org.
// Usage: node --import tsx scripts/check-dois.mjs [--strict]
//   default: report only (exit 0)
//   --strict: exit 1 if any DOI does not resolve
import { CITATIONS } from '../lib/data/citations';

const strict = process.argv.includes('--strict');
const seen = new Set();
let ok = 0, fail = 0, blocked = 0;

async function main() {
for (const c of CITATIONS) {
  if (seen.has(c.doi)) { continue; }
  seen.add(c.doi);
  process.stdout.write(`${c.doi} … `);
  let status = 0;
  for (let attempt = 0; attempt < 2 && !status; attempt++) {
    try {
      const r = await fetch(`https://doi.org/${c.doi}`, {
        method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(15000),
        headers: { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0 Safari/537.36', accept: 'text/html' },
      });
      status = r.status;
      if (status === 405) {
        // some publishers reject HEAD; fall back to a ranged GET
        const g = await fetch(`https://doi.org/${c.doi}`, { redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'Mozilla/5.0', accept: 'text/html', range: 'bytes=0-0' } });
        status = g.status;
      }
    } catch {
      status = 0;
    }
  }
  // 403/429 = publisher bot-wall (Cloudflare etc.), not a dead DOI
  if (status && status < 400) { ok++; console.log('OK'); }
  else if (status === 403 || status === 429) { blocked++; console.log('blocked (bot-wall)'); }
  else { fail++; console.log(`FAIL (HTTP ${status || 'network'})  ${c.id} — ${c.authors} (${c.year})`); }
}

  console.log(`\n${CITATIONS.length} citations, ${seen.size} unique DOIs: ${ok} resolve, ${blocked} blocked by publisher, ${fail} failed`);
  if (strict && fail > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
