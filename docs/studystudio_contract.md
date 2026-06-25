# StudyStudio Interaction Contract v1

Status: draft, but intended to unblock frontend and backend parallel work.  
Audience: product/domain lead, frontend lead, backend/AI lead, coding agents.

## 1. Purpose

StudyStudio should not be designed as a PDF reader with ad hoc features attached. It should be a learning runtime where different source types, terminal commands, visual tasks, evidence records, state updates, and scheduling all speak a shared language.

This contract defines that shared language.

The immediate goal is to let three tracks proceed in parallel:

- frontend can build Architecture Tree, Visual Workspace, and Study Terminal using stable mock objects;
- backend can build Resource, SourceSpan, EvidenceEvent, and context APIs against the same object shapes;
- product/state work can define StateOverlay and Scheduler rules without depending on PDF-only details.

## 2. Core Flow

```text
Resource
-> SourceLocator / SourceSpan
-> StudioContext
-> TerminalCommand or VisualTask
-> TerminalCommandResult or VisualTaskSubmission
-> EvidenceEvent
-> StateUpdate
-> NextLearningAct
```

Only the first part is source-type-specific. Everything after SourceSpan should be mostly independent of whether the material came from a PDF, video, webpage, transcript, code file, or future resource type.

## 3. Design Rules

1. **Source-first, not PDF-first.**  
   PDF page selection is one source locator type, not the system's core abstraction.

2. **Interactions create evidence.**  
   Terminal and visual actions should create EvidenceEvents when they reveal learning progress, confusion, source use, or task completion.

3. **Outputs are structured.**  
   Terminal output may render as text, but internally it should have a typed result kind, payload, source references, and optional follow-up actions.

4. **Visual Workspace is a task runtime.**  
   Do not hard-code the visual area as only a concept-tree editor. Concept trees are the first VisualTask type.

5. **Architecture Tree is a view runtime.**  
   UnitTree is one ArchitectureTree view, alongside FileTree, concept tree, task tree, and state tree.

6. **State is derived from evidence.**  
   StateOverlay should update from explicit EvidenceEvents and rules before relying on opaque AI judgement.

7. **AI is a tool, not memory.**  
   The system stores sources, context, evidence, state, and schedules. AI calls receive a bounded context pack and return validated candidate data.

## 4. Source Model

### 4.1 Resource

A Resource is an original learning material.

Supported MVP type:

- `pdf`

Future types:

- `pptx`
- `video`
- `webpage`
- `transcript`
- `markdown`
- `code_repo`
- `note`

Suggested shape:

```ts
type ResourceKind =
  | "pdf"
  | "pptx"
  | "video"
  | "webpage"
  | "transcript"
  | "markdown"
  | "code_repo"
  | "note"
  | "unknown";

interface ResourceRef {
  resource_id: string;
  title: string;
  kind: ResourceKind;
}
```

### 4.2 SourceLocator

SourceLocator identifies where something lives inside a Resource.

```ts
type SourceLocator =
  | {
      kind: "pdf_page";
      resource_id: string;
      page: number;
    }
  | {
      kind: "pdf_text_range";
      resource_id: string;
      page: number;
      start_offset: number;
      end_offset: number;
    }
  | {
      kind: "video_time_range";
      resource_id: string;
      start_seconds: number;
      end_seconds: number;
    }
  | {
      kind: "web_text_range";
      resource_id: string;
      url: string;
      selector?: string;
      start_offset?: number;
      end_offset?: number;
    }
  | {
      kind: "code_range";
      resource_id: string;
      path: string;
      start_line: number;
      end_line: number;
    };
```

### 4.3 SourceSpan

SourceSpan is a traceable span of source material.

```ts
interface SourceSpan {
  source_span_id: string;
  resource: ResourceRef;
  locator: SourceLocator;
  text?: string;
  bbox?: [number, number, number, number];
  created_by: "system" | "user" | "ai";
}
```

Implementation note: the current `SelectionContext` should evolve toward SourceSpan-backed context. During the prototype, it can carry plain selected text plus page metadata.

