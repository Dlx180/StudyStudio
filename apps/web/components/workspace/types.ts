import type {
  NextLearningAct,
  ReadingUnit,
  SelectionContext as SharedSelectionContext,
  SourceSpan,
  StateSummary,
  TerminalCommandResult,
  VerificationSubmissionDraft,
  VerificationTaskDraft,
} from "@knowtree/shared";

export type ConceptItem = {
  id: string;
  label: string;
  hint: string;
};

export type ConceptTreeNode = ConceptItem & {
  children: ConceptTreeNode[];
};

export type EvidenceDraft = {
  task: string;
  nodeCount: number;
  rootCount: number;
  selectionLength: number;
  draftLength: number;
  note: string;
};

export type ConsoleOutput = {
  id: string;
  kind: "answer" | "note" | "quiz" | "source" | "evidence" | "system" | "user" | "visual" | "state" | "next";
  text: string;
  result?: TerminalCommandResult;
};

export type StateSummaryResult = StateSummary & {
  evidence_count: number;
  latest_evidence_id?: string;
};

export type NextLearningActResult = NextLearningAct;

export type SelectionContext = SharedSelectionContext;

export type SelectionAction = "explain" | "quiz" | "find-source" | "note";

export type UnitSelectHandler = (unit: ReadingUnit) => void;

export type ActiveVerificationTask = VerificationTaskDraft & {
  unit_id: string;
  unit_title: string;
  selection_context: SelectionContext | null;
  source_refs: SourceSpan[];
  submission?: VerificationSubmissionDraft;
};
