# Decision Log — Slop Detector Pre-Submit Check

**Status:** decided
**Started:** 2026-04-18
**Owner:** Hubertus
**Spec:** [../../docs/superpowers/specs/2026-04-18-slop-detector-design.md](../../docs/superpowers/specs/2026-04-18-slop-detector-design.md)
**Related plan:** (not yet written)

---

## Phase 0 — Survey

- CLAUDE.md lists 7 concrete rejection criteria (third-party deps, domain skills, bulk PRs, speculative fixes, fabricated content, bundled changes, fork-specific). High-signal markers.
- hooks.json supports SessionStart hooks; run-hook.cmd exists as execution layer. New hook type could slot here.
- code-reviewer skill validates plan alignment; detector complements by catching PRs *before* submission.
- verification-before-completion skill is orthogonal.
- 94% rejection rate described as "lies" and "hallucination" in CLAUDE.md. No prior detector found.

**MECE self-check:**
- [x] No redundancies, no contradictions, no surveyed gaps left open.

---

## Phase 1 — Problem framing

**Problem:** PRs submitted by AI agents on the superpowers repo often fail validation due to synthetic claims, missing human review, incomplete template sections, and bulk/unrelated changes. A pre-submission gate is needed to catch these early, before wasting maintainer time.

**Non-goals:**
- Replace human code review or maintainer judgment
- Block legitimate PRs
- Make rules repo-specific or project-specific
- Depend on external services or models

**Constraints:**
- Zero third-party dependencies
- Markdown/JSON-based configuration (no code execution in rules)
- Must integrate with existing hook system
- Must work on macOS, Windows, Linux
- Must execute in < 1 second per PR

**MECE self-check:** [x] [x] [x]

---

## Phase 2 — Option set

- **Option A — Pre-commit hook gate:** Runs detector rules; integrates with existing hook infrastructure.
- **Option B — Linter rules:** Markdown linter with custom rules packaged as JSON schemas; runs in CI/CD or locally.
- **Option C — Hybrid (hook + config):** Detector lives in hook system; rules are JSON config; decouples execution from rule definitions.

**Option-set reviewer findings:**
- **Gap (G):** No "do-nothing" option considered. Accepted: detector is heuristic-based (high precision, lower recall) rather than perfect.
- **Overlap (O):** Options A and B share detection logic; they differ only in *where* they run. Clarification: B is advisory, A is mandatory gate.
- **Contradiction (C):** Option B mentions "CI/CD" execution, which conflicts with non-goal "do not block legitimate PRs." Resolved: detector runs locally only; CI is for validation after human review.

**Ops-security persona dispatch:**
- Finding: Hook execution requires shell access; detector rules must not enable arbitrary shell injection. JSON rule config with regex patterns is safe; shell templates are not.
- Recovery: Rules must be data-only (no code evaluation, no shell interpolation). Enforce schema validation on `hooks/slop-detector.json` at load time.

---

## Phase 3 — Decisions

- **D-1:** Use hook-based execution (pre-commit gate, not lint). Rationale: CLAUDE.md guidance is prescriptive; PRs that violate it should not be submitted.
- **D-2:** Detector rules live in JSON config file (`hooks/slop-detector.json`). Rationale: Zero-dep, human-readable, updateable without code changes; mirrors existing hook config patterns.
- **D-3:** Focus on five high-signal patterns: fabricated problem statements, missing PR template sections, bulk/multi-issue PRs, fork-specific claims, third-party dependency additions. Rationale: Explicit criteria in CLAUDE.md; easy to detect with regex + heuristics.
- **D-4:** Detector is **advisory-only on first run** — warns but does not block. Rationale: Reduces false positives; humans can override. Can harden later.
- **D-5:** Detector runs only if `hooks/slop-detector.json` exists and is enabled. Rationale: Opt-in; does not impose on forks.
- **D-6:** Rules are data-only — no code evaluation, no shell interpolation; schema-validated at load (ops-security finding). Rationale: Hook execution context has shell access; untrusted rule files must not be executable.

**Decisions deferred or dropped:**
- Option B (linter-based): deferred as possible future companion advisory tool.

**MECE self-check:** [x] [x] [x]

---

## Phase 4 — Spec

**Spec document:** [../../docs/superpowers/specs/2026-04-18-slop-detector-design.md](../../docs/superpowers/specs/2026-04-18-slop-detector-design.md)

> Spec MUST include `Decision log:` header. Example:
>
> ```markdown
> **Decision log:** [2026-04-18-slop-detector.md](../decisions/2026-04-18-slop-detector.md)
> ```

**Trace reviewer findings:**

**Status:** Clean

| Decision | Spec section |
|---|---|
| D-1 | Hook Integration |
| D-2 | Rule Format |
| D-3 | Detection Rules |
| D-4 | Execution Mode |
| D-5 | Opt-in Control |
| D-6 | Security Model |

- **Spec orphans:** None
- **Missing downstream coverage:** None

**Search log:** 6 decisions checked (D-1 through D-6); all map to spec sections.

---

## Change Log

- 2026-04-18 — Initial decision log; all phases complete; ready for spec review.
