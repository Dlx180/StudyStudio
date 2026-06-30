# StudyStudio

StudyStudio is an interactive learning IDE for active source-based study.

Its first MVP promise is intentionally narrow:

> Help a learner understand one difficult source passage, verify whether they really understood it, and recommend the next learning step.

The workspace keeps trusted source material on the left. The right dock contains Architecture Tree, Visual Workspace, and Study Terminal surfaces that turn deliberate learning interactions into evidence, learning state, and next-step study plans.

This repository started as KnowTree, an AI knowledge-tree project. Historical KnowTree language now lives in archive docs or internal package names; StudyStudio is the current product direction.

## Current MVP Loop

```text
Resource
-> SourceSpan
-> StudioContext
-> TerminalCommand or VisualTask
-> EvidenceEvent
-> StateOverlay
-> NextLearningAct
```

The first MVP proves this loop with PDFs and selected passages. The underlying model stays source-agnostic so later video, webpages, and other learning resources can join without redesigning the interaction model.

## Canonical Docs

Read these first:

- [AGENTS.md](AGENTS.md): stable instructions for AI agents and contributors.
- [CONTEXT.md](CONTEXT.md): domain glossary.
- [docs/studystudio_contract.md](docs/studystudio_contract.md): shared interaction contract for frontend/backend work.
- [docs/mvp_issue_flow.md](docs/mvp_issue_flow.md): how the first GitHub issues form one MVP learning loop.
- [docs/second_batch_plan.md](docs/second_batch_plan.md): next collaborative issue batch after the first MVP loop.
- [docs/task_board.md](docs/task_board.md): current development roadmap.
- [docs/collaboration.md](docs/collaboration.md): GitHub workflow and team split.
- [docs/github_issue_backlog.md](docs/github_issue_backlog.md): first issue backlog draft.
- [docs/decisions.md](docs/decisions.md): accepted product and architecture decisions.

## Repository Layout

```text
apps/web          StudyStudio frontend
apps/api          FastAPI backend
packages/shared   shared TypeScript types
docs              product, architecture, task, and collaboration docs
prompts           versioned AI prompts
tests             repository-level tests and fixtures
scripts           local development scripts
```

## Historical Docs

Older KnowTree / KnowledgeTree vision documents live under [docs/archive](docs/archive). They are useful background, but they are not the current source of truth.
