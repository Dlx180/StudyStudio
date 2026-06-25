# GitHub Issue Backlog Draft

This file is a draft backlog for GitHub Issues. Publish these after labels are created.

The first milestone is:

```text
MVP Learning Verification Loop
```

Product promise:

> Help a learner understand one difficult PDF passage, verify whether they really understood it, and recommend the next learning step.

North-star metric:

> Learning units completed with verification evidence.

For the implementation flow and the relationship between GitHub issue numbers #2-#9, read `docs/mvp_issue_flow.md`.

## 1. Align docs and UI language around the focused MVP promise

Labels: `type:docs`, `area:docs`, `area:studio-shell`, `ready-for-agent`, `priority:p0`

### What to build

Update visible copy and core docs so contributors and users understand the first promise: explain a difficult passage, verify understanding, and recommend a next step. Keep the broader StudyStudio contract as architecture, but make the first experience narrow and sharp.

### Acceptance criteria

- [ ] README and product spec state the focused MVP promise.
- [ ] Workspace copy avoids presenting StudyStudio as a broad platform first.
- [ ] Docs still preserve the source-agnostic long-term architecture.
- [ ] Existing PDF upload and dock interactions still work.

### Blocked by

None - can start immediately.

## 2. Add natural selected-text actions beside Study Terminal commands

Labels: `type:feature`, `area:studio-shell`, `area:study-terminal`, `ready-for-agent`, `priority:p0`

### What to build

When text is selected in the PDF reader, show natural action buttons such as `Explain this`, `Quiz me`, `Find source`, and `Add note`. These actions should map to the same underlying terminal command model so advanced users can still use commands.

### Acceptance criteria

- [ ] Selected text exposes visible action buttons.
- [ ] `Explain this` creates the same structured command request shape as `/explain-selection`.
- [ ] Study Terminal shows the command/result history without requiring command syntax.
- [ ] Empty selection state is clear and lightweight.

### Blocked by

None - can start with current SelectionContext.

## 3. Persist SourceSpan v1 for selected PDF text

Labels: `type:feature`, `area:reader`, `area:evidence`, `ready-for-agent`, `priority:p0`

### What to build

Create a durable source reference for selected PDF text so explanations, notes, verification tasks, and evidence can point back to trusted source material.

### Acceptance criteria

- [ ] Selected PDF text can be represented as SourceSpan-like data.
- [ ] SourceSpan references include resource id, page, text, and a range or fallback locator.
- [ ] EvidenceEvents can attach source references when available.
- [ ] Backend tests cover valid and fallback source references.

### Blocked by

None - can start with the current PDF text-layer selection.

## 4. Implement `Explain this` for selected PDF text

Labels: `type:feature`, `area:study-terminal`, `area:ai`, `area:reader`, `ready-for-agent`, `priority:p0`

### What to build

Provide the first explanation flow for selected source text. The result should be structured, cite the selected source, and offer a follow-up verification task.

### Acceptance criteria

- [ ] User can select text and trigger `Explain this`.
- [ ] The result is a structured TerminalCommandResult, not only plain chat text.
- [ ] The explanation cites the selected SourceSpan or fallback SelectionContext.
- [ ] AI can be mocked in tests; real provider is not required in CI.
- [ ] The result offers a follow-up verification task.

### Blocked by

Issue 2. Issue 3 is recommended for durable citation.

## 5. Add one verification task after explanation

Labels: `type:feature`, `area:visual-workspace`, `area:evidence`, `ready-for-agent`, `priority:p0`

### What to build

After an explanation, create one small task that checks whether the learner understood the selected passage. Start with a simple short-answer or concept-choice task before expanding to richer visual tasks.

### Acceptance criteria

- [ ] Explanation result can open or create a verification task.
- [ ] Task prompt is based on selected passage context.
- [ ] User can submit a response.
- [ ] Submission payload is inspectable and testable.
- [ ] Visual Workspace is used only when it improves the task; simple tasks can render inline.

### Blocked by

Issue 4.

## 6. Save verification result as EvidenceEvent

Labels: `type:feature`, `area:evidence`, `area:study-terminal`, `ready-for-agent`, `priority:p0`

### What to build

Persist the user's verification response as learning evidence. The user should experience this as normal task completion, not as manual data entry.

### Acceptance criteria

- [ ] Verification submission creates an EvidenceEvent.
- [ ] Evidence links to task, unit/page/selection, and source reference where available.
- [ ] Terminal output confirms completion in user-friendly language.
- [ ] Backend tests cover evidence creation and source reference attachment.

### Blocked by

Issue 5.

## 7. Update StateOverlay v1 from verification evidence

Labels: `type:feature`, `area:state-kernel`, `area:evidence`, `ready-for-agent`, `priority:p0`

### What to build

Add a small rule-based state update from verification evidence. This should avoid overclaiming mastery from weak evidence.

### Acceptance criteria

- [ ] StateSummary supports at least `reading`, `weak`, `understood`, and `needs_review`.
- [ ] Correct verification nudges state toward `understood`.
- [ ] Failed or skipped verification nudges state toward `weak` or `needs_review`.
- [ ] Taking a note alone does not mark a unit as mastered.
- [ ] Tests cover positive, weak, and no-evidence cases.

### Blocked by

Issue 6.

## 8. Recommend next step after verification

Labels: `type:feature`, `area:scheduler`, `area:study-terminal`, `ready-for-agent`, `priority:p0`

### What to build

After state updates, recommend one next learning action. Keep the first scheduler simple and explainable.

### Acceptance criteria

- [ ] A NextLearningAct is returned after verification.
- [ ] If understanding is weak, recommend repair/review.
- [ ] If understanding is sufficient, recommend advance/practice.
- [ ] Recommendation cites the evidence or state reason.
- [ ] User can also request the recommendation through `/next`.

### Blocked by

Issue 7.

## Later Backlog

These are important, but not first-loop blockers:

- ArchitectureTree multi-view model.
- Full VisualTask runtime for concept trees.
- UnitReading tree generation.
- PPT/PPTX support.
- Video transcript support.
- Webpage import.
- Social/check-in features inspired by Study-DaZi.
