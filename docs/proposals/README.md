# Proposals

This directory stores product and architecture proposals for non-trivial changes to StudyStudio.

A proposal is required when a change may affect product scope, data models, APIs, AI pipelines, document processing behavior, user workflows, testing strategy, or long-term architecture. Proposals help keep the project incremental and prevent ad-hoc rewrites.

## 1. When to write a proposal

Write a proposal before implementing changes such as:

- support for a new resource type, such as PPT, webpage, video, GitHub repository, or local folder sync;
- changes to `Resource`, `FileTree`, `ReadingUnit`, `UnitTree`, `StateOverlay`, or future `KnowledgeGraph` concepts;
- new AI pipeline stages, prompt formats, model routing, caching, or regeneration behavior;
- new user workflows, such as UnitTree editing, multi-file merge, exam review mode, or project learning mode;
- new integration surfaces, such as browser extensions, desktop sync helpers, or public/shared graph features;
- database schema changes that require migrations;
- changes that may break existing workspace, resource, unit, or state data;
- large refactors that touch multiple frontend and backend modules.

A proposal is usually not required for:

- small UI copy or style changes;
- local bug fixes;
- adding or updating tests without changing product behavior;
- minor documentation corrections;
- small refactors that preserve APIs, schemas, and user-visible behavior.

If unsure, create a proposal first. A short proposal is better than an undocumented architectural change.

## 2. Proposal lifecycle

Each proposal must have a status field.

Allowed statuses:

- `Draft`: being discussed; not ready for implementation.
- `Accepted`: approved for implementation.
- `Implemented`: implemented and merged.
- `Rejected`: intentionally not pursued.
- `Superseded`: replaced by a newer proposal or decision.

Lifecycle:

```text
Draft
  -> Accepted
  -> Implemented
```

or:

```text
Draft
  -> Rejected / Superseded
```

Do not implement a `Draft` proposal unless explicitly instructed.

## 3. File naming convention

Use a monotonically increasing four-digit number and a short kebab-case title:

```text
0001-ppt-support.md
0002-unit-tree-editing.md
0003-browser-extension-import.md
0004-lightweight-knowledge-graph.md
```

Proposal numbers should not be reused, even if a proposal is rejected.

## 4. Proposal template

Copy this template when creating a new proposal.

```md
# Proposal 0000: Title

## Status
Draft

## Summary
A short one-paragraph summary of the proposed change.

## Background
Explain the user need, product gap, or technical reason for the change.

## Goals
- Goal 1.
- Goal 2.
- Goal 3.

## Non-goals
- What this proposal intentionally does not solve.
- What should remain out of scope for this stage.

## User Flow
Describe the expected user experience from the user's perspective.

## Functional Requirements
- Requirement 1.
- Requirement 2.
- Requirement 3.

## Non-functional Requirements
Include performance, reliability, privacy, compatibility, cost, or maintainability requirements.

## Technical Design
Describe the planned frontend, backend, data, AI, and integration changes.

### Frontend
TBD.

### Backend
TBD.

### Data Model
TBD.

### AI / UnitReading Pipeline
TBD.

### External Integrations
TBD.

## API Changes
List new or changed API endpoints and request/response shapes.

## Data Migration
State whether a migration is required. If yes, describe backward compatibility and rollback concerns.

## Testing Plan
Describe unit tests, integration tests, E2E tests, AI contract tests, prompt regression tests, and manual QA.

## Rollout Plan
Describe implementation phases, feature flags, and acceptance criteria.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| TBD | TBD | TBD |

## Open Questions
- [ ] Question 1.
- [ ] Question 2.

## Documentation Updates
List documents that must be updated after this proposal is accepted or implemented:

- [ ] `docs/product_spec.md`
- [ ] `docs/architecture.md`
- [ ] `docs/decisions.md`
- [ ] `docs/task_board.md`
- [ ] `docs/testing.md`
- [ ] `docs/changelog.md`
```

## 5. Relationship to stable documents

Proposals are discussion and planning documents. Once a proposal is accepted or implemented, its stable conclusions must be reflected in the main documentation:

- `docs/product_spec.md`: product behavior and user-facing scope.
- `docs/architecture.md`: system structure, interfaces, data model, and pipeline design.
- `docs/decisions.md`: accepted architectural or product decisions with rationale.
- `docs/task_board.md`: concrete implementation tasks and milestones.
- `docs/testing.md`: required test coverage and validation workflow.
- `docs/changelog.md`: user-visible and developer-visible changes by version.

Do not leave important accepted behavior only inside a proposal. Accepted behavior must be copied into the stable documents.

## 6. Engineering principles for proposals

Every proposal must preserve these project principles unless it explicitly proposes a change and receives approval:

1. The project evolves incrementally from the current MVP. Do not create a separate v2 app unless explicitly instructed.
2. The core MVP concepts remain stable: `Resource`, `FileTree`, `ReadingUnit`, `UnitTree`, `StateOverlay`.
3. `Page` is a location unit, not the main learning unit.
4. `ReadingUnit` is the primary learning unit for the MVP.
5. `UnitTree` is one Architecture Tree view; it is not the whole StudyStudio product surface.
6. `KnowledgeGraph` is a later persistence and abstraction layer, not the first implementation target.
7. AI-generated structures are candidates and must be editable, cacheable, and traceable to source ranges.
8. Document handling should use progressive processing. Do not fully process long books page-by-page by default.
9. Private workspaces are the default. Shared/public graphs require explicit design and permission boundaries.
10. Use schema migrations, prompt versions, and feature branches for changes that affect persistent behavior.

## 7. Codex usage guidance

For small changes, Codex may directly edit implementation files and update related tests.

For proposal-level changes, Codex should:

1. Read `AGENTS.md` first.
2. Read the accepted proposal.
3. Check whether `docs/product_spec.md`, `docs/architecture.md`, and `docs/decisions.md` already reflect the proposal.
4. Implement the smallest safe increment.
5. Add or update tests.
6. Update `docs/task_board.md` and `docs/changelog.md` when appropriate.
7. Avoid changing core abstractions unless the proposal explicitly requires it.

