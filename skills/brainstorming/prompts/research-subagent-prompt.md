# Research Subagent Prompt

Use this template when `superpowers:brainstorming` Phase 0 (Survey) dispatches a pure-research subagent to orient the brainstorm in the existing repo.

**Purpose:** Produce a one-screen context survey before ideation starts, so the brainstorm builds on existing work instead of duplicating it.

**Dispatch at:** Phase 0 of `superpowers:brainstorming`, before any options are generated.

**This subagent does NOT edit, commit, or invoke other skills.** Research-only.

```
Task tool (general-purpose):
  description: "Context survey for brainstorm"
  prompt: |
    You are a research-only subagent. Produce a short context survey for
    an upcoming brainstorm. You MUST NOT edit files, run git write
    operations, dispatch other subagents, or take any action other than
    reading and reporting.

    **Inputs:**
    - Topic: [TOPIC_OR_PROBLEM_STATEMENT]
    - Repo root: [REPO_ROOT_ABSOLUTE_PATH]

    ## What to survey (in this order)

    1. **Existing skills touched.** Which skills in `skills/**/SKILL.md`
       are relevant to this topic? A skill is "touched" if it describes
       behavior that overlaps, competes with, or would need to change.
    2. **Existing plans / specs touched.** Which files under
       `docs/superpowers/plans/`, `docs/superpowers/specs/`, or
       `docs/plans/` are relevant? Look for prior attempts, current
       in-flight work, and designs that constrain this topic.
    3. **Prior decisions.** Any `docs/superpowers/decisions/*.md`
       (including `archive/**`) whose D-N decisions constrain or conflict
       with this topic?

    ## Rules

    - **One screen maximum.** Orientation, not literature review. If you
      cannot fit, you are including too much.
    - **Link, do not summarize at length.** Use markdown links with 1-
      based line ranges when pointing at specific sections.
    - **One relevance line per entry.** "Relevant because X" in 10-20
      words.
    - **Flag absence.** If no prior work exists in a category, say so
      explicitly. Do not fabricate.
    - **No recommendations.** You are mapping the territory, not picking
      a direction.

    ## Output format

    ## Context Survey — <topic>

    **Date:** YYYY-MM-DD

    ### Existing skills touched
    - [skills/<name>/SKILL.md](skills/<name>/SKILL.md) — <why relevant>
    - <or: "No existing skills touch this topic.">

    ### Existing plans / specs touched
    - [docs/.../<file>.md](docs/.../<file>.md) — <why relevant>
    - <or: "No prior plans or specs touch this topic.">

    ### Prior decisions
    - [docs/superpowers/decisions/<file>.md](docs/superpowers/decisions/<file>.md) — <D-N reference, why relevant>
    - <or: "No prior decision logs touch this topic.">

    ### Notes for the brainstorm
    One to three bullet points flagging constraints, risks, or open
    questions the human partner should be aware of before Phase 1. No
    recommendations.
```

## When NOT to use

- When the topic is entirely greenfield and the human partner has already stated no prior work exists — skipping the survey is acceptable if explicitly confirmed.
- When the brainstorm is a tiny tweak to an in-flight topic whose decision log is already known — update that log instead of creating a new one.

## Calibration

Survey output is **advisory** but gated: the brainstorm SKILL pauses after survey and asks the human partner for confirmation before advancing to Phase 1. See `skills/brainstorming/SKILL.md` Phase 0.
