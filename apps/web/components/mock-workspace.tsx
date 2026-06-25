"use client";

import { useMemo, useState } from "react";
import type { ReadingUnit, UnitState } from "@knowtree/shared";

const units: ReadingUnit[] = [
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

const stateLabels: Record<UnitState, string> = {
  unread: "Not started",
  reading: "In progress",
  understood: "Understood",
  weak: "Needs care",
  mastered: "Mastered",
};

const stateTone: Record<UnitState, string> = {
  unread: "quiet",
  reading: "focus",
  understood: "steady",
  weak: "care",
  mastered: "strong",
};

function flattenUnits(tree: ReadingUnit[]): ReadingUnit[] {
  return tree.flatMap((unit) => [unit, ...flattenUnits(unit.children)]);
}

function getUnitCompanionNote(unit: ReadingUnit) {
  if (unit.state === "reading") {
    return "Stay with this unit for a few more minutes. Read the source first, then ask one precise question.";
  }

  if (unit.state === "weak") {
    return "This one deserves a slower pass. Mark one confusing sentence before moving on.";
  }

  if (unit.state === "mastered") {
    return "Good ground. A quick recall check is enough before you continue.";
  }

  return "Start with the headings and page range. I will keep the path visible while you read.";
}

function UnitNode({ unit, currentPage, onSelect }: { unit: ReadingUnit; currentPage: number; onSelect: (unit: ReadingUnit) => void }) {
  const active = currentPage >= unit.startPage && currentPage <= unit.endPage;
  const tone = stateTone[unit.state];

  return (
    <li>
      <button className={active ? "unit-node active" : "unit-node"} onClick={() => onSelect(unit)} aria-current={active ? "page" : undefined}>
        <span>{unit.title}</span>
        <small>p. {unit.startPage}-{unit.endPage}</small>
        <em className={`state-pill ${tone}`}>{stateLabels[unit.state]}</em>
      </button>
      {unit.children.length > 0 ? (
        <ul className="unit-children">
          {unit.children.map((child) => (
            <UnitNode key={child.unitId} unit={child} currentPage={currentPage} onSelect={onSelect} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function MockWorkspace() {
  const [currentPage, setCurrentPage] = useState(1);
  const flatUnits = useMemo(() => flattenUnits(units), []);
  const activeUnit = flatUnits.find((unit) => currentPage >= unit.startPage && currentPage <= unit.endPage) ?? units[0];
  const completedUnits = flatUnits.filter((unit) => unit.state === "understood" || unit.state === "mastered").length;
  const progressPercent = Math.round((completedUnits / flatUnits.length) * 100);

  return (
    <main className="workspace-shell">
      <section className="document-pane" aria-label="Original material reader">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">Original material</p>
            <h1>Demo Learning Material</h1>
          </div>
          <div className="session-chip" aria-label="Current study session">
            <span>Focus session</span>
            <strong>18 min</strong>
          </div>
        </header>
        <section className="care-banner" aria-label="Companion guidance">
          <div>
            <p>Beside you</p>
            <strong>{getUnitCompanionNote(activeUnit)}</strong>
          </div>
          <span>{progressPercent}% steady</span>
        </section>
        <div className="page-card">
          <span>Source preview</span>
          <strong>Page {currentPage}</strong>
          <p>
            The original material stays primary. PDF.js rendering will replace this calm placeholder
            in the next milestone.
          </p>
        </div>
        <nav className="page-controls" aria-label="Page navigation">
          <button onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>Previous</button>
          <span>Page {currentPage} of 8</span>
          <button onClick={() => setCurrentPage((page) => Math.min(8, page + 1))}>Next</button>
        </nav>
      </section>

      <aside className="tree-pane" aria-label="UnitTree">
        <section className="companion-card" aria-label="Personal learning state">
          <p className="eyebrow">Today</p>
          <h2>You are building a readable path through this file.</h2>
          <div className="progress-track" aria-label={`${progressPercent}% complete`}>
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <p>One unit at a time is enough. I will keep your place and surface the next useful move.</p>
        </section>
        <div className="tree-heading">
          <div>
            <p className="eyebrow">UnitTree</p>
            <h2>Reading units</h2>
          </div>
          <span>{flatUnits.length} units</span>
        </div>
        <ul className="unit-tree">
          {units.map((unit) => (
            <UnitNode key={unit.unitId} unit={unit} currentPage={currentPage} onSelect={(selected) => setCurrentPage(selected.startPage)} />
          ))}
        </ul>
        <section className="unit-detail">
          <p className="eyebrow">Current unit</p>
          <h3>{activeUnit.title}</h3>
          <p>{activeUnit.summary}</p>
          <dl>
            <div>
              <dt>Page range</dt>
              <dd>
                {activeUnit.startPage}-{activeUnit.endPage}
              </dd>
            </div>
            <div>
              <dt>State</dt>
              <dd>{stateLabels[activeUnit.state]}</dd>
            </div>
          </dl>
          <button className="ask-button" type="button">
            Ask about this unit
          </button>
        </section>
      </aside>
    </main>
  );
}
