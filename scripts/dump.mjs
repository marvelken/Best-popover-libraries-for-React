// Compact text dump of one variant's results for reading during the session.
import fs from 'node:fs'
const variant = process.argv[2] ?? 'default'
const r = JSON.parse(fs.readFileSync('results/results.json', 'utf8')).tests[variant]
const f = (x) => (x ? `${x.where}<${x.tag}${x.role ? ' role=' + x.role : ''}>` : '-')
for (const t of r) {
  let s = ''
  switch (t.test) {
    case '1-keyboard-open': s = `tabs=${t.tabsToReachTrigger} visible=${t.visible} focus=${f(t.focusAfterOpen)}`; break
    case '2-escape': s = `tabsIn=${t.tabsToMoveFocusInside} inside=${t.focusInsideBeforeEscape} closed=${t.closed} focus=${f(t.focusAfter)}`; break
    case '3-choose-option': s = `reachedUser=${t.reachedUser} tabs=${t.tabsToUser} closed=${t.closed} focus=${f(t.focusAfter)} text=${t.triggerTextAfter}`; break
    case '4-outside-click': s = `opened=${t.openedVisible} clicked=${t.clickedElement} closed=${t.closed} focus=${f(t.focusAfter)}`; break
    case '5-tab-past-end': s = `${t.outcome} enterAt=${t.pressesToEnterPopover} exit=${t.exitedTo} openAtExit=${t.openAtExit} path=${t.path.map((p) => p.focus + (p.open ? '' : '(closed)')).join('>')}`; break
    case '10-open-after-scroll': s = `visible=${t.visible} attached=${t.attached} gap=${JSON.stringify(t.gap)}`; break
    case '6-edge': s = `visible=${t.visible} side=${t.side} overflow=${JSON.stringify(t.overflow)}`; break
    case '7-clipping': s = `hits=${t.hitCount}/5 css=${t.visibleByCss}`; break
    case '8-scroll': s = `${t.outcome} before=${JSON.stringify(t.gapBefore)} after=${JSON.stringify(t.gapAfter)}`; break
    case '9-aria': s = `closed=${JSON.stringify(t.closed)} open=${JSON.stringify(t.open)} resolves=${t.ariaControlsResolves} pop=${JSON.stringify(t.popover)}`; break
  }
  console.log(`${t.impl.padEnd(19)} ${t.browser.padEnd(8)} ${t.test.padEnd(16)} ${String(t.pass).padEnd(5)} ${s}`)
}
