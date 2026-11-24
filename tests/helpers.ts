import fs from 'node:fs'
import path from 'node:path'
import type { Page, TestInfo } from '@playwright/test'

export const SETTLE_MS = 400

export type Impl = { key: string; path: string }

/** Write one measurement to results/raw. Merged later by scripts/merge-results.mjs. */
export function record(info: TestInfo, impl: string, variant: string, test: string, data: Record<string, unknown>) {
  const browser = info.project.name
  const dir = path.join('results', 'raw', variant)
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, `${impl}__${browser}__${test}.json`)
  fs.writeFileSync(file, JSON.stringify({ impl, variant, browser, test, ...data, recordedAt: new Date().toISOString() }, null, 2))
}

export async function recordBrowserVersion(page: Page, info: TestInfo) {
  fs.mkdirSync(path.join('results', 'raw'), { recursive: true })
  const file = path.join('results', 'raw', `browser-${info.project.name}.json`)
  if (fs.existsSync(file)) return
  const version = page.context().browser()?.version()
  const userAgent = await page.evaluate(() => navigator.userAgent)
  fs.writeFileSync(file, JSON.stringify({ project: info.project.name, version, userAgent }, null, 2))
}

export type FocusInfo = { tag: string; role: string | null; text: string; testid: string | null; where: string }

/** Describe document.activeElement relative to trigger/popover `id`. */
export function describeFocus(page: Page, id: string): Promise<FocusInfo> {
  return page.evaluate((id) => {
    const a = document.activeElement as HTMLElement | null
    const pop = document.querySelector(`[data-testid="popover-${id}"]`)
    const trig = document.querySelector(`[data-testid="trigger-${id}"]`)
    const text = (a?.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40)
    let where = 'other'
    if (!a || a === document.body) where = 'body'
    else if (a === trig) where = 'trigger'
    else if (pop && (a === pop || (pop.contains(a) && ['dialog', 'menu', 'listbox'].includes(a.getAttribute('role') ?? '')))) where = 'popover-container'
    else if (pop && pop.contains(a) && text === 'Admin') where = 'first-option'
    else if (pop && pop.contains(a) && text === 'User') where = 'second-option'
    else if (pop && pop.contains(a)) where = 'inside-popover-other'
    else if (a.dataset.testid) where = a.dataset.testid
    return { tag: a?.tagName.toLowerCase() ?? 'null', role: a?.getAttribute('role') ?? null, text, testid: a?.dataset.testid ?? null, where }
  }, id)
}

export function isOpen(page: Page, id: string): Promise<boolean> {
  return page.evaluate((id) => {
    const el = document.querySelector(`[data-testid="popover-${id}"]`) as HTMLElement | null
    if (!el) return false
    const r = el.getBoundingClientRect()
    return el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && r.width > 0 && r.height > 0
  }, id)
}

export function focusInPopover(page: Page, id: string): Promise<boolean> {
  return page.evaluate((id) => {
    const pop = document.querySelector(`[data-testid="popover-${id}"]`)
    return !!pop && !!document.activeElement && pop.contains(document.activeElement)
  }, id)
}

export function rects(page: Page, id: string) {
  return page.evaluate((id) => {
    const r = (el: Element | null) => {
      if (!el) return null
      const b = el.getBoundingClientRect()
      return { x: b.x, y: b.y, width: b.width, height: b.height, top: b.top, right: b.right, bottom: b.bottom, left: b.left }
    }
    return {
      trigger: r(document.querySelector(`[data-testid="trigger-${id}"]`)),
      popover: r(document.querySelector(`[data-testid="popover-${id}"]`)),
      viewport: { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight },
    }
  }, id)
}

/** The key used to move focus forward: Tab, or Alt+Tab for the webkit-option-tab project. */
export function navKey(info: TestInfo): string {
  return (info.project.metadata?.navKey as string | undefined) ?? 'Tab'
}

/** Press the nav key until the given trigger has focus. Returns the number of presses, or -1. */
export async function tabTo(page: Page, info: TestInfo, testid: string, max = 15) {
  for (let i = 1; i <= max; i++) {
    await page.keyboard.press(navKey(info))
    const t = await page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.testid ?? null)
    if (t === testid) return i
  }
  return -1
}

export async function openWithKeyboard(page: Page, info: TestInfo, id: string) {
  const tabs = await tabTo(page, info, `trigger-${id}`)
  await page.keyboard.press('Enter')
  await page.waitForTimeout(SETTLE_MS)
  return tabs
}

/** Chromium only: read the computed accessibility node (role, name, expanded) via CDP. */
export async function axNode(page: Page, selector: string) {
  const cdp = await page.context().newCDPSession(page)
  const { root } = await cdp.send('DOM.getDocument', { depth: -1, pierce: true })
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector })
  if (!nodeId) return null
  const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false })
  const n = nodes[0] as { role?: { value?: string }; name?: { value?: string }; properties?: { name: string; value: { value?: unknown } }[]; ignored?: boolean }
  const prop = (k: string) => n?.properties?.find((p) => p.name === k)?.value?.value ?? null
  return { role: n?.role?.value ?? null, name: n?.name?.value ?? null, expanded: prop('expanded'), hasPopup: prop('hasPopup'), ignored: n?.ignored ?? null }
}
