import fs from 'node:fs'; import path from 'node:path'
const key = (t) => JSON.stringify({ pass: t.pass, visible: t.visible ?? t.openedVisible, closed: t.closed,
  focus: (t.focusAfter ?? t.focusAfterOpen)?.where, outcome: t.outcome, exitedTo: t.exitedTo,
  hitCount: t.hitCount, side: t.side, overflow: t.overflow, attached: t.attached, aria: t.open ?? null,
  drift: t.driftPx ?? null, gap: t.gap ?? null, steps: t.steps?.map((s) => [s.rendered, s.overflow]) ?? null,
  escClosed: t.test?.startsWith('joyride') ? [t.closed, t.beaconAfter, t.focusAfter?.testid] : null })
const strip = (s) => s.replace(/react-aria\d+|_r_[0-9a-z_]+_?|«r[0-9a-z]+»|:r[0-9a-z]+:/g, 'ID')
for (const [a, b] of process.argv.slice(2).map((x) => x.split('='))) {
  const fa = fs.readdirSync(a).filter((f) => f.endsWith('.json')); const fb = fs.readdirSync(b).filter((f) => f.endsWith('.json'))
  let diffs = 0
  for (const f of new Set([...fa, ...fb])) {
    const A = fs.existsSync(path.join(a, f)) ? JSON.parse(fs.readFileSync(path.join(a, f))) : null
    const B = fs.existsSync(path.join(b, f)) ? JSON.parse(fs.readFileSync(path.join(b, f))) : null
    if (!A || !B) { console.log('MISSING', f, !A ? 'in old' : 'in new'); diffs++; continue }
    const ka = strip(key(A)), kb = strip(key(B))
    if (ka !== kb) { diffs++; console.log('DIFF', f, '\n  old', ka, '\n  new', kb) }
  }
  console.log(`${path.basename(b)} vs ${a}: ${fa.length}/${fb.length} files, ${diffs} differences`)
}
