export type UnitState = "unread" | "reading" | "understood" | "weak" | "mastered";

export interface ReadingUnit {
  unitId: string;
  title: string;
  summary: string;
  startPage: number;
  endPage: number;
  state: UnitState;
  children: ReadingUnit[];
}

export interface ResourceSummary {
  resourceId: string;
  title: string;
  kind: "pdf" | "ppt" | "pptx" | "web" | "unknown";
  pageCount: number;
}
