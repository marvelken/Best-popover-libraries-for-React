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

