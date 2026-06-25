# MVP Issue Flow

This guide explains how the first StudyStudio issues connect.

The GitHub issue numbers are the source of truth. The local backlog file may list the same work as 1-8, but after publishing, GitHub assigned them as #2-#9 because #1 already existed.

## First MVP Promise

StudyStudio's first phase is not a broad learning platform. It should prove one concrete loop:

```text
User selects a difficult PDF passage
-> StudyStudio explains it
-> StudyStudio gives a small verification task
-> User answers
-> StudyStudio records evidence
-> StudyStudio updates learning state
-> StudyStudio recommends the next step
```

The user-facing promise is:

> I help you understand difficult material, verify whether you really understood it, and tell you what to study next.

## Issue Chain

```text
#2 Product promise and language
  -> #3 Natural selected-text actions
  -> #4 SourceSpan v1
  -> #5 Explain this
  -> #6 Verification task
  -> #7 EvidenceEvent
  -> #8 StateOverlay
  -> #9 NextLearningAct
```

## What Each Issue Means

### #2 Product Promise and Language

Purpose: keep the team focused.

This issue prevents the product from drifting into "a platform for every resource type." Contributors should understand that the first release is about one focused promise: help a learner understand one difficult passage and verify understanding.

### #3 Natural Selected-Text Actions

Purpose: make StudyStudio usable without knowing terminal commands.

The user selects PDF text with the mouse. StudyStudio shows a lightweight action surface such as:

```text
Explain this | Quiz me | Find source | Add note
```

This should not depend on a right-click menu in v1. Browser/PDF right-click behavior is inconsistent, and command-line interaction is too high-friction for ordinary learners.

The action buttons still map to the same underlying command model:

```text
Click "Explain this"
-> TerminalCommandRequest(command="explain_selection", context=current_selection)
```

Study Terminal remains useful as the history, advanced command input, and structured result stream.

### #4 SourceSpan v1

Purpose: bind learning actions back to trusted source material.

SourceSpan answers:

```text
Where did this explanation, note, task, or evidence come from?
```

The first version can be simple:

```text
resource_id
page
selected_text
source type
optional text range or fallback locator
```

It does not need perfect sentence segmentation.

### #5 Explain This

Purpose: provide the first meaningful learning help.

Input:

```text
SelectionContext or SourceSpan
```

Output:

```text
TerminalCommandResult {
  kind: "answer",
  message: explanation,
  source_refs: [...],
  follow_up_actions: ["Create verification task"]
}
```

The first implementation may use a mock AI result. The important thing is the structured result shape and source citation.

### #6 Verification Task

Purpose: move beyond ChatPDF-style answer generation.

StudyStudio should not stop at:

```text
question -> answer
```

It should continue to:

```text
question -> answer -> verify understanding
```

The first task can be simple:

- explain the passage in your own words;
- choose the core concept;
- identify the missing prerequisite;
- judge whether a claim is true or false.

The task does not need to be a complex Visual Workspace task in v1. If an inline task is clearer, use it.

### #7 EvidenceEvent

Purpose: record learning evidence without making the user feel like they are filling out data.

When the user submits the verification task, StudyStudio creates an EvidenceEvent:

```text
event_type = verification_answer
source_refs = selected passage
payload = task prompt, user answer, result or pending evaluation
```

The foreground experience should feel like finishing a small learning task. Evidence collection should happen quietly in the background.

### #8 StateOverlay

Purpose: let StudyStudio remember what the learner understands.

State should come from evidence, not passive reading alone.

Initial rules can be simple:

```text
correct verification -> understood
weak/incorrect verification -> weak or needs_review
note only -> do not mark as mastered
no evidence -> keep reading/unseen state
```

The first state model should avoid overclaiming mastery.

### #9 NextLearningAct

Purpose: close the loop.

After updating state, StudyStudio recommends one next action:

```text
if weak -> repair or review
if understood -> advance or practice
if no evidence -> probe
```

The recommendation should cite the state/evidence reason in human-readable language.

## SourceSpan and Sentence Splitting

Question: should text be split into sentences before #3?

Answer: no, not for the first MVP.

Recommended progression:

```text
v1: selected_text SourceSpan
v2: server-side page text extraction
v3: paragraph spans
v4: sentence spans
v5: formula/table/figure spans
```

PDF text extraction is messy. Line breaks, two-column layouts, headers, footers, formulas, and hyphenation can make early sentence splitting unreliable. The first MVP only needs enough traceability to support the passage-understanding loop.

Frontend #3 can start from current SelectionContext. Backend #4 can later upgrade the same selected text into durable SourceSpan records.

## Parallel Work Boundaries

### Frontend

Can start with #3 using mock command results:

- show selected-text action buttons;
- trigger structured command requests;
- render Study Terminal result history;
- preserve command-line advanced mode.

Frontend does not need perfect SourceSpan persistence before building the first interaction.

### Backend

Can start with #4:

- accept selected text/page/resource context;
- return SourceSpan-like references;
- attach source references to EvidenceEvents.

Backend does not need the final visual task system before persisting SourceSpan v1.

### Product/State

Can start with rules for #8 and #9:

- what evidence counts as weak/strong;
- what state transitions are allowed;
- what next actions are appropriate.

Product/state work should not block #3 and #4. It only needs to define the first rule set before #7-#9 land.

## What Not To Build Yet

Keep these out of the first loop unless they are necessary for #2-#9:

- full ArchitectureTree multi-view system;
- full concept-tree Visual Workspace runtime;
- video/webpage import;
- social/check-in features;
- full KnowledgeGraph extraction;
- perfect PDF sentence segmentation;
- production-grade spaced repetition.

These are important later, but the first proof should be the focused learning verification loop.
