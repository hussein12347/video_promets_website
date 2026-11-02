#!/usr/bin/env python3
"""Build pipeline: src/ -> dist/index.html (single self-contained file).

Pattern: Pipeline (Pipe-and-Filter). Every step in STEPS reads the current
HTML, injects one feature, and writes it back. Order matters and is declared
in one place (below). Features never import each other; they only talk to the
engine through global hooks (see docs/ARCHITECTURE.md).
"""
import os, re, shutil, subprocess, sys, tempfile, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC, STEPS_DIR, DIST = ROOT / "src", ROOT / "build" / "steps", ROOT / "dist"

# Ordered pipeline. (kind, file)  kind: sh | py
STEPS = [
    ("sh", "rebuild.sh"),        # core + montage feature
    ("py", "apply_gen.py"),      # ai-generation
    ("py", "apply_names.py"),    # naming / labels
    ("py", "apply_glyphs.py"),   # elements-glyphs
    ("py", "apply_pro.py"),      # pro-core
    ("py", "apply_pro2.py"),     # sfx-engine
    ("py", "apply_pro4.py"),     # quran-captions + tabs
    ("py", "apply_native.py"),   # native-bridge
    ("py", "apply_pro8.py"),     # ux
    ("py", "apply_pro9.py"),     # prompts
    ("py", "apply_pro15.py"),    # smart-tools
    ("py", "apply_pro16.py"),    # marks
    ("py", "apply_pro17.py"),    # pro-methods + live timeline
    ("py", "apply_pro18.py"),    # scene-gen (local scene generator + describe-your-style)
    ("py", "i18n_inv.py"),       # i18n inventory (must follow all injections)
    ("py", "apply_pro7.py"),     # i18n runtime
]

def main():
    work = pathlib.Path(tempfile.mkdtemp(prefix="avs-"))
    try:
        # 1. flatten sources into the work dir (steps use cwd-relative names)
        shutil.copy(SRC / "core" / "studio.html", work / "studio.html")
        for f in (SRC / "features").rglob("*"):
            if f.is_file():
                shutil.copy(f, work / f.name)
        (work / "serve").mkdir()
        # 2. copy steps, making paths cwd-relative
        for f in STEPS_DIR.iterdir():
            t = f.read_text(encoding="utf-8")
            t = t.replace("cd /tmp/claude-0/mont && ", "").replace("/tmp/claude-0/mont/", "")
            (work / f.name).write_text(t, encoding="utf-8")
        # 3. run the pipeline
        for kind, name in STEPS:
            cmd = ["bash", name] if kind == "sh" else [sys.executable, name]
            r = subprocess.run(cmd, cwd=work, capture_output=True, text=True)
            if r.returncode:
                sys.exit(f"step {name} failed:\n{r.stdout}\n{r.stderr}")
            print("ok", name)
        DIST.mkdir(exist_ok=True)
        shutil.copy(work / "serve" / "index.html", DIST / "index.html")
        print("built", DIST / "index.html", (DIST / "index.html").stat().st_size, "bytes")
    finally:
        shutil.rmtree(work, ignore_errors=True)

if __name__ == "__main__":
    main()
