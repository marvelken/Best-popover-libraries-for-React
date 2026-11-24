// Merge results/raw/<variant>/*.json and results/raw/browser-*.json into results/results.json.
// Keeps any other top-level keys already in results.json (lines, npm, github, joyride...).
import fs from 'node:fs'
import path from 'node:path'

const out = 'results/results.json'
const prev = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : {}
const raw = 'results/raw'
const browsers = {}
for (const f of fs.readdirSync(raw).filter((f) => f.startsWith('browser-'))) {
  const b = JSON.parse(fs.readFileSync(path.join(raw, f), 'utf8'))
  browsers[b.project] = { version: b.version, userAgent: b.userAgent }
}
const tests = { ...(prev.tests ?? {}) }
for (const variant of fs.readdirSync(raw).filter((d) => fs.statSync(path.join(raw, d)).isDirectory())) {
  tests[variant] = []
  for (const f of fs.readdirSync(path.join(raw, variant)).sort()) {
    tests[variant].push(JSON.parse(fs.readFileSync(path.join(raw, variant, f), 'utf8')))
  }
}
fs.writeFileSync(out, JSON.stringify({ ...prev, browsers, tests }, null, 2))
console.log(`wrote ${out}: ` + Object.entries(tests).map(([v, r]) => `${v}=${r.length}`).join(', '))
