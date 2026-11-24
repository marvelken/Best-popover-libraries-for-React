// Compare repeated runs (results/runs/<prefix>-runN) on the fields that decide each result.
import fs from 'node:fs'
import path from 'node:path'
const prefix = process.argv[2] ?? 'default'
const runs = fs.readdirSync('results/runs').filter((d) => d.startsWith(prefix + '-run')).sort()
const key = (t) => JSON.stringify({
  pass: t.pass, visible: t.visible ?? t.openedVisible, closed: t.closed,
  focus: (t.focusAfter ?? t.focusAfterOpen)?.where, outcome: t.outcome, exitedTo: t.exitedTo,
  hitCount: t.hitCount, side: t.side, overflow: t.overflow, attached: t.attached,
  aria: t.open ?? null,
})
const files = fs.readdirSync(path.join('results/runs', runs[0]))
let diffs = 0
for (const f of files) {
  const vals = runs.map((r) => {
    const p = path.join('results/runs', r, f)
    return fs.existsSync(p) ? key(JSON.parse(fs.readFileSync(p, 'utf8'))) : 'MISSING'
  })
  if (new Set(vals).size > 1) {
    diffs++
    console.log(`DIFF ${f}`)
    runs.forEach((r, i) => console.log(`  ${r}: ${vals[i]}`))
  }
}
console.log(`compared ${files.length} results across ${runs.length} runs (${runs.join(', ')}): ${diffs} differ`)
