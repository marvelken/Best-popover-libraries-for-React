# React popover libraries test log (LogRocket update, Nov 2026)

This file logs every command, failure, fix, number and deviation from docs in this session, in order. Every number here was produced by a script that lives in this repo.

## 2026-11-16 17:55 Environment

```
$ node -v
v22.14.0
$ npm -v
10.9.2
$ sw_vers
ProductName:		macOS
ProductVersion:		26.6.2
BuildVersion:		25G83
$ sysctl -n machdep.cpu.brand_string
Apple M4
$ sysctl -n hw.memsize
17179869184
$ ffmpeg -version | head -1
ffmpeg version 8.1.2 Copyright (c) 2000-2026 the FFmpeg developers
```

Machine: MacBook Air M4, 16 GB (17179869184 bytes reported by `hw.memsize`).

Note: the parent folder `/Users/marvelken-anele/Documents` is itself a git repo (an unrelated docs repo). This project gets its own nested `git init` so its history stays separate.

## 2026-11-16 17:56 Scaffold Vite project

The project folder had to exist before `article.md`, and `create-vite` won't scaffold into a non-empty folder without prompting. So I scaffolded into a scratch folder and copied the files in.

```
$ npm view create-vite version
9.3.4
$ npm create vite@latest vite-scaffold -- --template react-ts --no-interactive
create-vite v9.3.4
◇  Scaffolding project in .../scratchpad/vite-scaffold...
└  Done.
$ cp -R vite-scaffold/. react-popover-libraries-2026/   # then renamed "name" in package.json
$ npm install
added 28 packages, and audited 29 packages in 33s
found 0 vulnerabilities
$ git init && git commit -m "Scaffold Vite React 19 + TypeScript project"
733e9c9 Scaffold Vite React 19 + TypeScript project
```

Success. Template versions: react 19.3.1, react-dom 19.3.1, vite 8.3.8, typescript 7.0.2, @vitejs/plugin-react 6.3.0. The template now ships `oxlint` instead of ESLint.

## 2026-11-16 17:58 Check package names and peer dependencies

```
$ npm view <pkg> version dist-tags.latest deprecated peerDependencies --json
```

| Package | latest | deprecated | react peer range |
|---|---|---|---|
| @floating-ui/react | 0.27.20 | – | >=17.0.0 |
| radix-ui | 1.8.1 | – | ^16.8 \|\| ^17.0 \|\| ^18.0 \|\| ^19.0 \|\| ^19.0.0-rc |
| @radix-ui/react-popover | 1.3.1 | – | same as above |
| react-aria-components | 1.22.1 | – | ^16.8.0 \|\| ^17.0.0-rc.1 \|\| ^18.0.0 \|\| ^19.0.0-rc.1 |
| @base-ui-components/react | 1.0.0-rc.0 | **"Package was renamed to @base-ui/react"** | ^17 \|\| ^18 \|\| ^19 |
| @base-ui/react | 1.9.0 | – | ^17 \|\| ^18 \|\| ^19 (also lists date-fns, @date-fns/tz, @types/react as peers, all marked optional in peerDependenciesMeta) |
| react-tiny-popover | 8.1.6 | – | >=16.8.0 |
| react-joyride | 3.2.0 | – | 16.8 - 19 |
| @playwright/test | 1.65.1 | – | – |

**Base UI package name:** `@base-ui-components/react` is deprecated on npm with the message "Package was renamed to @base-ui/react" and is stuck at 1.0.0-rc.0. I installed `@base-ui/react`.

**Docs differ from expectations:** `@base-ui/react` lists `date-fns` and `@date-fns/tz` as peer dependencies. They're optional (`peerDependenciesMeta`), so npm didn't warn.

## 2026-11-16 17:59 Install libraries

```
$ npm install @floating-ui/react radix-ui react-aria-components @base-ui/react react-tiny-popover react-joyride
added 103 packages, and audited 132 packages in 18s
12 packages are looking for funding
  run `npm fund` for details
found 0 vulnerabilities
$ npm install -D @playwright/test
added 3 packages, and audited 135 packages in 5s
12 packages are looking for funding
  run `npm fund` for details
found 0 vulnerabilities
```

**Peer dependency warnings about React 19: none.** Both installs finished with exit code 0 and npm printed no `ERESOLVE` or peer warnings. I didn't need `--force` or `--legacy-peer-deps`.

Installed versions (`npm ls --depth=0`):

```
react-popover-libraries-2026@0.0.0 /Users/marvelken-anele/Documents/Best-popover-library/react-popover-libraries-2026
├── @base-ui/react@1.9.0
├── @floating-ui/react@0.27.20
├── @playwright/test@1.65.1
├── @types/node@24.19.2
├── @types/react-dom@19.3.0
├── @types/react@19.3.0
├── @vitejs/plugin-react@6.3.0
├── oxlint@1.94.0
├── radix-ui@1.8.1
├── react-aria-components@1.22.1
├── react-dom@19.3.1
├── react-joyride@3.2.0
├── react-tiny-popover@8.1.6
├── react@19.3.1
├── typescript@7.0.2
└── vite@8.3.8
```

## 2026-11-16 18:01 Install Playwright browsers

```
$ npx playwright install chromium webkit firefox
Chrome for Testing 159.0.8154.6 (playwright chromium v1255) downloaded
Chrome Headless Shell 159.0.8154.6 (playwright chromium-headless-shell v1255) downloaded
WebKit 27.2 (playwright webkit v2388) downloaded
Firefox 159.0 (playwright firefox v1572) downloaded
```

Success. The tests also log the exact browser versions at runtime (see the test sections).

## 2026-11-16 18:05 Read each library's docs

For each library, this is the docs source I used as the starting point for its implementation:

| Library | Docs source | Basic example used |
|---|---|---|
| @floating-ui/react | `node_modules/@floating-ui/react/README.md` is 3 lines with no example, so I used https://floating-ui.com/docs/popover | `useFloating({ open, onOpenChange, middleware: [offset(10), flip(), shift()], whileElementsMounted: autoUpdate })` + `useClick`, `useDismiss`, `useRole`, `useInteractions`; floating element wrapped in `<FloatingFocusManager context={context} modal={false}>` |
| radix-ui | `node_modules/radix-ui/README.md` only links to the site, so I used https://www.radix-ui.com/primitives/docs/components/popover | `import { Popover } from "radix-ui"`: `Root > Trigger`, `Portal > Content > Close, Arrow` |
| react-aria-components | `node_modules/react-aria-components/README.md` only links to the site. https://react-spectrum.adobe.com/react-aria/Popover.html returned **301 to https://react-aria.adobe.com/Popover** | `<DialogTrigger><Button/><Popover>…</Popover></DialogTrigger>` |
| @base-ui/react | **Bundled docs:** `node_modules/@base-ui/react/docs/react/components/popover.md` (2855 lines) | "CSS Modules" demo: `Popover.Root > Trigger`, `Portal > Positioner sideOffset={8} > Popup > Arrow, Title, Description` |
| react-tiny-popover | `node_modules/react-tiny-popover/README.md` | Second README example: `<Popover isOpen positions padding onClickOutside content>` wrapping the trigger |
| react-joyride | `node_modules/react-joyride/README.md`, `node_modules/react-joyride/dist/index.d.mts`, plus https://react-joyride.com/docs/getting-started, /docs/migration, /docs/new-in-v3, /docs/step, /docs/props, /docs/props/options, /docs/accessibility | `import { Joyride } from 'react-joyride'`, `<Joyride continuous run steps={steps} />` |

### Where the docs differ from what I expected

- **Floating UI:** the popover docs page never shows one complete file. It builds the example in steps with `// ...` elisions. The final JSX uses `<FloatingFocusManager>`, but no import list on the page includes it. `FloatingPortal` isn't mentioned on the popover page at all, so the "basic documented example" doesn't portal. The page says modal focus management is the default and passes `modal={false}` in the example. Source: https://floating-ui.com/docs/popover
- **Radix:** the docs page now imports from the unified package (`import { Popover } from "radix-ui"`) instead of `@radix-ui/react-popover`, and it has no install section. I kept `radix-ui`, as the prompt asked. The Keyboard Interactions table says Esc "close[s] the popover and move[s] focus to Popover.Trigger". Content defaults: `side "bottom"`, `sideOffset 0`, `avoidCollisions true`, `collisionPadding 0`, `sticky "partial"`, `hideWhenDetached false`. Source: https://www.radix-ui.com/primitives/docs/components/popover
- **React Aria:** the docs moved to https://react-aria.adobe.com/Popover (301 from the old URL). The basic example imports `DialogTrigger` from `react-aria-components/Popover` (a new subpath), and it imports `Popover` and `Button` from `vanilla-starter/*`, which are wrapper components from the docs' starter kit, not from the npm package. The example also no longer wraps the content in `<Dialog>`. The prompt asks for `DialogTrigger` + `Popover` + `Dialog`, so I import all three from `react-aria-components` and wrap the content in `<Dialog>`. The page has no prose on focus management. Prop defaults from the API table: `placement 'bottom'`, `offset 8`, `shouldFlip true`, `containerPadding 12`, `shouldUpdatePosition true`, `boundaryElement document.body`.
- **Base UI:** the package ships its own Markdown docs inside `node_modules`. The first line of the popover doc warns that the package was renamed from `@base-ui-components/react` to `@base-ui/react`. `Popover.Root` `modal` defaults to `false`. `Popup.initialFocus` defaults to "the first tabbable element inside the popup". `Popup.finalFocus` defaults to "trigger or previously focused element". The docs say that with `modal={true}`, "focus trapping is enabled only if `<Popover.Close>` is rendered inside `<Popover.Popup>`".
- **react-tiny-popover:** the README's first example uses a clickable `<div>` as the trigger. I used a `<button>`, as the prompt requires. Its third example also uses a `<button>`. Nothing in the README mentions focus, keyboard or ARIA.
- **React Joyride v3:** `Joyride` is now a named export (`import { Joyride } from 'react-joyride'`; v2 used a default export). `run` now defaults to `false` (v2: `true`). `callback` was renamed to `onEvent`. `disableCloseOnEsc` became `options.dismissKeyAction: false`. `getHelpers` was replaced by the `useJoyride()` hook. Positioning moved from react-floater to Floating UI (`floatingOptions`). The step type in `dist/index.d.mts:347` is `placement?: Placement | 'auto' | 'center'`. The docs don't show a `target: 'body'` + `placement: 'center'` example, so I'm treating that combination as unverified until the test checks it.

