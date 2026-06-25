# Collaboration Plan

This document describes the recommended GitHub workflow and team split for StudyStudio.

## Repository

The current remote is:

```text
https://github.com/Dlx180/StudyStudio.git
```

The repository has been renamed to StudyStudio. Some package names and historical docs may still use KnowTree until a later internal cleanup.

## Recommended GitHub Labels

Category labels:

- `type:bug`
- `type:feature`
- `type:refactor`
- `type:docs`
- `type:test`

State labels:

- `needs-triage`
- `needs-info`
- `ready-for-agent`
- `ready-for-human`
- `wontfix`

Area labels:

- `area:studio-shell`
- `area:reader`
- `area:architecture-tree`
- `area:visual-workspace`
- `area:study-terminal`
- `area:evidence`
- `area:state-kernel`
- `area:scheduler`
- `area:ai`
- `area:docs`

Priority labels:

- `priority:p0`
- `priority:p1`
- `priority:p2`

## Recommended Roles

### Product and Domain Lead

Owns StudyStudio's product language, task model, learning-state semantics, and acceptance criteria.

Best tasks:

- product spec updates;
- task design;
- state model decisions;
- review of UX behavior;
- issue triage.

### Frontend Studio Lead

Owns the Visual Studio-inspired layout and all right-dock interactions.

Best tasks:

- StudyStudio shell;
- Architecture Tree UI;
- Visual Workspace tasks;
- Study Terminal;
- responsive and interaction QA.

### Backend and State Lead

Owns APIs, persistence, evidence, state updates, and scheduling.

Best tasks:

- Resource/Page/SourceSpan pipeline;
- InteractionTask and EvidenceEvent APIs;
- StateOverlay;
- Scheduler;
- database migrations.

### AI and Document Processing Lead

Owns parser adapters, prompt versions, schema validation, AI provider integration, and context builders.

Best tasks:

- DocumentIR;
- UnitReading;
- current-unit context builder;
- `/ask`, `/quiz`, `/find-source`;
- AI output validation and fallbacks.

### QA and Release Lead

Owns automated checks, smoke tests, fixtures, and release confidence.

Best tasks:

- backend tests;
- frontend smoke tests;
- Playwright flows;
- fixture documents;
- regression checklists.

## Issue Workflow

1. New work starts as a GitHub Issue.
2. The issue receives one category label, one state label, and at least one area label.
3. Issues become `ready-for-agent` only when acceptance criteria are explicit.
4. Implementation happens on feature branches.
5. Pull requests reference the issue and include test results.
6. Product/domain changes update docs before the issue is closed.

## Suggested Agent Skills

The locally installed Matt Pocock skills are useful for this project:

- `to-prd`: turn a discussion into a PRD.
- `to-issues`: break a PRD into vertical GitHub-ready issues.
- `triage`: move issues through `needs-triage`, `needs-info`, `ready-for-agent`, and related states.
- `tdd`: implement risky features test-first.
- `diagnosing-bugs`: debug broken flows.
- `domain-modeling`: keep terms like StudyStudio, EvidenceEvent, and StateOverlay precise.
- `handoff`: summarize long sessions for another agent or collaborator.

Before using the issue-writing skills against GitHub, run the setup flow for the repo and confirm:

- GitHub Issues are the tracker;
- whether external PRs are a request surface;
- the exact label vocabulary;
- whether domain docs are single-context or multi-context.

## First Collaboration Batch

Recommended first issues:

1. Rename workspace UI and docs to StudyStudio language.
2. Persist Page text and SourceSpan records for uploaded PDFs.
3. Backendize `/note` as an EvidenceEvent.
4. Define the ArchitectureTree view model.
5. Define VisualTask schema and concept-tree validation.
6. Implement StateOverlay v1 from EvidenceEvent rules.
7. Implement Scheduler v1 and `/next`.
8. Implement current-unit context builder.
