# Contributing
- Edit files under `src/` only; never edit `dist/index.html` by hand.
- Run `python3 build/build.py` and commit the regenerated `dist/index.html` (CI fails if it differs).
- Keep features independent: talk to the engine via its global API, not to other features.
- Arabic UI strings must pass the i18n inventory (the build regenerates it; run the `t59s` audit).
