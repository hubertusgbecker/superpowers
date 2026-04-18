# Brainstorming Improvements From Syspilot

**Date:** 2026-04-18
**Type:** System-internal improvement plan for `superpowers:brainstorming` and adjacent skills
**Source ideas:** `repomix-output-syspilot.xml` (syspilot framework)
**True north baseline:** `repomix-output.xml` (superpowers current state)
**Scope:** Brainstorming, ideation, decision-capture, and the brainstorm → spec → plan handoff. Domain-specific syspilot content (A-SPICE, sphinx-needs / RST, automotive functional safety, 11-agent PM/CM/QM hierarchy, Jarvis message queue) is explicitly excluded.

---

## 0. Synthesis: Syspilot Ideas Mapped to Superpowers

For each idea: rating 1–10 (relevance × novelty × leverage for superpowers brainstorming), what syspilot does, what superpowers already has, and the gap to close.

### A. Already covered in superpowers — reuse, do not re-implement

| # | Syspilot idea | Existing superpowers equivalent | Action |
|---|---|---|---|
| A1 | Reviewer prompts (per-doc) | [skills/brainstorming/spec-document-reviewer-prompt.md](skills/brainstorming/spec-document-reviewer-prompt.md), [skills/writing-plans/plan-document-reviewer-prompt.md](skills/writing-plans/plan-document-reviewer-prompt.md), [skills/subagent-driven-development/spec-reviewer-prompt.md](skills/subagent-driven-development/spec-reviewer-prompt.md) | None — reuse |
| A2 | Subagent orchestration / dispatch | [skills/dispatching-parallel-agents/SKILL.md](skills/dispatching-parallel-agents/SKILL.md), [skills/subagent-driven-development/SKILL.md](skills/subagent-driven-development/SKILL.md) | None — reuse |
| A3 | Plans broken into reviewable units | [skills/writing-plans/SKILL.md](skills/writing-plans/SKILL.md) (chunks + per-chunk reviewer loop) | None — reuse |
| A4 | Per-step verification gate | [skills/verification-before-completion/SKILL.md](skills/verification-before-completion/SKILL.md) | None — reuse |
| A5 | Code-quality reviewer | [agents/code-reviewer.md](agents/code-reviewer.md), [skills/requesting-code-review/SKILL.md](skills/requesting-code-review/SKILL.md), [skills/receiving-code-review/SKILL.md](skills/receiving-code-review/SKILL.md) | None — reuse |
| A6 | Visual / interactive ideation | [skills/brainstorming/visual-companion.md](skills/brainstorming/visual-companion.md) + brainstorm-server (already richer than syspilot) | None — reuse |
| A7 | Branching discipline / feature branches | [skills/using-git-worktrees/SKILL.md](skills/using-git-worktrees/SKILL.md), [skills/finishing-a-development-branch/SKILL.md](skills/finishing-a-development-branch/SKILL.md) | None — reuse |
| A8 | Skill-as-code, tested behavior shaping | [skills/writing-skills/SKILL.md](skills/writing-skills/SKILL.md) + persuasion-principles + testing-skills-with-subagents | None — reuse |

### B. Genuine gaps — adopt from syspilot (rated, ordered)

