# Task Board

This task board is written for staged development. It separates MVP work from future extensions.

Recommended workflow:

- Use feature branches for major epics.
- Keep tasks small and testable.
- Do not start future-stage tasks until the MVP core loop works.
- Update this board after each major implementation milestone.

## Milestone 0: Project Skeleton

Goal: create a clean repository that supports later expansion.

### Tasks

- [x] Create monorepo or agreed project structure.
- [x] Create frontend app shell.
- [x] Create backend API shell.
- [ ] Configure linting/formatting.
- [x] Configure basic test runners.
- [x] Add environment configuration pattern.
- [x] Add placeholder prompt directory.
- [ ] Add database migration tool.

### Acceptance Criteria

- Frontend and backend can run locally.
- Tests can be executed with documented commands.
- New developers/Codex can understand repo layout from docs.

## Milestone 1: Core Reading Workspace UI

Goal: prove left-reader/right-tree interaction with mock data.

### Tasks

- [x] Implement workspace page layout.
- [x] Implement left document viewer placeholder.
- [x] Implement right UnitTree pane with mock data.
- [x] Implement click unit -> jump to page using mock page navigation.
- [x] Implement current page -> active unit highlight.
- [x] Implement responsive layout baseline.

### Acceptance Criteria

- User can open a sample workspace.
- Right tree node click changes left viewer page.
- Current page highlights matching unit.

## Milestone 2: PDF Upload and Viewing

Goal: upload and view real PDFs.

### Tasks

- [ ] Implement PDF upload endpoint.
- [ ] Store uploaded file.
- [ ] Create Resource record.
- [ ] Extract page count.
- [ ] Render PDF in frontend using PDF.js/react-pdf.
- [ ] Implement page navigation.
- [ ] Handle upload and render errors.

### Acceptance Criteria

- User uploads a PDF and reads it in the app.
- Page navigation works.
- Resource metadata is persisted.

## Milestone 3: Page Index and FileTree

Goal: build lightweight source structure.

### Tasks

- [ ] Extract page text using PyMuPDF or equivalent.
- [ ] Create Page records.
- [ ] Extract PDF outline if available.
- [ ] Build FileTree from outline or fallback page ranges.
- [ ] Display basic file structure if available.
- [ ] Add tests for PDF parsing fallback.

### Acceptance Criteria

- Page records exist for uploaded PDF.
- FileTree exists when outline is available.
- Missing outline does not block processing.

## Milestone 4: DocumentProfiler

Goal: classify resource type and guide processing strategy.

### Tasks

- [ ] Define profile schema.
- [ ] Implement basic rule-based profiler.
- [ ] Optionally add AI-assisted profiling.
- [ ] Store profile on Resource.
- [ ] Display profile/debug information in developer mode.

### Acceptance Criteria

- Resource has a profile such as textbook, lecture_ppt, paper, notes, unknown.
- Profile can be used by UnitReading request.

## Milestone 5: UnitReading MVP

Goal: generate real UnitTree from a selected Scope.

### Tasks

- [ ] Define UnitReading request/response schema.
- [ ] Create prompt v1.
- [ ] Implement AI provider abstraction.
- [ ] Implement backend `/unit-reading` job.
- [ ] Validate AI JSON output.
- [ ] Persist UnitTree and ReadingUnits.
- [ ] Cache by input/prompt/model hash.
- [ ] Fallback to coarse tree on invalid output.

### Acceptance Criteria

- User can generate UnitTree for a PDF or page range.
- Units have titles, page ranges, summaries.
- UnitTree appears in right pane and supports navigation.
- Invalid AI result does not crash the app.

## Milestone 6: StateOverlay

Goal: track user learning state.

### Tasks

- [ ] Define StateRecord schema.
- [ ] Implement state controls in Unit detail panel.
- [ ] Persist unit states.
- [ ] Display state in UnitTree.
- [ ] Add tests for state updates.

### Acceptance Criteria

- User can mark a unit as unread/reading/understood/weak/mastered.
- State persists across reload.
- State does not modify Resource/FileTree/UnitTree source data.

## Milestone 7: Ask About Current Unit

Goal: provide contextual AI help.

### Tasks

- [ ] Implement current-unit context builder.
- [ ] Implement question endpoint.
- [ ] Add prompt v1 for current unit Q&A.
- [ ] Display answer in side panel.
- [ ] Include page/unit references where possible.
- [ ] Avoid sending full long documents by default.

### Acceptance Criteria

- User asks about current unit and receives useful answer.
- Context is limited to relevant pages/unit.
- Errors are handled gracefully.

## Milestone 8: UnitTree Editing

Goal: allow users to correct AI output.

### Tasks

- [ ] Rename ReadingUnit.
- [ ] Adjust page range.
- [ ] Merge adjacent units.
- [ ] Split unit.
- [ ] Reorder units.
- [ ] Mark edited units as modified.
- [ ] Prevent regeneration from silently overwriting edits.

### Acceptance Criteria

- User can fix incorrect UnitTree boundaries.
- Edits persist.
- Edited status is visible internally.

## Milestone 9: PPT/PPTX Support

Goal: support common classroom materials.

### Tasks

- [ ] Upload PPT/PPTX.
- [ ] Convert to PDF with LibreOffice headless.
- [ ] Preserve slide-to-page mapping.
- [ ] Run PDF pipeline on converted output.
- [ ] Generate UnitTree for slide deck.

### Acceptance Criteria

- User uploads PPT/PPTX and reads converted material.
- UnitTree uses slide/page ranges correctly.

## Milestone 10: Multi-Resource Workspace and UnitTree Merge

Goal: support topics spanning multiple files.

### Tasks

- [ ] Allow multiple resources in one workspace.
- [ ] Generate UnitTrees per resource/scope.
- [ ] Design merge candidate schema.
- [ ] Implement basic UnitTree merge proposal.
- [ ] Preserve source references for merged units.
- [ ] Require user confirmation for uncertain merges.

### Acceptance Criteria

- Multiple lecture files can form a course-level UnitTree.
- Repeated topics are detected or proposed.
- Source page references remain intact.

## Future Milestones / Backlog

### Lightweight KnowledgeGraph

- [ ] Extract KnowledgeNode candidates from confirmed ReadingUnits.
- [ ] Link ReadingUnits to KnowledgeNodes.
- [ ] Create private personal graph.
- [ ] Generate learning trees from graph.

### Browser Plugin

- [ ] Import webpage into workspace.
- [ ] Import online PDF.
- [ ] Import video transcript.
- [ ] Import GitHub README/code overview.

### Public/Shared Graph

- [ ] Define public/private data separation.
- [ ] Add opt-in sharing.
- [ ] Add shared UnitTree templates.
- [ ] Add content moderation/quality workflow.

### Advanced Processing

- [ ] OCR scanned PDFs.
- [ ] Better formula/figure handling.
- [ ] Table extraction.
- [ ] Local folder sync.
- [ ] Desktop app wrapper.

## Open Planning Questions

- [ ] Choose authentication model.
- [ ] Choose deployment target.
- [ ] Choose initial AI provider.
- [ ] Decide whether pgvector is needed in MVP.
- [ ] Decide whether UnitTree history is needed before first release.
- [ ] Decide whether to store original AI output separately from edited UnitTree.
