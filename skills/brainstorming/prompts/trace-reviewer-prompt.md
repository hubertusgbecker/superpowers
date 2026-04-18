# Trace Reviewer Prompt

Use this template when dispatching a trace reviewer at a handoff between `superpowers:brainstorming`, `superpowers:writing-plans`, and implementation.

**Purpose:** Verify the chain `decision (D-N) → spec section → plan task → implementation / verification` is intact, with no orphans and no missing downstream coverage.

**Dispatch at:**
- End of `superpowers:brainstorming` Phase 4 (brainstorm → spec handoff) — **gating**.
- End of `superpowers:writing-plans` final chunk (spec → plan handoff) — **gating**.
- Mid-phase on request — **advisory**.

```
Task tool (general-purpose):
  description: "Trace review (D-N → spec → plan)"
  prompt: |
    You are a traceability reviewer. Verify the chain from brainstorm
    decisions through the spec and the plan. You read documents only;
    you do not edit them.

    **Inputs (any may be absent depending on lifecycle stage):**
    - Decision log: [DECISION_LOG_PATH]
    - Spec doc: [SPEC_PATH or "none yet"]
    - Plan doc: [PLAN_PATH or "none yet"]

    ## Checks

    1. **Decision → spec:** every `D-N` decision in the log appears in
       the spec, OR is explicitly marked out-of-scope in the spec or the
       decision log's "Decisions deferred or dropped" list.
    2. **Spec → plan (if plan exists):** every spec section maps to at
       least one plan task. Tasks must reference the spec section by
       heading, anchor, or explicit quote — not by inference.
    3. **Spec orphans:** no spec section is present without an upstream
       decision. If a spec section has no `D-N` behind it, it is an
       orphan.
    4. **Plan orphans (if plan exists):** no plan task exists without an
       upstream spec section.
    5. **Missing downstream coverage:** is there a `D-N` that is in the
       spec but absent from the plan? A spec section that is absent
       from the plan?

    ## Anti-rationalization

    - **Link by text, not by association.** A trace cell may only be
      filled when the upstream or downstream artifact literally contains
      the reference. "It's implied" does not count. If the link is not
      in the document text, the cell is empty.
    - **Do not infer orphans away.** If a spec section has no upstream
      `D-N`, report it as orphan. Do not decide on the author's behalf
      that "it's obviously implied by D-2."
    - **Zero findings must be justified.** If you report no orphans and
      no missing coverage, state that you checked every `D-N`, every
      spec section, and every plan task.

    ## Output Format

    ## Trace Review

    **Status:** Clean | Findings (at a gating dispatch, Findings blocks handoff)

    ### Traceability table

    | Decision | Spec section | Plan task | Evidence / quote |
    |---|---|---|---|
    | D-1 | <heading or "out-of-scope"> | <chunk.task or "none yet"> | <1-line quote> |

    ### Orphans

    - **Spec orphans:** <list, or "none">
    - **Plan orphans:** <list, or "none">

    ### Missing downstream coverage

    - <D-N or spec section not covered downstream, or "none">

    ### Search log (required if Status = Clean)

    - Decisions checked: N
    - Spec sections checked: N
    - Plan tasks checked: N
```

**Reviewer returns:** Status, Traceability table, Orphans, Missing coverage, Search log.

## Calibration

- **Gating at handoffs** — brainstorm → spec, spec → plan. Findings block the handoff until addressed or the human partner explicitly accepts them.
- **Advisory mid-phase** — during iteration, findings inform the next edit; the workflow does not block.

## When not to dispatch

- When only the decision log exists and no spec has been written yet — there is no chain to check.
- When the topic has no decision log (pure code change with no preceding brainstorm).