## 5. StudioContext

StudioContext is the context pack passed to terminal commands, visual tasks, AI calls, and state rules.

```ts
interface StudioContext {
  session_id: string;
  workspace_id?: string;
  active_resource?: ResourceRef;
  active_locator?: SourceLocator;
  active_unit?: ReadingUnitRef;
  selected_spans: SourceSpan[];
  recent_evidence: EvidenceEventRef[];
  visual_task_state?: Record<string, unknown>;
}
```

Rules:

- It should be bounded and explicit.
- It should not silently include an entire long document.
- It should be serializable for API calls and tests.
- It should be inspectable in Study Terminal.

## 6. Architecture Tree

Architecture Tree is the right-side tree surface. It supports multiple view kinds.

```ts
type ArchitectureTreeViewKind =
  | "file_tree"
  | "reading_tree"
  | "concept_tree"
  | "task_tree"
  | "state_tree";

interface ArchitectureTreeNode {
  id: string;
  title: string;
  kind:
    | "resource"
    | "file_section"
    | "reading_unit"
    | "concept"
    | "task"
    | "state"
    | "group";
  source_refs: SourceSpan[];
  state_summary?: StateSummary;
  actions?: TreeNodeAction[];
  children: ArchitectureTreeNode[];
}

interface ArchitectureTreeView {
  view_id: string;
  kind: ArchitectureTreeViewKind;
  title: string;
  nodes: ArchitectureTreeNode[];
}
```

Frontend implication: B can build one tree component that renders different view kinds.  
Backend implication: C can add view providers gradually without changing the UI contract.

## 7. Study Terminal

Study Terminal is a command and output runtime.

### 7.1 TerminalCommandSpec

```ts
type TerminalCommandName =
  | "ask"
  | "note"
  | "quiz"
  | "find_source"
  | "explain_selection"
  | "build_tree"
  | "check"
  | "next";

interface TerminalCommandSpec {
  name: TerminalCommandName;
  description: string;
  required_context: Array<"resource" | "unit" | "selection" | "visual_task" | "state">;
  creates_task: boolean;
  creates_evidence: boolean;
  can_open_visual_task: boolean;
}
```

### 7.2 TerminalCommandRequest

```ts
interface TerminalCommandRequest {
  command: TerminalCommandName;
  raw_input: string;
  args: Record<string, unknown>;
  context: StudioContext;
}
```

### 7.3 TerminalCommandResult

```ts
type TerminalResultKind =
  | "answer"
  | "note"
  | "quiz"
  | "source_candidates"
  | "visual_task"
  | "evidence"
  | "state_update"
  | "next_learning_act"
  | "system";

interface TerminalCommandResult {
  result_id: string;
  kind: TerminalResultKind;
  title?: string;
  message: string;
  source_refs: SourceSpan[];
  payload: Record<string, unknown>;
  created_task_id?: string;
  created_evidence_id?: string;
  follow_up_actions: FollowUpAction[];
}
```

Examples:

- `/note` creates a `note_saved` EvidenceEvent.
- `/find-source` returns source candidates and may open a source-matching VisualTask.
- `/build-tree` opens a concept-tree VisualTask.
- `/next` returns a NextLearningAct based on current state.

## 8. Visual Workspace

Visual Workspace is a task runtime, not a single editor.

### 8.1 VisualTaskSpec

```ts
type VisualTaskType =
  | "build_concept_tree"
  | "match_source_evidence"
  | "sort_prerequisite_order"
  | "label_formula_parts"
  | "compare_two_concepts"
  | "reconstruct_process";

interface VisualTaskSpec {
  task_id: string;
  task_type: VisualTaskType;
  title: string;
  prompt: string;
  target_unit?: ReadingUnitRef;
  source_context: SourceSpan[];
  input_items: VisualTaskItem[];
  expected_output_shape: string;
  scoring_hint?: string;
}
```

### 8.2 VisualTaskSubmission

```ts
interface VisualTaskSubmission {
  submission_id: string;
  task_id: string;
  task_type: VisualTaskType;
  payload: Record<string, unknown>;
  source_refs: SourceSpan[];
  submitted_at: string;
}
```

