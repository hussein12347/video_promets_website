# End-to-end tests (Playwright)
Scripts in `e2e/` drive the built app in Chromium.
```bash
npm i playwright && npx playwright install chromium
python3 build/build.py
python3 -m http.server 8777 --directory dist &
node tests/e2e/t71.js     # live timeline drag
node tests/e2e/t72.js     # pro methods (hook / retention / B-roll / story / chapters / presets)
node tests/e2e/t66.js     # smart tools, t68 text edit, t69/t70 mark variants, t59s i18n audit, t67 mobile
```
They expect `http://127.0.0.1:8777/index.html`; set the path to `/index.html` of `dist`.
