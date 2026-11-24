| Browser | Steps rendered (1–4) | Step 4 tooltip box (top, right, bottom, left) | Step 4 overflow (top/right/bottom/left) | Escape: tooltip closed | Escape: beacon left on page | Escape: overlay removed | Focus before Escape | Focus after Escape |
|---|---|---|---|---|---|---|---|---|
| chromium | yes, yes, yes, yes | 547, 1270, 649.4, 890 (viewport 1280×720) | 0/0/0/0 | yes | yes | yes | button "Next" (data-testid button-primary) | button (data-testid button-beacon) |
| webkit | yes, yes, yes, yes | 546.5, 1270, 648.9, 890 (viewport 1280×720) | 0/0/0/0 | yes | yes | yes | button "Next" (data-testid button-primary) | button (data-testid button-beacon) |
| firefox | yes, yes, yes, yes | 547, 1270, 649.4, 890 (viewport 1280×720) | 0/0/0/0 | yes | yes | yes | button "Next" (data-testid button-primary) | button (data-testid button-beacon) |
