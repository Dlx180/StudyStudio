# Product Specification: KnowTree

Status: living product specification  
Audience: product owner, engineers, Codex/AI coding agents  
Scope: long-term product vision plus MVP requirements

## 1. Product Vision

KnowTree is an AI-assisted learning material manager that turns scattered learning materials into structured, navigable, and personalized learning trees.

The long-term product is a complete learning system where:

- users manage local and web learning resources;
- resources are converted into learning-oriented units;
- units gradually form personal knowledge networks;
- different learning modes generate different trees over the same underlying material;
- users can learn, review, ask questions, track state, and later share/reuse selected learning structures.

The MVP proves the first core value:

> Upload a PDF/PPT, read the original material, and use an AI-generated UnitTree to understand, navigate, and learn the material.

## 2. Problem Statement

Learners often struggle not because resources are unavailable, but because resources are hard to organize into a useful learning structure.

Common issues:

1. The learner lacks a global view of a subject.
2. Concepts and prerequisite relationships are implicit.
3. Different books/PPTs have very different author styles.
4. Some books are too verbose; some slides are too sparse.
5. A single topic may span multiple lectures or files.
6. Existing file managers organize by file path, not by learning meaning.
7. Existing AI PDF tools summarize or answer questions but usually do not maintain a reusable reading structure.

KnowTree should reduce the effect of material-style differences by transforming raw resources into user-adapted ReadingUnits and UnitTrees.

## 3. Product Positioning

KnowTree is not primarily:

- a normal file manager;
- a generic PDF reader;
- a Notion replacement;
- a generic chat-with-PDF app;
- a public knowledge graph website.

KnowTree is:

> A learning material manager that uses AI to convert original materials into structured ReadingUnits, UnitTrees, and eventually personal knowledge networks.

## 4. Target Users

MVP target users:

- university students;
- graduate students;
- self-learners;
- researchers reading lecture notes, papers, slides, and textbooks;
- users who collect many PDFs/PPTs and need a structured reading workflow.

The MVP focuses on individual learning workspaces, not group/social learning.

## 5. Long-Term Product Shape

Long-term modules may include:

1. learning material management;
2. AI reading tree generation;
3. personal knowledge graph maintenance;
4. state overlays for learning/review/exam/project modes;
5. browser plugin for web resources;
6. public/shared knowledge graph templates;
7. community tree sharing and collaboration;
8. spaced review, quiz generation, and learning analytics;
9. local/desktop synchronization.

These are long-term directions. The MVP only implements the core reading workflow.

## 6. Core Concepts

### 6.1 Resource

An original learning material.

Examples:

- PDF book;
- lecture PPT/PPTX;
- converted PPT PDF;
- webpage;
- video transcript;
- GitHub repository;
- user note.

MVP support:

- PDF directly;
- PPT/PPTX by converting to PDF.

### 6.2 Page

A stable locator inside a Resource.

For PDFs, this is a page. For PPT/PPTX converted to PDF, this is usually a slide page.

Pages/slides are not the main learning unit. They are used for navigation, source traceability, and scope selection.

### 6.3 FileTree

The original structure of a Resource.

Examples:

- table of contents;
- chapter hierarchy;
- page order;
- slide order;
- detected headings.

FileTree should remain independent from UnitTree. It answers: **How did the original material organize itself?**

### 6.4 Scope

A selected processing range.

Examples:

- an entire PPT;
- a textbook chapter;
- PDF pages 20-50;
- several lecture files selected together;
- a user-selected page range.

UnitReading always operates on a Scope.

### 6.5 ReadingUnit

The MVP's central object.

A ReadingUnit is a learning-sized chunk that usually spans multiple pages/slides.

Examples:

```text
Lecture 3, slides 5-9: Gradient Descent
Chapter 2, pages 31-45: Loss Functions
Paper pages 3-5: Method Overview
```

A ReadingUnit may differ from original sections or page boundaries.

### 6.6 UnitTree

A tree of ReadingUnits for a particular reading/learning purpose.

A UnitTree answers: **How should the user read or learn this material?**

