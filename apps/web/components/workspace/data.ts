import type { ReadingUnit } from "@knowtree/shared";
import type { ConceptItem } from "./types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export const SAMPLE_SELECTION =
  "ReadingUnit is the central learning object: it groups source pages into a unit that can be navigated, questioned, measured, and reviewed.";

export const units: ReadingUnit[] = [
  {
    unitId: "unit-1",
    title: "1. Course Overview",
    summary: "Introduces the material and learning goals.",
    startPage: 1,
    endPage: 2,
    state: "reading",
    children: [],
  },
  {
    unitId: "unit-2",
    title: "2. Core Concepts",
    summary: "Defines the central ideas used by later units.",
    startPage: 3,
    endPage: 5,
    state: "unread",
    children: [
      {
        unitId: "unit-2-1",
        title: "2.1 Key Definition",
        summary: "A focused subsection for the most important definition.",
        startPage: 3,
        endPage: 3,
        state: "unread",
        children: [],
      },
    ],
  },
  {
    unitId: "unit-3",
    title: "3. Worked Example",
    summary: "Applies the concepts to a concrete example.",
    startPage: 6,
    endPage: 8,
    state: "unread",
    children: [],
  },
];

export const conceptItems: ConceptItem[] = [
  { id: "resource", label: "Resource", hint: "Original learning material" },
  { id: "reading-unit", label: "ReadingUnit", hint: "Learning-sized unit" },
  { id: "unit-tree", label: "UnitTree", hint: "Reading path over units" },
  { id: "state-overlay", label: "StateOverlay", hint: "User learning state" },
  { id: "source-span", label: "SourceSpan", hint: "Traceable original evidence" },
  { id: "interaction", label: "Interaction", hint: "Task that measures learning" },
];
