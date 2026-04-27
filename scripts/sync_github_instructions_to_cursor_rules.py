"""Generate .cursor/rules/*.mdc from .github (instructions + copilot index + skills).

Run after editing `.github/instructions/*.instructions.md` to refresh Cursor rules.
Canonical source remains under `.github/`; this script duplicates content for Cursor.
"""
from __future__ import annotations

import pathlib
import re

REPO = pathlib.Path(__file__).resolve().parents[1]
INST = REPO / ".github" / "instructions"
SKILLS = REPO / ".github" / "skills"
COPILOT = REPO / ".github" / "copilot-instructions.md"
OUT = REPO / ".cursor" / "rules"

DEFAULTS: dict[str, dict] = {
    "12-factor-app.instructions.md": {
        "alwaysApply": True,
        "description": "12-Factor App: codebase, config, logs, processes — whole project.",
    },
    "frontend-component-modularity.instructions.md": {
        "globs": "frontend/**/*",
        "description": "React modularity: single responsibility, container vs presentational.",
    },
    "frontend-dialog.instructions.md": {
        "globs": "frontend/**/*",
        "description": "Dialogs: use useConfirm; forbid native alert/confirm/prompt.",
    },
}

# Per-skill Cursor behavior (omit key → alwaysApply true). Mirrors former bundled github-skills.mdc
# where possible; narrow globs for very long or path-specific skills.
SKILL_CURSOR_META: dict[str, dict] = {
    "shell-script-best-practices.md": {"alwaysApply": False, "globs": "**/*.sh"},
    "frontend-fluid-layout.md": {"alwaysApply": False, "globs": "frontend/**/*"},
}


def to_globs(apply_to: str) -> str:
    s = apply_to.strip().strip('"').strip("'")
    if "frontend" in s:
        return "frontend/**/*"
    if s.endswith(".java") or "backend/**/*.java" in s:
        return "backend/**/*.java"
    return s


def parse_frontmatter(text: str) -> tuple[str | None, str | None, str]:
    if not text.startswith("---"):
        return None, None, text
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.DOTALL)
    if not m:
        return None, None, text
    block, rest = m.group(1), text[m.end() :]
    desc = apply_to = None
    for line in block.splitlines():
        if line.startswith("description:"):
            desc = line.split(":", 1)[1].strip().strip('"').strip("'")
        if line.startswith("applyTo:"):
            apply_to = line.split(":", 1)[1].strip().strip('"').strip("'")
    return desc, apply_to, rest


def write_copilot_rule() -> None:
    if not COPILOT.is_file():
        return
    body = COPILOT.read_text(encoding="utf-8")
    body = body.replace("](instructions/", "](.github/instructions/")
    header = (
        "---\n"
        'description: "Sea World project index: stack, layers, security, shell — mirror of .github/copilot-instructions.md"\n'
        "alwaysApply: true\n"
        "---\n\n"
        "> **Source of truth**: `.github/copilot-instructions.md` (edit there, then re-run this script.)\n\n"
    )
    (OUT / "project-copilot-instructions.mdc").write_text(header + body, encoding="utf-8")
    print((OUT / "project-copilot-instructions.mdc").relative_to(REPO))


def _skill_description(path: pathlib.Path, body: str) -> str:
    m = re.search(r"^#\s+(.+)$", body, re.MULTILINE)
    if m:
        return m.group(1).strip()[:240]
    return f"Skill ({path.stem})"


def _remove_legacy_skill_bundle() -> None:
    legacy = OUT / "github-skills.mdc"
    if legacy.is_file():
        legacy.unlink()
        print(f"Removed {legacy.relative_to(REPO)}")


def write_skill_rules() -> None:
    if not SKILLS.is_dir():
        return
    _remove_legacy_skill_bundle()
    for path in sorted(SKILLS.glob("*.md")):
        body = path.read_text(encoding="utf-8")
        desc = _skill_description(path, body)
        meta = SKILL_CURSOR_META.get(path.name, {})
        always = bool(meta.get("alwaysApply", True))
        globs: str | None = meta.get("globs")
        safe_desc = desc.replace('"', '\\"')
        provenance = (
            f"> **Source of truth**: `{path.relative_to(REPO).as_posix()}` "
            "(edit there, then re-run this script.)\n\n"
        )
        if always:
            header = f'---\ndescription: "{safe_desc}"\nalwaysApply: true\n---\n\n'
        else:
            g = globs or "**/*"
            header = (
                f'---\ndescription: "{safe_desc}"\n'
                f"globs: {g}\nalwaysApply: false\n---\n\n"
            )
        out_name = f"skill-{path.stem}.mdc"
        out_path = OUT / out_name
        out_path.write_text(header + provenance + body.lstrip("\n"), encoding="utf-8")
        print(out_path.relative_to(REPO))


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for path in sorted(INST.glob("*.instructions.md")):
        raw = path.read_text(encoding="utf-8")
        desc, apply_to, body = parse_frontmatter(raw)
        dflt = DEFAULTS.get(path.name, {})
        if desc is None:
            desc = dflt.get("description", f"Instruction: {path.stem}")
        always = bool(dflt.get("alwaysApply", False))
        globs: str | None = dflt.get("globs")
        if apply_to:
            globs = to_globs(apply_to)
        elif not always and globs is None:
            globs = "**/*"

        safe_desc = desc.replace('"', '\\"')
        if always:
            header = f'---\ndescription: "{safe_desc}"\nalwaysApply: true\n---\n\n'
        else:
            header = (
                f'---\ndescription: "{safe_desc}"\n'
                f"globs: {globs}\nalwaysApply: false\n---\n\n"
            )
        stem = path.name.replace(".instructions.md", "")
        out_path = OUT / f"{stem}.mdc"
        out_path.write_text(header + body, encoding="utf-8")
        print(out_path.relative_to(REPO))
    write_copilot_rule()
    write_skill_rules()


if __name__ == "__main__":
    main()