## 2026-11-16 18:20 Build the demo app

Files:

- `src/shared/Dashboard.tsx`: shared page shell. Header, a 6-row table inside `.table-wrap` (`height: 300px; overflow: hidden`), a "Next focusable element" button after the table, a 2000px spacer so the page can scroll, and a `.corner` wrapper (`position: fixed; right: 8px; bottom: 8px`) holding the corner trigger.
- `src/shared/styles.css`: the only stylesheet. It includes `:focus { outline: 3px solid #e0007a }` so recordings show where focus goes.
- `src/shared/data.ts`, `src/shared/types.ts`: the 6 users, plus the `RolePicker` interface every implementation implements.
- One route file per implementation in `src/routes/`.

Every trigger is a real `<button>` with the visible label `Role: <role>`. Every popover holds a "Choose role" title and two `<button>` options, "Admin" and "User".

**Deviation from the brief:** the brief puts no-library versions A and B on one `/no-library` route. I gave them separate routes, `/no-library` (A, absolute, no portal) and `/no-library-portal` (B, `createPortal`), so each version gets its own test rows and line count.

The no-library baselines implement only open, close on option click and toggle on trigger click. They have no Escape handling, no outside click and no focus management, because that's the work the libraries are supposed to replace.

The React Aria trigger and options use RAC `<Button>`, which renders a real `<button>`. `DialogTrigger` needs a pressable child, and a plain `<button>` wouldn't receive the trigger props. The Radix and Base UI options use each library's `Close` part, which renders a `<button>`. That's the documented way to close from inside the content.

```
$ npm run build
✓ 1635 modules transformed.
dist/assets/index-IzQuYMbD.js   565.10 kB │ gzip: 180.96 kB
(!) Some chunks are larger than 500 kB after minification.
✓ built in 622ms
```

Success. `tsc -b` reported no type errors, including for `popoverTarget`, `popover="auto"` and `onToggle` on React 19.3.1. **Correction (18:24):** at first I wrote that `anchorName` and `positionAnchor` needed an `as CSSProperties` cast. I tested that by removing the cast, and `tsc -b` passed (the only error was the now-unused `CSSProperties` import). `@types/react` 19.3.0 already types both properties, so I removed the cast from `Native.tsx`.

```
$ npx tsc -b   # after removing the casts
src/routes/Native.tsx(1,33): error TS6133: 'CSSProperties' is declared but its value is never read.
$ # removed the import
$ npx tsc -b && echo TSC_OK
TSC_OK
```

## 2026-11-16 18:06 Playwright setup and test definitions

Files: `playwright.config.ts`, `tests/helpers.ts`, `tests/popovers.spec.ts`. The config starts `npx vite --port 5199 --strictPort` and runs every test at a 1280×720 viewport. Each test writes one JSON file to `results/raw/<variant>/<impl>__<browser>__<test>.json`, and `scripts/merge-results.mjs` merges them into `results/results.json`.

Playwright marks a test as passed whenever the measurement ran. The library's pass or fail result is stored in the JSON `pass` field. All waits after an action are `SETTLE_MS = 400` ms.

How each test decides pass or fail. These rules are defined in `tests/popovers.spec.ts`:

1. **Keyboard open**: press Tab until `trigger-0` has focus, then Enter. Pass = the popover is visible (`checkVisibility()` and a non-zero box). Focus is recorded as `trigger`, `popover-container` (the popover element itself, or an element inside it with role dialog, menu or listbox), `first-option` ("Admin"), `second-option` ("User"), `body` or the element's test ID.
2. **Escape closes**: open with the keyboard. If focus isn't inside the popover, press Tab up to 3 times to move it inside, and record how many presses that took. Then press Escape. Pass = it opened, focus was inside, it closed, and focus is on the trigger.
3. **Choosing an option**: open with the keyboard, press Tab until "User" has focus (6 presses at most), then Enter. Pass = "User" was reached, the popover closed, and focus is on the trigger.
4. **Outside click**: click the trigger, then click (1100, 30), an empty spot in the page header. Pass = the popover closed. Focus is recorded but doesn't affect pass.
5. **Tab past the end**: open with the keyboard, press Tab 12 times and record each step. Outcomes: `never-entered-popover`; `trapped` (focus entered and stayed inside for at least 4 presses); `left-popover`, with the element focus left to and whether the popover was still open at that moment. No pass or fail.
6. **Edge of the screen**: click the corner trigger (fixed, `right: 8px; bottom: 8px`). Record both bounding boxes, the viewport size, the overflow on each side as `max(0, …)`, and which side of the trigger the popover is on. Pass = visible with zero overflow.
7. **Clipping**: click the row 6 trigger (`trigger-5`) inside the `overflow: hidden` wrapper. Run `document.elementFromPoint` at the popover's center and at its four corners inset by 2px. A point counts as a hit if the element found is inside the popover. Pass = 5/5.
8. **Scroll**: click `trigger-0`, then `window.scrollBy(0, 200)`. Record the vertical and horizontal gap between popover and trigger before and after. `attached` = both gaps changed by ≤ 1px; otherwise `drifted`, or `closed`. Pass = attached.
9. **ARIA**: record the trigger's `aria-expanded`, `aria-haspopup` and `aria-controls` closed and open, and whether `aria-controls` points to an existing element. Record the popover's `role` (on the popover element or its first descendant with a role) and its accessible name (from `aria-labelledby` or `aria-label`). Pass = `aria-expanded` goes `false`→`true` **as a DOM attribute**, and the popover has a role and a non-empty name. In Chromium only, the test also reads the computed accessibility tree via CDP (`Accessibility.getPartialAXTree`), because the DOM check can't see implicit states (see the 18:20 entry).
10. **Open after scroll** (**not in the brief, added by me**): scroll to y=200 first, then click `trigger-5`. Pass = the popover is within 20px of the trigger, above or below. I added this because test 8 didn't reproduce the "portal popover in the wrong place" bug from no-library B (see 18:13).

Smoke run on Radix in Chromium:

```
$ IMPLS=radix npx playwright test tests/popovers.spec.ts --project=chromium
  9 passed (6.2s)
```

Success.

## 2026-11-16 18:08 Failure: first full run, ENOENT

```
$ rm -rf results/raw media/* && npx playwright test tests/popovers.spec.ts
    Error: ENOENT: no such file or directory, open 'results/raw/browser-chromium.json'
```

Cause: `recordBrowserVersion()` in `tests/helpers.ts` wrote to `results/raw/` without creating it, and I had just deleted that folder. Fix: added `fs.mkdirSync(path.join('results', 'raw'), { recursive: true })`. The fix worked.

## 2026-11-16 18:09 Failure: zsh glob

```
$ rm -rf results/raw media/* test-results && npx playwright test ...
(eval):10: no matches found: media/*
```

Cause: zsh stops a command when a glob matches nothing, so the test command never ran. Fix: `rm -rf media && mkdir media` instead of `media/*`. The fix worked. The same error happened again at 18:13 with `results/runs/*` and I fixed it the same way.

## 2026-11-16 18:11 First default run

```
$ npx playwright test tests/popovers.spec.ts
  216 passed (59.4s)
```

Browser versions reported by Playwright (`browser.version()`):

| Project | Version | navigator.userAgent |
|---|---|---|
| chromium | 159.0.8154.6 | Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/159.0.8154.6 Safari/537.36 |
| webkit | 27.2 | Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.2 Safari/605.1.15 |
| firefox | 159.0 | Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:159.0) Gecko/20100101 Firefox/159.0 |

