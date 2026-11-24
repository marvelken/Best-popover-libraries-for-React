import { test } from '@playwright/test'
// Probe: which key reaches a plain <button> in each browser? Logged in article.md.
for (const key of ['Tab', 'Alt+Tab']) {
  test(`probe ${key}`, async ({ page }, info) => {
    await page.goto('/radix')
    await page.waitForSelector('[data-testid="trigger-0"]')
    const seen: string[] = []
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press(key)
      seen.push(await page.evaluate(() => (document.activeElement as HTMLElement).dataset.testid ?? document.activeElement!.tagName))
    }
    console.log(`PROBE ${info.project.name} ${key}: ${seen.join(' > ')}`)
  })
}
test('probe react-aria trigger tabindex', async ({ page }, info) => {
  await page.goto('/react-aria')
  await page.waitForSelector('[data-testid="trigger-0"]')
  const attrs = await page.getByTestId('trigger-0').evaluate((b) => ({ tag: b.tagName, tabindex: b.getAttribute('tabindex') }))
  const radix = await page.goto('/radix').then(() => page.getByTestId('trigger-0').evaluate((b) => ({ tag: b.tagName, tabindex: b.getAttribute('tabindex') })))
  console.log(`PROBE ${info.project.name} react-aria trigger ${JSON.stringify(attrs)} radix trigger ${JSON.stringify(radix)}`)
})
