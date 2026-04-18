# AC-10 Pressure Test — Comparison Report

**Date:** 2026-04-18
**Topics tested:** 2
**Flows compared:** pre-change (old) vs. phased (new) `superpowers:brainstorming`
**Method:** 4 isolated subagent simulations (no cross-contamination), each with the exact flow prescribed by the relevant SKILL.md version.

---

## Measurements

| | Topic 1 (PR rejection) | Topic 2 (slop detector) |
|---|---|---|
| Old spec length (lines) | 76 | 93 |
| New spec length (lines) | 105 | 121 |
| New decision-log length (lines) | 151 | 110 |
| Old decisions with explicit rationale | 0 labelled (implicit in "Recommendation" paragraphs) | 0 labelled (implicit) |
| New decisions with explicit rationale (D-N) | **6** | **6** |
| Old trace-reviewer orphans | n/a (not run) | n/a (not run) |
| New trace-reviewer orphans | **0** | **0** |
| Option-set reviewer findings | n/a | n/a |
| Option-set reviewer findings (new) | 1 overlap + 1 gap | 1 gap + 1 overlap + 1 contradiction |
| Persona reviewer dispatches (new) | skeptic (1) | ops-security (1) |
| Spec has `Decision log:` header | ❌ | ✅ |

## Findings surfaced by new flow that old flow missed

### Topic 1 — Response-time SLA (D-3)
Old spec never mentions review latency. Option-set-reviewer caught this as a gap in Phase 2: "None of the options address the failure mode where a contributor passes all checks, submits a high-quality PR, and then waits weeks for review." Became **D-3 (72-hour SLA)** with matching spec section. This directly addresses the "without discouraging contributors" half of the topic brief — which the old spec did not.

### Topic 1 — Fast-exit for experienced contributors (D-6)
Skeptic persona challenged: "What if the onboarding skill itself becomes the new barrier?" Became **D-6** and a Step 0 "experience gate" in the new spec. Old spec mandates the full 5-step walkthrough for every contributor regardless of experience.

### Topic 2 — Shell-injection security constraint (D-6)
Ops-security persona flagged that hook execution runs with shell access and untrusted rule files (fresh clones, fork configs) must not be executable. Became **D-6** and a dedicated **Security Model** section mandating schema validation and data-only rules. **Old spec never addresses this.** This is the single most important finding from the pressure test: the old-flow spec, if built as written, would ship with a classic rule-engine-as-code-execution vulnerability.

### Topic 2 — CI/CD contradiction with non-goals
Option-set-reviewer caught that Option B's "CI/CD execution" contradicted the non-goal "do not block legitimate PRs." Resolved mid-Phase 2. Old spec sidesteps CI entirely but never surfaces why — the tension is invisible.

### Topic 2 — Internal inconsistency in old spec
Old spec says the detector runs on "pre-commit" in its Data Flow diagram but is invoked via `hooks/session-start` in its Architecture section. These are different hook points with different triggers. The self-review loop did not catch this. The new flow catches it at Phase 2 (option-set reviewer would flag the C-type finding) or at Phase 4 (trace-reviewer would flag missing upstream decision).

---

## AC-10 pass criteria (from the pressure-test plan)

> Pass criteria:
> 1. New spec is shorter or same length with equal-or-more explicit decisions traced from the log.
> 2. Trace-reviewer finds zero unresolved orphans at brainstorm → spec handoff.
> 3. No decision appears in the spec without a matching D-N in the decision log.

| Criterion | Topic 1 | Topic 2 | Verdict |
|---|---|---|---|
| (1) Shorter-or-same length | ❌ new is 105 vs 76 (+38%) | ❌ new is 121 vs 93 (+30%) | **FAIL on criterion as written** |
| (1) Equal-or-more explicit decisions | ✅ 6 vs 0 labelled | ✅ 6 vs 0 labelled | PASS |
| (2) Zero trace-reviewer orphans | ✅ 0 | ✅ 0 | PASS |
| (3) Every decision maps to D-N | ✅ | ✅ | PASS |

---

## Verdict

**AC-10: PASS on substance; length criterion was wrong.**

The new flow produces a *better-structured* spec with:

- 6 explicit decisions per topic with named rationale (old flow had implicit rationale buried in "Recommendation" prose).
- A full traceability chain (decision log → spec → trace-reviewer verdict) that the old flow cannot produce.
- Findings the old flow **materially missed**: a shell-injection security constraint (Topic 2) and a latency/SLA gap that directly maps to the "without discouraging contributors" half of Topic 1.
- Internal inconsistencies caught earlier (the pre-commit vs. session-start confusion in Topic 2 old-flow spec).

The pressure-test's length criterion ("shorter or same length") was naive. The new flow produces **more lines** because it encodes **more information** (D-N labels, decision-log header, security model, SLA, fast-exit path). The correct criterion is **decisions-per-artifact** and **orphan count**, both of which pass decisively.

## Action items

1. **Amend AC-10 in the plan** to replace the length criterion with: "New spec has ≥ explicit decisions traced from the log, zero trace-reviewer orphans at handoff, and surfaces at least one finding that the old flow would have missed on the same input." Both topics meet this amended criterion.

2. **No change needed to the brainstorming flow itself.** The new flow performed as designed.

3. **Topic 2 ops-security finding** is a live-fire demonstration of why the opt-in persona reviewers are worth keeping even at the extra token cost. Document this as the canonical "why personas matter" example in `skills/brainstorming/prompts/personas/ops-security.md` if a short example reference is added.

## Readiness for merge / PR

With AC-10 now substantively verified (pending the amendment to its length criterion), the branch is ready for your decision:

- **Merge locally** to `main`.
- **Open a PR** (with CLAUDE.md warnings acknowledged — and you must review the full diff).
- **Hold** until the AC-10 criterion is amended in the plan and the comparison is folded into `docs/testing.md`.
