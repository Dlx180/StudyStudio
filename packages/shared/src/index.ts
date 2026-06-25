export type UnitState = "unread" | "reading" | "understood" | "weak" | "mastered";

export type ResourceKind =
  | "pdf"
  | "pptx"
  | "video"
  | "webpage"
  | "transcript"
  | "markdown"
  | "code_repo"
  | "note"
  | "unknown";

export interface ResourceRef {
  resource_id: string;
  title: string;
  kind: ResourceKind;
}

export type SourceLocator =
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

export interface SourceSpan {
  source_span_id: string;
  resource: ResourceRef;
  locator: SourceLocator;
  text?: string;
  bbox?: [number, number, number, number];
  created_by: "system" | "user" | "ai";
}

export interface ReadingUnit {
  unitId: string;
  title: string;
  summary: string;
  startPage: number;
  endPage: number;
  state: UnitState;
  children: ReadingUnit[];
}

export interface ReadingUnitRef {
  unit_id: string;
  title: string;
  start_locator?: SourceLocator;
  end_locator?: SourceLocator;
}

export interface ResourceSummary {
  resourceId: string;
  title: string;
  kind: "pdf" | "ppt" | "pptx" | "web" | "unknown";
  pageCount: number;
}

export interface UploadedResource {
  resource_id: string;
  title: string;
  kind: "pdf";
  original_filename: string;
  storage_path: string;
  page_count: number;
  processing_status: "uploaded" | "parsed" | "profiled" | "failed";
}

export interface SelectionContext {
  text: string;
  page: number;
  source: "pdf-text-layer" | "sample";
}

export interface EvidenceEventRef {
  event_id: string;
  event_type: EvidenceEventType;
  summary: string;
}

export interface StudioContext {
  session_id: string;
  workspace_id?: string;
  active_resource?: ResourceRef;
  active_locator?: SourceLocator;
  active_unit?: ReadingUnitRef;
  selected_spans: SourceSpan[];
  recent_evidence: EvidenceEventRef[];
  visual_task_state?: Record<string, unknown>;
}

export interface StateSummary {
  status: "unseen" | "reading" | "understood" | "weak" | "mastered" | "needs_review";
  mastery?: number;
  confidence?: number;
  freshness?: number;
  misconception_risk?: number;
}

export interface TreeNodeAction {
  action: "jump_to_source" | "open_visual_task" | "run_terminal_command" | "show_state";
  label: string;
  payload?: Record<string, unknown>;
}

export type ArchitectureTreeViewKind = "file_tree" | "reading_tree" | "concept_tree" | "task_tree" | "state_tree";

export interface ArchitectureTreeNode {
  id: string;
  title: string;
  kind: "resource" | "file_section" | "reading_unit" | "concept" | "task" | "state" | "group";
  source_refs: SourceSpan[];
  state_summary?: StateSummary;
  actions?: TreeNodeAction[];
  children: ArchitectureTreeNode[];
}

export interface ArchitectureTreeView {
  view_id: string;
  kind: ArchitectureTreeViewKind;
  title: string;
  nodes: ArchitectureTreeNode[];
}

export type InteractionTaskType = "build_concept_tree" | "ask" | "note" | "quiz";

export type TerminalCommandName =
  | "ask"
  | "note"
  | "quiz"
  | "find_source"
  | "explain_selection"
  | "build_tree"
  | "check"
  | "next";

export interface TerminalCommandSpec {
  name: TerminalCommandName;
  description: string;
  required_context: Array<"resource" | "unit" | "selection" | "visual_task" | "state">;
  creates_task: boolean;
  creates_evidence: boolean;
  can_open_visual_task: boolean;
}

export interface TerminalCommandRequest {
  command: TerminalCommandName;
  raw_input: string;
  args: Record<string, unknown>;
  context: StudioContext;
}

export type TerminalResultKind =
  | "answer"
  | "note"
  | "quiz"
  | "source_candidates"
  | "visual_task"
  | "evidence"
  | "state_update"
  | "next_learning_act"
  | "system";

export interface FollowUpAction {
  action: "run_command" | "open_visual_task" | "jump_to_source" | "create_note" | "show_next";
  label: string;
  payload?: Record<string, unknown>;
}

export interface TerminalCommandResult {
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

export type VisualTaskType =
  | "build_concept_tree"
  | "match_source_evidence"
  | "sort_prerequisite_order"
  | "label_formula_parts"
  | "compare_two_concepts"
  | "reconstruct_process";

export interface VisualTaskItem {
  item_id: string;
  label: string;
  description?: string;
  source_refs?: SourceSpan[];
  payload?: Record<string, unknown>;
}

export interface VisualTaskSpec {
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

export interface VisualTaskSubmission {
  submission_id: string;
  task_id: string;
  task_type: VisualTaskType;
  payload: Record<string, unknown>;
  source_refs: SourceSpan[];
  submitted_at: string;
}

export interface InteractionTask {
  task_id: string;
  session_id: string;
  task_type: InteractionTaskType;
  unit_id: string;
  unit_title: string;
  prompt: string;
  context: Record<string, unknown>;
  status: "created" | "active" | "completed" | "cancelled";
  created_at: string;
}

export type EvidenceEventType =
  | "concept_tree_submission"
  | "note_saved"
  | "quiz_answer"
  | "question_asked"
  | "source_match_submission"
  | "explanation_submission"
  | "task_completed";

export interface EvidenceEvent {
  event_id: string;
  session_id: string;
  event_type: EvidenceEventType;
  unit_id: string;
  unit_title: string;
  summary: string;
  task_id?: string | null;
  selection_context?: SelectionContext | null;
  target_unit?: ReadingUnitRef;
  source_refs?: SourceSpan[];
  payload: Record<string, unknown>;
  created_at: string;
}

export interface StateUpdate {
  state_update_id: string;
  evidence_id: string;
  target_id: string;
  target_type: "reading_unit" | "source_span" | "task" | "knowledge_item";
  delta: Record<string, number | string | boolean>;
  reason: string;
}

export interface NextLearningAct {
  act_id: string;
  act_type: "explain" | "probe" | "repair" | "review" | "practice" | "advance";
  title: string;
  reason: string;
  target_unit?: ReadingUnitRef;
  source_refs: SourceSpan[];
  evidence_refs: EvidenceEventRef[];
}