| # | Idea | Rating | What syspilot does | Gap in superpowers | Adoption sketch |
|---|---|---:|---|---|---|
| B1 | **MECE reviewer for option sets** | 10 | MECE engineer scans elements at one level for **R**edundancy, **G**aps, **C**ontradictions, **O**verlaps — advisory, non-blocking | Brainstorming presents 2–4 options but no structured pass for redundancy / contradictions / coverage gaps between them | New `option-set-reviewer-prompt.md` invoked after every option-set is presented |
| B2 | **Phased brainstorm with live advisory checks** | 9 | System designer writes per-level (US → REQ → SPEC), each level immediately gets MECE feedback before moving on | Brainstorming today is one big loop; no explicit phases, no per-phase consistency check | Phase the skill: Problem → Options → Decisions → Spec, with reviewer hook after each |
| B3 | **Living Decision Log artifact** | 9 | Change Document is a *short* decision log, grows incrementally per phase, decisions captured with rationale (D-1, D-2…) | Superpowers has spec docs and plans but no compact, incrementally-grown decision-log format; rationales are scattered | New `decision-log.md` template owned by brainstorming skill |
| B4 | **Impact analysis BEFORE ideating** | 9 | `get_need_links.py` queries existing specs to find what a change touches before design starts | Brainstorming jumps to options without first surveying which existing skills / plans / specs the topic intersects | Add a "context survey" subagent step at brainstorming start; markdown-link based, not sphinx-needs |
| B5 | **Multi-perspective persona reviewers** | 9 | MECE + Trace are two independent reviewer perspectives on the same artifact | Superpowers has one reviewer per doc; no built-in adversarial / persona triangulation | Add lightweight persona reviewer set: skeptic / end-user / ops-security / future-maintainer (configurable) |
| B6 | **Traceability reviewer (vertical chain)** | 9 | Trace engineer verifies US → REQ → SPEC chain is complete, no orphans | No automated check that `brainstorm decision → spec section → plan task → code change` chain is intact | New `trace-reviewer-prompt.md` invoked at end of brainstorm and again at end of plan |
| B7 | **MECE checklist embedded in templates** | 9 | Change Document template ships with `- [x] No contradictions / No redundancies / Gaps addressed` checkboxes per level | Superpowers spec/plan templates lack a built-in self-audit checklist | Add MECE checklist block to brainstorm spec template and plan chunk template |
| B8 | **Backward-navigation impact warning** | 8 | When user revisits an earlier level, system explicitly warns that lower levels may need updating | When user revisits an earlier brainstorm decision, downstream spec/plan impact is not surfaced | Add backward-navigation prompt to brainstorming SKILL: enumerate downstream artifacts before re-opening a decision |
| B9 | **Verification report paired with spec** | 8 | Each change document has `val-{name}.md` showing AC coverage, design adherence, build validation | Superpowers has verification-before-completion but no artifact pairing brainstorm spec ↔ what shipped | Optional `verification-report.md` template, generated by `verification-before-completion` when a brainstorm spec exists |
| B10 | **Pure-planning research subagent** | 8 | PM agent: research-only, no execution, produces "research findings" doc | Brainstorming mixes exploration with option-presentation; no clean "go investigate the topic" mode | Add `research-subagent-prompt.md` for upfront topic exploration, used by B4 |
| B11 | **Decision Log archived after release** | 7 | Change documents archived under `docs/changes/archive/v{version}/` — preserved audit trail | Old brainstorms / plans accumulate at top level with no archival convention | Add `docs/superpowers/decisions/archive/` convention for completed brainstorms |
| B12 | **Soul / Duties / Workflow separation in skill spec** | 6 | Each agent split into immutable identity vs customizable duties vs customizable workflow | Skills mostly mash these together; harder for users to safely override one part | Document the pattern in `writing-skills`; do not refactor existing skills |
| B13 | **Skill exchange contract (input/output)** | 6 | `syspilot.impact-python` swappable for `syspilot.impact-rust` because contract is fixed | Superpowers skills don't expose explicit input/output contracts | Optional metadata block in SKILL.md frontmatter; documented in `writing-skills`, not enforced |

### C. Explicitly NOT adopted

- **Sphinx + sphinx-needs / RST format** — syspilot's traceability backbone. Heavyweight, conflicts with superpowers' zero-dependency markdown-only ethos. Borrow the *concept* (B6) via plain markdown links and headings.
- **A-SPICE alignment** — automotive/functional-safety, domain-specific.
- **Full 11-agent PM/CM/QM/Designer/UAT/Implement/MECE/Trace/Docu/Release/Setup hierarchy** — too heavy. Superpowers already has subagent-driven-development; we cherry-pick reviewer roles only.
- **Jarvis async message queue** — solves a problem superpowers doesn't have (subagent return values already work).
- **Setup engineer with file-ownership update model** — out of scope; orthogonal to brainstorming.
- **Frontmatter `agents:` allowlist for invocation restriction** — not aligned with superpowers harness model (Claude Code, Codex, OpenCode all differ); skip.
- **Sphinx-build between phases** — replaced by simple markdown link integrity in B6.

