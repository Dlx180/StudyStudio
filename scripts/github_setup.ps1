param(
  [string]$Repo = "Dlx180/StudyStudio"
)

$ErrorActionPreference = "Stop"

function Ensure-Label {
  param(
    [string]$Name,
    [string]$Color,
    [string]$Description
  )

  $existing = gh label list --repo $Repo --json name | ConvertFrom-Json | Where-Object { $_.name -eq $Name }
  if ($existing) {
    gh label edit $Name --repo $Repo --color $Color --description $Description | Out-Null
  } else {
    gh label create $Name --repo $Repo --color $Color --description $Description --force | Out-Null
  }
}

Ensure-Label "type:bug" "d73a4a" "Something is broken."
Ensure-Label "type:feature" "0e8a16" "New feature or improvement."
Ensure-Label "type:refactor" "5319e7" "Internal restructuring without product behavior change."
Ensure-Label "type:docs" "0075ca" "Documentation or planning."
Ensure-Label "type:test" "fbca04" "Testing and verification work."

Ensure-Label "needs-triage" "ededed" "Maintainer needs to evaluate."
Ensure-Label "needs-info" "d876e3" "Waiting for more information."
Ensure-Label "ready-for-agent" "1d76db" "Ready for an AI or human contributor to implement."
Ensure-Label "ready-for-human" "bfd4f2" "Needs human judgement or manual work."
Ensure-Label "wontfix" "000000" "Will not be actioned."

Ensure-Label "area:studio-shell" "c5def5" "StudyStudio shell and layout."
Ensure-Label "area:reader" "c5def5" "Reading Area, PDF viewer, source selection."
Ensure-Label "area:architecture-tree" "c5def5" "Architecture Tree and tree views."
Ensure-Label "area:visual-workspace" "c5def5" "Visual tasks and task runtime."
Ensure-Label "area:study-terminal" "c5def5" "Study Terminal commands and outputs."
Ensure-Label "area:evidence" "c5def5" "EvidenceEvent and interaction evidence."
Ensure-Label "area:state-kernel" "c5def5" "StateOverlay and state updates."
Ensure-Label "area:scheduler" "c5def5" "NextLearningAct and scheduling."
Ensure-Label "area:ai" "c5def5" "AI provider, prompts, context builder."
Ensure-Label "area:docs" "c5def5" "Product and collaboration docs."

Ensure-Label "priority:p0" "b60205" "Critical for the current milestone."
Ensure-Label "priority:p1" "fbca04" "Important, but not the first blocker."
Ensure-Label "priority:p2" "0e8a16" "Backlog or polish."

$milestoneTitle = "MVP Learning Verification Loop"
$milestoneExists = gh api "repos/$Repo/milestones" | ConvertFrom-Json | Where-Object { $_.title -eq $milestoneTitle }
if (-not $milestoneExists) {
  gh api -X POST "repos/$Repo/milestones" -f title="$milestoneTitle" -f description="Select a difficult PDF passage, explain it, verify understanding, save evidence, update state, and recommend the next step." | Out-Null
}

