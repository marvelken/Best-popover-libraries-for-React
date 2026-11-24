import { test } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

// Records keyboard walkthroughs for the article (Chromium only, run with MEDIA=1).
// Sequence: Tab to first trigger, Enter, Tab to the next element, Escape. Pauses so the focus ring is visible.
test.skip(!process.env.MEDIA, 'media recording only runs with MEDIA=1')

const ROUTES: [string, string][] = [
  ['no-library-A', '/no-library'],
  ['no-library-B', '/no-library-portal'],
  ['native', '/native'],
  ['floating-ui', '/floating-ui'],
  ['radix', '/radix'],
  ['react-aria', '/react-aria'],
  ['base-ui', '/base-ui'],
  ['react-tiny-popover', '/react-tiny-popover'],
  ['react-tiny-popover-fixed', '/react-tiny-popover-fixed'],
]
const PAUSE = 900
const VIDEO_DIR = 'results/video'

for (const [key, route] of ROUTES) {
  test(`record ${key}`, async ({ browser }, info) => {
    test.skip(info.project.name !== 'chromium')
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 720 } } })
    const page = await context.newPage()
    await page.goto(route)
    await page.waitForSelector('[data-testid="trigger-0"]')
    await page.waitForTimeout(PAUSE)
    await page.keyboard.press('Tab')
    await page.waitForTimeout(PAUSE)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(PAUSE)
    await page.keyboard.press('Tab')
    await page.waitForTimeout(PAUSE)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(PAUSE * 1.5)
    const video = page.video()
    await context.close()
    const src = await video!.path()
    fs.renameSync(src, path.join(VIDEO_DIR, `${key}-keyboard-chromium.webm`))
  })
}

test('record joyride', async ({ browser }, info) => {
  test.skip(info.project.name !== 'chromium')
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 720 } } })
  const page = await context.newPage()
  await page.goto('/joyride')
  await page.waitForSelector('.react-joyride__tooltip')
  await page.waitForTimeout(PAUSE * 1.5)
  for (let i = 0; i < 3; i++) {
    await page.getByTestId('button-primary').click()
    await page.waitForTimeout(PAUSE * 1.5)
  }
  await page.keyboard.press('Escape')
  await page.waitForTimeout(PAUSE * 1.5)
  const video = page.video()
  await context.close()
  fs.renameSync(await video!.path(), path.join(VIDEO_DIR, `joyride-tour-chromium.webm`))
})
