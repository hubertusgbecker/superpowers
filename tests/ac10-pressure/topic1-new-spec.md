# PR Rejection Rate Improvement — Design Spec

**Decision log:** [../../docs/superpowers/decisions/2026-04-18-pr-rejection-rate.md](../../docs/superpowers/decisions/2026-04-18-pr-rejection-rate.md)

---

## Overview

**Problem:** 94% PR rejection rate (documented in CLAUDE.md) deters genuine contributors. Most rejections are preventable if contributors understand and comply with guidelines *before* submission. CLAUDE.md lists 10+ blocking categories but assumes self-study; no guided path exists.

**Solution:** Introduce `superpowers:contributor-prep` — a guided workflow skill that walks prospective submitters through CLAUDE.md requirements, validates readiness, and generates a PR-ready checklist. Coupled with automated pre-submission checks and an explicit SLA, this reduces rejections by catching blockers early and signaling that quality PRs are welcome. (**D-1, D-2**)

**Outcome:** Shift from "reject-and-educate" to "educate-and-accept"; maintain quality bar; sustain contributor motivation. (**D-3, D-4**)

---

## Scope

- **In scope:** Skill design for `superpowers:contributor-prep`; automated checks template; SLA definition; example messaging.
- **Out of scope:** Mentorship model (Option C), dashboard/metrics, bot implementation details, fork-specific or domain-specific contributions.
- **Future phase:** Collect metrics after 3 months; re-evaluate mentorship option. (**D-5**)

---

## Skill: `superpowers:contributor-prep`

**Triggered by:** A contributor (AI agent or human) asks, "How do I submit a PR to this repo?" or "I want to contribute to Superpowers." (**D-1**)

**Workflow (5 steps + fast-exit):**

0. **Experience gate (fast-exit, D-6)** — ask: "Have you submitted an accepted PR to superpowers before?" If yes, offer abbreviated path (only Steps 2 and 5 mandatory). Track fast-exit users for rejection-rate comparison.

1. **Check repo readiness** — read CLAUDE.md, scan `.github/PULL_REQUEST_TEMPLATE.md`. Confirm: "This is a zero-dependency plugin; contributions must follow strict contributor guidelines."

2. **Validate PR scope** — one question: "Does your PR address a single, concrete problem?" (Reject multi-issue bulk submissions, fork-specific syncs, speculative fixes.)

3. **Verify problem authenticity** — ask: "Can you describe a real session, error, or user experience that motivated this change?" Flags fabricated or theoretical fixes.

4. **Search existing work** — run automated check: "Does your topic exist in open or closed issues/PRs?" Surface up to 5 candidates.

5. **Collect proof of human involvement** — for AI submissions: "If an AI agent wrote this, did your human partner review the complete diff before submission?" Show why this matters: proof of intentionality, not rubber-stamping. (**D-4**)

**Exit states:**
- ✅ **Ready to submit** — all checks pass; generate printable checklist.
- ⚠️ **Needs rework** — one or more checks failed; offer targeted remediation advice.
- 🛑 **Should not submit** — PR falls into a blocking category. Explain why; link to CLAUDE.md section.

---

## Automated Pre-Submission Checks

**Invoked during:** Step 2–4 of the skill; also available standalone. (**D-2**)

**Checks (fail-fast, structured feedback):**

1. **Template completeness** — all PR template sections filled (not placeholder text).
2. **CLAUDE.md blocking categories** — scans PR draft against known rejection classes. Surface hits with direct CLAUDE.md quotes.
3. **Existing PR search** — naive keyword search across GitHub issue/PR titles for duplicates.
4. **Decision-log requirement** — if PR is for Superpowers core, confirm problem statement or decision log path referenced.

**Output format:** Structured report (pass/fail per check; remediation links if fail).

---

## SLA and Communication

**Response SLA:** All PRs passing pre-submission checks receive acknowledgment within 72 hours. (**D-3**)

**Messaging in README/CONTRIBUTING.md:**
- "We maintain high standards because we have a 94% rejection rate. That's a sign we care about quality, not that we're hostile."
- "Use `superpowers:contributor-prep` to validate your idea before opening a PR. This is a feature, not a requirement."
- "AI agents: if you submit without proof of human partner review, we will close your PR without review. This is non-negotiable and protects both you and us."
- "If your PR is solid and passes our checks, expect feedback within 72 hours. We value your time as much as ours."

---

## Success Metrics (Phase 2 evaluation, D-5)

After 3 months of skill deployment, measure:
- **Rejection rate** — ratio of closed : merged PRs (target: move from 94% to <70%).
- **Pre-submission usage** — percentage of PRs that report skill-generated checklist.
- **Submission success** — of PRs submitted post-skill, percentage merged (target: >80%).
- **Time to decision** — median days from PR open to first review comment.

If metrics show >10% improvement and >90% of skill users land PRs, mentor model (Option C) is unnecessary.

---

## Testing and Verification

- **Skill testing** — adversarial inputs (fabricated problems, multi-issue bundling, fork syncs, human involvement holes); verify each path rejects or warns correctly.
- **Integration testing** — test skill with real contributors (internal and beta); collect feedback on clarity.
- **Pre-submission checks** — validate template check against PR template structure; test existing-PR search accuracy.
- **Fast-exit path (D-6)** — verify experienced contributors are not blocked by unnecessary steps.

---

## Implementation Order

1. Draft `superpowers:contributor-prep` skill (Phases 1–3).
2. Implement 5-step workflow + fast-exit; test on internal contributors.
3. Deploy automated checks.
4. Write CONTRIBUTING.md and update README with SLA messaging.
5. Beta test with 5–10 external contributors; iterate on clarity.
6. Deploy to repo; measure 3-month metrics (D-5).
