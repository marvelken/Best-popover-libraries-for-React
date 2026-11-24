import './home.css'
import data from './home-data.json'

type Row = { impl: string; browser: string; test: string; pass: boolean | null; outcome: string | null }
type Summary = {
  label: string
  version?: string
  react19?: string
  lastPublish?: string
  weeklyDownloads?: number
  stars?: number
  extraLines?: number | null
}

const BROWSERS: [key: string, short: string, name: string][] = [
  ['chromium', 'Cr', 'Chromium'],
  ['webkit', 'WK', 'WebKit (plain Tab)'],
  ['webkit-option-tab', 'WK⌥', 'WebKit (Option+Tab)'],
  ['firefox', 'Fx', 'Firefox'],
]

const TESTS: [id: string, short: string][] = [
  ['1-keyboard-open', 'Keyboard open'],
  ['2-escape', 'Escape'],
  ['3-choose-option', 'Choose option'],
  ['4-outside-click', 'Outside click'],
  ['5-tab-past-end', 'Tab past end'],
  ['6-edge', 'Edge'],
  ['7-clipping', 'Clipping'],
  ['8-scroll', 'Scroll'],
  ['9-aria', 'ARIA'],
  ['10-open-after-scroll', 'Open after scroll'],
]

type Card = {
  impl: string
  name: string
  pkg?: string
  kind: 'library' | 'platform' | 'baseline'
  route: string
  fixedRoute?: string
  accent: string
}

const CARDS: Card[] = [
  { impl: 'react-aria', name: 'React Aria', pkg: 'react-aria-components', kind: 'library', route: '/react-aria', accent: '#7c3aed' },
  { impl: 'base-ui', name: 'Base UI', pkg: '@base-ui/react', kind: 'library', route: '/base-ui', accent: '#0f766e' },
  { impl: 'floating-ui', name: 'Floating UI', pkg: '@floating-ui/react', kind: 'library', route: '/floating-ui', fixedRoute: '/floating-ui-fixed', accent: '#e11d48' },
  { impl: 'radix', name: 'Radix', pkg: 'radix-ui', kind: 'library', route: '/radix', fixedRoute: '/radix-fixed', accent: '#2563eb' },
  { impl: 'native', name: 'Native Popover API', pkg: 'popover + CSS anchor positioning', kind: 'platform', route: '/native', fixedRoute: '/native-fixed', accent: '#ea580c' },
  { impl: 'react-tiny-popover', name: 'react-tiny-popover', pkg: 'react-tiny-popover', kind: 'library', route: '/react-tiny-popover', fixedRoute: '/react-tiny-popover-fixed', accent: '#ca8a04' },
  { impl: 'no-library-A', name: 'No library · absolute', pkg: 'position: absolute in the cell', kind: 'baseline', route: '/no-library', accent: '#64748b' },
  { impl: 'no-library-B', name: 'No library · portal', pkg: 'createPortal + getBoundingClientRect', kind: 'baseline', route: '/no-library-portal', accent: '#475569' },
]

const rows = data.default as Row[]
const fixedRows = data.fixed as Row[]
const summary = data.summary as Record<string, Summary>
const browsers = data.browsers as Record<string, string>

const fmt = (n?: number) => (n == null ? '—' : n.toLocaleString('en-US'))
const find = (list: Row[], impl: string, browser: string, test: string) =>
  list.find((r) => r.impl === impl && r.browser === browser && r.test === test)

function Cell({ row }: { row?: Row }) {
  const state = !row ? 'none' : row.pass === true ? 'pass' : row.pass === false ? 'fail' : 'observed'
  const label = !row ? 'not run' : row.pass === null ? `observed: ${row.outcome ?? ''}` : row.pass ? 'pass' : 'fail'
  return <span className={`dot dot-${state}`} title={label} aria-label={label} />
}

