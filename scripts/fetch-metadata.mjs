// Pull last publish date (npm view time), weekly downloads (npm API) and GitHub stars (GitHub API).
// Every request is timestamped. On failure the error is stored and the value left null.
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'

const PKGS = {
  'floating-ui': '@floating-ui/react',
  radix: 'radix-ui',
  'react-aria': 'react-aria-components',
  'base-ui': '@base-ui/react',
  'react-tiny-popover': 'react-tiny-popover',
  joyride: 'react-joyride',
}
const now = () => new Date().toISOString()
const meta = {}
for (const [impl, pkg] of Object.entries(PKGS)) {
  const m = { pkg }
  // npm view
  m.npmViewAt = now()
  try {
    const time = JSON.parse(execFileSync('npm', ['view', pkg, 'time', '--json'], { encoding: 'utf8' }))
    const version = execFileSync('npm', ['view', pkg, 'version'], { encoding: 'utf8' }).trim()
    m.latestVersion = version
    m.lastPublish = time[version] ?? null
    m.modified = time.modified ?? null
    const repo = JSON.parse(execFileSync('npm', ['view', pkg, 'repository', '--json'], { encoding: 'utf8' }))
    m.repositoryUrl = typeof repo === 'string' ? repo : repo?.url ?? null
  } catch (e) {
    m.npmViewError = String(e.message).split('\n')[0]
  }
  // downloads
  m.downloadsAt = now()
  try {
    const res = await fetch(`https://api.npmjs.org/downloads/point/last-week/${pkg}`)
    const body = await res.json()
    if (!res.ok) throw new Error(`HTTP ${res.status} ${JSON.stringify(body)}`)
    m.weeklyDownloads = body.downloads
    m.downloadsRange = `${body.start}..${body.end}`
  } catch (e) {
    m.downloadsError = String(e.message)
    m.weeklyDownloads = null
  }
  // GitHub stars
  const match = m.repositoryUrl?.match(/github\.com[/:]([^/]+)\/([^/.#]+)/)
  m.githubRepo = match ? `${match[1]}/${match[2]}` : null
  m.starsAt = now()
  if (m.githubRepo) {
    try {
      const res = await fetch(`https://api.github.com/repos/${m.githubRepo}`, {
        headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'popover-test-script' },
      })
      const body = await res.json()
      if (!res.ok) throw new Error(`HTTP ${res.status} ${body.message ?? ''}`)
      m.stars = body.stargazers_count
    } catch (e) {
      m.starsError = String(e.message)
      m.stars = null
    }
  } else {
    m.starsError = 'no GitHub repository in npm metadata'
    m.stars = null
  }
  meta[impl] = m
}
const out = 'results/results.json'
const data = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : {}
fs.writeFileSync(out, JSON.stringify({ ...data, metadata: meta }, null, 2))
console.log(JSON.stringify(meta, null, 2))
