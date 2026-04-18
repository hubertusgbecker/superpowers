# Decision Log — `<topic>`

**Status:** exploring | decided | superseded
**Started:** YYYY-MM-DD
**Owner:** <human partner name or handle>
**Spec:** <relative link to design spec when it exists, else `(not yet written)`>
**Related plan:** <relative link to implementation plan when it exists, else `(not yet written)`>

> A living, compact record of how this idea was shaped. Grows per phase. Short bullets beat prose.

---

## Phase 0 — Survey

**Status:** ⏳ in progress | ✅ done

**Context survey:** <link to the survey artifact the research-subagent produced, or inline summary if short>

**MECE self-check** (filled by option-set-reviewer or author during review):
- [ ] No redundancies across surfaced prior work
- [ ] No contradictions with current repo state
- [ ] Gaps in surveyed area identified and addressed

---

## Phase 1 — Problem framing

**Status:** ⏳ in progress | ✅ done

**Problem statement:** <one to three sentences>

**Non-goals:**
- <thing we explicitly will not do>

**Constraints:**
- <hard constraint>

**MECE self-check:**
- [ ] No redundancies with other active work
- [ ] No contradictions with constraints / non-goals
- [ ] Gaps in the problem statement identified and addressed

---

## Phase 2 — Option set

**Status:** ⏳ in progress | ✅ done

**Options considered:**
- **Option A — <name>:** <one-line summary>
- **Option B — <name>:** <one-line summary>
- **Option C — <name>:** <one-line summary>

**Option-set reviewer findings** (link or inline):
<pasted findings from option-set-reviewer, or "zero findings after active search of R/G/C/O">

**MECE self-check:**
- [ ] No redundancies between options (R)
- [ ] No obvious missing option — do-nothing / buy-vs-build / hybrid considered (G)
- [ ] No contradictions with problem statement (C)
- [ ] No overlap so large that the choice is illusory (O)

---

## Phase 3 — Decisions

**Status:** ⏳ in progress | ✅ done

- **D-1:** <decision> — <rationale>
- **D-2:** <decision> — <rationale>
- **D-3:** <decision> — <rationale>

**Decisions deferred or dropped:**
- <decision or option>: <reason>

**MECE self-check:**
- [ ] No redundant decisions
- [ ] No contradictions between decisions
- [ ] Every open question from prior phases is resolved or explicitly deferred

---

## Phase 4 — Spec

**Status:** ⏳ in progress | ✅ done

**Spec document:** <relative link — e.g. `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`>

> The spec document MUST include a `Decision log:` header pointing back to this file so `verification-before-completion` can find it.

**Trace reviewer findings** (brainstorm → spec handoff):
<pasted findings, or "clean">

**MECE self-check:**
- [ ] Every `D-N` above appears in the spec, or is explicitly marked out-of-scope
- [ ] Spec sections have upstream decision references
- [ ] No spec section is orphaned (no upstream decision)

---

## Change Log

- YYYY-MM-DD — <what changed in this decision log and why>
