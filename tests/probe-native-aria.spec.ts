import { test } from '@playwright/test'
// Probe: does Playwright's role engine see the implicit expanded state of a popovertarget button?
test('probe native expanded', async ({ page }, info) => {
  await page.goto('/native')
  const t = page.getByTestId('trigger-0')
  const before = await t.ariaSnapshot()
  await t.click()
  await page.waitForTimeout(300)
  const after = await t.ariaSnapshot()
  const byRole = await page.getByRole('button', { name: 'Role: Admin', expanded: true }).count()
  console.log(`PROBE ${info.project.name} before=${JSON.stringify(before)} after=${JSON.stringify(after)} getByRole(expanded:true)=${byRole}`)
})
test('probe tiny boundary', async ({ page }, info) => {
  await page.goto('/react-tiny-popover')
  const body = await page.evaluate(() => { const b = document.body.getBoundingClientRect(); return { h: b.height, vh: innerHeight } })
  console.log(`PROBE ${info.project.name} body=${JSON.stringify(body)}`)
})
