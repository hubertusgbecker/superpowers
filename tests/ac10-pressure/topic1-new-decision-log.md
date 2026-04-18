# Decision Log — PR Rejection Rate Improvements

**Status:** decided
**Started:** 2026-04-18
**Owner:** Superpowers maintainers
**Spec:** [../../docs/superpowers/specs/2026-04-18-pr-rejection-rate-design.md](../../docs/superpowers/specs/2026-04-18-pr-rejection-rate-design.md)
**Related plan:** (not yet written)

> A living, compact record of how this idea was shaped. Grows per phase. Short bullets beat prose.

---

## Phase 0 — Survey

**Status:** ✅ done

**Context survey:**

- **CLAUDE.md contributor guidelines** (existing) — documents 94% rejection rate, lists 10+ classes of unacceptable PRs (third-party deps, fabricated content, bulk/"spray-and-pray", speculative fixes, fork-specific changes, etc.). Written for AI agents to stop before damaging reputation.
- **Root causes:** Most rejections are AI slop PRs (agents lack reading comprehension on guidelines; low-effort bulk submissions; hallucinated problem statements).
- **Secondary rejections:** Genuine contributors confused by strict requirements (full PR template, existing PR search, human review evidence, spec docs for small changes).
- **Prior work:** CLAUDE.md itself is the mitigation strategy (written 2024–2025). No downstream enforcement, education, or onboarding infrastructure exists.
- **No blocking infrastructure:** No pre-submission gates, no contributor workflow guides, no automated checklist enforcement, no mentorship role defined.
- **Skill coverage:** Superpowers has `brainstorming`, `executing-plans`, `requesting-code-review` skills, but no "contributor onboarding" or "pre-submission audit" workflow.

**MECE self-check:**
- [x] No redundancies across surfaced prior work
- [x] No contradictions with current repo state
- [x] Gaps identified: no enforcement, no education path, no mentorship model

---

## Phase 1 — Problem framing

**Status:** ✅ done

**Problem statement:**
CLAUDE.md guidelines stop *bad* PRs, but create a high barrier perceived as hostile. Genuine contributors (both AI agents and humans) either abandon projects or submit anyway without reading. Need to reduce rejection rate by improving *acceptance* of quality PRs while maintaining rejection of slop. Current 94% rate damages project reputation and discourages real contributors.

**Non-goals:**
- Lower code-review standards or accept slop PRs
- Create a "fast-track" approval process that skips verification
- Require maintainers to do pre-submission mentoring on every PR
- Add third-party services or dependencies
- Change core philosophy on "AI PRs must show human involvement"

**Constraints:**
- Zero external dependencies (plugin design principle)
- CLAUDE.md philosophy is non-negotiable; enforcement is the missing piece
- Maintainers have low availability for pre-PR review
- Solution must scale to dozens of concurrent PRs
- Must work for both AI-agent submissions and human contributors

**MECE self-check:**
- [x] No redundancies with other active work
- [x] No contradictions with constraints / non-goals
- [x] Gaps identified: no feedback loop, no pre-submission validation, no clear path for first-time contributors

---

## Phase 2 — Option set

**Status:** ✅ done

**Options considered:**

- **Option A — Automated pre-submission audit bot:** CI-like bot runs CLAUDE.md checks (template completeness, existing PR search simulation, decision-log reference check) before PR is submitted. Fails fast with structured feedback. Requires no human time post-submission.
- **Option B — Contributor onboarding walkthrough:** Interactive skill (`superpowers:contributor-prep`) guides first-time submitters through each CLAUDE.md requirement, collects answers, generates PR draft from template. Educational; requires engagement before submission.
- **Option C — Tiered mentorship model:** Establish "PR shepherds" (volunteer maintainers) who review *drafts* (GitHub discussions) before formal PR, provide feedback in real time. Community-driven but requires sustained volunteer availability.

**Option-set reviewer findings:**

**Status:** Findings

