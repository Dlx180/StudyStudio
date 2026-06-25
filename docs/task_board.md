# Task Board

This task board is reorganized around the StudyStudio direction.

StudyStudio is an interactive learning IDE: the user reads trusted source material on the left, works with architecture trees, visual tasks, and a study terminal on the right, and the system turns interactions into evidence, state updates, and learning plans.

The first MVP is deliberately narrower than the full platform:

> Help a learner understand one difficult PDF passage, verify whether they really understood it, and recommend the next learning step.

North-star metric for this phase:

> Learning units completed with verification evidence.

## Development Principles

- Build thin vertical slices that are demoable end to end.
- Preserve the trusted original material as the primary reading surface.
- Treat visual and terminal interactions as learning measurements, not decorative UI.
- Every meaningful interaction should be able to produce an EvidenceEvent.
- StateOverlay and future scheduling should be derived from evidence, not from AI guesses alone.
- Use GitHub Issues for collaborative work once the repository labels and workflow are confirmed.
- Keep long prompts versioned under `/prompts`; do not embed them in UI components.
- Update this board, `docs/changelog.md`, and relevant decisions after major milestones.

## Current Product Loop

```text
Resource
-> Page / SourceSpan
-> ReadingUnit / ArchitectureTree view
-> VisualWorkspace or StudyTerminal interaction
-> EvidenceEvent
-> StateOverlay
-> Scheduler
-> NextLearningAct
```

The current implementation has already started this shape with a PDF reader, right-side dock, mock UnitTree, Visual Workspace, command console, text selection, and persisted InteractionTask/EvidenceEvent records.

For a contributor-facing explanation of how the first GitHub issues connect, read `docs/mvp_issue_flow.md`.

## Milestone A: Focused MVP Loop

Goal: prove one sharp user promise before broadening to all resource types and task types.

```text
Upload PDF
-> select a difficult passage
-> explain the passage
-> give one verification task
-> save evidence
-> update state
-> recommend next step
```

### Tasks

- [ ] Make the product promise visible in README/product docs.
- [ ] Add a natural action button for selected text: `Explain this`.
- [ ] Return a structured explanation result for the selected passage.
- [ ] Generate a small verification task from the explanation context.
- [ ] Persist the user's verification response as an EvidenceEvent.
- [ ] Update a simple StateOverlay from the verification result.
- [ ] Return one NextLearningAct after verification.

### Acceptance Criteria

- User can complete the loop in one PDF without using command syntax.
- Study Terminal still shows the underlying structured events for advanced users.
- Evidence works in the background; the user does not feel they are filling out learning data.
- The experience is demonstrably more active than ChatGPT plus a PDF reader.

## Milestone 0: Project Skeleton

Goal: keep the repository runnable and understandable for long-term collaboration.

### Tasks

- [x] Create monorepo or agreed project structure.
- [x] Create frontend app shell.
- [x] Create backend API shell.
- [x] Configure basic test runners.
- [x] Add environment configuration pattern.
- [x] Add placeholder prompt directory.
- [ ] Configure linting and formatting.
- [ ] Add database migration tool once persistent schema stabilizes.
- [ ] Add GitHub issue labels and agent collaboration docs after workflow confirmation.

### Acceptance Criteria

- Frontend and backend can run locally.
- Tests can be executed with documented commands.
- New developers and AI agents can understand repo layout, product direction, and task workflow from docs.

## Milestone 1: StudyStudio Shell

Goal: establish the Visual Studio-inspired learning IDE layout.

### Tasks

- [x] Implement left reading pane.
- [x] Implement right dock layout.
- [x] Add focus reading mode.
- [x] Make dock panels collapsible.
- [x] Add scroll containment for dock panels and terminal output.
- [x] Split workspace into focused components.
- [ ] Rename user-facing concepts from generic workspace/console wording toward StudyStudio language.
- [ ] Define stable dock panel model: Architecture Tree, Visual Workspace, Study Terminal.
- [ ] Add natural action buttons beside terminal commands for common actions.
- [ ] Add persistent panel state where useful.

### Acceptance Criteria

- User can read without the right dock blocking the source material.
- User can open and collapse Architecture Tree, Visual Workspace, and Study Terminal independently.
- The layout remains usable with long tree content, visual task drafts, and terminal output.

## Milestone 2: Resource Reading Surface

Goal: make real source material readable and selectable inside StudyStudio.

### Tasks

- [x] Implement PDF upload endpoint.
- [x] Store uploaded file locally for prototype.
- [x] Create Resource metadata record.
- [x] Extract page count.
- [x] Render PDF in frontend using PDF.js.
- [x] Implement page navigation.
- [x] Implement mouse-wheel page navigation.
- [x] Handle upload and render errors.
- [x] Capture selected PDF text with page/source metadata.
- [ ] Extract page text server-side.
- [ ] Create lightweight Page records.
- [ ] Create SourceSpan records for selectable or extracted text ranges.
- [ ] Add tests for page extraction and SourceSpan traceability.

