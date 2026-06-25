import type { ReadingUnit, SelectionContext as SharedSelectionContext } from "@knowtree/shared";

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
  kind: "answer" | "note" | "quiz" | "evidence" | "system";
  text: string;
};

export type SelectionContext = SharedSelectionContext;

export type UnitSelectHandler = (unit: ReadingUnit) => void;
