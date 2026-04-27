# Agent instructions (Cursor & others)

**Canonical rules** live under [`.github/instructions/`](.github/instructions/), plus [`.github/copilot-instructions.md`](.github/copilot-instructions.md) and [`.github/skills/`](.github/skills/). GitHub Copilot can use those paths directly.

**Cursor** loads project rules from [`.cursor/rules/*.mdc`](.cursor/rules/). Those files are **generated mirrors** of the `.github` content so the same conventions apply in Cursor.

## Refresh Cursor rules after editing `.github`

From the repo root:

```bash
python scripts/sync_github_instructions_to_cursor_rules.py
```

This overwrites `.cursor/rules/` from:

- `.github/instructions/*.instructions.md` → one `.mdc` each (Cursor `globs`: `backend/**/*.java` or `frontend/**/*` as appropriate; `12-factor-app` → `alwaysApply: true`)
- `.github/copilot-instructions.md` → `project-copilot-instructions.mdc` (`alwaysApply: true`)
- `.github/skills/*.md` → one `skill-<name>.mdc` each (see script `SKILL_CURSOR_META` for `alwaysApply` / `globs` overrides)

## Current `.cursor/rules` map

| `.mdc` file | Source | When it applies in Cursor |
|-------------|--------|---------------------------|
| `project-copilot-instructions.mdc` | `copilot-instructions.md` | Always |
| `12-factor-app.mdc` | `instructions/12-factor-app.instructions.md` | Always |
| `skill-*.mdc` | `skills/*.md` | Per file (default **always**; `shell-script-best-practices` → `**/*.sh`; `frontend-fluid-layout` → `frontend/**/*`) |
| `java-*.mdc` (5 files) | matching `instructions/java-*.instructions.md` | `backend/**/*` |
| `frontend-*.mdc` (5 files) | matching `instructions/frontend-*.instructions.md` | `frontend/**/*` |

## Frontend layout (ui-v2)

For UI refactors per [`docs/ui/ui-v2.md`](docs/ui/ui-v2.md), follow **`frontend-fluid-layout`** (1024px breakpoint, `useDeviceType.ts`).
