# Slop Detector Pre-Submit Check — Design Spec

**Decision log:** [../../docs/superpowers/decisions/2026-04-18-slop-detector.md](../../docs/superpowers/decisions/2026-04-18-slop-detector.md)

## Overview

A pre-commit hook that detects and warns about common patterns of low-quality AI-generated PRs before submission. Integrates with the existing hook infrastructure (`hooks.json`, `run-hook.cmd`) and uses declarative rules (JSON config) to identify five high-signal markers of slop: fabricated problem statements, incomplete PR templates, bulk multi-issue changes, fork-specific claims, and undeclared dependency additions.

**Execution mode (D-4):** Advisory-only. Warns but does not block submission; humans can override.

## Hook Integration (D-1)

The detector runs as a pre-commit hook via the existing `run-hook.cmd` infrastructure. A new hook type `SloppyPRDetector` is registered in `hooks.json`:

```json
{
  "hooks": {
    "PreCommit": [
      {
        "matcher": "draft|wip|ready",
        "hooks": [
          {
            "type": "SloppyPRDetector",
            "config": "hooks/slop-detector.json",
            "mode": "advisory",
            "async": true
          }
        ]
      }
    ]
  }
}
```

The hook executes before staging changes. If violations are detected, it prints warnings to stderr and exits with code 0 (advisory) or non-zero if configured as mandatory (deferred).

## Rule Format (D-2)

Rules are declared in `hooks/slop-detector.json`. Each rule is a named pattern with metadata:

```json
{
  "version": "1.0",
  "enabled": true,
  "rules": [
    {
      "id": "fabricated-language",
      "category": "fabricated-problem",
      "description": "Detects 'should theoretically', 'could potentially'",
      "patterns": ["should\\s+(theoretically|eventually)", "could\\s+(potentially|theoretically)"],
      "context": "problem_description",
      "confidence": "high",
      "severity": "warning"
    }
  ]
}
```

Rules are data-only; no code evaluation. The detector applies each rule as a regex match against PR template fields or commit message.

## Security Model (D-6)

The hook executes in a context with shell access. Rule files are untrusted input (may come from forks or fresh clones). Enforce:

- Rules are JSON-only — no code, no shell interpolation, no templated commands.
- Config file is schema-validated at load; unknown fields or pattern types reject the whole file (fail closed, no partial load).
- Regex patterns execute in the detector's regex engine only; pattern matches never feed back into shell commands.
- Detector must not shell out based on rule content.

## Detection Rules (D-3)

Five pattern categories:

### 1. Fabricated Problem Statements
Detects speculative language without citing a specific failure or user report.

### 2. Incomplete PR Template
Detects empty or placeholder-only sections ("TBD", "TODO", "N/A") in required template fields.

### 3. Bulk / Multi-Issue PRs
Heuristic: if PR touches > 3 independent file subtrees with no shared dependency, flags as potential bulk PR.

### 4. Fork-Specific Claims
Detects references to "my fork", "custom branch", or fork rebrand language.

### 5. Undeclared Dependency Additions
Parses diff on `package.json`; flags any new optional/required dependency.

## Execution (D-1, D-4)

1. Hook reads PR metadata (branch name, diff, staged files, recent commits).
2. Applies each enabled rule as regex + heuristic checks.
3. Collects violations with severity and confidence scores.
4. Prints summary to stderr.
5. Exits with code 0 (advisory). Human can `git commit --no-verify` to skip.

## Opt-in Control (D-5)

Detector runs only if `hooks/slop-detector.json` exists and its `"enabled": true` flag is set. Missing or disabled → hook exits silently. Ensures forks and downstream users are not forced into the workflow.

## Error Handling

- **Missing config:** silent success.
- **Malformed config:** log warning, skip detector, allow commit.
- **Regex compile failure:** disable that rule, log, continue.
- **Missing PR metadata:** no violations, succeed.

## Testing

- **Unit:** each rule pattern tested against true-positive and true-negative examples.
- **Integration:** hook runs in actual pre-commit scenario; validates no interference with normal commits.
- **Security (D-6):** malicious rule files (embedded shell, unknown fields) are rejected at load.
- **Calibration:** false-positive rate target < 5%.

## Out of Scope

- Network-based checking (no external service calls).
- Human-level semantic understanding of problem validity.
- Blocking PRs (advisory-only in this phase).
- Repository-specific rules.
- Dependency on machine learning or large models.
