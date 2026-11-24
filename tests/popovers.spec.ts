import { test } from '@playwright/test'
import {
  SETTLE_MS,
  describeFocus,
  focusInPopover,
  isOpen,
  navKey,
  axNode,
  openWithKeyboard,
  record,
  recordBrowserVersion,
  rects,
  type Impl,
} from './helpers'

/**
 * VARIANT=default runs every implementation as its basic docs example sets it up.
 * VARIANT=fixed runs the "-fixed" routes, which add only the extra work logged in article.md.
 * IMPLS=key1,key2 limits the run.
 */
const VARIANT = process.env.VARIANT ?? 'default'
const ALL: Impl[] = [
  { key: 'no-library-A', path: '/no-library' },
  { key: 'no-library-B', path: '/no-library-portal' },
  { key: 'native', path: '/native' },
  { key: 'floating-ui', path: '/floating-ui' },
  { key: 'radix', path: '/radix' },
  { key: 'react-aria', path: '/react-aria' },
  { key: 'base-ui', path: '/base-ui' },
  { key: 'react-tiny-popover', path: '/react-tiny-popover' },
]
const only = process.env.IMPLS?.split(',')
const IMPLS = ALL.filter((i) => !only || only.includes(i.key)).map((i) => ({
  ...i,
  path: VARIANT === 'fixed' ? `${i.path}-fixed` : i.path,
}))

const wantsScreenshot = (impl: string, browser: string) => browser === "chromium" || (impl === "native" && browser !== "webkit-option-tab")

