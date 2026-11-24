// Generate Markdown tables from results/results.json.
//   node scripts/make-tables.mjs tests <variant>   -> per-test table for one variant
//   node scripts/make-tables.mjs summary           -> summary table (needs lines/npm/github/peer data in results.json)
// Numbers are rounded to 1 decimal by this script for display; results.json keeps full precision.
import fs from 'node:fs'

const data = JSON.parse(fs.readFileSync('results/results.json', 'utf8'))
const mode = process.argv[2] ?? 'tests'
const BROWSERS = [
  ['chromium', 'C'],
  ['webkit', 'W'],
  ['webkit-option-tab', 'W⌥'],
  ['firefox', 'F'],
]
const IMPL_ORDER = ['no-library-A', 'no-library-B', 'native', 'floating-ui', 'radix', 'react-aria', 'base-ui', 'react-tiny-popover']
const r1 = (n) => (typeof n === 'number' ? Math.round(n * 10) / 10 : n)
const pf = (p) => (p === true ? 'pass' : p === false ? 'FAIL' : '')

function cell(t) {
  if (!t) return 'n/a'
  const f = (x) => x?.where ?? '?'
  switch (t.test) {
    case '1-keyboard-open':
      return t.tabsToReachTrigger === -1 ? 'FAIL (Tab never reached trigger)' : `${pf(t.pass)}, focus: ${f(t.focusAfterOpen)}`
    case '2-escape':
      if (!t.openedVisible) return 'FAIL (could not open by keyboard)'
      if (!t.focusInsideBeforeEscape) return `FAIL (focus never inside after ${t.tabsToMoveFocusInside} Tabs), ${t.closed ? 'closed' : 'stayed open'}`
      return `${pf(t.pass)}, ${t.closed ? 'closed' : 'stayed open'}, focus: ${f(t.focusAfter)}`
    case '3-choose-option':
      if (!t.reachedUser) return `FAIL ("User" not reached in ${t.tabsToUser} Tabs)`
      return `${pf(t.pass)}, ${t.closed ? 'closed' : 'stayed open'}, focus: ${f(t.focusAfter)}`
    case '4-outside-click':
      return `${pf(t.pass)}, ${t.closed ? 'closed' : 'stayed open'}, focus: ${f(t.focusAfter)}`
    case '5-tab-past-end':
      if (t.outcome === 'never-entered-popover') return 'never entered popover'
      if (t.outcome === 'trapped') return 'trapped inside, stays open'
      return `${t.pressesToEnterPopover > 0 ? `entered after ${t.pressesToEnterPopover} Tab presses; ` : ''}left to ${t.exitedTo.startsWith('body') ? 'body' : t.exitedTo}, ${t.openAtExit ? 'stays open' : 'closes'}`
    case '6-edge': {
      const o = t.overflow ?? {}
      const over = Object.entries(o).filter(([, v]) => v > 0).map(([k, v]) => `${k} ${r1(v)}px`).join(', ')
      return `${pf(t.pass)}, side: ${t.side}${over ? `, overflow ${over}` : ''}`
    }
    case '7-clipping':
      return `${pf(t.pass)}, ${t.hitCount}/5 points visible`
    case '8-scroll':
      return t.outcome === 'drifted' ? `FAIL, drifted ${r1(t.driftPx.vertical)}px` : `${pf(t.pass)}, ${t.outcome}`
    case '9-aria': {
      const ex = `${t.closed.ariaExpanded ?? '–'}→${t.open.ariaExpanded ?? '–'}`
      const ax = t.axChromium ? `; Chromium AX expanded ${t.axChromium.triggerClosed?.expanded ?? '–'}→${t.axChromium.triggerOpen?.expanded ?? '–'}` : ''
      return `${pf(t.pass)}, expanded ${ex}, haspopup ${t.open.ariaHaspopup ?? '–'}, controls ${t.open.ariaControls ? 'yes' : '–'}, role ${t.popover?.role ?? '–'}, name "${t.popover?.accessibleName ?? ''}"${ax}`
    }
    case '10-open-after-scroll':
      return t.attached ? `${pf(t.pass)}, attached` : `FAIL, ${r1(t.gap?.below)}px from trigger bottom`
  }
  return JSON.stringify(t)
}

function testsTable(variant) {
  const rows = data.tests[variant]
  const tests = [...new Set(rows.map((r) => r.test))].sort((a, b) => parseInt(a) - parseInt(b))
  const impls = IMPL_ORDER.filter((i) => rows.some((r) => r.impl === i))
  const out = []
  out.push(`Browsers: C = Chromium ${data.browsers.chromium?.version}, W = WebKit ${data.browsers.webkit?.version} (plain Tab), W⌥ = WebKit ${data.browsers['webkit-option-tab']?.version} (Option+Tab), F = Firefox ${data.browsers.firefox?.version}. When every browser gives the same result the cell shows it once.`)
  out.push('')
  for (const test of tests) {
    out.push(`**Test ${test}**`)
    out.push('')
    out.push('| Implementation | Result |')
    out.push('|---|---|')
    for (const impl of impls) {
      const per = BROWSERS.map(([b, abbr]) => [abbr, cell(rows.find((r) => r.impl === impl && r.browser === b && r.test === test))])
      const uniq = [...new Set(per.map(([, c]) => c))]
      const text = uniq.length === 1 ? `all: ${uniq[0]}` : per.map(([a, c]) => `${a}: ${c}`).join('<br>')
      out.push(`| ${impl} | ${text.replace(/\|/g, '\\|')} |`)
    }
    out.push('')
  }
  return out.join('\n')
}

function summaryTable() {
  const s = data.summary ?? {}
  const final = data.tests.fixed ?? []
  const def = data.tests.default
  const header = ['Library', 'Installed version', 'Last publish', 'Weekly downloads', 'GitHub stars', 'React 19 peer support', 'Focus on open (C/F)', 'Focus return on close (Escape, C/F)', 'Edge positioning (C)', 'Clipping (C)', 'Extra work needed (lines added)']
  const out = ['| ' + header.join(' | ') + ' |', '|' + header.map(() => '---').join('|') + '|']
  for (const impl of IMPL_ORDER) {
    const row = s[impl]
    if (!row) continue
    const get = (test, browser = 'chromium') => def.find((r) => r.impl === impl && r.browser === browser && r.test === test)
    const focusOpen = [...new Set(['chromium', 'firefox'].map((b) => get('1-keyboard-open', b)?.focusAfterOpen?.where))].join(' / ')
    const esc = [...new Set(['chromium', 'firefox'].map((b) => cell(get('2-escape', b))))].join(' / ')
    const fx = (test) => final.find((r) => r.impl === impl && r.browser === 'chromium' && r.test === test)
    const withFix = (test) => (fx(test) && fx(test).pass !== get(test).pass ? ` → after extra work: ${cell(fx(test))}` : '')
    out.push('| ' + [
      row.label,
      row.version ?? '',
      row.lastPublish ?? '',
      row.weeklyDownloads != null ? row.weeklyDownloads.toLocaleString('en-US') : '',
      row.stars != null ? row.stars.toLocaleString('en-US') : '',
      row.react19 ?? '',
      focusOpen,
      esc + withFix('2-escape'),
      cell(get('6-edge')) + withFix('6-edge'),
      cell(get('7-clipping')) + withFix('7-clipping'),
      row.extraLines != null ? String(row.extraLines) : '',
    ].map((c) => String(c).replace(/\|/g, '\\|')).join(' | ') + ' |')
  }
  return out.join('\n')
}

console.log(mode === 'summary' ? summaryTable() : testsTable(process.argv[3] ?? 'default'))