---

## 1. Goals & Non-Goals

### Goals

1. Make `superpowers:brainstorming` produce *better* option sets (no redundancy, no gaps, no contradictions) without slowing the happy path.
2. Capture decisions and rationale as a living, compact artifact during brainstorming (not buried in chat history).
3. Establish a verifiable chain `brainstorm → spec → plan → implementation` with a lightweight trace reviewer.
4. Add multi-perspective scrutiny to brainstorming via configurable persona reviewers — without adding required dependencies.
5. Survey existing superpowers artifacts before brainstorming, so ideation builds on prior work instead of duplicating it.

### Non-goals

- Replacing the existing visual brainstorming server.
- Introducing sphinx-needs, RST, or any non-markdown traceability tooling.
- Adding required external dependencies. All new code stays zero-dep.
- Refactoring existing reviewer prompts that already work.
- Making any changes domain-specific (A-SPICE, automotive, regulated industries).

---

## 2. Target Architecture (after this plan)

```
superpowers:brainstorming
├── SKILL.md                           (phased: Survey → Problem → Options → Decisions → Spec)
├── visual-companion.md                (unchanged)
├── spec-document-reviewer-prompt.md   (unchanged — stays at skill root)
├── decision-log-template.md           NEW  (B3, B7)
├── verification-report-template.md    NEW  (B9)
├── prompts/                           NEW  (home for NEW prompts only; existing prompt stays at root to avoid churn)
│   ├── option-set-reviewer-prompt.md          NEW  (B1)
│   ├── trace-reviewer-prompt.md               NEW  (B6)
│   ├── research-subagent-prompt.md            NEW  (B10)
│   └── personas/
│       ├── skeptic.md                         NEW  (B5)
│       ├── end-user.md                        NEW  (B5)
│       ├── ops-security.md                    NEW  (B5)
│       └── future-maintainer.md               NEW  (B5)
└── scripts/                           (unchanged)

docs/superpowers/decisions/             NEW  (B3, B11)
└── archive/

skills/writing-skills/SKILL.md          UPDATED  (B12, B13 — documented patterns only)
```

Existing skills touched (small additions only): `verification-before-completion` (B9 hook), `writing-plans` plan-chunk template (B7 MECE checklist), `writing-skills` (document B12, B13).

---

## 3. Implementation Chunks

Each chunk ≤ ~1000 lines of plan/edits, independently reviewable. Per [skills/writing-plans/SKILL.md](skills/writing-plans/SKILL.md), invoke the plan-document-reviewer between chunks; per [skills/subagent-driven-development/SKILL.md](skills/subagent-driven-development/SKILL.md), use spec-reviewer + code-quality-reviewer on each implementation task.

### Chunk 1: Foundations — directory layout, templates, decision log

- [ ] ### Task 1.1: Create `decision-log-template.md` in `skills/brainstorming/`
  - [ ] **Step 1:** Author template with sections: `Topic`, `Status (exploring / decided / superseded)`, `Phase 1 — Problem framing`, `Phase 2 — Option set` (with MECE self-check checklist), `Phase 3 — Decisions` (`D-1: <decision> — <rationale>`), `Phase 4 — Spec link`. Each phase has a `Status` line (`⏳ in progress` / `✅ done`) and a `Decisions` bullet list. Format matches the syspilot Change Document spirit but uses markdown not RST.
  - [ ] **Step 2:** Add embedded MECE self-check block per phase: `- [ ] No redundancies` / `- [ ] No contradictions` / `- [ ] Gaps identified and addressed` (B7).
  - [ ] **Step 3:** Verify template renders cleanly in a markdown viewer; no broken structure.

