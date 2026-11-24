import { test } from '@playwright/test'
import { SETTLE_MS, record, recordBrowserVersion } from './helpers'

const STEP_TEXT = [
  'Welcome to the user dashboard.',
  'Each row shows a user.',
  'Change a user role here.',
  'This trigger is pinned to the corner.',
]

async function tooltipState(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const tip = document.querySelector('.react-joyride__tooltip') as HTMLElement | null
    const beacon = document.querySelector('[data-testid="button-beacon"]') as HTMLElement | null
    const b = tip?.getBoundingClientRect()
    return {
      tooltipVisible: !!tip && !!b && b.width > 0 && tip.checkVisibility(),
      tooltipText: tip?.textContent?.trim().replace(/\s+/g, ' ').slice(0, 120) ?? null,
      tooltipRole: tip?.getAttribute('role') ?? tip?.closest('[role]')?.getAttribute('role') ?? null,
      beaconVisible: !!beacon && beacon.checkVisibility(),
      box: b ? { top: b.top, right: b.right, bottom: b.bottom, left: b.left, width: b.width, height: b.height } : null,
      viewport: { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight },
    }
  })
}

function focusInfo(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const a = document.activeElement as HTMLElement | null
    return {
      tag: a?.tagName.toLowerCase() ?? null,
      role: a?.getAttribute('role') ?? null,
      testid: a?.dataset.testid ?? null,
      text: a === document.body ? '' : (a?.textContent ?? '').trim().slice(0, 40),
      insideTooltip: !!a?.closest('.react-joyride__tooltip'),
    }
  })
}

test.describe('joyride', () => {
  test.beforeEach(async ({ page }, info) => {
    await page.goto('/joyride')
    await page.waitForSelector('[data-testid="trigger-0"]')
    await page.waitForTimeout(SETTLE_MS * 2)
    await recordBrowserVersion(page, info)
  })

  test('steps render and corner step stays in viewport', async ({ page }, info) => {
    const steps = []
    for (let i = 0; i < STEP_TEXT.length; i++) {
      let state = await tooltipState(page)
      let clickedBeacon = false
      if (!state.tooltipVisible && state.beaconVisible) {
        await page.getByTestId('button-beacon').click()
        await page.waitForTimeout(SETTLE_MS)
        clickedBeacon = true
        state = await tooltipState(page)
      }
      const o = state.box
        ? {
            top: Math.max(0, -state.box.top),
            right: Math.max(0, state.box.right - state.viewport.width),
            bottom: Math.max(0, state.box.bottom - state.viewport.height),
            left: Math.max(0, -state.box.left),
          }
        : null
      const focus = await focusInfo(page)
      steps.push({
        step: i + 1,
        clickedBeacon,
        rendered: state.tooltipVisible && !!state.tooltipText?.includes(STEP_TEXT[i]),
        tooltipRole: state.tooltipRole,
        box: state.box,
        viewport: state.viewport,
        overflow: o,
        focus,
      })
      if (info.project.name === 'chromium') await page.screenshot({ path: `media/joyride-step${i + 1}-chromium.png` })
      if (i < STEP_TEXT.length - 1) {
        await page.getByTestId('button-primary').click()
        await page.waitForTimeout(SETTLE_MS * 2)
      }
    }
    const corner = steps[3]
    const total = corner.overflow ? Object.values(corner.overflow).reduce((a, b) => a + b, 0) : null
    record(info, 'joyride', 'default', 'joyride-steps', {
      steps,
      allStepsRendered: steps.every((s) => s.rendered),
      cornerStepOverflow: corner.overflow,
      pass: steps.every((s) => s.rendered) && total === 0,
    })
  })

  test('escape closes the tour', async ({ page }, info) => {
    let state = await tooltipState(page)
    if (!state.tooltipVisible && state.beaconVisible) {
      await page.getByTestId('button-beacon').click()
      await page.waitForTimeout(SETTLE_MS)
      state = await tooltipState(page)
    }
    // Go to step 3 (the role trigger) so focus has a real element to return to.
    for (let i = 0; i < 2; i++) {
      await page.getByTestId('button-primary').click()
      await page.waitForTimeout(SETTLE_MS * 2)
    }
    const before = await tooltipState(page)
    const focusBefore = await focusInfo(page)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(SETTLE_MS * 2)
    const after = await tooltipState(page)
    const overlay = await page.evaluate(() => !!document.querySelector('.react-joyride__overlay'))
    record(info, 'joyride', 'default', 'joyride-escape', {
      openBeforeEscape: before.tooltipVisible,
      stepTextBeforeEscape: before.tooltipText,
      focusBeforeEscape: focusBefore,
      closed: !after.tooltipVisible,
      overlayStillPresent: overlay,
      beaconAfter: after.beaconVisible,
      focusAfter: await focusInfo(page),
      pass: before.tooltipVisible && !after.tooltipVisible,
    })
  })
})
