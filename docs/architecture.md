# Architecture Specification: StudyStudio

Status: living architecture document  
Scope: MVP architecture with extension points for multiple source types, visual tasks, terminal commands, state, and scheduling

## 1. Architecture Goals

The architecture should support:

1. a reliable source reading workflow, starting with PDFs;
2. traceable SourceSpans across PDFs and later video/web/code sources;
3. IDE-style frontend surfaces: Reading Area, Architecture Tree, Visual Workspace, Study Terminal;
4. structured terminal and visual interactions;
5. EvidenceEvent persistence;
6. StateOverlay updates from evidence;
7. Scheduler recommendations from state and evidence;
8. bounded AI context building and validated AI output.

The architecture should avoid:

- treating PDF pages as the universal learning abstraction;
- mixing AI output directly with source truth;
- forcing KnowledgeGraph implementation into the MVP;
- storing learning state inside Resource, FileTree, or UnitTree;
- making Study Terminal a plain chat log;
- hard-coding Visual Workspace as one concept-tree editor.

## 2. System Overview

```text
Frontend Web App
  - StudyStudio shell
  - Reading Area
  - Architecture Tree
  - Visual Workspace
  - Study Terminal
  - state and next-act displays

Backend API
  - Resource management
  - SourceSpan and StudioContext APIs
  - InteractionTask APIs
  - EvidenceEvent persistence
  - StateOverlay / StateUpdate APIs
  - Scheduler APIs
  - AI context builder and AI job cache

Processing Layer
  - PDF text/page extraction
  - PPT/PPTX -> PDF conversion
  - future video transcript / webpage / code adapters
  - UnitReading and tree generation

Storage Layer
  - local JSON/JSONL or SQLite for prototype
  - PostgreSQL for durable collaboration
  - object/file storage
  - optional vector index later
  - prompt/job logs
```

## 3. Core Data Boundaries

### Source Boundary

Source objects preserve trusted material and traceability:

- Resource;
- Page or source-specific locator;
- SourceSpan;
- FileTree.

### Interaction Boundary

Interaction objects describe user-visible learning work:

- StudioContext;
- TerminalCommandRequest;
- TerminalCommandResult;
- VisualTaskSpec;
- VisualTaskSubmission;
- InteractionTask.

### Evidence Boundary

Evidence records what happened:

- EvidenceEvent;
- source references;
- task payload;
- user response or action summary.

### State Boundary

State records what the system currently believes about learning:

- StateOverlay;
- StateUpdate;
- StateSummary.

State must be derived from evidence and must not mutate source structures.

### Scheduling Boundary

Scheduler chooses what to do next:

- NextLearningAct;
- reasons based on state and evidence.

## 4. Recommended Technology Stack

Frontend:

- Next.js / React;
- PDF.js for initial PDF rendering;
- a robust drag/drop library later if VisualTask complexity grows;
- tree component built around ArchitectureTreeView.

Backend:

- FastAPI / Python;
- Pydantic schema validation;
- local JSONL/SQLite for prototype persistence;
- SQLAlchemy/PostgreSQL once schema stabilizes.

Document processing:

- PyMuPDF or equivalent for PDF text extraction;
- LibreOffice headless for PPT/PPTX conversion;
- MinerU/Docling adapters later if formula/table/OCR needs justify them.

AI:

- provider abstraction;
- versioned prompts;
- schema-validated outputs;
- cached AI jobs;
- bounded StudioContext input.

## 5. Main Runtime Pipelines

### 5.1 PDF Upload and SourceSpan Pipeline

```text
User uploads PDF
-> store file
-> create Resource
-> extract page count
-> extract page text where possible
-> create Page/source locator records
-> create or enable SourceSpan references
-> render in Reading Area
```

### 5.2 Terminal Command Pipeline

```text
User enters command
-> parse command
-> build StudioContext
-> execute command handler
-> optionally create InteractionTask
-> optionally create EvidenceEvent
-> return structured TerminalCommandResult
-> render result in Study Terminal
```

### 5.3 VisualTask Pipeline