for (const impl of IMPLS) {
  test.describe(`${impl.key} [${VARIANT}]`, () => {
    test.beforeEach(async ({ page }, info) => {
      await page.goto(impl.path)
      await page.waitForSelector('[data-testid="trigger-0"]')
      await recordBrowserVersion(page, info)
    })

    test('1 keyboard open', async ({ page }, info) => {
      const tabs = await openWithKeyboard(page, info, '0')
      record(info, impl.key, VARIANT, '1-keyboard-open', {
        tabsToReachTrigger: tabs,
        visible: await isOpen(page, '0'),
        focusAfterOpen: await describeFocus(page, '0'),
        pass: await isOpen(page, '0'),
      })
    })

    test('2 escape closes', async ({ page }, info) => {
      await openWithKeyboard(page, info, '0')
      const openedVisible = await isOpen(page, '0')
      let tabsToMoveFocusInside = 0
      while (!(await focusInPopover(page, '0')) && tabsToMoveFocusInside < 3) {
        await page.keyboard.press(navKey(info))
        tabsToMoveFocusInside++
      }
      const focusInsideBeforeEscape = await focusInPopover(page, '0')
      const focusBeforeEscape = await describeFocus(page, '0')
      await page.keyboard.press('Escape')
      await page.waitForTimeout(SETTLE_MS)
      const closed = !(await isOpen(page, '0'))
      const focusAfter = await describeFocus(page, '0')
      record(info, impl.key, VARIANT, '2-escape', {
        openedVisible,
        tabsToMoveFocusInside,
        focusInsideBeforeEscape,
        focusBeforeEscape,
        closed,
        focusAfter,
        pass: openedVisible && focusInsideBeforeEscape && closed && focusAfter.where === 'trigger',
      })
    })

    test('3 choose option', async ({ page }, info) => {
      await openWithKeyboard(page, info, '0')
      let tabsToUser = 0
      while ((await describeFocus(page, '0')).where !== 'second-option' && tabsToUser < 6) {
        await page.keyboard.press(navKey(info))
        tabsToUser++
      }
      const reachedUser = (await describeFocus(page, '0')).where === 'second-option'
      await page.keyboard.press('Enter')
      await page.waitForTimeout(SETTLE_MS)
      const closed = !(await isOpen(page, '0'))
      const focusAfter = await describeFocus(page, '0')
      const triggerText = (await page.getByTestId('trigger-0').textContent())?.trim()
      record(info, impl.key, VARIANT, '3-choose-option', {
        reachedUser,
        tabsToUser,
        closed,
        focusAfter,
        triggerTextAfter: triggerText,
        pass: reachedUser && closed && focusAfter.where === 'trigger',
      })
    })

    test('4 outside click', async ({ page }, info) => {
      await page.getByTestId('trigger-0').click()
      await page.waitForTimeout(SETTLE_MS)
      const openedVisible = await isOpen(page, '0')
      // Empty area: right side of the page header, nothing focusable there.
      const target = await page.evaluate(() => {
        const el = document.elementFromPoint(1100, 30) as HTMLElement | null
        return el ? `${el.tagName.toLowerCase()}${el.className ? '.' + el.className : ''}` : null
      })
      await page.mouse.click(1100, 30)
      await page.waitForTimeout(SETTLE_MS)
      const closed = !(await isOpen(page, '0'))
      record(info, impl.key, VARIANT, '4-outside-click', {
        openedVisible,
        clickedElement: target,
        closed,
        focusAfter: await describeFocus(page, '0'),
        pass: openedVisible && closed,
      })
    })

    test('5 tab past end', async ({ page }, info) => {
      await openWithKeyboard(page, info, '0')
      const path: { focus: string; text: string; inside: boolean; open: boolean }[] = []
      const startedInside = await focusInPopover(page, '0')
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press(navKey(info))
        await page.waitForTimeout(100)
        const f = await describeFocus(page, '0')
        path.push({ focus: f.where, text: f.text, inside: await focusInPopover(page, '0'), open: await isOpen(page, '0') })
      }
      // First press that lands inside the popover (0 = focus was already inside after opening).
      const firstInside = startedInside ? 0 : path.findIndex((p) => p.inside) + 1 || null
      let outcome: string
      let exitedTo: string | null = null
      let openAtExit: boolean | null = null
      if (firstInside === null) outcome = 'never-entered-popover'
      else {
        const after = path.slice(firstInside === 0 ? 0 : firstInside)
        const exit = after.find((p) => !p.inside)
        if (!exit) outcome = after.length >= 4 ? 'trapped' : 'inconclusive'
        else {
          outcome = 'left-popover'
          exitedTo = `${exit.focus}${exit.text ? ` "${exit.text}"` : ''}`
          openAtExit = exit.open
        }
      }
      record(info, impl.key, VARIANT, '5-tab-past-end', {
        startedInside,
        pressesToEnterPopover: firstInside,
        outcome,
        exitedTo,
        openAtExit,
        path,
        pass: null,
      })
    })

    test('6 edge of screen', async ({ page }, info) => {
      await page.getByTestId('trigger-corner').click()
      await page.waitForTimeout(SETTLE_MS)
      const visible = await isOpen(page, 'corner')
      const { trigger, popover, viewport } = await rects(page, 'corner')
      let overflow = null
      let side = null
      if (popover && trigger) {
        overflow = {
          top: Math.max(0, -popover.top),
          right: Math.max(0, popover.right - viewport.width),
          bottom: Math.max(0, popover.bottom - viewport.height),
          left: Math.max(0, -popover.left),
        }
        if (popover.bottom <= trigger.top + 1) side = 'top'
        else if (popover.top >= trigger.bottom - 1) side = 'bottom'
        else if (popover.right <= trigger.left + 1) side = 'left'
        else if (popover.left >= trigger.right - 1) side = 'right'
        else side = 'overlapping-trigger'
      }
      if (wantsScreenshot(impl.key, info.project.name)) {
        await page.screenshot({ path: `media/${impl.key}${VARIANT === 'fixed' ? '-fixed' : ''}-edge-${info.project.name}.png` })
      }
      const totalOverflow = overflow ? overflow.top + overflow.right + overflow.bottom + overflow.left : null
      record(info, impl.key, VARIANT, '6-edge', {
        visible,
        viewport,
        trigger,
        popover,
        overflow,
        side,
        pass: visible && totalOverflow === 0,
      })
    })

    test('7 clipping', async ({ page }, info) => {
      await page.getByTestId('trigger-5').click()
      await page.waitForTimeout(SETTLE_MS)
      const visibleByCss = await isOpen(page, '5')
      const probe = await page.evaluate(() => {
        const pop = document.querySelector('[data-testid="popover-5"]')
        if (!pop) return null
        const b = pop.getBoundingClientRect()
        const inset = 2
        const pts = {
          center: [b.left + b.width / 2, b.top + b.height / 2],
          topLeft: [b.left + inset, b.top + inset],
          topRight: [b.right - inset, b.top + inset],
          bottomLeft: [b.left + inset, b.bottom - inset],
          bottomRight: [b.right - inset, b.bottom - inset],
        } as Record<string, [number, number]>
        const hits: Record<string, boolean> = {}
        for (const [k, [x, y]] of Object.entries(pts)) {
          const el = document.elementFromPoint(x, y)
          hits[k] = !!el && pop.contains(el)
        }
        return { hits, hitCount: Object.values(hits).filter(Boolean).length }
      })
      if (wantsScreenshot(impl.key, info.project.name)) {
        await page.screenshot({ path: `media/${impl.key}${VARIANT === 'fixed' ? '-fixed' : ''}-clipping-${info.project.name}.png` })
      }
      record(info, impl.key, VARIANT, '7-clipping', {
        visibleByCss,
        hits: probe?.hits ?? null,
        hitCount: probe?.hitCount ?? 0,
        pass: probe?.hitCount === 5,
      })
    })

    test('8 scroll', async ({ page }, info) => {
      await page.getByTestId('trigger-0').click()
      await page.waitForTimeout(SETTLE_MS)
      const before = await rects(page, '0')
      await page.evaluate(() => window.scrollBy(0, 200))
      await page.waitForTimeout(SETTLE_MS)
      const after = await rects(page, '0')
      const stillOpen = await isOpen(page, '0')
      const gap = (r: typeof before) =>
        r.popover && r.trigger ? { vertical: r.popover.top - r.trigger.bottom, horizontal: r.popover.left - r.trigger.left } : null
      const g0 = gap(before)
      const g1 = stillOpen ? gap(after) : null
      let outcome = 'closed'
      let driftPx = null
      if (stillOpen && g0 && g1) {
        driftPx = { vertical: g1.vertical - g0.vertical, horizontal: g1.horizontal - g0.horizontal }
        outcome = Math.abs(driftPx.vertical) <= 1 && Math.abs(driftPx.horizontal) <= 1 ? 'attached' : 'drifted'
      }
      record(info, impl.key, VARIANT, '8-scroll', {
        scrolledBy: await page.evaluate(() => window.scrollY),
        gapBefore: g0,
        gapAfter: g1,
        driftPx,
        outcome,
        pass: outcome === 'attached',
      })
    })

    test('9 aria', async ({ page }, info) => {
      const trig = page.getByTestId('trigger-0')
      const attrs = () =>
        trig.evaluate((t) => ({
          ariaExpanded: t.getAttribute('aria-expanded'),
          ariaHaspopup: t.getAttribute('aria-haspopup'),
          ariaControls: t.getAttribute('aria-controls'),
        }))
      const closedAttrs = await attrs()
      const isChromium = info.project.name === 'chromium'
      const axTriggerClosed = isChromium ? await axNode(page, '[data-testid="trigger-0"]') : null
      await trig.click()
      await page.waitForTimeout(SETTLE_MS)
      const openAttrs = await attrs()
      const popInfo = await page.evaluate(() => {
        const pop = document.querySelector('[data-testid="popover-0"]') as HTMLElement | null
        if (!pop) return null
        const roleEl = pop.getAttribute('role') ? pop : (pop.querySelector('[role]') as HTMLElement | null)
        const nameOf = (el: HTMLElement | null) => {
          if (!el) return ''
          const by = el.getAttribute('aria-labelledby')
          if (by) return by.split(/\s+/).map((id) => document.getElementById(id)?.textContent?.trim() ?? '').join(' ').trim()
          return el.getAttribute('aria-label') ?? ''
        }
        return {
          popoverId: pop.id || null,
          roleOn: roleEl === pop ? 'popover element' : roleEl ? 'descendant' : null,
          role: roleEl?.getAttribute('role') ?? null,
          accessibleName: nameOf(roleEl),
          roleElementId: roleEl?.id || null,
        }
      })
      // Chromium accessibility tree: trigger, and the role-bearing popover element (or the popover itself).
      const axTriggerOpen = isChromium ? await axNode(page, '[data-testid="trigger-0"]') : null
      const axPopover = isChromium
        ? (await axNode(page, '[data-testid="popover-0"][role], [data-testid="popover-0"] [role="dialog"]')) ??
          (await axNode(page, '[data-testid="popover-0"]'))
        : null
      const controlsMatches = openAttrs.ariaControls
        ? await page.evaluate((id) => !!document.getElementById(id), openAttrs.ariaControls)
        : null
      record(info, impl.key, VARIANT, '9-aria', {
        closed: closedAttrs,
        open: openAttrs,
        ariaControlsResolves: controlsMatches,
        popover: popInfo,
        axChromium: isChromium ? { triggerClosed: axTriggerClosed, triggerOpen: axTriggerOpen, popover: axPopover } : null,
        pass: closedAttrs.ariaExpanded === 'false' && openAttrs.ariaExpanded === 'true' && !!popInfo?.role && !!popInfo?.accessibleName,
      })
    })

    // Not in the brief: added to reproduce the "lost position" bug of measuring once with
    // getBoundingClientRect (viewport coords) and placing with position: absolute (document coords).
    test('10 open after scroll', async ({ page }, info) => {
      await page.evaluate(() => window.scrollTo(0, 200))
      await page.waitForTimeout(SETTLE_MS)
      await page.getByTestId('trigger-5').click()
      await page.waitForTimeout(SETTLE_MS)
      const r = await rects(page, '5')
      const visible = await isOpen(page, '5')
      const gap = r.popover && r.trigger
        ? { below: r.popover.top - r.trigger.bottom, above: r.trigger.top - r.popover.bottom, horizontal: r.popover.left - r.trigger.left }
        : null
      // Attached = within 20px of the trigger, either below or above it.
      const attached = !!gap && ((gap.below >= -1 && gap.below <= 20) || (gap.above >= -1 && gap.above <= 20))
      if (impl.key === 'no-library-B' && info.project.name === 'chromium') {
        await page.screenshot({ path: `media/no-library-B-open-after-scroll-chromium.png` })
      }
      record(info, impl.key, VARIANT, '10-open-after-scroll', {
        scrollY: await page.evaluate(() => window.scrollY),
        visible,
        trigger: r.trigger,
        popover: r.popover,
        gap,
        attached,
        pass: visible && attached,
      })
    })
  })
}