Rules:

- Each task type should define its own payload contract.
- Submissions should be persisted as EvidenceEvents or linked to EvidenceEvents.
- VisualTask payloads should be inspectable and testable without rendering the UI.

First task type:

```text
build_concept_tree
```

Next candidates:

```text
match_source_evidence
sort_prerequisite_order
reconstruct_process
```

## 9. Evidence

EvidenceEvent records what happened during learning.

```ts
type EvidenceEventType =
  | "note_saved"
  | "question_asked"
  | "quiz_answer"
  | "concept_tree_submission"
  | "source_match_submission"
  | "explanation_submission"
  | "task_completed";

interface EvidenceEvent {
  event_id: string;
  session_id: string;
  event_type: EvidenceEventType;
  target_unit?: ReadingUnitRef;
  task_id?: string;
  summary: string;
  source_refs: SourceSpan[];
  payload: Record<string, unknown>;
  created_at: string;
}
```

Evidence should answer:

- What did the user do?
- What source material was involved?
- What task or unit was targeted?
- What can state rules infer from it?
- Can a human inspect why the system updated state?

## 10. State and Scheduler

StateOverlay and Scheduler are not fully specified in this v1 contract, but B/C should leave space for them.

```ts
interface StateSummary {
  status: "unseen" | "reading" | "understood" | "weak" | "mastered" | "needs_review";
  mastery?: number;
  confidence?: number;
  freshness?: number;
  misconception_risk?: number;
}

interface StateUpdate {
  state_update_id: string;
  evidence_id: string;
  target_id: string;
  target_type: "reading_unit" | "source_span" | "task" | "knowledge_item";
  delta: Record<string, number | string | boolean>;
  reason: string;
}

interface NextLearningAct {
  act_id: string;
  act_type: "explain" | "probe" | "repair" | "review" | "practice" | "advance";
  title: string;
  reason: string;
  target_unit?: ReadingUnitRef;
  source_refs: SourceSpan[];
  evidence_refs: EvidenceEventRef[];
}
```

Initial Scheduler v1 can be rule-based:

```text
misconception_risk high -> repair
mastery low -> explain or probe
freshness low -> review
mastery medium -> practice
mastery high and confidence high -> advance
```

## 11. Minimal Shared Types to Implement First

Implement these in `packages/shared` first, then mirror them in the backend:

1. `ResourceKind` / `ResourceRef`
2. `SourceLocator`
3. `SourceSpan`
4. `StudioContext`
5. `ArchitectureTreeView`
6. `TerminalCommandRequest`
7. `TerminalCommandResult`
8. `VisualTaskSpec`
9. `VisualTaskSubmission`
10. `EvidenceEvent`
11. `StateSummary`
12. `NextLearningAct`

## 12. First B/C Parallel Plan

### Frontend B

- Build mock ArchitectureTree view switching.
- Rename Console to Study Terminal.
- Render structured TerminalCommandResult objects.
- Make Visual Workspace load a VisualTaskSpec.
- Submit VisualTaskSubmission payloads.

### Backend C

- Persist SourceSpan-like references from uploaded PDFs.
- Add API shape for StudioContext.
- Backendize `/note`.
- Add command result endpoints for non-AI commands.
- Prepare context builder for future `/ask`, `/quiz`, and `/find-source`.

### Product/State A

- Review this contract.
- Define first VisualTask payload for `build_concept_tree`.
- Define first EvidenceEvent scoring/state hints.
- Define StateOverlay v1 and Scheduler v1 rules after B/C have contract mocks.

## 13. Open Questions

- Should selected text create a durable SourceSpan immediately, or only when used in an EvidenceEvent?
- Should Terminal commands be executed by one generic `/terminal/commands` endpoint, or separate endpoints per command?
- Should VisualTask drafts auto-save before submission?
- Should StateOverlay v1 live in backend Python first or shared TypeScript pure functions first?
- Should videos use transcript spans as the primary SourceSpan and timestamps as locators?
