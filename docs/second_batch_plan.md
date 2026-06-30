# Second Batch Plan

Status: published plan for GitHub issue batch 2  
Audience: StudyStudio contributors and AI coding agents

## Purpose

The first issue batch proved the focused MVP loop:

```text
select PDF passage
-> explain it
-> answer one understanding check
-> save EvidenceEvent
-> update StateOverlay
-> recommend NextLearningAct
```

The second batch should make that loop less mock-like and easier to extend. It focuses
on source text infrastructure, a real Architecture Tree contract, more evidence-bearing
terminal commands, a measurable VisualTask contract, and the first AI-provider boundary.

## Collaboration Shape

The team can work in three mostly parallel tracks:

- **Source and Architecture track**: Page text extraction, source-backed tree views, and
  stable source navigation.
- **Terminal and Evidence track**: `/note`, `/find-source`, evidence creation, and
  terminal result rendering.
- **Visual and AI track**: VisualTask schema, concept-tree validation, provider boundary,
  and bounded current-unit context.

The key rule is that every task should remain demoable by itself. Avoid broad rewrites.

## Published GitHub Issues

GitHub issue numbers are the source of truth. The local batch numbers below are
planning labels only.

### Batch 2.1 / Issue #19: Extract PDF page text and expose Page records

Goal: uploaded PDFs should have source text that backend commands can inspect without
depending on mouse-selected text.

GitHub: https://github.com/Dlx180/StudyStudio/issues/19

Blocked by: none.

Best owner: Source and Architecture track.

Review signal:

- upload a PDF;
- call the page/metadata API;
- verify page text exists or a clear extraction fallback is recorded.

### Batch 2.2 / Issue #20: Add ArchitectureTree view model and reading/file views

Goal: the right-side Architecture Tree should render a typed tree view instead of a
hard-coded mock UnitTree.

GitHub: https://github.com/Dlx180/StudyStudio/issues/20

Blocked by: Batch 2.1 / Issue #19 is helpful, but a mock-backed first version can start immediately.

Best owner: Source and Architecture track or Frontend Studio lead.

Review signal:

- open StudyStudio;
- switch or inspect the tree view;
- verify file/reading nodes can navigate the reader.

### Batch 2.3 / Issue #23: Save `/note` as an EvidenceEvent

Goal: notes entered in Study Terminal should become inspectable learning evidence linked
to the current unit, page, and selected SourceSpan when available.

GitHub: https://github.com/Dlx180/StudyStudio/issues/23

Blocked by: none.

Best owner: Terminal and Evidence track.

Review signal:

- select text or use the sample passage;
- run `/note ...`;
- verify terminal output confirms saved evidence and backend tests cover it.

### Batch 2.4 / Issue #21: Implement `/find-source` v1

Goal: the learner can ask StudyStudio to find original source candidates for a phrase,
claim, or question, using page text and SourceSpan references before full AI retrieval.

GitHub: https://github.com/Dlx180/StudyStudio/issues/21

Blocked by: Batch 2.1 / Issue #19.

Best owner: Terminal and Evidence track.

Review signal:

- upload a PDF;
- run `/find-source <phrase>`;
- verify Study Terminal returns candidate source locations and can navigate or cite them.

### Batch 2.5 / Issue #24: Define VisualTask schema and validate concept-tree submissions

Goal: Visual Workspace should submit a typed VisualTaskSubmission instead of an ad hoc
concept-tree draft payload.

GitHub: https://github.com/Dlx180/StudyStudio/issues/24

Blocked by: none.

Best owner: Visual and AI track or Frontend Studio lead.

Review signal:

- build a small concept tree;
- submit it;
- verify the payload is validated, persisted as evidence, and summarized in Study Terminal.

### Batch 2.6 / Issue #22: Add AI provider abstraction and current-unit context builder

Goal: prepare DeepSeek or another provider behind a replaceable AIClient boundary and
build bounded current-unit context from Resource, Page, SourceSpan, ReadingUnit, and
recent EvidenceEvent data.

GitHub: https://github.com/Dlx180/StudyStudio/issues/22

Blocked by: Batch 2.1 / Issue #19 for useful page text. Batch 2.3 / Issue #23 is helpful for richer recent
evidence, but not required.

Best owner: Visual and AI track or Backend and State lead.

Review signal:

- run provider-free tests with a deterministic fake AI client;
- optionally set a local provider key;
- verify context excludes full long documents by default.

## Suggested Order

```text
2.1 / #19 Page text
  -> 2.4 / #21 Find source
  -> 2.6 / #22 AI context

2.2 / #20 ArchitectureTree can start with mocks, then consume #19
2.3 / #23 Note evidence can start immediately
2.5 / #24 VisualTask schema can start immediately
```

## Manual Review Commands

Start backend:

```powershell
cd E:\project\GitHub\studystudio\apps\api
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Start frontend:

```powershell
cd E:\project\GitHub\studystudio
npm.cmd --workspace @knowtree/web run dev -- -p 3000
```

Open:

```text
http://127.0.0.1:3000/workspace
```

Expected baseline before each feature review:

- PDF upload still works.
- Selecting text does not automatically write to Study Terminal.
- `Explain this -> understanding check -> evidence -> state -> next` still works.
- Study Terminal auto-scrolls to the latest output.