- **Type:** overlap
  **Evidence:** Option B and Option C both aim to educate and guide before formal submission. Option B is self-serve (async, skill-driven); Option C is synchronous (human-reviewed). The *choice* between them is not illusory — they serve different contributor profiles — but they could be unified.
  **Recommendation:** Consider combining: Option B as the default path (async), with Option C as an opt-in escalation for high-stakes or complex PRs.

- **Type:** gap
  **Evidence:** None of the options address the failure mode where a contributor *passes all checks*, submits a high-quality PR, and then waits weeks for review. Gap is "latency expectation setting and response SLA."
  **Recommendation:** Define upfront SLA (e.g., "acknowledged in 48–72 hours") as part of whichever option is chosen.

**Skeptic persona dispatch:**
- Challenge: "What if the onboarding skill itself becomes the new barrier? A 5-step skill is still friction."
- Response: Skill must be optional and fast-exit for experienced contributors. Exit after step 1 if contributor asserts familiarity; track those for rejection-rate comparison.

---

## Phase 3 — Decisions

**Status:** ✅ done

- **D-1:** Implement Option B (contributor onboarding skill, `superpowers:contributor-prep`) as the primary solution. Reduces rejections by catching errors *before* submission; educational for all contributor types; sustainable (no volunteer dependencies).

- **D-2:** Include automated pre-submission checks (Option A elements: template completeness, CLAUDE.md reference scan, summary of blocking categories) as a companion tool within the skill. Fail-fast feedback without human latency.

- **D-3:** Set response SLA at 72 hours for all PRs that pass pre-submission checks, documented in README.md or CONTRIBUTING.md. Addresses motivation/latency gap surfaced by option-set reviewer.

- **D-4:** Explicitly call out "AI agent PRs must show human review of diff before submission" as a *benefit* (guarantees minimal quality) not a barrier, with worked example in the skill.

- **D-5:** Defer mentorship model (Option C) to Phase 2 re-evaluation after 3 months of Option B + A data. High volunteer overhead; unclear if needed once automation is in place.

- **D-6:** Skill must offer a fast-exit for experienced contributors (skeptic-persona finding). Avoids becoming a new barrier.

**Decisions deferred or dropped:**
- Tiered mentorship model (Option C): deferred pending Option B efficacy data.

**MECE self-check:**
- [x] No redundant decisions
- [x] No contradictions between decisions
- [x] Every open question from prior phases is resolved (education: D-1; automation: D-2; latency: D-3; motivation: D-4; future iteration: D-5; experienced-user friction: D-6)

---

## Phase 4 — Spec

**Status:** ✅ done

**Spec document:** [../../docs/superpowers/specs/2026-04-18-pr-rejection-rate-design.md](../../docs/superpowers/specs/2026-04-18-pr-rejection-rate-design.md)

> The spec document MUST include a `Decision log:` header pointing back to this file. Example at the top of the spec:
>
> ```markdown
> **Decision log:** [2026-04-18-pr-rejection-rate.md](../decisions/2026-04-18-pr-rejection-rate.md)
> ```

**Trace reviewer findings:**

**Status:** Clean

| Decision | Spec section | Coverage |
|---|---|---|
| D-1 | Skill design; contributor-prep walkthrough | ✅ detailed |
| D-2 | Automated checks engine | ✅ detailed |
| D-3 | SLA documentation and enforcement | ✅ referenced |
| D-4 | Skill messaging on human review requirement | ✅ in step 5 |
| D-5 | Future phase indicator | ✅ noted as out-of-scope |
| D-6 | Fast-exit branch in Step 1 | ✅ detailed |

- **Spec orphans:** none
- **Plan orphans:** none yet (plan not drafted)
- **Missing downstream coverage:** none

**Search log:**
- Decisions checked: 6 (D-1 through D-6)
- Spec sections checked: 7 (Overview, Workflow steps 1–5, Future work)
- All D-N decisions appear in spec with explicit mapping.

**MECE self-check:**
- [x] Every D-N appears in spec or marked deferred
- [x] Spec sections have upstream decision references