$issues = @(
  @{
    Title = "Align docs and UI language around the focused MVP promise"
    Labels = "type:docs,area:docs,area:studio-shell,ready-for-agent,priority:p0"
    Body = @"
## What to build

Update visible copy and core docs so contributors and users understand the first promise: explain a difficult passage, verify understanding, and recommend a next step.

## Acceptance criteria

- [ ] README and product spec state the focused MVP promise.
- [ ] Workspace copy avoids presenting StudyStudio as a broad platform first.
- [ ] Docs still preserve the source-agnostic long-term architecture.
- [ ] Existing PDF upload and dock interactions still work.

## Blocked by

None - can start immediately.
"@
  },
  @{
    Title = "Add natural selected-text actions beside Study Terminal commands"
    Labels = "type:feature,area:studio-shell,area:study-terminal,ready-for-agent,priority:p0"
    Body = @"
## What to build

When text is selected in the PDF reader, show natural action buttons such as Explain this, Quiz me, Find source, and Add note. These actions should map to the same underlying terminal command model.

## Acceptance criteria

- [ ] Selected text exposes visible action buttons.
- [ ] Explain this creates the same structured command request shape as /explain-selection.
- [ ] Study Terminal shows the command/result history without requiring command syntax.
- [ ] Empty selection state is clear and lightweight.

## Blocked by

None - can start with current SelectionContext.
"@
  },
  @{
    Title = "Persist SourceSpan v1 for selected PDF text"
    Labels = "type:feature,area:reader,area:evidence,ready-for-agent,priority:p0"
    Body = @"
## What to build

Create a durable source reference for selected PDF text so explanations, notes, verification tasks, and evidence can point back to trusted source material.

## Acceptance criteria

- [ ] Selected PDF text can be represented as SourceSpan-like data.
- [ ] SourceSpan references include resource id, page, text, and a range or fallback locator.
- [ ] EvidenceEvents can attach source references when available.
- [ ] Backend tests cover valid and fallback source references.

## Blocked by

None - can start with the current PDF text-layer selection.
"@
  },
  @{
    Title = "Implement Explain this for selected PDF text"
    Labels = "type:feature,area:study-terminal,area:ai,area:reader,ready-for-agent,priority:p0"
    Body = @"
## What to build

Provide the first explanation flow for selected source text. The result should be structured, cite the selected source, and offer a follow-up verification task.

## Acceptance criteria

- [ ] User can select text and trigger Explain this.
- [ ] The result is a structured TerminalCommandResult, not only plain chat text.
- [ ] The explanation cites the selected SourceSpan or fallback SelectionContext.
- [ ] AI can be mocked in tests; real provider is not required in CI.
- [ ] The result offers a follow-up verification task.

## Blocked by

Issue 2. Issue 3 is recommended for durable citation.
"@
  },
  @{
    Title = "Add one verification task after explanation"
    Labels = "type:feature,area:visual-workspace,area:evidence,ready-for-agent,priority:p0"
    Body = @"
## What to build

After an explanation, create one small task that checks whether the learner understood the selected passage. Start with a simple short-answer or concept-choice task before expanding to richer visual tasks.

## Acceptance criteria

- [ ] Explanation result can open or create a verification task.
- [ ] Task prompt is based on selected passage context.
- [ ] User can submit a response.
- [ ] Submission payload is inspectable and testable.
- [ ] Visual Workspace is used only when it improves the task; simple tasks can render inline.

## Blocked by

Issue 4.
"@
  },
  @{
    Title = "Save verification result as EvidenceEvent"
    Labels = "type:feature,area:evidence,area:study-terminal,ready-for-agent,priority:p0"
    Body = @"
## What to build

Persist the user's verification response as learning evidence. The user should experience this as normal task completion, not as manual data entry.

## Acceptance criteria

- [ ] Verification submission creates an EvidenceEvent.
- [ ] Evidence links to task, unit/page/selection, and source reference where available.
- [ ] Terminal output confirms completion in user-friendly language.
- [ ] Backend tests cover evidence creation and source reference attachment.

## Blocked by

Issue 5.
"@
  },
  @{
    Title = "Update StateOverlay v1 from verification evidence"
    Labels = "type:feature,area:state-kernel,area:evidence,ready-for-agent,priority:p0"
    Body = @"
## What to build

Add a small rule-based state update from verification evidence. This should avoid overclaiming mastery from weak evidence.

## Acceptance criteria

- [ ] StateSummary supports at least reading, weak, understood, and needs_review.
- [ ] Correct verification nudges state toward understood.
- [ ] Failed or skipped verification nudges state toward weak or needs_review.
- [ ] Taking a note alone does not mark a unit as mastered.
- [ ] Tests cover positive, weak, and no-evidence cases.

## Blocked by

Issue 6.
"@
  },
  @{
    Title = "Recommend next step after verification"
    Labels = "type:feature,area:scheduler,area:study-terminal,ready-for-agent,priority:p0"
    Body = @"
## What to build

After state updates, recommend one next learning action. Keep the first scheduler simple and explainable.

## Acceptance criteria

- [ ] A NextLearningAct is returned after verification.
- [ ] If understanding is weak, recommend repair/review.
- [ ] If understanding is sufficient, recommend advance/practice.
- [ ] Recommendation cites the evidence or state reason.
- [ ] User can also request the recommendation through /next.

## Blocked by

Issue 7.
"@
  }
)

foreach ($issue in $issues) {
  $existing = gh issue list --repo $Repo --state all --search $issue.Title --json title | ConvertFrom-Json | Where-Object { $_.title -eq $issue.Title }
  if ($existing) {
    Write-Host "Issue already exists: $($issue.Title)"
    continue
  }

  gh issue create `
    --repo $Repo `
    --title $issue.Title `
    --body $issue.Body `
    --label $issue.Labels `
    --milestone $milestoneTitle | Out-Null

  Write-Host "Created issue: $($issue.Title)"
}

Write-Host "GitHub setup complete for $Repo."
