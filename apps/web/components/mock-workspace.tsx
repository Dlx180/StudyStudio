"use client";

import { useMemo, useState } from "react";
import type { ReadingUnit } from "@knowtree/shared";

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

function flattenUnits(tree: ReadingUnit[]): ReadingUnit[] {
  return tree.flatMap((unit) => [unit, ...flattenUnits(unit.children)]);
}

function UnitNode({ unit, currentPage, onSelect }: { unit: ReadingUnit; currentPage: number; onSelect: (unit: ReadingUnit) => void }) {
  const active = currentPage >= unit.startPage && currentPage <= unit.endPage;

  return (
    <li>
      <button className={active ? "unit-node active" : "unit-node"} onClick={() => onSelect(unit)}>
        <span>{unit.title}</span>
        <small>
          p. {unit.startPage}-{unit.endPage} · {unit.state}
        </small>
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

  return (
    <main className="workspace-shell">
      <section className="document-pane" aria-label="Original material reader">
        <header>
          <p className="eyebrow">Original material</p>
          <h1>Demo Learning Material</h1>
        </header>
        <div className="page-card">
          <span>PDF placeholder</span>
          <strong>Page {currentPage}</strong>
          <p>
            This pane intentionally keeps the source material primary. PDF.js rendering will replace
            this placeholder in the next milestone.
          </p>
        </div>
        <nav className="page-controls" aria-label="Page navigation">
          <button onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>Previous</button>
          <span>Page {currentPage} of 8</span>
          <button onClick={() => setCurrentPage((page) => Math.min(8, page + 1))}>Next</button>
        </nav>
      </section>

      <aside className="tree-pane" aria-label="UnitTree">
        <p className="eyebrow">UnitTree</p>
        <h2>Reading units</h2>
        <ul className="unit-tree">
          {units.map((unit) => (
            <UnitNode key={unit.unitId} unit={unit} currentPage={currentPage} onSelect={(selected) => setCurrentPage(selected.startPage)} />
          ))}
        </ul>
        <section className="unit-detail">
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
              <dd>{activeUnit.state}</dd>
            </div>
          </dl>
        </section>
      </aside>
    </main>
  );
}
