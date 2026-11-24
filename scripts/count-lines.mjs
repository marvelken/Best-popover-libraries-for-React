// Count non-blank, non-comment lines per implementation file, and lines added by each "-fixed" variant.
// Comment lines: lines whose trimmed text starts with //, /*, * or {/*. Writes results.lines in results/results.json.
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'

const FILES = {
  'no-library-A': 'src/routes/NoLibraryAbsolute.tsx',
  'no-library-B': 'src/routes/NoLibraryPortal.tsx',
  native: 'src/routes/Native.tsx',
  'floating-ui': 'src/routes/FloatingUi.tsx',
  radix: 'src/routes/Radix.tsx',
  'react-aria': 'src/routes/ReactAria.tsx',
  'base-ui': 'src/routes/BaseUi.tsx',
  'react-tiny-popover': 'src/routes/ReactTinyPopover.tsx',
  joyride: 'src/routes/Joyride.tsx',
}
const FIXED = {
  native: 'src/routes/NativeFixed.tsx',
  'floating-ui': 'src/routes/FloatingUiFixed.tsx',
  radix: 'src/routes/RadixFixed.tsx',
  'react-tiny-popover': 'src/routes/ReactTinyPopoverFixed.tsx',
}
const isCode = (l) => {
  const t = l.trim()
  return t !== '' && !t.startsWith('//') && !t.startsWith('/*') && !t.startsWith('*') && !t.startsWith('{/*')
}
const count = (f) => fs.readFileSync(f, 'utf8').split('\n').filter(isCode).length

function diffStats(a, b) {
  let out = ''
  try {
    out = execFileSync('git', ['diff', '--no-index', '-U0', '--', a, b], { encoding: 'utf8' })
  } catch (e) {
    out = e.stdout // git diff --no-index exits 1 when files differ
  }
  // Bookkeeping lines (renamed default export, "(extra work)" page title) are not extra work.
  const bookkeeping = (l) => /export default function|<Dashboard title=/.test(l)
  const lines = out.split('\n').filter((l) => !bookkeeping(l))
  const added = lines.filter((l) => l.startsWith('+') && !l.startsWith('+++') && isCode(l.slice(1))).length
  const removed = lines.filter((l) => l.startsWith('-') && !l.startsWith('---') && isCode(l.slice(1))).length
  return { added, removed }
}

const lines = {}
for (const [impl, f] of Object.entries(FILES)) {
  lines[impl] = { file: f, codeLines: count(f) }
  if (FIXED[impl]) {
    const d = diffStats(f, FIXED[impl])
    lines[impl].fixedFile = FIXED[impl]
    lines[impl].fixedCodeLines = count(FIXED[impl])
    lines[impl].diffAdded = d.added
    lines[impl].diffRemoved = d.removed
  }
}
const out = 'results/results.json'
const data = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : {}
fs.writeFileSync(out, JSON.stringify({ ...data, lines }, null, 2))
console.log('| Implementation | File | Code lines (default) | Fixed file code lines | Extra lines (added or modified) | Original lines replaced |')
console.log('|---|---|---|---|---|---|')
for (const [impl, l] of Object.entries(lines)) {
  console.log(`| ${impl} | \`${l.file}\` | ${l.codeLines} | ${l.fixedCodeLines ?? ''} | ${l.diffAdded ?? ''} | ${l.diffRemoved ?? ''} |`)
}
