#!/usr/bin/env bash
# Verify a converted Markdown file meets agent-consumption requirements.
set -euo pipefail

if [[ $# -lt 1 ]]; then
    echo "Usage: $0 <markdown_file>" >&2
    exit 2
fi

MD="$1"
if [[ ! -f "$MD" ]]; then
    echo "FAIL: file not found: $MD" >&2
    exit 1
fi

fails=0

# 1. Front matter
if ! head -n 1 "$MD" | grep -q '^---$'; then
    echo "FAIL: front matter missing"; fails=$((fails+1))
fi
for key in title source source_sha256 converted_at converter security-class; do
    if ! head -n 40 "$MD" | grep -qE "^${key}:"; then
        echo "FAIL: front matter key missing: $key"; fails=$((fails+1))
    fi
done

# 2. Provenance block
if ! grep -q "Conversion provenance" "$MD"; then
    echo "FAIL: provenance block missing"; fails=$((fails+1))
fi

# 3. Every image reference is followed within 30 lines by an enrichment marker
#    or a fenced code block / prose caption.
python3 - "$MD" <<'PY' || fails=$((fails+1))
import re, sys
text = open(sys.argv[1], encoding="utf-8").read().splitlines()
img_re = re.compile(r'!\[[^\]]*\]\([^)]+\)')
bad = []
for i, line in enumerate(text):
    if img_re.search(line):
        window = "\n".join(text[i+1:i+31])
        if ("<!-- enriched:figure -->" not in window
                and "```" not in window
                and "**Figure" not in window):
            bad.append((i+1, line.strip()))
if bad:
    for ln, txt in bad:
        print(f"FAIL: line {ln} image without enrichment: {txt[:80]}")
    sys.exit(1)
PY

# 4. UTF-8 validity
if ! iconv -f UTF-8 -t UTF-8 "$MD" >/dev/null 2>&1; then
    echo "FAIL: not valid UTF-8"; fails=$((fails+1))
fi

if [[ $fails -gt 0 ]]; then
    echo ""
    echo "✗ Verification failed ($fails issue(s))."
    exit 1
fi

echo "✓ Verification passed."
