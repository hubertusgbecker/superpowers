---
name: converting-pdfs-for-agent-consumption
description: Use when converting a PDF to Markdown for downstream LLM/agent consumption — especially PDFs containing tables, technical drawings, schematics, block diagrams, charts, or equations that an agent must understand WITHOUT seeing the original file
---

# Converting PDFs for Agent Consumption

## Overview

**Goal:** produce Markdown that lets a downstream agent reason about a PDF as if
it had read the original — with zero hallucination risk from missing modalities.

**Core principle:** every non-text modality (table, technical drawing, schematic,
chart, photo, equation, form) must be converted into a **text-equivalent
representation** an LLM can parse deterministically:

| Modality in PDF | Target representation in Markdown |
|---|---|
| Body text | Clean Markdown paragraphs |
| Tables | GitHub-flavored Markdown tables (LLM-verified) |
| Equations | LaTeX (`$...$` / `$$...$$`) |
| Technical drawing / block diagram / architecture | **SysML v2 textual notation** inside a fenced block + prose caption |
| Schematic (electrical/mechanical/hydraulic) | PlantUML (or Mermaid) inside fenced block + prose caption |
| Chart / plot | Structured data table (extracted values) + prose caption |
| Photo / illustrative figure | Dense prose caption (≥3 sentences) + object list |
| Form field | Key–value list |
| Handwriting / stamps | Literal transcription + `[STAMP]` / `[HANDWRITTEN]` marker |

**Never** leave an image embed without a text-equivalent block beneath it. An
agent must be able to answer any question about the PDF from the Markdown alone.

## When to Use

- User asks to convert / ingest / digest / transcribe a PDF
- Pipeline step before any RAG or analysis task that needs a PDF's content
- Sources containing technical drawings, SysML diagrams, schematics, block
  architectures, data-sheet tables, parameter plots

**Do NOT use for:**
- Pure-text PDFs (one-page memos) — `pdftotext` is faster and sufficient
- Scanned low-quality images where marker + OCR will degrade output — flag to
  user and request a better source
- PDFs in folders that the current repository's `AGENTS.md` / `CLAUDE.md` /
  `GEMINI.md` marks as restricted, unless the user explicitly approves

## Environment Requirements

- `marker_single` (marker-pdf) on `PATH` — override via `MARKER_BIN` env var
- `ollama` reachable at `http://localhost:11434` — override via `OLLAMA_URL`
- A vision-capable model pulled into ollama; default `qwen2.5vl:7b`
  — override via `OLLAMA_MODEL`
- Python 3.9+

The wrapper script fails fast with a clear error if any prerequisite is missing.

## Workflow

```
PDF
 └─► [1] marker_single --use_llm (vision model via Ollama)
         → <stem>.md + <stem>/*.jpeg (figures) + <stem>/meta.json
 └─► [2] enrich-figures.py
         → For each extracted figure: classify modality
           → inject SysML v2 / PlantUML / data table / prose below the image link
 └─► [3] front matter + provenance block injection
 └─► [4] verification pass
         → any bare ![image] without sibling enrichment block → FAIL
         → missing front-matter key → FAIL
```

## Quick Reference

```bash
# One-shot conversion (recommended entry point)
~/.superpowers/skills/converting-pdfs-for-agent-consumption/scripts/convert-pdf.sh \
    <input.pdf> [output_dir]

# Manual: marker only (no figure enrichment)
marker_single <input.pdf> \
    --output_dir <dir> \
    --use_llm \
    --llm_service marker.services.ollama.OllamaService \
    --ollama_base_url http://localhost:11434 \
    --ollama_model qwen2.5vl:7b \
    --output_format markdown \
    --format_lines \
    --force_ocr    # only if scanned

# Enrichment only (figures → SysML v2 / PlantUML / data tables)
python3 ~/.superpowers/skills/converting-pdfs-for-agent-consumption/scripts/enrich-figures.py \
    <marker_output.md> \
    --prompts-dir ~/.superpowers/skills/converting-pdfs-for-agent-consumption/prompts
```

## Default Output Location

