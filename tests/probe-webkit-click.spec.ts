import { test } from '@playwright/test'
// Probe: why do clicks time out in WebKit on the -fixed routes?
for (const path of ['/native', '/native-fixed', '/react-tiny-popover-fixed']) {
  test(`probe click ${path}`, async ({ page }, info) => {
    await page.goto(path)
    await page.waitForSelector('[data-testid="trigger-0"]')
    const overlays = await page.evaluate(() => [...document.body.children].filter((e) => getComputedStyle(e).position === 'fixed' && getComputedStyle(e).visibility === 'hidden').length)
    const t0 = Date.now()
    let err = 'none'
    try { await page.getByTestId('trigger-0').click({ timeout: 5000 }) } catch (e) { err = String(e).split('\n').slice(0, 6).join(' | ') }
    console.log(`PROBE ${info.project.name} ${path} hiddenFixedBodyChildren=${overlays} clickMs=${Date.now() - t0} err=${err}`)
  })
}
