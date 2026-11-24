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

