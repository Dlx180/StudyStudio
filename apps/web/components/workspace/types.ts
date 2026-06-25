import type {
  ReadingUnit,
  SelectionContext as SharedSelectionContext,
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
  kind: "answer" | "note" | "quiz" | "source" | "evidence" | "system";
  text: string;
  result?: TerminalCommandResult;
};

export type SelectionContext = SharedSelectionContext;

export type SelectionAction = "explain" | "quiz" | "find-source" | "note";

export type UnitSelectHandler = (unit: ReadingUnit) => void;

export type ActiveVerificationTask = VerificationTaskDraft & {
  answer: string;
  submission?: VerificationSubmissionDraft;
};
