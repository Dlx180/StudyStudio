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

## Git and Pull Request Workflow

Use a short-branch workflow. `main` should stay runnable, and all implementation work should go through pull requests.

### Branch Rules

1. Protect `main` on GitHub.
2. Do not push directly to `main`.
3. Create one branch per issue or tightly scoped task.
4. Keep branches short lived, ideally 1-3 days.
5. Prefer small pull requests that do one thing.

Recommended branch names:

```text
feature/pdf-upload
feature/unit-tree-editing
fix/resource-upload-error
docs/collaboration-workflow
codex/<short-task-name>
```

Use the `codex/` prefix for AI-assisted branches unless a human-owned branch name is clearer.

### Daily Sync

At the start of each work session:

```bash
git checkout main
git pull origin main
git checkout <your-branch>
git merge origin/main
```

For this project, prefer `git merge origin/main` over rebasing shared branches. It is easier for a small team to audit and avoids accidental history rewrites.

### Before Opening or Updating a PR

Run this checklist:

1. Pull the latest `main`.
2. Merge `origin/main` into the feature branch.
3. Resolve conflicts locally.
4. Run the relevant checks.
5. Push the updated branch.
6. Make sure the PR says it can merge automatically.

Typical commands:

```bash
git fetch origin
git checkout <your-branch>
git merge origin/main
npm run web:build
npm run api:test
git push
```

If `npm run api:test` fails because local Python dependencies are missing, install the API dependencies or document the exact missing package in the PR.

### Review and Merge Rules

- Every PR should reference its issue, for example `Closes #12`.
- Every PR should include what was tested.
- At least one other collaborator should review before merge.
- Use squash merge for small single-purpose PRs.
- Use a merge commit when preserving a multi-commit integration history is useful.
- Delete feature branches after merge.

### Conflict Prevention

Avoid having multiple people edit the same high-conflict files at the same time:

- `package-lock.json`
- `apps/web/app/globals.css`
- `packages/shared/src/index.ts`
- `docs/task_board.md`
- large mock data or shared schema files

When a task must touch one of these files, say so in the issue or team chat before starting.

Suggested split for three active developers:

- Developer A: API, persistence, tests under `apps/api`.
- Developer B: frontend workspace components under `apps/web/components/workspace`.
- Developer C: shared schemas, docs, issue triage, and integration checks.

Rotate ownership as needed, but avoid two people making broad edits in the same area on the same day.

### When GitHub Says "Can't Automatically Merge"

Fix it from the feature branch:

```bash
git fetch origin
git checkout <your-branch>
git merge origin/main
# resolve conflicts
npm run web:build
git push
```

Do not resolve complex conflicts directly in the GitHub web editor unless the change is documentation-only.

### Dependency Changes

- Commit `package-lock.json` when `package.json` changes.
- Do not run `npm audit fix --force` inside an unrelated PR.
- Mention new dependencies in the PR description.
- Keep dependency changes separate from UI or API behavior changes when practical.

### AI Agent Branches

For AI-assisted work:

1. Start from the latest `main`.
2. Use a `codex/<task>` branch.
3. Keep generated changes scoped to the issue.
4. Ask the agent to report test results and known gaps.
5. Review the diff before merging, especially generated docs, lockfiles, and shared schemas.

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
