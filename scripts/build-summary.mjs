// Build results.summary: installed version, React 19 peer support (semver check of the installed
// package's peerDependencies.react against the installed react version), metadata and extra lines.
// Uses the semver copy bundled with npm (found via `npm root -g`), since semver is not a project dependency.
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'

const npmRoot = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim()
const semver = createRequire(import.meta.url)(`${npmRoot}/npm/node_modules/semver`)
const data = JSON.parse(fs.readFileSync('results/results.json', 'utf8'))
const reactVersion = JSON.parse(fs.readFileSync('node_modules/react/package.json', 'utf8')).version

const ROWS = {
  'no-library-A': { label: 'No library (A, absolute)' },
  'no-library-B': { label: 'No library (B, portal)' },
  native: { label: 'Native Popover API + CSS anchor positioning' },
  'floating-ui': { label: 'Floating UI', pkg: '@floating-ui/react' },
  radix: { label: 'Radix', pkg: 'radix-ui' },
  'react-aria': { label: 'React Aria Components', pkg: 'react-aria-components' },
  'base-ui': { label: 'Base UI', pkg: '@base-ui/react' },
  'react-tiny-popover': { label: 'react-tiny-popover', pkg: 'react-tiny-popover' },
}
const summary = {}
for (const [impl, row] of Object.entries(ROWS)) {
  const out = { label: row.pkg ? `${row.label} (\`${row.pkg}\`)` : row.label }
  if (row.pkg) {
    const pj = JSON.parse(fs.readFileSync(`node_modules/${row.pkg}/package.json`, 'utf8'))
    const range = pj.peerDependencies?.react ?? null
    out.version = pj.version
    out.reactPeerRange = range
    out.react19 = range ? `${semver.satisfies(reactVersion, range) ? 'yes' : 'no'} (\`${range}\`)` : 'no react peer listed'
    const m = data.metadata?.[impl] ?? {}
    out.lastPublish = m.lastPublish ? m.lastPublish.slice(0, 10) : ''
    out.weeklyDownloads = m.weeklyDownloads ?? null
    out.stars = m.stars ?? null
  } else {
    out.version = impl === 'native' ? 'browser built-in' : 'n/a'
    out.react19 = 'n/a'
  }
  const l = data.lines?.[impl]
  out.extraLines = l?.diffAdded ?? (['react-aria', 'base-ui'].includes(impl) ? 0 : null)
  summary[impl] = out
}
fs.writeFileSync('results/results.json', JSON.stringify({ ...data, reactVersion, summary }, null, 2))
console.log(`react installed: ${reactVersion}`)
for (const [k, v] of Object.entries(summary)) console.log(k, JSON.stringify(v))
