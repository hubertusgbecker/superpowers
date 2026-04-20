# Decision Logs

Living, compact records of how ideas were shaped during `superpowers:brainstorming`.

## Layout

- **Active:** `docs/superpowers/decisions/YYYY-MM-DD-<slug>.md` — one file per in-flight or recently-shipped topic.
- **Archive:** `docs/superpowers/decisions/archive/YYYY-MM/YYYY-MM-DD-<slug>.md` — completed logs, moved here once the spec, plan, and verification report are done and the feature branch is finished.

## Naming

`YYYY-MM-DD-<short-slug>.md` — date the log was started, slug matching the topic / branch name.

## Lifecycle

1. `superpowers:brainstorming` (Phase 0) creates the log here from [skills/brainstorming/decision-log-template.md](../../../skills/brainstorming/decision-log-template.md).
2. Phases 1–4 update it in place.
3. When the work is merged and `verification-before-completion` has produced its report, move the log into `archive/YYYY-MM/` by the month it was completed (not started).
4. Never delete decision logs. They are the audit trail.

## Anti-patterns

- Do not write long prose. Short bullets, `D-N: <decision> — <rationale>`.
- Do not duplicate content from the spec into the decision log — link to the spec instead.
- Do not archive early. Archive only after verification-before-completion is complete.