### Acceptance Criteria

- User uploads a PDF and reads it in the app.
- User can select text and attach it to Study Terminal context.
- Backend can provide page text and stable source references for future tasks.
- Invalid files fail gracefully.

## Milestone 3: Architecture Tree Foundation

Goal: turn the right-side tree into a general architecture view rather than only a mock UnitTree.

### Tasks

- [x] Display mock ReadingUnit tree.
- [x] Click tree node to navigate the reader.
- [x] Highlight active unit from current page.
- [ ] Define ArchitectureTree view types: file tree, reading tree, concept tree, task tree, and state tree.
- [ ] Extract PDF outline when available.
- [ ] Build fallback FileTree from page ranges.
- [ ] Persist ReadingUnit and UnitTree data.
- [ ] Replace mock UnitTree with stored ReadingUnits for uploaded resources.
- [ ] Keep FileTree separate from learning-oriented tree views.

### Acceptance Criteria

- Architecture Tree can show at least FileTree and ReadingUnit views.
- Tree nodes keep source page references.
- Clicking a node navigates the original material.
- Missing PDF outline does not block the user.

## Milestone 4: Study Terminal Command System

Goal: make terminal commands first-class learning interactions.

### Tasks

- [x] Add command-style terminal input.
- [x] Add mock `/ask`, `/note`, `/quiz`, and `/submit-tree` commands.
- [x] Show context stack with current unit, page, selection, and visual task state.
- [x] Persist `InteractionTask` and `EvidenceEvent` for `/submit-tree`.
- [ ] Backendize `/note` as an EvidenceEvent.
- [ ] Add `/find-source` for finding original evidence for a question or claim.
- [ ] Add `/explain-selection` using selected SourceSpan context.
- [ ] Add `/quiz current` using current unit or selection context.
- [ ] Add command parser tests.
- [ ] Add graceful terminal error and retry behavior.

### Acceptance Criteria

- Terminal commands operate on explicit context.
- Each nontrivial command can create a task, evidence event, or both.
- Terminal output clearly distinguishes answer, note, quiz, evidence, and system messages.
- Terminal interactions are testable without a real LLM by default.

## Milestone 5: Visual Workspace Task Framework

Goal: make visual learning interactions measurable and extensible.

### Tasks

- [x] Add Visual Workspace panel.
- [x] Add mock concept pool.
- [x] Add mock concept tree draft.
- [x] Submit concept-tree draft as persisted EvidenceEvent.
- [ ] Define `VisualTask` schema.
- [ ] Define reusable task types: build concept tree, source matching, relation sorting, formula labeling, and sequence ordering.
- [ ] Replace native drag/drop with a robust interaction library if needed.
- [ ] Add validation for concept-tree submissions.
- [ ] Store visual task draft payloads consistently.
- [ ] Display task feedback in Study Terminal.

### Acceptance Criteria

- A visual task can be launched, completed, persisted, and reviewed.
- A task submission includes enough payload to evaluate the user's understanding.
- Visual tasks can attach selected SourceSpan evidence.

## Milestone 6: Evidence and State Kernel

Goal: turn user interactions into learning state.

### Tasks

- [x] Persist EvidenceEvent records.
- [ ] Define StateOverlay / StateRecord schema.
- [ ] Define StateUpdate schema.
- [ ] Implement simple rule-based state updater.
- [ ] Map note, quiz, source matching, and concept-tree evidence to state changes.
- [ ] Display state indicators in Architecture Tree and current unit detail.
- [ ] Add tests for state updates and non-mutation of source structures.

### Acceptance Criteria

- EvidenceEvent can update user state through explicit rules.
- State is associated with unit/tree/session/learning mode where appropriate.
- State does not overwrite Resource, Page, SourceSpan, FileTree, or UnitTree source data.

## Milestone 7: Scheduler and Study Plan

Goal: recommend the next learning action from state and evidence.

### Tasks

- [ ] Define `NextLearningAct` schema.
- [ ] Implement rule-based Scheduler v1.
- [ ] Add terminal command `/next` or `/plan`.
- [ ] Display a compact study plan panel or terminal output.
- [ ] Add rules for explain, probe, repair, review, advance, and practice.
- [ ] Persist scheduled actions if needed.
- [ ] Add tests for scheduler decisions.

### Acceptance Criteria

- User can ask StudyStudio what to do next.
- Recommendations cite the state/evidence that caused them.
- Scheduler works without a full KnowledgeGraph.

## Milestone 8: UnitReading and AI Context Builder

Goal: generate real learning structure and answers from scoped source context.

### Tasks

- [ ] Define UnitReading request/response schema.
- [ ] Create prompt v1 for UnitReading.
- [ ] Implement AI provider abstraction.
- [ ] Implement current-unit context builder.
- [ ] Implement `/unit-reading` endpoint or job.
- [ ] Validate AI JSON output.
- [ ] Persist generated UnitTree and ReadingUnits.
- [ ] Cache by input/prompt/model hash.
- [ ] Fallback to coarse page-range tree on invalid output.
- [ ] Add prompt and contract tests.