- [ ] ### Task 1.2: Create `verification-report-template.md` in `skills/brainstorming/`
  - [ ] **Step 1:** Author template with sections: `Spec reference`, `Decisions verified` (table: D-id / shipped? / evidence), `Decisions deferred / dropped` (with reason), `Trace`: brainstorm decision → spec section → plan task → commit, `Build / test validation`, `Conclusion`.
  - [ ] **Step 2:** Keep template under one screen; this is a checklist, not an essay.

- [ ] ### Task 1.3: Establish archive directory convention
  - [ ] **Step 1:** Create `docs/superpowers/decisions/` and `docs/superpowers/decisions/archive/` with a `README.md` explaining: active decision logs live in `decisions/`, completed ones move to `archive/<YYYY-MM>/` (B11).
  - [ ] **Step 2:** Document naming: `YYYY-MM-DD-<short-slug>.md`.

- [ ] ### Task 1.4: Reviewer-loop checkpoint
  - [ ] **Step 1:** Dispatch plan-document-reviewer on this chunk's outputs. Address findings before Chunk 2.

### Chunk 2: Option-set reviewer (B1) and persona reviewers (B5)

- [ ] ### Task 2.1: Create `prompts/option-set-reviewer-prompt.md`
  - [ ] **Step 1:** Define inputs: the option set (markdown), the problem statement, the decision log so far.
  - [ ] **Step 2:** Define checks the reviewer must perform — explicitly RGCO:
    - **R**edundancy: any two options describe substantially the same approach?
    - **G**aps: is there an obvious option missing from the design space (e.g., do-nothing, buy-vs-build, hybrid)?
    - **C**ontradictions: do option descriptions contradict the stated problem or each other in non-trivial ways?
    - **O**verlap: do options share so much that the choice is illusory?
  - [ ] **Step 3:** Output contract: `## Findings` with `- type: redundancy|gap|contradiction|overlap` / `- evidence:` / `- recommendation:`. **Advisory, non-blocking** — explicitly state the brainstorm continues even if findings are unaddressed.
  - [ ] **Step 4:** Add anti-rationalization counters per [skills/writing-skills/persuasion-principles.md](skills/writing-skills/persuasion-principles.md): "Do not soften findings. Do not produce ‘looks good’ if there are real gaps. Listing zero findings is acceptable only when you have actively searched for each of R/G/C/O."

- [ ] ### Task 2.2: Create `prompts/personas/` with four persona reviewer prompts
  - [ ] **Step 1:** `skeptic.md` — prosecutorial voice; goal: find the single weakest assumption in each option and articulate the failure mode it produces.
  - [ ] **Step 2:** `end-user.md` — speak as a non-author user of the eventual artifact; goal: identify confusion / friction / missing affordances.
  - [ ] **Step 3:** `ops-security.md` — operational and security lens; goal: surface failure modes, blast radius, secrets handling, recovery story.
  - [ ] **Step 4:** `future-maintainer.md` — voice of someone reading this in 12 months; goal: identify implicit context, missing rationale, brittleness to change.
  - [ ] **Step 5:** Each persona prompt is ≤ 50 lines, single-purpose, references the option set and decision log as input, outputs a short findings list. Personas are **opt-in**; brainstorming SKILL describes when each is worth invoking.

- [ ] ### Task 2.3: Reviewer-loop checkpoint
  - [ ] **Step 1:** Dispatch spec-reviewer + code-quality-reviewer on Chunk 2 prompt files. Verify each reviewer prompt actually produces useful findings on a deliberately weak option set (RED test per [skills/writing-skills/testing-skills-with-subagents.md](skills/writing-skills/testing-skills-with-subagents.md)).

### Chunk 3: Phased brainstorming flow (B2) and context survey (B4, B10)