It may reorganize the FileTree. For example, a PPT may present an example before theory, while the UnitTree may display motivation, concept, formula, example, and summary.

### 6.7 StateOverlay

User/session/mode-specific state placed over units or tree nodes.

Examples:

- unread;
- reading;
- understood;
- weak;
- mastered;
- needs review;
- bookmarked;
- asked question;
- reviewed at timestamp.

StateOverlay must be separate from Resource, FileTree, and UnitTree.

### 6.8 KnowledgeGraph

A future long-term structure of knowledge concepts and relationships.

The MVP should reserve interfaces for KnowledgeGraph, but should not depend on a full KnowledgeGraph implementation.

## 7. MVP User Experience

The core screen should be a two-pane reading workspace:

```text
┌─────────────────────────────────────────────┐
│ Workspace / file switcher / upload / search │
├───────────────────────────────┬─────────────┤
│                               │ UnitTree    │
│                               │             │
│ PDF/PPT reading pane           │ Current Unit│
│                               │ Summary     │
│                               │ State       │
│                               │ Ask AI      │
└───────────────────────────────┴─────────────┘
```

Expected interactions:

1. User uploads a PDF/PPT.
2. System builds a lightweight Resource record and page locators.
3. System profiles the document.
4. System generates or asks the user to select a Scope.
5. System runs UnitReading and generates UnitTree.
6. Left pane shows original material.
7. Right pane shows UnitTree.
8. Clicking a UnitTree node jumps to the corresponding page/slide range.
9. Scrolling the document highlights the current unit.
10. User can ask AI about the current unit/page/selection.
11. User can mark unit state.
12. User can edit UnitTree boundaries/titles.

## 8. MVP Functional Requirements

### FR-001 Workspace Management

The system shall allow a user to create and open a learning workspace.

Acceptance criteria:

- A workspace can contain multiple resources.
- A workspace has a name and creation timestamp.
- MVP may assume a single authenticated or local user if authentication is not yet implemented.

### FR-002 Resource Upload

The system shall allow PDF upload.

Acceptance criteria:

- Uploaded PDF is stored.
- Basic metadata is recorded.
- Page count can be determined.
- Upload failure is shown clearly.

### FR-003 PPT/PPTX Import

The system should support PPT/PPTX by converting them to PDF.

Acceptance criteria:

- Conversion output can be displayed in the same PDF reader.
- Slide index maps to PDF page index.
- If conversion fails, user sees an actionable error.

MVP priority: after PDF core is working.

### FR-004 PDF/PPT Reading Pane

The system shall display the original material in a left-side reading pane.

Acceptance criteria:

- User can scroll or navigate by page.
- User can jump to a page from UnitTree.
- Current page is visible to the application state.

### FR-005 Lightweight Page Index

The system shall create lightweight page records.

Acceptance criteria:

- Each page has a stable page number.
- Extracted text is stored when available.
- Heavy AI analysis is not required for every page.

### FR-006 Document Profiling

The system should classify the resource type and processing strategy.

Possible profiles:

- lecture_ppt;
- textbook;
- paper;
- notes;
- handbook/reference;
- exercise_set;
- unknown.

Acceptance criteria:

- Profile is stored.
- Profile can influence Scope selection and UnitReading.

### FR-007 FileTree Extraction

The system should extract original document structure where possible.

Acceptance criteria:

- PDF outline/table of contents is used if available.
- PPT slide order is represented.
- If no structure is available, FileTree can fall back to page ranges.

### FR-008 Scope Selection

The system shall support running UnitReading on a Scope.

Acceptance criteria:

- Scope can represent a full resource, chapter, page range, or selected resource range.
- Long books should not be deeply processed all at once by default.

### FR-009 UnitReading

The system shall generate a UnitTree from a Scope.

Acceptance criteria:

- Output follows a validated schema.
- Each ReadingUnit has a title and source page/slide range.
- Each ReadingUnit has a short summary.
- AI output is saved with model/prompt metadata when practical.

### FR-010 UnitTree Display

The system shall display UnitTree in the right pane.

Acceptance criteria:

- Parent/child hierarchy is visible.
- Unit order is clear.
- Clicking a unit navigates the document pane.
- Current unit can be highlighted based on current page.

### FR-011 Current Unit AI Assistance

The system should allow user questions about current unit/page/selection.

Acceptance criteria:

- Question context is limited to current unit/page plus necessary neighboring context.
- The answer should cite the relevant page or unit where possible.
- Full-document context should not be passed by default.

### FR-012 StateOverlay

The system shall track learning state over units.

Acceptance criteria:

- User can mark unit state.
- State is associated with a unit and learning mode/session where applicable.
- State does not modify Resource/FileTree/UnitTree source data.

### FR-013 UnitTree Editing

The system should allow users to correct AI-generated UnitTree.

Minimum edits:

- rename unit;
- adjust page range;
- merge adjacent units;
- split unit;
- reorder units within the same parent.

Acceptance criteria:

- Edited units record modified status.
- Original AI result can be retained or regenerated.

### FR-014 Caching and Regeneration

The system shall cache UnitReading results.

Acceptance criteria:

- Same resource/scope/prompt/model version should reuse cached output.
- User can explicitly regenerate.
- Regeneration should not silently overwrite user edits without confirmation.

## 9. Non-Functional Requirements

### NFR-001 Performance

- PDF reading should feel responsive for ordinary course PDFs.
- Long documents should use progressive processing.
- UnitTree generation may run as a background job.

### NFR-002 Cost Control

- Do not send full books to LLM by default.
- Do not generate long per-page summaries by default.
- Use lightweight preprocessing before LLM calls.
- Cache AI outputs.

### NFR-003 Reliability

- AI output must be schema-validated.
- Invalid AI output must fail gracefully.
- User edits should not be lost on regeneration.

### NFR-004 Privacy

- User-uploaded resources are private by default.
- Public/shared graph features are future work.
- Do not assume user data can be shared or used as public graph content.

### NFR-005 Extensibility

The MVP must leave extension points for:

- browser plugin imports;
- KnowledgeGraph extraction;
- public templates;
- multi-resource UnitTree merge;
- advanced OCR;
- local/desktop sync.

## 10. MVP Non-Goals

The MVP does not include:

- public knowledge graph;
- social learning;
- browser plugin;
- mobile app;
- full local folder sync;
- exact formula/example detection;
- full OCR pipeline;
- all-document deep analysis for long books;
- marketplace;
- multi-user collaboration.

## 11. Future Extension Roadmap

### Stage 1: Core PDF MVP

- PDF upload;
- PDF viewing;
- page text extraction;
- UnitReading for resource/page scope;
- UnitTree display;
- Unit state tracking.

### Stage 2: Editing and Regeneration

- edit unit title/range;
- split/merge units;
- protect user edits;
- regenerate selected unit or tree.

### Stage 3: PPT/PPTX Support

- convert PPT/PPTX to PDF;
- preserve slide mapping;
- generate UnitTree for lecture slides.

### Stage 4: Multi-Resource Workspaces

- multiple files in one workspace;
- merge UnitTrees;
- detect repeated units across files.

### Stage 5: Lightweight KnowledgeGraph

- extract KnowledgeNode candidates from confirmed ReadingUnits;
- link units to concepts;
- maintain private personal graph.

### Stage 6: Browser Plugin

- import webpage;
- import online PDF;
- import video transcript;
- send resource to workspace.

### Stage 7: Public/Shared Graph Features

- public templates;
- shared UnitTrees;
- community contributions;
- separate public graph from private user data.

## 12. Open Questions / TBD

These are intentionally left open for future decisions:

1. Authentication: local single-user prototype vs full user accounts.
2. Deployment: local-first, cloud-first, or hybrid.
3. AI provider: OpenAI-only vs provider abstraction from day one.
4. Embedding strategy: whether to embed pages, units, or both.
5. OCR: when to support scanned PDFs.
6. KnowledgeGraph schema: when to promote ReadingUnits into KnowledgeNodes.
7. Public/private sharing model.
8. Pricing/cost control strategy.
9. Browser plugin permission model.
10. Desktop/local sync strategy.
