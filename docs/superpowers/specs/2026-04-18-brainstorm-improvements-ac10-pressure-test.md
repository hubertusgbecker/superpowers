# AC-10 Pressure Test Plan (Deferred to Live Cycle)

AC-10 of [2026-04-18-brainstorming-improvements-from-syspilot.md](../plans/2026-04-18-brainstorming-improvements-from-syspilot.md) requires evidence that the new phased brainstorming flow produces a tighter spec on the same input than the pre-change flow. This cannot be verified statically — it requires a live cycle with a human partner.

## How to run the test

1. Pick one small, real topic the human partner would brainstorm. Ideal size: something that would have produced 1–2 pages of free-form notes under the old flow.
2. Run the new `superpowers:brainstorming` flow end-to-end: Phase 0 (research survey) → Phase 1 (problem) → Phase 2 (options + opt-in personas) → Phase 3 (decisions) → Phase 4 (spec + trace-reviewer gate).
3. Capture the artifacts produced:
   - Decision log under `docs/superpowers/decisions/YYYY-MM-DD-<slug>.md`
   - Spec under `docs/superpowers/specs/YYYY-MM-DD-<slug>-design.md`
   - Option-set-reviewer output (at least one dispatch)
   - Trace-reviewer output at brainstorm → spec handoff

## What to compare

Compare against the closest pre-change equivalent the human partner has on hand (prior brainstorm notes, prior spec). Record:

| Dimension | Old flow | New flow |
|---|---|---|
| Spec length (lines) | | |
| Number of decisions with explicit rationale | | |
| Orphan findings from trace-reviewer | n/a (not previously run) | |
| Rework requests after spec was written | | |
| Time from topic to approved spec | | |

## Pass criteria

- New spec is shorter or same length with equal-or-more explicit decisions traced from the log.
- Trace-reviewer finds zero unresolved orphans at the brainstorm → spec handoff.
- No decision appears in the spec without a matching `D-N` entry in the decision log.

## If the test fails

File findings against the plan's risk register and open one follow-up issue per failure mode. Do not retrofit the flow silently.
