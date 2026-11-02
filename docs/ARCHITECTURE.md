# Architecture

The product ships as **one self-contained `index.html`** (no server, works offline from `file://`,
easy to host on GitHub Pages). The source is organised so that one file is *generated*, not hand-edited.

```
src/core/studio.html        legacy base app (engine, timeline, export) — the only monolith
src/features/<feature>/     one folder per vertical feature (js / css), no cross-imports
build/build.py              composes everything (Pipeline)
build/steps/*.py|sh         one injection step per feature
dist/index.html             generated artefact (committed so Pages/CI can diff it)
tests/e2e/                  Playwright scenarios
```

## Layers (dependency rule: outer → inner only)
1. **Engine (core)** – scene model `ANIM.cur.scenes[i].raw`, layout `ANIM.rt.layout`, history `animEdit/animPushUndo`, renderer `animDraw`, exporter.
2. **Features** – use only the engine's public globals (`animEdit`, `animNorm`, `animRebuild`, `animSeek`, `animAddMedia`, `anAddLayer` …). They never call each other except through the engine.
3. **Shell** – tabs/panels registry in `apply_pro4.py` (`TABS`, `anMontAltMode`), command palette, i18n.

## Design patterns used
| Pattern | Where |
|---|---|
| **Pipeline / Pipe-and-Filter** | `build/build.py` – ordered list of HTML→HTML transforms |
| **Plugin / Open-Closed** | features extend the app by injecting a script and *overriding or wrapping* global functions (`anClipDrag`, `anLayerDrag`, `animRenderTimeline` wrapper) – the core stays closed |
| **Decorator** | `window.animRenderTimeline` is wrapped to add timeline handles without touching the original |
| **Command + Memento** | every edit goes through `animEdit(fn)` which snapshots state → undo/redo, snapshots tab |
| **Strategy** | pro presets (`LAB.PRESETS`), mark variants (`ANMV`), beat-sync modes, AI method prompts |
| **Builder / Adapter (local generator)** | `GEN.sceneJson()` builds the same JSON an AI reply would contain, so the existing validated `anMontApply` path is reused – no second code path |
| **Interpreter** | `GEN.parse()` turns a free-text style description (Arabic/English keywords) into a spec used by the generator, by the rhythm preset and by every prompt |
| **Facade** | `LAB`, `SM` (smart tools), `ANMV` expose small APIs over the engine internals |
| **Registry** | panel tabs (`TABS`) and command palette items |
| **Template Method** | AI methods: `prompt…()` → user pastes JSON → `apply…()` validates and applies in one undo step |
| **Single-flight throttle** | `LAB.live()` coalesces rebuilds to one per animation frame during drags |
| **Adapter** | `native_patch.js` bridges the web app to the Android shell (`NativeBridge`) |

## AI integration rule
The app never calls an LLM directly. Methods build a **copy-prompt**, the user pastes it to any model and pastes the **JSON reply** back. Replies are validated and applied as one undoable step. API keys (TTS etc.) live only in `localStorage`.

## Adding a feature
1. Create `src/features/<name>/<name>.js` (+ `.css`).
2. Add `build/steps/apply_<name>.py` (copy `apply_pro17.py`: append `<script>`/`<style>` before `</body>`).
3. Register it in `STEPS` in `build/build.py` **before** `i18n_inv.py`.
4. If it adds a tab, add it to `TABS` in `apply_pro4.py`.
5. `python3 build/build.py`, add an e2e script, commit `dist/index.html`.

## Honest limitations
The base `src/core/studio.html` is still a ~2.5 MB legacy monolith; the clean structure applies to features and the build, not (yet) to the engine internals. Splitting the engine into modules is the next refactor.
