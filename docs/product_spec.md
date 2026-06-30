# Product Specification: StudyStudio

Status: living product specification  
Audience: product owner, engineers, Codex/AI coding agents  
Scope: current product direction plus MVP requirements

## 1. Product Vision

StudyStudio is an interactive learning IDE for active source-based study.

The first product promise is:

> StudyStudio helps a learner understand one difficult source passage, verifies whether they really understood it, and recommends the next learning step.

Users read trusted source material on the left and work with learning tools on the right:

- Architecture Tree for structure and navigation;
- Visual Workspace for manipulable learning tasks;
- Study Terminal for commands, answers, notes, evidence, and next-step guidance.

The system should turn learning interactions into evidence, evidence into state, and state into study plans.

The first MVP proves this loop with PDFs:

```text
Upload PDF
-> read original material
-> select source spans
-> complete terminal or visual interactions
-> persist EvidenceEvents
-> update StateOverlay
-> recommend NextLearningAct
```

The MVP is deliberately PDF-first at the interaction level, but the architecture must leave room for later videos, webpages, transcripts, code repositories, and other learning resources.

The first north-star metric is:

> Number of learning units completed with verification evidence.

## 2. Product Positioning

StudyStudio is not primarily:

- a generic PDF reader;
- a normal file manager;
- a generic chat-with-PDF app;
- a Notion replacement;
- a public knowledge graph website.

StudyStudio is:

> A learning IDE where source material, structured interactions, evidence, learner state, and study planning are connected in one workspace.

In the first release, this positioning should appear as a focused loop rather than a broad platform claim:

```text
select source passage
-> explain it
-> answer one understanding check
-> record evidence
-> see state and next-step guidance
```

## 3. Target Users

MVP target users:

- university students;
- graduate students;
- self-learners;
- researchers reading lecture notes, papers, slides, and textbooks;
- users who need active study workflows rather than passive summarization.

The MVP focuses on individual learning workspaces.

## 4. Core Experience

The main screen is an IDE-style StudyStudio:

```text
left:  Reading Area
right: Architecture Tree
       Visual Workspace
       Study Terminal
```

Expected interactions:

1. User uploads or opens a learning Resource.
2. Reading Area displays the trusted original material.
3. User selects source text or navigates by source locator.
4. Architecture Tree shows file, reading, concept, task, or state views.
5. Study Terminal receives commands such as `/note`, `/ask`, `/find-source`, `/quiz`, `/build-tree`, and `/next`.
6. Visual Workspace runs structured tasks such as building concept trees or matching evidence.
7. Completed interactions produce EvidenceEvents.
8. StateOverlay updates from evidence.
9. Scheduler recommends a NextLearningAct.

For the current MVP, the required end-to-end path is narrower:

```text
select PDF text
-> Explain this
-> answer the understanding check in Study Terminal
-> save EvidenceEvent
-> update StateOverlay
-> recommend NextLearningAct
```

## 5. Core Concepts

Canonical definitions live in `CONTEXT.md`. The most important MVP concepts are:

- `Resource`: original learning material.
- `SourceLocator`: source-type-specific location, such as PDF page or video timestamp.
- `SourceSpan`: traceable source span.
- `StudioContext`: bounded context pack for commands, tasks, and AI calls.
- `ArchitectureTree`: right-side structure view runtime.
- `VisualTask`: structured visual learning task.
- `TerminalCommand`: command run through Study Terminal.
- `EvidenceEvent`: persisted learning evidence.
- `StateOverlay`: user/session/mode-specific learning state.
- `NextLearningAct`: recommended next step.

## 6. MVP Functional Requirements

### FR-001 StudyStudio Shell

The system shall provide an IDE-style workspace with Reading Area, Architecture Tree, Visual Workspace, and Study Terminal.

Acceptance criteria:

- User can focus on reading by hiding the right dock.
- Right-side panels can be independently collapsed.
- Long tree, visual task, and terminal content remains scroll-contained.

