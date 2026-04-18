#!/usr/bin/env bash
# End-to-end PDF → agent-ready Markdown converter.
# Usage: convert-pdf.sh <input.pdf> [output_dir]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"

MARKER_BIN="${MARKER_BIN:-$HOME/.local/bin/marker_single}"
OLLAMA_URL="${OLLAMA_URL:-http://localhost:11434}"
OLLAMA_MODEL="${OLLAMA_MODEL:-qwen2.5vl:7b}"

if [[ $# -lt 1 ]]; then
    echo "Usage: $0 <input.pdf> [output_dir]" >&2
    exit 2
fi

INPUT_PDF="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
if [[ ! -f "$INPUT_PDF" ]]; then
    echo "ERROR: input PDF not found: $INPUT_PDF" >&2
    exit 1
fi

STEM="$(basename "$INPUT_PDF" .pdf)"
# Kebab-case the stem
KEBAB_STEM="$(echo "$STEM" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g')"

OUT_ROOT="${2:-$(pwd)/Documents/Raw}"
OUT_DIR="$OUT_ROOT/$KEBAB_STEM"
mkdir -p "$OUT_DIR"

echo "==> Input:   $INPUT_PDF"
echo "==> Output:  $OUT_DIR"
echo "==> Model:   $OLLAMA_MODEL @ $OLLAMA_URL"

# --- [0] Sanity checks ---------------------------------------------------
if [[ ! -x "$MARKER_BIN" ]]; then
    echo "ERROR: marker_single not found at $MARKER_BIN" >&2
    exit 1
fi
if ! curl -sf "$OLLAMA_URL/api/tags" >/dev/null; then
    echo "ERROR: ollama not reachable at $OLLAMA_URL" >&2
    exit 1
fi
if ! curl -s "$OLLAMA_URL/api/tags" | grep -q "\"$OLLAMA_MODEL\""; then
    echo "ERROR: model $OLLAMA_MODEL not available in ollama" >&2
    echo "       Run: ollama pull $OLLAMA_MODEL" >&2
    exit 1
fi

# --- [1] Detect if PDF is scanned ---------------------------------------
FORCE_OCR_FLAG=""
if command -v pdffonts >/dev/null 2>&1; then
    FONT_LINES="$(pdffonts "$INPUT_PDF" 2>/dev/null | wc -l | tr -d ' ')"
    if [[ "$FONT_LINES" -le 2 ]]; then
        echo "==> No embedded fonts detected → enabling --force_ocr"
        FORCE_OCR_FLAG="--force_ocr"
    fi
fi

# --- [2] Marker conversion ----------------------------------------------
echo "==> [1/4] Running marker_single with LLM verification..."
"$MARKER_BIN" "$INPUT_PDF" \
    --output_dir "$OUT_DIR" \
    --output_format markdown \
    --use_llm \
    --llm_service marker.services.ollama.OllamaService \
    --ollama_base_url "$OLLAMA_URL" \
    --ollama_model "$OLLAMA_MODEL" \
    --format_lines \
    $FORCE_OCR_FLAG

# Marker writes to $OUT_DIR/<stem>/<stem>.md — flatten.
MARKER_SUBDIR="$OUT_DIR/$STEM"
MARKER_MD="$MARKER_SUBDIR/$STEM.md"
if [[ ! -f "$MARKER_MD" ]]; then
    # Fallback: find first .md
    MARKER_MD="$(find "$OUT_DIR" -maxdepth 3 -name '*.md' -type f | head -n1)"
fi
if [[ -z "${MARKER_MD:-}" || ! -f "$MARKER_MD" ]]; then
    echo "ERROR: marker did not produce a Markdown file" >&2
    exit 1
fi

FINAL_MD="$OUT_DIR/$KEBAB_STEM.md"
# Move marker output and sibling assets (images, meta.json) up one level
if [[ "$MARKER_MD" != "$FINAL_MD" ]]; then
    mv "$MARKER_MD" "$FINAL_MD"
    if [[ -d "$MARKER_SUBDIR" ]]; then
        # Move any remaining assets then remove empty dir
        find "$MARKER_SUBDIR" -mindepth 1 -maxdepth 1 -exec mv {} "$OUT_DIR/" \;
        rmdir "$MARKER_SUBDIR" 2>/dev/null || true
    fi
fi

# --- [3] Figure enrichment ----------------------------------------------
echo "==> [2/4] Enriching figures (classify → SysML v2 / PlantUML / data tables)..."
python3 "$SCRIPT_DIR/enrich-figures.py" "$FINAL_MD" \
    --ollama-url "$OLLAMA_URL" \
    --model "$OLLAMA_MODEL" \
    --prompts-dir "$SKILL_DIR/prompts"

# --- [4] Front matter + provenance --------------------------------------
echo "==> [3/4] Injecting front matter and provenance block..."
TODAY="$(date +%Y-%m-%d)"
SHA="$(shasum -a 256 "$INPUT_PDF" | awk '{print $1}')"
REL_SOURCE="$(python3 -c "import os,sys; print(os.path.relpath(sys.argv[1], os.path.dirname(sys.argv[2])))" "$INPUT_PDF" "$FINAL_MD")"

TMP="$(mktemp)"
cat > "$TMP" <<EOF
---
title: "$STEM"
source: "$REL_SOURCE"
source_sha256: "$SHA"
converted_at: $TODAY
converter: "marker+$OLLAMA_MODEL"
security-class: C-SC1
tags: [pdf-conversion]
---

> **Conversion provenance.** Converted from \`$REL_SOURCE\` on $TODAY using marker-pdf
> with \`$OLLAMA_MODEL\` for figure/table LLM verification. Figures post-processed into
> SysML v2, PlantUML, or structured data as applicable. An agent reading only this file
> should have the same information as reading the source PDF.

EOF
cat "$FINAL_MD" >> "$TMP"
mv "$TMP" "$FINAL_MD"

# --- [5] Verification ---------------------------------------------------
echo "==> [4/4] Verifying output..."
"$SCRIPT_DIR/verify.sh" "$FINAL_MD"

echo ""
echo "✓ Done."
echo "  Output: $FINAL_MD"
echo "  Assets: $OUT_DIR/"
echo ""
echo "Review the file, escalate security-class to C-SC2 if the content warrants,"
echo "and commit only after you have checked figure conversions."
