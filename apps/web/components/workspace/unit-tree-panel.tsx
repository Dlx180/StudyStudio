import type { ReadingUnit, UnitState } from "@knowtree/shared";
import type { UnitSelectHandler } from "./types";

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

function UnitNode({ unit, currentPage, onSelect }: { unit: ReadingUnit; currentPage: number; onSelect: UnitSelectHandler }) {
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

export function UnitTreePanel({
  units,
  activeUnit,
  currentPage,
  onSelectUnit,
}: {
  units: ReadingUnit[];
  activeUnit: ReadingUnit;
  currentPage: number;
  onSelectUnit: UnitSelectHandler;
}) {
  return (
    <>
      <ul className="unit-tree">
        {units.map((unit) => (
          <UnitNode key={unit.unitId} unit={unit} currentPage={currentPage} onSelect={onSelectUnit} />
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
    </>
  );
}