- [ ] ### Task 3.1: Create `prompts/research-subagent-prompt.md`
  - [ ] **Step 1:** Define a research-only subagent (no edits, no commits). Inputs: topic, repo path. Outputs: a "context survey" markdown with three sections — `Existing skills touched`, `Existing plans / specs touched`, `Prior decisions in docs/superpowers/decisions/` — each with bullet-pointed file links and one-line relevance notes (B4).
  - [ ] **Step 2:** Cap the survey at one screen. The point is orientation, not a literature review.

- [ ] ### Task 3.2: Update `skills/brainstorming/SKILL.md` to be explicitly phased
  - [ ] **Step 1:** Read current SKILL.md end-to-end. Preserve voice ("your human partner"), zero-dep ethos, and visual-companion behavior.
  - [ ] **Step 2:** Restructure flow into phases with explicit gates:
    1. **Phase 0 — Survey:** dispatch research-subagent (Task 3.1) → produce context survey → start a fresh `decision-log.md` from Task 1.1 template under `docs/superpowers/decisions/`. **The skill MUST then surface the decision-log path to the human partner and explicitly ask for confirmation (`"Survey complete. Decision log started at <path>. Ready to proceed to Problem framing (Phase 1)?"`) before advancing.** Record the decision-log path in the session so downstream phases and verification-before-completion can reference it.
    2. **Phase 1 — Problem framing:** discuss with human partner; capture problem statement in decision log; mark phase done.
    3. **Phase 2 — Options:** generate 2–4 options (visual or text); dispatch option-set-reviewer (Task 2.1); present findings; human partner decides whether to iterate or proceed.
    4. **Phase 3 — Decisions:** human partner picks; capture each decision as `D-N: <decision> — <rationale>` in the decision log.
    5. **Phase 4 — Spec:** produce design spec doc as today; link from decision log; dispatch spec-document-reviewer as today. The spec doc MUST include the decision-log path in its header so downstream skills can find it.
  - [ ] **Step 3:** For each phase, explicitly state: which artifact gets updated, which reviewer (if any) runs, and that reviewers are **advisory** during phases 1–3 and **gating** at phase 4.
  - [ ] **Step 4:** Add a "Backward navigation" subsection (B8): if the human partner reopens a decided phase, the skill must first list every downstream artifact (spec sections, plan tasks, decision-log entries) that may need re-validation, and confirm before proceeding.
  - [ ] **Step 5:** Add an "Optional persona reviewers" subsection (B5): describe when invoking `prompts/personas/*` is worth the round-trip — high-stakes design, security-sensitive change, user-facing UX, or any decision intended to be hard to reverse.
  - [ ] **Step 6:** Anti-bloat check: SKILL.md must remain scannable. If it grows past the previous size by more than ~30%, split phase descriptions into a referenced `phases.md`.

- [ ] ### Task 3.3: Reviewer-loop checkpoint
  - [ ] **Step 1:** Dispatch plan-document-reviewer + spec-reviewer on Chunk 3.
  - [ ] **Step 2:** RED-test the new flow with a subagent given a deliberately under-specified topic; confirm the survey + option-set-reviewer + decision log produce a tighter outcome than the pre-change skill on the same prompt.

### Chunk 4: Trace reviewer (B6) and verification-report integration (B9)

- [ ] ### Task 4.1: Create `prompts/trace-reviewer-prompt.md`
  - [ ] **Step 1:** Inputs: decision log path, spec doc path, plan doc path (any may be absent depending on lifecycle stage).
  - [ ] **Step 2:** Checks:
    - Every `D-N` decision in the log appears in (or is explicitly justified as out-of-scope for) the spec.
    - Every spec section maps to at least one plan task (when plan exists).
    - No spec section is orphaned (no upstream decision).
    - No plan task is orphaned (no upstream spec section).
  - [ ] **Step 3:** Output contract: a small traceability table + an `Orphans` list + a `Missing downstream coverage` list. Findings are **gating** at the brainstorm → spec handoff and at the spec → plan handoff; **advisory** mid-phase.
  - [ ] **Step 4:** Anti-rationalization: explicitly forbid "trace by association" — link must be present in document text or the cell is empty.