### FR-002 Resource Upload and Reading

The system shall allow PDF upload and reading.

Acceptance criteria:

- Uploaded PDF is stored.
- Page count and metadata are recorded.
- PDF renders in the Reading Area.
- Upload and render errors are shown clearly.

### FR-003 SourceSpan Traceability

The system shall represent selected or extracted source material as SourceSpans.

Acceptance criteria:

- PDF selected text can be attached to StudioContext.
- Backend can persist or reconstruct traceable source references.
- Future resource types can use non-PDF locators without changing the interaction model.

### FR-004 Architecture Tree

The system shall provide an Architecture Tree runtime for multiple tree views.

Minimum views:

- reading tree;
- file tree or fallback source structure.

Future views:

- concept tree;
- task tree;
- state tree.

Acceptance criteria:

- Tree nodes can reference source spans or locators.
- Clicking source-backed nodes navigates the Reading Area.
- UnitTree is treated as one Architecture Tree view, not the whole product.

### FR-005 Study Terminal

The system shall provide a command runtime for learning interactions.

Initial commands:

- `/note`;
- `/ask`;
- `/quiz`;
- `/find-source`;
- `/explain-selection`;
- `/build-tree`;
- `/next`.

Acceptance criteria:

- Commands receive explicit StudioContext.
- Results are structured TerminalCommandResult objects.
- Commands can create InteractionTasks, EvidenceEvents, VisualTasks, or NextLearningActs.
- Mock/non-AI commands are testable without a real AI provider.

### FR-006 Visual Workspace

The system shall provide a visual task runtime.

Initial task:

- build concept tree.

Future tasks:

- match source evidence;
- sort prerequisite order;
- label formula parts;
- compare concepts;
- reconstruct process.

Acceptance criteria:

- VisualTaskSpec drives the UI.
- User submissions produce VisualTaskSubmission payloads.
- Submissions can create EvidenceEvents.

### FR-007 EvidenceEvent

The system shall persist learning evidence from terminal and visual interactions.

Acceptance criteria:

- Evidence records what the user did, target unit/task, source references, and payload.
- Evidence can be inspected by humans and state rules.
- Evidence persistence is covered by tests.

### FR-008 StateOverlay

The system shall update learning state from evidence.

Acceptance criteria:

- State updates are rule-based in v1.
- State does not overwrite source structures.
- Current unit/tree state can be displayed in the UI.

### FR-009 Scheduler

The system should recommend the next learning action from state and evidence.

Acceptance criteria:

- `/next` returns a NextLearningAct.
- Recommendation explains which state/evidence caused it.
- Scheduler works without a full KnowledgeGraph.

### FR-010 AI Context Builder

The system should build bounded context packs for AI-assisted commands.

Acceptance criteria:

- Context uses current resource, unit, source spans, nearby summaries, and recent evidence.
- Full long documents are not sent by default.
- AI outputs are validated before persistence.

## 7. MVP Non-Goals

The MVP does not include:

- public knowledge graph;
- social learning;
- browser plugin;
- mobile app;
- full local folder sync;
- all-document deep analysis for long books;
- complete cross-course knowledge graph merging;
- production-grade spaced repetition analytics.

## 8. Current Roadmap

Current roadmap lives in `docs/task_board.md`.

The most important near-term work is:

1. keep the first MVP focused on PDF passage understanding;
2. persist SourceSpan-like references for selected PDF text;
3. provide a natural action for explaining the selected passage;
4. generate one small verification task after the explanation;
5. persist the task result as evidence;
6. update a simple unit-level StateOverlay;
7. recommend the next learning action.

## 9. Open Questions

- Should selected text create a durable SourceSpan immediately or only when used?
- Should Terminal commands use one generic command endpoint or separate endpoints?
- Should StateOverlay v1 live in backend Python first or shared TypeScript pure functions first?
- Which AI provider should be used first?