function Matrix({ impl, list }: { impl: string; list: Row[] }) {
  return (
    <div className="matrix" role="table" aria-label="Test results by browser">
      <div className="matrix-row matrix-head" role="row">
        <span role="columnheader" />
        {TESTS.map(([id]) => (
          <span key={id} role="columnheader" className="matrix-num" title={TESTS.find((t) => t[0] === id)?.[1]}>
            {parseInt(id)}
          </span>
        ))}
      </div>
      {BROWSERS.map(([b, short, name]) => (
        <div key={b} className="matrix-row" role="row">
          <span role="rowheader" className="matrix-browser" title={name}>{short}</span>
          {TESTS.map(([id, label]) => (
            <span key={id} role="cell" title={`${label} · ${name}`}>
              <Cell row={find(list, impl, b, id)} />
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

function score(impl: string, list: Row[]) {
  const scored = list.filter((r) => r.impl === impl && r.pass !== null && r.test !== '5-tab-past-end')
  return { passed: scored.filter((r) => r.pass).length, total: scored.length }
}

function ImplCard({ card }: { card: Card }) {
  const s = summary[card.impl]
  const sc = score(card.impl, rows)
  const fx = card.fixedRoute ? score(card.impl, fixedRows) : null
  const extra = s?.extraLines
  return (
    <article className="card" style={{ ['--accent' as string]: card.accent }}>
      <header className="card-head">
        <div>
          <span className={`kind kind-${card.kind}`}>{card.kind}</span>
          <h3>{card.name}</h3>
          <code className="pkg">{card.pkg}</code>
        </div>
        <div className="score" title="Scored results passed, default setup, all browsers (test 5 is observed, not scored)">
          <strong>{sc.passed}</strong>
          <span>/ {sc.total}</span>
        </div>
      </header>

      <dl className="facts">
        <div><dt>Version</dt><dd>{s?.version ?? '—'}</dd></div>
        <div><dt>Weekly downloads</dt><dd>{fmt(s?.weeklyDownloads)}</dd></div>
        <div><dt>GitHub stars</dt><dd>{fmt(s?.stars)}</dd></div>
        <div>
          <dt>Extra lines</dt>
          <dd>{extra == null ? '—' : <span className={`lines ${extra === 0 ? 'lines-zero' : extra > 20 ? 'lines-high' : ''}`}>{extra === 0 ? '0 · none needed' : `+${extra}`}</span>}</dd>
        </div>
      </dl>

      <Matrix impl={card.impl} list={rows} />

      <footer className="card-actions">
        <a className="btn btn-primary" href={card.route}>Open demo <span aria-hidden="true">→</span></a>
        {card.fixedRoute && (
          <a className="btn btn-ghost" href={card.fixedRoute}>
            With extra work{fx && <span className="btn-meta">{fx.passed}/{fx.total}</span>}
          </a>
        )}
      </footer>
    </article>
  )
}

export default function Home() {
  const impls = CARDS.length
  return (
    <div className="home">
      <div className="home-bg" aria-hidden="true" />
      <nav className="topbar">
        <a className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            <span /><span />
          </span>
          Popover Test Bench
        </a>
        <div className="chips">
          <span className="chip">React {data.reactVersion}</span>
          {BROWSERS.filter(([b]) => b !== 'webkit-option-tab').map(([b, , name]) => (
            <span key={b} className="chip">{name.replace(' (plain Tab)', '')} {browsers[b]}</span>
          ))}
        </div>
      </nav>

      <header className="hero">
        <p className="eyebrow">React popover libraries · November 2026</p>
        <h1>
          One role picker, <span className="grad">{impls} implementations</span>, three browser engines.
        </h1>
        <p className="lede">
          Every card opens a live test fixture: the same user table, the same clipping wrapper and the same
          corner trigger, built with a different popover approach. The dots are the Playwright results.
        </p>
        <div className="stats">
          <div><strong>{impls}</strong><span>implementations</span></div>
          <div><strong>{TESTS.length}</strong><span>tests</span></div>
          <div><strong>{Object.keys(browsers).length}</strong><span>browser projects</span></div>
          <div><strong>{fmt(data.resultCount)}</strong><span>recorded results</span></div>
        </div>
      </header>

      <section className="legend" aria-label="Legend">
        <span><span className="dot dot-pass" /> pass</span>
        <span><span className="dot dot-fail" /> fail</span>
        <span><span className="dot dot-observed" /> observed (no pass rule)</span>
        <span className="legend-tests">
          {TESTS.map(([id, label]) => (
            <span key={id}><b>{parseInt(id)}</b> {label}</span>
          ))}
        </span>
      </section>

      <section className="grid">
        {CARDS.map((c) => <ImplCard key={c.impl} card={c} />)}
      </section>

      <section className="tour">
        <div>
          <span className="kind kind-library">product tour</span>
          <h3>React Joyride v3</h3>
          <p>A four-step guided tour over the same dashboard, including a step pinned to the bottom-right corner.</p>
        </div>
        <a className="btn btn-primary" href="/joyride">Start the tour <span aria-hidden="true">→</span></a>
      </section>

      <footer className="home-foot">
        Numbers on this page are read from <code>{data.generatedFrom}</code> by <code>scripts/make-home-data.mjs</code>.
      </footer>
    </div>
  )
}
