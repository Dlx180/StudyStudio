# Changelog

This file records notable product, architecture, documentation, and implementation changes for KnowTree.

The project follows an incremental development model. The first MVP is the product foundation, not a throwaway prototype. Future work should extend the existing architecture through documented proposals, migrations, prompt versions, and feature branches.

## Change Management Principles

### 1. Preserve the core MVP architecture

Do not replace the MVP with a separate `v2` application unless explicitly instructed.

The following concepts are stable foundations and should not be renamed, removed, or redefined casually:

- `Resource`: an uploaded or imported learning material.
- `FileTree`: the original structure of a resource, such as pages, slides, outlines, or chapters.
- `ReadingUnit`: a learning-oriented unit generated from a resource scope.
- `UnitTree`: a user-facing reading or learning tree built from ReadingUnits.
- `StateOverlay`: user state attached to a learning mode, tree, unit, or session.

Future `KnowledgeGraph` features should be introduced as an extension layer, not as a replacement for the MVP reading workflow.

### 2. Separate stable documents from proposals

Stable documents describe accepted project behavior:

- `AGENTS.md`
- `docs/product_spec.md`
- `docs/architecture.md`
- `docs/decisions.md`
- `docs/task_board.md`
- `docs/testing.md`

Proposal documents describe planned or debated changes:

- `docs/proposals/*.md`

Accepted proposal results must be reflected in the stable documents. Do not leave accepted architecture only inside a proposal.

### 3. Use proposals for non-trivial changes

Create a proposal for changes that affect:

- data models;
- APIs;
- AI pipelines;
- document processing behavior;
- UnitReading behavior;
- UnitTree merging or editing semantics;
- browser plugin or desktop integration;
- sharing/public graph features;
- long-term architecture;
- testing strategy.

Small UI fixes, copy edits, local bug fixes, and test-only changes do not require proposals.

### 4. Prefer additive and migratable changes

Schema changes must use database migrations.

Prompt changes must use prompt versions when they affect persisted AI outputs or regression tests.

Large changes should be developed on feature branches and merged after review.

Avoid destructive changes to existing workspace, resource, file tree, unit tree, and state data.

### 5. Keep AI behavior testable

AI-generated outputs must be treated as candidate structures, not unquestionable ground truth.

For AI-related changes, update or add:

- contract tests for output shape;
- prompt regression tests for representative documents;
- fallback behavior for malformed or low-confidence outputs;
- manual QA notes for reading-tree quality.

### 6. Keep the first user workflow stable

The first stable workflow is:

```text
Upload PDF/PPT
  -> parse resource and file structure
  -> generate or load UnitTree
  -> read original material on the left
  -> navigate with UnitTree on the right
  -> ask questions or mark state for the current unit
```

New features should not break this flow.

## Version Log

## Unreleased

### Added

- Added the initial monorepo skeleton with `apps/web`, `apps/api`, `packages/shared`, `prompts`, `tests`, and `scripts`.
- Added a FastAPI API shell with health and mock workspace endpoints.
- Added a Next.js mock reading workspace that demonstrates the left original-material pane and right UnitTree pane.
- Added `local_step.md` to track small local development steps before cloud-side documentation updates.

- Added `docs/proposals/README.md` to define the proposal process, proposal template, lifecycle, and Codex usage guidance.
- Added this changelog to record project changes and document change-management principles.

### Changed

- Clarified that future development should proceed incrementally from the MVP instead of creating a separate v2 application.
- Clarified that proposal-level changes must be synchronized back into stable documentation after acceptance or implementation.

### Open

- TBD: decide the first proposal to implement after the initial MVP documentation is committed.
- TBD: define release versioning once implementation begins.
- TBD: decide whether to use semantic versioning before the first public release.

