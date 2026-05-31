# Architecture and Product Decisions

This file records decisions that should guide development. Use ADR-style updates when a major decision changes.

## Decision 001: Build a Web App First

Status: accepted

Build the MVP as a web application, not a browser plugin or desktop app.

Rationale:

- The main workflow requires a full reading workspace.
- Web app is easier to iterate and deploy.
- Browser plugin is better as a later resource import tool.

Consequences:

- Use an embeddable PDF reader.
- Do not depend on Edge's internal PDF reader.

## Decision 002: Edge PDF Reader Is a UX Reference, Not a Technical Base

Status: accepted

The product may imitate the strong reading experience of Edge PDF reader, but should not be built on top of Edge's internal PDF viewer.

Rationale:

- Edge PDF reader is not a reusable product component.
- Extension access to local files has permission complexity.
- The product should work across browsers and deployment modes.

Implementation direction:

- Use PDF.js/react-pdf or equivalent embeddable reader.

## Decision 003: Page/Slide Is a Locator, Not the Primary Learning Unit

Status: accepted

Pages/slides are stable locators. ReadingUnit is the primary learning unit.

Rationale:

- Per-page heavy metadata is expensive and noisy for 500-1000 page books.
- Real learning concepts often span multiple pages/slides.

Consequences:

- Store lightweight Page records.
- Generate UnitTree over page ranges.

## Decision 004: ReadingUnit Is the MVP's Central Object

Status: accepted

The MVP should focus on ReadingUnit and UnitTree before KnowledgeGraph.

Rationale:

- The first product value is a better reading/navigation structure.
- KnowledgeGraph extraction requires more mature unit data.

Consequences:

- UI centers on UnitTree.
- KnowledgeGraph remains a later extension.

## Decision 005: FileTree and UnitTree Must Remain Separate

Status: accepted

FileTree records original material structure. UnitTree records learning-oriented structure.

Rationale:

- Original author structure may not match how the user should learn.
- Preserving FileTree supports source trust and traceability.

Consequences:

- Do not overwrite FileTree with AI-generated UnitTree.
- UnitTree nodes must keep source page/slide references.

## Decision 006: StateOverlay Is Separate from Source Structures

Status: accepted

User state belongs in StateOverlay/StateRecord, not inside Resource, FileTree, or source KnowledgeGraph.

Rationale:

- The same material can be used in first learning, review, exam prep, or project practice.
- State changes frequently; source structures should remain stable.

Consequences:

- StateRecord should include target and learning mode/session when practical.

## Decision 007: UnitReading Is a Formal Interface

Status: accepted

UnitReading should be implemented as a reusable backend interface:

```text
UnitReading(Scope, DocumentProfile, UserContext, LearningMode) -> UnitTree
```

Rationale:

- Works for full PPT, book chapter, selected pages, and later web resources.
- Keeps AI orchestration modular.

Consequences:

- Validate UnitReading outputs.
- Cache UnitReading results.

## Decision 008: Long Documents Use Progressive Processing

Status: accepted

For long books, do not perform full deep UnitReading by default.

Rationale:

- Cost and latency would be too high.
- Learners usually read chapter by chapter.

Default flow:

```text
Book -> profile -> FileTree/TOC -> user opens chapter -> UnitReading(chapter scope)
```

## Decision 009: AI Output Is Candidate Data

Status: accepted

AI-generated structures are editable candidates.

Rationale:

- Unit boundaries and concept names can be wrong.
- User correction is part of product value.

Consequences:

- Store `created_by`, `review_status`, and prompt/model metadata where practical.
- Regeneration should not silently overwrite user edits.

## Decision 010: KnowledgeGraph Is Deferred

Status: accepted

The MVP should not require a full KnowledgeGraph.

Rationale:

- UnitTree already provides a useful product loop.
- KnowledgeGraph merging is complex and should be based on stable units.

Reserved path:

```text
UnitTree -> UnitGraph -> KnowledgeNode candidates -> private KnowledgeGraph -> public/shared graph later
```

## Decision 011: Private User Data by Default

Status: accepted

Uploaded files, workspaces, UnitTrees, and states are private by default.

Rationale:

- User files may include copyrighted or private course material.
- Public/shared graphs require separate consent and architecture.

Consequences:

- Do not mix public graph data with private workspace data.
- Sharing is future work.

## Decision 012: Extend MVP In Place, Do Not Rebuild by Default

Status: accepted

Future development should extend the MVP rather than create a separate v2 app.

Rationale:

- The MVP is designed as a product skeleton.
- Core concepts are intended to survive later stages.

Development method:

- feature branches;
- database migrations;
- prompt versions;
- feature flags for experimental features;
- update this decisions file for major changes.

Rebuild is acceptable only if explicitly decided after the prototype is proven throwaway.

## Decision 013: Browser Plugin Is a Later Import Channel

Status: accepted

The browser plugin should not be the main product UI.

Future role:

- import webpages;
- import online PDFs;
- import video transcripts;
- import GitHub README/code structure;
- send imported Resource to existing workspace.

## Decision 014: PPT/PPTX Should Be Converted to PDF for MVP

Status: accepted

MVP should display PPT/PPTX by converting to PDF.

Rationale:

- Reuse same PDF reading UI.
- Avoid building a dedicated slide renderer.

Known limitation:

- Conversion may lose animations and some formatting.

## Decision 015: Use PostgreSQL First, Not Graph Database

Status: accepted

MVP should use relational data models with edge-like tables if needed.

Rationale:

- UnitTree is tree-structured and can be stored relationally.
- Graph database can be introduced later when KnowledgeGraph requirements mature.

## Decision 016: TBD - Authentication Model

Status: proposed / TBD

Options:

1. local single-user prototype;
2. account-based cloud app;
3. hybrid local/cloud.

Decision needed before production deployment.

## Decision 017: TBD - AI Provider Strategy

Status: proposed / TBD

Options:

1. use one provider initially;
2. create provider abstraction from day one;
3. support local models later.

Current recommendation: implement a thin provider abstraction even if only one provider is used initially.

## Decision 018: TBD - Vector Search Scope

Status: proposed / TBD

Options:

1. no embeddings in MVP;
2. embed ReadingUnits only;
3. embed pages and ReadingUnits;
4. use pgvector from the start.

Current recommendation: do not block MVP on embeddings; add when question answering/retrieval needs it.