- [ ] ### Task 4.2: Update `skills/verification-before-completion/SKILL.md`
  - [ ] **Step 1:** Add a small section: "If a brainstorm decision log exists for this work, produce or update a verification report from `skills/brainstorming/verification-report-template.md` before marking the work complete." (B9)
  - [ ] **Step 2:** Define the decision-log discovery contract explicitly (resolves Issue #1 from plan review). In priority order:
    1. If the human partner (or the dispatcher) provided a decision-log path, use that.
    2. Else, if the spec doc being verified contains a `Decision log:` header link (set in Task 3.2 Step 2 Phase 4), follow it.
    3. Else, look for a single matching file in `docs/superpowers/decisions/` whose slug matches the current branch name or spec filename.
    4. Else, ask the human partner for the path — do NOT guess from recency. If none exists, skip the report step and note "no brainstorm decision log associated with this work" in the verification output.
  - [ ] **Step 3:** Keep the existing verification gate intact; the report is an *additional* artifact, not a replacement for verification commands.

- [ ] ### Task 4.3: Update `skills/writing-plans/SKILL.md` plan-chunk template
  - [ ] **Step 1:** Add the MECE self-check block to the chunk template: `- [ ] No redundancy with prior chunks` / `- [ ] No contradictions with spec` / `- [ ] Gaps in plan coverage addressed` (B7).
  - [ ] **Step 2:** Make explicit that these checkboxes are filled by the plan-document-reviewer, not by the author.

- [ ] ### Task 4.4: Reviewer-loop checkpoint
  - [ ] **Step 1:** Dispatch all relevant reviewers (plan, spec, code-quality). RED-test trace-reviewer on a decision log with an intentionally orphaned decision; confirm it surfaces the orphan.

### Chunk 5: Documentation updates and writing-skills additions

- [ ] ### Task 5.1: Update `skills/writing-skills/SKILL.md`
  - [ ] **Step 1:** Add a short subsection "Soul / Duties / Workflow separation" (B12): identity facts vs duty list vs ordered workflow. Document the pattern; explicitly say existing skills will not be retroactively refactored.
  - [ ] **Step 2:** Add a short subsection "Optional input/output contract" (B13): for skills that wrap a tool, encourage a `## Contract` block declaring input shape, output shape, side effects. Optional, not enforced.

- [ ] ### Task 5.2: Update `skills/brainstorming/SKILL.md` cross-references
  - [ ] **Step 1:** Reference the new templates and prompts created in Chunks 1–4. Verify every link resolves.

- [ ] ### Task 5.3: Update top-level `README.md`
  - [ ] **Step 1:** One-line additions to the brainstorming description: "phased flow with context survey, MECE option-set review, optional persona reviewers, traceability check, and a living decision log."
  - [ ] **Step 2:** Do not bloat README with detail — link into the skill.

- [ ] ### Task 5.4: Final reviewer-loop and pressure test
  - [ ] **Step 1:** Dispatch plan-document-reviewer on the entire updated brainstorming surface.
  - [ ] **Step 2:** Run [skills/writing-skills/testing-skills-with-subagents.md](skills/writing-skills/testing-skills-with-subagents.md) RED-GREEN cycle: same topic, before vs after this plan; record outcomes in [docs/testing.md](docs/testing.md) or an evals-log file.
  - [ ] **Step 3:** Address rationalizations discovered during testing in the relevant prompts.

### Chunk 6: Acceptance and handoff

- [ ] ### Task 6.1: Verify acceptance criteria (Section 4 below) one by one and check off
- [ ] ### Task 6.2: Use [skills/finishing-a-development-branch/SKILL.md](skills/finishing-a-development-branch/SKILL.md) to wrap up

---

## 4. Acceptance Criteria

- [ ] **AC-1:** A new brainstorming session creates a decision log under `docs/superpowers/decisions/<YYYY-MM-DD>-<slug>.md` populated from the template, with phase status visible.
- [ ] **AC-2:** Phase 0 (survey) emits a context survey listing existing related skills / plans / specs / decisions; brainstorming does not begin option generation before the survey is reviewed by the human partner.
- [ ] **AC-3:** Every option set presented to the human partner is followed by an option-set-reviewer pass that explicitly reports R/G/C/O findings (or "zero findings after active search").
- [ ] **AC-4:** Persona reviewers can be invoked individually with a single dispatch and return findings within their declared scope; they are clearly opt-in in the SKILL.
- [ ] **AC-5:** At brainstorm → spec handoff and at spec → plan handoff, trace-reviewer runs and either reports a clean traceability table or surfaces orphans / missing coverage. Handoff is gated on its result.
- [ ] **AC-6:** When the human partner reopens a previously decided phase, the skill enumerates downstream artifacts before any edit.
- [ ] **AC-7:** Verification-before-completion produces a verification report when a decision log exists for the work.
- [ ] **AC-8:** Plan chunk template carries the MECE self-check block; plan-document-reviewer fills it.
- [ ] **AC-9:** Zero new external dependencies introduced. `package.json`, `gemini-extension.json` unchanged unless reviewer adds review feedback otherwise.
- [ ] **AC-10:** Pressure test (Task 5.4 Step 2) shows the new flow produces a tighter spec on the same input than the pre-change flow — recorded with before/after artifacts. "Tighter" is operationalized as meeting at least two of: (a) every spec section traces to an upstream `D-N` decision in the log; (b) every plan task traces to a spec section (zero orphans reported by trace-reviewer); (c) option-set-reviewer reports fewer R/G/C/O findings on the final option set than on the first; (d) fewer decisions are re-opened after Phase 3.
- [ ] **AC-11:** No A-SPICE, RST, sphinx, or other domain-specific content introduced.
- [ ] **AC-12:** [CLAUDE.md](CLAUDE.md) PR-template requirements satisfied for the eventual PR: real problem, no duplicate prior PRs, evidence of human review, scoped to brainstorming improvements, no third-party dependencies.

---

## 5. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| New phased flow feels heavier than today's brainstorming | Med | Med | All phase reviewers except phase-4 spec reviewer are advisory; persona reviewers opt-in; survey capped to one screen |
| Option-set-reviewer becomes a rubber stamp | Med | High | Anti-rationalization clause in prompt; RED-test in Task 2.3; recorded in evals |
| Decision log diverges from spec over time | Med | Med | Trace reviewer (Chunk 4) gates handoffs and surfaces drift |
| Skill bloat in brainstorming SKILL.md | Med | Med | Anti-bloat check in Task 3.2 Step 6; split to `phases.md` if needed |
| Personas feel like cargo-cult roleplay | Med | Med | Each persona ≤ 50 lines, single-purpose, opt-in, RED-tested |
| Plan rejected upstream as "AI slop" per [CLAUDE.md](CLAUDE.md) | Low | High | This plan ships only with human-reviewed diff and evidence (AC-10, AC-12) |

---

## 6. References

- Source: `repomix-output-syspilot.xml` (syspilot)
- Baseline: `repomix-output.xml` (superpowers)
- [skills/brainstorming/SKILL.md](skills/brainstorming/SKILL.md)
- [skills/writing-plans/SKILL.md](skills/writing-plans/SKILL.md)
- [skills/subagent-driven-development/SKILL.md](skills/subagent-driven-development/SKILL.md)
- [skills/writing-skills/SKILL.md](skills/writing-skills/SKILL.md)
- [skills/verification-before-completion/SKILL.md](skills/verification-before-completion/SKILL.md)
- [CLAUDE.md](CLAUDE.md)
