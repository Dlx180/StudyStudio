# AGENTS.md

This repository is evolving from **KnowTree** into **StudyStudio**, an interactive learning IDE.

StudyStudio's product shell is inspired by developer IDEs: a trusted reading area on the left, and an architecture tree, visual workspace, and study terminal on the right. KnowTree may remain the name of the knowledge/tree engine inside StudyStudio unless a later decision renames the repository and packages.

Detailed product, architecture, task, and collaboration information lives in `docs/`. Domain vocabulary lives in `CONTEXT.md`.

## 1. Current Development Target

Build the **MVP StudyStudio learning loop**:

```text
Upload PDF/PPT
-> read original material
-> select traceable source spans
-> navigate with Architecture Tree
-> complete visual or terminal learning interactions
-> persist EvidenceEvents
-> update StateOverlay
-> schedule the next learning act
```

The first implementation should still grow from the current working frontend and API. Do not restart as a separate v2 app unless explicitly instructed.

## 2. Hard Product Principles

1. **Original material remains primary and trusted.**
   Users read the PDF/PPT directly. AI and interactive tools support navigation, explanation, measurement, and scheduling.

2. **StudyStudio is an IDE, not a chat wrapper.**
   The right dock contains first-class learning tools: Architecture Tree, Visual Workspace, and Study Terminal.

3. **Interactions are learning measurements.**
   Visual tasks and terminal commands should produce EvidenceEvents when they reveal understanding, confusion, source use, or progress.

4. **Page/slide is a locator, not the main learning unit.**
   Use pages/slides to locate source material. Do not generate heavy metadata for every page by default.

5. **SourceSpan is the traceability foundation.**
   Claims, notes, tasks, extracted concepts, and evidence should be able to point back to source text/page spans where practical.

6. **ReadingUnit remains the MVP's central learning unit.**
   A ReadingUnit is a learning-sized unit spanning one or more pages/slides/spans.

7. **Architecture Tree is a container for multiple tree views.**
   UnitTree is one Architecture Tree view. Future views include FileTree, concept tree, task tree, and state tree.

8. **FileTree, UnitTree, and StateOverlay are separate.**
   FileTree records original structure. UnitTree records learning structure. StateOverlay records user/session/mode-specific state.

9. **AI output is candidate data.**
   AI-generated units, titles, boundaries, summaries, relationships, and feedback must be validated, editable, and traceable where practical.

10. **The State Kernel, not the LLM, owns memory and scheduling.**
    LLM calls may interpret or generate, but the system stores evidence, state, task progress, and next-action decisions.

## 3. MVP In Scope

Implement:

- StudyStudio web app shell;
- resource upload;
- PDF viewing with page navigation;
- selectable source text and SourceSpan records;
- Architecture Tree with FileTree and ReadingUnit views;
- Visual Workspace task framework;
- Study Terminal command system;
- InteractionTask and EvidenceEvent persistence;
- StateOverlay v1 from evidence rules;
- Scheduler v1 for next learning acts;
- UnitReading for selected resource scopes;
- cached and validated AI job outputs.

PPT/PPTX support by conversion to PDF is still part of the near-term course-material path, after the core PDF loop is stable.

## 4. MVP Out of Scope

Do not implement unless specifically requested:

- public/shared knowledge graph;
- social features;
- browser plugin;
- mobile app;
- full local folder synchronization;
- marketplace/template sharing;
- full-book deep analysis by default;
- complete cross-course KnowledgeGraph merging;
- production-grade spaced repetition analytics;
- a full autonomous agent that decides everything without explicit user-visible evidence.

## 5. Required Core Concepts

Preserve these concepts unless a documented decision changes them:

```text
StudyStudio       interactive learning IDE product shell
Resource          original file or imported web resource
Page              stable locator within a resource
SourceSpan        traceable source text/layout span
FileTree          original document structure
Scope             selected material range for processing
ReadingUnit       learning-sized unit spanning pages/slides/spans
UnitTree          ReadingUnit tree; one Architecture Tree view
ArchitectureTree  UI tree surface for file, reading, concept, task, or state views
InteractionTask   structured learning task
EvidenceEvent     persisted learning evidence from an interaction
StateOverlay      user/session/mode-specific state over units, trees, tasks, or future items
Scheduler         chooses recommended NextLearningAct from state and evidence
AIJob             cached and versioned AI processing result
```

Later concepts are reserved but not required in the MVP:

```text
DocumentIR
VisualTask
KnowledgeItem
KnowledgeRelation
KnowledgeGraph
PublicGraph
BrowserPluginImport
```

## 6. Engineering Constraints

- Keep UI, document processing, AI orchestration, persistence, state updates, and scheduling separated.
- Do not put long prompts directly inside UI components.
- Version prompts under `/prompts` or equivalent.
- Use schema validation for AI outputs.
- Treat AI output as untrusted until validated.
- Cache expensive AI outputs by resource/scope/prompt/model version.
- Use database migrations once schema moves beyond prototype JSON/JSONL storage.
- Preserve existing user data where possible.
- Add tests for parsing, SourceSpan traceability, terminal commands, visual task payloads, state updates, scheduler rules, UnitReading validation, and AI-output fallback behavior.

## 7. Recommended Stack

Preferred MVP stack:

```text
Frontend: Next.js / React / Tailwind / PDF.js or react-pdf
Backend: FastAPI / Python
Database: local JSONL or SQLite for prototype, PostgreSQL for durable collaboration
Jobs: Redis + Celery/RQ or equivalent when background AI/document jobs need it
Storage: local filesystem for prototype, S3/MinIO later
Document processing: PyMuPDF first; MinerU/Docling adapters later if needed
PPT/PPTX conversion: LibreOffice headless
AI layer: provider abstraction, prompt versions, cached AI jobs
```

The stack may change only if the replacement preserves the same product abstractions.

## 8. Suggested Repository Layout

```text
/apps/web                 # frontend
/apps/api                 # backend
/packages/shared          # shared schemas/types if needed
/docs                     # product, architecture, task, collaboration docs
/prompts                  # versioned prompt templates
/tests                    # automated tests
/scripts                  # dev/conversion/seed scripts
```

## 9. Collaboration Policy

Future development should extend the current app in place.

Use:

- GitHub Issues for work tracking after labels/workflow are confirmed;
- feature branches for major features;
- vertical slices that cut through schema/API/UI/tests;
- database migrations for schema evolution;
- prompt versions for AI behavior changes;
- ADR/decision updates in `docs/decisions.md` for major changes;
- `docs/collaboration.md` for team roles, issue workflow, branch rules, PR checks, and conflict-resolution policy.

Avoid:

- creating a parallel second app;
- renaming core concepts without migration notes;
- mixing public graph data into private user data;
- making irreversible schema changes without migration notes;
- assuming AI-generated structure or feedback is always correct.
