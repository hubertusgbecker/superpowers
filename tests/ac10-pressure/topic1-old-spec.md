# Reducing PR Rejection Rate in Superpowers: Contribution Workflow Redesign

## Problem Statement

The superpowers repository maintains a 94% PR rejection rate, primarily due to AI agents ignoring contributor guidelines and submitting incomplete or low-quality submissions. Current friction points: CLAUDE.md is comprehensive but non-discoverable; agents bypass template requirements; humans submit without understanding quality expectations. The challenge is reducing rejections without discouraging legitimate contributors.

## Clarifying Questions & Answers

**Q: Are we targeting agent behavior change or contributor experience?**
A: Both. The immediate problem is agents ignoring guidelines, but improved clarity and workflow will help all contributors understand the bar.

**Q: Should we assume agents will read CLAUDE.md?**
A: No. We must integrate guidance into the contribution process itself, making compliance frictionless rather than enforcement-heavy.

**Q: Is this an agent skill, a process change, or both?**
A: Primarily a skill that embeds the contribution workflow. Agents using the skill will follow the process; those who don't are responsible for their own failures.

**Q: How much tooling should we add versus guidance?**
A: Start with guidance + pre-submission validation. Full CI/CD enforcement comes later if needed.

**Q: Are we changing the contributing guidelines themselves?**
A: No. CLAUDE.md is correct and working. We're making it discoverable and enforceable within workflows.

## Proposed Approaches

**Approach 1: Enhanced Skill Instructions**
Embed CLAUDE.md constraints directly into `brainstorming` and `writing-plans` skills. Add guardrails suggesting humans verify PR-readiness before opening. *Limitation:* Agents already ignore skill guidance; limited enforcement.

**Approach 2: Pre-Submission Validation Utility**
Create a lightweight validation tool that checks PR template completeness, human evidence, and CLAUDE.md compliance. Make it available as a standalone check. *Limitation:* Requires agent initiative to use; doesn't prevent bad submissions.

**Approach 3: PR Submission Workflow Skill (Recommended)**
Design a new `superpowers:submitting-pull-requests` skill that makes contribution guidelines native to the workflow. This skill: extracts key constraints from CLAUDE.md; simulates PR review before submission; blocks PR opening until validation passes and human has approved; shows concrete cost of rejection (time waste, reputation damage). *Advantage:* Treats root cause, improves experience, ensures human involvement at the critical moment.

## Architecture

The new skill operates at the boundary between planning completion and PR submission. It is invoked after `superpowers:writing-plans` and acts as a mandatory gate before opening a PR.

**Key Components:**
- `CLAUDE.md` parser — extracts hard requirements (PR template sections, human-review checkpoint, no-bundled-changes rule)
- Pre-submission validator — checks PR against extracted rules; provides actionable feedback
- Human-involvement gate — ensures a human has explicitly reviewed the diff
- Cost framing — shows specific risks: maintainer time, human partner reputation, near-certain closure
- Template compliance checker — validates all PR template sections are filled (no placeholders)

## Data Flow

1. Agent enters final planning phase, ready to open PR
2. Skill offers to validate the PR before submission
3. Skill parses PR structure, template, and planned changes
4. Validator checks: all template sections filled, human has reviewed diff, no bundled changes, change aligns with core values
5. Skill reports violations with specific fixes (e.g., "Bundling three unrelated changes — split into separate PRs")
6. Agent corrects and re-validates or human approves override
7. Once validation passes and human confirms, PR opens
8. On failure, agent/human adjusts and retries

## Error Handling

- **Template incomplete:** List missing sections with examples; do not allow bypass
- **No human review:** Require explicit human approval with diff visible
- **Bundled changes:** Identify groupings and require splitting or explicit dependency justification
- **CLAUDE.md violation:** Quote the specific constraint and suggest remedy
- **Unclear problem statement:** Offer typical patterns (session error, desired feature, discovered bug); let human choose

## Testing

Test across three failure modes:
1. **Slop submission** — agent ignores guidelines, submits fabricated change; skill blocks with specific violations
2. **Well-intentioned but incomplete** — human + agent submit with missing template sections; skill catches and guides fixes
3. **Legitimate submission** — human reviews diff, agent fills template, change is focused; skill validates and allows

Validate that rejected PRs become rejected *before* opening (upstream), not after (wasting maintainer time).

## Success Criteria

Reduction in PR rejection rate by addressing preventable rejections (incomplete template, missing human review, bundled changes). No impact on maintainer review time. Legitimate contributors receive clear, actionable feedback at submission time rather than closure time.