(The Chromium and Firefox user agents say "Windows" because Playwright's `Desktop Chrome` and `Desktop Firefox` device presets set that UA string. The browsers run on macOS.)

Reading the results turned up three problems in my test harness. None of them were library problems:

1. **WebKit: Tab never reached any trigger** (`tabsToReachTrigger: -1`, focus stayed on `body`) on every route except `/react-aria`. See the probe below.
2. **The test 5 classification was wrong.** For no-library B and react-tiny-popover, focus only reached the portaled popover at the 8th Tab (after every other control on the page), and my loop stopped there and reported "trapped". I rewrote test 5 to press Tab 12 times, record where focus first entered the popover, and require at least 4 presses inside before calling it "trapped".
3. **No-library B's "lost position" bug didn't show up in test 8.** It measures `getBoundingClientRect()` once with `scrollY = 0` and uses that value as an absolute position, and a scroll *after* opening doesn't change the result. The bug only appears when the page is already scrolled before opening, so I added test 10 for that case.

## 2026-11-16 18:10 Probe: Tab in WebKit

`tests/probe-webkit-tab.spec.ts`:

```
$ npx playwright test tests/probe-webkit-tab.spec.ts --reporter=line | grep PROBE
PROBE chromium Tab: trigger-0 > trigger-1 > trigger-2
PROBE chromium Alt+Tab: trigger-0 > trigger-1 > trigger-2
PROBE chromium react-aria trigger {"tag":"BUTTON","tabindex":"0"} radix trigger {"tag":"BUTTON","tabindex":null}
PROBE webkit Tab: BODY > BODY > BODY
PROBE webkit Alt+Tab: trigger-0 > trigger-1 > trigger-2
PROBE webkit react-aria trigger {"tag":"BUTTON","tabindex":"0"} radix trigger {"tag":"BUTTON","tabindex":null}
PROBE firefox Tab: trigger-0 > trigger-1 > trigger-2
PROBE firefox react-aria trigger {"tag":"BUTTON","tabindex":"0"} radix trigger {"tag":"BUTTON","tabindex":null}
PROBE firefox Alt+Tab: BODY > BODY > BODY
```

Playwright's WebKit follows Safari's default "Tab skips buttons" behavior: plain Tab never focuses a `<button>`, and Option+Tab does. React Aria's trigger is reachable with plain Tab because React Aria puts an explicit `tabindex="0"` on its `<button>`. No other library does that.

What I changed: I kept the plain-Tab WebKit project, because that's what a Safari user with default settings gets. I added a fourth Playwright project, `webkit-option-tab` (same WebKit 27.2), that moves focus with `Alt+Tab` (`metadata.navKey` in `playwright.config.ts`, read by `navKey()` in `tests/helpers.ts`).

**Caveat for the `webkit-option-tab` rows in test 5:** Radix's focus trap only handles Tab with no modifier keys held. `node_modules/@radix-ui/react-focus-scope/dist/index.mjs:126` has `const isTabKey = event.key === "Tab" && !event.altKey && !event.ctrlKey && !event.metaKey;`, so in this project focus leaves Radix's popover. In plain-Tab Chromium and Firefox, focus stays trapped. That's an artifact of using Alt+Tab, not something a Safari user with "Press Tab to highlight each item" turned on would see. React Aria's trap behaved differently with Alt+Tab too: focus stopped on "User" instead of cycling.

## 2026-11-16 18:13 Default run repeated 3 times for stability

```
$ npx playwright test tests/popovers.spec.ts   # x3, results copied to results/runs/default-run1..3
  320 passed (1.4m)
  320 passed (2.1m)
  320 passed (2.0m)
$ node scripts/compare-runs.mjs default
compared 320 results across 3 runs (default-run1, default-run2, default-run3): 4 differ
```

The only 4 differences are React Aria's test 9 `aria-controls` value, which contains a random ID that changes on every page load (`react-aria1657872168-_r_0_`, then `react-aria3987536794-_r_0_`, and so on). Every pass/fail, focus target, overflow, hit count and side matched across all 3 runs. **No flaky results.**

## 2026-11-16 18:16 Native popover: the DOM check misses implicit `aria-expanded`

The native trigger has no `aria-expanded` attribute in the DOM, so test 9 recorded `null`. Browsers expose the expanded state of a `popovertarget` button in the accessibility tree without an attribute, so I added a Chromium-only CDP check:

| Route | Chromium AX: trigger expanded (closed → open) | Chromium AX: popover role, name |
|---|---|---|
| native | false → true | group, "" |
| floating-ui | false → true | dialog, "" |
| radix | false → true | dialog, "" |
| react-aria | false → *ignored* (open trigger is hidden from the accessibility tree) | dialog, "Choose role" |
| base-ui | false → true | dialog, "Choose role" |
| react-tiny-popover | – → – | ignored |
| no-library A/B | – → – | generic, "" |

I also checked Playwright's own role engine (`tests/probe-native-aria.spec.ts`). `getByRole('button', { expanded: true })` found 0 matches and `ariaSnapshot()` showed no expanded state for the native trigger in Chromium or Firefox, so the implicit state is only visible through Chromium's CDP. **I didn't change the pass rule for test 9.** It's still based on the DOM attribute, and native's Chromium accessibility result is reported next to it. React Aria hides the open trigger from the accessibility tree (`ignored: true`) because its popover is modal.

## 2026-11-16 18:19 Final default run (results used in this article)

```
$ npx playwright test tests/popovers.spec.ts
  320 passed (1.7m)
$ node scripts/compare-runs.mjs default
compared 320 results across 4 runs (default-run1, default-run2, default-run3, default-run4): 4 differ
```

The same 4 React Aria random-ID differences again, and nothing else. Runs 1–3 came before I added the Chromium CDP fields. Run 4 is the dataset in `results/results.json`.

### Default behavior: per-test results

Generated by `node scripts/make-tables.mjs tests default` from `results/results.json`:

Browsers: C = Chromium 159.0.8154.6, W = WebKit 27.2 (plain Tab), W⌥ = WebKit 27.2 (Option+Tab), F = Firefox 159.0. When every browser gives the same result the cell shows it once.

**Test 1-keyboard-open**

| Implementation | Result |
|---|---|
| no-library-A | C: pass, focus: trigger<br>W: FAIL (Tab never reached trigger)<br>W⌥: pass, focus: trigger<br>F: pass, focus: trigger |
| no-library-B | C: pass, focus: trigger<br>W: FAIL (Tab never reached trigger)<br>W⌥: pass, focus: trigger<br>F: pass, focus: trigger |
| native | C: pass, focus: trigger<br>W: FAIL (Tab never reached trigger)<br>W⌥: pass, focus: trigger<br>F: pass, focus: trigger |
| floating-ui | C: pass, focus: first-option<br>W: FAIL (Tab never reached trigger)<br>W⌥: pass, focus: first-option<br>F: pass, focus: first-option |
| radix | C: pass, focus: first-option<br>W: FAIL (Tab never reached trigger)<br>W⌥: pass, focus: first-option<br>F: pass, focus: first-option |
| react-aria | all: pass, focus: popover-container |
| base-ui | all: pass, focus: first-option |
| react-tiny-popover | C: pass, focus: trigger<br>W: FAIL (Tab never reached trigger)<br>W⌥: pass, focus: trigger<br>F: pass, focus: trigger |

**Test 2-escape**

| Implementation | Result |
|---|---|
| no-library-A | C: FAIL, stayed open, focus: first-option<br>W: FAIL (could not open by keyboard)<br>W⌥: FAIL, stayed open, focus: first-option<br>F: FAIL, stayed open, focus: first-option |
| no-library-B | C: FAIL (focus never inside after 3 Tabs), stayed open<br>W: FAIL (could not open by keyboard)<br>W⌥: FAIL (focus never inside after 3 Tabs), stayed open<br>F: FAIL (focus never inside after 3 Tabs), stayed open |
| native | C: pass, closed, focus: trigger<br>W: FAIL (could not open by keyboard)<br>W⌥: pass, closed, focus: trigger<br>F: pass, closed, focus: trigger |
| floating-ui | C: pass, closed, focus: trigger<br>W: FAIL (could not open by keyboard)<br>W⌥: pass, closed, focus: trigger<br>F: pass, closed, focus: trigger |
| radix | C: pass, closed, focus: trigger<br>W: FAIL (could not open by keyboard)<br>W⌥: pass, closed, focus: trigger<br>F: pass, closed, focus: trigger |
| react-aria | all: pass, closed, focus: trigger |
| base-ui | all: pass, closed, focus: trigger |
| react-tiny-popover | C: FAIL (focus never inside after 3 Tabs), stayed open<br>W: FAIL (could not open by keyboard)<br>W⌥: FAIL (focus never inside after 3 Tabs), stayed open<br>F: FAIL (focus never inside after 3 Tabs), stayed open |

**Test 3-choose-option**

| Implementation | Result |
|---|---|
| no-library-A | C: FAIL, closed, focus: body<br>W: FAIL ("User" not reached in 6 Tabs)<br>W⌥: FAIL, closed, focus: body<br>F: FAIL, closed, focus: body |
| no-library-B | all: FAIL ("User" not reached in 6 Tabs) |
| native | C: pass, closed, focus: trigger<br>W: FAIL ("User" not reached in 6 Tabs)<br>W⌥: pass, closed, focus: trigger<br>F: pass, closed, focus: trigger |
| floating-ui | C: pass, closed, focus: trigger<br>W: FAIL ("User" not reached in 6 Tabs)<br>W⌥: pass, closed, focus: trigger<br>F: pass, closed, focus: trigger |
| radix | C: pass, closed, focus: trigger<br>W: FAIL ("User" not reached in 6 Tabs)<br>W⌥: pass, closed, focus: trigger<br>F: pass, closed, focus: trigger |
| react-aria | all: pass, closed, focus: trigger |
| base-ui | all: pass, closed, focus: trigger |
| react-tiny-popover | all: FAIL ("User" not reached in 6 Tabs) |

**Test 4-outside-click**

| Implementation | Result |
|---|---|
| no-library-A | all: FAIL, stayed open, focus: body |
| no-library-B | all: FAIL, stayed open, focus: body |
| native | all: pass, closed, focus: body |
| floating-ui | all: pass, closed, focus: body |
| radix | all: pass, closed, focus: body |
| react-aria | all: pass, closed, focus: trigger |
| base-ui | all: pass, closed, focus: trigger |
| react-tiny-popover | all: pass, closed, focus: body |

**Test 5-tab-past-end**

| Implementation | Result |
|---|---|
| no-library-A | C: entered after 1 Tab presses; left to trigger-1 "Role: User", stays open<br>W: never entered popover<br>W⌥: entered after 1 Tab presses; left to trigger-1 "Role: User", stays open<br>F: entered after 1 Tab presses; left to trigger-1 "Role: User", stays open |
| no-library-B | C: entered after 8 Tab presses; left to body, stays open<br>W: never entered popover<br>W⌥: entered after 8 Tab presses; left to body, stays open<br>F: entered after 8 Tab presses; left to body, stays open |
| native | C: entered after 1 Tab presses; left to trigger-1 "Role: User", stays open<br>W: never entered popover<br>W⌥: entered after 1 Tab presses; left to trigger-1 "Role: User", stays open<br>F: entered after 1 Tab presses; left to trigger-1 "Role: User", stays open |
| floating-ui | C: left to trigger-1 "Role: User", closes<br>W: never entered popover<br>W⌥: left to trigger-1 "Role: User", closes<br>F: left to trigger-1 "Role: User", closes |
| radix | C: trapped inside, stays open<br>W: never entered popover<br>W⌥: left to body, closes<br>F: trapped inside, stays open |
| react-aria | all: trapped inside, stays open |
| base-ui | all: left to trigger-1 "Role: User", closes |
| react-tiny-popover | C: entered after 8 Tab presses; left to body, stays open<br>W: never entered popover<br>W⌥: entered after 8 Tab presses; left to body, stays open<br>F: entered after 8 Tab presses; left to body, stays open |

**Test 6-edge**

| Implementation | Result |
|---|---|
| no-library-A | C: FAIL, side: bottom, overflow right 63.7px, bottom 67px<br>W: FAIL, side: bottom, overflow right 63.7px, bottom 67px<br>W⌥: FAIL, side: bottom, overflow right 63.7px, bottom 67px<br>F: FAIL, side: bottom, overflow right 63.6px, bottom 67px |
| no-library-B | C: FAIL, side: bottom, overflow right 63.7px, bottom 67px<br>W: FAIL, side: bottom, overflow right 63.7px, bottom 67px<br>W⌥: FAIL, side: bottom, overflow right 63.7px, bottom 67px<br>F: FAIL, side: bottom, overflow right 63.6px, bottom 67px |
| native | C: FAIL, side: bottom, overflow bottom 67px<br>W: FAIL, side: bottom, overflow bottom 67px<br>W⌥: FAIL, side: bottom, overflow bottom 67px<br>F: pass, side: overlapping-trigger |
| floating-ui | all: pass, side: top |
| radix | all: pass, side: top |
| react-aria | all: pass, side: top |
| base-ui | all: pass, side: top |
| react-tiny-popover | all: FAIL, side: bottom, overflow bottom 67px |

**Test 7-clipping**

| Implementation | Result |
|---|---|
| no-library-A | all: FAIL, 2/5 points visible |
| no-library-B | all: pass, 5/5 points visible |
| native | all: pass, 5/5 points visible |
| floating-ui | all: pass, 5/5 points visible |
| radix | all: pass, 5/5 points visible |
| react-aria | all: pass, 5/5 points visible |
| base-ui | all: pass, 5/5 points visible |
| react-tiny-popover | all: pass, 5/5 points visible |

**Test 8-scroll**

| Implementation | Result |
|---|---|
| no-library-A | all: pass, attached |
| no-library-B | all: pass, attached |
| native | all: pass, attached |
| floating-ui | all: pass, attached |
| radix | all: pass, attached |
| react-aria | all: pass, attached |
| base-ui | all: pass, attached |
| react-tiny-popover | all: pass, attached |

**Test 9-aria**

| Implementation | Result |
|---|---|
| no-library-A | C: FAIL, expanded –→–, haspopup –, controls –, role –, name ""; Chromium AX expanded –→–<br>W: FAIL, expanded –→–, haspopup –, controls –, role –, name ""<br>W⌥: FAIL, expanded –→–, haspopup –, controls –, role –, name ""<br>F: FAIL, expanded –→–, haspopup –, controls –, role –, name "" |
| no-library-B | C: FAIL, expanded –→–, haspopup –, controls –, role –, name ""; Chromium AX expanded –→–<br>W: FAIL, expanded –→–, haspopup –, controls –, role –, name ""<br>W⌥: FAIL, expanded –→–, haspopup –, controls –, role –, name ""<br>F: FAIL, expanded –→–, haspopup –, controls –, role –, name "" |
| native | C: FAIL, expanded –→–, haspopup –, controls –, role –, name ""; Chromium AX expanded false→true<br>W: FAIL, expanded –→–, haspopup –, controls –, role –, name ""<br>W⌥: FAIL, expanded –→–, haspopup –, controls –, role –, name ""<br>F: FAIL, expanded –→–, haspopup –, controls –, role –, name "" |
| floating-ui | C: FAIL, expanded false→true, haspopup dialog, controls yes, role dialog, name ""; Chromium AX expanded false→true<br>W: FAIL, expanded false→true, haspopup dialog, controls yes, role dialog, name ""<br>W⌥: FAIL, expanded false→true, haspopup dialog, controls yes, role dialog, name ""<br>F: FAIL, expanded false→true, haspopup dialog, controls yes, role dialog, name "" |
| radix | C: FAIL, expanded false→true, haspopup dialog, controls yes, role dialog, name ""; Chromium AX expanded false→true<br>W: FAIL, expanded false→true, haspopup dialog, controls yes, role dialog, name ""<br>W⌥: FAIL, expanded false→true, haspopup dialog, controls yes, role dialog, name ""<br>F: FAIL, expanded false→true, haspopup dialog, controls yes, role dialog, name "" |
| react-aria | C: pass, expanded false→true, haspopup –, controls yes, role dialog, name "Choose role"; Chromium AX expanded false→–<br>W: pass, expanded false→true, haspopup –, controls yes, role dialog, name "Choose role"<br>W⌥: pass, expanded false→true, haspopup –, controls yes, role dialog, name "Choose role"<br>F: pass, expanded false→true, haspopup –, controls yes, role dialog, name "Choose role" |
| base-ui | C: pass, expanded false→true, haspopup dialog, controls yes, role dialog, name "Choose role"; Chromium AX expanded false→true<br>W: pass, expanded false→true, haspopup dialog, controls yes, role dialog, name "Choose role"<br>W⌥: pass, expanded false→true, haspopup dialog, controls yes, role dialog, name "Choose role"<br>F: pass, expanded false→true, haspopup dialog, controls yes, role dialog, name "Choose role" |
| react-tiny-popover | C: FAIL, expanded –→–, haspopup –, controls –, role –, name ""; Chromium AX expanded –→–<br>W: FAIL, expanded –→–, haspopup –, controls –, role –, name ""<br>W⌥: FAIL, expanded –→–, haspopup –, controls –, role –, name ""<br>F: FAIL, expanded –→–, haspopup –, controls –, role –, name "" |

**Test 10-open-after-scroll**

| Implementation | Result |
|---|---|
| no-library-A | all: pass, attached |
| no-library-B | all: FAIL, -192px from trigger bottom |
| native | all: pass, attached |
| floating-ui | all: pass, attached |
| radix | all: pass, attached |
| react-aria | all: pass, attached |
| base-ui | all: pass, attached |
| react-tiny-popover | all: pass, attached |


### Default behavior: what failed

Every implementation ran exactly as its basic documented example sets it up. Failures that call for extra work (ignoring the plain-Tab WebKit failures, which come from Safari's settings and not from the libraries):

- **no-library A and B**: these are baselines and get no fixes. A: Escape doesn't close (test 2), outside click doesn't close (4), the popover overflows the viewport by 63.7px on the right and 67px at the bottom (6), only 2/5 points are visible inside the clipping wrapper (7), and there's no ARIA (9). B: focus never reaches the popover until every other control on the page has been tabbed through (2, 3, 5), outside click doesn't close (4), same viewport overflow (6), no ARIA (9), and when opened after a scroll, its top edge sits 192px above the trigger's bottom edge (10).
- **native**: test 6 fails in Chromium and WebKit (67px below the viewport, still on the bottom side). In Firefox the same CSS passes with the popover placed *over* the trigger (`overlapping-trigger`). Test 9: no role and no name. Chromium's accessibility tree does expose expanded false→true.
- **floating-ui**: test 9 only. Role `dialog`, but the accessible name is empty.
- **radix**: test 9 only. Role `dialog`, but the accessible name is empty.
- **react-aria**: no failures.
- **base-ui**: no failures.
- **react-tiny-popover**: test 2 (focus never inside, Escape does nothing), test 3 ("User" can't be reached), test 6 (67px below the viewport), test 9 (no ARIA at all).

## 2026-11-16 18:22 Extra work: fixed variants

Each fix lives in a copy of the default file (`src/routes/*Fixed.tsx`, served at `/<route>-fixed`). I ran the same spec against them with `VARIANT=fixed`. Full diffs: `results/diff-Native.txt`, `results/diff-FloatingUi.txt`, `results/diff-Radix.txt`, `results/diff-ReactTinyPopover.txt`.

### Extra work the developer had to do: native (`src/routes/NativeFixed.tsx`)

1. **Edge positioning: a CSS change, not a library option.** The brief's fallback list, `position-try-fallbacks: flip-block, flip-inline`, tries each flip on its own. In the bottom-right corner, `flip-block` alone still overflows on the right and `flip-inline` alone still overflows at the bottom, so with no fallback that fits, Chromium and WebKit kept the base position. Adding the combined option `flip-block flip-inline` fixed it:
   ```diff
   -        style={{ positionAnchor: anchor }}
   +        style={{ positionAnchor: anchor, positionTryFallbacks: 'flip-block, flip-inline, flip-block flip-inline' }}
   ```
2. **Role and name: custom attributes.** The Popover API gives the element no role:
   ```diff
   +  const titleId = `role-popover-title-${id}`
   +        role="dialog"
   +        aria-labelledby={titleId}
   -        <p className="popover-title">Choose role</p>
   +        <p className="popover-title" id={titleId}>Choose role</p>
   ```
   I didn't add `aria-expanded`. Chromium's accessibility tree already reports it (18:16), and adding it only to satisfy my DOM-attribute rule would duplicate what the browser exposes. So native still shows FAIL on test 9 by that rule.

### Extra work the developer had to do: Floating UI (`src/routes/FloatingUiFixed.tsx`)

Accessible name only, using the library's exported `useId`. I found no prop on the popover docs page that names the dialog.
```diff
+  useId,
+  const headingId = useId()
-            <div ref={refs.setFloating} ... style={floatingStyles} {...getFloatingProps()}>
-              <p className="popover-title">Choose role</p>
+            <div ref={refs.setFloating} ... style={floatingStyles} aria-labelledby={headingId} {...getFloatingProps()}>
+              <p className="popover-title" id={headingId}>Choose role</p>
```

### Extra work the developer had to do: Radix (`src/routes/RadixFixed.tsx`)

Accessible name only. The Popover anatomy on the Radix docs page has no Title part (Root, Trigger, Anchor, Portal, Content, Close, Arrow), unlike Base UI's `Popover.Title`.
```diff
+import { useId } from 'react'
+  const titleId = useId()
-        <Popover.Content className="popover" data-testid={`popover-${id}`} sideOffset={8}>
-          <p className="popover-title">Choose role</p>
+        <Popover.Content className="popover" data-testid={`popover-${id}`} sideOffset={8} aria-labelledby={titleId}>
+          <p className="popover-title" id={titleId}>Choose role</p>
```

### Extra work the developer had to do: react-tiny-popover (`src/routes/ReactTinyPopoverFixed.tsx`)

The README documents no prop for focus, Escape, keyboard or ARIA, so everything except `boundaryElement` and `ref` is custom code:

1. **Move focus into the popover on open**: `useEffect` + `requestAnimationFrame` focusing the first option.
2. **Escape closes and returns focus**: `onKeyDown` on the content calling `closeAndReturnFocus()`.
3. **Return focus after choosing an option**: the option's `onClick` calls `closeAndReturnFocus()`, which uses the trigger ref from the documented `ref` "pass through" prop.
4. **ARIA**: `aria-expanded`, `aria-haspopup="dialog"` and `aria-controls` on the trigger; `id`, `role="dialog"` and `aria-labelledby` on the content.
5. **Edge positioning**: the documented `boundaryElement` prop. It takes an HTMLElement, and there's no option for the viewport, so I wrote a `useViewportBoundary()` hook that appends an invisible `position: fixed; inset: 0` div and passes it in.

Why the edge failed by default, as observed: with `positions={['bottom','top','left','right']}` the popover stayed on the bottom, 67px past the viewport. `document.body` here is 2441px tall in Chromium (`tests/probe-native-aria.spec.ts`: `body={"h":2441,"vh":720}`). The README says collisions are checked against the `parentElement`, which defaults to `document.body`, so the bottom edge of a 2441px body is never hit.

#### Failure while writing it: README ref type doesn't compile with React 19 types

The README's third example uses `useRef<HTMLButtonElement | undefined>()`. With `@types/react` 19.3.0:
```
src/routes/ReactTinyPopoverFixed.tsx(35,7): error TS2322: Type 'RefObject<HTMLElement | undefined>' is not assignable to type 'Ref<HTMLElement> | undefined'.
  Type 'RefObject<HTMLElement | undefined>' is not assignable to type 'RefObject<HTMLElement | null>'.
    Type 'HTMLElement | undefined' is not assignable to type 'HTMLElement | null'.
      Type 'undefined' is not assignable to type 'HTMLElement | null'.
```
Fix: `useRef<HTMLElement>(null)`. The fix worked (`tsc -b` clean).

#### Failure: focus on open landed on `body`

My first version focused the first option in a plain `useEffect`. The first fixed run recorded `focusAfterOpen: {"tag":"body", ..., "where":"body"}` in test 1. The content container wasn't attached yet when the effect ran. Fix: wait one frame (`requestAnimationFrame`). After the fix, test 1 recorded `"where":"first-option"`. The fix worked.

#### Failure: WebKit clicks timed out on every fixed route

My first version created the viewport boundary div at module load (`document.body.append(...)` at the top of `ReactTinyPopoverFixed.tsx`). `src/App.tsx` imports every route, so the div existed on *every* page. The first fixed run only produced 112 of 160 results, and the second run hung (one test ran for 7.4 minutes before I stopped it):

```
  ✘   44 [webkit] › tests/popovers.spec.ts:106:5 › native [fixed] › 4 outside click (30.0s)
  ✘   94 [webkit-option-tab] › tests/popovers.spec.ts:106:5 › floating-ui [fixed] › 4 outside click (7.4m)
    Error: Test timeout of 30000ms exceeded.
```

Probe (`tests/probe-webkit-click.spec.ts`):
```
PROBE chromium /native hiddenFixedBodyChildren=1 clickMs=142 err=none
PROBE webkit /native hiddenFixedBodyChildren=1 clickMs=5009 err=TimeoutError: locator.click: Timeout 5000ms exceeded. | ... | 2 × waiting for element to be visible, enabled and stable
```
Fix: moved the div into the `useViewportBoundary()` hook so it only exists while a react-tiny-popover picker is mounted. Re-probe:
```
PROBE webkit /native hiddenFixedBodyChildren=0 clickMs=35 err=none
PROBE webkit /native-fixed hiddenFixedBodyChildren=0 clickMs=35 err=none
PROBE webkit /react-tiny-popover-fixed hiddenFixedBodyChildren=7 clickMs=35 err=none
```
The fix worked. I couldn't confirm why the module-level div stalled WebKit's clicks: clicks work on `/react-tiny-popover-fixed` even with 7 of these divs mounted by the hook. **The default results above aren't affected:** all four default runs (18:11–18:19) finished before `ReactTinyPopoverFixed.tsx` existed (created 18:22).

#### New failure the fix introduced: drift on scroll

With the viewport as its boundary, react-tiny-popover now fails test 8 (`drifted 45px` in all browsers; it was `attached` by default). After a 200px scroll, row 1's trigger sits above the viewport, and the library nudges the popover to keep it inside the boundary instead of following the trigger. **The edge fix and the scroll test conflict. I found no README option that fixes both.**

### Extra-work results

```
$ VARIANT=fixed IMPLS=native,floating-ui,radix,react-tiny-popover npx playwright test tests/popovers.spec.ts
  160 passed (41.6s)
$ # repeated twice more
  160 passed (41.0s)
  160 passed (42.7s)
$ node scripts/compare-runs.mjs fixed
compared 160 results across 3 runs (fixed-run1, fixed-run2, fixed-run3): 0 differ
```

Generated by `node scripts/make-tables.mjs tests fixed`:

Browsers: C = Chromium 159.0.8154.6, W = WebKit 27.2 (plain Tab), W⌥ = WebKit 27.2 (Option+Tab), F = Firefox 159.0. When every browser gives the same result the cell shows it once.

**Test 1-keyboard-open**

| Implementation | Result |
|---|---|
| native | C: pass, focus: trigger<br>W: FAIL (Tab never reached trigger)<br>W⌥: pass, focus: trigger<br>F: pass, focus: trigger |
| floating-ui | C: pass, focus: first-option<br>W: FAIL (Tab never reached trigger)<br>W⌥: pass, focus: first-option<br>F: pass, focus: first-option |
| radix | C: pass, focus: first-option<br>W: FAIL (Tab never reached trigger)<br>W⌥: pass, focus: first-option<br>F: pass, focus: first-option |
| react-tiny-popover | C: pass, focus: first-option<br>W: FAIL (Tab never reached trigger)<br>W⌥: pass, focus: first-option<br>F: pass, focus: first-option |

**Test 2-escape**

| Implementation | Result |
|---|---|
| native | C: pass, closed, focus: trigger<br>W: FAIL (could not open by keyboard)<br>W⌥: pass, closed, focus: trigger<br>F: pass, closed, focus: trigger |
| floating-ui | C: pass, closed, focus: trigger<br>W: FAIL (could not open by keyboard)<br>W⌥: pass, closed, focus: trigger<br>F: pass, closed, focus: trigger |
| radix | C: pass, closed, focus: trigger<br>W: FAIL (could not open by keyboard)<br>W⌥: pass, closed, focus: trigger<br>F: pass, closed, focus: trigger |
| react-tiny-popover | C: pass, closed, focus: trigger<br>W: FAIL (could not open by keyboard)<br>W⌥: pass, closed, focus: trigger<br>F: pass, closed, focus: trigger |

**Test 3-choose-option**

| Implementation | Result |
|---|---|
| native | C: pass, closed, focus: trigger<br>W: FAIL ("User" not reached in 6 Tabs)<br>W⌥: pass, closed, focus: trigger<br>F: pass, closed, focus: trigger |
| floating-ui | C: pass, closed, focus: trigger<br>W: FAIL ("User" not reached in 6 Tabs)<br>W⌥: pass, closed, focus: trigger<br>F: pass, closed, focus: trigger |
| radix | C: pass, closed, focus: trigger<br>W: FAIL ("User" not reached in 6 Tabs)<br>W⌥: pass, closed, focus: trigger<br>F: pass, closed, focus: trigger |
| react-tiny-popover | C: pass, closed, focus: trigger<br>W: FAIL ("User" not reached in 6 Tabs)<br>W⌥: pass, closed, focus: trigger<br>F: pass, closed, focus: trigger |

**Test 4-outside-click**

| Implementation | Result |
|---|---|
| native | all: pass, closed, focus: body |
| floating-ui | all: pass, closed, focus: body |
| radix | all: pass, closed, focus: body |
| react-tiny-popover | all: pass, closed, focus: body |

**Test 5-tab-past-end**

| Implementation | Result |
|---|---|
| native | C: entered after 1 Tab presses; left to trigger-1 "Role: User", stays open<br>W: never entered popover<br>W⌥: entered after 1 Tab presses; left to trigger-1 "Role: User", stays open<br>F: entered after 1 Tab presses; left to trigger-1 "Role: User", stays open |
| floating-ui | C: left to trigger-1 "Role: User", closes<br>W: never entered popover<br>W⌥: left to trigger-1 "Role: User", closes<br>F: left to trigger-1 "Role: User", closes |
| radix | C: trapped inside, stays open<br>W: never entered popover<br>W⌥: left to body, closes<br>F: trapped inside, stays open |
| react-tiny-popover | C: left to body, stays open<br>W: never entered popover<br>W⌥: left to body, stays open<br>F: left to body, stays open |

**Test 6-edge**

| Implementation | Result |
|---|---|
| native | all: pass, side: top |
| floating-ui | all: pass, side: top |
| radix | all: pass, side: top |
| react-tiny-popover | all: pass, side: top |

**Test 7-clipping**

| Implementation | Result |
|---|---|
| native | all: pass, 5/5 points visible |
| floating-ui | all: pass, 5/5 points visible |
| radix | all: pass, 5/5 points visible |
| react-tiny-popover | all: pass, 5/5 points visible |

**Test 8-scroll**

| Implementation | Result |
|---|---|
| native | all: pass, attached |
| floating-ui | all: pass, attached |
| radix | all: pass, attached |
| react-tiny-popover | all: FAIL, drifted 45px |

**Test 9-aria**

| Implementation | Result |
|---|---|
| native | C: FAIL, expanded –→–, haspopup –, controls –, role dialog, name "Choose role"; Chromium AX expanded false→true<br>W: FAIL, expanded –→–, haspopup –, controls –, role dialog, name "Choose role"<br>W⌥: FAIL, expanded –→–, haspopup –, controls –, role dialog, name "Choose role"<br>F: FAIL, expanded –→–, haspopup –, controls –, role dialog, name "Choose role" |
| floating-ui | C: pass, expanded false→true, haspopup dialog, controls yes, role dialog, name "Choose role"; Chromium AX expanded false→true<br>W: pass, expanded false→true, haspopup dialog, controls yes, role dialog, name "Choose role"<br>W⌥: pass, expanded false→true, haspopup dialog, controls yes, role dialog, name "Choose role"<br>F: pass, expanded false→true, haspopup dialog, controls yes, role dialog, name "Choose role" |
| radix | C: pass, expanded false→true, haspopup dialog, controls yes, role dialog, name "Choose role"; Chromium AX expanded false→true<br>W: pass, expanded false→true, haspopup dialog, controls yes, role dialog, name "Choose role"<br>W⌥: pass, expanded false→true, haspopup dialog, controls yes, role dialog, name "Choose role"<br>F: pass, expanded false→true, haspopup dialog, controls yes, role dialog, name "Choose role" |
| react-tiny-popover | C: pass, expanded false→true, haspopup dialog, controls yes, role dialog, name "Choose role"; Chromium AX expanded false→true<br>W: pass, expanded false→true, haspopup dialog, controls yes, role dialog, name "Choose role"<br>W⌥: pass, expanded false→true, haspopup dialog, controls yes, role dialog, name "Choose role"<br>F: pass, expanded false→true, haspopup dialog, controls yes, role dialog, name "Choose role" |

**Test 10-open-after-scroll**

| Implementation | Result |
|---|---|
| native | all: pass, attached |
| floating-ui | all: pass, attached |
| radix | all: pass, attached |
| react-tiny-popover | all: pass, attached |


## 2026-11-16 18:54 Lines of code per implementation

`node scripts/count-lines.mjs` counts lines that aren't blank and aren't comments (a comment line is one whose trimmed text starts with `//`, `/*`, `*` or `{/*`). "Extra lines" comes from `git diff --no-index -U0 default fixed`: each added or modified code line counts as 1, ignoring the renamed `export default function` line and the `<Dashboard title=…>` line, which are bookkeeping.

| Implementation | File | Code lines (default) | Fixed file code lines | Extra lines (added or modified) | Original lines replaced |
|---|---|---|---|---|---|
| no-library-A | `src/routes/NoLibraryAbsolute.tsx` | 28 |  |  |  |
| no-library-B | `src/routes/NoLibraryPortal.tsx` | 37 |  |  |  |
| native | `src/routes/Native.tsx` | 44 | 47 | 5 | 2 |
| floating-ui | `src/routes/FloatingUi.tsx` | 55 | 57 | 4 | 2 |
| radix | `src/routes/Radix.tsx` | 27 | 29 | 4 | 2 |
| react-aria | `src/routes/ReactAria.tsx` | 31 |  |  |  |
| base-ui | `src/routes/BaseUi.tsx` | 29 |  |  |  |
| react-tiny-popover | `src/routes/ReactTinyPopover.tsx` | 34 | 76 | 48 | 6 |
| joyride | `src/routes/Joyride.tsx` | 24 |  |  |  |

Note on react-tiny-popover's 48: that's a diff count, so reformatting adds to it. For example, the trigger `<button>` went from 1 line to 9 lines when I added 3 ARIA attributes. Every implementation shares the same `src/shared/Dashboard.tsx` and `src/shared/styles.css`, which aren't counted. `/native` also relies on the `.native-popover` rule in `styles.css` for its anchor positioning, and that rule isn't counted either.

## 2026-11-16 18:57 React Joyride v3 tour

`src/routes/Joyride.tsx` uses the v3 form from the README: `import { Joyride, type Step } from 'react-joyride'` (named export) and `<Joyride continuous run steps={steps} />`. `run` has to be passed because v3 defaults it to `false`. Steps: `{ target: 'body', placement: 'center' }` (welcome), the first user cell, the first role trigger, and the fixed bottom-right trigger. I flagged the `target: 'body'` + `placement: 'center'` combination as undocumented at 18:05. It rendered in all three browsers. No beacon appeared before any step, so the test never had to click one (`clickedBeacon: false` for every step).

Tests in `tests/joyride.spec.ts`. Every step tooltip reported role `alertdialog`.

```
$ npx playwright test tests/joyride.spec.ts --project=chromium --project=webkit --project=firefox
  6 passed (10.0s)
$ # repeated twice more
  6 passed (9.3s)
  6 passed (9.6s)
$ node scripts/compare-runs.mjs joyride
compared 6 results across 3 runs (joyride-run1, joyride-run2, joyride-run3): 0 differ
```

| Browser | Steps rendered (1–4) | Step 4 tooltip box (top, right, bottom, left) | Step 4 overflow (top/right/bottom/left) | Escape: tooltip closed | Escape: beacon left on page | Escape: overlay removed | Focus before Escape | Focus after Escape |
|---|---|---|---|---|---|---|---|---|
| chromium | yes, yes, yes, yes | 547, 1270, 649.4, 890 (viewport 1280×720) | 0/0/0/0 | yes | yes | yes | button "Next" (data-testid button-primary) | button (data-testid button-beacon) |
| webkit | yes, yes, yes, yes | 546.5, 1270, 648.9, 890 (viewport 1280×720) | 0/0/0/0 | yes | yes | yes | button "Next" (data-testid button-primary) | button (data-testid button-beacon) |
| firefox | yes, yes, yes, yes | 547, 1270, 649.4, 890 (viewport 1280×720) | 0/0/0/0 | yes | yes | yes | button "Next" (data-testid button-primary) | button (data-testid button-beacon) |

**Escape doesn't end the tour.** It closes the step 3 tooltip and the overlay, leaves a beacon on the page, and moves focus to that beacon. The accessibility docs page, as read at 18:05, says focus is restored to the previously focused element when the tooltip closes. Before the tour, focus was on `body`. What I observed was focus on the beacon.

## 2026-11-16 18:54 Package metadata

`node scripts/fetch-metadata.mjs`: `npm view <pkg> time --json`, `https://api.npmjs.org/downloads/point/last-week/<pkg>`, and `https://api.github.com/repos/<owner>/<repo>` (unauthenticated). The repo comes from `npm view <pkg> repository`. Times are UTC (local time is UTC+1).

| Package | npm view time pulled at (UTC) | latest | last publish (UTC) | downloads pulled at (UTC) | weekly downloads | range | GitHub repo | stars pulled at (UTC) | stars |
|---|---|---|---|---|---|---|---|---|---|
| `@floating-ui/react` | 2026-11-16T17:54:41.279Z | 0.27.20 | 2026-07-11T08:41:33.223Z | 2026-11-16T17:54:44.637Z | 34100357 | 2026-11-09..2026-11-15 | floating-ui/floating-ui | 2026-11-16T17:54:47.556Z | 32813 |
| `radix-ui` | 2026-11-16T17:54:48.406Z | 1.8.1 | 2026-10-12T21:03:38.918Z | 2026-11-16T17:54:51.019Z | 28959243 | 2026-11-09..2026-11-15 | radix-ui/primitives | 2026-11-16T17:54:51.217Z | 19506 |
| `react-aria-components` | 2026-11-16T17:54:51.653Z | 1.22.1 | 2026-10-09T20:23:49.939Z | 2026-11-16T17:54:54.485Z | 9331488 | 2026-11-09..2026-11-15 | adobe/react-spectrum | 2026-11-16T17:54:54.689Z | 16043 |
| `@base-ui/react` | 2026-11-16T17:54:55.090Z | 1.9.0 | 2026-10-09T08:52:43.788Z | 2026-11-16T17:54:57.851Z | 30564890 | 2026-11-09..2026-11-15 | mui/base-ui | 2026-11-16T17:54:58.067Z | 11434 |
| `react-tiny-popover` | 2026-11-16T17:54:58.492Z | 8.1.6 | 2025-02-02T21:29:23.315Z | 2026-11-16T17:55:01.401Z | 259426 | 2026-11-09..2026-11-15 | alexkatz/react-tiny-popover | 2026-11-16T17:55:02.242Z | 488 |
| `react-joyride` | 2026-11-16T17:55:02.655Z | 3.2.0 | 2026-07-09T16:09:52.558Z | 2026-11-16T17:55:05.359Z | 1990183 | 2026-11-09..2026-11-15 | gilbarbara/react-joyride | 2026-11-16T17:55:05.698Z | 7898 |

Request errors: none

React 19 peer support: `node scripts/build-summary.mjs` checks the installed package's `peerDependencies.react` against the installed react 19.3.1 with `semver.satisfies` (npm's bundled semver 7.6.3, since semver isn't a project dependency).

## 2026-11-16 18:59 Summary table

Generated by `node scripts/make-tables.mjs summary`. Focus and edge columns use Chromium (C) and Firefox (F) results from the default run. "→ after extra work" shows the fixed-variant result when it differs. "Extra work needed" is the line count from 18:54. React Joyride is left out because the focus, edge and clipping columns don't apply to a tour (see its own table above).

| Library | Installed version | Last publish | Weekly downloads | GitHub stars | React 19 peer support | Focus on open (C/F) | Focus return on close (Escape, C/F) | Edge positioning (C) | Clipping (C) | Extra work needed (lines added) |
|---|---|---|---|---|---|---|---|---|---|---|
| No library (A, absolute) | n/a |  |  |  | n/a | trigger | FAIL, stayed open, focus: first-option | FAIL, side: bottom, overflow right 63.7px, bottom 67px | FAIL, 2/5 points visible |  |
| No library (B, portal) | n/a |  |  |  | n/a | trigger | FAIL (focus never inside after 3 Tabs), stayed open | FAIL, side: bottom, overflow right 63.7px, bottom 67px | pass, 5/5 points visible |  |
| Native Popover API + CSS anchor positioning | browser built-in |  |  |  | n/a | trigger | pass, closed, focus: trigger | FAIL, side: bottom, overflow bottom 67px → after extra work: pass, side: top | pass, 5/5 points visible | 5 |
| Floating UI (`@floating-ui/react`) | 0.27.20 | 2026-07-11 | 34,100,357 | 32,813 | yes (`>=17.0.0`) | first-option | pass, closed, focus: trigger | pass, side: top | pass, 5/5 points visible | 4 |
| Radix (`radix-ui`) | 1.8.1 | 2026-10-12 | 28,959,243 | 19,506 | yes (`^16.8 \|\| ^17.0 \|\| ^18.0 \|\| ^19.0 \|\| ^19.0.0-rc`) | first-option | pass, closed, focus: trigger | pass, side: top | pass, 5/5 points visible | 4 |
| React Aria Components (`react-aria-components`) | 1.22.1 | 2026-10-09 | 9,331,488 | 16,043 | yes (`^16.8.0 \|\| ^17.0.0-rc.1 \|\| ^18.0.0 \|\| ^19.0.0-rc.1`) | popover-container | pass, closed, focus: trigger | pass, side: top | pass, 5/5 points visible | 0 |
| Base UI (`@base-ui/react`) | 1.9.0 | 2026-10-09 | 30,564,890 | 11,434 | yes (`^17 \|\| ^18 \|\| ^19`) | first-option | pass, closed, focus: trigger | pass, side: top | pass, 5/5 points visible | 0 |
| react-tiny-popover (`react-tiny-popover`) | 8.1.6 | 2025-02-02 | 259,426 | 488 | yes (`>=16.8.0`) | trigger | FAIL (focus never inside after 3 Tabs), stayed open → after extra work: pass, closed, focus: trigger | FAIL, side: bottom, overflow bottom 67px → after extra work: pass, side: top | pass, 5/5 points visible | 48 |

## 2026-11-16 18:58 Media

All files are in `media/`.

| File | What it shows |
|---|---|
| `base-ui-clipping-chromium.png` | Test 7: the last-row trigger inside the overflow: hidden wrapper opened (base-ui, chromium) |
| `base-ui-edge-chromium.png` | Test 6: the bottom-right fixed trigger opened, showing where the popover lands (base-ui, chromium) |
| `base-ui-keyboard-chromium.gif` | Keyboard walkthrough (base-ui): Tab to the trigger, Enter, Tab, Escape, with the pink focus ring |
| `floating-ui-clipping-chromium.png` | Test 7: the last-row trigger inside the overflow: hidden wrapper opened (floating-ui, chromium) |
| `floating-ui-edge-chromium.png` | Test 6: the bottom-right fixed trigger opened, showing where the popover lands (floating-ui, chromium) |
| `floating-ui-fixed-clipping-chromium.png` | Test 7: the last-row trigger inside the overflow: hidden wrapper opened (floating-ui-fixed, chromium) |
| `floating-ui-fixed-edge-chromium.png` | Test 6: the bottom-right fixed trigger opened, showing where the popover lands (floating-ui-fixed, chromium) |
| `floating-ui-keyboard-chromium.gif` | Keyboard walkthrough (floating-ui): Tab to the trigger, Enter, Tab, Escape, with the pink focus ring |
| `joyride-step1-chromium.png` | Joyride step 1 tooltip in Chromium |
| `joyride-step2-chromium.png` | Joyride step 2 tooltip in Chromium |
| `joyride-step3-chromium.png` | Joyride step 3 tooltip in Chromium |
| `joyride-step4-chromium.png` | Joyride step 4 tooltip in Chromium |
| `joyride-tour-chromium.gif` | Joyride tour: four steps with Next, then Escape, which leaves a beacon |
| `native-clipping-chromium.png` | Test 7: the last-row trigger inside the overflow: hidden wrapper opened (native, chromium) |
| `native-clipping-firefox.png` | Test 7: the last-row trigger inside the overflow: hidden wrapper opened (native, firefox) |
| `native-clipping-webkit.png` | Test 7: the last-row trigger inside the overflow: hidden wrapper opened (native, webkit) |
| `native-edge-chromium.png` | Test 6: the bottom-right fixed trigger opened, showing where the popover lands (native, chromium) |
| `native-edge-firefox.png` | Test 6: the bottom-right fixed trigger opened, showing where the popover lands (native, firefox) |
| `native-edge-webkit.png` | Test 6: the bottom-right fixed trigger opened, showing where the popover lands (native, webkit) |
| `native-fixed-clipping-chromium.png` | Test 7: the last-row trigger inside the overflow: hidden wrapper opened (native-fixed, chromium) |
| `native-fixed-clipping-firefox.png` | Test 7: the last-row trigger inside the overflow: hidden wrapper opened (native-fixed, firefox) |
| `native-fixed-clipping-webkit.png` | Test 7: the last-row trigger inside the overflow: hidden wrapper opened (native-fixed, webkit) |
| `native-fixed-edge-chromium.png` | Test 6: the bottom-right fixed trigger opened, showing where the popover lands (native-fixed, chromium) |
| `native-fixed-edge-firefox.png` | Test 6: the bottom-right fixed trigger opened, showing where the popover lands (native-fixed, firefox) |
| `native-fixed-edge-webkit.png` | Test 6: the bottom-right fixed trigger opened, showing where the popover lands (native-fixed, webkit) |
| `native-keyboard-chromium.gif` | Keyboard walkthrough (native): Tab to the trigger, Enter, Tab, Escape, with the pink focus ring |
| `no-library-A-clipping-chromium.png` | Test 7: the last-row trigger inside the overflow: hidden wrapper opened (no-library-A) |
| `no-library-A-edge-chromium.png` | Test 6: the bottom-right fixed trigger opened, showing where the popover lands (no-library-A, chromium) |
| `no-library-A-keyboard-chromium.gif` | Keyboard walkthrough (no-library-A): Tab to the trigger, Enter, Tab, Escape, with the pink focus ring |
| `no-library-B-clipping-chromium.png` | Test 7: the last-row trigger inside the overflow: hidden wrapper opened (no-library-B) |
| `no-library-B-edge-chromium.png` | Test 6: the bottom-right fixed trigger opened, showing where the popover lands (no-library-B, chromium) |
| `no-library-B-keyboard-chromium.gif` | Keyboard walkthrough (no-library-B): Tab to the trigger, Enter, Tab, Escape, with the pink focus ring |
| `no-library-B-open-after-scroll-chromium.png` | No-library B failure: opened after scrolling 200px, the portaled popover's top edge sits 192px above the trigger's bottom edge (gap -192px) |
| `radix-clipping-chromium.png` | Test 7: the last-row trigger inside the overflow: hidden wrapper opened (radix, chromium) |
| `radix-edge-chromium.png` | Test 6: the bottom-right fixed trigger opened, showing where the popover lands (radix, chromium) |
| `radix-fixed-clipping-chromium.png` | Test 7: the last-row trigger inside the overflow: hidden wrapper opened (radix-fixed, chromium) |
| `radix-fixed-edge-chromium.png` | Test 6: the bottom-right fixed trigger opened, showing where the popover lands (radix-fixed, chromium) |
| `radix-keyboard-chromium.gif` | Keyboard walkthrough (radix): Tab to the trigger, Enter, Tab, Escape, with the pink focus ring |
| `react-aria-clipping-chromium.png` | Test 7: the last-row trigger inside the overflow: hidden wrapper opened (react-aria, chromium) |
| `react-aria-edge-chromium.png` | Test 6: the bottom-right fixed trigger opened, showing where the popover lands (react-aria, chromium) |
| `react-aria-keyboard-chromium.gif` | Keyboard walkthrough (react-aria): Tab to the trigger, Enter, Tab, Escape, with the pink focus ring |
| `react-tiny-popover-clipping-chromium.png` | Test 7: the last-row trigger inside the overflow: hidden wrapper opened (react-tiny-popover, chromium) |
| `react-tiny-popover-edge-chromium.png` | Test 6: the bottom-right fixed trigger opened, showing where the popover lands (react-tiny-popover, chromium) |
| `react-tiny-popover-fixed-clipping-chromium.png` | Test 7: the last-row trigger inside the overflow: hidden wrapper opened (react-tiny-popover-fixed, chromium) |
| `react-tiny-popover-fixed-edge-chromium.png` | Test 6: the bottom-right fixed trigger opened, showing where the popover lands (react-tiny-popover-fixed, chromium) |
| `react-tiny-popover-fixed-keyboard-chromium.gif` | Keyboard walkthrough (react-tiny-popover-fixed): Tab to the trigger, Enter, Tab, Escape, with the pink focus ring |
| `react-tiny-popover-keyboard-chromium.gif` | Keyboard walkthrough (react-tiny-popover): Tab to the trigger, Enter, Tab, Escape, with the pink focus ring |

`no-library-A-clipping-chromium.png` is the "clipped popover" failure screenshot (2/5 points visible). `no-library-B-open-after-scroll-chromium.png` is the "portal popover in the wrong place" failure screenshot. GIF durations and sizes from `scripts/make-gifs.sh` (`ffprobe` and `stat`): every GIF is 5.9–8.13 s, and the largest is `joyride-tour-chromium.gif` at 389998 bytes. (These stats are from the first recording. The 2026-11-20 restyle below regenerated every file in `media/`, and the new stats are listed there.)

## 2026-11-20 Visual restyle of the fixture pages and a route index page

The original fixture pages were plain and didn't look good enough for article screenshots. I restyled them without changing anything the tests measure, then reran every suite to check.

**What changed**

- `src/home/Home.tsx` and `src/home/home.css` add a route index at `/`. It has a hero section, one card per implementation and a Joyride panel. Each card shows the version, weekly downloads, GitHub stars, extra lines, and a 10-test × 4-browser pass/fail grid.
  - All numbers on the page come from `src/home/home-data.json`. That file is written by `node scripts/make-home-data.mjs`, which copies values from `results/results.json` and only counts rows.
  - The index is loaded with `React.lazy`, so its code and CSS never load on a fixture route.
- `src/shared/styles.css`, which the fixtures use, was changed in colors, backgrounds, shadows and the trigger and option corner radius only. Sizes, padding, border widths, font family, font size, the popover's 160px width and the pink `:focus` ring are all unchanged. The popover gets a translucent background with `backdrop-filter`, a halo shadow, a dot drawn before the title, and a hairline divider drawn with an absolutely positioned `::after`.
- `src/shared/Dashboard.tsx` adds a "Popover Test Bench /" link back to `/` in the header.
  - The link has `tabIndex={-1}` so it's not in the Tab order the keyboard tests count.
  - Its text and the "/" are drawn with CSS `content` and the link uses `aria-label`, so neither becomes page text.
- `tsconfig.app.json` adds `"resolveJsonModule": true` for the JSON import.

**Check 1: box geometry.** A one-off Playwright script recorded the popover, title, option and trigger boxes for `trigger-1` on 7 routes in Chromium, WebKit and Firefox, once before and once after the popover restyle. `diff` of the two outputs was empty.

**Failure 1: rounded corners broke test 7.** The first full rerun failed test 7 on every popover that had passed it, in all browsers. For example, radix in Chromium went from 5/5 to 1/5 points.
- Cause: I had raised the popover's `border-radius` from 6px to 14px. Test 7 probes points 2px inside each corner with `elementFromPoint`, and hit testing follows the rounded shape. With a 14px radius those corner points fall outside the curve, so only the center point still hit.
- Fix: the popover and the clipping wrapper are back to their original 6px radius, with a comment in the CSS. The test was not changed.

**Failure 2: the breadcrumb changed a recorded label.** The same rerun changed test 5's `exitedTo` label for no-library-B to `body "Popover Test Bench/No library (B): creat"`, because the label quotes the start of the page text. The outcome was unchanged.
- Fix: the breadcrumb text moved into CSS `content`, as described above.

**Check 2: full rerun after the fixes.**

```
$ npx playwright test tests/popovers.spec.ts
  320 passed (1.4m)
$ npx playwright test tests/joyride.spec.ts --project=chromium --project=webkit --project=firefox
  6 passed (10.4s)
$ VARIANT=fixed IMPLS=native,floating-ui,radix,react-tiny-popover npx playwright test tests/popovers.spec.ts
  160 passed (48.6s)
$ node scripts/compare-dirs.mjs results/runs/default-run4=results/runs/restyle-default-run1 \
    results/runs/fixed-run3=results/runs/restyle-fixed-run1 results/runs/joyride-run3=results/runs/restyle-joyride-run1
restyle-default-run1 vs results/runs/default-run4: 320/320 files, 0 differences
restyle-fixed-run1 vs results/runs/fixed-run3: 160/160 files, 0 differences
restyle-joyride-run1 vs results/runs/joyride-run3: 6/6 files, 0 differences
```

`scripts/compare-dirs.mjs` compares the same fields as `scripts/compare-runs.mjs`, plus drift, gap and the Joyride step and Escape fields, and ignores React Aria's random IDs. Since nothing differs, `results/results.json` and every table above are unchanged, and `results/raw/` was restored from git.

**Media.** The test runs above rewrote the edge, clipping, open-after-scroll and Joyride screenshots in the new style. The GIFs were re-recorded:

```
$ MEDIA=1 npx playwright test tests/media.spec.ts --project=chromium
  10 passed (15.4s)
$ sh scripts/make-gifs.sh
media/base-ui-keyboard-chromium.gif duration_s=5.300000 bytes=403114
media/floating-ui-keyboard-chromium.gif duration_s=5.900000 bytes=324586
media/joyride-tour-chromium.gif duration_s=8.130000 bytes=543756
media/native-keyboard-chromium.gif duration_s=6.700000 bytes=375839
media/no-library-A-keyboard-chromium.gif duration_s=6.800000 bytes=370040
media/no-library-B-keyboard-chromium.gif duration_s=6.800000 bytes=412434
media/radix-keyboard-chromium.gif duration_s=5.900000 bytes=327547
media/react-aria-keyboard-chromium.gif duration_s=5.200000 bytes=358073
media/react-tiny-popover-fixed-keyboard-chromium.gif duration_s=5.000000 bytes=386522
media/react-tiny-popover-keyboard-chromium.gif duration_s=6.100000 bytes=406033
```

Every GIF is 5.0–8.13 s and under 3 MB. The file names and what each file shows are the same as in the Media table above.

## Summary of findings

Results come from the default run (18:17–18:19) and the extra-work runs (18:54–18:56) above. "All browsers" means Chromium 159, Firefox 159, and WebKit 27.2 with Option+Tab. WebKit with plain Tab is covered separately at the end.

### Per implementation

**No library, version A (absolute, no portal)**: handled on its own: opening with the keyboard, choosing an option with the mouse or keyboard (the popover closes), and staying attached on scroll, including when opened after a scroll. Not handled: Escape doesn't close it, outside click doesn't close it, focus goes to `body` after choosing an option, it overflows the viewport by 63.7px on the right and 67px at the bottom at the corner, only 2 of 5 probe points are visible inside the `overflow: hidden` wrapper, and it has no ARIA. Baseline only, so no fixes were added.

**No library, version B (createPortal to body)**: handled on its own: clipping (5/5 points visible) and staying attached when scrolled after opening. Not handled: keyboard users reach the popover only after tabbing past every other control on the page (8 presses here), so Escape and option selection can't be tested by keyboard. Outside click doesn't close it, it overflows the corner the same way as A, it has no ARIA, and when opened after a 200px scroll its top edge sits 192px above the trigger's bottom edge.

**Native Popover API + CSS anchor positioning**: handled on its own, in all browsers: Escape closes and returns focus to the trigger, choosing an option returns focus to the trigger, outside click closes (focus goes to `body`), clipping, scrolling, and opening after a scroll. Focus stays on the trigger when it opens, and the popover's content is the next thing in Tab order. Tabbing past the last option moves on to the next trigger and leaves the popover open. Chromium's accessibility tree exposes `expanded` false→true with no attribute. What I had to add: the corner case failed in Chromium and WebKit with the brief's `position-try-fallbacks: flip-block, flip-inline` (67px below the viewport). Adding the combined fallback `flip-block flip-inline` fixed it in all browsers. The popover also has no role or name until you add `role="dialog"` and `aria-labelledby` yourself. 5 extra lines.

**Floating UI**: handled on its own: focus moves to the first option on open, Escape and choosing an option return focus to the trigger, outside click closes (focus goes to `body`), the corner case flips to the top with no overflow, plus clipping and scroll. Trigger ARIA (`aria-expanded`, `aria-haspopup="dialog"`, `aria-controls`) and `role="dialog"` come from `useRole`. Tabbing past the last option closes the popover and moves on to the next trigger. What I had to add: an accessible name for the dialog (`aria-labelledby` with the library's `useId`). 4 extra lines. The docs example also needed `FloatingPortal`, which the popover docs page doesn't show (the brief asked for it).

**Radix**: handled on its own: same as Floating UI for focus on open, Escape, choosing an option, outside click (focus goes to `body`), corner flip, clipping, scroll and trigger ARIA. Tab is trapped inside the open popover in Chromium and Firefox. What I had to add: an accessible name (`aria-labelledby` + React `useId`), because the Popover anatomy has no Title part. 4 extra lines.

**React Aria Components**: handled everything on its own, with 0 extra lines. Focus moves to the dialog container on open (not to the first option), Escape and choosing an option return focus to the trigger, and outside click closes and **returns focus to the trigger**. The corner case flips to the top, and clipping, scroll and ARIA (including the name from `<Heading slot="title">`) all pass. Tab is trapped. Its trigger was the only one plain-Tab WebKit could reach, because it sets `tabindex="0"`. While the popover is open, the trigger is hidden from Chromium's accessibility tree.

**Base UI**: handled everything on its own, with 0 extra lines. Focus moves to the first option on open, Escape and choosing an option return focus to the trigger, and outside click closes and **returns focus to the trigger**. Corner flip, clipping, scroll and ARIA (name from `Popover.Title`) all pass. Tabbing past the last option closes the popover and moves on to the next trigger.

**react-tiny-popover**: handled on its own: outside click closes it (focus goes to `body`), and clipping, scroll and opening after a scroll all pass. Not handled by default: focus stays on the trigger and the popover is only reachable after tabbing past every other control on the page, Escape does nothing, there's no ARIA, and the corner popover stays on the bottom, 67px past the viewport. That happens because collisions are checked against `document.body`, which here is 2441px tall. What I had to add: focus on open (it needed `requestAnimationFrame`, because a plain `useEffect` left focus on `body`), Escape handling, focus return, all the ARIA, and a viewport-sized boundary element for `boundaryElement`. 48 extra lines (a diff count that includes reformatting). Even then, the boundary fix broke scrolling: the popover drifted 45px away from its trigger after a 200px scroll. I found no README option that fixes both.

**React Joyride v3 (side note)**: all 4 steps rendered in all three browsers, including the centered `target: 'body'` step. The bottom-right step's tooltip stayed inside the viewport (0px overflow). Escape closed the tooltip and the overlay but not the tour: a beacon stayed on the page and focus moved to it.

### Surprises and contradictions with docs

- **WebKit skips buttons on plain Tab** (Safari's default). Every trigger except React Aria's was unreachable by keyboard in plain-Tab WebKit, so tests 1–3 and 5 fail there for every other implementation. That's a browser setting, not a library failure, but it decides whether Safari users can open a popover at all.
- **The same native CSS behaved differently across browsers.** With `flip-block, flip-inline`, Chromium and WebKit left the corner popover 67px below the viewport, while Firefox moved it on top of the trigger with no overflow.
- **Only React Aria and Base UI return focus to the trigger after an outside click.** Native, Floating UI, Radix and react-tiny-popover leave focus on `body`.
- **Tab behavior differs across the libraries:** trapped (Radix, React Aria), closes and moves on (Floating UI, Base UI), or stays open and moves on (native).
- **Docs gaps:** the Floating UI popover page never shows a complete file, uses `FloatingFocusManager` without importing it, and doesn't mention `FloatingPortal`. The React Aria example imports `Popover` and `Button` from `vanilla-starter/*` (starter kit wrappers, not the npm package) and doesn't use `Dialog`. The react-tiny-popover README's first example uses a clickable `<div>` as the trigger, and its `useRef<HTMLButtonElement | undefined>()` ref doesn't compile with React 19's types. React Joyride's accessibility docs say focus returns to the previously focused element when the tooltip closes. After Escape, I observed focus on the new beacon instead.
- **Package and docs moves:** `@base-ui-components/react` is deprecated in favor of `@base-ui/react`. Radix docs import from `radix-ui`. React Aria docs moved to react-aria.adobe.com.
- **No React 19 peer warnings** from any package. Every peer range accepts React 19.3.1.
- **My own harness bugs, all fixed and logged:** missing folder (18:08), zsh glob (18:09), wrong test 5 classification (18:11), an unneeded type cast I wrongly said was required (18:24 correction), and a module-level overlay that stalled WebKit clicks on the fixed routes (fixed by scoping it to the component; the default results weren't affected).