### Acceptance Criteria

- User can generate a ReadingUnit tree for a resource or page range.
- AI output is treated as editable candidate data.
- Long documents are processed progressively by scope.
- Invalid AI output does not crash StudyStudio.

## Milestone 9: Editing and Regeneration

Goal: let users correct AI-generated structure.

### Tasks

- [ ] Rename ReadingUnit.
- [ ] Adjust page range.
- [ ] Merge adjacent units.
- [ ] Split unit.
- [ ] Reorder units within a parent.
- [ ] Mark edited units as modified.
- [ ] Preserve original AI result or generation metadata.
- [ ] Prevent regeneration from silently overwriting edits.

### Acceptance Criteria

- User can fix incorrect tree boundaries and titles.
- Edits persist.
- Regeneration protects user modifications.

## Milestone 10: PPT/PPTX and Multi-Resource StudyStudio

Goal: support common course material and multi-file study spaces.

### Tasks

- [ ] Upload PPT/PPTX.
- [ ] Convert PPT/PPTX to PDF with LibreOffice headless.
- [ ] Preserve slide-to-page mapping.
- [ ] Run the same Resource/Page/SourceSpan pipeline on converted output.
- [ ] Allow multiple resources in one StudyStudio workspace.
- [ ] Generate per-resource trees.
- [ ] Propose merged Architecture Tree views across resources.
- [ ] Preserve source references across merged views.

### Acceptance Criteria

- User can study lecture slides through the same reader and interaction model.
- Multiple files can participate in one learning plan.
- Source references remain intact across resources.

## Future Milestones / Backlog

### Document Compiler

- [ ] Add DocumentIR independent of parser-specific output.
- [ ] Evaluate MinerU, Docling, or PyMuPDF-based adapters.
- [ ] Support formula, table, image, caption, list, and code blocks.
- [ ] Normalize parser output into SourceSpan-backed structures.

### Knowledge Layer

- [ ] Extract KnowledgeItem candidates from confirmed ReadingUnits.
- [ ] Stage candidate items and relations before accepting them.
- [ ] Link KnowledgeItems to SourceSpans.
- [ ] Build private personal graph.
- [ ] Generate learning trees from graph and state.

### Browser Plugin

- [ ] Import webpage into StudyStudio.
- [ ] Import online PDF.
- [ ] Import video transcript.
- [ ] Import GitHub README/code overview.

### Sharing and Collaboration

- [ ] Define public/private data separation.
- [ ] Add opt-in sharing for trees or templates.
- [ ] Add shared StudyStudio task templates.
- [ ] Add content moderation/quality workflow.

### Advanced Processing

- [ ] OCR scanned PDFs.
- [ ] Better formula/figure handling.
- [ ] Table extraction.
- [ ] Local folder sync.
- [ ] Desktop app wrapper.

## Suggested GitHub Issue Slices

Use `docs/github_issue_backlog.md` as the current first batch. Each issue should stay focused on the passage-understanding MVP loop unless explicitly moved to backlog.

1. **Rename the workspace shell to StudyStudio**
   - Blocked by: None.
   - Covers: product language, dock panel naming, page copy.

2. **Persist Page text and SourceSpan references for uploaded PDFs**
   - Blocked by: None.
   - Covers: source traceability for terminal and visual tasks.

3. **Backendize `/note` as an EvidenceEvent**
   - Blocked by: SourceSpan references preferred, but can start with SelectionContext.
   - Covers: terminal command, API persistence, tests.

4. **Add ArchitectureTree view model**
   - Blocked by: Page text and SourceSpan not strictly required.
   - Covers: file tree vs reading tree separation.

5. **Create VisualTask schema and concept-tree validation**
   - Blocked by: current Visual Workspace prototype.
   - Covers: measurable visual interactions.

6. **Add StateOverlay v1 from EvidenceEvent rules**
   - Blocked by: EvidenceEvent command slices.
   - Covers: state kernel foundation.

7. **Add Scheduler v1 and `/next` command**
   - Blocked by: StateOverlay v1.
   - Covers: study plan recommendation.

8. **Implement current-unit context builder**
   - Blocked by: Page text and ReadingUnit persistence.
   - Covers: ask, quiz, explain-selection, UnitReading.

## Open Planning Questions

- [ ] Choose GitHub issue labels and triage workflow.
- [ ] Decide whether PRs from external contributors are a triage surface.
- [ ] Choose local JSONL, SQLite, or PostgreSQL for the next persistence step.
- [ ] Choose initial AI provider and provider abstraction shape.
- [ ] Decide whether UnitTree history is needed before first release.
- [ ] Decide whether to store original AI output separately from edited UnitTree.