If the caller does not supply `output_dir`, the wrapper writes to
`./pdf-markdown/<kebab-stem>/`. Pass an explicit second argument to place the
output elsewhere (e.g., a repo's `Documents/Raw/` folder).

## Mandatory Front Matter (injected automatically)

```yaml
---
title: "<original PDF stem>"
source: "<relative path to original PDF>"
source_sha256: "<sha256 of original PDF>"
converted_at: YYYY-MM-DD
converter: "marker+<model>"
tags: [pdf-conversion]
---
```

If the current repository requires additional front-matter fields (security
class, document owner, etc.), the calling agent should merge them after the
conversion — the skill keeps the base set minimal so it works everywhere.

## Mandatory Provenance Block (injected automatically)

```markdown
> **Conversion provenance.** Converted from `<source>` on <date> using
> marker-pdf with `<model>` for figure/table LLM verification. Figures
> post-processed into SysML v2, PlantUML, or structured data as applicable.
> An agent reading only this file should have the same information as reading
> the source PDF.
```

## Figure Conversion Rules (the hard part)

When `enrich-figures.py` encounters each extracted figure, it first
**classifies** the figure via the vision LLM into one of:

1. `technical_drawing` — block diagram, system architecture, UML, SysML,
   control-flow, data-flow, state machine
2. `schematic` — electrical circuit, mechanical assembly, pipe/signal routing
3. `chart` — line/bar/pie/scatter plot with quantitative data
4. `table_as_image` — table rasterized (marker occasionally misses these)
5. `photo` — photograph or illustrative raster
6. `equation_as_image` — equation marker didn't vectorize
7. `other` — stamp, signature, logo, decorative element

Then it applies the modality-specific prompt (see `prompts/`) to produce the
text equivalent.

### Technical drawings → SysML v2

The output MUST be wrapped:

````markdown
![Figure 3: Vehicle gateway block architecture](figure_3.jpeg)

```sysml
package VehicleGatewayArchitecture {
    part def Gateway {
        part hsm : HSM;
        port powertrain : DomainBus;
        port body       : DomainBus;
        port adas       : DomainBus;
        port cloud      : SecureLink;
    }
    part def HSM;
    port def DomainBus;
    port def SecureLink;
    connection: Gateway.powertrain to PowertrainDomain.uplink;
    // ... continue for every visible block/edge
}
// EXTRACTION_CONFIDENCE: 7/10 — blocks unambiguous; one dashed edge unclear
// AMBIGUITY: HSM→cloud edge is dashed; could be optional or fallback
```
````

Every drawing ends with an **explicit confidence rating** (1–10) and a list of
**ambiguities** — an agent reading this must know what's reliable and what isn't.

### Charts → data tables

Always produce a table of the plotted values (best estimate) + axis labels +
units + series legend. If values cannot be read, say so — never fabricate.

### Tables → verified Markdown tables

After marker extraction, the vision model re-reads the table image and produces
a canonical GFM table. Row/column counts plus a confidence rating are appended.

## Common Mistakes

| Mistake | Fix |
|---|---|
| Leaving `![image](x.jpeg)` with no text block beneath | Mandatory enrichment pass; verification step greps for this |
| Summarizing a SysML drawing in prose only | Prose is insufficient — agent cannot reconstruct connections. Always emit SysML v2 / PlantUML |
| Fabricating numeric values from an unreadable chart | Use `[VALUE UNREADABLE]` placeholder + confidence < 5 |
| Forgetting `--force_ocr` on scanned PDFs | Wrapper auto-detects via `pdffonts`; manual override if needed |
| Writing into a folder the host repo marks as restricted | Respect `AGENTS.md` / `CLAUDE.md` / `GEMINI.md`; ask first |
| Losing front matter or provenance block | Injected by the wrapper — don't bypass the wrapper |

## Verification Before Completion

The wrapper calls `scripts/verify.sh` automatically. It checks:
1. Every `![...](...)` is followed within 30 lines by either the enrichment
   marker `<!-- enriched:figure -->` or a fenced code block / figure caption.
2. Front matter present with all required keys.
3. Provenance block present.
4. File is valid UTF-8.

If any check fails, the conversion is NOT complete.

## Files in this Skill

| File | Purpose |
|---|---|
| `SKILL.md` | This reference |
| `scripts/convert-pdf.sh` | End-to-end wrapper: marker → enrich → front matter → verify |
| `scripts/enrich-figures.py` | Per-figure classification + modality-specific vision enrichment via Ollama |
| `scripts/verify.sh` | Post-conversion verification |
| `prompts/classify-figure.txt` | Vision prompt for modality classification |
| `prompts/technical-drawing-to-sysmlv2.txt` | Vision prompt for SysML v2 extraction |
| `prompts/schematic-to-plantuml.txt` | Vision prompt for electrical/mechanical schematics |
| `prompts/chart-to-table.txt` | Vision prompt for data extraction from plots |
| `prompts/verify-table.txt` | Vision prompt for table-image → Markdown-table transcription |
| `prompts/photo-to-prose.txt` | Vision prompt for photographs / illustrative figures |
| `prompts/equation-to-latex.txt` | Vision prompt for rasterized equations |

## Environment Variable Overrides

| Variable | Default | Purpose |
|---|---|---|
| `MARKER_BIN` | `marker_single` on `PATH` (fallback `$HOME/.local/bin/marker_single`) | marker-pdf binary |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama API base URL |
| `OLLAMA_MODEL` | `qwen2.5vl:7b` | Vision model used for classification + enrichment |