```text
Command or UI opens VisualTaskSpec
-> Visual Workspace renders task
-> user submits VisualTaskSubmission
-> validate payload
-> create EvidenceEvent
-> optionally create StateUpdate
-> show feedback in Study Terminal
```

### 5.4 State Update Pipeline

```text
EvidenceEvent
-> rule-based evaluator
-> StateUpdate
-> StateOverlay
-> Architecture Tree / unit detail display
```

### 5.5 Scheduler Pipeline

```text
StateOverlay + recent EvidenceEvents
-> Scheduler rules
-> NextLearningAct
-> Study Terminal / plan display
```

### 5.6 AI Context Pipeline

```text
Command needs AI
-> build bounded StudioContext
-> collect relevant SourceSpans and unit summaries
-> call AI provider
-> validate output
-> return TerminalCommandResult / VisualTaskSpec / candidate data
-> persist only validated evidence or candidate structures
```

## 6. Frontend Architecture

Recommended component shape:

```text
StudyStudioPage
  - ReadingArea
    - PDFReader
    - SourceSelectionLayer
  - StudyDock
    - ArchitectureTreePanel
    - VisualWorkspacePanel
    - StudyTerminalPanel
```

State synchronization:

- Reading Area exposes active locator and selected spans.
- Architecture Tree maps active locator to active node/unit where possible.
- Study Terminal displays current StudioContext.
- Visual Workspace consumes VisualTaskSpec and emits VisualTaskSubmission.
- Evidence and state updates refresh tree/unit indicators.

## 7. Backend API Sketch

Potential endpoints:

```text
POST   /api/resources/upload
GET    /api/resources/:id
GET    /api/resources/:id/file
GET    /api/resources/:id/source-spans
POST   /api/source-spans

GET    /api/studio-context
POST   /api/terminal/commands

POST   /api/interaction-tasks
POST   /api/evidence-events
GET    /api/evidence-events

GET    /api/architecture-tree
POST   /api/visual-tasks/:id/submissions

GET    /api/state
POST   /api/state-updates/evaluate
GET    /api/next-learning-act

POST   /api/unit-reading
POST   /api/ai/ask
```

Endpoint names are not fixed, but the boundaries should remain clear.

## 8. Data Model Starting Points

Authoritative draft shapes live in `docs/studystudio_contract.md`.

Implement shared TypeScript types first for:

- ResourceKind / ResourceRef;
- SourceLocator;
- SourceSpan;
- StudioContext;
- ArchitectureTreeView;
- TerminalCommandRequest / TerminalCommandResult;
- VisualTaskSpec / VisualTaskSubmission;
- EvidenceEvent;
- StateSummary;
- NextLearningAct.

Mirror those in backend Pydantic models as each endpoint is implemented.

## 9. AI Architecture

Do not hard-code provider logic in UI components or endpoint handlers.

Use a service layer such as:

```text
AIClient.generate_json(prompt_version, input, schema)
AIClient.answer_question(prompt_version, context, question)
```

Rules:

- Prompts are versioned under `/prompts`.
- AI output is candidate data.
- Invalid AI output fails gracefully.
- Long resources are scoped before being sent to AI.
- Evidence and state are stored by the system, not by the model conversation.

## 10. Extension Points

### Video

Represent transcript text as SourceSpans and timestamps as SourceLocators.

### Webpage

Represent selected DOM/text ranges as SourceSpans and URL/selector/range as SourceLocators.

### Code Repository

Represent file path and line ranges as SourceLocators.

### Knowledge Layer

After ReadingUnits and evidence are stable:

```text
Evidence + confirmed ReadingUnits
-> KnowledgeItem candidates
-> staged relations
-> private KnowledgeGraph
```

### Browser Plugin

Browser plugin should import resources into the same Resource/SourceSpan/Interaction pipeline.

## 11. Open Technical Questions

1. SQLite vs PostgreSQL timing.
2. Whether selected text creates durable SourceSpan immediately.
3. Generic terminal command endpoint vs command-specific endpoints.
4. VisualTask draft autosave.
5. StateOverlay rule engine location: Python backend vs shared TypeScript.
6. AI provider and local model strategy.
