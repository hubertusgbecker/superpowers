# Automated Slop-Detector Pre-Submit Check

## Clarifying Questions (Simulated)

**Q: Where should this detector run — locally on developer machines, in CI, or both?**
A: Locally as an optional pre-commit/pre-push hook first. CI enforcement is a later phase; this keeps adoption low-friction.

**Q: Should detection failures block submission or emit warnings?**
A: Warnings only. Blocks create friction and may be overridden. The hook's value is fast feedback, not enforcement.

**Q: Does this apply to all PR submissions or only those against main/release branches?**
A: All PRs. The criteria in `CLAUDE.md` apply universally; edge-case branches are covered by reviewer discretion.

**Q: How do we avoid false positives that frustrate legitimate contributors?**
A: High-confidence pattern matching only. Red flags are cross-referenced to specific CLAUDE.md sections.

**Q: Should the detector run standalone or integrate with existing hook machinery?**
A: Integrate via `hooks/session-start` as an optional module. Keeps hook ecosystem cohesive.

---

## Approaches & Recommendation

**Approach 1: Regex pattern matcher**
Fast, zero-dependency, operates on diff alone. Limited semantic understanding; prone to false positives on legitimate code comments mentioning "third-party deps" or "domain-specific." Self-contained but brittle.

**Approach 2: Hook-chained validator with git metadata**
Examines commit messages, file paths, author history. Richer signal but tightly couples to git workflow; hard to test in isolation. Risk of false positives on legitimate work patterns.

**Approach 3 (Recommended): Hybrid rule-based checker**
Combines CLAUDE.md rule extraction (static patterns) with lightweight semantic checks (file change cardinality, PR scope heuristics). Zero-dependency, testable in isolation, extensible.

**Recommendation:** Approach 3. It strikes the right balance between signal quality and simplicity.

---

## Architecture

The detector runs as an optional shell module invoked from `hooks/session-start`. It reads the current branch's staged/unstaged changes and the most recent commit message, then applies a rule set extracted from CLAUDE.md sections. Each rule emits a structured warning with a link to the relevant CLAUDE.md section.

**Integration point:** `hooks/session-start` dispatches `hooks/slop-detector.sh` conditionally (enabled via `.superpowersrc` or environment variable). Output goes to stderr with ANSI color coding.

---

## Components

1. **Rule Engine** — table of detection rules, each with: pattern (regex or file heuristic), CLAUDE.md section link, confidence level.
2. **Change Analyzer** — scans staged changes, detects bulk PR patterns (>10 unrelated files), bundled unrelated changes.
3. **Message Checker** — examines commit message for phrases like "fix issues," "improve," or missing verb-object structure.
4. **Formatter** — converts detections into human-readable warnings with line references.

---

## Data Flow

```
Developer commits code
  ↓
hooks/session-start triggers
  ↓
slop-detector.sh checks CLAUDE.md rules
  ↓
Emit warnings/red flags to stderr
  ↓
Developer sees feedback before `git push`
  ↓
Developer revises or explicitly overrides (--force-submit)
```

---

## Error Handling

**Graceful degradation:** If `CLAUDE.md` is unreadable, skip rule extraction and emit a single warning.
**Malformed input:** If git state is inconsistent, exit silently (no false alarms).
**Noisy rules:** High false-positive patterns are demoted to advisory and logged for tune-up.

---

## Testing

- **Rule correctness:** Verify each rule fires on fabricated PR scenarios.
- **False positives:** Legitimate multi-skill refactorings should not trigger red flags.
- **Integration:** Verify hook loads without errors and does not slow `session-start` (target: <100ms overhead).

---

## Self-Review Notes

✓ **Placeholder scan:** No TBDOs; all sections concrete.
✓ **Consistency:** Data flow aligns with components; error handling covers all stated paths.
✓ **Scope:** Single, focused deliverable (detector + hook integration); excludes CI/enforcement (deferred).
✓ **Ambiguity:** "Red flag" vs. "advisory" clearly separated; rule definitions reference specific CLAUDE.md sections.
