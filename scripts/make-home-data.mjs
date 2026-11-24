// Build src/home/home-data.json for the route index page from results/results.json.
// Copies values only (no arithmetic besides counting rows), so the page shows the same numbers as the article tables.
//   node scripts/make-home-data.mjs
import fs from 'node:fs'

const data = JSON.parse(fs.readFileSync('results/results.json', 'utf8'))
const pick = (rows) => rows.map((r) => ({ impl: r.impl, browser: r.browser, test: r.test, pass: typeof r.pass === 'boolean' ? r.pass : null, outcome: r.outcome ?? null }))

const out = {
  generatedFrom: 'results/results.json',
  reactVersion: data.reactVersion ?? null,
  browsers: Object.fromEntries(Object.entries(data.browsers).map(([k, v]) => [k, v.version])),
  summary: data.summary,
  default: pick(data.tests.default),
  fixed: pick(data.tests.fixed ?? []),
  resultCount: data.tests.default.length + (data.tests.fixed ?? []).length,
}
fs.writeFileSync('src/home/home-data.json', JSON.stringify(out, null, 1) + '\n')
console.log(`wrote src/home/home-data.json: ${out.default.length} default rows, ${out.fixed.length} fixed rows`)
