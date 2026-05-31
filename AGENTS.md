# AGENTS.md

This repository implements **KnowTree**, an AI-assisted learning material manager.

This file is intentionally concise and stable. Detailed product and architecture information lives in `docs/`.

## 1. Current Development Target

Build the **MVP core reading workflow**:

```text
Upload PDF/PPT -> extract file structure -> generate UnitTree -> read original material with right-side UnitTree -> ask questions / mark state / edit units
```

The long-term product is a complete learning system based on resources, reading units, personal knowledge networks, state overlays, and later web/resource plugins. The MVP implements only the core path needed to prove the product value.

## 2. Hard Product Principles

1. **Original material remains primary and trusted.**
   Users should read the PDF/PPT directly. AI supports navigation, explanation, and structure.

2. **Page/slide is a locator, not the main learning unit.**
   Do not generate heavy metadata for every page by default. Use pages/slides to locate material.

3. **ReadingUnit is the MVP's central object.**
   A ReadingUnit is a learning-sized unit spanning one or more pages/slides.

4. **UnitTree is the MVP's main structure.**
   UnitTree is the user-facing learning/reading tree. KnowledgeGraph is reserved for later stages.

5. **FileTree and UnitTree are different.**
   FileTree records the original document structure. UnitTree is the AI-assisted learning structure.

6. **StateOverlay is separate from Resource/FileTree/UnitTree.**
   User progress, review state, and mastery must not overwrite source structures.

7. **AI output is candidate data.**
   AI-generated units, titles, boundaries, summaries, and relationships must be editable and, where practical, carry generation metadata.

8. **Iterate from the MVP. Do not rewrite into a separate v2 app unless explicitly instructed.**
   Add capabilities through modules, migrations, versioned prompts, and feature branches.

## 3. MVP In Scope

Implement:

- web app workspace;
- resource upload;
- PDF viewing with page navigation;
- PPT/PPTX support by conversion to PDF;
- lightweight file profiling;
- FileTree extraction when possible;
- UnitReading for a selected resource scope;
- UnitTree rendering and jump-to-page interaction;
- Unit state tracking;
- basic UnitTree editing;
- cached AI job outputs.

## 4. MVP Out of Scope

Do not implement unless specifically requested:

- public/shared knowledge graph;
- social features;
- browser plugin;
- mobile app;
- full local folder synchronization;
- marketplace/template sharing;
- precise formula/figure/example recognition;
- full-book deep analysis by default;
- complete cross-course KnowledgeGraph merging.

## 5. Required Core Concepts

Preserve these concepts unless a documented decision changes them:

```text
Resource        original file or imported web resource
Page            stable locator within a resource
FileTree        original document structure
Scope           selected material range for processing
ReadingUnit     learning-sized unit spanning pages/slides
UnitTree        tree of ReadingUnits for reading/learning
StateOverlay    user/session/mode-specific state over units or trees
AIJob           cached and versioned AI processing result
```

Later concepts are reserved but not required in the MVP:

```text
UnitGraph
KnowledgeNode
KnowledgeEdge
KnowledgeGraph
PublicGraph
BrowserPluginImport
```

## 6. Engineering Constraints

- Keep UI, document processing, AI orchestration, and persistence separated.
- Do not put long prompts directly inside UI components.
- Version prompts under `/prompts` or equivalent.
- Use schema validation for AI outputs.
- Cache expensive AI outputs by resource/scope/prompt/model version.
- Use database migrations for schema changes.
- Preserve existing user data where possible.
- Add tests for parsing, UnitReading schema validation, tree navigation, state updates, and AI-output fallback behavior.

## 7. Recommended Stack

Preferred MVP stack:

```text
Frontend: Next.js / React / Tailwind / PDF.js or react-pdf
Backend: FastAPI / Python
Database: PostgreSQL
Jobs: Redis + Celery/RQ or equivalent
Storage: local filesystem for prototype, S3/MinIO later
Document processing: PyMuPDF, LibreOffice headless for PPT/PPTX -> PDF
AI layer: provider abstraction, prompt versions, cached AI jobs
```

The stack may change only if the replacement preserves the same product abstractions.

## 8. Suggested Repository Layout

```text
/apps/web                 # frontend
/apps/api                 # backend
/packages/shared          # shared schemas/types if needed
/docs                     # product and architecture docs
/prompts                  # versioned prompt templates
/tests                    # automated tests
/scripts                  # dev/conversion/seed scripts
```

## 9. Iteration Policy

Future development should extend the MVP in place.

Use:

- feature branches for major features;
- database migrations for schema evolution;
- prompt versions for AI behavior changes;
- feature flags for experimental capabilities;
- ADR/decision updates in `docs/decisions.md` for major changes.

Avoid:

- creating a parallel second app;
- renaming core concepts without migration;
- mixing public graph data into private user data;
- making irreversible schema changes without migration notes;
- assuming AI-generated structure is always correct.
